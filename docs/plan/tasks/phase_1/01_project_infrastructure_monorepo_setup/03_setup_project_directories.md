# Task: Establish Project Directory Structure & Scaffolding Pattern (Sub-Epic: 01_Project Infrastructure & Monorepo Setup)

## Covered Requirements
- [TAS-040], [TAS-104], [TAS-061]

## 1. Initial Test Written
- [ ] Create a shell script `tests/infrastructure/verify_folder_structure.sh` that checks for:
  - Root `.devs/` directory.
  - Root `.agent/` directory.
  - Root `mcp-server/` directory.
  - Root `src/` directory.
  - Root `tests/` directory.
  - Root `docs/` directory.
  - Root `scripts/` directory.
  - Root `packages/` directory (for the monorepo modules).

## 2. Task Implementation
- [ ] Create the following directories in the root:
  - `.devs/` (for flight recorder, SQLite DB, etc.)
  - `.agent/` (for agent-oriented documentation)
  - `mcp-server/` (for external AI interaction)
  - `src/` (root source if applicable, or for the main entry points)
  - `tests/` (project-wide integration tests)
  - `docs/` (standard documentation)
  - `scripts/` (administrative scripts)
- [ ] Initialize `.devs/` with a `.gitignore` to ensure flight records are not committed to version control by default (unless specified otherwise).
- [ ] Ensure `.devs/` is properly initialized for future SQLite and LanceDB usage.
- [ ] Restrict `Developer Agent` write-access to the `.devs/` directory to prevent state tampering (initially by documenting the rule in `.devs/POLICY.md`).

## 3. Code Review
- [ ] Verify that the folder structure exactly matches the `TAS-104` specification.
- [ ] Confirm transparency and observability are maintained by having clear, descriptive names for all directories.
- [ ] Ensure that `TAS-061` requirement for the flight recorder directory is correctly established.

## 4. Run Automated Tests to Verify
- [ ] Run `bash tests/infrastructure/verify_folder_structure.sh`.
- [ ] Run `tree -L 1` to manually inspect the root structure.

## 5. Update Documentation
- [ ] Update `docs/architecture/directory_structure.md` explaining the purpose of each top-level directory and how the `.devs/` folder acts as the "Flight Recorder".

## 6. Automated Verification
- [ ] A script that verifies the presence of all required folders and reports any missing or extraneous top-level directories.
