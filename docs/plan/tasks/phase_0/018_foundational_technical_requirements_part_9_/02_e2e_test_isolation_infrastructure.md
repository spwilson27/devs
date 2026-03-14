# Task: E2E Test Discovery File Isolation Infrastructure (Sub-Epic: 018_Foundational Technical Requirements (Part 9))

## Covered Requirements
- [2_TAS-REQ-002I]

## Dependencies
- depends_on: ["01_client_discovery_logic.md"]
- shared_components: [Server Discovery Protocol (consumer — uses DEVS_DISCOVERY_FILE env var contract), ./do Entrypoint Script & CI Pipeline (consumer — DEVS_DISCOVERY_FILE env var)]

## 1. Initial Test Written
- [ ] Create `crates/devs-test-harness/src/lib.rs` (or `tests/common/mod.rs` if a shared test-harness crate doesn't exist yet) with the following **test of the test helper itself**:
- [ ] **`test_isolated_discovery_creates_unique_paths`**: Instantiate two `IsolatedDiscovery` fixtures in the same test. Assert that `fixture_a.discovery_file_path() != fixture_b.discovery_file_path()`. Assert both paths exist within different temp directories. Annotate with `// Covers: 2_TAS-REQ-002I`.
- [ ] **`test_isolated_discovery_sets_env_var`**: Instantiate `IsolatedDiscovery`. Call `fixture.env_vars()` and assert it returns a `Vec` containing `("DEVS_DISCOVERY_FILE", "<unique_temp_path>")`. Annotate with `// Covers: 2_TAS-REQ-002I`.
- [ ] **`test_parallel_servers_no_collision`**: Spawn two async tasks that each create an `IsolatedDiscovery`, write a different address string to their respective discovery file paths, then read each other's file and confirm the contents differ. This proves parallel test isolation. Annotate with `// Covers: 2_TAS-REQ-002I`.
- [ ] **`test_cleanup_removes_temp_dir`**: Instantiate `IsolatedDiscovery`, capture the path, drop the fixture, assert the temp directory no longer exists.

## 2. Task Implementation
- [ ] Create a `IsolatedDiscovery` struct (in the test-harness crate or a `test_support` module within `devs-core`):
  ```rust
  pub struct IsolatedDiscovery {
      _temp_dir: tempfile::TempDir,  // dropped on cleanup
      discovery_path: PathBuf,
  }

  impl IsolatedDiscovery {
      pub fn new() -> Self {
          let temp_dir = tempfile::TempDir::new().expect("failed to create temp dir");
          let discovery_path = temp_dir.path().join("server.addr");
          Self { _temp_dir: temp_dir, discovery_path }
      }

      /// Returns the path to the isolated discovery file.
      pub fn discovery_file_path(&self) -> &Path { &self.discovery_path }

      /// Returns env vars to set for processes using this isolated discovery.
      pub fn env_vars(&self) -> Vec<(&str, String)> {
          vec![("DEVS_DISCOVERY_FILE", self.discovery_path.display().to_string())]
      }

      /// Write a server address to the discovery file (simulating server startup).
      pub fn write_addr(&self, addr: &str) -> std::io::Result<()> {
          std::fs::write(&self.discovery_path, addr)
      }
  }
  ```
- [ ] Ensure `TempDir` is held by the struct so it lives as long as the fixture — automatic cleanup on drop.
- [ ] Add a doc comment on `IsolatedDiscovery` stating: "Every E2E test that starts a server MUST use this fixture to prevent discovery file conflicts between parallel server instances [2_TAS-REQ-002I]."
- [ ] If a `TestServerBuilder` or similar pattern exists (or will exist), integrate `IsolatedDiscovery` so it's automatically used.

## 3. Code Review
- [ ] Verify each `IsolatedDiscovery` instance creates its own `TempDir` — no shared state between instances [2_TAS-REQ-002I].
- [ ] Verify that the env var key is exactly `"DEVS_DISCOVERY_FILE"` (matching the contract from the shared components manifest).
- [ ] Verify cleanup is automatic via `Drop` — no manual cleanup step required.
- [ ] Verify that no test can accidentally use the default `~/.config/devs/server.addr` path when the fixture is in use.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-test-harness` (or the crate where the fixture lives) and confirm all 4 tests pass.
- [ ] Run tests with `--test-threads=8` to stress parallel isolation.

## 5. Update Documentation
- [ ] Add doc comments to `IsolatedDiscovery` explaining its purpose and usage pattern.
- [ ] Add a note in the test-harness module-level docs: "All E2E tests MUST use `IsolatedDiscovery` for server address isolation."

## 6. Automated Verification
- [ ] Run `./do test` and confirm `// Covers: 2_TAS-REQ-002I` annotations appear in `target/traceability.json`.
- [ ] Run `./do lint` and confirm no warnings or errors.
