"use server";

import { z } from "zod";
import type { Database } from "@/lib/database.types";
import { getOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ReminderSettings = Database["public"]["Tables"]["reminder_settings"]["Row"];

const serviceSchema = z.object({
  id: z.guid().optional(),
  name: z.string().trim().min(1, "Name is required").max(100),
  duration_minutes: z.coerce
    .number()
    .int()
    .min(5, "Minimum 5 minutes")
    .max(600, "Maximum 10 hours"),
  price_kobo: z.coerce
    .number()
    .int()
    .min(0, "Price cannot be negative"),
  deposit_kobo: z.coerce
    .number()
    .int()
    .min(0, "Deposit cannot be negative"),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

export async function getServices() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveService(formData: ServiceFormData) {
  const owner = await getOwner();
  if (!owner.ok) {
    return { error: "Not authorised" as const };
  }

  const validated = serviceSchema.safeParse(formData);
  if (!validated.success) {
    return {
      error: validated.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const data = validated.data;

  if (data.deposit_kobo === undefined || data.deposit_kobo === null) {
    const defaultDeposit = Math.round(data.price_kobo * 0.3);
    data.deposit_kobo = Math.min(defaultDeposit, data.price_kobo);
  }

  if (data.deposit_kobo > data.price_kobo) {
    data.deposit_kobo = data.price_kobo;
  }

  const supabase = await createClient();

  if (data.id) {
    const { error } = await supabase
      .from("services")
      .update({
        name: data.name,
        duration_minutes: data.duration_minutes,
        price_kobo: data.price_kobo,
        deposit_kobo: data.deposit_kobo,
        is_active: data.is_active,
        sort_order: data.sort_order,
      })
      .eq("id", data.id);

    if (error) {
      return { error: error.message };
    }
  } else {
    const { error } = await supabase.from("services").insert({
      name: data.name,
      duration_minutes: data.duration_minutes,
      price_kobo: data.price_kobo,
      deposit_kobo: data.deposit_kobo,
      is_active: data.is_active,
      sort_order: data.sort_order,
    });

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/dashboard/settings");
  return { ok: true as const };
}

export async function toggleService(id: string, isActive: boolean) {
  const owner = await getOwner();
  if (!owner.ok) {
    throw new Error("Not authorised");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/settings");
}

export async function getStaff() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getStaffHours(staffId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff_hours")
    .select("*")
    .eq("staff_id", staffId)
    .order("weekday", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getReminderSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reminder_settings")
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function saveReminderSettings(
  settings: ReminderSettings,
): Promise<{ error?: string } | { ok: true }> {
  const owner = await getOwner();
  if (!owner.ok) {
    return { error: "Not authorised" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("reminder_settings")
    .update({
      confirmation_enabled: settings.confirmation_enabled,
      confirmation_offset_minutes: settings.confirmation_offset_minutes,
      reminder_24h_enabled: settings.reminder_24h_enabled,
      reminder_24h_hours_before: settings.reminder_24h_hours_before,
      reminder_2h_enabled: settings.reminder_2h_enabled,
      reminder_2h_hours_before: settings.reminder_2h_hours_before,
    })
    .eq("id", settings.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { ok: true };
}
