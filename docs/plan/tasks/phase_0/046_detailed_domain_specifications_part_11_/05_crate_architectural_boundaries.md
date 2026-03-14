# Task: Crate Architectural Boundary Enforcement (Sub-Epic: 046_Detailed Domain Specifications (Part 11))

## Covered Requirements
- [2_TAS-REQ-101]

## Dependencies
- depends_on: []
- shared_components: [none (cross-cutting lint, not owned by a single crate)]

## 1. Initial Test Written
- [ ] Create an integration test or lint script (e.g., `tests/architecture_test.rs` at workspace root, or `.tools/verify_crate_boundaries.sh`) with `// Covers: 2_TAS-REQ-101` annotation:
- [ ] **Binary crates not depended upon**: Parse every `Cargo.toml` in the workspace. For each of the 4 binary crates (`devs-server`, `devs-tui`, `devs-cli`, `devs-mcp-bridge`), assert that their crate name does NOT appear in the `[dependencies]`, `[dev-dependencies]`, or `[build-dependencies]` of any other workspace member's `Cargo.toml`.
- [ ] **Library crates have no main function**: For each library crate (all workspace members except the 4 binary crates), assert that no file matching `src/main.rs` exists, and that no file contains `fn main()` outside of `#[cfg(test)]` blocks or examples.
- [ ] **Binary crates are thin wrappers**: For each binary crate, assert that `src/main.rs` exists. Count the non-comment, non-blank lines in `src/main.rs` — warn if over 50 lines (heuristic for "thin wrapper" enforcement).
- [ ] **Binary crate `[[bin]]` or `src/main.rs` verification**: Assert each binary crate either has a `[[bin]]` entry in `Cargo.toml` or has a `src/main.rs` file.

## 2. Task Implementation
- [ ] Create `.tools/verify_crate_boundaries.sh` (POSIX sh) that:
    1. Lists all workspace member directories from the root `Cargo.toml` `[workspace] members` field.
    2. Identifies binary crates by checking for `src/main.rs` or `[[bin]]` in their `Cargo.toml`.
    3. For each non-binary workspace member, greps its `Cargo.toml` for any reference to a binary crate name in dependency sections. Exits non-zero if found.
    4. For each library crate, checks that `src/main.rs` does not exist. Exits non-zero if found.
    5. Outputs a clear pass/fail summary.
- [ ] Integrate the script into `./do lint` so it runs as part of the standard lint pipeline.
- [ ] If any existing `Cargo.toml` files violate the boundary (e.g., a library crate depending on `devs-server`), fix them by moving the dependency in the correct direction or extracting shared logic into a library crate.
- [ ] Verify that each binary crate's `src/main.rs` contains only entry-point wiring: CLI argument parsing, tokio runtime setup, and calls into library crate functions. Move any business logic found in binary crates into the appropriate library crate.

## 3. Code Review
- [ ] Confirm the verification script correctly identifies all 4 binary crates by name.
- [ ] Verify the script handles workspace members with path dependencies (not just crate names).
- [ ] Confirm no false positives from dev-dependencies or build-dependencies that legitimately reference binary crate names in other contexts (e.g., string literals in tests).
- [ ] Verify the script is integrated into `./do lint` and will fail CI on violations.

## 4. Run Automated Tests to Verify
- [ ] Run `.tools/verify_crate_boundaries.sh` directly and confirm exit code 0.
- [ ] Run `cargo build --workspace` to confirm the workspace compiles with correct dependency directions.
- [ ] Run `./do lint` and confirm the new check passes.

## 5. Update Documentation
- [ ] Add doc comments at the top of `.tools/verify_crate_boundaries.sh` explaining the architectural rule: binary crates are leaf nodes in the dependency graph, library crates contain all logic.

## 6. Automated Verification
- [ ] Run `./do test` and confirm `target/traceability.json` includes coverage for `2_TAS-REQ-101`.
- [ ] Run `./do lint` and confirm zero errors including the new boundary check.
