# Phase 2 Decisions

- Non-JS runtimes (Python, Go, Rust) are not supported in WebContainerDriver. RuntimeCompatibilityChecker gates exec() calls and throws UnsupportedRuntimeError. Fallback to DockerDriver is the recommended path.

- AllowlistEngine uses exact lowercase FQDN match; no wildcard sub-domain expansion; list is mutable at runtime via updateAllowList().

- WebContainer egress controlled by patching globalThis.fetch; same AllowlistEngine logic applied; no TCP-level proxy available in WebContainer context.

- [2026-02-22] - Network Egress E2E: Added E2E test harness that starts EgressProxy + IsolatedDnsResolver (stub) + ProxyAuditLogger; Docker sub-tests gated by DOCKER_INTEGRATION to avoid CI Docker dependency.
