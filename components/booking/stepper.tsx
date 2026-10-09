"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  currentStep: 1 | 2 | 3;
  className?: string;
}

const steps = [
  { number: 1, label: "Service" },
  { number: 2, label: "Date & Time" },
  { number: 3, label: "Details" },
] as const;

export function Stepper({ currentStep, className }: StepperProps) {
  return (
    <div className={cn("flex items-start gap-4 md:max-w-[550px] md:ml-4", className)}>
      {steps.map((step, index) => {
        const isDone = step.number < currentStep;
        const isActive = step.number === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.number} className="flex flex-col items-center flex-1">
            <div className="relative flex items-center">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  isDone
                    ? "bg-success text-primary-foreground"
                    : isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isDone ? <Check className="h-5 w-5" /> : step.number}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-full top-[6px] w-full h-[2px] -ml-1",
                    isDone ? "bg-success" : "bg-border"
                  )}
                />
              )}
            </div>
            <p
              className={cn(
                "mt-2 text-center text-xs font-medium",
                isDone
                  ? "text-success"
                  : isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}