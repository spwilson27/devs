import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // test/ subdir: integration tests (Phase 2+)
    // src/ subdir: unit tests co-located with source (Phase 1 git/orchestration tests)
    include: ["test/**/*.test.ts", "src/**/*.test.ts"],
    // Use forks pool for native addons (better-sqlite3).
    pool: "forks",
  },
});
