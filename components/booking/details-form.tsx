"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useState } from "react";

interface DetailsFormProps {
  name: string;
  onNameChange: (name: string) => void;
  nameError?: string;
  phone: string;
  onPhoneChange: (phone: string) => void;
  phoneError?: string;
  wantsReminders: boolean;
  onRemindersChange: (value: boolean) => void;
  depositAmount: string;
  isMobile?: boolean;
}

export function DetailsForm({
  name,
  onNameChange,
  nameError,
  phone,
  onPhoneChange,
  phoneError,
  wantsReminders,
  onRemindersChange,
  depositAmount,
  isMobile = false,
}: DetailsFormProps) {
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const showNameError = nameTouched && nameError;
  const showPhoneError = phoneTouched && phoneError;

  return (
    <div className="rounded-[24px] border bg-card p-5">
      <h3 className="font-serif text-xl font-semibold text-foreground">
        {isMobile ? "Your details" : "Details"}
      </h3>

      <div className="mt-4 space-y-3">
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={() => setNameTouched(true)}
            placeholder="Full name"
            className={cn(
              "flex h-12 w-full rounded-[16px] border bg-input px-4 text-base text-foreground placeholder:text-foreground transition-colors",
              showNameError ? "border-danger" : "border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            )}
            aria-label="Full name"
            aria-invalid={showNameError ? "true" : "false"}
            aria-describedby={showNameError ? "name-error" : undefined}
          />
          {showNameError && (
            <p id="name-error" className="mt-1.5 flex items-center gap-2 text-sm text-danger">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger/10">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
              </span>
              {nameError}
            </p>
          )}
        </div>

        <div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            onBlur={() => setPhoneTouched(true)}
            placeholder="WhatsApp number"
            className={cn(
              "flex h-12 w-full rounded-[16px] border bg-input px-4 text-base text-foreground placeholder:text-foreground transition-colors",
              showPhoneError ? "border-danger" : "border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            )}
            aria-label="WhatsApp number"
            aria-invalid={showPhoneError ? "true" : "false"}
            aria-describedby={showPhoneError ? "phone-error" : undefined}
          />
          {showPhoneError && (
            <p id="phone-error" className="mt-1.5 flex items-center gap-2 text-sm text-danger">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger/10">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
              </span>
              {phoneError}
            </p>
          )}
        </div>

        <label className="flex items-start gap-3 rounded-[16px] border-1.5 border-primary bg-blush p-3 cursor-pointer">
          <button
            type="button"
            onClick={() => onRemindersChange(!wantsReminders)}
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors",
              wantsReminders
                ? "bg-primary border-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/50"
            )}
            aria-pressed={wantsReminders}
          >
            {wantsReminders && <Check className="h-3.5 w-3.5" />}
          </button>
          <span className="text-base text-foreground leading-relaxed">
            Send me WhatsApp reminders (24h + 2h before)
          </span>
        </label>
      </div>
    </div>
  );
}