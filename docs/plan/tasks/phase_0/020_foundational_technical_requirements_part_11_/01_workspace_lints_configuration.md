# Task: Workspace Lints Configuration (Sub-Epic: 020_Foundational Technical Requirements (Part 11))

## Covered Requirements
- [2_TAS-REQ-004A]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a test script `tests/test_workspace_lints.py` that parses the root `Cargo.toml` using `toml` library and asserts:
    - The `[workspace.lints.rust]` section exists and contains `missing_docs = "deny"`, `unsafe_code = "deny"`, `unused_must_use = "deny"`, and `dead_code = "warn"`.
    - The `[workspace.lints.clippy]` section exists and contains `all = { level = "deny", priority = -1 }` and `pedantic = { level = "warn", priority = -1 }`.
    - `module_name_repetitions = "allow"` and `must_use_candidate = "allow"` are present.
- [ ] Create a test that iterates through all `Cargo.toml` files in the workspace (found via `glob`) and verifies they contain `[lints] workspace = true`.

## 2. Task Implementation
- [ ] Update the root `Cargo.toml` to include the `[workspace.lints]` table with all the specified lints from [2_TAS-REQ-004A].
- [ ] Update every existing crate's `Cargo.toml` (e.g., `devs-proto`, `devs-core`, etc.) to include `[lints] workspace = true` and remove any redundant local lint configurations.
- [ ] Run `cargo clippy` and `cargo fmt` to ensure the new lints are enforced and all current code complies.

## 3. Code Review
- [ ] Verify that `unsafe_code = "deny"` correctly triggers a failure if `unsafe` blocks are added.
- [ ] Ensure that `missing_docs = "deny"` correctly triggers a failure for any public item without documentation.
- [ ] Check that `clippy::all` is correctly set to `deny` with `priority = -1` to allow overrides.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_workspace_lints.py`.
- [ ] Run `./do lint` and ensure it passes.

## 5. Update Documentation
- [ ] Update `GEMINI.md` or the developer guide to reflect the new workspace-wide linting standards.

## 6. Automated Verification
- [ ] Run `grep -r "\[lints\]" . --include="Cargo.toml"` to confirm all crates are using the workspace lints.
