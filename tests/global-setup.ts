import { assertTestDatabase } from "../lib/test-guard";

export default function globalSetup() {
  assertTestDatabase(process.env.NEXT_PUBLIC_SUPABASE_URL);
}