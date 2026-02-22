# Phase 2 Decisions

- WebContainerDriver implements SandboxProvider.
- Exec timeouts use AbortSignal.timeout with default 300000 ms (5 minutes).
- WebContainerDriver registered under key 'webcontainer' in driver-registry.
- EgressProxy skeleton uses Node built-in http/net modules; no third-party proxy library.
- Docker sandbox containers use Internal bridge network; HTTP_PROXY and DNS env vars point to orchestrator-hosted EgressProxy; no direct internet route exists inside container.
- AllowlistEngine uses exact lowercase FQDN match; no wildcard sub-domain expansion; list is mutable at runtime via updateAllowList().
- ProxyAuditLogger emits structured JSON per-request; file sink uses append-only WriteStream; full URLs not logged to avoid data leakage.
- WebContainerDriver has three test tiers. E2E tests are gated by RUN_E2E=true env var. CI E2E job is continue-on-error until browser environment stability is confirmed.
