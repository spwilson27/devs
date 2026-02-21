# Task: Implement Suspended Sandbox Access (Sub-Epic: 32_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-062]

## 1. Initial Test Written
- [ ] Write an integration test in `src/sandbox/sandbox-manager.test.ts` that simulates a task failure.
- [ ] Assert that the `SandboxManager` does *not* automatically destroy the Docker/WebContainer instance when the orchestrator transitions to a failed state.
- [ ] Write a test for the `devs debug --task <ID>` CLI command to verify it successfully retrieves the container ID associated with the failed task and executes an interactive shell session.

## 2. Task Implementation
- [ ] Update `src/sandbox/sandbox-manager.ts` to accept a `keepAliveOnFailure` flag.
- [ ] Modify the orchestration loop so that upon definitive task failure (exhausted retries or critical error), the sandbox is paused/kept alive rather than torn down, and its container ID is logged to the SQLite `tasks` table under a new `suspended_container_id` column.
- [ ] Create a new CLI command `devs debug` in `src/cli/commands/debug.ts`.
- [ ] Implement argument parsing to accept `--task <ID>`. If no ID is provided, default to the most recently failed task.
- [ ] Implement the logic to look up the `suspended_container_id` from the database.
- [ ] Use `child_process.spawn` to execute `docker exec -it <container_id> /bin/bash` (or `sh`), piping `stdio: 'inherit'` to give the user direct, one-click terminal access into the container.
- [ ] Implement cleanup logic so that when the user resumes or starts a new task, old suspended containers are properly garbage collected.

## 3. Code Review
- [ ] Ensure that the `stdio: 'inherit'` binding correctly handles terminal resizing and Ctrl+C interrupts without killing the parent `devs` CLI process unexpectedly.
- [ ] Verify that suspended containers do not accumulate indefinitely and consume excessive disk space/memory (garbage collection is robust).
- [ ] Ensure the command gracefully handles WebContainer environments (which may require a different terminal attachment approach than Docker).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- src/sandbox/sandbox-manager.test.ts` and `npm test -- src/cli/commands/debug.test.ts`.
- [ ] Manually verify (or use E2E scripts) that zombie containers are not left behind after a successful debugging session.

## 5. Update Documentation
- [ ] Document the `devs debug` command in `docs/cli.md`.
- [ ] Update the debugging guide in `docs/debugging.md` to explain how users can drop into a failed sandbox to manually inspect state.

## 6. Automated Verification
- [ ] Run a shell script that mocks a failed task, invokes `devs debug --task <mock_id>`, and passes an `ls` command into the stdin of the spawned process, asserting that it returns the directory listing of the container and exits cleanly.