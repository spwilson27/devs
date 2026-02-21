# Task: Implement `devs purge` Secure Deletion Command (Sub-Epic: 14_GDPR and Compliance Logging)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-079]

## 1. Initial Test Written
- [ ] Create `src/cli/commands/purge/__tests__/purge.command.test.ts`.
- [ ] Write a unit test that mocks `fs` and `crypto` modules, then calls the purge command handler. Assert that for every file under `.devs/` (agent logs, trace files, LanceDB vectors, SQLite state DB, `.env.devs`), the implementation:
  1. Opens the file for writing.
  2. Overwrites the entire file with cryptographically random bytes (`crypto.randomFillSync`) at least **three** times before unlinking — verifying the mock write call count equals `fileCount * 3`.
  3. Calls `fs.unlinkSync` once per file after the overwrite passes.
- [ ] Write an integration test using a temporary directory (`tmp.dirSync()`) populated with realistic `.devs/` structure. Run the purge handler against it and assert that no files remain under `.devs/` after execution completes, and that the directory itself is removed.
- [ ] Write an E2E test (using `execa`) that runs `devs purge --confirm` in a sandboxed workspace and asserts exit code 0 and absence of the `.devs/` directory.
- [ ] Write a test that asserts purge fails (non-zero exit, descriptive error) if run without the `--confirm` flag, preventing accidental deletion.

## 2. Task Implementation
- [ ] Add the `purge` subcommand to `src/cli/commands/purge/purge.command.ts` using the existing Commander.js wiring pattern. Register it in `src/cli/index.ts`.
- [ ] Implement `src/cli/commands/purge/purge.handler.ts`:
  - Accept `options: { confirm: boolean }`.
  - If `!options.confirm`, print an explicit warning listing what will be deleted, then exit with code 1.
  - Recursively walk `.devs/` using `fs.readdirSync` / `fs.statSync` (depth-first, files before directories).
  - For each regular file:
    ```ts
    const size = fs.statSync(filePath).size;
    for (let pass = 0; pass < 3; pass++) {
      const buf = Buffer.alloc(size);
      crypto.randomFillSync(buf);
      fs.writeFileSync(filePath, buf);
      fs.fsyncSync(fd); // flush to disk
    }
    fs.unlinkSync(filePath);
    ```
  - After all files are removed, recursively remove empty directories bottom-up with `fs.rmdirSync`.
  - Write a structured GDPR audit event to stdout (JSON) before deletion begins: `{ event: "purge_initiated", timestamp, user, scope: ".devs/" }`.
- [ ] Add `--confirm` boolean flag documentation to `docs/cli-reference.md` under the `purge` section.

## 3. Code Review
- [ ] Verify the three-pass overwrite uses `crypto.randomFillSync` (not `Math.random` or zeroes) to meet GDPR secure-erasure expectations.
- [ ] Confirm `fs.fsyncSync` is called after each write pass to prevent OS-level buffering from bypassing the overwrite.
- [ ] Confirm the handler does **not** swallow errors silently — all `fs` errors must propagate and exit non-zero.
- [ ] Verify the `--confirm` guard is enforced before any destructive operation, with no bypass path.
- [ ] Check that the pre-deletion JSON audit event is emitted to `stdout` (not `stderr`) so it can be piped/captured by CI systems.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=purge` and confirm all unit, integration, and E2E tests pass with 0 failures.
- [ ] Run `npm run lint` and confirm no new linting errors are introduced.
- [ ] Run `npm run build` and confirm the TypeScript compilation succeeds with no errors.

## 5. Update Documentation
- [ ] Update `docs/cli-reference.md` to document `devs purge [--confirm]` including: purpose, flags, example output, GDPR relevance note.
- [ ] Update the `src/cli/commands/purge/purge.handler.ts` file header with the requirement mapping comment: `// REQ: 5_SECURITY_DESIGN-REQ-SEC-SD-079`.
- [ ] Update `CHANGELOG.md` with an entry under the current phase: "feat(purge): implement GDPR-compliant secure deletion via `devs purge`".
- [ ] Update the agent memory file `docs/agent-memory/phase_14.agent.md` to note that `devs purge` performs 3-pass random overwrite + fsync before unlink.

## 6. Automated Verification
- [ ] Run `node scripts/validate-all.js` (or equivalent `npm run validate`) and confirm exit code 0.
- [ ] Run `npm test -- --coverage --testPathPattern=purge` and confirm line coverage ≥ 90% for `purge.handler.ts`.
- [ ] In CI, add a step that creates a dummy `.devs/` directory, runs `devs purge --confirm`, and asserts with `[ ! -d .devs ]` that the directory no longer exists.
