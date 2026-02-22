# Network Egress Policy

This document summarizes the network egress policy for sandboxed containers and how the orchestrator enforces a default-deny posture.

### Docker Integration

Sandbox containers are attached to a per-sandbox Docker bridge network created with `Internal: true` to prevent containers from having a direct default route to the internet. The orchestrator hosts a single EgressProxy that acts as the only gateway/DNS forwarder for sandbox networks. When a sandbox starts, an isolated bridge network is created and the sandbox's proxy/DNS settings (`HTTP_PROXY`, `HTTPS_PROXY`, `DNS`) are injected into the sandbox container. On sandbox stop the isolated bridge network is removed.

### Allowed Domains

The allow-list (to be populated) includes canonical package registries required for builds, e.g. `registry.npmjs.org`, `pypi.org`, `github.com`.

### Verification

Integration and E2E tests assert that containers can reach allowed destinations via the proxy and are blocked from reaching disallowed hosts. Integration tests are guarded by the `DOCKER_INTEGRATION=true` environment variable to avoid running Docker-dependent tests in standard CI environments.
