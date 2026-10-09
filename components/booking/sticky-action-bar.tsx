"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StickyActionBarProps {
  onBack: () => void;
  onContinue: () => void;
  depositAmount: string;
  isBackDisabled?: boolean;
  isContinueDisabled?: boolean;
  continueText?: string;
}

export function StickyActionBar({
  onBack,
  onContinue,
  depositAmount,
  isBackDisabled = false,
  isContinueDisabled = false,
  continueText,
}: StickyActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background px-5 py-3 pb-safe md:hidden">
      <div className="mx-auto flex max-w-[1120px] items-center gap-2">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isBackDisabled}
          className="h-13 w-[110px] rounded-[18px] text-base"
        >
          Back
        </Button>
        <Button
          onClick={onContinue}
          disabled={isContinueDisabled}
          className="flex-1 h-13 rounded-[18px] text-base"
        >
          {continueText || `Continue • ${depositAmount} deposit`}
        </Button>
      </div>
    </div>
  );
}