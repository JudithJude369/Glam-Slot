"use client";

import { useState, useEffect } from "react";
import { formatTime12, koboToNaira } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BookingSummary } from "@/components/booking";
import { StickyActionBar } from "@/components/booking";
import { Loader2 } from "lucide-react";

interface PayDepositPageProps {
  bookingId: string;
  salon: {
    name: string;
    tagline: string;
    city: string;
    rating: string;
    reviewCount: string;
    address: string;
    addressShort: string;
    hours: string;
    hoursFooter: string;
    visitLine: string;
    closedNote: string;
    nearby: string;
    cancellation: string;
    cancellationShort: string;
    whatsappNumber: string;
    whatsappHref: string;
    phone: string;
    phoneHref: string;
  };
}

type BookingData = {
  id: string;
  service_name: string;
  service_duration: string;
  service_price_kobo: number;
  service_deposit_kobo: number;
  starts_at: string;
  staff_name: string;
  deposit_kobo: number;
  status: string;
  hold_expires_at: string;
};

export function PayDepositPage({ bookingId, salon }: PayDepositPageProps) {
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data);
      } else {
        setError("Booking not found");
      }
    } catch {
      setError("Failed to load booking");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    if (!booking) return;

    const updateTimer = () => {
      const holdExpiry = new Date(booking.hold_expires_at).getTime();
      const now = Date.now();
      const diff = Math.max(0, holdExpiry - now);
      setTimeLeft(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  const handlePay = async () => {
    if (!booking) return;
    setIsPaying(true);
    setError("");

    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      const data = await response.json();

      if (response.ok && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        setError(data.error || "Failed to initialize payment");
      }
    } catch {
      setError("Failed to initialize payment");
    } finally {
      setIsPaying(false);
    }
  };

  const formatTimeLeft = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking || error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-medium text-foreground">Unable to load booking</p>
        <p className="text-muted-foreground">{error || "Booking not found or expired"}</p>
        <Button asChild onClick={() => window.location.href = "/book"}>
          <a href="/book">Start a new booking</a>
        </Button>
      </div>
    );
  }

  if (booking.status !== "pending_payment") {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-medium text-foreground">
          This booking is {booking.status.replace("_", " ")}
        </p>
        <Button asChild onClick={() => window.location.href = "/book"}>
          <a href="/book">Start a new booking</a>
        </Button>
      </div>
    );
  }

  const depositAmount = koboToNaira(booking.deposit_kobo);
  const balanceAmount = koboToNaira(booking.service_price_kobo - booking.deposit_kobo);
  const dateDisplay = format(new Date(booking.starts_at), "EEE, MMM d");
  const timeDisplay = formatTime12(booking.starts_at);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="flex flex-col gap-6">
      <BookingSummary
        serviceName={booking.service_name}
        dateDisplay={dateDisplay}
        timeDisplay={timeDisplay}
        staffName={booking.staff_name}
        depositAmount={depositAmount}
        balanceAmount={balanceAmount}
      />

      <div className="rounded-[28px] border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-foreground">Hold timer</h3>
          <div className="flex items-center gap-2 rounded-full bg-warning/10 px-3 py-1 text-sm font-medium text-warning">
            <span className="flex h-2 w-2 rounded-full bg-warning animate-pulse" />
            {formatTimeLeft(timeLeft)} left
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Your slot is held for 15 minutes. Complete payment to confirm your booking.
        </p>
        {timeLeft === 0 && (
          <p className="mt-3 text-sm text-danger">This hold has expired. Please start a new booking.</p>
        )}
      </div>

      {error && (
        <div className="rounded-[18px] border border-danger bg-danger/10 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      <StickyActionBar
        onBack={() => window.location.href = "/book"}
        onContinue={handlePay}
        depositAmount={depositAmount}
        isContinueDisabled={isPaying || timeLeft === 0}
        continueText={isPaying ? "Redirecting..." : `Pay ${depositAmount}`}
      />
    </div>
  );
}

function format(date: Date, formatStr: string): string {
  return date.toLocaleDateString("en-US", {
    weekday: formatStr.includes("EEE") ? "short" : undefined,
    month: formatStr.includes("MMM") ? "short" : undefined,
    day: formatStr.includes("d") ? "numeric" : undefined,
  });
}