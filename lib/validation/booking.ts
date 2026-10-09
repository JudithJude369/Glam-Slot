import { z } from "zod";

export const bookingStepSchema = z.object({
  serviceId: z.string().uuid("Invalid service"),
  staffId: z.string().uuid("Invalid staff").optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  customerName: z.string().trim().min(1, "Name is required").max(100),
  customerPhone: z.string().trim().min(1, "WhatsApp number is required").max(20),
  wantsReminders: z.boolean().default(true),
});

export type BookingStepData = z.infer<typeof bookingStepSchema>;

export const createBookingSchema = z.object({
  serviceId: z.string().uuid("Invalid service"),
  staffId: z.string().uuid("Invalid staff").optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  customerName: z.string().trim().min(1, "Name is required").max(100),
  customerPhone: z.string().trim().min(1, "WhatsApp number is required").max(20),
  wantsReminders: z.boolean().default(true),
});

export type CreateBookingData = z.infer<typeof createBookingSchema>;

export const phoneSchema = z.string().trim().min(1, "WhatsApp number is required").max(20);

export function normalizeNigerianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) {
    return `+${digits}`;
  }
  if (digits.startsWith("0")) {
    return `+234${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    return `+234${digits}`;
  }
  return phone;
}