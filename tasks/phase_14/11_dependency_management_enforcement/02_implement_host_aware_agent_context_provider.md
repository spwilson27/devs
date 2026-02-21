# Task: Implement Host-Aware Agent Context Provider with Sensitive Data Sanitization (Sub-Epic: 11_Dependency Management Enforcement)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-QST-002]

## 1. Initial Test Written

- [ ] In `src/agents/__tests__/hostContextProvider.test.ts`, write unit tests for a `HostContextProvider` class:
  - `getHostContext(): HostContext` — returns an object with `os.type()`, `os.release()`, `os.arch()`, `process.platform`, and `process.version` (Node.js version).
  - Assert that `getHostContext()` does **not** include any of: `HOME`, `USER`, `USERNAME`, `PATH`, `SHELL`, `AWS_*`, `GOOGLE_*`, `OPENAI_*`, `GITHUB_TOKEN`, or any key matching `/.*_KEY$/i` or `/.*_SECRET$/i`.
  - Assert that if `process.env.DEVS_ALLOWED_ENV_KEYS` is set to `"NODE_ENV,CI"`, only those keys are included in the returned context under a `permittedEnv` field.
  - Test a `sanitizeEnv(env: NodeJS.ProcessEnv, allowlist: string[]): Record<string, string>` helper that strips all keys not in the allowlist and redacts values matching the pattern `/(key|secret|token|password|credential)/i`.
- [ ] In `src/agents/__tests__/hostContextProvider.integration.test.ts`:
  - Set `process.env` to a fixture containing both safe (`NODE_ENV=test`) and sensitive (`AWS_SECRET_ACCESS_KEY=abc`) keys.
  - Call `getHostContext()` and assert `AWS_SECRET_ACCESS_KEY` is absent.
  - Assert the returned `HostContext` object is JSON-serializable (no circular refs, no functions).
- [ ] Write a test asserting that passing the `HostContext` object through `JSON.stringify` and back produces an identical object (round-trip safety for agent prompt injection).

## 2. Task Implementation

- [ ] Create `src/agents/hostContextProvider.ts` exporting `HostContextProvider`:
  - Read the permitted env key allowlist from `devs.config.json` → `agentPolicy.permittedHostEnvKeys: string[]` (default: `["NODE_ENV", "CI", "DEVS_LOG_LEVEL"]`).
  - Implement `getHostContext(): HostContext`:
    ```
    {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      osType: os.type(),
      osRelease: os.release(),
      permittedEnv: sanitizeEnv(process.env, allowlist)
    }
    ```
  - Implement `sanitizeEnv(env, allowlist)`: iterate `env`, include only keys in `allowlist`, and for each value run `redactSensitiveValue(value)`.
  - Implement `redactSensitiveValue(value: string): string`: if value matches `/^(ghp_|ghs_|sk-|AKIA)/` or the key name matches `/(key|secret|token|password|credential)/i`, return `"[REDACTED]"`, otherwise return the original value.
- [ ] Create `src/agents/hostContext.types.ts` declaring the `HostContext` interface and `HostContextConfig` interface for the config schema.
- [ ] Integrate `HostContextProvider` into the agent prompt builder in `src/agents/promptBuilder.ts`:
  - Accept an optional `hostContext?: HostContext` parameter.
  - When provided, append a clearly delimited section `<!-- HOST_CONTEXT_START --> ... <!-- HOST_CONTEXT_END -->` to the system prompt containing only the serialized `HostContext`.
  - Never append raw `process.env` to any agent prompt.
- [ ] Add `agentPolicy.permittedHostEnvKeys` to the `devs.config.json` schema in `src/config/schema.ts`.
- [ ] Add a Zod schema validator for `HostContext` in `src/agents/hostContext.schema.ts` to validate the shape before it is injected into prompts (guards against future regressions adding sensitive fields).

## 3. Code Review

- [ ] Confirm `HostContextProvider` never reads from `process.env` directly in production paths — it must go through `sanitizeEnv` with an explicit allowlist.
- [ ] Verify `redactSensitiveValue` patterns are tested for false-positive and false-negative cases (e.g., `NODE_ENV` should not be redacted; `MY_API_KEY` should be redacted regardless of value).
- [ ] Ensure the `HostContext` object is marked `as const` / `Readonly<HostContext>` so agents cannot mutate it.
- [ ] Confirm the Zod schema in `hostContext.schema.ts` is used at runtime (not just at test time) to validate the final `HostContext` before prompt injection.
- [ ] Verify there are no other code paths in `src/agents/` that directly access `process.env` without going through `sanitizeEnv`; use a grep check: `grep -rn "process\.env\." src/agents/ --include="*.ts" | grep -v "hostContextProvider"` should return zero results.

## 4. Run Automated Tests to Verify

- [ ] Run `npx jest src/agents/__tests__/hostContextProvider.test.ts --coverage` and confirm ≥95% branch coverage on `hostContextProvider.ts`.
- [ ] Run `npx jest src/agents/__tests__/hostContextProvider.integration.test.ts` and confirm all pass.
- [ ] Run `npx jest --testPathPattern="agents"` and confirm no regressions in existing agent tests.
- [ ] Run `npx tsc --noEmit` to confirm no type errors.
- [ ] Run the grep audit: `grep -rn "process\.env" src/agents/ --include="*.ts" | grep -v "hostContextProvider"` — assert output is empty.

## 5. Update Documentation

- [ ] Update `docs/security.md` with a new section **"Host-Aware Agent Context"** describing: what information agents may receive about the host, how the allowlist is configured, and what is always redacted.
- [ ] Update `docs/agent-memory/phase_14_decisions.md` with: "Agent host context is provided exclusively through `HostContextProvider.getHostContext()`. Direct `process.env` access in agent code is prohibited. Permitted env keys are configured via `agentPolicy.permittedHostEnvKeys`."
- [ ] Update `docs/configuration.md` documenting the `agentPolicy.permittedHostEnvKeys` config field with its default value and security implications.

## 6. Automated Verification

- [ ] Run `bash scripts/validate-all.sh` and confirm `hostContextProvider` tests execute and pass with zero failures.
- [ ] Run the automated grep audit as a CI step: add a step to `ci.yml` that runs `grep -rn "process\.env" src/agents/ --include="*.ts" | grep -v hostContextProvider` and fails if any output is produced.
- [ ] Run a prompt injection smoke test: call `HostContextProvider.getHostContext()` in a test harness, serialize it, and assert the string does not contain any value from a list of known-sensitive fixture env vars (`AWS_SECRET_ACCESS_KEY`, `GITHUB_TOKEN`, etc.).
