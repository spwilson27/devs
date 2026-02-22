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


Security Configuration

The DockerDriver enforces the following HostConfig runtime flags for all provisioned containers:

- CapDrop: ["ALL"] — drops all Linux capabilities to prevent privilege escalation. (Req: 5_SECURITY_DESIGN-REQ-SEC-SD-046)
- SecurityOpt: ["no-new-privileges:true"] — prevents processes from gaining new privileges via execve/setuid binaries.
- PidsLimit: 128 — limits the number of PIDs in the container to mitigate fork-bomb style attacks.
- Memory: 4 * 1024 * 1024 * 1024 — defaults to 4GiB memory limit.
- NanoCPUs: 2 * 1e9 — defaults to 2 CPU cores.
- NetworkMode: "none" — containers are network-isolated by default and must opt-in to egress.
- Privileged: false — privileged mode is explicitly disabled.
- Binds: <hostProjectPath>:/workspace:rw — workspace is mounted read-write while the rootfs is read-only.
- ReadonlyRootfs: false — the root filesystem is not marked read-only to allow workspace writes, but workspace is mounted rw.

Security Invariants

The following flags MUST NOT be changed without a security review:

- CapDrop
- SecurityOpt
- Privileged

These invariants are enforced via runtime validation in the DockerDriver implementation. Any deviation will throw a SecurityConfigError and abort provisioning.
