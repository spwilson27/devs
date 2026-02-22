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
