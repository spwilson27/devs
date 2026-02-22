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

### WebContainer Integration

WebContainers do not provide a TCP-level proxy capability from inside the browser-like environment. To enforce egress policies within WebContainers, the project patches the in-context global fetch (globalThis.fetch) with a shim that implements the same allowlist-based logic used by the host-level egress proxy/AllowlistEngine.

Key points:
- The shim captures the original fetch implementation before patching and delegates allowed requests to it; blocked requests are returned immediately with a 403 response and a short, human-readable body ("Egress blocked by policy").
- The allowlist matching is case-insensitive and performed against the request hostname (port is ignored).
- Structured audit logs are emitted for blocked requests (e.g., { event: 'webcontainer_egress_blocked', host, url }).
- This approach enforces policy for HTTP/HTTPS fetches but cannot control non-fetch egress (e.g., WebSocket raw sockets or other runtime-specific transports).

### Audit Logging

All egress decisions (allowed and blocked) are audited via ProxyAuditLogger. Audit entries contain only `host`, `method`, and `timestampMs` to avoid logging full URLs or request paths that could leak sensitive data. File sinks are append-only and write entries as newline-delimited JSON.
