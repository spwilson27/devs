# Task: Implement Reasoning Log Anonymization for Agent Thoughts (Sub-Epic: 10_Redaction Pipeline Phases)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-039]

## 1. Initial Test Written
- [ ] Create `packages/secret-masker/src/__tests__/reasoning-anonymizer.test.ts`.
- [ ] Write unit tests for `anonymizeReasoningLog(log: AgentThought): AnonymizedThought`:
  - An `AgentThought` whose `content` contains a PII email address (`"checking if user john@example.com is authorized"`) → `AnonymizedThought.content` replaces the email with `[REDACTED_PII_EMAIL]`.
  - An `AgentThought` whose `content` contains a phone number (`"+1-555-867-5309"`) → replaced with `[REDACTED_PII_PHONE]`.
  - An `AgentThought` whose `content` contains a person's name following an identifier pattern (`"user Alice Smith has id"`) → name replaced per configured PII rules (test with a stub `PIINameDetector`).
  - An `AgentThought` whose `content` contains a valid API key (detectable by `phase1Scan`) → replaced with `[REDACTED_<TYPE>_<HASH>]` using the full 3-phase pipeline.
  - An `AgentThought` where the task context (`agentThought.taskContext`) explicitly includes `"PII_REQUIRED"` → content is passed through unmodified (explicit opt-in bypass).
  - `AnonymizedThought.originalHash` is a SHA-256 hash of the original `content` (for audit; never store or log the original).
  - An `AgentThought` with no PII/secrets → returned `AnonymizedThought.content` equals the original `content`; `wasModified === false`.
- [ ] Write a test asserting `AnonymizedThought` shape: `{ content: string, wasModified: boolean, originalHash: string, redactedFields: string[] }`.
- [ ] Confirm tests fail before implementation: `npx jest packages/secret-masker --testPathPattern=reasoning-anonymizer --no-coverage 2>&1 | grep FAIL`.

## 2. Task Implementation
- [ ] Create `packages/secret-masker/src/reasoning-anonymizer.ts` and export:
  ```ts
  export interface AgentThought {
    content: string;
    taskContext?: string[];   // e.g. ['PII_REQUIRED'] to opt out of anonymization
    agentId: string;
    timestamp: number;
  }

  export interface AnonymizedThought {
    content: string;
    wasModified: boolean;
    originalHash: string;      // SHA-256 of original content, for audit correlation
    redactedFields: string[];  // list of types redacted, e.g. ['PII_EMAIL', 'AWS_ACCESS_KEY']
  }

  export function anonymizeReasoningLog(
    thought: AgentThought,
    options?: AnonymizerOptions
  ): Promise<AnonymizedThought>;
  ```
- [ ] `AnonymizerOptions` must include:
  - `skipIfContextIncludes?: string[]` — skip anonymization if `thought.taskContext` contains any of these strings (default: `['PII_REQUIRED']`).
  - `model?: LocalFlashModel` — the flash model for Phase 2 validation (optional, falls back to pattern+entropy only if omitted).
- [ ] Implementation steps:
  1. Check `skipIfContextIncludes` — if bypassed, return `{ content: thought.content, wasModified: false, originalHash: sha256(thought.content), redactedFields: [] }`.
  2. Run `phase1Scan(thought.content)` to detect secrets and high-entropy strings.
  3. If `options.model` provided, run `phase2Validate` to filter false positives.
  4. Additionally, run a dedicated PII scanner (`piiScan`) for email, phone, and name patterns (implement `piiScan` in a separate `pii-patterns.ts` file — see below).
  5. Merge and deduplicate all findings.
  6. Run `phase3Replace` to produce `redactedText`.
  7. Return `AnonymizedThought` with `originalHash = sha256(thought.content)` (computed BEFORE replacement).
- [ ] Create `packages/secret-masker/src/pii-patterns.ts` with PII-specific regex patterns:
  - Email: `RFC-5321` compliant pattern.
  - Phone: E.164 and common US/international formats.
  - IP addresses (v4 and v6) — mark as `PII_IP`.
  - Names: Use a heuristic pattern (two consecutive capitalized words not in a technical allowlist) OR stub with `PII_NAME_PLACEHOLDER` pending NER integration.
  - Export `piiScan(text: string): ScanResult[]` (same `ScanResult` type as phase1).
- [ ] Export `anonymizeReasoningLog` and `piiScan` from `packages/secret-masker/src/index.ts`.

## 3. Code Review
- [ ] Verify `originalHash` is computed from the original content BEFORE any modification (not from `redactedText`).
- [ ] Verify the `PII_REQUIRED` bypass is explicit and requires both opt-in from `taskContext` AND matching `skipIfContextIncludes` config — one alone is not sufficient if default is `['PII_REQUIRED']`.
- [ ] Confirm `piiScan` reuses the same `ScanResult` interface from `phase1-scanner.ts` (not a separate type).
- [ ] Confirm `anonymizeReasoningLog` never logs the original `thought.content` at any log level.
- [ ] Review that `redactedFields` lists types from both the Phase 1/2/3 pipeline AND the PII scanner.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest packages/secret-masker --testPathPattern=reasoning-anonymizer --coverage`.
- [ ] Confirm ≥ 95% line coverage for `reasoning-anonymizer.ts` and `pii-patterns.ts`.

## 5. Update Documentation
- [ ] Add `## Reasoning Log Anonymization` section to `packages/secret-masker/README.md` documenting `AgentThought`, the opt-out mechanism (`PII_REQUIRED`), and the `originalHash` audit field.
- [ ] Update `.agent/memory/phase_2.md` with: "Reasoning log anonymizer operational. Agent thoughts scrubbed of PII + secrets via full 3-phase pipeline. Opt-out via `PII_REQUIRED` task context. Original content hash stored for audit."

## 6. Automated Verification
- [ ] Run `npx jest packages/secret-masker --testPathPattern=reasoning-anonymizer --json --outputFile=/tmp/reasoning_results.json && node -e "const r=require('/tmp/reasoning_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Run `npx tsc --project packages/secret-masker/tsconfig.json --noEmit` to assert zero TypeScript errors.
