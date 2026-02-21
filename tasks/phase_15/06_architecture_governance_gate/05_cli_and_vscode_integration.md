# Task: CLI and VSCode Extension Integration for TAS Revision Gate (Sub-Epic: 06_Architecture Governance Gate)

## Covered Requirements
- [3_MCP-UNKNOWN-301]

## 1. Initial Test Written

- [ ] In `src/cli/__tests__/commands/gate.test.ts`, write integration tests for the `devs gate` CLI subcommand:
  - **`devs gate list --type TAS_REVISION`**: Mock the `manage_hitl_gate { action: "list" }` MCP response and assert the CLI prints a formatted table with columns: `GATE_ID`, `AGENT`, `TASK_ID`, `BLOCKER` (truncated to 60 chars), `CREATED_AT`.
  - **`devs gate approve <gate_id>`**: Mock the `manage_hitl_gate { action: "approve", gate_id }` MCP response with `{ status: "APPROVED" }` and assert the CLI prints `✅ TAS Revision Gate <gate_id> approved. Implementation resuming.` and exits 0.
  - **`devs gate reject <gate_id> --reason "..."`**: Mock the `manage_hitl_gate { action: "reject", ... }` response and assert the CLI prints `❌ TAS Revision Gate <gate_id> rejected. Agent notified with feedback.` and exits 0.
  - **No active gates**: Test `devs gate list --type TAS_REVISION` with an empty list response prints `No active TAS_REVISION gates.` and exits 0.
  - **Unknown gate_id**: Test `devs gate approve <nonexistent>` with `{ code: "GATE_NOT_FOUND" }` response prints an error message and exits 1.
- [ ] In `src/vscode-extension/__tests__/tasRevisionGatePanel.test.ts`, write unit tests for the `TasRevisionGatePanel` webview:
  - Test that the panel renders a `<TasRevisionPanel>` component displaying `blocker_description`, a structured diff view, and `prd_validation` warnings when `violations.length > 0`.
  - Test that clicking "Approve" sends a `postMessage` to the extension host with `{ command: "approveTasGate", gate_id }`.
  - Test that clicking "Reject" with an empty feedback textarea shows a validation error: `"Rejection reason is required."` and does NOT send the message.
  - Test that the panel title bar shows `🔴 TAS REVISION REQUIRED` when a gate is active.

## 2. Task Implementation

- [ ] In `src/cli/commands/gate.ts`, implement the `devs gate` command with subcommands:
  - `list [--type <gate_type>]` — calls `manage_hitl_gate { action: "list", gate_type }` and formats the response as a table using `cli-table3`.
  - `approve <gate_id>` — calls `manage_hitl_gate { action: "approve", gate_id, reviewer_id: "cli-user" }` and prints result.
  - `reject <gate_id> --reason <string>` — calls `manage_hitl_gate { action: "reject", gate_id, feedback: reason, reviewer_id: "cli-user" }` and prints result. `--reason` is required; the command MUST exit 1 with a usage error if omitted.
  - Register the `gate` command in `src/cli/index.ts`.
- [ ] In `src/vscode-extension/panels/TasRevisionGatePanel.ts`, implement a VS Code `WebviewPanel`:
  - Opens automatically when a `HITL_GATE_REQUIRED` SSE event with `gate_type: "TAS_REVISION"` is received by the extension's SSE client.
  - Displays:
    - Gate metadata: `gate_id`, `agent_id`, `task_id`, `created_at`.
    - `blocker_description` text.
    - A diff view of `diff_json` rendered as a two-column "before/after" table (sections listed as rows, changes highlighted in amber).
    - PRD violation warnings (if `prd_validation.violations.length > 0`), displayed as red warning cards.
    - "Approve" button and "Reject" button with a required feedback textarea.
  - On "Approve": calls `vscode.commands.executeCommand("devs.approveTasGate", gate_id)`.
  - On "Reject": validates feedback is non-empty, then calls `vscode.commands.executeCommand("devs.rejectTasGate", gate_id, feedback)`.
- [ ] In `src/vscode-extension/extension.ts`, register the two VS Code commands:
  - `devs.approveTasGate(gate_id)` — sends `manage_hitl_gate { action: "approve", gate_id, reviewer_id: "vscode-user" }` via the MCP client.
  - `devs.rejectTasGate(gate_id, feedback)` — sends `manage_hitl_gate { action: "reject", gate_id, feedback, reviewer_id: "vscode-user" }` via the MCP client.
  - Register SSE event listener for `HITL_GATE_REQUIRED` and open `TasRevisionGatePanel` automatically.

## 3. Code Review

- [ ] Verify the CLI `reject` command enforces the `--reason` flag at the argument parsing level (before any MCP call is made), so agents or users cannot accidentally dismiss a TAS revision without providing feedback.
- [ ] Verify the VSCode panel opens only one instance per `gate_id` — if a second `HITL_GATE_REQUIRED` event for the same `gate_id` arrives, the existing panel is focused rather than a new one opened.
- [ ] Verify the diff view displays the PRD violation warnings prominently (above the fold) when violations exist — users must see constraint conflicts before approving.
- [ ] Verify the CLI table truncates `blocker_description` to 60 characters with `…` suffix to prevent terminal overflow.
- [ ] Verify both the CLI and VSCode commands handle MCP transport errors gracefully (network timeout, connection refused) with a user-facing error message and non-zero exit code / VS Code error notification.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern="cli/commands/gate"` and confirm all CLI tests pass.
- [ ] Run `npm test -- --testPathPattern="tasRevisionGatePanel"` and confirm all VSCode panel tests pass.
- [ ] Run `npm run type-check` and confirm no new TypeScript errors.
- [ ] Run `npm run lint` and confirm no violations.

## 5. Update Documentation

- [ ] Update `docs/user-guide/cli-reference.md` with the `devs gate` command: subcommands, flags, example output, and exit codes.
- [ ] Update `docs/user-guide/vscode-extension.md` with a "TAS Revision Gate" section: screenshots or ASCII mockup of the panel, description of the approve/reject flow, and what happens to the blocked agent after each resolution.
- [ ] Add a `devs gate` entry to the CLI help text (`src/cli/help.ts`).

## 6. Automated Verification

- [ ] Run `node scripts/verify_cli_commands.js` — asserts that `gate`, `gate list`, `gate approve`, and `gate reject` are registered in the CLI command registry. MUST exit 0.
- [ ] Run `node scripts/verify_vscode_commands.js` — asserts that `devs.approveTasGate` and `devs.rejectTasGate` appear in `package.json` `contributes.commands`. MUST exit 0.
- [ ] Run a CLI smoke test: `node dist/cli/index.js gate list --type TAS_REVISION` against the dev MCP server (with no active gates) and assert the output contains `No active TAS_REVISION gates.` and the process exits 0.
