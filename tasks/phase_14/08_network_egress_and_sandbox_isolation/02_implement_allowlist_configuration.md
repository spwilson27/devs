# Task: Implement Domain Allowlist Configuration & Management for Egress Proxy (Sub-Epic: 08_Network Egress and Sandbox Isolation)

## Covered Requirements
- [9_ROADMAP-TAS-203], [8_RISKS-REQ-007]

## 1. Initial Test Written
- [ ] Create `src/sandbox/proxy/__tests__/allowlistManager.test.ts`.
- [ ] Write a unit test for `AllowlistManager.load(configPath)` that reads a YAML/JSON file at a given path and returns a validated `AllowlistConfig` object. Assert that unknown fields cause a `ZodError` (use the Zod schema to be defined in implementation).
- [ ] Write a unit test that verifies the **default** allowlist (exported constant `DEFAULT_ALLOWLIST`) contains exactly the entries: `registry.npmjs.org`, `pypi.org`, `files.pythonhosted.org`, `github.com`, `api.github.com`, `*.github.com`, `objects.githubusercontent.com`, `generativelanguage.googleapis.com`.
- [ ] Write a unit test for `AllowlistManager.merge(base, override)` that verifies user-supplied overrides are **appended** to the base list without duplicates.
- [ ] Write a unit test that verifies `AllowlistManager.validate(config)` throws when the config contains a wildcard at the TLD level (e.g., `*.com`) — these overly-broad entries must be rejected.
- [ ] Write an integration test that creates a temp YAML file on disk, calls `AllowlistManager.load()`, and asserts the returned entries match the file contents.
- [ ] All tests must FAIL before implementation.

## 2. Task Implementation
- [ ] Create `src/sandbox/proxy/allowlistManager.ts` exporting:
  - `DEFAULT_ALLOWLIST: string[]` — the canonical base allowlist (npm, pypi, github, Gemini API).
  - `AllowlistConfig` Zod schema: `{ version: z.literal(1), entries: z.array(z.string()) }`.
  - `AllowlistManager` class with static methods:
    - `load(configPath: string): Promise<AllowlistConfig>` — reads JSON or YAML (use `js-yaml` if already a project dependency, else raw JSON only) and validates with the Zod schema.
    - `merge(base: string[], override: string[]): string[]` — deduplicates and returns a combined list.
    - `validate(entries: string[]): void` — throws `AllowlistValidationError` for TLD-level wildcards or empty strings.
- [ ] Create `src/sandbox/proxy/errors.ts` exporting `AllowlistValidationError extends Error`.
- [ ] Create the default config file template at `src/sandbox/proxy/default-allowlist.json`:
  ```json
  { "version": 1, "entries": ["registry.npmjs.org", "pypi.org", "files.pythonhosted.org", "github.com", "api.github.com", "*.github.com", "objects.githubusercontent.com", "generativelanguage.googleapis.com"] }
  ```
- [ ] Wire `AllowlistManager.load` and `DEFAULT_ALLOWLIST` into `EgressProxy` constructor so that when no explicit `allowlist` is passed, the proxy falls back to `DEFAULT_ALLOWLIST`.
- [ ] Annotate with `// [9_ROADMAP-TAS-203] [8_RISKS-REQ-007]`.

## 3. Code Review
- [ ] Verify the Zod schema rejects `entries` arrays containing empty strings or strings with spaces.
- [ ] Verify `merge()` is pure (no side effects) and returns a new array.
- [ ] Verify `load()` surfaces meaningful error messages (include the config file path and the validation failure field) rather than raw Zod errors.
- [ ] Verify the TLD wildcard check in `validate()` uses a regex that correctly identifies `*.com`, `*.io`, `*.org`, etc. and does NOT incorrectly flag `*.github.com`.
- [ ] Verify strict TypeScript types throughout — no `any`.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/sandbox/proxy/__tests__/allowlistManager.test.ts --runInBand` and confirm all tests pass.
- [ ] Run `npx tsc --noEmit` and confirm zero type errors.
- [ ] Confirm coverage for `allowlistManager.ts` is ≥ 90%.

## 5. Update Documentation
- [ ] Update `src/sandbox/proxy/PROXY.agent.md` with a new **Allowlist Configuration** section documenting:
  - The default allowlist entries and their purpose.
  - How to extend the allowlist via a project-level `devs.allowlist.json` config file.
  - The validation rules (no TLD wildcards, no empty entries).
  - Requirement traceability: `[9_ROADMAP-TAS-203]`, `[8_RISKS-REQ-007]`.
- [ ] Ensure `src/sandbox/proxy/default-allowlist.json` is tracked in git and documented as the canonical source of truth for default allowed domains.

## 6. Automated Verification
- [ ] Add `validate:proxy-allowlist` script to `package.json`:
  ```
  "validate:proxy-allowlist": "jest src/sandbox/proxy/__tests__/allowlistManager.test.ts --runInBand --passWithNoTests=false && tsc --noEmit"
  ```
- [ ] Run `npm run validate:proxy-allowlist` and confirm exit code 0.
- [ ] Confirm `test-results/proxy-allowlist.xml` contains zero `<failure>` elements.
