# Task: Implement Ephemeral VCS Token Manager (Sub-Epic: 06_Secret and Token Management)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-021]

## 1. Initial Test Written

- [ ] Create `src/security/__tests__/VcsTokenManager.test.ts`.
- [ ] Write a unit test that mocks `child_process.execFile` and asserts that `VcsTokenManager.getSshAgent()` returns an object containing the `SSH_AUTH_SOCK` and `SSH_AGENT_PID` values parsed from a mocked `ssh-agent` invocation.
- [ ] Write a unit test that asserts `VcsTokenManager.getGitHubToken()` returns a short-lived GITHUB_TOKEN from the host environment (via `gh auth token`) and that the token is **not** cached in the database or written to disk.
- [ ] Write a unit test using a temp Git repo that asserts `VcsTokenManager.scanForCredentials(repoPath)` returns a `CredentialScanResult` listing any `.env` files, `*.pem` files, or lines matching API key patterns found in the staged diff.
- [ ] Write a unit test asserting that if `scanForCredentials` finds a secret pattern, it throws a `CredentialLeakDetectedError` with the offending file path and line number.
- [ ] Write a unit test verifying that `VcsTokenManager.installPreCommitHook(repoPath)` writes a shell script to `.git/hooks/pre-commit` that calls the `devs scan-credentials` check, and that the script is executable (`chmod +x`).
- [ ] Write a unit test asserting that `VcsTokenManager.installPreCommitHook` does **not** overwrite an existing hook without appending the check at the end (graceful composition).

## 2. Task Implementation

- [ ] Create `src/security/VcsTokenManager.ts` exporting a singleton class `VcsTokenManager`.
  - [ ] Implement `async getSshAgent(): Promise<SshAgentContext>` — executes `ssh-add -l` to verify the agent has loaded keys; if not, surface a user-facing error (not a crash). Returns `{ SSH_AUTH_SOCK, SSH_AGENT_PID }` from `process.env`.
  - [ ] Implement `async getGitHubToken(): Promise<string>` — shells out to `gh auth token` (GitHub CLI), captures stdout, trims whitespace. If `gh` is not installed, throw `GhCliNotFoundError`. The token is **never** written to disk or DB; it is passed as an in-memory string to Git operations.
  - [ ] Implement `async scanForCredentials(repoPath: string): Promise<CredentialScanResult>` — runs `git diff --cached` in the repo and scans each added line against a list of secret patterns (API key regexes: `AKIA[0-9A-Z]{16}`, `sk-[a-zA-Z0-9]{32,}`, `ghp_[a-zA-Z0-9]{36}`, generic `[A-Z_]+(KEY|SECRET|TOKEN|PASSWORD)\s*=\s*\S+`). Returns matches with file, line number, and pattern name. Throws `CredentialLeakDetectedError` if any match is found.
  - [ ] Implement `async installPreCommitHook(repoPath: string): Promise<void>` — writes or appends to `.git/hooks/pre-commit` a call to `npx devs scan-credentials`; sets the file mode to `0o755`.
- [ ] Create `src/security/errors/CredentialLeakDetectedError.ts` — typed `Error` subclass with fields `filePath: string`, `lineNumber: number`, `patternName: string`.
- [ ] Create `src/security/errors/GhCliNotFoundError.ts` — typed `Error` subclass with a user-friendly message advising installation of the GitHub CLI.
- [ ] Add a CLI sub-command `devs scan-credentials` in `src/cli/commands/scanCredentials.ts` that calls `VcsTokenManager.scanForCredentials(process.cwd())` and exits with code `1` if any secrets are found (for use in CI and the pre-commit hook).
- [ ] Register `scan-credentials` in the CLI command registry (`src/cli/index.ts`).
- [ ] Expose `VcsTokenManager` through `src/security/index.ts`.
- [ ] Update `src/vcs/GitClient.ts` to use `VcsTokenManager.getSshAgent()` / `VcsTokenManager.getGitHubToken()` for all Git operations instead of reading credentials from env or files.

## 3. Code Review

- [ ] Confirm that no credential value is stored in the SQLite state DB or on disk; verify by searching for `db.prepare` calls inside `VcsTokenManager.ts`.
- [ ] Confirm that `getGitHubToken` return value is never passed to a logger (check for `.log(token` patterns).
- [ ] Confirm that all `execFile` / `exec` calls use `{ env: { ...sanitizedEnv } }` to avoid leaking host secrets into child process environments unnecessarily.
- [ ] Verify the secret scanning regex patterns are covered exhaustively (at minimum: AWS, GitHub PAT, generic `KEY=`/`SECRET=`, private keys `-----BEGIN`).
- [ ] Confirm `CredentialLeakDetectedError` redacts the actual secret value in its message and only exposes the file path, line number, and pattern name.
- [ ] Verify the pre-commit hook composition logic handles Windows line endings and CRLF gracefully.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern=VcsTokenManager` and confirm all tests pass with 0 failures.
- [ ] Run `npm run lint` and confirm no lint errors.
- [ ] Run `npm run build` and confirm no TypeScript compilation errors.

## 5. Update Documentation

- [ ] Update `docs/security/secret-management.md` with a section on ephemeral VCS tokens: explains `ssh-agent` delegation, `gh auth token` usage, and the `devs scan-credentials` pre-commit hook.
- [ ] Update `docs/developer-guide/git-operations.md` (create if absent) documenting that `GitClient` now requires `ssh-agent` or GitHub CLI for authentication.
- [ ] Add a `CHANGELOG.md` entry: `feat(security): Ephemeral VCS Token Manager — credentials never committed; pre-commit credential scan hook [REQ-SEC-SD-021]`.
- [ ] Update agent memory `memory/security-decisions.md`: record the decision to use `ssh-agent`/`gh auth token` for VCS auth and the mandatory pre-commit credential scan.

## 6. Automated Verification

- [ ] Run `npm test -- --testPathPattern=VcsTokenManager --coverage` and assert coverage for `src/security/VcsTokenManager.ts` is ≥ 90%.
- [ ] Run `grep -r "credentials\|GITHUB_TOKEN\|\.env" src/vcs/GitClient.ts` and confirm no direct credential references remain.
- [ ] In CI, add a step that runs `npx devs scan-credentials` against the repository itself and assert exit code `0` (no secrets in the codebase).
