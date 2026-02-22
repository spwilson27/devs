# Agent Memory — Sandbox Package

- Architectural Decision: `SandboxLifecycleManager.runInSandbox()` is the single entry point for all agent task execution. It guarantees:
  1. Fresh ephemeral sandbox per task (unique SandboxContext.id per run).
  2. Pre-flight command execution from SandboxLifecycleConfig.preFlightCommands before task code.
  3. Sandbox destruction in all exit paths (success, error, timeout) with a let-guard to avoid double-destroy.
  4. 5-minute total timeout by default (totalTimeoutMs default: 300_000 ms).

- Brittle Areas:
  - Ensure providers implement provision()/exec()/destroy() correctly; provider.destroy must be safe to call even after partial failures.

- Recent Changelog:
  - Implemented SandboxLifecycleManager, SandboxLifecycleConfig, errors (SandboxPreFlightError, SandboxTimeoutError), and unit tests for lifecycle behaviour.
