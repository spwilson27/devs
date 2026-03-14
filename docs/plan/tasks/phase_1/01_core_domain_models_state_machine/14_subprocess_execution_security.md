# Task: Implement Subprocess Execution Security Types (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [SEC-005], [SEC-016], [SEC-016-BR-001], [SEC-016-BR-002], [SEC-017], [SEC-017-BR-001], [SEC-017-BR-002], [SEC-017-BR-003], [SEC-017-BR-004], [SEC-018], [SEC-018-BR-001], [SEC-018-BR-002], [SEC-018-BR-003], [SEC-053], [SEC-055], [SEC-056], [SEC-057], [SEC-058], [SEC-079], [5_SECURITY_DESIGN-REQ-221], [5_SECURITY_DESIGN-REQ-222], [5_SECURITY_DESIGN-REQ-223], [5_SECURITY_DESIGN-REQ-224], [5_SECURITY_DESIGN-REQ-225], [5_SECURITY_DESIGN-REQ-226], [5_SECURITY_DESIGN-REQ-227], [5_SECURITY_DESIGN-REQ-228], [5_SECURITY_DESIGN-REQ-229], [5_SECURITY_DESIGN-REQ-230], [5_SECURITY_DESIGN-REQ-231], [5_SECURITY_DESIGN-REQ-232], [5_SECURITY_DESIGN-REQ-233], [5_SECURITY_DESIGN-REQ-234], [5_SECURITY_DESIGN-REQ-235], [5_SECURITY_DESIGN-REQ-236], [5_SECURITY_DESIGN-REQ-237], [5_SECURITY_DESIGN-REQ-238], [5_SECURITY_DESIGN-REQ-239], [5_SECURITY_DESIGN-REQ-240], [AC-SEC-2-003], [AC-SEC-2-004], [AC-SEC-2-007], [AC-SEC-2-008], [AC-SEC-2-010], [AC-SEC-2-024]

## Dependencies
- depends_on: [11_redacted_wrapper_credential_security.md]
- shared_components: [devs-core (Owner), devs-adapters (Consumer)]

## 1. Initial Test Written
- [ ] Write test `test_command_args_no_shell_expansion` asserting `AgentCommandSpec` uses discrete args array, not shell string
- [ ] Write test `test_reserved_env_vars_stripped` asserting reserved keys `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_MCP_ADDR` are rejected from stage env var overrides
- [ ] Write test `test_env_var_inheritance_controlled` asserting only allowed env vars are passed to agent subprocess
- [ ] Write test `test_bridge_trust_inheritance` asserting `BridgeTrustLevel` type represents spawning-process trust model
- [ ] Write test `test_agent_command_spec_construction` asserting prompt is passed via args array or temp file, never via shell interpolation

## 2. Task Implementation
- [ ] Define `AgentCommandSpec` struct in `crates/devs-core/src/security/subprocess.rs` with `binary: PathBuf`, `args: Vec<String>`, `env_vars: HashMap<String, Redacted<String>>`, `working_dir: PathBuf`
- [ ] Define `RESERVED_ENV_VARS: &[&str]` constant listing `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_MCP_ADDR` and other internal keys
- [ ] Implement `validate_stage_env_vars(vars: &HashMap<String, String>) -> Result<(), Vec<ValidationError>>` rejecting reserved keys
- [ ] Define `BridgeTrustLevel` enum with `Inherited` variant documenting MCP bridge trust model
- [ ] Define `SubprocessIsolation` enum with `SameUser`, `Tempdir`, `Docker`, `RemoteSsh` variants
- [ ] Ensure all types use `Redacted<T>` for sensitive fields (API keys in env vars)

## 3. Code Review
- [ ] Verify no shell invocation paths exist (no `sh -c` construction)
- [ ] Verify reserved env var list is exhaustive per the spec
- [ ] Verify `Redacted<T>` wraps all credential-bearing fields

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core security::subprocess` and confirm all tests pass
- [ ] Run `cargo test -p devs-core` to confirm no regressions in the crate

## 5. Update Documentation
- [ ] Add doc comments to `AgentCommandSpec` stating that args must never be constructed via shell string interpolation
- [ ] Document `RESERVED_ENV_VARS` with a reference to the spec section that defines each reserved key
- [ ] Document `BridgeTrustLevel::Inherited` trust semantics

## 6. Automated Verification
- [ ] `cargo clippy -p devs-core -- -D warnings` passes with no warnings
- [ ] `cargo test -p devs-core security::subprocess` passes
- [ ] `cargo fmt --check -p devs-core` passes
