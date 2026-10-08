import { Metadata } from "next";
import { getServices, getStaffWithHours, getReminderSettings } from "@/lib/actions/settings";
import { ServicesTabClient } from "@/components/settings/services-tab";
import { StaffTabClient } from "@/components/settings/staff-tab";
import { RemindersPanel } from "@/components/settings/reminders-tab";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export const metadata: Metadata = {
  title: "Settings — GlamSlot",
};

export default async function SettingsPage() {
  const services = await getServices();
  const staffWithHours = await getStaffWithHours();
  const reminderSettings = await getReminderSettings();

  return (
    <div className="mx-auto max-w-[936px] px-4 py-5 md:px-6 lg:px-8">
      {/* Mobile + tablet: plum header band */}
      <div className="relative -mx-4 -mt-5 mb-4 flex h-[76px] items-center bg-plum px-5 lg:hidden">
        <div>
          <h1 className="font-serif text-[24px] text-background">Settings</h1>
          <p className="text-[14px] text-background/70">Services • Staff • Reminders</p>
        </div>
      </div>

      <h1 className="hidden font-serif text-[36px] text-foreground lg:block">Settings</h1>
      <p className="mt-1 hidden text-[15px] text-muted-foreground lg:block">
        Services, team, hours and WhatsApp reminders
      </p>

      <SettingsTabs
        servicesPanel={<ServicesTabClient services={services} />}
        staffPanel={<StaffTabClient staffWithHours={staffWithHours} />}
        remindersPanel={<RemindersPanel settings={reminderSettings} />}
      />
    </div>
  );
}