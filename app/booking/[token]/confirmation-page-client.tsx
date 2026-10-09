"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { CalendarPlus, MessageSquare, RotateCcw, X, CheckCircle2 } from "lucide-react";
import type { PublicSalonDetails } from "@/lib/public-salon";

interface ConfirmationPageClientProps {
  token: string;
  booking: {
    id: string;
    service_name: string;
    service_duration: number;
    service_price_kobo: number;
    service_deposit_kobo: number;
    starts_at: string;
    ends_at: string;
    status: string;
    customer_name: string;
    customer_phone: string;
    deposit_kobo: number;
    staff_name: string;
    is_past: boolean;
    can_reschedule: boolean;
    can_cancel: boolean;
  };
  salon: PublicSalonDetails;
  depositAmount: string;
  balanceAmount: string;
  dateDisplay: string;
  fullDateDisplay: string;
  timeDisplay: string;
  bookingCode: string;
  shortServiceName: string;
}

export function ConfirmationPageClient({
  token,
  booking: bookingProp,
  salon,
  depositAmount,
  balanceAmount,
  dateDisplay,
  fullDateDisplay,
  timeDisplay,
  bookingCode,
  shortServiceName,
}: ConfirmationPageClientProps) {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCancelled, setIsCancelled] = useState(false);

  const booking = isCancelled
    ? { ...bookingProp, status: "cancelled" as const, can_cancel: false, can_reschedule: false }
    : bookingProp;

  const handleAddToCalendar = () => {
    const start = new Date(booking.starts_at);
    const end = new Date(booking.ends_at);
    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//GlamSlot//Booking//EN",
      "BEGIN:VEVENT",
      `UID:${booking.id}@glamslot`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${booking.service_name} at ${salon.name}`,
      `DESCRIPTION:Your ${booking.service_name} appointment with ${booking.staff_name}. Deposit ${depositAmount} paid. Balance ${balanceAmount} due at salon. Booking code: ${bookingCode}`,
      `LOCATION:${salon.address}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `glamslot-${bookingCode}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleReschedule = async () => {
    setIsRescheduling(true);
    setError("");
    try {
      const response = await fetch(`/api/booking/${booking.id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to start reschedule");
      // Redirect to booking page with pre-filled data
      window.location.href = `/book?reschedule=${booking.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start reschedule");
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelConfirm) {
      setCancelConfirm(true);
      return;
    }
    setIsCancelling(true);
    setError("");
    try {
      const response = await fetch(`/api/booking/${booking.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to cancel booking");
      setSuccess("Booking cancelled. Deposit will be refunded as salon credit if within 24 hours.");
      setIsCancelled(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setIsCancelling(false);
      setCancelConfirm(false);
    }
  };

  const whatsappHref = `https://wa.me/${salon.whatsappNumber.replace(/\D/g, "")}`;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const isTablet = typeof window !== "undefined" && window.innerWidth >= 768 && window.innerWidth < 1024;
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;

  const statusColors: Record<string, string> = {
    confirmed: "bg-success/10 text-success border-success/20",
    pending_payment: "bg-warning/10 text-warning border-warning/20",
    cancelled: "bg-danger/10 text-danger border-danger/20",
    expired: "bg-muted text-muted-foreground border-border",
    completed: "bg-muted text-muted-foreground border-border",
    no_show: "bg-danger/10 text-danger border-danger/20",
  };

  const statusLabels: Record<string, string> = {
    confirmed: "Confirmed",
    pending_payment: "Awaiting Payment",
    cancelled: "Cancelled",
    expired: "Expired",
    completed: "Completed",
    no_show: "No Show",
  };

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader salon={salon} />
        <main className="flex-1 w-full max-w-[1120px] mx-auto px-5 py-6 pb-32">
          <div className="flex flex-col items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-center text-foreground">
              You&apos;re booked, {booking.customer_name}!
            </h1>
            <p className="text-sm text-center text-muted-foreground leading-relaxed max-w-xs">
              Deposit paid &bull; WhatsApp confirmation sent to {formatPhoneForDisplay(booking.customer_phone)}
            </p>

            <div className="w-full rounded-[24px] border bg-card p-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Service</span>
                  <span className="text-sm font-medium text-foreground text-right">{shortServiceName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">When</span>
                  <span className="text-sm font-medium text-foreground text-right">{dateDisplay} &bull; {timeDisplay}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Code</span>
                  <span className="text-sm font-medium text-foreground text-right font-mono">{bookingCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Balance</span>
                  <span className="text-sm font-medium text-foreground text-right">{balanceAmount} at salon</span>
                </div>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-12 rounded-[16px] text-sm" onClick={handleAddToCalendar}>
                <CalendarPlus className="mr-2 h-5 w-5" />
                Add to calendar
              </Button>
              <Button variant="outline" className="h-12 rounded-[16px] text-sm" onClick={() => window.open(whatsappHref, "_blank")}>
                <MessageSquare className="mr-2 h-5 w-5" />
                WhatsApp us
              </Button>
              <Button variant="outline" className="h-12 rounded-[16px] text-sm" onClick={handleReschedule} disabled={isRescheduling || !booking.can_reschedule}>
                <RotateCcw className="mr-2 h-5 w-5" />
                Reschedule
              </Button>
              <Button variant="destructive" className="h-12 rounded-[16px] text-sm" onClick={handleCancel} disabled={isCancelling || !booking.can_cancel}>
                <X className="mr-2 h-5 w-5" />
                Cancel
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground leading-relaxed max-w-xs">
              Free reschedule up to 24h before &bull; Deposit becomes salon credit if cancelled in time.
            </p>

            {error && (
              <div className="w-full rounded-[16px] border border-danger bg-danger/10 p-3 text-sm text-danger text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="w-full rounded-[16px] border border-success bg-success/10 p-3 text-sm text-success text-center">
                {success}
              </div>
            )}
          </div>
        </main>
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background p-5 pb-safe">
          <Button className="w-full h-13 rounded-[16px] text-base font-medium" onClick={() => window.location.href = `/booking/${token}`}>
            Manage booking
          </Button>
        </div>
      </div>
    );
  }

  if (isTablet) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader salon={salon} />
        <main className="flex-1 w-full max-w-[1120px] mx-auto px-6 py-10 pb-12">
          <div className="flex flex-col items-center gap-8 max-w-2xl mx-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h1 className="font-serif text-4xl font-semibold text-center text-foreground">You&apos;re booked!</h1>
            <p className="text-base text-center text-muted-foreground">
              {dateDisplay} &bull; {timeDisplay} with {booking.staff_name} &bull; Code {bookingCode}
            </p>

            <div className="w-full grid grid-cols-2 gap-3">
              <div className="rounded-[24px] border bg-card p-5">
                <h3 className="font-serif text-xl font-semibold text-foreground">Details</h3>
                <p className="mt-2 text-base text-foreground">{shortServiceName} &bull; {depositAmount} paid &bull; {balanceAmount} at salon</p>
                <p className="mt-2 text-base text-muted-foreground">Reminders: 24h + 2h on WhatsApp</p>
              </div>
              <div className="rounded-[24px] border bg-card p-5 flex flex-col gap-2">
                <Button className="h-12 rounded-[16px] text-base" onClick={handleAddToCalendar}>
                  <CalendarPlus className="mr-2 h-5 w-5" />
                  Add to calendar
                </Button>
                <Button variant="outline" className="h-12 rounded-[16px] text-base" onClick={handleReschedule} disabled={!booking.can_reschedule}>
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Reschedule
                </Button>
                <Button variant="destructive" className="h-12 rounded-[16px] text-base" onClick={handleCancel} disabled={!booking.can_cancel}>
                  <X className="mr-2 h-5 w-5" />
                  Cancel booking
                </Button>
              </div>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Deposit refunded as credit if cancelled 24h+ before.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader salon={salon} />
      <main className="flex-1 w-full max-w-[1120px] mx-auto px-6 py-14">
        <div className="flex flex-col items-center gap-10 max-w-4xl mx-auto">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h1 className="font-serif text-5xl font-semibold text-center text-foreground">
            You&apos;re booked, {booking.customer_name}!
          </h1>
          <p className="text-lg text-center text-muted-foreground max-w-xl">
            A WhatsApp confirmation is on its way. We saved your slot and your stylist can&apos;t wait.
          </p>

          <div className="w-full grid grid-cols-2 gap-4">
            <div className="rounded-[28px] border bg-card p-6">
              <h3 className="font-serif text-2xl font-semibold text-foreground">{booking.service_name}</h3>
              <p className="mt-4 text-lg text-foreground">{fullDateDisplay} &bull; {timeDisplay} &bull; with {booking.staff_name}</p>
              <p className="mt-4 text-base text-muted-foreground">Code {bookingCode} &bull; {depositAmount} paid &bull; {balanceAmount} due at salon</p>
            </div>
            <div className="rounded-[28px] border bg-card p-6 flex flex-col gap-3">
              <Button className="h-13 rounded-[16px] text-base font-medium" onClick={handleAddToCalendar}>
                <CalendarPlus className="mr-2 h-5 w-5" />
                Add to calendar
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-12 rounded-[16px] text-base" onClick={handleReschedule} disabled={!booking.can_reschedule}>
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Reschedule
                </Button>
                <Button variant="destructive" className="flex-1 h-12 rounded-[16px] text-base" onClick={handleCancel} disabled={!booking.can_cancel}>
                  <X className="mr-2 h-5 w-5" />
                  Cancel
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Free until 24h before &bull; deposit becomes credit</p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter salon={salon} />
    </div>
  );
}

function formatPhoneForDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) {
    return `+234 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  return phone;
}