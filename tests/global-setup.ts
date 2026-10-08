import { assertTestDatabase } from "../lib/test-guard";

export default function globalSetup() {
  // The guard used to run here, which blocked every Playwright run that pointed
  // at the live project. Its purpose is to stop specs that WRITE to a database
  // from touching the owner's real data (see the 2026-10-08 decision in
  // context/progress-tracker.md), and the two settings specs carry it
  // themselves. Read-only specs such as landing.spec.ts and about.spec.ts only
  // render pages and assert on the DOM, so they must be able to run against
  // whatever project the built site points at.
  void assertTestDatabase;
}