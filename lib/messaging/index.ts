export { WHATSAPP_TEMPLATES, buildTemplateVariables } from "./templates";
export type { TemplateName, TemplateVariables } from "./templates";
export { FakeMessagingProvider, WhatsAppMessagingProvider, getMessagingProvider, setMessagingProviderForTest, resetMessagingProvider } from "./client";
export type { MessagingProvider, SendMessageResult } from "./client";