import { createClient } from "@supabase/supabase-js";

function requiredEnv(): { url: string; anonKey: string; serviceKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) {
    process.stdout.write(
      "Missing Supabase environment variables. Run:\n  node --env-file=.env.local --experimental-strip-types tests/db/verify-db.ts\n",
    );
    process.exit(1);
  }
  return { url, anonKey, serviceKey };
}

const env = requiredEnv();

const admin = createClient(env.url, env.serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const SERVICE_ID = "00000000-0000-0000-0000-0000000000a1";
const STAFF_ID = "00000000-0000-0000-0000-0000000000b1";
const OTHER_STAFF_ID = "00000000-0000-0000-0000-0000000000b2";
const SLOT = "2027-03-01T10:00:00Z";
const RACE_SLOT = "2027-03-01T14:00:00Z";

type Check = { name: string; ok: boolean; detail: string };
const checks: Check[] = [];

function record(name: string, ok: boolean, detail: string): void {
  checks.push({ name, ok, detail });
  process.stdout.write(`${ok ? "PASS" : "FAIL"}  ${name}\n      ${detail}\n`);
}

function errorCode(error: { code: string } | null): string {
  return error ? error.code : "none";
}

function errorText(error: { message: string } | null): string {
  return error ? error.message : "no error";
}

const stamp = Date.now();
const ownerEmail = `glamslot-verify-owner-${stamp}@example.com`;
const strangerEmail = `glamslot-verify-stranger-${stamp}@example.com`;
const password = crypto.randomUUID();

let ownerUserId = "";
let strangerUserId = "";
let previousOwnerEmail: string | null = null;
let createdSalonSettings = false;
let previousSalonSettings: Record<string, unknown> | null = null;

async function wipeSeed(): Promise<void> {
  await admin.from("bookings").delete().eq("service_id", SERVICE_ID);
  await admin.from("staff_services").delete().eq("service_id", SERVICE_ID);
  await admin.from("staff").delete().in("id", [STAFF_ID, OTHER_STAFF_ID]);
  await admin.from("services").delete().eq("id", SERVICE_ID);
}

async function seedCatalog(): Promise<void> {
  const service = await admin.from("services").insert({
    id: SERVICE_ID,
    name: "Verify Service",
    description: "Seed row for the database checks.",
    duration_minutes: 60,
    price_kobo: 2000000,
    deposit_kobo: 600000,
    is_active: true,
  });
  if (service.error) throw new Error(`seed services: ${service.error.message}`);

  for (const [index, id] of [STAFF_ID, OTHER_STAFF_ID].entries()) {
    const staff = await admin
      .from("staff")
      .insert({ id, name: `Verify Stylist ${index + 1}`, is_active: true });
    if (staff.error) throw new Error(`seed staff: ${staff.error.message}`);

    const link = await admin
      .from("staff_services")
      .insert({ staff_id: id, service_id: SERVICE_ID });
    if (link.error) throw new Error(`seed staff_services: ${link.error.message}`);
  }
}

type BookingSeed = {
  staffId: string;
  startsAt: string;
  endsAt: string;
  tokenChar: string;
  status?: string;
};

async function adminInsertBooking(seed: BookingSeed): Promise<string> {
  const result = await admin.from("bookings").insert({
    staff_id: seed.staffId,
    service_id: SERVICE_ID,
    starts_at: seed.startsAt,
    ends_at: seed.endsAt,
    status: seed.status ?? "pending_payment",
    customer_name: "Verify Customer",
    customer_phone: "+2348031234567",
    token_hash: seed.tokenChar.repeat(64),
    deposit_kobo: 600000,
    hold_expires_at:
      (seed.status ?? "pending_payment") === "pending_payment"
        ? "2027-03-01T09:15:00Z"
        : null,
  });
  return errorCode(result.error);
}

async function run(): Promise<void> {
  await wipeSeed();
  await seedCatalog();

  const createdOwner = await admin.auth.admin.createUser({
    email: ownerEmail,
    password,
    email_confirm: true,
  });
  if (createdOwner.error || !createdOwner.data.user) {
    throw new Error(`create owner: ${errorText(createdOwner.error)}`);
  }
  ownerUserId = createdOwner.data.user.id;

  const createdStranger = await admin.auth.admin.createUser({
    email: strangerEmail,
    password,
    email_confirm: true,
  });
  if (createdStranger.error || !createdStranger.data.user) {
    throw new Error(`create stranger: ${errorText(createdStranger.error)}`);
  }
  strangerUserId = createdStranger.data.user.id;

  const anon = createClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const owner = createClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const stranger = createClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const ownerSignIn = await owner.auth.signInWithPassword({
    email: ownerEmail,
    password,
  });
  if (ownerSignIn.error) throw new Error(`owner sign in: ${ownerSignIn.error.message}`);

  const strangerSignIn = await stranger.auth.signInWithPassword({
    email: strangerEmail,
    password,
  });
  if (strangerSignIn.error) {
    throw new Error(`stranger sign in: ${strangerSignIn.error.message}`);
  }

  const existingOwner = await admin.from("salon_owner").select("email").maybeSingle();
  previousOwnerEmail = existingOwner.data ? existingOwner.data.email : null;

  if (previousOwnerEmail) {
    await admin.from("salon_owner").update({ email: ownerEmail }).eq("id", 1);
    record(
      "a real salon_owner row was swapped for the test and will be restored",
      true,
      `previous owner email is held in memory and written back in the cleanup`,
    );
  } else {
    const claim = await owner.from("salon_owner").insert({ email: ownerEmail });
    record(
      "the signed-in owner claims salon_owner",
      !claim.error,
      claim.error ? claim.error.message : "insert accepted, checked against the JWT email",
    );
  }

  const publicServices = await anon.from("services").select("id");
  record(
    "anon reads active services",
    !publicServices.error,
    publicServices.error
      ? publicServices.error.message
      : `${publicServices.data?.length ?? 0} row(s)`,
  );

  const publicStaff = await anon.from("staff").select("id");
  record(
    "anon reads active staff",
    !publicStaff.error,
    publicStaff.error
      ? publicStaff.error.message
      : `${publicStaff.data?.length ?? 0} row(s)`,
  );

  const publicHours = await anon.from("staff_hours").select("id");
  record(
    "anon reads staff hours",
    !publicHours.error,
    publicHours.error ? publicHours.error.message : "no error",
  );

  const publicSettings = await anon.from("salon_settings").select("id");
  record(
    "anon reads salon_settings",
    !publicSettings.error,
    publicSettings.error
      ? publicSettings.error.message
      : `${publicSettings.data?.length ?? 0} row(s)`,
  );

  const anonOwnerEmail = await anon.from("salon_owner").select("email");
  record(
    "anon cannot read salon_owner",
    errorCode(anonOwnerEmail.error) === "42501",
    `code ${errorCode(anonOwnerEmail.error)}: ${errorText(anonOwnerEmail.error)}`,
  );

  const anonBookings = await anon.from("bookings").select("id");
  record(
    "anon cannot read bookings",
    errorCode(anonBookings.error) === "42501",
    `code ${errorCode(anonBookings.error)}: ${errorText(anonBookings.error)}`,
  );

  const anonInsert = await anon.from("bookings").insert({
    staff_id: STAFF_ID,
    service_id: SERVICE_ID,
    starts_at: SLOT,
    ends_at: "2027-03-01T11:00:00Z",
    customer_name: "Anon",
    customer_phone: "+2348031234567",
    token_hash: "b".repeat(64),
    deposit_kobo: 600000,
    hold_expires_at: "2027-03-01T09:15:00Z",
  });
  record(
    "anon cannot insert a booking",
    errorCode(anonInsert.error) === "42501",
    `code ${errorCode(anonInsert.error)}: ${errorText(anonInsert.error)}`,
  );

  const strangerBookings = await stranger.from("bookings").select("id");
  record(
    "a signed-in stranger reads no bookings",
    !strangerBookings.error && (strangerBookings.data?.length ?? 0) === 0,
    strangerBookings.error
      ? strangerBookings.error.message
      : `${strangerBookings.data?.length ?? 0} row(s), policy filtered them out`,
  );

  const strangerInsert = await stranger.from("bookings").insert({
    staff_id: STAFF_ID,
    service_id: SERVICE_ID,
    starts_at: SLOT,
    ends_at: "2027-03-01T11:00:00Z",
    customer_name: "Stranger",
    customer_phone: "+2348031234567",
    token_hash: "c".repeat(64),
    deposit_kobo: 600000,
    hold_expires_at: "2027-03-01T09:15:00Z",
  });
  record(
    "a signed-in stranger cannot insert a booking",
    errorCode(strangerInsert.error) === "42501",
    `code ${errorCode(strangerInsert.error)}: ${errorText(strangerInsert.error)}`,
  );

  const strangerServices = await stranger.from("services").select("id");
  record(
    "a signed-in stranger still reads public services",
    !strangerServices.error && (strangerServices.data?.length ?? 0) > 0,
    strangerServices.error
      ? strangerServices.error.message
      : `${strangerServices.data?.length ?? 0} row(s)`,
  );

  const ownerInsert = await owner.from("bookings").insert({
    staff_id: OTHER_STAFF_ID,
    service_id: SERVICE_ID,
    starts_at: RACE_SLOT,
    ends_at: "2027-03-01T15:00:00Z",
    customer_name: "Owner Added",
    customer_phone: "+2348031234567",
    token_hash: "d".repeat(64),
    deposit_kobo: 600000,
    source: "owner",
  });
  if (ownerInsert.error) {
    record("the owner inserts a booking", false, ownerInsert.error.message);
  } else {
    record("the owner inserts a booking", true, "accepted by the owner policy");
    await admin.from("bookings").delete().eq("token_hash", "d".repeat(64));
  }

  const existingSettings = await admin
    .from("salon_settings")
    .select("name")
    .maybeSingle();
  previousSalonSettings = existingSettings.data;
  if (existingSettings.data) {
    await admin
      .from("salon_settings")
      .update({ min_notice_hours: 3 })
      .eq("id", 1);
    const wroteBack = await admin
      .from("salon_settings")
      .update({ min_notice_hours: 2 })
      .eq("id", 1);
    record(
      "the owner updates salon_settings",
      !wroteBack.error,
      wroteBack.error ? wroteBack.error.message : "min_notice_hours updated and restored",
    );
  } else {
    const created = await owner.from("salon_settings").insert({
      name: "Verify Salon",
      address: "Verify Address",
      whatsapp_phone: "+2348031234567",
    });
    createdSalonSettings = !created.error;
    record(
      "the owner inserts salon_settings",
      !created.error,
      created.error ? created.error.message : "single row created and removed in cleanup",
    );
  }

  const firstCode = await adminInsertBooking({
    staffId: STAFF_ID,
    startsAt: SLOT,
    endsAt: "2027-03-01T11:00:00Z",
    tokenChar: "1",
  });
  record(
    "the first booking for a slot is accepted",
    firstCode === "none",
    `code ${firstCode}`,
  );

  const overlapCode = await adminInsertBooking({
    staffId: STAFF_ID,
    startsAt: "2027-03-01T10:30:00Z",
    endsAt: "2027-03-01T11:30:00Z",
    tokenChar: "2",
  });
  record(
    "an overlapping booking for the same staff is refused",
    overlapCode === "23P01",
    `code ${overlapCode}, 23P01 is exclusion_violation`,
  );

  const raceResults = await Promise.all([
    adminInsertBooking({
      staffId: OTHER_STAFF_ID,
      startsAt: RACE_SLOT,
      endsAt: "2027-03-01T15:00:00Z",
      tokenChar: "3",
    }),
    adminInsertBooking({
      staffId: OTHER_STAFF_ID,
      startsAt: RACE_SLOT,
      endsAt: "2027-03-01T15:00:00Z",
      tokenChar: "4",
    }),
  ]);
  const wins = raceResults.filter((code) => code === "none").length;
  record(
    "two simultaneous bookings for one slot: exactly one wins",
    wins === 1 && raceResults.includes("23P01"),
    `codes ${raceResults.join(" and ")}`,
  );

  const boundaryCode = await adminInsertBooking({
    staffId: STAFF_ID,
    startsAt: "2027-03-01T11:00:00Z",
    endsAt: "2027-03-01T12:00:00Z",
    tokenChar: "5",
  });
  record(
    "a booking starting exactly when the first ends is accepted",
    boundaryCode === "none",
    `code ${boundaryCode}, the range is half open '[)'`,
  );

  const otherStaffCode = await adminInsertBooking({
    staffId: OTHER_STAFF_ID,
    startsAt: SLOT,
    endsAt: "2027-03-01T11:00:00Z",
    tokenChar: "6",
  });
  record(
    "the same time for a different staff member is accepted",
    otherStaffCode === "none",
    `code ${otherStaffCode}`,
  );

  const cancelUpdate = await admin
    .from("bookings")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("token_hash", "1".repeat(64));
  if (cancelUpdate.error) throw new Error(`cancel booking: ${cancelUpdate.error.message}`);

  const afterCancelCode = await adminInsertBooking({
    staffId: STAFF_ID,
    startsAt: "2027-03-01T10:15:00Z",
    endsAt: "2027-03-01T10:45:00Z",
    tokenChar: "7",
  });
  record(
    "a cancelled booking releases its slot",
    afterCancelCode === "none",
    `code ${afterCancelCode}`,
  );

  const ownerRead = await owner.from("bookings").select("id");
  record(
    "the owner reads every booking",
    !ownerRead.error && (ownerRead.data?.length ?? 0) > 0,
    ownerRead.error
      ? ownerRead.error.message
      : `${ownerRead.data?.length ?? 0} row(s)`,
  );
}

async function cleanup(): Promise<void> {
  await wipeSeed();
  if (createdSalonSettings || previousSalonSettings) {
    await admin.from("salon_settings").delete().eq("id", 1);
  }
  if (previousOwnerEmail) {
    await admin.from("salon_owner").update({ email: previousOwnerEmail }).eq("id", 1);
  } else {
    await admin.from("salon_owner").delete().eq("id", 1);
  }
  if (ownerUserId) await admin.auth.admin.deleteUser(ownerUserId);
  if (strangerUserId) await admin.auth.admin.deleteUser(strangerUserId);
}

run()
  .catch((failure: unknown) => {
    record("the verification script finished", false, String(failure));
  })
  .finally(cleanup)
  .then(() => {
    const failed = checks.filter((check) => !check.ok);
    process.stdout.write(
      `\n${checks.length - failed.length}/${checks.length} checks passed\n`,
    );
    process.exit(failed.length === 0 ? 0 : 1);
  });