"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { saveReminderSettings } from "@/lib/actions/settings";
import type { Database } from "@/lib/database.types";

type ReminderSettings = Database["public"]["Tables"]["reminder_settings"]["Row"];

function RemindersPanel({ settings }: { settings: ReminderSettings | null }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const chips = settings
    ? [
        {
          label: "24h before • ON",
          enabled: settings.reminder_24h_enabled,
        },
        {
          label: "2h before • ON",
          enabled: settings.reminder_2h_enabled,
        },
      ]
    : [];

  function toggleChip(index: number) {
    if (!settings) return;
    const key =
      index === 0 ? "reminder_24h_enabled" : "reminder_2h_enabled";
    const next = { ...settings, [key]: !settings[key] };
    startTransition(async () => {
      await saveReminderSettings(next);
      router.refresh();
    });
  }

  function save() {
    if (!settings) return;
    startTransition(async () => {
      await saveReminderSettings(settings);
      router.refresh();
    });
  }

  return (
    <div className="rounded-[24px] border border-border bg-card p-5">
      <h3 className="text-[16px] font-medium text-foreground">WhatsApp reminders</h3>

      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((chip, idx) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => toggleChip(idx)}
            className={cn(
              "rounded-full px-3 py-1 text-[14px] transition-colors",
              chip.enabled
                ? "bg-success text-success-foreground"
                : "border border-border bg-card text-foreground",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-[14px] bg-blush p-3">
        <p className="text-[15px] text-foreground">
          Hi Maria! Reminder: Gel Manicure tomorrow 10:30 AM with Amara. Reply YES to confirm.
        </p>
      </div>

      <p className="mt-3 text-[14px] text-muted-foreground">
        Confirmation, 24h and 2h reminders are enabled.
      </p>

      <Button
        className="mt-4 w-full rounded-[16px] bg-plum text-[16px] font-medium text-background hover:bg-plum/90"
        disabled={pending || !settings}
        onClick={save}
      >
        {pending ? "Saving..." : "Save settings"}
      </Button>
    </div>
  );
}

export { RemindersPanel };