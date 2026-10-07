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

      {/* Mobile + tablet: single panel */}
      <div className="mt-5 lg:hidden">{panel}</div>

      {/* Desktop: two-column grid, always visible */}
      <div className="mt-5 hidden lg:grid lg:grid-cols-2 lg:gap-5">
        {servicesPanel}
        <div className="flex flex-col gap-5">
          {staffPanel}
          {remindersPanel}
        </div>
      </div>
    </div>
  );
}

export function useSettingsRefresh() {
  const router = useRouter();
  return () => router.refresh();
}