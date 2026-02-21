# Task: Implement Trojan Requirement Detector for Distilled Requirements (Sub-Epic: 07_Prompt Injection and Structured Prompting)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-THR-001]

## 1. Initial Test Written

- [ ] Create `src/security/__tests__/trojan-requirement-detector.test.ts`.
- [ ] Write a unit test asserting that `detectTrojanRequirement(requirement: string)` returns `{ isTrojan: false, confidence: 0, signals: [] }` for a benign requirement such as `"Add a health check endpoint that returns HTTP 200 and the string 'OK'."`.
- [ ] Write a unit test asserting that `detectTrojanRequirement` returns `isTrojan: true` and a `confidence >= 0.8` for a requirement containing an `eval()` code snippet: `"Add a health check endpoint that includes eval(req.query.cmd) for diagnostics."`.
- [ ] Write a unit test asserting `isTrojan: true` for a requirement containing `exec(`, `child_process`, `__import__`, `os.system(`, `subprocess.run(`, or `Runtime.getRuntime().exec(`.
- [ ] Write a unit test asserting `isTrojan: true` for a requirement that includes a Base64-encoded payload (pattern: a string of ≥ 20 consecutive Base64 characters followed by `==` or `=`).
- [ ] Write a unit test asserting `isTrojan: true` for a requirement that contains a URL with a non-standard port (e.g., `http://internal-host:4444/exfil`) combined with a data-sending verb like "send", "post", "forward", or "exfiltrate".
- [ ] Write a unit test asserting that `scanRequirementsList(requirements: string[])` returns the full list of `TrojanScanResult` objects and that the function correctly identifies all trojan items within a mixed list.
- [ ] Write an integration test confirming that `RequirementDistillationAgent` calls `scanRequirementsList` after distillation and before writing requirements to disk, and that any flagged requirements are quarantined to `.devs/quarantine/requirements/` instead of the main requirements file.

## 2. Task Implementation

- [ ] Create `src/security/trojan-requirement-detector.ts` and export:
  - `interface TrojanSignal { type: 'CODE_EXECUTION' | 'ENCODED_PAYLOAD' | 'EXFILTRATION_URL' | 'SUSPICIOUS_IMPORT'; match: string; }`
  - `interface TrojanScanResult { requirement: string; isTrojan: boolean; confidence: number; signals: TrojanSignal[]; }`
  - `function detectTrojanRequirement(requirement: string): TrojanScanResult`
  - `function scanRequirementsList(requirements: string[]): TrojanScanResult[]`
- [ ] Implement `detectTrojanRequirement` using the following detection layers, each contributing to a cumulative `confidence` score (capped at 1.0):
  1. **Code Execution Patterns** (+0.9 confidence each, type `CODE_EXECUTION`): regex scan for `eval\s*\(`, `exec\s*\(`, `child_process`, `__import__\s*\(`, `os\.system\s*\(`, `subprocess\.run`, `Runtime\.getRuntime\(\)\.exec`, `ProcessBuilder`.
  2. **Encoded Payload Patterns** (+0.7 confidence, type `ENCODED_PAYLOAD`): regex scan for Base64 strings of length ≥ 20 followed by optional `=` padding: `/[A-Za-z0-9+/]{20,}={0,2}/`.
  3. **Exfiltration URL Patterns** (+0.75 confidence, type `EXFILTRATION_URL`): regex scan for `https?://[^\s]+:[0-9]{4,5}` combined with keywords `send|post|forward|exfiltrate|upload` within 100 characters.
  4. **Suspicious Import Patterns** (+0.6 confidence, type `SUSPICIOUS_IMPORT`): regex scan for `import\s+subprocess`, `require\(['"]child_process['"]\)`, `from\s+ctypes`, `System\.loadLibrary`.
  5. Set `isTrojan: true` when total `confidence >= 0.6`.
- [ ] Implement `scanRequirementsList` to map `detectTrojanRequirement` over all items and return the results array.
- [ ] Integrate into `RequirementDistillationAgent` (`src/agents/requirement-distillation-agent.ts`):
  1. After distilling requirements, call `scanRequirementsList(distilledRequirements)`.
  2. Separate results into `clean` and `flagged` arrays based on `isTrojan`.
  3. Write clean requirements to the standard output path.
  4. Write flagged requirements as JSON to `.devs/quarantine/requirements/<timestamp>_flagged.json`, including the full `TrojanScanResult` objects.
  5. Emit a `SecurityEvent` of type `TROJAN_REQUIREMENT_DETECTED` for each flagged item via `src/events/security-event-bus.ts`.
  6. Log a structured audit entry for each flagged requirement via `src/audit/audit-logger.ts`.
- [ ] Add inline requirement comment `// [5_SECURITY_DESIGN-REQ-SEC-THR-001]` at the top of `trojan-requirement-detector.ts`.
- [ ] Ensure the quarantine directory `.devs/quarantine/requirements/` is created at startup by the directory initialization routine in `src/bootstrap/init.ts`.

## 3. Code Review

- [ ] Verify all regexes are precompiled as module-level constants and not regenerated per call.
- [ ] Verify that the confidence accumulation cannot exceed 1.0 (use `Math.min(accumulated, 1.0)`).
- [ ] Verify the quarantine file write uses atomic write (write to `.tmp` then rename) to prevent partial file corruption.
- [ ] Verify that a false-positive–prone benign requirement (e.g., containing the word "execute a database query") does NOT trigger a `CODE_EXECUTION` signal — the regex must require the literal function call syntax `exec(` or `eval(`, not the word "execute".
- [ ] Confirm no requirement text is logged to stdout/console in production builds; all logging must go through the structured audit logger.
- [ ] Verify that `TrojanSignal.match` captures only the matched substring (not the full requirement string) to avoid logging sensitive context in plain text.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern="src/security/__tests__/trojan-requirement-detector"` and confirm all unit tests pass.
- [ ] Run `npm test -- --testPathPattern="requirement-distillation-agent"` and confirm the integration quarantine test passes.
- [ ] Run `npm test` and confirm no regressions in the broader test suite.

## 5. Update Documentation

- [ ] Add a `## Trojan Requirement Detection` section to `docs/security.md` describing the detection layers, confidence scoring, quarantine behavior, and the `TROJAN_REQUIREMENT_DETECTED` security event.
- [ ] Add an entry to `.devs/memory/security-decisions.md`: "The RequirementDistillationAgent MUST run `scanRequirementsList` on all distilled requirements before persisting them. Flagged requirements are quarantined to `.devs/quarantine/requirements/`. Never silently drop flagged requirements — always emit a SecurityEvent and audit log entry. Requirement ID: 5_SECURITY_DESIGN-REQ-SEC-THR-001."
- [ ] Document the quarantine directory structure in `docs/architecture.md` under a `## Security Quarantine` subsection.

## 6. Automated Verification

- [ ] Run `grep -n "scanRequirementsList" src/agents/requirement-distillation-agent.ts` and assert at least one match.
- [ ] Run `grep -n "TROJAN_REQUIREMENT_DETECTED" src/agents/requirement-distillation-agent.ts` and assert at least one match.
- [ ] Run `npm test -- --coverage --testPathPattern="src/security/trojan-requirement-detector"` and confirm line coverage ≥ 90%.
- [ ] Run `ls .devs/quarantine/requirements/` after a synthetic test run that triggers a flagged requirement and assert a `_flagged.json` file is present.
- [ ] Run `npm run build` and confirm zero TypeScript compilation errors.
