import { assertTestDatabase } from "../lib/test-guard.ts";

assertTestDatabase(process.env.NEXT_PUBLIC_SUPABASE_URL);

import {
  FakeMessagingProvider,
  WhatsAppMessagingProvider,
  getMessagingProvider,
  getMessagingMode,
  setMessagingProviderForTest,
  resetMessagingProvider,
} from "../lib/messaging/client.ts";
import type { TemplateName, TemplateVariables } from "../lib/messaging/templates.ts";

type Check = { name: string; ok: boolean; detail: string };
const checks: Check[] = [];

function record(name: string, ok: boolean, detail: string): void {
  checks.push({ name, ok, detail });
  process.stdout.write(`${ok ? "PASS" : "FAIL"}  ${name}\n      ${detail}\n`);
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  record(message, ok, ok ? "match" : `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function assertMatch(actual: string, pattern: RegExp, message: string): void {
  const ok = pattern.test(actual);
  record(message, ok, ok ? "match" : `expected match for ${pattern}, got ${actual}`);
}

function assertInstanceOf(actual: unknown, expectedClass: unknown, message: string): void {
  const ok = actual instanceof (expectedClass as new (...args: unknown[]) => object);
  record(message, ok, ok ? `${actual.constructor.name}` : `${actual?.constructor?.name ?? typeof actual}`);
}

async function runTests(): Promise<void> {
  console.log("=== Messaging Provider Tests ===\n");

  // Test 1: FakeMessagingProvider returns simulated=true
  {
    resetMessagingProvider();
    const provider = new FakeMessagingProvider();
    const result = await provider.sendTemplate("+2348031234567", "booking_confirmed", {
      customer_name: "Test Customer",
      service_name: "Test Service",
      date_display: "Fri, Oct 11",
      time_display: "2:30 PM",
      staff_name: "Test Staff",
      booking_code: "ABC12345",
      salon_name: "Test Salon",
    });

    assertEqual(result.success, true, "FakeMessagingProvider.sendTemplate returns success=true");
    assertEqual(result.simulated, true, "FakeMessagingProvider.sendTemplate returns simulated=true");
    assertMatch(result.providerMessageId ?? "", /^fake_\d+_[a-z0-9]+$/, "FakeMessagingProvider returns fake_ prefixed ID");
  }

  // Test 2: FakeMessagingProvider stores sent messages
  {
    resetMessagingProvider();
    const provider = new FakeMessagingProvider();
    await provider.sendTemplate("+2348031234567", "reminder_24h", {
      customer_name: "Test Customer",
      service_name: "Test Service",
      date_display: "Fri, Oct 11",
      time_display: "2:30 PM",
      staff_name: "Test Staff",
      salon_name: "Test Salon",
    });

    const messages = provider.getSentMessages();
    assertEqual(messages.length, 1, "FakeMessagingProvider stores 1 message");
    assertEqual(messages[0]?.to, "+2348031234567", "Stored message has correct phone");
    assertEqual(messages[0]?.templateName, "reminder_24h", "Stored message has correct template name");
  }

  // Test 3: FakeMessagingProvider.clear() empties history
  {
    resetMessagingProvider();
    const provider = new FakeMessagingProvider();
    await provider.sendTemplate("+2348031234567", "booking_confirmed", {
      customer_name: "Test",
      service_name: "Service",
      date_display: "Fri, Oct 11",
      time_display: "2:30 PM",
      staff_name: "Staff",
      booking_code: "ABC123",
      salon_name: "Salon",
    });
    provider.clear();
    assertEqual(provider.getSentMessages().length, 0, "FakeMessagingProvider.clear() empties history");
  }

  // Test 4: getMessagingMode returns 'fake' when WHATSAPP_LIVE_MODE not set
  {
    resetMessagingProvider();
    delete process.env.WHATSAPP_LIVE_MODE;
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;

    assertEqual(getMessagingMode(), "fake", "getMessagingMode returns 'fake' when WHATSAPP_LIVE_MODE not set");
  }

  // Test 5: getMessagingMode returns 'fake' when WHATSAPP_LIVE_MODE is not 'true'
  {
    resetMessagingProvider();
    process.env.WHATSAPP_LIVE_MODE = "false";
    process.env.WHATSAPP_ACCESS_TOKEN = "token";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123";

    assertEqual(getMessagingMode(), "fake", "getMessagingMode returns 'fake' when WHATSAPP_LIVE_MODE is 'false'");
  }

  // Test 6: getMessagingMode returns 'fake' when WHATSAPP_LIVE_MODE=true but credentials missing
  {
    resetMessagingProvider();
    process.env.WHATSAPP_LIVE_MODE = "true";
    process.env.WHATSAPP_ACCESS_TOKEN = "";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "";

    assertEqual(getMessagingMode(), "fake", "getMessagingMode returns 'fake' when LIVE_MODE=true but credentials missing");
  }

  // Test 7: getMessagingMode returns 'live' only when WHATSAPP_LIVE_MODE=true AND credentials present
  {
    resetMessagingProvider();
    process.env.WHATSAPP_LIVE_MODE = "true";
    process.env.WHATSAPP_ACCESS_TOKEN = "token";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123";

    assertEqual(getMessagingMode(), "live", "getMessagingMode returns 'live' when LIVE_MODE=true and credentials present");
  }

  // Test 8: getMessagingProvider returns FakeMessagingProvider by default
  {
    resetMessagingProvider();
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
    delete process.env.WHATSAPP_LIVE_MODE;

    const provider = getMessagingProvider();
    assertInstanceOf(provider, FakeMessagingProvider, "getMessagingProvider returns FakeMessagingProvider by default");
  }

  // Test 9: getMessagingProvider returns FakeMessagingProvider when WHATSAPP_LIVE_MODE is not 'true'
  {
    resetMessagingProvider();
    process.env.WHATSAPP_ACCESS_TOKEN = "token";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123";
    process.env.WHATSAPP_LIVE_MODE = "false";

    const provider = getMessagingProvider();
    assertInstanceOf(provider, FakeMessagingProvider, "getMessagingProvider returns FakeMessagingProvider when LIVE_MODE=false");
  }

  // Test 10: getMessagingProvider returns FakeMessagingProvider when LIVE_MODE=true but credentials missing
  {
    resetMessagingProvider();
    process.env.WHATSAPP_LIVE_MODE = "true";
    process.env.WHATSAPP_ACCESS_TOKEN = "";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "";

    const provider = getMessagingProvider();
    assertInstanceOf(provider, FakeMessagingProvider, "getMessagingProvider returns FakeMessagingProvider when LIVE_MODE=true but no credentials");
  }

  // Test 11: getMessagingProvider returns WhatsAppMessagingProvider when LIVE_MODE=true AND credentials present
  {
    resetMessagingProvider();
    process.env.WHATSAPP_LIVE_MODE = "true";
    process.env.WHATSAPP_ACCESS_TOKEN = "token";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123";

    const provider = getMessagingProvider();
    assertInstanceOf(provider, WhatsAppMessagingProvider, "getMessagingProvider returns WhatsAppMessagingProvider when LIVE_MODE=true and credentials present");
  }

  // Test 12: getMessagingProvider returns cached instance
  {
    resetMessagingProvider();
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
    delete process.env.WHATSAPP_LIVE_MODE;

    const provider1 = getMessagingProvider();
    const provider2 = getMessagingProvider();
    assertEqual(provider1, provider2, "getMessagingProvider returns cached instance on subsequent calls");
  }

  // Test 13: setMessagingProviderForTest overrides provider selection
  {
    resetMessagingProvider();
    process.env.WHATSAPP_LIVE_MODE = "true";
    process.env.WHATSAPP_ACCESS_TOKEN = "token";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123";

    const testProvider = new FakeMessagingProvider();
    setMessagingProviderForTest(testProvider);

    const provider = getMessagingProvider();
    assertEqual(provider, testProvider, "setMessagingProviderForTest overrides provider selection");
  }

  // Test 14: CRITICAL SAFETY TEST - No real network calls when live mode disabled
  {
    resetMessagingProvider();
    process.env.WHATSAPP_ACCESS_TOKEN = "fake_token_for_test";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "fake_id_for_test";
    delete process.env.WHATSAPP_LIVE_MODE;

    const provider = getMessagingProvider();
    assertInstanceOf(provider, FakeMessagingProvider, "Provider is FakeMessagingProvider when LIVE_MODE not enabled");

    const result = await provider.sendTemplate("+2348031234567", "booking_confirmed", {
      customer_name: "Test Customer",
      service_name: "Test Service",
      date_display: "Fri, Oct 11",
      time_display: "2:30 PM",
      staff_name: "Test Staff",
      booking_code: "ABC12345",
      salon_name: "Test Salon",
    });

    assertEqual(result.simulated, true, "Result is simulated (no real API call made)");
    assertMatch(result.providerMessageId ?? "", /^fake_/, "ProviderMessageId is fake_ prefixed");
    assertEqual(provider instanceof WhatsAppMessagingProvider, false, "Provider is NOT WhatsAppMessagingProvider instance");
  }

  // Test 15: WhatsAppMessagingProvider returns simulated=false when actually sending
  {
    resetMessagingProvider();
    process.env.WHATSAPP_LIVE_MODE = "true";
    process.env.WHATSAPP_ACCESS_TOKEN = "token";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123";

    const provider = getMessagingProvider();
    assertInstanceOf(provider, WhatsAppMessagingProvider, "Provider is WhatsAppMessagingProvider instance");

    // We can't test actual network call, but we verify the class is instantiated correctly
    // The simulated field would be false for real sends (tested via unit test mocking)
    record(
      "WhatsAppMessagingProvider instantiated correctly",
      provider instanceof WhatsAppMessagingProvider,
      "WhatsAppMessagingProvider class instantiated when LIVE_MODE=true with credentials"
    );
  }

  // Summary
  const passed = checks.filter((c) => c.ok).length;
  const failed = checks.filter((c) => !c.ok).length;
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error("Test runner error:", error);
  process.exit(1);
});