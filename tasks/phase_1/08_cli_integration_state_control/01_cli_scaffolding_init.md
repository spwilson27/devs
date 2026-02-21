# Task: CLI Scaffolding & `init` Command (Sub-Epic: 08_CLI Integration & State Control)

## Covered Requirements
- [1_PRD-REQ-INT-001]

## 1. Initial Test Written
- [ ] Write integration tests in `packages/cli/tests/init.spec.ts` using `execa` to verify:
    - Running `devs init` in an empty directory creates the `.devs` folder.
    - Creating `.devs/state.sqlite` with the correct schema.
    - Initializing a `.gitignore` if it doesn't exist, including `.devs` (except state.sqlite if requested, though typically .devs is ignored).
    - Verifying exit code 0 on success.

## 2. Task Implementation
- [ ] Create the `@devs/cli` package in `packages/cli`.
- [ ] Set up `commander` or `yargs` to handle CLI routing.
- [ ] Implement the `init` command:
    - Check for existing `.devs` folder and warn if already initialized.
    - Create `.devs` directory with `0700` permissions.
    - Use `@devs/core/persistence` to initialize the `state.sqlite` database.
    - Populate initial metadata in the `projects` table.
- [ ] Configure `bin` in `package.json` to map `devs` to the entry script.

## 3. Code Review
- [ ] Verify that `@devs/cli` correctly imports from `@devs/core`.
- [ ] Ensure that path normalization handles cross-platform differences (Windows/Unix).
- [ ] Check that `init` provides clear feedback to the user on success/failure.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test --filter @devs/cli` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update `packages/cli/README.md` with usage instructions for `devs init`.
- [ ] Update the CLI "memory" or `.agent.md` file reflecting the CLI structure.

## 6. Automated Verification
- [ ] Run a script that performs a clean `devs init` in a temp directory and validates the existence of `.devs/state.sqlite` via `sqlite3` command-line tool.
