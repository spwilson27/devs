Intent:
DockerDriver is the CLI-mode implementation of the SandboxProvider interface that provisions ephemeral Docker containers for task execution. It is intended for environments where a Docker daemon is available and trusted.

Architecture:
- Lifecycle: provision → exec → destroy
- provision(): creates and starts a container using the injected Docker client and mounts the host project path at /workspace.
- exec(): creates an exec instance inside the container, starts it, demultiplexes the Docker stdout/stderr stream, and returns an ExecResult.
- destroy(): stops and removes the container (remove({ force: true, v: true })) and marks the sandbox as destroyed.
- The driver stores a mapping of SandboxContext.id → Docker container reference for quick lookup.

Agentic Hooks:
- Agents MUST check getStatus() before calling exec() if operations depend on the container being live.
- exec() MUST NOT be called after destroy(); doing so will throw SandboxDestroyedError.
- Provisioning uses labels `devs.sandbox=true` so integration/test harnesses can find and clean containers.

Known Constraints:
- Container startup introduces 2–5s latency.
- Docker daemon must be reachable at the host default socket (e.g., /var/run/docker.sock).
- The driver expects the hostProjectPath to be an absolute path and mounts it read-write at /workspace.
- exec() demultiplexes the Docker multiplexed stream; drivers relying on non-multiplexed streams may behave differently.

Notes:
- Unit tests use an injected mocked Docker client to avoid depending on a live Docker daemon.
- For integration tests, ensure Docker is installed and the current user can pull/run containers.
