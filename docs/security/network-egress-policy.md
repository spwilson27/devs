# Network Egress Policy

This document summarizes the network egress policy for sandboxed containers and how the orchestrator enforces a default-deny posture.

### Docker Integration

Sandbox containers are attached to a per-sandbox Docker bridge network created with `Internal: true` to prevent containers from having a direct default route to the internet. The orchestrator hosts a single EgressProxy that acts as the only gateway/DNS forwarder for sandbox networks. When a sandbox starts, an isolated bridge network is created and the sandbox's proxy/DNS settings (`HTTP_PROXY`, `HTTPS_PROXY`, `DNS`) are injected into the sandbox container. On sandbox stop the isolated bridge network is removed.

### Default-deny policy

- By default, the EgressProxy denies all targets unless explicitly allowed via the allowList.
- The allow-list is an exact, case-insensitive FQDN match (no wildcard or subdomain expansion).

### Canonical default-allowed domains

- registry.npmjs.org
- pypi.org
- github.com

### Runtime updates

- The EgressProxy exposes updateAllowList(hosts: string[]) to mutate the allow-list at runtime; calls are applied synchronously.
