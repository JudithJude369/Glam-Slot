const TEST_PROJECT_REF = "jfnmvouaboannzqncwlu";

export function assertTestDatabase(url: string | undefined): void {
  if (!url || !url.includes(TEST_PROJECT_REF)) {
    throw new Error("Refusing to run: this is not the glamslot-test project.");
  }
}