import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { assertTestDatabase } from "../../lib/test-guard.ts";

assertTestDatabase(process.env.NEXT_PUBLIC_SUPABASE_URL);

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
const INACTIVE_SERVICE_ID = "00000000-0000-0000-0000-0000000000a2";
const STAFF_ID = "00000000-0000-0000-0000-0000000000b1";
const OTHER_STAFF_ID = "00000000-0000-0000-0000-0000000000b2";
const HOURS_ID = "00000000-0000-0000-0000-0000000000c1";
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
let previousOwnerId: string | null = null;
type OwnerRow = {
  id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
};
// The whole row, read before the first write, so the guard at the end can
// prove the owner row came back unchanged and not merely present.
let previousOwnerRow: OwnerRow | null = null;
let previousSalonSettings: Record<string, unknown> | null = null;
let previousReminderSettings: Record<string, unknown> | null = null;

const OWNER_COLUMNS = ["id", "user_id", "created_at", "updated_at"] as const;

// created_at and updated_at are restored too, so the run leaves the real
// settings rows exactly as it found them. An update cannot do that: the
// touch_updated_at trigger overwrites updated_at on every write, which is why
// the cleanup puts these two rows back by deleting and re-inserting them.
const SETTINGS_COLUMNS = [
  "name",
  "address",
  "whatsapp_phone",
  "timezone",
  "slot_interval_minutes",
  "min_notice_hours",
  "booking_window_days",
  "cancel_cutoff_hours",
  "hold_minutes",
  "created_at",
  "updated_at",
] as const;

const REMINDER_SETTINGS_COLUMNS = [
  "confirmation_enabled",
  "confirmation_offset_minutes",
  "reminder_24h_enabled",
  "reminder_24h_hours_before",
  "reminder_2h_enabled",
  "reminder_2h_hours_before",
  "created_at",
  "updated_at",
] as const;

function pickColumns(
  row: Record<string, unknown>,
  columns: readonly string[],
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  for (const column of columns) patch[column] = row[column];
  return patch;
}

type Attempt = { code: string; message: string; rows: number };

type Filter = { column: string; value: unknown };

async function attempt(
  client: SupabaseClient,
  operation: "select" | "insert" | "update" | "delete",
  table: string,
  options: { row?: Record<string, unknown>; filters?: Filter[] } = {},
): Promise<Attempt> {
  const base = client.from(table);
  const scoped = <T extends { match: (conditions: Record<string, unknown>) => T }>(
    start: T,
  ): T => {
    const conditions: Record<string, unknown> = {};
    for (const filter of options.filters ?? []) {
      conditions[filter.column] = filter.value;
    }
    return Object.keys(conditions).length > 0 ? start.match(conditions) : start;
  };
  const result =
    operation === "select"
      ? await scoped(base.select("*"))
      : operation === "insert"
        ? await base.insert(options.row ?? {}).select()
        : operation === "update"
          ? await scoped(base.update(options.row ?? {})).select()
          : await scoped(base.delete()).select();
  return {
    code: errorCode(result.error),
    message: errorText(result.error),
    rows: result.data?.length ?? 0,
  };
}

function expectDenied(name: string, result: Attempt): void {
  record(name, result.code === "42501", `code ${result.code}: ${result.message}`);
}

function expectBlockedByPolicy(name: string, result: Attempt): void {
  record(
    name,
    result.code === "none" && result.rows === 0,
    `code ${result.code}, ${result.rows} row(s) matched, the policy filtered them out`,
  );
}

function expectAllowed(name: string, result: Attempt, minRows = 1): void {
  record(
    name,
    result.code === "none" && result.rows >= minRows,
    `code ${result.code}, ${result.rows} row(s)`,
  );
}

function expectViolation(name: string, result: Attempt, code: string): void {
  record(name, result.code === code, `code ${result.code}, expected ${code}`);
}

