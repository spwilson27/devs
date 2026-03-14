# Task: Prohibited Environment Keys Validation (Sub-Epic: 061_Detailed Domain Specifications (Part 26))

## Covered Requirements
- [2_TAS-REQ-269]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/types/env_key.rs`, add or extend tests for the `EnvKey` type. All tests below annotated with `// Covers: 2_TAS-REQ-269`.
- [ ] Write test `test_env_key_prohibited_devs_listen`:
  ```rust
  // Covers: 2_TAS-REQ-269
  #[test]
  fn test_env_key_prohibited_devs_listen() {
      let result = EnvKey::new("DEVS_LISTEN");
      assert!(matches!(result, Err(ValidationError::ProhibitedEnvKey(key)) if key == "DEVS_LISTEN"));
  }
  ```
- [ ] Write test `test_env_key_prohibited_devs_mcp_port`: Same pattern for `"DEVS_MCP_PORT"`.
- [ ] Write test `test_env_key_prohibited_devs_discovery_file`: Same pattern for `"DEVS_DISCOVERY_FILE"`.
- [ ] Write test `test_env_key_non_prohibited_devs_prefix_allowed`: `EnvKey::new("DEVS_CUSTOM_VAR")` should succeed — only the three exact keys are prohibited, not the entire `DEVS_` prefix.
- [ ] Write test `test_env_key_prohibited_case_sensitive`: `EnvKey::new("devs_listen")` should fail for different reason (lowercase violates `[A-Z_][A-Z0-9_]*` regex), NOT as `ProhibitedEnvKey`. This ensures the prohibition check is case-exact.
- [ ] Write test `test_strip_prohibited_keys_from_env_map`: In a utility module (e.g., `crates/devs-core/src/env.rs`), define `fn strip_prohibited_keys(env: &mut HashMap<String, String>)`. Write a test that inserts `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE`, and `PATH` into a `HashMap`, calls `strip_prohibited_keys`, and asserts only `PATH` remains.
- [ ] Write test `test_strip_prohibited_keys_noop_when_absent`: Call `strip_prohibited_keys` on a map with no prohibited keys. Assert the map is unchanged.

## 2. Task Implementation
- [ ] In `EnvKey::new()` validation logic, add a check against a constant array:
  ```rust
  const PROHIBITED_ENV_KEYS: &[&str] = &["DEVS_LISTEN", "DEVS_MCP_PORT", "DEVS_DISCOVERY_FILE"];
  ```
  If the input matches any entry, return `Err(ValidationError::ProhibitedEnvKey(input.to_string()))`.
- [ ] Add `ProhibitedEnvKey(String)` variant to `ValidationError` enum if not already present.
- [ ] Implement `strip_prohibited_keys` in `crates/devs-core/src/env.rs`:
  ```rust
  /// Removes keys that must never be passed to agent subprocesses.
  /// These are server-internal configuration keys that could cause
  /// conflicts if leaked into agent environments.
  pub fn strip_prohibited_keys(env: &mut HashMap<String, String>) {
      for key in PROHIBITED_ENV_KEYS {
          env.remove(*key);
      }
  }
  ```
- [ ] Ensure `PROHIBITED_ENV_KEYS` is `pub` so downstream crates (devs-executor) can reference it for documentation, but the `strip_prohibited_keys` function is the primary API.
- [ ] Add doc comments on `PROHIBITED_ENV_KEYS` listing the three keys and citing [2_TAS-REQ-269].

## 3. Code Review
- [ ] Verify the prohibited list contains exactly `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE` — no more, no less.
- [ ] Verify the prohibition check happens in `EnvKey::new()` (parse-time rejection) and also via `strip_prohibited_keys` (runtime stripping of inherited server env vars). Both paths are required by the requirement.
- [ ] Verify no `unwrap()` or `panic!()` in the validation path.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- env_key` and `cargo test -p devs-core -- strip_prohibited` and confirm all 7 tests pass.

## 5. Update Documentation
- [ ] Add doc comments on `EnvKey` referencing the prohibited keys list and [2_TAS-REQ-269].

## 6. Automated Verification
- [ ] Run `./do test` and confirm the traceability scanner finds `// Covers: 2_TAS-REQ-269` annotations.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm zero warnings.
