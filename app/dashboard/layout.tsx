import { OwnerShell } from "@/components/settings/owner-shell";
import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  endOfLagosDay,
  lagosTodayKey,
  startOfLagosDay,
} from "@/lib/dates";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const owner = await getOwner();
  if (!owner.ok) {
    redirect("/login");
  }

  const deposits = await getTodayDeposits();

  return <OwnerShell deposits={deposits}>{children}</OwnerShell>;
}

/**
 * The sidebar card always means TODAY in Africa/Lagos, whatever day the
 * calendar is showing. Deposits are the sum of verified (succeeded)
 * payments for bookings that start today; walk-ins count as bookings
 * and add nothing.
 */
async function getTodayDeposits(): Promise<
  { count: number; pending: number; totalKobo: number } | undefined
> {
  const today = lagosTodayKey();
  const admin = createAdminClient();

  const { data: bookings, error } = await admin
    .from("bookings")
    .select("id, status, payments(amount_kobo, status)")
    .gte("starts_at", startOfLagosDay(today).toISOString())
    .lt("starts_at", endOfLagosDay(today).toISOString())
    .neq("status", "cancelled");

  if (error) {
    console.error("Today's deposits could not be loaded:", error.message);
    return undefined;
  }

  const count = bookings?.length ?? 0;
  const pending =
    bookings?.filter((booking) => booking.status === "pending_payment").length ?? 0;
  const totalKobo =
    bookings?.reduce((sum, booking) => {
      const paid = (booking.payments ?? [])
        .filter((payment) => payment.status === "succeeded")
        .reduce((paidSum, payment) => paidSum + payment.amount_kobo, 0);
      return sum + paid;
    }, 0) ?? 0;

  return { count, pending, totalKobo };
}
