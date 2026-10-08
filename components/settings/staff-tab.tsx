"use client";

import { useState, useTransition } from "react";
import { ChevronRight, Check, X, UserPlus } from "lucide-react";
import { formatStaffHoursText, formatStaffRowText, formatStaffStatusText } from "@/lib/format";
import { saveStaff, toggleStaff, saveStaffHours, type StaffFormData, type StaffHoursFormData } from "@/lib/actions/settings";
import type { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "cn";

type Staff = Database["public"]["Tables"]["staff"]["Row"];
type StaffHours = Database["public"]["Tables"]["staff_hours"]["Row"];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON_TO_SUN = [1, 2, 3, 4, 5, 6, 0];
const TIME_OPTIONS = Array.from({ length: 24 * 12 }, (_, i) => {
  const h = Math.floor(i / 12);
  const m = (i % 12) * 5;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

const emptyStaffForm: StaffFormData = {
  name: "",
  role: "",
  bio: "",
  photo_url: "",
  is_active: true,
  sort_order: 0,
};

const defaultHours = (weekday: number): StaffHoursFormData => ({
  weekday,
  is_closed: weekday === 1,
  opens_at: "09:00",
  closes_at: "19:00",
});

function StaffForm({
  staff,
  onClose,
}: {
  staff?: Staff;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<StaffFormData>({
    ...emptyStaffForm,
    ...(staff
      ? {
          id: staff.id,
          name: staff.name,
          role: staff.role ?? "",
          bio: staff.bio ?? "",
          photo_url: staff.photo_url ?? "",
          is_active: staff.is_active,
          sort_order: staff.sort_order,
        }
      : {}),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveStaff(form);
      if (result.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          placeholder="e.g. Colorist, Nails"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="h-24 w-full rounded-[16px] border border-border bg-input px-3 py-2 text-[16px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Optional short bio"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="photo_url">Photo URL</Label>
        <Input
          id="photo_url"
          value={form.photo_url}
          onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="active" className="cursor-pointer">
          {form.is_active ? "Active" : "Inactive"}
        </Label>
        <button
          type="button"
          id="active"
          onClick={() => setForm({ ...form, is_active: !form.is_active })}
          className={cn(
            "flex size-10 items-center justify-center rounded-full border transition-colors",
            form.is_active ? "border-success bg-success/10" : "border-border",
          )}
        >
          {form.is_active ? (
            <Check className="size-5 text-success" />
          ) : (
            <X className="size-5 text-muted-foreground" />
          )}
        </button>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}

function StaffHoursForm({
  staff,
  hours,
  onClose,
}: {
  staff: Staff;
  hours: StaffHours[];
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<StaffHoursFormData[]>(
    hours.length === 7
      ? hours.map((h) => ({
          weekday: h.weekday,
          is_closed: h.is_closed,
          opens_at: h.opens_at.slice(0, 5),
          closes_at: h.closes_at.slice(0, 5),
        }))
      : MON_TO_SUN.map(defaultHours)
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveStaffHours(staff.id, form);
      if (result.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  function updateDay(weekday: number, field: keyof StaffHoursFormData, value: string | boolean) {
    setForm((prev) =>
      prev.map((d) => (d.weekday === weekday ? { ...d, [field]: value } : d))
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <div className="space-y-3">
        {MON_TO_SUN.map((weekday) => {
          const day = form.find((d) => d.weekday === weekday)!;
          const dayName = WEEKDAYS[weekday];
          return (
            <div
              key={weekday}
              className="flex items-center gap-3 rounded-[16px] border border-border bg-card p-3"
            >
              <span className="w-[55px] text-[15px] font-medium text-foreground">{dayName}</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={day.is_closed}
                  onChange={(e) => updateDay(weekday, "is_closed", e.target.checked)}
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-[15px] text-foreground">Closed</span>
              </label>
              {!day.is_closed && (
                <>
                  <span className="text-muted-foreground">Opens</span>
                  <select
                    value={day.opens_at}
                    onChange={(e) => updateDay(weekday, "opens_at", e.target.value)}
                    className="h-9 w-[110px] rounded-[12px] border border-input bg-background px-2 text-[15px]"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
<span className="text-muted-foreground">Closes</span>
                  <select
                    value={day.closes_at}
                    onChange={(e) => updateDay(weekday, "closes_at", e.target.value)}
                    className="h-9 w-[110px] rounded-[12px] border border-input bg-background px-2 text-[15px]"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save hours"}
        </Button>
      </div>
    </form>
  );
}

export function StaffTabClient({ staffWithHours }: { staffWithHours: Array<Staff & { hours: StaffHours[] }> }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editingHours, setEditingHours] = useState<Staff | null>(null);

  return (
    <div data-testid="staff-tab">
      {/* Mobile: stacked cards */}
      <div data-testid="staff-tab-mobile" className="space-y-2 lg:hidden">
        {staffWithHours.map((staff) => (
          <Dialog key={staff.id} open={dialogOpen && (editingStaff?.id === staff.id || editingHours?.id === staff.id)} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingStaff(null); setEditingHours(null); }}}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => { setEditingStaff(staff); setDialogOpen(true); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setEditingStaff(staff); setDialogOpen(true); }}}
              className="flex items-center justify-between rounded-[22px] border border-border bg-card p-4 active:bg-muted"
            >
              <div>
                <p className="text-[17px] font-medium text-foreground">
                  {formatStaffRowText({ name: staff.name, role: staff.role ?? "", hours: staff.hours })}
                </p>
                <p className="mt-1 text-[15px] text-muted-foreground">
                  {formatStaffHoursText(staff.hours)}
                </p>
              </div>
              <ChevronRight className="size-5 text-foreground" />
            </div>
            <DialogContent className="max-w-[90vw]">
              <DialogHeader>
                <DialogTitle>Edit {staff.name}</DialogTitle>
              </DialogHeader>
              <StaffForm staff={staff} onClose={() => { setDialogOpen(false); setEditingStaff(null); }} />
            </DialogContent>
          </Dialog>
        ))}

        {/* Add staff form mobile */}
        <Dialog open={dialogOpen && !editingStaff && !editingHours} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingStaff(null); setEditingHours(null); }}}>
          <DialogTrigger asChild>
            <div className="rounded-[22px] border border-dashed border-border bg-card p-4">
              <div className="flex items-center gap-2 text-[15px] text-muted-foreground">
                <UserPlus className="size-5" />
                Add staff: name, role, bio, photo
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw]">
            <DialogHeader>
              <DialogTitle>Add staff</DialogTitle>
            </DialogHeader>
            <StaffForm onClose={() => { setDialogOpen(false); setEditingStaff(null); }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tablet: 2-column cards */}
      <div data-testid="staff-tab-tablet" className="hidden md:block lg:hidden">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[16px] font-medium text-foreground">Staff & hours</h3>
          <Dialog open={dialogOpen && !editingStaff && !editingHours} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingStaff(null); setEditingHours(null); }}}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="h-[44px] rounded-[16px] px-5 text-[15px]"
                onClick={() => { setEditingStaff(null); setDialogOpen(true); }}
              >
                + Add staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw]">
              <DialogHeader>
                <DialogTitle>Add staff</DialogTitle>
              </DialogHeader>
              <StaffForm onClose={() => { setDialogOpen(false); setEditingStaff(null); }} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {staffWithHours.map((staff) => (
            <div key={staff.id} className="rounded-[24px] border border-border bg-card p-4">
              <p className="text-[16px] font-medium text-foreground">
                {formatStaffRowText({ name: staff.name, role: staff.role ?? "", hours: staff.hours })}
              </p>
              <p className="mt-1 text-[14px] text-muted-foreground">
                {formatStaffHoursText(staff.hours)}
              </p>
              <div className="mt-3 flex gap-2">
                <Dialog open={dialogOpen && editingStaff?.id === staff.id} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingStaff(null); }}}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-[40px] flex-1 rounded-[14px] border border-border text-[14px] text-foreground"
                      onClick={() => { setEditingStaff(staff); setDialogOpen(true); }}
                    >
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw]">
                    <DialogHeader>
                      <DialogTitle>Edit {staff.name}</DialogTitle>
                    </DialogHeader>
                    <StaffForm staff={staff} onClose={() => { setDialogOpen(false); setEditingStaff(null); }} />
                  </DialogContent>
                </Dialog>
                <Dialog open={dialogOpen && editingHours?.id === staff.id} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingHours(null); }}}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-[40px] flex-1 rounded-[14px] border border-border text-[14px] text-foreground"
                      onClick={() => { setEditingHours(staff); setDialogOpen(true); }}
                    >
                      Hours
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle>Hours for {staff.name}</DialogTitle>
                    </DialogHeader>
                    <StaffHoursForm staff={staff} hours={staff.hours} onClose={() => { setDialogOpen(false); setEditingHours(null); }} />
                  </DialogContent>
                </Dialog>
                <form action={toggleStaff.bind(null, staff.id, !staff.is_active)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-[40px] flex-1 rounded-[14px] border border-border text-[14px] text-foreground"
                  >
                    {staff.is_active ? "Off" : "On"}
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: editable staff rows */}
      <div data-testid="staff-tab-desktop" className="hidden lg:block">
        <div className="rounded-[24px] border border-border bg-card p-5">
          <h3 className="text-[16px] font-medium text-foreground">
            Staff & hours • {formatStaffHoursText(staffWithHours[0]?.hours ?? [])}
          </h3>
          <div className="mt-3 flex flex-col gap-2">
            {staffWithHours.map((staff, idx) => (
              <div
                key={staff.id}
                className={cn(
                  "flex items-center justify-between rounded-[16px] border border-border px-3 py-2",
                  idx < staffWithHours.length - 1 && "mb-2",
                )}
              >
                <span className="text-[16px] text-foreground">
                  {formatStaffRowText({ name: staff.name, role: staff.role ?? "", hours: staff.hours })}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[14px]">
                    {formatStaffStatusText(staff.hours) === "Active" ? (
                      <span className="text-success">Active</span>
                    ) : (
                      <span className="text-muted-foreground">{formatStaffStatusText(staff.hours)}</span>
                    )}
                  </span>
                  <Dialog
                    open={dialogOpen && editingStaff?.id === staff.id}
                    onOpenChange={(open) => {
                      if (!open) {
                        setDialogOpen(false);
                        setEditingStaff(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-[12px] border-border px-3"
                        onClick={() => {
                          setEditingStaff(staff);
                          setEditingHours(null);
                          setDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw]">
                      <DialogHeader>
                        <DialogTitle>Edit {staff.name}</DialogTitle>
                      </DialogHeader>
                      <StaffForm
                        staff={staff}
                        onClose={() => {
                          setDialogOpen(false);
                          setEditingStaff(null);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                  <Dialog
                    open={dialogOpen && editingHours?.id === staff.id}
                    onOpenChange={(open) => {
                      if (!open) {
                        setDialogOpen(false);
                        setEditingHours(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-[12px] border-border px-3"
                        onClick={() => {
                          setEditingHours(staff);
                          setEditingStaff(null);
                          setDialogOpen(true);
                        }}
                      >
                        Hours
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw] max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle>Hours for {staff.name}</DialogTitle>
                      </DialogHeader>
                      <StaffHoursForm
                        staff={staff}
                        hours={staff.hours}
                        onClose={() => {
                          setDialogOpen(false);
                          setEditingHours(null);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
            {staffWithHours.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No staff yet.</p>
            )}
          </div>

          {/* Add staff: name, role, bio, photo. The mobile and tablet branches
              each carry their own add affordance; desktop had none, so a new
              staff could only be added on the smaller screens. */}
          <Dialog
            open={dialogOpen && !editingStaff && !editingHours}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingStaff(null);
                setEditingHours(null);
              }
            }}
          >
            <div className="mt-3 flex justify-end">
              <DialogTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  className="h-[44px] rounded-[16px] px-5 text-[15px]"
                  onClick={() => {
                    setEditingStaff(null);
                    setEditingHours(null);
                    setDialogOpen(true);
                  }}
                >
                  + Add staff
                </Button>
              </DialogTrigger>
            </div>
            <DialogContent className="max-w-[90vw]">
              <DialogHeader>
                <DialogTitle>Add staff</DialogTitle>
              </DialogHeader>
              <StaffForm
                onClose={() => {
                  setDialogOpen(false);
                  setEditingStaff(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}