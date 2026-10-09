export const WHATSAPP_TEMPLATES = {
  booking_confirmed: {
    name: "booking_confirmed",
    language: "en",
    components: [
      {
        type: "header",
        parameters: [
          { type: "text", text: "{{service_name}}" },
        ],
      },
      {
        type: "body",
        parameters: [
          { type: "text", text: "{{customer_name}}" },
          { type: "text", text: "{{service_name}}" },
          { type: "text", text: "{{date_display}}" },
          { type: "text", text: "{{time_display}}" },
          { type: "text", text: "{{staff_name}}" },
          { type: "text", text: "{{booking_code}}" },
          { type: "text", text: "{{salon_name}}" },
        ],
      },
    ],
  },
  reminder_24h: {
    name: "reminder_24h",
    language: "en",
    components: [
      {
        type: "header",
        parameters: [
          { type: "text", text: "{{service_name}}" },
        ],
      },
      {
        type: "body",
        parameters: [
          { type: "text", text: "{{customer_name}}" },
          { type: "text", text: "{{service_name}}" },
          { type: "text", text: "{{date_display}}" },
          { type: "text", text: "{{time_display}}" },
          { type: "text", text: "{{staff_name}}" },
          { type: "text", text: "{{salon_name}}" },
        ],
      },
    ],
  },
  reminder_2h: {
    name: "reminder_2h",
    language: "en",
    components: [
      {
        type: "header",
        parameters: [
          { type: "text", text: "{{service_name}}" },
        ],
      },
      {
        type: "body",
        parameters: [
          { type: "text", text: "{{customer_name}}" },
          { type: "text", text: "{{service_name}}" },
          { type: "text", text: "{{date_display}}" },
          { type: "text", text: "{{time_display}}" },
          { type: "text", text: "{{staff_name}}" },
          { type: "text", text: "{{salon_name}}" },
        ],
      },
    ],
  },
} as const;

export type TemplateName = keyof typeof WHATSAPP_TEMPLATES;

export interface TemplateVariables {
  booking_confirmed: {
    customer_name: string;
    service_name: string;
    date_display: string;
    time_display: string;
    staff_name: string;
    booking_code: string;
    salon_name: string;
  };
  reminder_24h: {
    customer_name: string;
    service_name: string;
    date_display: string;
    time_display: string;
    staff_name: string;
    salon_name: string;
  };
  reminder_2h: {
    customer_name: string;
    service_name: string;
    date_display: string;
    time_display: string;
    staff_name: string;
    salon_name: string;
  };
}

export function buildTemplateVariables(
  kind: "confirmation" | "24h" | "2h",
  booking: {
    customer_name: string;
    service_name: string;
    starts_at: string;
    staff_name: string;
    id: string;
  },
  salonName: string
): TemplateVariables[TemplateName] {
  const dateDisplay = new Date(booking.starts_at).toLocaleDateString("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeDisplay = new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Lagos",
  }).format(new Date(booking.starts_at));
  const bookingCode = booking.id.slice(0, 8).toUpperCase();

  if (kind === "confirmation") {
    return {
      customer_name: booking.customer_name,
      service_name: booking.service_name,
      date_display: dateDisplay,
      time_display: timeDisplay,
      staff_name: booking.staff_name,
      booking_code: bookingCode,
      salon_name: salonName,
    };
  }

  return {
    customer_name: booking.customer_name,
    service_name: booking.service_name,
    date_display: dateDisplay,
    time_display: timeDisplay,
    staff_name: booking.staff_name,
    salon_name: salonName,
  };
}