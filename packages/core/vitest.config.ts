import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    // Use forks pool for native addons (better-sqlite3).
    pool: "forks",
  },
});
