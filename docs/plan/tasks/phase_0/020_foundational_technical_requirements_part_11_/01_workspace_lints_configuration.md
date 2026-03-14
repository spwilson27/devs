# Task: Workspace Lints Configuration (Sub-Epic: 020_Foundational Technical Requirements (Part 11))

## Covered Requirements
- [2_TAS-REQ-004A]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script & CI Pipeline (consumer)]

## 1. Initial Test Written
- [ ] Create `tests/workspace_lints_test.rs` (or a Python script `tests/test_workspace_lints.py`) that programmatically parses the root `Cargo.toml` and asserts:
    - `[workspace.lints.rust]` section exists with exactly these entries:
        - `missing_docs = "deny"`
        - `unsafe_code = "deny"`
        - `unused_must_use = "deny"`
        - `dead_code = "warn"`
    - `[workspace.lints.clippy]` section exists with exactly these entries:
        - `all = { level = "deny", priority = -1 }`
        - `pedantic = { level = "warn", priority = -1 }`
        - `module_name_repetitions = "allow"`
        - `must_use_candidate = "allow"`
- [ ] Create a second test that discovers all `Cargo.toml` files listed in `[workspace.members]` (by reading root `Cargo.toml`, extracting member paths, and checking each member's `Cargo.toml`) and asserts each contains `[lints] workspace = true` (the TOML key `lints.workspace` must equal `true`).
- [ ] Create a compilation test: write a small Rust file (e.g., in a test harness crate) that contains `unsafe {}` and a public function without a doc comment, then verify `cargo clippy` / `cargo check` produces the expected deny-level errors. This confirms the lints are actually enforced at compile time, not just present in TOML.

## 2. Task Implementation
- [ ] Add the following to the root `Cargo.toml` under `[workspace.lints.rust]`:
    ```toml
    missing_docs       = "deny"
    unsafe_code        = "deny"
    unused_must_use    = "deny"
    dead_code          = "warn"
    ```
- [ ] Add the following to the root `Cargo.toml` under `[workspace.lints.clippy]`:
    ```toml
    all                     = { level = "deny", priority = -1 }
    pedantic                = { level = "warn", priority = -1 }
    module_name_repetitions = "allow"
    must_use_candidate      = "allow"
    ```
- [ ] In every existing workspace member crate's `Cargo.toml`, add `[lints] workspace = true` and remove any crate-local `#![deny(...)]` or `#![warn(...)]` attributes that are now redundant with the workspace-level configuration.
- [ ] Fix all existing code that violates the new lint rules: add missing doc comments to all public items, remove any `unsafe` blocks (if any exist), and address any new clippy warnings promoted to errors.
- [ ] Run `cargo clippy --workspace --all-targets` and `cargo doc --workspace --no-deps` to confirm zero errors/warnings at the new lint levels.

## 3. Code Review
- [ ] Verify that `unsafe_code = "deny"` is at the workspace level and no crate overrides it with a local `allow`.
- [ ] Verify that `clippy::all` uses `priority = -1` so that specific clippy lint overrides (like `module_name_repetitions = "allow"`) take precedence.
- [ ] Confirm no crate has a local `[lints]` section that shadows or weakens the workspace lints — only `workspace = true` is permitted.
- [ ] Ensure `dead_code = "warn"` (not `"deny"`) to allow in-progress development without blocking compilation.

## 4. Run Automated Tests to Verify
- [ ] Run the workspace lints parsing test: `python tests/test_workspace_lints.py` or `cargo test --test workspace_lints_test`.
- [ ] Run `./do lint` and verify it passes with zero errors.
- [ ] Run `cargo clippy --workspace --all-targets -- -D warnings` and confirm exit code 0.

## 5. Update Documentation
- [ ] Add a brief section to the developer guide (or `CLAUDE.md`) noting that all lint policy is centralized in the root `Cargo.toml` `[workspace.lints]` table and must not be overridden locally.

## 6. Automated Verification
- [ ] Run `grep -rn "\[lints\]" --include="Cargo.toml" .` and confirm every member crate shows `workspace = true` and no crate defines local lint overrides.
- [ ] Run `cargo clippy --workspace --all-targets 2>&1 | grep -c "error"` and confirm the count is 0.
