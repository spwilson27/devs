Intent: Describe three-tier fallback strategy (primary registry → secondary mirror → local cache).

Architecture:
- resolve() reads image-manifest.json to obtain baseImage and digest (single source of truth).
- checkRegistryReachable() performs a HEAD request with an AbortController timeout ≤5s to avoid blocking.
- Fallback order is strict: primary → secondary → local cache → throw RegistryUnavailableError.

Agentic Hooks:
- Agents receiving RegistryUnavailableError should call ImageRebuilder.rebuild() to attempt local reconstruction, then retry resolve().

Known Constraints:
- checkRegistryReachable only verifies basic HTTP reachability and status < 500. It does not test authentication or pull permissions.
