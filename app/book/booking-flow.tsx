"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { formatTime12, formatDuration, koboToNaira } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Stepper,
  ServiceCard,
  DatePicker,
  StaffSelector,
  TimeSlots,
  DetailsForm,
  BookingSummary,
  StickyActionBar,
  SlotTakenNotice,
} from "@/components/booking";

type Service = {
  id: string;
  name: string;
  duration: string;
  price: string;
  priceKobo: number;
  deposit: string;
  photo: string;
};

type Staff = {
  id: string;
  name: string;
  photo: string;
  roleDesktop: string;
  roleMobile: string;
  roleShort: string;
};

type Salon = {
  name: string;
  tagline: string;
  city: string;
  rating: string;
  reviewCount: string;
  address: string;
  addressShort: string;
  hours: string;
  hoursFooter: string;
  visitLine: string;
  closedNote: string;
  nearby: string;
  cancellation: string;
  cancellationShort: string;
  whatsappNumber: string;
  whatsappHref: string;
  phone: string;
  phoneHref: string;
};

interface BookingFlowProps {
  salon: Salon;
  services: Service[];
  staff: Staff[];
}

const MIN_DATE = new Date().toISOString().split("T")[0];
const MAX_DATE = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

export function BookingFlow({ salon, services, staff }: BookingFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(MIN_DATE);
  const [selectedStaffId, setSelectedStaffId] = useState<string | "any">("any");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<{
    start: string;
    end: string;
    startDisplay: string;
    staffId: string;
    staffName: string;
    isAvailable: boolean;
  }[]>([]);
  const [availableStaff, setAvailableStaff] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [showSlotTaken, setShowSlotTaken] = useState(false);
  const [takenSlotTime, setTakenSlotTime] = useState("");
  const [heldSlotTime, setHeldSlotTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [wantsReminders, setWantsReminders] = useState(true);
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const activeStaff = staff.filter((s) => s.id !== "any");

  const fetchSlots = useCallback(async () => {
    if (!selectedService) return;
    setIsLoadingSlots(true);
    try {
      const response = await fetch(
        `/api/availability?serviceId=${selectedService.id}&date=${selectedDate}&staffId=${selectedStaffId === "any" ? "" : selectedStaffId}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots);
        setAvailableStaff(data.availableStaff || []);
      }
    } catch (error) {
      console.error("Failed to fetch slots:", error);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedService, selectedDate, selectedStaffId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSlots();
  }, [fetchSlots]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(2);
    setSelectedSlot(null);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleStaffChange = (staffId: string | "any") => {
    setSelectedStaffId(staffId);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slotStart: string) => {
    const slot = availableSlots.find((s) => s.start === slotStart);
    if (slot && slot.isAvailable) {
      setSelectedSlot(slotStart);
    }
  };

  const handleContinue = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!selectedSlot) return;
      setStep(3);
    } else if (step === 3) {
      if (!name.trim()) {
        setNameError("Please enter your name");
        return;
      }
      if (!phone.trim()) {
        setPhoneError("Please enter your WhatsApp number");
        return;
      }

      setIsSubmitting(true);
      setSubmitError("");

      try {
        const response = await fetch("/api/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceId: selectedService?.id,
            staffId: selectedStaffId === "any" ? null : selectedStaffId,
            date: selectedDate,
            startTime: selectedSlot?.split("T")[1]?.slice(0, 5),
            customerName: name.trim(),
            customerPhone: phone.trim(),
            wantsReminders,
          }),
        });

        const data = await response.json();

        if (response.ok && data.bookingId) {
          window.location.href = `/book/pay/${data.bookingId}`;
        } else if (data.slotTaken) {
          setShowSlotTaken(true);
          setTakenSlotTime(data.takenSlotTime);
          setHeldSlotTime(data.heldSlotTime);
          setSelectedSlot(data.heldSlotStart);
          const heldSlot = availableSlots.find((s) => s.start === data.heldSlotStart);
          if (heldSlot) {
            setSelectedStaffId(heldSlot.staffId);
          }
        } else {
          setSubmitError(data.error || "Something went wrong. Please try again.");
        }
      } catch (error) {
        setSubmitError("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const dismissSlotTaken = () => {
    setShowSlotTaken(false);
  };

  const selectedSlotData = availableSlots.find((s) => s.start === selectedSlot);
  const depositAmount = selectedService ? `₦${(selectedService.priceKobo * 0.3 / 100).toLocaleString()}` : "₦0";
  const balanceAmount = selectedService ? `₦${(selectedService.priceKobo * 0.7 / 100).toLocaleString()}` : "₦0";

  const dateDisplay = selectedDate
    ? format(new Date(`${selectedDate}T00:00:00`), "EEE, MMM d")
    : "";
  const timeDisplay = selectedSlotData ? formatTime12(selectedSlotData.start) : "";
  const staffName = selectedSlotData
    ? `${selectedSlotData.staffName} (any available)`
    : selectedStaffId === "any"
    ? "Any available"
    : staff.find((s) => s.id === selectedStaffId)?.name || "Any available";

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const isTablet = typeof window !== "undefined" && window.innerWidth >= 768 && window.innerWidth < 1024;
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;

  if (!selectedService && step > 1) {
    setStep(1);
  }

  if (isMobile) {
    return (
      <div className="flex flex-col gap-6 pb-[120px]">
        <Stepper currentStep={step} />
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground">Pick a service</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleServiceSelect(service)}
                  className="relative flex flex-col items-start justify-between rounded-[20px] border bg-card p-4 transition-all hover:border-primary/50"
                >
                  <div>
                    <h3 className="font-serif text-base font-semibold text-foreground">{service.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {service.duration} • {service.deposit} deposit
                    </p>
                  </div>
                  <span className="mt-3 flex h-9 items-center justify-center rounded-[15px] border border-border bg-card px-3 text-sm font-medium text-foreground">
                    Select
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-5">
            <DatePicker
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              minDate={MIN_DATE}
              maxDate={MAX_DATE}
              showArrows={true}
            />
            <StaffSelector
              staffList={activeStaff}
              selectedStaffId={selectedStaffId}
              onStaffChange={handleStaffChange}
            />
            <TimeSlots
              slots={availableSlots}
              selectedSlot={selectedSlot}
              onSlotSelect={handleSlotSelect}
              columns={3}
              showTakenNotice={showSlotTaken}
              takenSlotTime={takenSlotTime}
              heldSlotTime={heldSlotTime}
              selectedDate={selectedDate}
            />
            {showSlotTaken && <SlotTakenNotice takenTime={takenSlotTime} heldTime={heldSlotTime} onDismiss={dismissSlotTaken} />}
            <DetailsForm
              name={name}
              onNameChange={setName}
              nameError={nameError}
              phone={phone}
              onPhoneChange={setPhone}
              phoneError={phoneError}
              wantsReminders={wantsReminders}
              onRemindersChange={setWantsReminders}
              depositAmount={depositAmount}
              isMobile={true}
            />
            {submitError && (
              <div className="rounded-[18px] border border-danger bg-danger/10 p-4 text-sm text-danger">
                {submitError}
              </div>
            )}
          </div>
        )}
        {step === 3 && (
          <div className="space-y-5">
            <DatePicker
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              minDate={MIN_DATE}
              maxDate={MAX_DATE}
              showArrows={true}
            />
            <StaffSelector
              staffList={activeStaff}
              selectedStaffId={selectedStaffId}
              onStaffChange={handleStaffChange}
            />
            <TimeSlots
              slots={availableSlots}
              selectedSlot={selectedSlot}
              onSlotSelect={handleSlotSelect}
              columns={3}
            />
            <DetailsForm
              name={name}
              onNameChange={setName}
              nameError={nameError}
              phone={phone}
              onPhoneChange={setPhone}
              phoneError={phoneError}
              wantsReminders={wantsReminders}
              onRemindersChange={setWantsReminders}
              depositAmount={depositAmount}
              isMobile={true}
            />
            {submitError && (
              <div className="rounded-[18px] border border-danger bg-danger/10 p-4 text-sm text-danger">
                {submitError}
              </div>
            )}
          </div>
        )}
        <StickyActionBar
          onBack={handleBack}
          onContinue={handleContinue}
          depositAmount={depositAmount}
          isBackDisabled={step === 1}
          isContinueDisabled={
            isSubmitting ||
            (step === 1 && !selectedService) ||
            (step === 2 && !selectedSlot) ||
            (step === 3 && (!name.trim() || !phone.trim()))
          }
        />
      </div>
    );
  }

  if (isTablet) {
    return (
      <div className="flex flex-col gap-6 pb-6">
        <Stepper currentStep={step} />
        <div className="grid gap-4 grid-cols-[1fr_277px]">
          <div className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-serif text-xl font-semibold text-foreground">Pick a service</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleServiceSelect(service)}
                      className="relative flex flex-col items-start justify-between rounded-[20px] border bg-card p-4 transition-all hover:border-primary/50"
                    >
                      <div>
                        <h3 className="font-serif text-base font-semibold text-foreground">{service.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {service.duration} • {service.deposit} deposit
                        </p>
                      </div>
                      <span className="mt-3 flex h-9 items-center justify-center rounded-[15px] border border-border bg-card px-3 text-sm font-medium text-foreground">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <DatePicker
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              minDate={MIN_DATE}
              maxDate={MAX_DATE}
              showWeekdays={false}
              showArrows={false}
            />
            <TimeSlots
              slots={availableSlots}
              selectedSlot={selectedSlot}
              onSlotSelect={handleSlotSelect}
              columns={3}
              selectedDate={selectedDate}
            />
            <DetailsForm
              name={name}
              onNameChange={setName}
              nameError={nameError}
              phone={phone}
              onPhoneChange={setPhone}
              phoneError={phoneError}
              wantsReminders={wantsReminders}
              onRemindersChange={setWantsReminders}
              depositAmount={depositAmount}
              isMobile={false}
            />
          </div>
          <div className="space-y-3">
            <BookingSummary
              serviceName={selectedService?.name || "Select a service"}
              dateDisplay={dateDisplay}
              timeDisplay={timeDisplay}
              staffName={staffName}
              depositAmount={depositAmount}
              balanceAmount={balanceAmount}
            />
            <Button
              onClick={handleContinue}
              disabled={
                isSubmitting ||
                (step === 1 && !selectedService) ||
                (step === 2 && !selectedSlot) ||
                (step === 3 && (!name.trim() || !phone.trim()))
              }
              className="w-full h-13 rounded-[18px] text-base"
            >
              {step === 1 ? "Continue" : `Continue • ${depositAmount}`}
            </Button>
            {submitError && (
              <div className="rounded-[18px] border border-danger bg-danger/10 p-4 text-sm text-danger">
                {submitError}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <Stepper currentStep={step} />
      <div className="grid gap-6 grid-cols-[1fr_351px]">
        <div className="space-y-5">
          {step === 1 && (
            <div>
              <h2 className="font-serif text-2xl font-semibold text-foreground">Book your ritual</h2>
              <div className="mt-6 grid gap-3 grid-cols-2">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isSelected={selectedService?.id === service.id}
                    onSelect={() => handleServiceSelect(service)}
                  />
                ))}
              </div>
            </div>
          )}
          {step >= 1 && (
            <div className="rounded-[24px] border bg-card p-6">
              <h3 className="font-serif text-xl font-semibold text-foreground">
                {selectedStaffId === "any"
                  ? format(new Date(`${selectedDate}T00:00:00`), "MMMM yyyy")
                  : `${format(new Date(`${selectedDate}T00:00:00`), "MMMM yyyy")} • with ${staff.find((s) => s.id === selectedStaffId)?.name || "Any available"}`}
              </h3>
              <DatePicker
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                minDate={MIN_DATE}
                maxDate={MAX_DATE}
                showWeekdays={false}
                showArrows={false}
                staffName={selectedStaffId !== "any" ? staff.find((s) => s.id === selectedStaffId)?.name : undefined}
              />
<TimeSlots
              slots={availableSlots}
              selectedSlot={selectedSlot}
              onSlotSelect={handleSlotSelect}
              columns={3}
              selectedDate={selectedDate}
            />
            </div>
          )}
        </div>
        <div className="space-y-4">
          <BookingSummary
            serviceName={selectedService?.name || "Select a service"}
            dateDisplay={dateDisplay}
            timeDisplay={timeDisplay}
            staffName={staffName}
            depositAmount={depositAmount}
            balanceAmount={balanceAmount}
          />
          <DetailsForm
            name={name}
            onNameChange={setName}
            nameError={nameError}
            phone={phone}
            onPhoneChange={setPhone}
            phoneError={phoneError}
            wantsReminders={wantsReminders}
            onRemindersChange={setWantsReminders}
            depositAmount={depositAmount}
            isMobile={false}
          />
          <Button
            onClick={handleContinue}
            disabled={
              isSubmitting ||
              (step === 1 && !selectedService) ||
              (step === 2 && !selectedSlot) ||
              (step === 3 && (!name.trim() || !phone.trim()))
            }
            className="w-full h-13 rounded-[18px] text-base"
          >
            {step === 1 ? "Continue" : `Continue • ${depositAmount} deposit`}
          </Button>
          {submitError && (
            <div className="rounded-[18px] border border-danger bg-danger/10 p-4 text-sm text-danger">
              {submitError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}