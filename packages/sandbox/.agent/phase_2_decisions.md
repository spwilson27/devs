# Phase 2 Decisions

- Non-JS runtimes (Python, Go, Rust) are not supported in WebContainerDriver. RuntimeCompatibilityChecker gates exec() calls and throws UnsupportedRuntimeError. Fallback to DockerDriver is the recommended path.

- AllowlistEngine uses exact lowercase FQDN match; no wildcard sub-domain expansion; list is mutable at runtime via updateAllowList().
