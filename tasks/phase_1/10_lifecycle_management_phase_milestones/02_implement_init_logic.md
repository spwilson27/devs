# Task: Implement ProjectManager Core Logic for `init` (Sub-Epic: 10_Lifecycle Management & Phase Milestones)

## Covered Requirements
- [4_USER_FEATURES-REQ-001]

## 1. Initial Test Written
- [ ] Write an integration test `tests/integration/ProjectInit.test.ts` that:
  - Calls `ProjectManager.init(tempDir, "Test Brief", ["Journey 1"])`.
  - Asserts that `.devs/state.sqlite` is created.
  - Asserts that all mandatory directories (`.agent/`, `src/`, `tests/`, `docs/`, `scripts/`) are present.
  - Asserts that the `projects` table has one entry with the correct brief and status `INITIALIZING`.

## 2. Task Implementation
- [ ] Create `@devs/core/src/lifecycle/ProjectManager.ts`.
- [ ] Implement `static async init(root: string, brief: string, journeys: string[]): Promise<void>`:
  - Check if `root` is empty or already initialized.
  - Use `fs-extra` or `mkdirp` to create the TAS-104 directory structure.
  - Initialize the `state.sqlite` using `@devs/core/persistence`.
  - Create the initial `Project` record in the database.
  - Initialize a new Git repository in the `root` if not already present.
  - Write a basic `package.json` with the required `devs` metadata section.

## 3. Code Review
- [ ] Verify that directory creation is idempotent or handles existing folders gracefully.
- [ ] Ensure the Git initialization doesn't overwrite an existing repo unless specified.
- [ ] Check that the database initialization happens within an ACID transaction.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test tests/integration/ProjectInit.test.ts` and verify all directories and database state are correct.

## 5. Update Documentation
- [ ] Record the `init` command behavior in `docs/user/cli_commands.md`.

## 6. Automated Verification
- [ ] Execute `devs init ./test-project --brief "Hello" --json` and verify the output contains a success message and the filesystem matches expectations.
