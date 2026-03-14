# Task: Enforce Immutable Server Configuration After Startup (Sub-Epic: 067_Detailed Domain Specifications (Part 32))

## Covered Requirements
- [2_TAS-REQ-412]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config]

## 1. Initial Test Written
- [ ] In the `devs-config` crate (or appropriate test location), create `tests/config_immutability_tests.rs` with:
    - `test_server_config_is_arc_wrapped`: Load a sample `devs.toml` into a `ServerConfig`, wrap it in `Arc<ServerConfig>`, and confirm the type does NOT implement `DerefMut` or provide any `&mut self` methods. Verify it can be cloned (Arc clone) and shared across threads without mutation.
    - `test_config_load_returns_owned_immutable`: Call the config loading function, assert it returns an `Arc<ServerConfig>` (or equivalent immutable handle). Attempt to modify a field — this should be a compile-time error (verify by having the test comment documenting that mutation is impossible).
    - `test_project_registry_supports_live_update`: Create a `ProjectRegistry` and call `add_project(...)` followed by `remove_project(...)`. Assert that both operations succeed and the registry reflects the changes. This confirms the registry is the sole live-update exception per [2_TAS-REQ-412].
    - `test_config_has_no_reload_method`: Verify (via documentation or test) that `ServerConfig` has no `reload()`, `refresh()`, or `update()` method.
- [ ] Write a test that constructs `ServerConfig` and verifies all fields are accessible only via `&self` getters (no `&mut self` methods on the public API).

## 2. Task Implementation
- [ ] Define `ServerConfig` as an immutable struct in `devs-config`:
    ```rust
    /// Server configuration loaded once at startup. Immutable after construction.
    /// [2_TAS-REQ-412]: devs.toml is not reloaded while the server is running.
    #[derive(Debug, Clone)]
    pub struct ServerConfig {
        // All fields private, accessed via getter methods
        listen_addr: SocketAddr,
        mcp_port: u16,
        default_pool: String,
        scheduling_policy: SchedulingPolicy,
        // ... other fields
    }
    ```
    Provide only `&self` getter methods. No `set_*`, `update_*`, or `&mut self` methods.
- [ ] Implement the config loading function with this signature:
    ```rust
    pub fn load_server_config(path: &Path, overrides: &ConfigOverrides) -> Result<Arc<ServerConfig>, Vec<ConfigError>>
    ```
    This function loads `devs.toml`, applies env var and CLI flag overrides, validates, and returns an `Arc<ServerConfig>`. The `Arc` wrapper ensures the config is shared immutably across all server subsystems.
- [ ] Implement `ProjectRegistry` as a separate mutable data structure:
    ```rust
    pub struct ProjectRegistry {
        entries: RwLock<HashMap<String, ProjectEntry>>,
    }
    ```
    This supports `add_project` and `remove_project` for live updates. It is intentionally separate from `ServerConfig` to maintain the immutability invariant.
- [ ] Ensure no file-system watcher (e.g., `notify` crate) is added for `devs.toml`. Do NOT implement any `SIGHUP` reload handler.
- [ ] In the server's `main.rs`, load config once at startup and pass `Arc<ServerConfig>` to all subsystems. The config reference must never be replaced or refreshed.

## 3. Code Review
- [ ] Verify `ServerConfig` has zero `&mut self` methods in its public API.
- [ ] Confirm `ProjectRegistry` is the only component that supports live mutation, and it is clearly separated from `ServerConfig`.
- [ ] Check that `notify`, `inotify`, or any file-watch crate is NOT in the dependency tree for config-related code.
- [ ] Ensure the `Arc<ServerConfig>` pattern is used consistently — no subsystem stores its own mutable copy.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` and confirm all immutability and registry tests pass.
- [ ] Run `./do test` and confirm no regressions.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-412` annotation to the config immutability tests.
- [ ] Add a doc comment on `ServerConfig` stating: "Immutable after startup. See [2_TAS-REQ-412]."
- [ ] Add a doc comment on `ProjectRegistry` stating: "Live-updatable. The only exception to config immutability per [2_TAS-REQ-412]."

## 6. Automated Verification
- [ ] Run `cargo test -p devs-config` and capture exit code — must be 0.
- [ ] Run `grep -rn 'pub fn.*&mut self' devs-config/src/server_config.rs` and confirm zero matches (no mutable methods on ServerConfig).
- [ ] Run `grep -rn 'notify\|inotify\|file.watch' devs-config/` and confirm zero matches (no file watchers).
