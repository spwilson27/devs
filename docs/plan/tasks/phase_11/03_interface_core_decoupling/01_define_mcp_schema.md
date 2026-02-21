# Task: Define MCP Schema for UI-Core Communication (Sub-Epic: 03_Interface_Core_Decoupling)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-003], [6_UI_UX_ARCH-REQ-008]

## 1. Initial Test Written
- [ ] Create a schema validation test suite in `packages/vscode/tests/mcp_schema.test.ts`.
- [ ] Define JSON Schema expectations for MCP resources: `devs:/project/state`, `devs:/tasks/dag`, and `devs:/agent/logs`.
- [ ] Define expected MCP Tool signatures for UI triggers: `inject_directive`, `approve_requirement`, and `pause_orchestrator`.
- [ ] Write a test that validates a mock MCP response against these schemas to ensure the "Thin UI" contract is enforceable.

## 2. Task Implementation
- [ ] Define the interface types for the UI-Core communication in `packages/vscode/src/mcp/types.ts`.
- [ ] Implement the `UIProtocolSchema` using a library like `zod` to ensure strict typing of all messages passing through the bridge.
- [ ] Document the "Thin UI" rule in a new `INTERFACE_CONTRACT.md` within `@devs/vscode`, explicitly listing that no state transitions may happen outside of these MCP calls.
- [ ] Export these types and schemas for use by both the Extension Host and the Webview.

## 3. Code Review
- [ ] Verify that no business logic (e.g., task sorting, requirement filtering) is leaked into the schema; the schema should return "UI-Ready" data.
- [ ] Ensure all MCP resource URIs follow the `devs://` protocol standard as defined in the TAS.
- [ ] Check that the schemas include `sequence_id` for state desync detection (REQ-050).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/vscode/tests/mcp_schema.test.ts` and ensure all schema validations pass.

## 5. Update Documentation
- [ ] Update `@devs/vscode/README.md` to include the "Interface-Core Decoupling" architecture section, citing the MCP schema as the primary boundary.

## 6. Automated Verification
- [ ] Run a script `scripts/verify_ui_contracts.sh` that checks for the presence of the schema files and ensures they are exported correctly.
