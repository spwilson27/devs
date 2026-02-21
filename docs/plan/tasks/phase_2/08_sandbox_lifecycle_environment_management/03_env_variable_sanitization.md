# Task: Implement Orchestrator Environment Variable Sanitization Before Sandbox Spawn (Sub-Epic: 08_Sandbox Lifecycle & Environment Management)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-015], [8_RISKS-REQ-046]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/__tests__/envSanitizer.test.ts`, write unit tests for an `EnvironmentSanitizer` class:
  - Test `sanitize(processEnv)` with an input containing known sensitive keys (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `GITHUB_TOKEN`, `OPENAI_API_KEY`, `DATABASE_URL`, `GCP_SERVICE_ACCOUNT_KEY`): assert that all are absent from the returned object.
  - Test with a custom denylist passed at construction time: verify those additional keys are stripped.
  - Test that non-sensitive variables (e.g., `PATH`, `HOME`, `NODE_ENV`, `LANG`) are preserved in the output.
  - Test that the original `processEnv` object is not mutated (function must return a new object).
  - Test `sanitize` with an empty `processEnv` returns an empty object without throwing.
  - Write a property-based test using `fast-check` to verify that any key matching the pattern `/(KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL|CERT|PRIVATE)/i` is stripped from output regardless of prefix.

## 2. Task Implementation
- [ ] Create `packages/sandbox/src/env/EnvironmentSanitizer.ts`:
  - Define `DEFAULT_SENSITIVE_KEY_PATTERNS: RegExp[]` covering: `/(KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL|CERT|PRIVATE|DSN|DATABASE_URL|CONN_STR)/i` plus exact-match entries for known AWS, GCP, Azure, GitHub, and OpenAI environment variable names.
  - Implement `constructor(options?: { additionalDenylist?: string[] })` that merges caller-supplied keys into the denylist.
  - Implement `sanitize(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv`:
    - Creates a shallow copy of `env`.
    - Iterates all keys; deletes any key that matches any pattern in `DEFAULT_SENSITIVE_KEY_PATTERNS` or the additional denylist.
    - Returns the sanitized copy without mutating the input.
  - Emit a structured log for each key stripped: `{ event: 'env_key_stripped', key }` (value is never logged).
- [ ] Integrate `EnvironmentSanitizer` into `SandboxProvider.spawn()`:
  - Before passing the environment to `docker run` or `WebContainerDriver.boot()`, call `sanitizer.sanitize(process.env)` and use the result as the environment for the spawned process/container.
  - Confirm that the `--env` flags passed to Docker do not include any stripped keys.
- [ ] Export `EnvironmentSanitizer` from `packages/sandbox/src/index.ts`.

## 3. Code Review
- [ ] Verify the sanitizer operates on a copy—use `Object.isFrozen` or a reference check in tests to confirm no mutation.
- [ ] Verify the structured log never includes the value of stripped keys, only the key name.
- [ ] Confirm `DEFAULT_SENSITIVE_KEY_PATTERNS` is exported and tested in isolation to verify coverage of at least the following env vars: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `GITHUB_TOKEN`, `NPM_TOKEN`, `OPENAI_API_KEY`, `GCP_SERVICE_ACCOUNT_KEY`, `AZURE_CLIENT_SECRET`, `DATABASE_URL`, `PGPASSWORD`.
- [ ] Verify integration with `SandboxProvider.spawn()` by checking that the Docker command constructed in unit tests contains none of the sensitive `--env` flags.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test` and confirm all unit and property-based tests in `envSanitizer.test.ts` pass.
- [ ] Confirm test coverage for `EnvironmentSanitizer.ts` is ≥ 95% lines/branches.

## 5. Update Documentation
- [ ] Create `packages/sandbox/src/env/env_sanitizer.agent.md` documenting: the full default sensitive key pattern list, the extension API (`additionalDenylist`), and the guarantee that stripped key values are never logged.
- [ ] Update `packages/sandbox/README.md` to include a "Host Environment Sanitization" section explaining that all sensitive host env vars are stripped before any sandbox is spawned.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/sandbox test -- --coverage --coverageThreshold='{"global":{"lines":95}}'` and confirm exit code 0.
- [ ] Run a Docker integration test that sets `AWS_ACCESS_KEY_ID=test123` in the host environment and asserts the container's environment (`docker inspect <id> --format '{{.Config.Env}}'`) does not contain `AWS_ACCESS_KEY_ID`.
