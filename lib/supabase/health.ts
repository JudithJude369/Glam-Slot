import "server-only";
import { createAdminClient } from "./admin";
import { createClient } from "./server";

export type SupabaseCheck = {
  name: string;
  ok: boolean;
  detail: string;
};

export type SupabaseConnectionResult = {
  ok: boolean;
  checks: SupabaseCheck[];
};

async function checkAuthApi(url: string, anonKey: string): Promise<SupabaseCheck> {
  try {
    const response = await fetch(`${url}/auth/v1/health`, {
      headers: {
        // Publishable and secret keys are not JWTs, so they go on the apikey
        // header only, never on Authorization: Bearer
        // (https://supabase.com/docs/guides/getting-started/api-keys).
        apikey: anonKey,
      },
      cache: "no-store",
    });

    return {
      name: "auth-api",
      ok: response.ok,
      detail: response.ok
        ? "project reachable and publishable key accepted"
        : `publishable key rejected (HTTP ${response.status})`,
    };
  } catch {
    return {
      name: "auth-api",
      ok: false,
      detail: "network request to the project failed",
    };
  }
}

function keyFormat(key: string): "publishable" | "secret" | "legacy-jwt" | "unknown" {
  if (key.startsWith("sb_publishable_")) return "publishable";
  if (key.startsWith("sb_secret_")) return "secret";
  if (key.startsWith("eyJ")) return "legacy-jwt";
  return "unknown";
}

// Only the format is reported, never any part of the key value.
function checkKeyFormat(anonKey: string, serviceRoleKey: string): SupabaseCheck {
  const anon = keyFormat(anonKey);
  const service = keyFormat(serviceRoleKey);
  const problems: string[] = [];

  if (anon === "secret" || anon === "unknown") {
    problems.push(
      `NEXT_PUBLIC_SUPABASE_ANON_KEY holds a ${anon} key, expected sb_publishable_ or a legacy anon JWT`,
    );
  }

  if (service === "publishable" || service === "unknown") {
    problems.push(
      `SUPABASE_SERVICE_ROLE_KEY holds a ${service} key, expected sb_secret_ or a legacy service_role JWT`,
    );
  }

  return {
    name: "key-format",
    ok: problems.length === 0,
    detail:
      problems.length === 0
        ? `${anon} key for the browser, ${service} key for the server`
        : problems.join("; "),
  };
}

export async function checkSupabaseConnection(): Promise<SupabaseConnectionResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  const missing = [
    ["NEXT_PUBLIC_SUPABASE_URL", url],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey],
    ["SUPABASE_SERVICE_ROLE_KEY", serviceRoleKey],
  ]
    .filter(([, value]) => value === "")
    .map(([name]) => name);

  const checks: SupabaseCheck[] = [
    {
      name: "env",
      ok: missing.length === 0,
      detail:
        missing.length === 0
          ? "all three variable names have a value"
          : `no value for ${missing.join(", ")}`,
    },
  ];

  if (!url || !anonKey || !serviceRoleKey) {
    return { ok: false, checks };
  }

  checks.push(checkKeyFormat(anonKey, serviceRoleKey));
  checks.push(await checkAuthApi(url, anonKey));

  try {
    const serverClient = await createClient();
    const { error } = await serverClient.auth.getSession();
    checks.push({
      name: "server-client",
      ok: !error,
      detail: error ? "cookie based client failed" : "cookie based client ready",
    });
  } catch {
    checks.push({
      name: "server-client",
      ok: false,
      detail: "cookie based client failed",
    });
  }

  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1 });
    checks.push({
      name: "service-role",
      ok: !error,
      detail: error ? "service role key rejected" : "service role key accepted",
    });
  } catch {
    checks.push({
      name: "service-role",
      ok: false,
      detail: "service role key rejected",
    });
  }

  return { ok: checks.every((check) => check.ok), checks };
}