# Task: Implement Architecture Freeze guard to prevent unauthorized core-file modifications (Sub-Epic: 11_Blueprint Gate Logic)

## Covered Requirements
- [9_ROADMAP-REQ-002], [8_RISKS-REQ-062]

## 1. Initial Test Written
- [ ] Write unit and integration tests at tests/unit/test_architecture_freeze.py and tests/integration/test_architecture_freeze_api.py. Tests to write first:
  - test_protects_core_paths: attempt to write to a protected path (example: /src/core/ or /docs/blueprint.md) via the agent file-write API and assert the request is denied with HTTP 403 or an exception raised in the internal write function.
  - test_allows_with_approval_token: perform the same write but include a valid approved approval_token and assert the write succeeds.
  - test_git_integrity_block: simulate an automated agent attempting to commit changes to protected files without approval; assert hook denies commit (if using git hook simulation).

## 2. Task Implementation
- [ ] Implement centralized enforcement in the agent file-write gateway (the single location all agents use to write files). Steps:
  - Add configuration file configs/architecture_freeze.yml with protected_paths array and enforcement_mode (soft|strict).
  - Implement a guard middleware at src/agents/file_write_guard.py that, for every requested write operation, checks requested path against protected_paths.
  - If the path matches and there is no valid approved ApprovalToken that covers that document_path and phase, reject the write with a clear error including required approval token id and link to Review Dashboard.
  - If approval token present, verify token status == 'approved' and verify document checksum matches stored checksum before allowing write.
  - Integrate guard into any file-write entrypoints (agent local file abstraction, API endpoints, LangGraph file output nodes) so all writes funnel through the same check.
  - For git-based enforcement, implement an optional commit-time hook script scripts/hooks/pre-commit-architecture-freeze.sh that runs the same check against staged files and rejects commit when protected files changed without an approved token.

## 3. Code Review
- [ ] Verify:
  - Enforcement is centralized (single codepath) and cannot be bypassed by ad-hoc file operations
  - Protected path matching is precise (no accidental over-blocking) and uses canonical absolute path resolution to avoid traversal attacks
  - Error messages are clear and provide remediation steps (how to create approval request)
  - Tests cover both positive (allowed with approval) and negative (blocked without approval) cases

## 4. Run Automated Tests to Verify
- [ ] Run tests: pytest -q tests/unit/test_architecture_freeze.py and tests/integration/test_architecture_freeze_api.py and verify blocking and allow-with-token behaviors.

## 5. Update Documentation
- [ ] Add docs/blueprint-gate/architecture_freeze.md describing protected paths config, enforcement modes, integration points, and guidance for maintainers on how to add/remove protected paths. Add a sample pre-commit hook and instructions for adding it to developer machines/CI.

## 6. Automated Verification
- [ ] Provide scripts/tests/hooks/test_pre_commit_freeze.sh that simulates staging a protected file change and ensures the hook or guard denies the commit when no approval token is present and allows it when a valid approved token is provided. CI can run this as a smoke test for the freeze guard.
