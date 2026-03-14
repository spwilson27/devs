# Task: Enforce Acyclic Workspace Dependency Graph (Sub-Epic: 045_Detailed Domain Specifications (Part 10))

## Covered Requirements
- [2_TAS-REQ-100]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] Create `tests/phase_0/test_acyclic_dependencies.rs` (or a shell script `tests/verify_acyclic_deps.sh` invocable from `./do lint`).
- [ ] **Test 1 — Workspace dependency graph is acyclic** (`test_no_circular_dependencies`): Run `cargo metadata --format-version 1 --no-deps` and parse the JSON output. Build an adjacency list of workspace crate dependencies (filter to only crates whose `source` is null, i.e., path dependencies). Perform a topological sort; assert it succeeds (no cycle detected). If a cycle is found, print the cycle path and fail.
- [ ] **Test 2 — `devs-core` has zero workspace dependencies** (`test_devs_core_is_root`): From the `cargo metadata` output, find the `devs-core` package. Assert its `dependencies` list contains zero entries where the dependency is another workspace crate.
- [ ] **Test 3 — `devs-proto` has zero workspace dependencies** (`test_devs_proto_is_root`): Same as Test 2 but for `devs-proto`.
- [ ] **Test 4 — Only `devs-server` depends on all crates** (`test_only_server_depends_on_all`): For each workspace crate that is not `devs-server`, assert it does NOT depend on all other workspace crates simultaneously. `devs-server` is the only crate permitted to have a dependency on every other workspace crate.
- [ ] Add `// Covers: 2_TAS-REQ-100` to the test file.

## 2. Task Implementation
- [ ] If using a shell script, implement the logic using `cargo metadata --format-version 1 --no-deps` piped through `jq` or a Python script to:
    1. Extract workspace members and their inter-workspace dependencies.
    2. Build a directed graph and run a DFS-based cycle detection.
    3. Check the root crate constraints (`devs-core`, `devs-proto` have zero inbound workspace edges from themselves outward).
    4. Check the `devs-server` exclusivity constraint.
- [ ] Integrate this check into `./do lint` so it runs as part of every presubmit. The lint step must fail with a clear error message if any constraint is violated.
- [ ] If workspace crates do not yet exist (Phase 0 may only have stubs), ensure the test handles the case where only `devs-core` and/or `devs-proto` exist and passes trivially.

## 3. Code Review
- [ ] Verify the dependency check script correctly parses `cargo metadata` JSON and does not accidentally flag external (crates.io) dependencies as workspace violations.
- [ ] Verify the cycle detection algorithm is correct (standard DFS with back-edge detection or Kahn's algorithm).
- [ ] Confirm error messages clearly identify which crate(s) violate the constraint.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and confirm it passes with the current workspace layout.
- [ ] Optionally, temporarily add a circular dependency in a test `Cargo.toml` and confirm `./do lint` fails (then revert).

## 5. Update Documentation
- [ ] Add a brief note to the workspace architecture docs (if any) explaining the enforced dependency layering rules.

## 6. Automated Verification
- [ ] Run `./do test` and confirm `2_TAS-REQ-100` appears as covered in the traceability report.
- [ ] Run `./do lint` and confirm it exits 0.
