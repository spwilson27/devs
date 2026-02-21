# Task: Shared State Manifest & package.json Metadata (Sub-Epic: 01_Project Infrastructure & Monorepo Setup)

## Covered Requirements
- [1_PRD-REQ-INT-013], [TAS-076]

## 1. Initial Test Written
- [ ] Create a shell script `tests/infrastructure/verify_shared_state.sh` that checks:
  - Root `package.json` contains a `"devs"` field with project metadata.
  - Presence of a `.devs/state.sqlite` or a defined path to a shared state file.
  - Verifies that both `packages/cli` and `packages/vscode` can access the same state file location via shared configuration.

## 2. Task Implementation
- [ ] Add a `devs` metadata section to the root `package.json`:
  - `devs`: `{ "version": "1.0.0", "status": "development", "architecture": "monorepo" }`.
- [ ] Define the shared state file path as a constant in a shared package (e.g., `@devs/core/constants`):
  - `STATE_FILE_PATH: ".devs/state.sqlite"`.
- [ ] Create a helper function in `@devs/core/persistence` to resolve the shared state path from any project subdirectory.
- [ ] Ensure that `TAS-076` version manifest is properly initialized for project metadata.

## 3. Code Review
- [ ] Verify that the `devs` metadata section is correctly formatted and contains necessary information for AI agents.
- [ ] Confirm that `1_PRD-REQ-INT-013` real-time state sharing is enabled by a consistent pathing strategy.
- [ ] Ensure the metadata section is extensible for future project requirements.

## 4. Run Automated Tests to Verify
- [ ] Run `bash tests/infrastructure/verify_shared_state.sh`.
- [ ] Run a small node script that imports the shared constant and prints the absolute path from different subdirectories.

## 5. Update Documentation
- [ ] Update `docs/architecture/state_sharing.md` explaining how the CLI and VSCode extension share state through the `.devs/` folder.

## 6. Automated Verification
- [ ] A script that parses `package.json` and ensures the `devs` field is present and correctly typed.
- [ ] A file access test to confirm that both the CLI and extension packages have read/write permissions to the `.devs/` folder.
