# Task: Enforce "No Web" Dependency and Asset Policy (Sub-Epic: 040_Detailed Domain Specifications (Part 5))

## Covered Requirements
- [1_PRD-REQ-054], [1_PRD-REQ-055], [1_PRD-REQ-056], [1_PRD-REQ-057]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python script `.tools/verify_no_web.py` that FIRST fails if it detects any web application framework crates (e.g., `actix-web`, `axum`, `rocket`, `warp`) in the workspace's dependency tree (using `cargo tree`).
- [ ] Add a check to this script that fails if any `.html`, `.css`, or `.js` files are found in the crate source directories (excluding tests and the `docs/` folder).
- [ ] The test should verify that the script correctly identifies a dummy "web" dependency or file.

## 2. Task Implementation
- [ ] Integrate `.tools/verify_no_web.py` into the `./do lint` command.
- [ ] Implement the dependency check using `cargo tree --target all` (to check all platforms) and parse the output for blacklisted crate names.
- [ ] Implement the asset check using a filesystem walk that ignores `.git`, `target`, `tests`, `examples`, and `docs` directories.
- [ ] Ensure the script provides clear error messages indicating which requirement was violated.
- [ ] Ensure the script allows development/test-only dependencies (e.g., `reqwest` for integration tests) but strictly prohibits them in build targets for the server binary.

## 3. Code Review
- [ ] Verify that the script correctly handles transitive dependencies.
- [ ] Ensure the blacklist is comprehensive based on [1_PRD-REQ-056].
- [ ] Verify that the filesystem walk is efficient and correctly respects ignore paths.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure it passes on the current clean workspace.
- [ ] Temporarily add a dummy `html` file to a crate's `src` and verify `./do lint` fails.
- [ ] Temporarily add `axum` as a dependency in a crate's `Cargo.toml` and verify `./do lint` fails.

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to note the enforcement of the "No Web" architectural policy.
- [ ] Document the non-goals [1_PRD-REQ-054] in the project's internal developer guide (if it exists) or as a comment in the verification script.

## 6. Automated Verification
- [ ] Run `./do lint` and verify the exit code is 0 on the clean workspace.
- [ ] Verify that the traceability script (from Sub-Epic 005) picks up these requirement IDs from the new verification script.
