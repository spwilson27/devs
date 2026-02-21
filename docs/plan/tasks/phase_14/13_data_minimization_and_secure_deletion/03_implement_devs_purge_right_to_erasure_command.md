# Task: Implement `devs purge` Right-to-Erasure Command (Sub-Epic: 13_Data Minimization and Secure Deletion)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-087]

## 1. Initial Test Written
- [ ] Create `src/cli/commands/__tests__/purge.command.test.ts`:
  - Mock `secureDeleteDirectory` and `secureDeleteFile` from `src/core/purge`.
  - Mock `src/core/state/StateManager` (specifically `destroyAll(): Promise<void>`).
  - Mock `src/core/vectors/VectorStore` (specifically `dropAllCollections(): Promise<void>`).
  - Mock `src/core/tracing/TraceStore` (specifically `purgeAllTraces(): Promise<void>`).
  - Test `PurgeCommand.execute(options)`:
    - When called with `{ confirm: true }`, asserts that `secureDeleteDirectory` is called for `.devs/state/`, `.devs/vectors/`, `.devs/traces/`, and `.devs/cache/`.
    - Asserts `StateManager.destroyAll()` is called.
    - Asserts `VectorStore.dropAllCollections()` is called.
    - Asserts `TraceStore.purgeAllTraces()` is called.
    - Asserts execution order: secure-delete files FIRST, then DB-level destroy calls.
    - When called with `{ confirm: false }` (no `--yes` flag), asserts that an interactive prompt is shown (mock `inquirer.prompt`) and deletion only proceeds if user confirms "yes".
    - When user answers "no" at prompt, asserts no deletion occurs.
    - When `--dry-run` flag is set, asserts all operations are skipped and a list of paths that *would* be deleted is printed instead.
    - Asserts that the command emits a `PurgeCompleteEvent` to the event bus upon success.
    - Asserts a structured summary is logged: count of files deleted, total bytes overwritten, duration.

## 2. Task Implementation
- [ ] Create `src/cli/commands/purge.command.ts`:
  - Import `secureDeleteDirectory` from `src/core/purge`.
  - Import `StateManager`, `VectorStore`, `TraceStore` from their respective modules.
  - Import `inquirer` for interactive confirmation.
  - Define `PurgeOptions` interface: `{ confirm: boolean; dryRun: boolean; projectRoot: string }`.
  - Implement `PurgeCommand` class with `execute(options: PurgeOptions): Promise<PurgeSummary>`:
    1. If `!options.confirm && !options.dryRun`, prompt: `"This will permanently and securely erase ALL devs project state, vectors, and traces. Type 'yes' to confirm:"`.
    2. If `options.dryRun`, enumerate and print all paths, return without deleting.
    3. Define target paths: `['.devs/state', '.devs/vectors', '.devs/traces', '.devs/cache']` relative to `options.projectRoot`.
    4. For each path: call `secureDeleteDirectory(resolvedPath)`.
    5. Call `StateManager.destroyAll()`, `VectorStore.dropAllCollections()`, `TraceStore.purgeAllTraces()` in sequence.
    6. Emit `PurgeCompleteEvent` to the global event bus.
    7. Return `PurgeSummary` `{ filesDeleted, bytesOverwritten, durationMs }`.
    - Add comment: `// [5_SECURITY_DESIGN-REQ-SEC-SD-087] Right-to-erasure: recursively purge all state, vectors, and traces.`
- [ ] Register `PurgeCommand` in `src/cli/cli.ts` under the `purge` subcommand with `--yes` / `-y` flag (skip confirmation) and `--dry-run` flag.
- [ ] Add `PurgeCompleteEvent` to `src/core/events/eventTypes.ts`.

## 3. Code Review
- [ ] Verify the command does NOT accept `--force` without `--yes` — confirmation must be explicit.
- [ ] Verify the `dryRun` path enumerates ALL the same paths the real execution would hit (no discrepancy).
- [ ] Verify `StateManager.destroyAll()` is only called AFTER `secureDeleteDirectory` completes for all paths (not in parallel).
- [ ] Verify the command is registered in the CLI help text and shows in `devs --help` output.
- [ ] Verify `PurgeSummary` is logged at `INFO` level (not `DEBUG`) for auditability.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/cli/commands/__tests__/purge.command.test.ts --coverage` and confirm all tests pass with ≥ 90% branch coverage.
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript errors.
- [ ] Run smoke test: `node dist/cli.js purge --dry-run` and confirm it prints the list of paths without deleting anything.

## 5. Update Documentation
- [ ] Add `docs/cli/purge.md` documenting: usage (`devs purge [--yes] [--dry-run]`), what is deleted, the execution sequence, and the `PurgeSummary` output format.
- [ ] Update `README.md` CLI reference section with a `purge` entry.
- [ ] Update `docs/agent-memory/phase_14_decisions.md` with: "`devs purge` implements right-to-erasure (SD-087): securely deletes state, vectors, traces, and cache, then calls DB-level destroy methods. Requires explicit `--yes` confirmation."

## 6. Automated Verification
- [ ] Run `node scripts/e2e/verify-purge-command.js` (create if absent): sets up a temp `.devs/` directory with dummy state files, runs `node dist/cli.js purge --yes --project-root <tmpDir>`, then asserts that none of the original files exist and that `.devs/` itself is gone. Exit code 0 = pass.
- [ ] Confirm `npm run validate-all` passes.
