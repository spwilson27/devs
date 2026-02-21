import { defineConfig } from "vitest/config";

/**
 * Root Vitest configuration for the devs monorepo.
 *
 * Discovers test files across all packages.
 * Per-package vitest.config.ts files are used when running tests from within
 * an individual package directory; this root config is used by ./do test and
 * the root `pnpm test` script.
 */
export default defineConfig({
  test: {
    environment: "node",
    // Glob pattern relative to the monorepo root.
    include: ["packages/*/test/**/*.test.ts"],
    // Use forks pool for native addons (e.g. better-sqlite3).
    pool: "forks",
  },
});
