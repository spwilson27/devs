# Task: Server Config Path Validation on Startup (Sub-Epic: 071_Detailed Domain Specifications (Part 36))

## Covered Requirements
- [2_TAS-REQ-432]

## Dependencies
- depends_on: []
- shared_components: ["devs-config"]

## 1. Initial Test Written
- [ ] Create an E2E test in `crates/devs-server/tests/config_path_validation.rs` that:
  1. Spawns the `devs-server` binary with `--config /tmp/nonexistent_path_XXXX/devs.toml` (guaranteed non-existent).
  2. Captures stderr and the exit code.
  3. Asserts stderr contains the substring `"config file not found"`.
  4. Asserts the exit code is non-zero.
  5. Asserts no TCP ports were bound (attempt to connect to the expected gRPC and MCP ports and confirm connection refused).
  6. Add `// Covers: 2_TAS-REQ-432` annotation.
- [ ] Create a unit test in `crates/devs-config/tests/path_validation.rs` for the config loading function:
  1. Call the config loader with a path to a non-existent file.
  2. Assert it returns an error variant containing `"config file not found"`.
  3. Add `// Covers: 2_TAS-REQ-432` annotation.

## 2. Task Implementation
- [ ] In `crates/devs-config/src/lib.rs` (or `loader.rs`), at the top of the config loading function, check whether the config file path exists using `std::fs::metadata` or `Path::exists()`.
- [ ] If the file does not exist, return an error with the message `"config file not found: <path>"`.
- [ ] In `crates/devs-server/src/main.rs`, handle this error in the startup sequence **before** any port binding occurs. Write the error message to stderr and exit with a non-zero code (e.g., exit code 1).
- [ ] Ensure the server performs zero `TcpListener::bind` calls if config validation fails — the validation must happen before the gRPC and MCP listeners are created.

## 3. Code Review
- [ ] Verify the config path check occurs before any `bind()` call in the server startup sequence.
- [ ] Verify the error message is written to stderr (not stdout) and contains `"config file not found"`.
- [ ] Verify no partial state (listeners, threads, tokio runtime) is leaked on early exit.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server --test config_path_validation` and confirm all tests pass.
- [ ] Run `cargo test -p devs-config --test path_validation` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comment on the config loading function describing the early-exit behavior for missing files, referencing [2_TAS-REQ-432].

## 6. Automated Verification
- [ ] Run `./do test` and confirm the traceability scanner detects `// Covers: 2_TAS-REQ-432`.
- [ ] Run `./do lint` and confirm no warnings or errors.
