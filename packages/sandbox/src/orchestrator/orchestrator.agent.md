# SandboxOrchestrator - Agent Docs

RunTask lifecycle (9 steps):

1. Generate a cryptographically unique sandboxId via crypto.randomUUID().
2. Create a fresh sandbox: SandboxProvider.create(sandboxId, { image: HARDENED_BASE_IMAGE, env: sanitizer.sanitize(process.env) }) (or provision if provider.provision is used).
3. Generate and register a session key with SessionKeyManager.registerKey(sandboxId, key).
4. Run PreflightService.runPreflight(sandboxId, { projectRoot, task, mcpConfig }).
5. Inject secrets (including DEVS_SESSION_KEY) via SecretInjector.inject(sandboxId, secrets).
6. Execute the agent workload via SandboxProvider.exec(sandboxId, agentEntrypoint) and capture the result.
7. Call SandboxCleanupService.teardown(sandboxId, { outcome }) where outcome is 'success' or 'failure'.
8. Revoke the session key via SessionKeyManager.revokeKey(sandboxId).
9. Return TaskResult (success flag, result, sandboxId, error if any).

Freshness guarantee:
- Each runTask invocation MUST generate a new sandboxId and NOT cache or reuse sandbox IDs between calls. The orchestrator never stores live sandbox references as instance state.

Try/finally contract:
- Steps 2–8 are wrapped in a try/finally block so that teardown and session key revocation always execute even if preflight or execution throws.

Lifecycle events (structured JSON):
- sandbox_created: { event: 'sandbox_created', sandboxId, timestampMs }
- preflight_complete: { event: 'preflight_complete', sandboxId, timestampMs }
- execution_complete: { event: 'execution_complete', sandboxId, success, timestampMs }
- sandbox_torn_down: { event: 'sandbox_torn_down', sandboxId, outcome, timestampMs }

Events MUST be emitted as JSON strings (console.info(JSON.stringify(obj))) so the monitoring subsystem can parse them reliably.
