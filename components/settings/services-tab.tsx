"use client";

import { useState, useTransition } from "react";
import { ChevronRight, Check, X } from "lucide-react";
import { koboToNaira, formatDuration } from "@/lib/money";
import { saveService, toggleService, type ServiceFormData } from "@/lib/actions/settings";
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

type Service = Database["public"]["Tables"]["services"]["Row"];

const emptyForm: ServiceFormData = {
  name: "",
  duration_minutes: 60,
  price_kobo: 0,
  deposit_kobo: 0,
  is_active: true,
  sort_order: 0,
};

function ServiceForm({
  service,
  onClose,
}: {
  service?: Service;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceFormData>({
    ...emptyForm,
    ...(service
      ? {
          id: service.id,
          name: service.name,
          duration_minutes: service.duration_minutes,
          price_kobo: service.price_kobo,
          deposit_kobo: service.deposit_kobo,
          is_active: service.is_active,
          sort_order: service.sort_order,
        }
      : {}),
  });

  const depositPct = form.price_kobo > 0 ? Math.round((form.deposit_kobo / form.price_kobo) * 100) : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveService(form);
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min={5}
            max={600}
            value={form.duration_minutes}
            onChange={(e) =>
              setForm({ ...form, duration_minutes: Number(e.target.value) })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price (₦)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step={100}
            value={form.price_kobo / 100}
            onChange={(e) => {
              const kobo = Math.round(Number(e.target.value) * 100);
              const defaultDeposit = Math.round(kobo * 0.3);
              setForm({
                ...form,
                price_kobo: kobo,
                deposit_kobo:
                  form.deposit_kobo > kobo ? kobo : form.deposit_kobo || defaultDeposit,
              });
            }}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deposit">Deposit (₦) — default 30%</Label>
        <Input
          id="deposit"
          type="number"
          min={0}
          max={form.price_kobo}
          step={100}
          value={form.deposit_kobo / 100}
          onChange={(e) =>
            setForm({
              ...form,
              deposit_kobo: Math.min(
                Math.round(Number(e.target.value) * 100),
                form.price_kobo,
              ),
            })
          }
          required
        />
        {form.price_kobo > 0 && (
          <p className="text-xs text-muted-foreground">
            {depositPct}% of price
          </p>
        )}
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

export function ServicesTabClient({ services }: { services: Service[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  return (
    <div data-testid="services-tab">
      {/* Mobile: stacked cards */}
      <div data-testid="services-tab-mobile" className="space-y-2 lg:hidden">
        {services.map((svc) => (
          <Dialog key={svc.id} open={dialogOpen && editing?.id === svc.id} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditing(null); }}}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => { setEditing(svc); setDialogOpen(true); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setEditing(svc); setDialogOpen(true); }}}
              className="flex items-center justify-between rounded-[22px] border border-border bg-card p-4 active:bg-muted"
            >
              <div>
                <p className="text-[17px] font-medium text-foreground">{svc.name}</p>
                <p className="mt-1 text-[15px] text-muted-foreground">
                  {formatDuration(svc.duration_minutes)} • {koboToNaira(svc.deposit_kobo)} dep
                </p>
              </div>
              <ChevronRight className="size-5 text-foreground" />
            </div>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit service</DialogTitle>
              </DialogHeader>
              <ServiceForm service={svc} onClose={() => { setDialogOpen(false); setEditing(null); }} />
            </DialogContent>
          </Dialog>
        ))}

        {/* Add form mobile */}
        <div className="rounded-[22px] border border-dashed border-border bg-card p-4">
          <p className="text-[15px] text-muted-foreground">
            Add service: name, price, duration, deposit
          </p>
          <Dialog open={dialogOpen && !editing} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
            <DialogTrigger asChild>
              <Input
                placeholder="e.g. Bridal Updo • ₦85,000 • 90 min"
                className="mt-3 h-[47px] rounded-[16px] border border-border bg-input px-3 text-[16px]"
                readOnly
              />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add service</DialogTitle>
              </DialogHeader>
              <ServiceForm onClose={() => { setDialogOpen(false); setEditing(null); }} />
            </DialogContent>
          </Dialog>
          <Button
            className="mt-3 h-[47px] w-full rounded-[16px] text-[16px] font-medium"
            onClick={() => { setEditing(null); setDialogOpen(true); }}
          >
            + Add service
          </Button>
        </div>
      </div>

      {/* Tablet: 2-column cards */}
      <div data-testid="services-tab-tablet" className="hidden md:block lg:hidden">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[16px] font-medium text-foreground">Services</h3>
          <Button
            size="sm"
            className="h-[44px] rounded-[16px] px-5 text-[15px]"
            onClick={() => { setEditing(null); setDialogOpen(true); }}
          >
            + Add service
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="rounded-[24px] border border-border bg-card p-4"
            >
              <p className="text-[16px] font-medium text-foreground">{svc.name}</p>
              <p className="mt-1 text-[14px] text-muted-foreground">
                {formatDuration(svc.duration_minutes)} • {koboToNaira(svc.deposit_kobo)} deposit
              </p>
              <div className="mt-3 flex gap-2">
                <Dialog open={dialogOpen && editing?.id === svc.id} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditing(null); }}}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-[40px] flex-1 rounded-[14px] border border-border text-[14px] text-foreground"
                      onClick={() => { setEditing(svc); setDialogOpen(true); }}
                    >
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit service</DialogTitle>
                    </DialogHeader>
                    <ServiceForm service={svc} onClose={() => { setDialogOpen(false); setEditing(null); }} />
                  </DialogContent>
                </Dialog>
                <form action={toggleService.bind(null, svc.id, !svc.is_active)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-[40px] flex-1 rounded-[14px] border border-border text-[14px] text-foreground"
                  >
                    {svc.is_active ? "Off" : "On"}
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: list card */}
      <div data-testid="services-tab-desktop" className="hidden lg:block">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-medium text-foreground">
            {services.length} service{services.length === 1 ? "" : "s"}
          </h3>
          <Dialog open={dialogOpen && !editing} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto p-0 text-[16px] font-medium text-primary hover:text-primary/80"
                onClick={() => setEditing(null)}
              >
                + Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add service</DialogTitle>
              </DialogHeader>
              <ServiceForm onClose={() => { setDialogOpen(false); setEditing(null); }} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-2 rounded-[24px] border border-border bg-card">
          {services.map((svc, idx) => (
            <div
              key={svc.id}
              className={cn(
                "flex items-center justify-between px-5 py-[13px]",
                idx < services.length - 1 && "border-b border-border",
              )}
            >
              <Dialog open={dialogOpen && editing?.id === svc.id} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditing(null); }}}>
                <DialogTrigger asChild>
                  <button
                    className="flex-1 text-left"
                    onClick={() => setEditing(svc)}
                  >
                    <p className="text-[16px] text-foreground">{svc.name}</p>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit service</DialogTitle>
                  </DialogHeader>
                  <ServiceForm service={svc} onClose={() => { setDialogOpen(false); setEditing(null); }} />
                </DialogContent>
              </Dialog>
              <span className="text-[16px] text-muted-foreground">
                {formatDuration(svc.duration_minutes)} • {koboToNaira(svc.deposit_kobo)} dep
              </span>
            </div>
          ))}
          {services.length === 0 && (
            <p className="p-5 text-center text-muted-foreground">No services yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
