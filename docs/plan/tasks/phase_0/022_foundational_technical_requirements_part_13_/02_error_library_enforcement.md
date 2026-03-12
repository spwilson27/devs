# Task: Error Library Enforcement (thiserror vs anyhow) (Sub-Epic: 022_Foundational Technical Requirements (Part 13))

## Covered Requirements
- [2_TAS-REQ-005A]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Add `anyhow` as a dependency to a library crate (e.g., `devs-core`) in `Cargo.toml`.
- [ ] Write a test script (or use a temporary bash command) that runs `./do lint` and asserts that it exits with a non-zero status and reports an error indicating that `anyhow` is prohibited in library crates.

## 2. Task Implementation
- [ ] Update the authoritative dependency table (e.g., `docs/plan/requirements/2_tas.md`) to clearly mark `anyhow` as "binary crates only" per [2_TAS-REQ-005A].
- [ ] Implement a lint check in `./do lint` (using a script like `scripts/check_anyhow_usage.py` or similar) that:
    - Lists all workspace crates.
    - Identifies if a crate is a library or a binary (based on `Cargo.toml` or the presence of `src/main.rs`).
    - Verifies that `anyhow` is NOT in the `[dependencies]` section of any library crate.
    - Library crates MUST use `thiserror` for error definitions.
- [ ] Ensure `anyhow` is allowed ONLY in `devs-server`, `devs-tui`, `devs-cli`, and `devs-mcp-bridge` binaries.
- [ ] Integrate this script into `./do lint`.

## 3. Code Review
- [ ] Verify that the script correctly distinguishes between library and binary crates.
- [ ] Confirm that `anyhow` does not appear in the `[dependencies]` of `devs-core`, `devs-config`, etc.
- [ ] Ensure that `anyhow` is correctly used in `[dev-dependencies]` (as this is allowed per [2_TAS-REQ-005A]).

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure it passes on the clean codebase.
- [ ] Add `anyhow` to a library crate's `[dependencies]` and confirm `./do lint` fails.

## 5. Update Documentation
- [ ] Update the `GEMINI.md` file to record that library crates must use `thiserror` and binary crates should use `anyhow` for top-level error propagation.

## 6. Automated Verification
- [ ] Run the custom `anyhow` usage check script and verify it correctly flags violations.
- [ ] Inspect the `Cargo.toml` files for all library crates to ensure no `anyhow` dependency exists.
