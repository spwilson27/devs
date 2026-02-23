# Sandbox Cleanup

This agent document describes the sandbox cleanup state machine and operations.

State machine (sandbox lifecycle):
- RUNNING → DESTROYED | PRESERVED

Conditions:
- Success teardown: the sandbox task completed normally; SandboxCleanupService.teardown(..., { outcome: 'success' }) will remove the container (via provider.destroy or docker rm), remove any registered ephemeral volumes via VolumeManager.removeEphemeralVolumes, and remove the sandbox from the internal registry.
- Failure teardown: the sandbox task failed or timed out; SandboxCleanupService.teardown(..., { outcome: 'failure' }) will stop the container without removing it (preserved for debugging), mark the sandbox state as PRESERVED, and emit a structured warning for monitoring: { event: 'sandbox_preserved', sandboxId, reason: 'task_failure' }.

APIs:
- SandboxCleanupService.teardown(sandboxId, { outcome }) — conditional teardown based on outcome.
- SandboxCleanupService.deepPurge(sandboxId) — forcibly runs `docker-compose down -v -p <sandboxId>` (via injected ShellExecutor) and removes named ephemeral volumes via VolumeManager.removeEphemeralVolumes.
- VolumeManager.registerVolume(sandboxId, volumeName) — register a named ephemeral volume associated with a sandbox.
- VolumeManager.removeEphemeralVolumes(sandboxId) — remove all named ephemeral volumes registered for the sandbox.

Preserved sandboxes can be inspected via `docker ps -a --filter name=<sandboxId>` and `docker logs <container>`; the preserved state ensures containers are stopped but not removed to aid debugging.
