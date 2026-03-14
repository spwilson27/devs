# Task: Checkpoint Restoration Isolation and Client Acceptance Ordering (Sub-Epic: 065_Detailed Domain Specifications (Part 30))

## Covered Requirements
- [2_TAS-REQ-403], [2_TAS-REQ-404]

## Dependencies
- depends_on: ["01_config_validation_before_port_bind.md", "02_discovery_file_path_and_format.md"]
- shared_components: ["devs-checkpoint", "devs-core (Server Discovery Protocol)"]

## 1. Initial Test Written
- [ ] In `crates/devs-server/tests/` or `crates/devs-checkpoint/tests/`, create `checkpoint_isolation.rs`:
  - `test_checkpoint_restore_failure_isolated_per_project`: Set up two mock project directories; corrupt the checkpoint data for project A (e.g., invalid JSON in `.devs/`), keep project B valid. Call `restore_all_projects(vec![project_a, project_b])`. Assert project A returns an error (logged but not propagated). Assert project B restores successfully. Assert the overall startup does NOT abort.
  - `test_checkpoint_restore_single_project_failure_logged`: Same as above but verify the error for project A is captured in the returned error list / log output, containing the project identifier
- [ ] In `crates/devs-server/tests/`, create `startup_ordering.rs`:
  - `test_clients_not_accepted_before_discovery_file_written`: Implement an integration test that:
    1. Starts the server in a background task with a known discovery file path (via `DEVS_DISCOVERY_FILE`)
    2. Before the discovery file exists, attempt a gRPC connection to the server's port — assert it either refuses connection or the port is not yet bound
    3. Wait for the discovery file to appear
    4. After the file exists, connect via gRPC and call `GetInfo` — assert success
  - `test_mcp_port_not_accepting_before_discovery_file`: Same pattern but for the MCP port

## 2. Task Implementation
- [ ] In the checkpoint restoration module, implement `restore_all_projects`:
  ```rust
  pub async fn restore_all_projects(projects: &[ProjectRef]) -> (Vec<RestoredRun>, Vec<ProjectRestoreError>) {
      let mut runs = Vec::new();
      let mut errors = Vec::new();
      for project in projects {
          match restore_checkpoints(project).await {
              Ok(project_runs) => runs.extend(project_runs),
              Err(e) => errors.push(ProjectRestoreError { project: project.clone(), error: e }),
          }
      }
      (runs, errors)
  }
  ```
  - Log each error at `error!` level with the project identifier but continue iterating
- [ ] In the server startup sequence, enforce ordering:
  1. Validate config (2_TAS-REQ-400)
  2. Bind gRPC and MCP ports (get `TcpListener` handles but do NOT call `serve`/accept yet)
  3. Restore checkpoints (per-project isolation per 2_TAS-REQ-403)
  4. Write discovery file (atomic temp+rename)
  5. Only THEN start accepting connections on both listeners (call `serve` with the pre-bound listeners)
- [ ] Ensure the `tonic` server is started with a pre-bound `TcpListener` (using `Server::builder().serve_with_incoming`) so that accept begins only after discovery file is written

## 3. Code Review
- [ ] Verify that `restore_all_projects` never short-circuits — a `?` operator on individual project restore would violate 2_TAS-REQ-403
- [ ] Verify that `serve` / connection acceptance happens strictly after `write_discovery_file` completes
- [ ] Verify the startup sequence matches the required order: validate → bind → restore → write discovery → accept

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server --test checkpoint_isolation`
- [ ] Run `cargo test -p devs-server --test startup_ordering`
- [ ] Run `cargo test -p devs-checkpoint` for unit-level restore tests

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-403` to checkpoint isolation tests
- [ ] Add `// Covers: 2_TAS-REQ-404` to startup ordering tests

## 6. Automated Verification
- [ ] Run `./do test` and confirm all tests pass
- [ ] Grep for `// Covers: 2_TAS-REQ-403` and `// Covers: 2_TAS-REQ-404` and confirm matches exist
