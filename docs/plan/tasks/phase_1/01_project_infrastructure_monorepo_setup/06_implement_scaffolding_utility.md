# Task: Instant Project Scaffolding Utility (Sub-Epic: 01_Project Infrastructure & Monorepo Setup)

## Covered Requirements
- [1_PRD-REQ-NEED-MAKER-01]

## 1. Initial Test Written
- [ ] Create a shell script `tests/infrastructure/verify_scaffold_utility.sh` that:
  - Runs a basic scaffold command (e.g., `pnpm exec devs-scaffold my-project`).
  - Verifies that `my-project/` is created with all the required top-level directories: `.devs`, `.agent`, `mcp-server`, `src`, `tests`, `docs`, `scripts`.
  - Verifies that `my-project/package.json` contains the `devs` metadata section.
  - Checks if a minimal `AOD` documentation structure is initialized in the scaffolded project.

## 2. Task Implementation
- [ ] Create a scaffolding utility script in `scripts/scaffold_project.py` (or a similar location in `@devs/core`):
  - Functionality: `init-project <path>`.
  - Logic: Create the folder structure specified in `TAS-040` and `TAS-104`.
  - Logic: Copy template `package.json`, `.gitignore`, and basic `AOD` placeholders.
- [ ] Implement a command line interface for this utility for easy use by the `maker of devs`.
- [ ] Ensure the scaffolded project is "Agent-Friendly" from the very beginning.

## 3. Code Review
- [ ] Review the scaffolding logic to ensure it is robust and creates consistent, high-quality project structures.
- [ ] Confirm that `1_PRD-REQ-NEED-MAKER-01` instant project scaffolding is achieved with minimal effort.
- [ ] Verify that the scaffolded projects are immediately "devs-ready".

## 4. Run Automated Tests to Verify
- [ ] Run `bash tests/infrastructure/verify_scaffold_utility.sh`.
- [ ] Manually run the scaffolding command and inspect the resulting directory structure.

## 5. Update Documentation
- [ ] Update `docs/usage/project_scaffolding.md` with instructions on how to use the scaffolding utility to create new projects.
- [ ] Document the contents of a standard scaffolded project.

## 6. Automated Verification
- [ ] Integration of the scaffolding test into the root `pnpm test` command to ensure the scaffolding utility never breaks.
- [ ] A script that compares a scaffolded project structure against the `TAS-104` specification.