async function wipeSeed(): Promise<void> {
  await admin.from("bookings").delete().eq("service_id", SERVICE_ID);
  await admin.from("staff_hours").delete().eq("id", HOURS_ID);
  await admin.from("staff_services").delete().eq("service_id", SERVICE_ID);
  await admin.from("staff").delete().in("id", [STAFF_ID, OTHER_STAFF_ID]);
  await admin
    .from("services")
    .delete()
    .in("id", [SERVICE_ID, INACTIVE_SERVICE_ID]);
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

  // The snapshot is read before the first write to salon_owner in the whole
  // run, so it is the row the guard at the end compares against. It is read
  // through the admin client because that is the only role allowed to see the
  // row whatever it holds.
  const existingOwner = await admin
    .from("salon_owner")
    .select("id,user_id,created_at,updated_at")
    .maybeSingle();
  if (existingOwner.error && existingOwner.error.code !== "PGRST116") {
    throw new Error(`read salon_owner: ${existingOwner.error.message}`);
  }
  previousOwnerRow = existingOwner.data ?? null;
  previousOwnerId = previousOwnerRow ? previousOwnerRow.user_id : null;

  if (previousOwnerId) {
    await admin.from("salon_owner").update({ user_id: ownerUserId }).eq("id", 1);
    record(
      "a real salon_owner row was swapped for the test and will be restored",
      true,
      "the whole row is snapshotted and the guard at the end proves it came back",
    );
  } else {
    const claim = await owner.from("salon_owner").insert({ user_id: ownerUserId });
    record(
      "the signed-in owner claims salon_owner",
      !claim.error,
      claim.error
        ? claim.error.message
        : "insert accepted, checked against the verified JWT subject",
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

  const anonOwnerRows = await anon.from("salon_owner").select("user_id");
  record(
    "anon cannot read salon_owner",
    errorCode(anonOwnerRows.error) === "42501",
    `code ${errorCode(anonOwnerRows.error)}: ${errorText(anonOwnerRows.error)}`,
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
    .select("*")
    .maybeSingle();
  previousSalonSettings = existingSettings.data;
  if (previousSalonSettings) {
    const originalNotice = previousSalonSettings.min_notice_hours;
    const bumped = originalNotice === 3 ? 4 : 3;
    const ownerWrite = await owner
      .from("salon_settings")
      .update({ min_notice_hours: bumped })
      .eq("id", 1);
    await admin
      .from("salon_settings")
      .update({ min_notice_hours: originalNotice })
      .eq("id", 1);
    record(
      "the owner updates salon_settings",
      !ownerWrite.error,
      ownerWrite.error
        ? ownerWrite.error.message
        : `min_notice_hours set to ${bumped} as the owner, put back to ${originalNotice}`,
    );
  } else {
    const created = await owner.from("salon_settings").insert({
      name: "Verify Salon",
      address: "Verify Address",
      whatsapp_phone: "+2348031234567",
    });
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

  const strangerUpdateBooking = await attempt(stranger, "update", "bookings", {
    row: { flagged: true },
    filters: [{ column: "token_hash", value: "6".repeat(64) }],
  });
  expectBlockedByPolicy(
    "a signed-in stranger updates no booking",
    strangerUpdateBooking,
  );

  const strangerDeleteBooking = await attempt(stranger, "delete", "bookings", {
    filters: [{ column: "token_hash", value: "6".repeat(64) }],
  });
  expectBlockedByPolicy(
    "a signed-in stranger deletes no booking",
    strangerDeleteBooking,
  );

  const ownerUpdateBooking = await attempt(owner, "update", "bookings", {
    row: { flagged: true, flag_reason: "checked by db:verify" },
    filters: [{ column: "token_hash", value: "6".repeat(64) }],
  });
  expectAllowed("the owner updates a booking", ownerUpdateBooking);

  const ownerDeleteBooking = await attempt(owner, "delete", "bookings", {
    filters: [{ column: "token_hash", value: "5".repeat(64) }],
  });
  expectAllowed("the owner deletes a booking", ownerDeleteBooking);

  const inactiveService = await attempt(owner, "insert", "services", {
    row: {
      id: INACTIVE_SERVICE_ID,
      name: "Verify Retired Service",
      duration_minutes: 30,
      price_kobo: 500000,
      deposit_kobo: 150000,
      is_active: false,
    },
  });
  expectAllowed("the owner inserts a deactivated service", inactiveService);

  const anonActiveService = await attempt(anon, "select", "services", {
    filters: [{ column: "id", value: SERVICE_ID }],
  });
  expectAllowed("anon reads the active service", anonActiveService);

  const anonInactiveService = await attempt(anon, "select", "services", {
    filters: [{ column: "id", value: INACTIVE_SERVICE_ID }],
  });
  record(
    "anon cannot read a deactivated service",
    anonInactiveService.code === "none" && anonInactiveService.rows === 0,
    `code ${anonInactiveService.code}, ${anonInactiveService.rows} row(s)`,
  );

  const ownerInactiveService = await attempt(owner, "select", "services", {
    filters: [{ column: "id", value: INACTIVE_SERVICE_ID }],
  });
  expectAllowed("the owner reads a deactivated service", ownerInactiveService);

  const strangerUpdateService = await attempt(stranger, "update", "services", {
    row: { price_kobo: 1 },
    filters: [{ column: "id", value: SERVICE_ID }],
  });
  expectBlockedByPolicy(
    "a signed-in stranger updates no service",
    strangerUpdateService,
  );

  const ownerUpdateService = await attempt(owner, "update", "services", {
    row: { price_kobo: 2100000 },
    filters: [{ column: "id", value: SERVICE_ID }],
  });
  expectAllowed("the owner updates a service", ownerUpdateService);

  const depositOverPrice = await attempt(admin, "insert", "services", {
    row: {
      name: "Verify Bad Deposit",
      duration_minutes: 30,
      price_kobo: 100000,
      deposit_kobo: 200000,
    },
  });
  expectViolation(
    "a deposit larger than the price is refused",
    depositOverPrice,
    "23514",
  );

  const ownerInsertLink = await attempt(owner, "insert", "staff_services", {
    row: { staff_id: OTHER_STAFF_ID, service_id: INACTIVE_SERVICE_ID },
  });
  expectAllowed(
    "the owner links a staff member to a deactivated service",
    ownerInsertLink,
  );

  const anonHiddenLink = await attempt(anon, "select", "staff_services", {
    filters: [
      { column: "staff_id", value: OTHER_STAFF_ID },
      { column: "service_id", value: INACTIVE_SERVICE_ID },
    ],
  });
  record(
    "anon cannot read a link to a deactivated service",
    anonHiddenLink.code === "none" && anonHiddenLink.rows === 0,
    `code ${anonHiddenLink.code}, ${anonHiddenLink.rows} row(s)`,
  );

  const anonVisibleLink = await attempt(anon, "select", "staff_services", {
    filters: [{ column: "service_id", value: SERVICE_ID }],
  });
  expectAllowed("anon reads the links to the active service", anonVisibleLink);

  const strangerUpdateLink = await attempt(stranger, "update", "staff_services", {
    filters: [{ column: "service_id", value: SERVICE_ID }],
  });
  expectBlockedByPolicy(
    "a signed-in stranger updates no staff service",
    strangerUpdateLink,
  );

  const ownerUpdateLink = await attempt(owner, "update", "staff_services", {
    row: { staff_id: OTHER_STAFF_ID },
    filters: [
      { column: "staff_id", value: OTHER_STAFF_ID },
      { column: "service_id", value: INACTIVE_SERVICE_ID },
    ],
  });
  expectAllowed("the owner updates a staff service link", ownerUpdateLink);

  const ownerDeleteLink = await attempt(owner, "delete", "staff_services", {
    filters: [
      { column: "staff_id", value: OTHER_STAFF_ID },
      { column: "service_id", value: INACTIVE_SERVICE_ID },
    ],
  });
  expectAllowed("the owner deletes a staff service link", ownerDeleteLink);

  const strangerDeleteLink = await attempt(stranger, "delete", "staff_services", {
    filters: [{ column: "service_id", value: SERVICE_ID }],
  });
  expectBlockedByPolicy(
    "a signed-in stranger deletes no staff service",
    strangerDeleteLink,
  );

  const ownerInsertHours = await attempt(owner, "insert", "staff_hours", {
    row: {
      id: HOURS_ID,
      staff_id: STAFF_ID,
      weekday: 1,
      opens_at: "09:00:00",
      closes_at: "17:00:00",
    },
  });
  expectAllowed("the owner inserts an opening hours row", ownerInsertHours);

  const anonHours = await attempt(anon, "select", "staff_hours", {
    filters: [{ column: "id", value: HOURS_ID }],
  });
  expectAllowed("anon reads the opening hours of active staff", anonHours);

  const closedBeforeOpening = await attempt(admin, "insert", "staff_hours", {
    row: {
      staff_id: STAFF_ID,
      weekday: 2,
      opens_at: "17:00:00",
      closes_at: "09:00:00",
    },
  });
  expectViolation(
    "hours that close before they open are refused",
    closedBeforeOpening,
    "23514",
  );

  const orphanHours = await attempt(admin, "insert", "staff_hours", {
    row: {
      staff_id: "00000000-0000-0000-0000-0000000000ff",
      weekday: 2,
      opens_at: "09:00:00",
      closes_at: "17:00:00",
    },
  });
  expectViolation(
    "hours for a staff member that does not exist are refused",
    orphanHours,
    "23503",
  );

  const strangerUpdateHours = await attempt(stranger, "update", "staff_hours", {
    row: { closes_at: "20:00:00" },
    filters: [{ column: "id", value: HOURS_ID }],
  });
  expectBlockedByPolicy(
    "a signed-in stranger updates no opening hours",
    strangerUpdateHours,
  );

  const ownerUpdateHours = await attempt(owner, "update", "staff_hours", {
    row: { closes_at: "18:00:00" },
    filters: [{ column: "id", value: HOURS_ID }],
  });
  expectAllowed("the owner updates opening hours", ownerUpdateHours);

  const ownerDeleteHours = await attempt(owner, "delete", "staff_hours", {
    filters: [{ column: "id", value: HOURS_ID }],
  });
  expectAllowed("the owner deletes opening hours", ownerDeleteHours);

  const attachment = await admin
    .from("bookings")
    .select("id")
    .eq("token_hash", "6".repeat(64))
    .maybeSingle();
  if (!attachment.data) {
    throw new Error("no seeded booking to attach a payment and reminders to");
  }
  const bookingId: string = attachment.data.id;

  const anonPayments = await attempt(anon, "select", "payments");
  expectDenied("anon cannot read payments", anonPayments);

  const anonInsertPayment = await attempt(anon, "insert", "payments", {
    row: {
      booking_id: bookingId,
      paystack_reference: "anon-reference",
      amount_kobo: 600000,
    },
  });
  expectDenied("anon cannot insert a payment", anonInsertPayment);

  const strangerPayments = await attempt(stranger, "select", "payments", {
    filters: [{ column: "booking_id", value: bookingId }],
  });
  expectBlockedByPolicy(
    "a signed-in stranger reads no payments",
    strangerPayments,
  );

  const strangerInsertPayment = await attempt(stranger, "insert", "payments", {
    row: {
      booking_id: bookingId,
      paystack_reference: "stranger-reference",
      amount_kobo: 600000,
    },
  });
  expectDenied("a signed-in stranger cannot insert a payment", strangerInsertPayment);

  const strangerUpdatePayment = await attempt(stranger, "update", "payments", {
    row: { status: "succeeded" },
    filters: [{ column: "booking_id", value: bookingId }],
  });
  expectBlockedByPolicy(
    "a signed-in stranger updates no payment",
    strangerUpdatePayment,
  );

  const strangerDeletePayment = await attempt(stranger, "delete", "payments", {
    filters: [{ column: "booking_id", value: bookingId }],
  });
  expectBlockedByPolicy(
    "a signed-in stranger deletes no payment",
    strangerDeletePayment,
  );

  const ownerInsertPayment = await attempt(owner, "insert", "payments", {
    row: {
      booking_id: bookingId,
      paystack_reference: "verify-reference-1",
      amount_kobo: 600000,
      raw_event: { event: "charge.success", source: "db:verify" },
    },
  });
  expectAllowed("the owner inserts a payment", ownerInsertPayment);

  const duplicateReference = await attempt(owner, "insert", "payments", {
    row: {
      booking_id: bookingId,
      paystack_reference: "verify-reference-1",
      amount_kobo: 600000,
    },
  });
  expectViolation(
    "a repeated Paystack reference is refused, which is what makes the webhook idempotent",
    duplicateReference,
    "23505",
  );

  const zeroAmount = await attempt(owner, "insert", "payments", {
    row: {
      booking_id: bookingId,
      paystack_reference: "verify-reference-zero",
      amount_kobo: 0,
    },
  });
  expectViolation("a payment of zero kobo is refused", zeroAmount, "23514");

  const orphanPayment = await attempt(owner, "insert", "payments", {
    row: {
      booking_id: "00000000-0000-0000-0000-0000000000ff",
      paystack_reference: "verify-reference-orphan",
      amount_kobo: 600000,
    },
  });
  expectViolation(
    "a payment for a booking that does not exist is refused",
    orphanPayment,
    "23503",
  );

  const ownerUpdatePayment = await attempt(owner, "update", "payments", {
    row: { status: "succeeded", verified_at: "2027-03-01T10:05:00Z" },
    filters: [{ column: "paystack_reference", value: "verify-reference-1" }],
  });
  expectAllowed("the owner updates a payment", ownerUpdatePayment);

  const ownerDeletePayment = await attempt(owner, "delete", "payments", {
    filters: [{ column: "paystack_reference", value: "verify-reference-1" }],
  });
  expectAllowed("the owner deletes a payment", ownerDeletePayment);

  const anonReminders = await attempt(anon, "select", "reminders");
  expectDenied("anon cannot read reminders", anonReminders);

  const strangerReminders = await attempt(stranger, "select", "reminders", {
    filters: [{ column: "booking_id", value: bookingId }],
  });
  expectBlockedByPolicy(
    "a signed-in stranger reads no reminders",
    strangerReminders,
  );

  const strangerInsertReminder = await attempt(stranger, "insert", "reminders", {
    row: {
      booking_id: bookingId,
      kind: "confirmation",
      scheduled_for: "2027-03-01T10:05:00Z",
    },
  });
  expectDenied(
    "a signed-in stranger cannot insert a reminder",
    strangerInsertReminder,
  );

  const strangerUpdateReminder = await attempt(stranger, "update", "reminders", {
    row: { status: "sent" },
    filters: [{ column: "booking_id", value: bookingId }],
  });
  expectBlockedByPolicy(
    "a signed-in stranger updates no reminder",
    strangerUpdateReminder,
  );

  const ownerInsertReminder = await attempt(owner, "insert", "reminders", {
    row: {
      booking_id: bookingId,
      kind: "confirmation",
      scheduled_for: "2027-03-01T10:05:00Z",
    },
  });
  expectAllowed("the owner inserts a reminder", ownerInsertReminder);

  const duplicateKind = await attempt(owner, "insert", "reminders", {
    row: {
      booking_id: bookingId,
      kind: "confirmation",
      scheduled_for: "2027-03-01T11:05:00Z",
    },
  });
  expectViolation(
    "a second reminder of the same kind for one booking is refused",
    duplicateKind,
    "23505",
  );

  const unknownKind = await attempt(owner, "insert", "reminders", {
    row: {
      booking_id: bookingId,
      kind: "sms",
      scheduled_for: "2027-03-01T11:05:00Z",
    },
  });
  expectViolation("an unknown reminder kind is refused", unknownKind, "23514");

  const ownerUpdateReminder = await attempt(owner, "update", "reminders", {
    row: { scheduled_for: "2027-03-01T10:10:00Z" },
    filters: [{ column: "booking_id", value: bookingId }],
  });
  expectAllowed("the owner reschedules a reminder", ownerUpdateReminder);

  const strangerDeleteReminder = await attempt(stranger, "delete", "reminders", {
    filters: [{ column: "booking_id", value: bookingId }],
  });
  expectBlockedByPolicy(
    "a signed-in stranger deletes no reminder",
    strangerDeleteReminder,
  );

  const ownerDeleteReminder = await attempt(owner, "delete", "reminders", {
    filters: [{ column: "booking_id", value: bookingId }],
  });
  expectAllowed("the owner deletes a reminder", ownerDeleteReminder);

  const existingReminderSettings = await admin
    .from("reminder_settings")
    .select("*")
    .maybeSingle();
  previousReminderSettings = existingReminderSettings.data;

  const anonReminderSettings = await attempt(anon, "select", "reminder_settings");
  expectDenied("anon cannot read reminder settings", anonReminderSettings);

  const strangerReminderSettings = await attempt(
    stranger,
    "select",
    "reminder_settings",
  );
  expectBlockedByPolicy(
    "a signed-in stranger reads no reminder settings",
    strangerReminderSettings,
  );

  const strangerUpdateReminderSettings = await attempt(
    stranger,
    "update",
    "reminder_settings",
    {
      row: { reminder_24h_hours_before: 12 },
      filters: [{ column: "id", value: 1 }],
    },
  );
  expectBlockedByPolicy(
    "a signed-in stranger updates no reminder settings",
    strangerUpdateReminderSettings,
  );

  if (previousReminderSettings) {
    const ownerUpdateReminderSettings = await attempt(
      owner,
      "update",
      "reminder_settings",
      {
        row: { reminder_24h_hours_before: 30 },
        filters: [{ column: "id", value: 1 }],
      },
    );
    expectAllowed(
      "the owner updates reminder settings",
      ownerUpdateReminderSettings,
    );
  } else {
    const ownerInsertReminderSettings = await attempt(
      owner,
      "insert",
      "reminder_settings",
      { row: { confirmation_offset_minutes: 0 } },
    );
    expectAllowed(
      "the owner inserts reminder settings",
      ownerInsertReminderSettings,
    );
  }

  const secondReminderSettings = await attempt(
    owner,
    "insert",
    "reminder_settings",
    { row: { confirmation_offset_minutes: 5 } },
  );
  expectViolation(
    "a second reminder settings row is refused, the table holds one",
    secondReminderSettings,
    "23505",
  );

  const ownerDeleteReminderSettings = await attempt(owner, "delete", "reminder_settings", {
    filters: [{ column: "id", value: 1 }],
  });
  expectAllowed("the owner deletes reminder settings", ownerDeleteReminderSettings);

  if (previousReminderSettings) {
    const ownerRestoreReminderSettings = await attempt(
      owner,
      "insert",
      "reminder_settings",
      { row: pickColumns(previousReminderSettings, REMINDER_SETTINGS_COLUMNS) },
    );
    expectAllowed(
      "the owner puts the reminder settings row back",
      ownerRestoreReminderSettings,
    );
  }

  const strangerOwnerRows = await attempt(stranger, "select", "salon_owner");
  expectBlockedByPolicy(
    "a signed-in stranger reads no owner row",
    strangerOwnerRows,
  );

  const strangerUpdateOwner = await attempt(stranger, "update", "salon_owner", {
    row: { user_id: strangerUserId },
    filters: [{ column: "id", value: 1 }],
  });
  expectBlockedByPolicy(
    "a signed-in stranger updates no owner row",
    strangerUpdateOwner,
  );

  const strangerDeleteOwner = await attempt(stranger, "delete", "salon_owner", {
    filters: [{ column: "id", value: 1 }],
  });
  expectBlockedByPolicy(
    "a signed-in stranger deletes no owner row",
    strangerDeleteOwner,
  );

  const strangerUpdateStaff = await attempt(stranger, "update", "staff", {
    row: { name: "Verify Stranger" },
    filters: [{ column: "id", value: STAFF_ID }],
  });
  expectBlockedByPolicy(
    "a signed-in stranger updates no staff member",
    strangerUpdateStaff,
  );

  const strangerDeleteStaff = await attempt(stranger, "delete", "staff", {
    filters: [{ column: "id", value: STAFF_ID }],
  });
  expectBlockedByPolicy(
    "a signed-in stranger deletes no staff member",
    strangerDeleteStaff,
  );

  const strangerUpdateSalonSettings = await attempt(
    stranger,
    "update",
    "salon_settings",
    {
      row: { name: "Verify Stranger" },
      filters: [{ column: "id", value: 1 }],
    },
  );
  expectBlockedByPolicy(
    "a signed-in stranger updates no salon settings",
    strangerUpdateSalonSettings,
  );

  const strangerDeleteSalonSettings = await attempt(
    stranger,
    "delete",
    "salon_settings",
    { filters: [{ column: "id", value: 1 }] },
  );
  expectBlockedByPolicy(
    "a signed-in stranger deletes no salon settings",
    strangerDeleteSalonSettings,
  );

  const PUBLIC_TABLES: {
    table: string;
    insertRow: Record<string, unknown>;
    patchRow: Record<string, unknown>;
    filters: Filter[];
  }[] = [
    {
      table: "services",
      insertRow: {
        name: "Verify Anon",
        duration_minutes: 30,
        price_kobo: 100000,
        deposit_kobo: 30000,
      },
      patchRow: { price_kobo: 1 },
      filters: [{ column: "id", value: SERVICE_ID }],
    },
    {
      table: "staff",
      insertRow: { name: "Verify Anon" },
      patchRow: { name: "Verify Anon" },
      filters: [{ column: "id", value: STAFF_ID }],
    },
    {
      table: "staff_services",
      insertRow: { staff_id: STAFF_ID, service_id: SERVICE_ID },
      patchRow: { staff_id: OTHER_STAFF_ID },
      filters: [{ column: "staff_id", value: STAFF_ID }],
    },
    {
      table: "staff_hours",
      insertRow: {
        staff_id: STAFF_ID,
        weekday: 3,
        opens_at: "09:00:00",
        closes_at: "10:00:00",
      },
      patchRow: { closes_at: "11:00:00" },
      filters: [{ column: "id", value: HOURS_ID }],
    },
    {
      table: "salon_settings",
      insertRow: {
        name: "Verify Anon",
        address: "Verify Anon",
        whatsapp_phone: "+2348031234567",
      },
      patchRow: { name: "Verify Anon" },
      filters: [{ column: "id", value: 1 }],
    },
  ];

  for (const target of PUBLIC_TABLES) {
    expectDenied(
      `anon cannot insert into ${target.table}`,
      await attempt(anon, "insert", target.table, { row: target.insertRow }),
    );
    expectDenied(
      `anon cannot update ${target.table}`,
      await attempt(anon, "update", target.table, {
        row: target.patchRow,
        filters: target.filters,
      }),
    );
    expectDenied(
      `anon cannot delete from ${target.table}`,
      await attempt(anon, "delete", target.table, { filters: target.filters }),
    );
  }

  if (previousSalonSettings) {
    // Filtered on the id, like every other single-row write in this file:
    // PostgREST refuses a delete with no WHERE clause and answers 21000. That
    // check never ran before the seed migration, because salon_settings was
    // empty, so the bug sat there unseen.
    const ownerDeleteSettings = await attempt(owner, "delete", "salon_settings", {
      filters: [{ column: "id", value: 1 }],
    });
    expectAllowed("the owner deletes salon settings", ownerDeleteSettings);

    const ownerRestoreSettings = await attempt(owner, "insert", "salon_settings", {
      row: pickColumns(previousSalonSettings, SETTINGS_COLUMNS),
    });
    expectAllowed(
      "the owner puts the salon settings row back",
      ownerRestoreSettings,
    );
  }

  const ownerDeleteOwner = await attempt(owner, "delete", "salon_owner", {
    filters: [{ column: "id", value: 1 }],
  });
  expectAllowed("the owner deletes the owner row", ownerDeleteOwner);

  // The pre-existing row belongs to the real owner, not to the signed-in test
  // owner, so the insert policy with check (user_id = auth.uid()) must refuse
  // it. The earlier version of this check asserted the opposite and lost the
  // real row: the insert was refused with 42501 and the cleanup could not put
  // it back. It is a security check now, and the restore goes through the
  // admin client, which is the only client allowed to write a row for another
  // user id.
  if (previousOwnerId) {
    const ownerClaimsForeign = await attempt(owner, "insert", "salon_owner", {
      row: { user_id: previousOwnerId },
    });
    expectViolation(
      "the owner cannot claim the owner row for another user",
      ownerClaimsForeign,
      "42501",
    );

    const adminRestoreOwner = await attempt(admin, "insert", "salon_owner", {
      row: { id: 1, user_id: previousOwnerId },
    });
    expectAllowed("the real owner row is restored", adminRestoreOwner);
  }
}

// The two settings tables hold one row and it is real data now, so a restore
// that silently matched nothing would leave the salon with no settings at all.
// A throw here is caught in finish(), which records a failed check.
async function restoreSingleRow(
  table: string,
  snapshot: Record<string, unknown>,
  columns: readonly string[],
): Promise<void> {
  await admin.from(table).delete().eq("id", 1);
  const restore = await admin.from(table).insert(pickColumns(snapshot, columns)).select();
  if (restore.error) {
    throw new Error(`${table} was not put back: ${restore.error.message}`);
  }
}

async function cleanup(): Promise<void> {
  await wipeSeed();
  if (previousSalonSettings) {
    await restoreSingleRow("salon_settings", previousSalonSettings, SETTINGS_COLUMNS);
  } else {
    await admin.from("salon_settings").delete().eq("id", 1);
  }
  if (previousReminderSettings) {
    await restoreSingleRow(
      "reminder_settings",
      previousReminderSettings,
      REMINDER_SETTINGS_COLUMNS,
    );
  } else {
    await admin.from("reminder_settings").delete().eq("id", 1);
  }
  if (ownerUserId) await admin.auth.admin.deleteUser(ownerUserId);
  if (strangerUserId) await admin.auth.admin.deleteUser(strangerUserId);
}

// Written back with every column, not just the user id, so created_at and
// updated_at survive too. Restoring the id alone silently reset both to now(),
// which would make the row different from the one the owner had.
async function restoreOwnerRow(): Promise<string | null> {
  await admin.from("salon_owner").delete().eq("id", 1);
  if (!previousOwnerRow) return null;
  const restore = await admin
    .from("salon_owner")
    .insert(pickColumns(previousOwnerRow, OWNER_COLUMNS));
  return restore.error ? restore.error.message : null;
}

function ownerRowMatches(snapshot: OwnerRow | null, current: OwnerRow | null): boolean {
  if (!snapshot || !current) return snapshot === current;
  return (
    snapshot.id === current.id &&
    snapshot.user_id === current.user_id &&
    Date.parse(snapshot.created_at) === Date.parse(current.created_at) &&
    Date.parse(snapshot.updated_at) === Date.parse(current.updated_at)
  );
}

// The last thing the script does, and it runs whatever happened above it. An
// earlier version of the suite deleted the owner's row and reported success on
// the next run, because the restore silently matched zero rows. This compares
// the row against the snapshot from before the first write and fails the run,
// with the SQL to put it back, if anything is off: missing, extra, or changed.
async function guardOwnerRow(restoreError: string | null): Promise<void> {
  const read = await admin
    .from("salon_owner")
    .select("id,user_id,created_at,updated_at")
    .maybeSingle();
  const current = read.error ? null : (read.data ?? null);

  if (!restoreError && !read.error && ownerRowMatches(previousOwnerRow, current)) {
    record(
      "the salon_owner row is exactly as it was before the run",
      true,
      current
        ? `id ${current.id}, user_id ${current.user_id}, created_at and updated_at unchanged`
        : "there was no row before the run and there is none now",
    );
    return;
  }

  const wanted = previousOwnerRow
    ? `id ${previousOwnerRow.id}, user_id ${previousOwnerRow.user_id}, created_at ${previousOwnerRow.created_at}, updated_at ${previousOwnerRow.updated_at}`
    : "no row at all, so the row that was there must be deleted";

  process.stdout.write(
    [
      "",
      "  THE OWNER ROW WAS NOT PUT BACK. The salon_owner table is not as it was",
      "  before this run, so the owner cannot sign in until it is repaired.",
      "",
      `  restore error: ${restoreError ?? "none"}`,
      `  read error:    ${read.error?.message ?? "none"}`,
      `  found:         ${current ? JSON.stringify(current) : "no row"}`,
      `  expected:      ${wanted}`,
      "",
      "  Run this in the Supabase SQL editor to put it back:",
      previousOwnerRow
        ? `    delete from public.salon_owner;` +
              `\n    insert into public.salon_owner (id, user_id, created_at, updated_at) values (${previousOwnerRow.id}, '${previousOwnerRow.user_id}', '${previousOwnerRow.created_at}', '${previousOwnerRow.updated_at}');`
        : `    delete from public.salon_owner;`,
      "",
    ].join("\n"),
  );

  record("the salon_owner row is exactly as it was before the run", false, "changed by this run, see the SQL above");
}

/**
 * Cleanup, then the guard, and the guard runs even if cleanup threw. A throw
 * from here would skip the summary and the exit code, which is how a broken
 * restore used to look like a clean run.
 */
async function finish(): Promise<void> {
  let restoreError: string | null = null;
  try {
    await cleanup();
  } catch (failure: unknown) {
    record("the cleanup finished", false, String(failure));
  }
  try {
    restoreError = await restoreOwnerRow();
  } catch (failure: unknown) {
    restoreError = String(failure);
  }
  await guardOwnerRow(restoreError);
}

run()
  .catch((failure: unknown) => {
    record("the verification script finished", false, String(failure));
  })
  .finally(finish)
  .then(() => {
    const failed = checks.filter((check) => !check.ok);
    process.stdout.write(
      `\n${checks.length - failed.length}/${checks.length} checks passed\n`,
    );
    process.exit(failed.length === 0 ? 0 : 1);
  });