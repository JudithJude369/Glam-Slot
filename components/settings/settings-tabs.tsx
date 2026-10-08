"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "cn";

const TABS = ["Services", "Staff & hours", "Reminders"] as const;

export function SettingsTabs({
  servicesPanel,
  staffPanel,
  remindersPanel,
}: {
  servicesPanel: React.ReactNode;
  staffPanel: React.ReactNode;
  remindersPanel: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const panel = [servicesPanel, staffPanel, remindersPanel][active];

  return (
    <div data-testid="settings-tabs">
      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            id={`settings-tab-${idx}`}
            type="button"
            role="tab"
            aria-selected={idx === active}
            aria-controls={`settings-panel-${idx}`}
            onClick={() => setActive(idx)}
            className={cn(
              "rounded-[16px] border px-5 py-2 text-[15px] font-medium transition-colors",
              idx === active
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-muted",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        id={`settings-panel-${active}`}
        role="tabpanel"
        aria-labelledby={`settings-tab-${active}`}
        className="mt-5"
      >
        {panel}
      </div>
    </div>
  );
}

export function useSettingsRefresh() {
  const router = useRouter();
  return () => router.refresh();
}