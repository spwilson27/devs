# Task: Implement Human Resolution Workflow (CLI + Accept Correction) (Sub-Epic: 02_1_PRD)

## Covered Requirements
- [1_PRD-REQ-HITL-005]

## 1. Initial Test Written
- [ ] Add integration tests at tests/hitl/test_hand_off_resolution_flow.py::test_cli_list_and_resolve that:
  - Uses a TestClient for the API and the project's CLI runner (click.testing.CliRunner or equivalent).
  - Arrange: create a pending hand-off in the DB.
  - Act: run `devs handoff list` and assert the hand-off appears, then run `devs handoff resolve --id <hand_off_id> --notes "applied patch"` and assert the CLI returns success and the DB shows status='resolved'.
  - If the project has no CLI, create a minimal CLI command in src/cli/hand_off.py that calls the existing API client to resolve hand-offs.

## 2. Task Implementation
- [ ] Implement CLI and/or UI glue to let a user accept a correction:
  - Add CLI commands:
    - `devs handoff list [--status pending]` -> lists hand-off ids, tasks, reason, created_at
    - `devs handoff resolve --id <id> --notes <notes> --patch <file>` -> marks hand-off resolved and optionally attaches patch file (accept multipart/form-data or base64 in payload).
  - Implement server-side handler to accept an attached patch: store patch in `hand_off_patches` table or as an attachment reference, then mark hand-off resolved and attach audit entry.
  - Ensure the CLI returns machine-readable output with JSON flag `--json` for automation.

## 3. Code Review
- [ ] Verify:
  - CLI commands are idempotent and handle network failures gracefully.
  - Patch attachments are scanned for size and sanitized before persistence.
  - UX: CLI provides clear guidance and references to open the project in editor for manual correction.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest tests/hitl/test_hand_off_resolution_flow.py -q
  - Expected: tests initially fail until implementation is done, then pass.

## 5. Update Documentation
- [ ] Document the CLI usage in docs/prd/hand_off_spec.md including examples to attach a patch and how to resume the agent after resolution.

## 6. Automated Verification
- [ ] Add CI script scripts/verify_hand_off_cli.sh that runs the CLI in test mode against a test instance and verifies list->resolve flow.
