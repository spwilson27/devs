# Task: Implement TUI Stream Secret Redaction (Sub-Epic: 12_TUI Log Streaming & Event Support)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-069]

## 1. Initial Test Written
- [ ] Create a unit test for the `TUIStreamRedactor` utility.
- [ ] Verify that strings containing common API key patterns (e.g., `gsk_...`, `sk-ant-...`) are replaced with `[REDACTED_KEY_...]`.
- [ ] Verify that high-entropy strings (Shannon Entropy > 4.5) are also flagged and redacted.
- [ ] Verify that redaction happens *before* the log is added to the TUI state/buffer.

## 2. Task Implementation
- [ ] Create `packages/cli/src/tui/utils/redactor.ts`.
- [ ] Integrate with the core `@devs/core/security` `SecretMasker` if possible, or implement a lightweight version for the CLI.
- [ ] Add a middleware layer to the `TUIEventBus` or a hook in `LogTerminal` that processes all incoming text through the redactor.
- [ ] Ensure the redaction logic respects the 12-character SHA-256 hash correlation requirement from `5_SECURITY_DESIGN-REQ-SEC-RSK-201`.
- [ ] Add a visual style (e.g., dimmed or yellow text) for `[REDACTED]` tokens to make them stand out to the user.

## 3. Code Review
- [ ] Ensure that redaction doesn't significantly impact log streaming latency.
- [ ] Verify that the redactor doesn't accidentally mangle legitimate technical artifacts (e.g., long git hashes that are not secrets).
- [ ] Check that the redactor is applied to *all* event types that might contain user or agent data (THOUGHT, OBSERVATION, etc.).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test redactor.test.ts`.

## 5. Update Documentation
- [ ] Update the Security section of the TUI documentation to confirm that real-time streams are sanitized.

## 6. Automated Verification
- [ ] Feed a log event containing a mock OpenAI API key to the TUI and verify via `ink-testing-library` that the rendered output contains the `[REDACTED_...` string instead of the raw key.
