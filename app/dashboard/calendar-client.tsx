"use client";

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { format as formatDate } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { koboToNaira } from "@/lib/money";
import { SALON_TIMEZONE, formatCardTime } from "@/lib/dates";
import {
  createOwnerBooking,
  cancelOwnerBooking,
  markNoShow,
  rescheduleOwnerBooking,
} from "@/lib/actions/owner-bookings";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type {
  CalendarBooking,
  CalendarDayStats,
  CalendarStaff,
} from "./page";

export interface CalendarClientProps {
  dateKey: string;
  todayKey: string;
  isToday: boolean;
  title: string;
  titleShort: string;
  weekLabel: string;
  bookings: CalendarBooking[];
  staff: CalendarStaff[];
  onShiftCount: number;
  hourLabels: string[];
  closedDay: boolean;
  dayStats: CalendarDayStats;
  serviceStaffMap: Record<string, string[]>;
  staffServiceMap: Record<string, string[]>;
  services: { id: string; name: string }[];
}

type ConfirmState =
  | { kind: "cancel"; booking: CalendarBooking }
  | { kind: "no_show"; booking: CalendarBooking }
  | null;

/**
 * Subscribes to a media query without setting state in an effect.
 * The server snapshot is false, so the first client render matches.
 */
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    },
    [query]
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** A clock that only updates on an interval, so renders stay pure. */
function useNow(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function moneyLine(booking: CalendarBooking): string {
  const money =
    booking.deposit_kobo > 0 ? `${koboToNaira(booking.deposit_kobo)} ` : "";
  return booking.status === "confirmed" ? `${money}paid` : `${money}pending`;
}

function waMeLink(phone: string): string {
  return `https://wa.me/${phone.replace(/^\+/, "")}`;
}

function toInputTime(iso: string): string {
  return formatDate(toZonedTime(new Date(iso), SALON_TIMEZONE), "HH:mm");
}

function dateKeyPlusDays(dateKey: string, delta: number): string {
  const shifted = new Date(`${dateKey}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + delta);
  return shifted.toISOString().slice(0, 10);
}

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2";

function DayChevron({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous day" : "Next day"}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-[16px] border border-border bg-card text-foreground hover:bg-muted",
        focusRing
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}

function StatusPill({ booking }: { booking: CalendarBooking }) {
  if (booking.status === "confirmed") {
    return (
      <span className="shrink-0 rounded-full bg-success-bg px-2.5 py-1 text-[13px] font-medium text-success">
        Paid
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full bg-warning-bg px-2.5 py-1 text-[13px] font-medium text-warning">
      Pending
    </span>
  );
}

function OutlineAction({
  onClick,
  children,
  disabled,
  className,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-11 items-center justify-center rounded-[16px] border border-border bg-card px-3 text-[16px] text-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-50",
        focusRing,
        className
      )}
    >
      {children}
    </button>
  );
}

function DangerAction({
  onClick,
  children,
  disabled,
  className,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-11 items-center justify-center rounded-[16px] bg-danger px-3 text-[16px] text-white hover:bg-danger/90 disabled:pointer-events-none disabled:opacity-50",
        focusRing,
        className
      )}
    >
      {children}
    </button>
  );
}

function AddButton({
  onClick,
  label,
  className,
}: {
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-11 items-center justify-center rounded-[16px] bg-primary px-5 text-[16px] font-medium text-white hover:bg-primary/80",
        focusRing,
        className
      )}
    >
      {label}
    </button>
  );
}

function TodayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-11 items-center justify-center rounded-[16px] border border-border bg-card px-4 text-[16px] text-foreground hover:bg-muted",
        focusRing
      )}
    >
      Today
    </button>
  );
}

/** The booking details body shared by the desktop panel and the lg drawer. */
function DetailsContent({
  booking,
  onClose,
  onReschedule,
  onNoShow,
  onCancel,
}: {
  booking: CalendarBooking;
  onClose: () => void;
  onReschedule: () => void;
  onNoShow: () => void;
  onCancel: () => void;
}) {
  const now = useNow();
  const notStartedYet = new Date(booking.starts_at).getTime() > now;
  const badge =
    booking.status === "confirmed" ? (
      <span className="inline-flex items-center rounded-full bg-success-bg px-3 py-1.5 text-[14px] font-medium text-success">
        {booking.deposit_kobo > 0
          ? `${koboToNaira(booking.deposit_kobo)} deposit paid`
          : "No deposit"}
      </span>
    ) : (
      <span className="inline-flex items-center rounded-full bg-warning-bg px-3 py-1.5 text-[14px] font-medium text-warning">
        {booking.deposit_kobo > 0
          ? `${koboToNaira(booking.deposit_kobo)} pending`
          : "Pending"}
      </span>
    );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-[24px] text-foreground">
          Booking details
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close booking details"
          className={cn(
            "flex size-9 items-center justify-center rounded-[12px] text-foreground hover:bg-muted",
            focusRing
          )}
        >
          <X className="size-6" />
        </button>
      </div>

      <div className="mt-6">
        <p className="text-[18px] font-medium text-foreground">
          {booking.customer_name}
        </p>
        <p className="mt-1 text-[15px] text-muted-foreground">
          {booking.customer_phone} • {booking.service_name}
        </p>
      </div>

      <div className="mt-[14px]">{badge}</div>

      <div className="mt-[18px] grid grid-cols-2 gap-2">
        <OutlineAction onClick={onReschedule}>Reschedule</OutlineAction>
        <a
          href={waMeLink(booking.customer_phone)}
          target="_blank"
          rel="noreferrer"
          className="flex h-11 items-center justify-center rounded-[16px] border border-border bg-card px-3 text-[16px] text-foreground hover:bg-muted"
        >
          Message
        </a>
        <OutlineAction onClick={onNoShow} disabled={notStartedYet}>
          No-show
        </OutlineAction>
        <DangerAction onClick={onCancel}>Cancel</DangerAction>
      </div>
      {notStartedYet && (
        <p className="mt-2 text-[13px] text-muted-foreground">
          A no-show can be marked once the appointment starts.
        </p>
      )}
    </div>
  );
}

/**
 * The form mounts with the dialog content, so its state starts
 * from the props every time the dialog opens.
 */
function AddBookingForm({
  dateKey,
  preselectStaffId,
  services,
  staff,
  serviceStaffMap,
  staffServiceMap,
  onClose,
}: {
  dateKey: string;
  preselectStaffId: string | null;
  services: { id: string; name: string }[];
  staff: CalendarStaff[];
  serviceStaffMap: Record<string, string[]>;
  staffServiceMap: Record<string, string[]>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    serviceId: "",
    staffId: preselectStaffId ?? "",
    date: dateKey,
    startTime: "",
    customerName: "",
    customerPhone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startPending] = useTransition();

  const preselectServiceId =
    preselectStaffId && (staffServiceMap[preselectStaffId] ?? []).length === 1
      ? staffServiceMap[preselectStaffId][0]
      : "";

  const serviceOptions = preselectStaffId
    ? services.filter((service) =>
        (staffServiceMap[preselectStaffId] ?? []).includes(service.id)
      )
    : services;

  const stylistOptions = form.serviceId
    ? staff.filter((member) =>
        (serviceStaffMap[form.serviceId] ?? []).includes(member.id)
      )
    : staff;

  function update(field: string, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function save() {
    startPending(async () => {
      const result = await createOwnerBooking({
        serviceId: form.serviceId || preselectServiceId,
        staffId: form.staffId,
        date: form.date,
        startTime: form.startTime,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
    });
  }

  const inputClass =
    "h-11 w-full rounded-[12px] border border-input bg-background px-3 text-base text-foreground";
  const labelClass = "block text-[14px] font-medium text-foreground";

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add booking</DialogTitle>
        <DialogDescription>
          A walk-in or phone booking. No deposit is taken.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3">
        <div>
          <label htmlFor="add-service" className={labelClass}>
            Service
          </label>
          <select
            id="add-service"
            value={form.serviceId || preselectServiceId}
            onChange={(event) => update("serviceId", event.target.value)}
            className={cn(inputClass, "mt-1")}
          >
            <option value="">Pick a service</option>
            {serviceOptions.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="add-staff" className={labelClass}>
            Stylist
          </label>
          <select
            id="add-staff"
            value={form.staffId}
            onChange={(event) => update("staffId", event.target.value)}
            className={cn(inputClass, "mt-1")}
          >
            <option value="">Pick a stylist</option>
            {stylistOptions.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="add-date" className={labelClass}>
              Date
            </label>
            <input
              id="add-date"
              type="date"
              value={form.date}
              onChange={(event) => update("date", event.target.value)}
              className={cn(inputClass, "mt-1")}
            />
          </div>
          <div>
            <label htmlFor="add-time" className={labelClass}>
              Time
            </label>
            <input
              id="add-time"
              type="time"
              value={form.startTime}
              onChange={(event) => update("startTime", event.target.value)}
              className={cn(inputClass, "mt-1")}
            />
          </div>
        </div>

        <div>
          <label htmlFor="add-name" className={labelClass}>
            Name
          </label>
          <input
            id="add-name"
            type="text"
            value={form.customerName}
            onChange={(event) => update("customerName", event.target.value)}
            className={cn(inputClass, "mt-1")}
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="add-phone" className={labelClass}>
            WhatsApp number
          </label>
          <input
            id="add-phone"
            type="tel"
            inputMode="tel"
            value={form.customerPhone}
            onChange={(event) => update("customerPhone", event.target.value)}
            placeholder="0803..."
            className={cn(inputClass, "mt-1")}
          />
          <p className="mt-1 text-[13px] text-muted-foreground">
            Nigerian numbers only, stored as +234.
          </p>
        </div>
      </div>

      {error && <p className="text-[14px] text-danger">{error}</p>}

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save booking"}
        </Button>
      </DialogFooter>
    </>
  );
}

function AddBookingDialog({
  open,
  onOpenChange,
  dateKey,
  services,
  staff,
  serviceStaffMap,
  staffServiceMap,
  preselectStaffId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateKey: string;
  services: { id: string; name: string }[];
  staff: CalendarStaff[];
  serviceStaffMap: Record<string, string[]>;
  staffServiceMap: Record<string, string[]>;
  preselectStaffId: string | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <AddBookingForm
          key={`${dateKey}-${preselectStaffId ?? ""}`}
          dateKey={dateKey}
          preselectStaffId={preselectStaffId}
          services={services}
          staff={staff}
          serviceStaffMap={serviceStaffMap}
          staffServiceMap={staffServiceMap}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function RescheduleForm({
  booking,
  onClose,
}: {
  booking: CalendarBooking;
  onClose: () => void;
}) {
  const [date, setDate] = useState(
    formatDate(
      toZonedTime(new Date(booking.starts_at), SALON_TIMEZONE),
      "yyyy-MM-dd"
    )
  );
  const [startTime, setStartTime] = useState(toInputTime(booking.starts_at));
  const [error, setError] = useState<string | null>(null);
  const [pending, startPending] = useTransition();

  function save() {
    startPending(async () => {
      const result = await rescheduleOwnerBooking({
        bookingId: booking.id,
        date,
        startTime,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
    });
  }

  const inputClass =
    "h-11 w-full rounded-[12px] border border-input bg-background px-3 text-base text-foreground";

  return (
    <>
      <DialogHeader>
        <DialogTitle>Reschedule {shortName(booking.customer_name)}</DialogTitle>
        <DialogDescription>
          Currently {formatCardTime(booking.starts_at)} with{" "}
          {booking.staff_name}. The deposit carries over to the new slot.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="reschedule-date"
            className="block text-[14px] font-medium text-foreground"
          >
            Date
          </label>
          <input
            id="reschedule-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={cn(inputClass, "mt-1")}
          />
        </div>
        <div>
          <label
            htmlFor="reschedule-time"
            className="block text-[14px] font-medium text-foreground"
          >
            Time
          </label>
          <input
            id="reschedule-time"
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            className={cn(inputClass, "mt-1")}
          />
        </div>
      </div>

      {error && <p className="text-[14px] text-danger">{error}</p>}

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Keep current time</Button>
        </DialogClose>
        <Button onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save new time"}
        </Button>
      </DialogFooter>
    </>
  );
}

function RescheduleDialog({
  booking,
  onOpenChange,
}: {
  booking: CalendarBooking | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!booking} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {booking && (
          <RescheduleForm
            key={booking.id}
            booking={booking}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ConfirmActionDialog({
  confirm,
  actionPending,
  error,
  onClose,
  onRun,
}: {
  confirm: ConfirmState;
  actionPending: boolean;
  error: string | null;
  onClose: () => void;
  onRun: () => void;
}) {
  if (!confirm) {
    return null;
  }

  const isCancel = confirm.kind === "cancel";
  const description = isCancel
    ? `Cancel ${confirm.booking.customer_name}'s ${confirm.booking.service_name} at ${formatCardTime(confirm.booking.starts_at)}? The deposit stays with the customer as salon credit.`
    : `Mark ${confirm.booking.customer_name} as a no-show for ${formatCardTime(confirm.booking.starts_at)}? The deposit is forfeited.`;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isCancel ? "Cancel booking" : "Mark no-show"}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {error && <p className="text-[14px] text-danger">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={actionPending}>
            Keep booking
          </Button>
          <button
            type="button"
            onClick={onRun}
            disabled={actionPending}
            className={cn(
              "flex h-9 items-center justify-center rounded-lg bg-danger px-4 text-sm font-medium text-white hover:bg-danger/90 disabled:pointer-events-none disabled:opacity-50",
              focusRing
            )}
          >
            {actionPending
              ? "Working…"
              : isCancel
                ? "Cancel booking"
                : "Mark no-show"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DatePickerForm({
  dateKey,
  onPick,
  onClose,
}: {
  dateKey: string;
  onPick: (dateKey: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(dateKey);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Pick a day</DialogTitle>
      </DialogHeader>
      <input
        type="date"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label="Pick a day"
        className="h-11 w-full rounded-[12px] border border-input bg-background px-3 text-base text-foreground"
      />
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          onClick={() => {
            if (value) {
              onPick(value);
              onClose();
            }
          }}
        >
          Go
        </Button>
      </DialogFooter>
    </>
  );
}

function DatePickerDialog({
  open,
  onOpenChange,
  dateKey,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateKey: string;
  onPick: (dateKey: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {open && <DatePickerForm key={dateKey} dateKey={dateKey} onPick={onPick} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function SkeletonList(): React.ReactNode {
  return (
    <div className="space-y-2" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-[61px] animate-pulse rounded-[24px] border border-border bg-muted"
        />
      ))}
    </div>
  );
}

export function CalendarClient(props: CalendarClientProps) {
  const {
    dateKey,
    todayKey,
    isToday,
    title,
    titleShort,
    weekLabel,
    bookings,
    staff,
    hourLabels,
    closedDay,
    dayStats,
    serviceStaffMap,
    staffServiceMap,
    services,
  } = props;

  const router = useRouter();
  const isXl = useMediaQuery("(min-width: 1280px)");
  const [isNavigating, startNavigation] = useTransition();
  const [actionPending, startAction] = useTransition();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addStaffId, setAddStaffId] = useState<string | null>(null);
  const [rescheduleBooking, setRescheduleBooking] =
    useState<CalendarBooking | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const now = useNow();

  const selected = bookings.find((booking) => booking.id === selectedId) ?? null;

  function goToDate(key: string) {
    startNavigation(() => {
      router.replace(`/dashboard?date=${key}`);
    });
  }

  function shiftDay(delta: number) {
    goToDate(dateKeyPlusDays(dateKey, delta));
  }

  function openAdd(staffId: string | null = null) {
    setAddStaffId(staffId);
    setAddOpen(true);
  }

  function openReschedule(booking: CalendarBooking) {
    setRescheduleBooking(booking);
  }

  function askCancel(booking: CalendarBooking) {
    setConfirmError(null);
    setConfirm({ kind: "cancel", booking });
  }

  function askNoShow(booking: CalendarBooking) {
    setConfirmError(null);
    setConfirm({ kind: "no_show", booking });
  }

  function runConfirm() {
    if (!confirm) return;
    startAction(async () => {
      const result =
        confirm.kind === "cancel"
          ? await cancelOwnerBooking({ bookingId: confirm.booking.id })
          : await markNoShow({ bookingId: confirm.booking.id });
      if (!result.ok) {
        setConfirmError(result.error);
        return;
      }
      setConfirm(null);
      setSelectedId(null);
    });
  }

  const bookingsByStaff = new Map<string, CalendarBooking[]>();
  for (const member of staff) {
    bookingsByStaff.set(member.id, []);
  }
  for (const booking of bookings) {
    const list = bookingsByStaff.get(booking.staff_id);
    if (list) {
      list.push(booking);
    }
  }

  const weekdayName = title.split(",")[0];
  const closedMessage = `The salon is closed on ${weekdayName}s.`;

  const mobileBand = (
    <div className="bg-plum px-5 py-5 lg:hidden">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <DayChevron direction="prev" onClick={() => shiftDay(-1)} />
          <button
            type="button"
            onClick={() => setDatePickerOpen(true)}
            className={cn("min-w-0 rounded-[12px] text-left", focusRing)}
            aria-label="Pick a day"
          >
            <h1 className="whitespace-nowrap font-serif text-[24px] leading-tight text-background">
              {title}
            </h1>
          </button>
          <DayChevron direction="next" onClick={() => shiftDay(1)} />
        </div>
        <AddButton
          onClick={() => openAdd()}
          label="+ Add"
          className="shrink-0 rounded-[18px] text-[17px]"
        />
      </div>
      <div className="mt-1 flex items-center justify-between pl-[52px]">
        <p className="text-[14px] text-background/70">
          {dayStats.bookingCount} bookings • {koboToNaira(dayStats.depositsKobo)} deposits
        </p>
        {!isToday && (
          <button
            type="button"
            onClick={() => goToDate(todayKey)}
            className={cn(
              "rounded-[12px] text-[14px] text-background/70 underline",
              focusRing
            )}
          >
            Today
          </button>
        )}
      </div>
    </div>
  );

  const mobileTabs = (
    <div className="mt-4 px-4 md:hidden">
      <div className="flex gap-[5px]">
        <span className="flex h-10 flex-1 items-center justify-center rounded-[16px] bg-plum text-[18px] text-background">
          Day
        </span>
        <button
          type="button"
          disabled
          className="flex h-10 flex-1 items-center justify-center rounded-[16px] border border-border bg-card text-[18px] text-muted-foreground"
        >
          Week
        </button>
        <button
          type="button"
          disabled
          className="flex h-10 flex-1 items-center justify-center rounded-[16px] border border-border bg-card text-[18px] text-muted-foreground"
        >
          Staff
        </button>
      </div>
      <div className="mt-[13px] border-b border-border" />
    </div>
  );

  const mobileList = isNavigating ? (
    <div className="px-4 md:hidden">
      <SkeletonList />
    </div>
  ) : (
    <div className="mt-[13px] space-y-2 px-4 md:hidden">
      {bookings.map((booking) => (
        <button
          key={booking.id}
          type="button"
          onClick={() => setSelectedId(booking.id)}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-[24px] border bg-card p-4 text-left",
            booking.status === "pending_payment"
              ? "border-2 border-warning"
              : "border-border",
            focusRing
          )}
        >
          <div className="flex min-w-0 gap-3">
            <span className="w-[52px] shrink-0 text-[17px] text-foreground">
              {formatCardTime(booking.starts_at)}
            </span>
            <span className="min-w-0">
              <span className="block text-[18px] font-medium text-foreground">
                {booking.service_name}
              </span>
              <span className="block text-[15px] text-muted-foreground">
                {shortName(booking.customer_name)} • {moneyLine(booking)}
              </span>
            </span>
          </div>
          <StatusPill booking={booking} />
        </button>
      ))}
    </div>
  );

  const mobileSelectedCard = selected ? (
    <div className="mt-[13px] px-4 pb-4 md:hidden">
      <div className="rounded-[28px] border border-border bg-card p-[17px]">
        <h2 className="font-serif text-[22px] text-foreground">
          {selected.customer_name} — {formatCardTime(selected.starts_at)}
        </h2>
        <p className="mt-1 text-[15px] text-muted-foreground">
          {selected.customer_phone} • with {selected.staff_name}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <OutlineAction onClick={() => openReschedule(selected)}>
            Reschedule
          </OutlineAction>
          <a
            href={waMeLink(selected.customer_phone)}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center justify-center rounded-[18px] border border-border bg-card px-3 text-[18px] text-foreground hover:bg-muted"
          >
            Message
          </a>
          <OutlineAction
            onClick={() => askNoShow(selected)}
            disabled={new Date(selected.starts_at).getTime() > now}
          >
            No-show
          </OutlineAction>
          <DangerAction onClick={() => askCancel(selected)}>Cancel</DangerAction>
        </div>
      </div>
    </div>
  ) : null;

  const closedState = closedDay ? (
    <div className="rounded-[20px] border border-border bg-card p-8 text-center">
      <p className="text-[16px] text-foreground">{closedMessage}</p>
    </div>
  ) : null;

  const emptyState =
    !closedDay && bookings.length === 0 ? (
      <div className="rounded-[20px] border border-dashed border-border bg-card p-8 text-center">
        <p className="text-[16px] text-foreground">No bookings yet.</p>
        <AddButton
          onClick={() => openAdd()}
          label="+ Add booking"
          className="mt-4"
        />
      </div>
    ) : null;

  const tabletSection = (
    <div className="hidden px-6 pt-6 md:block lg:hidden">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <DayChevron direction="prev" onClick={() => shiftDay(-1)} />
          <button
            type="button"
            onClick={() => setDatePickerOpen(true)}
            aria-label="Pick a day"
            className={cn("rounded-[12px] text-left", focusRing)}
          >
            <h1 className="whitespace-nowrap font-serif text-[28px] leading-tight text-foreground">
              {titleShort}
            </h1>
          </button>
          <DayChevron direction="next" onClick={() => shiftDay(1)} />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!isToday && <TodayButton onClick={() => goToDate(todayKey)} />}
          <AddButton onClick={() => openAdd()} label="+ Add booking" />
        </div>
      </div>
      <div className="mt-4 border-b border-border" />

      {isNavigating ? (
        <div className="mt-6">
          <SkeletonList />
        </div>
      ) : (
        <div className="mt-6 flex gap-3">
          <div className="flex min-w-0 flex-1 gap-3 overflow-x-auto pb-2">
            {staff.map((member) => {
              const memberBookings = bookingsByStaff.get(member.id) ?? [];
              return (
                <div key={member.id} className="w-[235px] shrink-0">
                  <div className="mb-[10px] text-[16px] font-medium text-foreground">
                    {member.name}
                  </div>
                  <div className="space-y-2">
                    {memberBookings.map((booking) => (
                      <button
                        key={booking.id}
                        type="button"
                        onClick={() => setSelectedId(booking.id)}
                        className={cn(
                          "flex h-[45px] w-full items-center rounded-[16px] border px-3 text-left text-[16px] truncate",
                          booking.status === "confirmed"
                            ? "border-primary/25 bg-blush text-foreground"
                            : "border-warning bg-warning-bg text-foreground",
                          focusRing
                        )}
                      >
                        {formatCardTime(booking.starts_at)} •{" "}
                        {shortName(booking.customer_name)} •{" "}
                        {booking.status === "confirmed" ? "Paid" : "Pending"}
                      </button>
                    ))}
                    {memberBookings.length === 0 && !closedDay && (
                      <button
                        key="add"
                        type="button"
                        onClick={() => openAdd(member.id)}
                        aria-label={`Add a booking for ${member.name}`}
                        className={cn(
                          "flex h-[45px] w-full items-center justify-center rounded-[16px] border border-dashed border-border text-muted-foreground hover:bg-muted",
                          focusRing
                        )}
                      >
                        <Plus className="size-5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {selected && (
            <div className="w-[234px] shrink-0">
              <div className="rounded-[24px] border border-border bg-card p-[17px]">
                <h2 className="font-serif text-[20px] text-foreground">
                  Booking details
                </h2>
                <p className="mt-2 text-[15px] leading-snug text-muted-foreground">
                  {shortName(selected.customer_name)} • {selected.service_name}{" "}
                  • {moneyLine(selected)}
                </p>
                <div className="mt-4 flex gap-2">
                  <OutlineAction
                    onClick={() => openReschedule(selected)}
                    className="h-10 flex-1 rounded-[16px] text-[15px]"
                  >
                    Reschedule
                  </OutlineAction>
                  <DangerAction
                    onClick={() => askCancel(selected)}
                    className="h-10 flex-1 rounded-[16px] border border-danger bg-card text-[15px] text-danger hover:bg-card"
                  >
                    Cancel
                  </DangerAction>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const desktopSection = (
    <div className="hidden px-8 pt-9 lg:block">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <DayChevron direction="prev" onClick={() => shiftDay(-1)} />
            <button
              type="button"
              onClick={() => setDatePickerOpen(true)}
              aria-label="Pick a day"
              className={cn("rounded-[12px] text-left", focusRing)}
            >
              <h1 className="whitespace-nowrap font-serif text-[36px] leading-tight text-foreground">
                {title}
              </h1>
            </button>
            <DayChevron direction="next" onClick={() => shiftDay(1)} />
          </div>
          <p className="mt-1 text-[16px] text-muted-foreground">{weekLabel}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!isToday && <TodayButton onClick={() => goToDate(todayKey)} />}
          <button
            type="button"
            onClick={() => setDatePickerOpen(true)}
            className={cn(
              "flex h-11 w-[131px] items-center justify-center gap-2 rounded-[16px] border border-border bg-card px-4 text-[16px] text-foreground hover:bg-muted",
              focusRing
            )}
          >
            <CalendarIcon className="size-5" />
            Day • Week
          </button>
          <AddButton onClick={() => openAdd()} label="+ Add booking" />
        </div>
      </div>

      {isNavigating ? (
        <div className="mt-[22px]">
          <SkeletonList />
        </div>
      ) : (
        <div
          className="mt-[22px] grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${staff.length + 1}, minmax(0, 1fr))`,
          }}
        >
          <div className="flex flex-col gap-2 pt-[36px]" aria-hidden="true">
            {hourLabels.map((label) => (
              <div
                key={label}
                className="flex h-[72px] items-start pt-3 text-[15px] text-muted-foreground"
              >
                {label}
              </div>
            ))}
          </div>

          {staff.map((member) => {
            const memberBookings = bookingsByStaff.get(member.id) ?? [];
            return (
              <div key={member.id}>
                <div className="mb-[10px] text-[17px] font-medium text-foreground">
                  {member.name}
                </div>
                <div className="flex flex-col gap-2">
                  {memberBookings.map((booking) => (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => setSelectedId(booking.id)}
                      className={cn(
                        "flex h-[64px] w-full items-center truncate rounded-[20px] border px-3 text-left text-[16px]",
                        booking.status === "confirmed"
                          ? "border-primary/25 bg-blush text-foreground"
                          : "border-warning bg-warning-bg text-foreground",
                        focusRing
                      )}
                    >
                      {formatCardTime(booking.starts_at)} {shortName(booking.customer_name)}
                    </button>
                  ))}
                  {!closedDay && (
                    <button
                      type="button"
                      onClick={() => openAdd(member.id)}
                      aria-label={`Add a booking for ${member.name}`}
                      className={cn(
                        "flex h-[64px] w-full items-center justify-center rounded-[20px] border border-dashed border-border text-muted-foreground hover:bg-muted",
                        focusRing
                      )}
                    >
                      <Plus className="size-6" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {closedState}
      {emptyState}
    </div>
  );

  const mobileClosedAndEmpty = (
    <div className="px-4 md:hidden">
      {closedState}
      {emptyState}
    </div>
  );

  return (
    <div className="lg:flex">
      <div className="min-w-0 flex-1">
        {mobileBand}
        {mobileTabs}
        {mobileList}
        {mobileSelectedCard}
        {mobileClosedAndEmpty}
        {tabletSection}
        {desktopSection}
      </div>

      {selected && isXl && (
        <aside className="sticky top-0 hidden h-dvh w-[320px] shrink-0 overflow-y-auto border-l border-border px-6 py-6 xl:block">
          <DetailsContent
            booking={selected}
            onClose={() => setSelectedId(null)}
            onReschedule={() => openReschedule(selected)}
            onNoShow={() => askNoShow(selected)}
            onCancel={() => askCancel(selected)}
          />
        </aside>
      )}

      <Sheet
        open={!!selected && !isXl}
        onOpenChange={(open) => !open && setSelectedId(null)}
      >
        <SheetContent side="right" showCloseButton={false} className="w-full sm:max-w-sm">
          {selected && (
            <DetailsContent
              booking={selected}
              onClose={() => setSelectedId(null)}
              onReschedule={() => openReschedule(selected)}
              onNoShow={() => askNoShow(selected)}
              onCancel={() => askCancel(selected)}
            />
          )}
        </SheetContent>
      </Sheet>

      <AddBookingDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        dateKey={dateKey}
        services={services}
        staff={staff}
        serviceStaffMap={serviceStaffMap}
        staffServiceMap={staffServiceMap}
        preselectStaffId={addStaffId}
      />

      <RescheduleDialog
        booking={rescheduleBooking}
        onOpenChange={(open) => !open && setRescheduleBooking(null)}
      />

      <ConfirmActionDialog
        confirm={confirm}
        actionPending={actionPending}
        error={confirmError}
        onClose={() => setConfirm(null)}
        onRun={runConfirm}
      />

      <DatePickerDialog
        open={datePickerOpen}
        onOpenChange={setDatePickerOpen}
        dateKey={dateKey}
        onPick={goToDate}
      />
    </div>
  );
}
