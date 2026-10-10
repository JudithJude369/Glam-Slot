export { WHATSAPP_TEMPLATES, buildTemplateVariables } from "./templates.ts";
export type { TemplateName, TemplateVariables } from "./templates.ts";
export {
  FakeMessagingProvider,
  WhatsAppMessagingProvider,
  getMessagingProvider,
  getMessagingMode,
  setMessagingProviderForTest,
  resetMessagingProvider,
} from "./client.ts";
export type { MessagingProvider, SendMessageResult, SimulatedMessage } from "./client.ts";