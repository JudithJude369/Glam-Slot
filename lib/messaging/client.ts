import type { TemplateName, TemplateVariables } from "./templates.ts";

export interface SendMessageResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
  simulated?: boolean;
}

export interface MessagingProvider {
  sendTemplate(
    to: string,
    templateName: TemplateName,
    variables: TemplateVariables[TemplateName]
  ): Promise<SendMessageResult>;
}

export interface SimulatedMessage {
  id: string;
  to: string;
  templateName: TemplateName;
  variables: Record<string, string>;
  timestamp: Date;
  direction: "outbound";
  status: "simulated";
}

export class FakeMessagingProvider implements MessagingProvider {
  private sentMessages: SimulatedMessage[] = [];

  async sendTemplate(
    to: string,
    templateName: TemplateName,
    variables: TemplateVariables[TemplateName]
  ): Promise<SendMessageResult> {
    const message: SimulatedMessage = {
      id: `fake_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      to,
      templateName,
      variables: variables as Record<string, string>,
      timestamp: new Date(),
      direction: "outbound",
      status: "simulated",
    };
    this.sentMessages.push(message);
    return {
      success: true,
      providerMessageId: message.id,
      simulated: true,
    };
  }

  getSentMessages(): SimulatedMessage[] {
    return [...this.sentMessages].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getMessagesForPhone(phone: string): SimulatedMessage[] {
    return this.sentMessages
      .filter((m) => m.to === phone)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getMessagesByTemplate(templateName: TemplateName): SimulatedMessage[] {
    return this.sentMessages
      .filter((m) => m.templateName === templateName)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  clear() {
    this.sentMessages = [];
  }

  getStats() {
    const byTemplate: Record<string, number> = {};
    for (const msg of this.sentMessages) {
      byTemplate[msg.templateName] = (byTemplate[msg.templateName] || 0) + 1;
    }
    return {
      total: this.sentMessages.length,
      byTemplate,
      uniquePhones: new Set(this.sentMessages.map((m) => m.to)).size,
    };
  }
}

export class WhatsAppMessagingProvider implements MessagingProvider {
  private accessToken: string;
  private phoneNumberId: string;

  constructor(accessToken: string, phoneNumberId: string) {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
  }

  async sendTemplate(
    to: string,
    templateName: TemplateName,
    variables: TemplateVariables[TemplateName]
  ): Promise<SendMessageResult> {
    const template = {
      booking_confirmed: WHATSAPP_TEMPLATES.booking_confirmed,
      reminder_24h: WHATSAPP_TEMPLATES.reminder_24h,
      reminder_2h: WHATSAPP_TEMPLATES.reminder_2h,
    }[templateName];

    const components = template.components.map((comp) => {
      if (comp.type === "header" || comp.type === "body") {
        return {
          type: comp.type,
          parameters: comp.parameters.map((param) => {
            const key = param.text.replace(/[{}]/g, "");
            return {
              type: "text",
              text: variables[key as keyof typeof variables] || "",
            };
          }),
        };
      }
      return comp;
    });

    try {
      const response = await fetch(
        `https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: to.replace("+", ""),
            type: "template",
            template: {
              name: template.name,
              language: { code: template.language },
              components,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || "Failed to send message",
        };
      }

      return {
        success: true,
        providerMessageId: data.messages?.[0]?.id,
        simulated: false,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }
}

import { WHATSAPP_TEMPLATES } from "./templates.ts";

let providerInstance: MessagingProvider | null = null;

function isLiveModeEnabled(): boolean {
  return process.env.WHATSAPP_LIVE_MODE === "true";
}

export function getMessagingProvider(): MessagingProvider {
  if (providerInstance) return providerInstance;

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const liveMode = isLiveModeEnabled();

  if (liveMode && accessToken && phoneNumberId) {
    providerInstance = new WhatsAppMessagingProvider(accessToken, phoneNumberId);
  } else {
    if (liveMode && (!accessToken || !phoneNumberId)) {
      console.warn(
        "[WhatsApp] WHATSAPP_LIVE_MODE=true but credentials missing; falling back to FakeMessagingProvider"
      );
    }
    providerInstance = new FakeMessagingProvider();
  }

  return providerInstance;
}

export function getMessagingMode(): "live" | "fake" {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const liveMode = isLiveModeEnabled();

  return liveMode && accessToken && phoneNumberId ? "live" : "fake";
}

export function setMessagingProviderForTest(provider: MessagingProvider) {
  providerInstance = provider;
}

export function resetMessagingProvider() {
  providerInstance = null;
}