import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar — GlamSlot",
};

export default function DashboardPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-3xl text-foreground">Calendar</h1>
        <p className="mt-3 text-muted-foreground">
          The owner calendar is coming in Phase 9. For now, use Settings to manage services, staff and reminders.
        </p>
      </div>
    </div>
  );
}
