# Task: Implement Prompt Delimiters and CBAC enforcement (Sub-Epic: 20_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-RSK-102]

## 1. Initial Test Written
- [ ] Create tests at tests/orchestrator/test_prompt_sanitizer.py and tests/orchestrator/test_cb_access_control.py.
- [ ] Write tests for prompt sanitization:
  - test_rejects_unbounded_instructions: sanitizer should reject prompts that contain executable instructions not wrapped in strict delimiters (e.g., <<CMD>>...<</CMD>>).
  - test_allows_validly_delimited_commands: sanitizer should extract delimited commands and return them as safe tokens for the Orchestrator to schedule.
- [ ] Write tests for CBAC enforcement:
  - test_cbact_denies_tool_for_unprivileged_role: mock an orchestrator tool request where the caller role lacks permission; enforce_cbact should return False and log the denial.
  - test_cbact_allows_tool_for_privileged_role: privileged role permitted and returns True.
- [ ] Ensure tests are isolated, use small deterministic fixtures, and do not start real IPC servers.

## 2. Task Implementation
- [ ] Implement src/orchestrator/prompt_sanitizer.py exposing:
  - sanitize_prompt(raw_prompt: str) -> Dict{
      "commands": List[str],
      "remainder": str,
      "rejected": bool
    }
  - Sanitizer MUST only extract commands enclosed in strict delimiters (choose a delimiter pattern like <<CMD>>...<</CMD>>), and everything else must be treated as data (not executable).
- [ ] Implement src/orchestrator/cbac.py exposing:
  - has_tool_permission(role: str, tool: str) -> bool
  - enforce_cbact(caller_metadata: Dict, tool: str) -> bool  # returns False if unauthorized and records an audit event
- [ ] Add audit logging hooks (to a provided logger) for denied attempts; keep default logger simple and file-free for unit tests (in-memory capture).
- [ ] Do NOT modify OrchestratorServer IPC code in this task; provide pure functions that the orchestrator can call in a follow-up integration PR.

## 3. Code Review
- [ ] Verify sanitizer uses a strict delimiter grammar and rejects ambiguous inputs; confirm it is resilient to nested delimiter edge-cases and extremely long prompts (truncation policy documented).
- [ ] Confirm CBAC uses a simple allowlist map and clearly documents where role-to-tool mappings are configured.
- [ ] Ensure audit logging has minimal surface area and no sensitive data is written to disk by default.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/orchestrator -q` and verify sanitizer and CBAC tests pass after implementation.

## 5. Update Documentation
- [ ] Add docs/security/cbac_and_prompt_sanitization.md describing the delimiter format, example sanitized output, the CBAC allowlist format, and how OrchestratorServer should integrate these functions.

## 6. Automated Verification
- [ ] Add scripts/verify_prompt_and_cbact.sh that runs the orchestrator sanitization and CBAC unit tests and exits non-zero on failure. Ensure script prints a short summary of allowed/denied checks for CI visibility.
