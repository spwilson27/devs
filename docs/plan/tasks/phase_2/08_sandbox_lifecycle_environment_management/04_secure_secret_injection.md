# Task: Implement Secure Secret Injection into Sandbox via Stdin/Encrypted Ephemeral Files (Sub-Epic: 08_Sandbox Lifecycle & Environment Management)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-040]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/__tests__/secretInjector.test.ts`, write unit tests for a `SecretInjector` class:
  - Test `injectViaStdin(sandboxId, secrets)`: verify a mock `SandboxProvider.exec` is called with a process that reads from stdin, and that the secrets map is passed as a JSON blob on the process's stdin, not as command-line arguments.
  - Test `injectViaEphemeralFile(sandboxId, secrets)`: verify the secrets JSON is written to a temporary file with permissions `0o400`, the file path is passed to the sandbox (not its content), and the temp file is deleted from the host after injection.
  - Test that neither injection method ever passes any secret value as a command-line argument (assert that the `docker exec` or equivalent command string does not contain any value from the secrets map).
  - Test `injectViaEphemeralFile` with a very large secret payload (>1MB) to confirm it does not truncate or error.
  - Test that if writing the ephemeral file fails, the method throws a `SecretInjectionError` and does not leave a partial file on disk.
  - Write an integration test using a real Docker sandbox: inject a secret map, exec a shell command inside the sandbox that reads the secret from `$DEVS_SECRETS_PATH`, and assert the expected value is present inside the container but never appeared in any host log line.

## 2. Task Implementation
- [ ] Create `packages/sandbox/src/secrets/SecretInjector.ts`:
  - Define `SecretMap = Record<string, string>`.
  - Implement `injectViaStdin(sandboxId: string, secrets: SecretMap): Promise<void>`:
    - Serialize `secrets` to JSON.
    - Use `SandboxProvider.execWithStdin(sandboxId, ['devs-secret-loader'], secretsJson)` to pipe the JSON into a helper process inside the sandbox that reads from stdin and exports variables to the sandbox shell environment.
    - Never include any secret value in the `args` array of the exec call.
  - Implement `injectViaEphemeralFile(sandboxId: string, secrets: SecretMap): Promise<void>`:
    - Write the JSON-serialized secret map to a temp file on the host using `fs.mkstemp` with mode `0o400`.
    - Mount the temp file read-only into the sandbox at a fixed internal path (e.g., `/run/secrets/devs_secrets`).
    - After the sandbox has consumed the file (or after a TTL of 5s), delete the host-side temp file using `fs.unlink`.
    - Set env var `DEVS_SECRETS_PATH=/run/secrets/devs_secrets` inside the sandbox for agent discovery.
  - Implement `inject(sandboxId, secrets, method: 'stdin' | 'ephemeral_file' = 'ephemeral_file')` as the primary entry point that delegates to the appropriate method.
- [ ] Create `packages/sandbox/src/secrets/SecretInjectionError.ts` with typed error carrying `sandboxId` and `method`.
- [ ] Export `SecretInjector`, `SecretMap`, and `SecretInjectionError` from `packages/sandbox/src/index.ts`.
- [ ] Integrate `SecretInjector.inject` into `PreflightService.runPreflight` as the final injection step after codebase and task requirements.

## 3. Code Review
- [ ] Audit the entire `SecretInjector` implementation to confirm no secret value appears in: logged strings, exec `args[]` arrays, or error messages.
- [ ] Verify ephemeral file temp path uses `os.tmpdir()` and a cryptographically random suffix (not a predictable name).
- [ ] Confirm the ephemeral file is always deleted in a `finally` block even if mounting into the sandbox fails.
- [ ] Verify `0o400` permissions are set immediately after file creation, before any content is written.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test` and confirm all unit tests in `secretInjector.test.ts` pass.
- [ ] Run `pnpm --filter @devs/sandbox test:integration` and confirm the Docker integration test passes.
- [ ] Confirm test coverage for `SecretInjector.ts` is ≥ 90%.

## 5. Update Documentation
- [ ] Create `packages/sandbox/src/secrets/secret_injector.agent.md` documenting: both injection methods, when to prefer each, the `DEVS_SECRETS_PATH` contract, the host-side temp file lifecycle, and the security guarantee that secrets never appear in logs or CLI args.
- [ ] Update `packages/sandbox/README.md` to include a "Secret Injection" section.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/sandbox test -- --coverage --coverageThreshold='{"global":{"lines":90}}'` and confirm exit code 0.
- [ ] Run a security scan using `grep -r "secrets\[" packages/sandbox/src/` and assert no line passes a secret value as a string concatenated into a shell command.
- [ ] In the integration test log output, run `grep -v '\[REDACTED\]'` on all captured log lines and assert no line contains any of the injected test secret values.
