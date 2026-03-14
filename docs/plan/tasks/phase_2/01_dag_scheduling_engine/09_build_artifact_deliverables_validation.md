# Task: Build Artifact Deliverables Validation (Sub-Epic: 01_DAG Scheduling Engine)

## Covered Requirements
- [9_PROJECT_ROADMAP-REQ-089]: Phase 0 | `target/presubmit_timings.jsonl` | Git CI artifact | RISK-005 monitoring
- [9_PROJECT_ROADMAP-REQ-090]: Phase 0 | `target/traceability.json` (partial) | Git CI artifact | Phase 5 gate
- [9_PROJECT_ROADMAP-REQ-091]: Phase 0 | `devs-proto/src/gen/` (generated) | Committed to repo | All crates importing proto types
- [9_PROJECT_ROADMAP-REQ-092]: Phase 0 | `devs-core` types (`BoundedString`, `StateMachine`, etc.) | `crates/devs-core/src/` | All Phase 1+ crates
- [9_PROJECT_ROADMAP-REQ-093]: Phase 0 | `rust-toolchain.toml` | Repo root | All Rust toolchain invocations
- [9_PROJECT_ROADMAP-REQ-094]: Phase 0 | `.gitlab-ci.yml` | Repo root | GitLab CI runner
- [9_PROJECT_ROADMAP-REQ-095]: Phase 1 | `target/adapter-versions.json` | `target/` | `./do lint` freshness check
- [9_PROJECT_ROADMAP-REQ-096]: Phase 1 | `devs-config`, `devs-checkpoint`, `devs-adapters`, `devs-pool`, `devs-executor` crates | `crates/` | Phase 2 depends on all
- [9_PROJECT_ROADMAP-REQ-097]: Phase 2 | `devs-scheduler` crate | `crates/` | Phase 3 depends on this
- [9_PROJECT_ROADMAP-REQ-098]: Phase 2 | `devs-webhook` crate | `crates/` | Phase 3 depends on this
- [9_PROJECT_ROADMAP-REQ-099]: Phase 3 | `devs-server` binary | `target/release/` | Phase 4 bootstrap

## Dependencies
- depends_on: ["05_phase_1_completion_gate.md"]
- shared_components: [./do Entrypoint Script & CI Pipeline (consumer — presubmit produces artifacts), devs-proto (consumer — generated types), devs-core (consumer — domain types), Traceability & Coverage Infrastructure (consumer — traceability.json)]

## 1. Initial Test Written
- [ ] Create `scripts/verify_build_artifacts.sh`.
- [ ] Write check `test_presubmit_timings_exists`: after `./do presubmit`, verify `target/presubmit_timings.jsonl` exists and contains valid JSONL (each line parses as JSON). Annotate `# Covers: 9_PROJECT_ROADMAP-REQ-089`.
- [ ] Write check `test_traceability_json_exists`: verify `target/traceability.json` exists and contains `phase_gates` array. Annotate `# Covers: 9_PROJECT_ROADMAP-REQ-090`.
- [ ] Write check `test_proto_gen_committed`: verify `devs-proto/src/gen/` directory exists and contains at least one `.rs` file. Annotate `# Covers: 9_PROJECT_ROADMAP-REQ-091`.
- [ ] Write check `test_devs_core_types_exist`: verify `crates/devs-core/src/` exists and contains source files defining `BoundedString`. Annotate `# Covers: 9_PROJECT_ROADMAP-REQ-092`.
- [ ] Write check `test_rust_toolchain_exists`: verify `rust-toolchain.toml` exists at repo root. Annotate `# Covers: 9_PROJECT_ROADMAP-REQ-093`.
- [ ] Write check `test_gitlab_ci_exists`: verify `.gitlab-ci.yml` exists at repo root. Annotate `# Covers: 9_PROJECT_ROADMAP-REQ-094`.
- [ ] Write check `test_adapter_versions_produced`: after `./do lint`, verify `target/adapter-versions.json` exists. Annotate `# Covers: 9_PROJECT_ROADMAP-REQ-095`.
- [ ] Write check `test_phase1_crates_exist`: verify `crates/devs-config`, `crates/devs-checkpoint`, `crates/devs-adapters`, `crates/devs-pool`, `crates/devs-executor` directories exist with `Cargo.toml`. Annotate `# Covers: 9_PROJECT_ROADMAP-REQ-096`.
- [ ] Write check `test_scheduler_crate_exists`: verify `crates/devs-scheduler/Cargo.toml` exists. Annotate `# Covers: 9_PROJECT_ROADMAP-REQ-097`.
- [ ] Write check `test_webhook_crate_exists`: verify `crates/devs-webhook/Cargo.toml` exists. Annotate `# Covers: 9_PROJECT_ROADMAP-REQ-098`.
- [ ] Write check `test_server_binary_builds`: after `./do build`, verify `target/release/devs` (or `devs.exe` on Windows) exists. Annotate `# Covers: 9_PROJECT_ROADMAP-REQ-099`.

## 2. Task Implementation
- [ ] Implement `scripts/verify_build_artifacts.sh` as a POSIX sh script.
- [ ] For each artifact, check existence and basic validity (file exists, is non-empty, parses if JSON).
- [ ] Print `PASS: <artifact>` or `FAIL: <artifact> — <reason>` for each check.
- [ ] Exit with non-zero status if any check fails.
- [ ] Integrate this script into `./do presubmit` as a post-build verification step (or document it as a manual verification step for phase gate reviews).

## 3. Code Review
- [ ] Verify script is POSIX sh compatible (no bashisms).
- [ ] Verify Phase 3 artifact check (REQ-099) is conditional — only checked when Phase 3 is complete.
- [ ] Verify all 11 requirement IDs are covered by at least one check.

## 4. Run Automated Tests to Verify
- [ ] Run `./scripts/verify_build_artifacts.sh` and verify it reports status for all artifacts.
- [ ] For artifacts from incomplete phases (e.g., REQ-099 before Phase 3), verify the script reports SKIP rather than FAIL.

## 5. Update Documentation
- [ ] Add header comment to the script explaining its purpose and the artifact manifest it validates.

## 6. Automated Verification
- [ ] Run `./scripts/verify_build_artifacts.sh && echo "ALL ARTIFACTS VERIFIED" || echo "ARTIFACT CHECK FAILED"` and confirm appropriate output.
- [ ] Verify the script is executable (`chmod +x`).
