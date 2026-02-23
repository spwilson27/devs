# Agent Memory — Sandbox Package

- Architectural Decision: `SandboxLifecycleManager.runInSandbox()` is the single entry point for all agent task execution. It guarantees:
  1. Fresh ephemeral sandbox per task (unique SandboxContext.id per run).
  2. Pre-flight command execution from SandboxLifecycleConfig.preFlightCommands before task code.
  3. Sandbox destruction in all exit paths (success, error, timeout) with a let-guard to avoid double-destroy.
  4. 5-minute total timeout by default (totalTimeoutMs default: 300_000 ms).

- Architectural Decision: DockerDriver enforces runtime security for provisioned containers. The runtime HostConfig is constructed centrally (buildHostConfig) and must include CapDrop:["ALL"], SecurityOpt:["no-new-privileges:true"], and Privileged:false; deviations throw SecurityConfigError.

- Brittle Areas:
  - Ensure providers implement provision()/exec()/destroy() correctly; provider.destroy must be safe to call even after partial failures.
  - Changing CapDrop/SecurityOpt/Privileged requires a formal security review; these are hard constraints enforced by runtime validation.

  - Image resolution relies on an external registry; ensure registry timeouts are enforced to avoid long provisioning delays.

- Recent Changelog:
  - Implemented SandboxLifecycleManager, SandboxLifecycleConfig, errors (SandboxPreFlightError, SandboxTimeoutError), and unit tests for lifecycle behaviour.
  - [2026-02-22] Added DockerDriver security hardening: buildHostConfig, SecurityConfigError, DockerDriverSecurity.spec.ts, verify-security-config.ts, and documentation updates to DockerDriver.agent.md and README.
  - Added ImageResolver and ImageRebuilder for image fallback and local reconstruction (phase_2 task).
  - [2026-02-22] Phase 2 decision: Non-JS runtimes (Python, Go, Rust) are not supported in WebContainerDriver. RuntimeCompatibilityChecker gates exec() calls and throws UnsupportedRuntimeError. Fallback to DockerDriver is the recommended path.
  - [2026-02-22] Implemented per-call execution timeout (1_PRD-REQ-SEC-010) via withExecutionTimeout in src/utils/execution-timeout.ts; default is 300_000 ms (5 minutes).
  - [2026-02-23] Implemented ResourceExhaustionHandler (src/handlers/resource-exhaustion-handler.ts) and added SandboxManager (src/SandboxManager.ts) with unit tests; ResourceExhaustionHandler emits sandbox:oom and sandbox:cleanup_complete and performs forced container stop + tmpdir cleanup. Marked resource-exhaustion detection & ephemeral cleanup as partially implemented; wiring to DockerDriver and additional SandboxManager tests remain as next steps.


- Architectural Decision: EnvironmentSanitizer will be used to sanitize host environment variables before any sandbox runtime is booted; DockerDriver.provision passes a sanitized env to the docker CLI, and WebContainerDriver.boot runs with a temporarily sanitized process.env to avoid exposing host secrets to in-process runtimes.

- Brittle Areas:
  - Temporarily swapping process.env for WebContainer boot is a pragmatic mitigation but may interact badly with modules that read environment variables at import-time; prefer passing env explicitly to children when possible.
  - Ensure any future changes that call external CLIs (docker, docker-compose, other shell tools) use a sanitized environment to avoid accidental leakage of host secrets into command arguments or child processes.

- Recent Changelog:
  - [2026-02-23] Added EnvironmentSanitizer (src/env/EnvironmentSanitizer.ts), unit and property-based tests (src/__tests__/envSanitizer.test.ts), integrated sanitizer into DockerDriver.provision and WebContainerDriver.boot, added agent docs (src/env/env_sanitizer.agent.md) and README section for Host Environment Sanitization.


- Architectural Decision: Session key rotation uses an ephemeral 128-bit key generated with Node.js crypto.randomBytes(16). The SessionKeyManager (src/keys/SessionKeyManager.ts) is a process-scoped singleton (exported as `sessionKeyManager`) that manages keys in-memory via a Map<string, Buffer> and enforces explicit register -> revoke semantics to avoid accidental overwrites.
  - generateKey(): Buffer uses crypto.randomBytes(16) as the sole entropy source.
  - registerKey(sandboxId, key): throws if a key already exists for the sandboxId.
  - revokeKey(sandboxId): zeroes the Buffer using Buffer.fill(0) before deleting the entry and emits structured log `{ event: 'session_key_rotated', sandboxId }` (the key value is never logged).
  - DEVS_SESSION_KEY is passed to sandboxes via SecretInjector as a hex-encoded string (injected via stdin or ephemeral file), never as a command-line argument.

- Brittle Areas:
  - Zeroing memory with Buffer.fill reduces exposure but cannot guarantee that previous copies don't exist elsewhere (V8 may move/copy buffers). For stronger guarantees consider using native secure-zero APIs in a future phase.
  - Secret delivery relies on provider implementations of execWithStdin and ephemeral-file semantics; ensure providers do not echo or log secrets and that ephemeral files are removed promptly.

- Recent Changelog:
  - [2026-02-23] Implemented SessionKeyManager (src/keys/SessionKeyManager.ts), added unit and integration tests (src/__tests__/sessionKey.test.ts), integrated key generation/injection in PreflightService and revocation in SandboxLifecycleManager, and added session_key.agent.md and README updates describing the DEVS_SESSION_KEY contract.
