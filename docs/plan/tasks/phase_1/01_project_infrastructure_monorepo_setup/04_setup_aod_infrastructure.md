# Task: AOD Infrastructure & Mapping Rule (Sub-Epic: 01_Project Infrastructure & Monorepo Setup)

## Covered Requirements
- [9_ROADMAP-REQ-041]

## 1. Initial Test Written
- [ ] Create a script `tests/infrastructure/verify_aod_ratio.sh` that:
  - Scans all package `src/` directories for production modules (e.g., `.ts` files).
  - Checks if a corresponding `.agent.md` file exists in `.agent/packages/<pkg_name>/` or a similar directory.
  - Verifies that the ratio of production modules to documentation files is 1:1.

## 2. Task Implementation
- [ ] Initialize the `.agent/` directory with subdirectories for each package:
  - `.agent/packages/core/`
  - `.agent/packages/agents/`
  - `.agent/packages/sandbox/`
  - `.agent/packages/memory/`
  - `.agent/packages/mcp/`
  - `.agent/packages/cli/`
  - `.agent/packages/vscode/`
- [ ] Create initial placeholder `.agent.md` files for each of the main packages.
- [ ] Implement a basic `aod-lint` script in `scripts/aod_lint.py` (or similar) that enforces the 1:1 ratio rule for future development.
- [ ] Set up the "Flight Recorder" pattern in `.agent/` to ensure documentation evolves alongside the code.

## 3. Code Review
- [ ] Verify that the `AOD` directory structure mirrors the `packages/` structure for clear mapping.
- [ ] Ensure `9_ROADMAP-REQ-041` is fundamentally established as a project-wide invariant.
- [ ] Confirm `AOD` files follow a standard, machine-readable format for AI agents.

## 4. Run Automated Tests to Verify
- [ ] Run `python scripts/aod_lint.py` or the equivalent test script.
- [ ] Manually verify at least one module-to-doc mapping.

## 5. Update Documentation
- [ ] Create `docs/infrastructure/aod_policy.md` defining the 1:1 ratio requirement and the format for `.agent.md` files.
- [ ] Explain the importance of `AOD` for "Agent-Oriented Documentation".

## 6. Automated Verification
- [ ] Integration of the `aod-lint` script into the pre-commit or CI/CD pipeline to automatically block PRs that do not maintain the 1:1 ratio.
