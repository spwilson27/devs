# Task: Config Override Chain & Credential Supply (Sub-Epic: 01_dag_scheduling_engine)

## Covered Requirements
- [1_PRD-REQ-043], [1_PRD-REQ-044]

## Dependencies
- depends_on: ["05_phase_1_completion_gate.md"]
- shared_components: [devs-config (owner — config parsing with override chain), devs-core (consumer — `Redacted<T>` security wrapper), Redacted<T> Security Wrapper (consumer — credential redaction)]

## 1. Initial Test Written
- [ ] Create `crates/devs-config/tests/config_override_tests.rs`.
- [ ] Write unit test `test_cli_flag_overrides_env_var`: set env var `DEVS_LISTEN_ADDR=127.0.0.1:9000`, pass CLI flag `--listen-addr 127.0.0.1:9001`. Assert final config uses `127.0.0.1:9001`. Annotate `// Covers: 1_PRD-REQ-043`.
- [ ] Write unit test `test_env_var_overrides_toml`: set env var `DEVS_MCP_PORT=50052`, have `mcp_port = 50051` in TOML. Assert final config uses `50052`. Annotate `// Covers: 1_PRD-REQ-043`.
- [ ] Write unit test `test_toml_overrides_default`: no env vars or CLI flags, TOML has `scheduling_policy = "weighted"`. Assert config uses `"weighted"` not built-in default `"strict"`. Annotate `// Covers: 1_PRD-REQ-043`.
- [ ] Write unit test `test_default_when_no_override`: no env vars, no CLI flags, no TOML value for `max_webhooks_per_project`. Assert built-in default (16) is used. Annotate `// Covers: 1_PRD-REQ-043`.
- [ ] Write unit test `test_credential_from_env_var`: set env var `DEVS_ANTHROPIC_KEY=sk-ant-secret`, have no credential in TOML. Assert config loads credential from env var, wrapped in `Redacted<String>`. Annotate `// Covers: 1_PRD-REQ-044`.
- [ ] Write unit test `test_credential_from_toml`: no env var, TOML has `[credentials] anthropic_key = "sk-ant-toml"`. Assert config loads from TOML with warning logged about plaintext storage. Annotate `// Covers: 1_PRD-REQ-044`.
- [ ] Write unit test `test_env_var_overrides_toml_credential`: set env var `DEVS_ANTHROPIC_KEY=sk-ant-env`, TOML has `anthropic_key = "sk-ant-toml"`. Assert env var takes precedence. Annotate `// Covers: 1_PRD-REQ-044`.
- [ ] Write unit test `test_redacted_debug_does_not_leak`: wrap credential in `Redacted<String>`, call `format!("{:?}", redacted)`. Assert output is `"Redacted([REDACTED])"` not the actual value. Annotate `// Covers: 1_PRD-REQ-044`.
- [ ] Write unit test `test_redacted_display_does_not_leak`: call `format!("{}", redacted)`. Assert output is `"[REDACTED]"`. Annotate `// Covers: 1_PRD-REQ-044`.
- [ ] Write unit test `test_redacted_expose_allows_access`: call `redacted.expose()`. Assert returns reference to inner value. Annotate `// Covers: 1_PRD-REQ-044`.

## 2. Task Implementation
- [ ] Implement config override resolution in `crates/devs-config/src/loader.rs`:
  - Define `ConfigLoader` struct with methods for loading from TOML, env vars, CLI flags.
  - Implement precedence chain: CLI flags > env vars > TOML > built-in defaults.
  - Use `std::env::var()` for env var resolution with `DEVS_` prefix for all config keys.
  - Parse CLI flags using `clap` or manual `std::env::args()` parsing.
- [ ] Implement credential loading:
  - Add `[credentials]` section support in TOML parser.
  - Check for env vars with `DEVS_<PROVIDER>_KEY` pattern (e.g., `DEVS_ANTHROPIC_KEY`, `DEVS_OPENAI_KEY`).
  - Wrap all credentials in `Redacted<String>` from `devs-core`.
  - Log `WARN` when credentials are loaded from TOML (plaintext storage caveat).
- [ ] Implement `Redacted<T>` wrapper in `crates/devs-core/src/security.rs` (or extend existing):
  - `pub struct Redacted<T>(T)` with `T` private.
  - `impl<T> Redacted<T> { pub fn new(value: T) -> Self; pub fn expose(&self) -> &T }`.
  - `impl<T: Debug> Debug for Redacted<T>` outputs `"Redacted([REDACTED])"`.
  - `impl<T: Display> Display for Redacted<T>` outputs `"[REDACTED]"`.
- [ ] Add built-in defaults constant struct with all config defaults.
- [ ] Ensure `ServerConfig` uses `Redacted<String>` for all credential fields.
- [ ] Add `// Covers: 1_PRD-REQ-043` and `// Covers: 1_PRD-REQ-044` annotations to all relevant code.

## 3. Code Review
- [ ] Verify precedence chain is correctly implemented (CLI > env > TOML > default).
- [ ] Verify `Redacted<T>` cannot accidentally leak via `Debug` or `Display`.
- [ ] Verify credentials from TOML produce a `WARN` log.
- [ ] Verify no credential is ever printed to stdout/stderr in logs.
- [ ] Verify `devs-core` does not depend on `tokio`, `git2`, `reqwest`, or `tonic`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config -- config_override` and verify all tests pass.
- [ ] Run `cargo test -p devs-core -- security` and verify all `Redacted<T>` tests pass.
- [ ] Run `cargo clippy -p devs-config -- -D warnings` and verify no warnings.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and verify no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `ConfigLoader`, `Redacted<T>`, and all public methods.
- [ ] Add module doc comment to `devs-config/src/loader.rs` explaining override precedence.
- [ ] Add security documentation to `Redacted<T>` explaining when to use it.
- [ ] Ensure `cargo doc -p devs-config --no-deps` and `cargo doc -p devs-core --no-deps` build without warnings.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-config -- config_override --format=json 2>&1 | grep '"passed"'` and confirm all tests passed.
- [ ] Run `cargo tarpaulin -p devs-config --out json -- config_override` and verify ≥ 90% line coverage for override logic.
- [ ] Run `cargo tarpaulin -p devs-core --out json -- security` and verify ≥ 90% line coverage for `Redacted<T>`.
