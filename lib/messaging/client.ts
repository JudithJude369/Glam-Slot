import type { TemplateName, TemplateVariables } from "./templates";

export interface SendMessageResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
}

export interface MessagingProvider {
  sendTemplate(
    to: string,
    templateName: TemplateName,
    variables: TemplateVariables[TemplateName]
  ): Promise<SendMessageResult>;
}

export class FakeMessagingProvider implements MessagingProvider {
  private sentMessages: Array<{
    to: string;
    templateName: TemplateName;
    variables: TemplateVariables[TemplateName];
    timestamp: Date;
  }> = [];

  async sendTemplate(
    to: string,
    templateName: TemplateName,
    variables: TemplateVariables[TemplateName]
  ): Promise<SendMessageResult> {
    this.sentMessages.push({
      to,
      templateName,
      variables,
      timestamp: new Date(),
    });
    return {
      success: true,
      providerMessageId: `fake_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    };
  }

  getSentMessages() {
    return this.sentMessages;
  }

  clear() {
    this.sentMessages = [];
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
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }
}

import { WHATSAPP_TEMPLATES } from "./templates";

let providerInstance: MessagingProvider | null = null;

export function getMessagingProvider(): MessagingProvider {
  if (providerInstance) return providerInstance;

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (accessToken && phoneNumberId) {
    providerInstance = new WhatsAppMessagingProvider(accessToken, phoneNumberId);
  } else {
    providerInstance = new FakeMessagingProvider();
  }

  return providerInstance;
}

export function setMessagingProviderForTest(provider: MessagingProvider) {
  providerInstance = provider;
}

export function resetMessagingProvider() {
  providerInstance = null;
}