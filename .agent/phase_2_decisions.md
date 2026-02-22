# Phase 2 Decisions

- WebContainerDriver implements SandboxProvider.
- Exec timeouts use AbortSignal.timeout with default 300000 ms (5 minutes).
- WebContainerDriver registered under key 'webcontainer' in driver-registry.
- EgressProxy skeleton uses Node built-in http/net modules; no third-party proxy library.
- Docker sandbox containers use Internal bridge network; HTTP_PROXY and DNS env vars point to orchestrator-hosted EgressProxy; no direct internet route exists inside container.
