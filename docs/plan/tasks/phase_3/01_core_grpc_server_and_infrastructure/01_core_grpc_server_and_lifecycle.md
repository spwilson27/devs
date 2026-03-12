# Task: Core gRPC Server & Lifecycle (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [1_PRD-REQ-001], [2_TAS-REQ-052], [2_TAS-REQ-065], [2_TAS-REQ-069], [2_TAS-REQ-001], [2_TAS-REQ-002], [2_TAS-REQ-066]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto, devs-config]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-server/tests/server_lifecycle.rs` that attempts to start the server on a random port and verifies it responds to a basic gRPC health check or a simple RPC (e.g., `GetInfo`).
- [ ] Implement a test for clean shutdown: send `SIGTERM` to the server process and verify it exits with code 0 within a reasonable timeout.

## 2. Task Implementation
- [ ] Initialize the `devs-server` crate in the workspace.
- [ ] Implement the `main` function using `tokio` and `tonic`.
- [ ] Set up `tonic` service handlers for the 6 core services defined in `devs-proto` (Workflow, Run, Stage, Log, Pool, Project). Use stubs for now.
- [ ] Configure default ports (7890 for gRPC) and allow overrides via `devs.toml` or `DEVS_LISTEN`.
- [ ] Implement signal handling using `tokio::signal::unix` for `SIGTERM` and `SIGINT`.
- [ ] Ensure the server performs an orderly shutdown, closing listeners and waiting for in-flight requests (placeholder for now).

## 3. Code Review
- [ ] Verify that service handlers are decoupled from the main server loop.
- [ ] Ensure that port assignments follow [2_TAS-REQ-069].
- [ ] Check that no sensitive information is logged during startup/shutdown.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-server`

## 5. Update Documentation
- [ ] Update `GEMINI.md` to record the implementation of the core gRPC server and its lifecycle management.

## 6. Automated Verification
- [ ] Verify that `./do build` succeeds and the `devs-server` binary is produced.
