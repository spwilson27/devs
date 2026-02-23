# DECISIONS

## Decision 001

Use the Strategy pattern for `SandboxProvider` to allow interchangeable `DockerDriver` and `WebContainerDriver` without coupling orchestration logic to container technology.

## Decision 002

The `src/types/index.ts` barrel is the single source of truth for all cross-cutting interfaces; drivers must not define divergent types.

## Decision 003

`FilesystemManager` will exclude `.git/` and `.devs/` directories from any sandbox sync operation to prevent host environment contamination.

## Decision 004

Docker sandbox resource limits are enforced via `--cpus` and `--memory` flags (not cgroup v2 directly) to maintain compatibility with Docker Desktop on macOS/Windows. Defaults: 2 vCPUs, 4 GB RAM; configurable via `DEFAULT_SANDBOX_CONFIG` in `packages/sandbox/src/config.ts`.

Execution timeouts are enforced in-application via a shared utility (withExecutionTimeout) rather than relying solely on Docker `--stop-timeout`; this ensures consistent cross-driver timeout semantics and allows drivers to perform remediation (force-stop) on timeouts.

## Decision 005

Implement sandbox-level resource-exhaustion detection and ephemeral cleanup: add ResourceExhaustionHandler to emit sandbox:oom and sandbox:disk_quota events and perform forced container stop + ephemeral host tmpdir purge; provide SandboxManager to listen to `docker events --filter event=oom` and invoke the handler, with exponential backoff restart (max 3 retries) and graceful stop() method.


