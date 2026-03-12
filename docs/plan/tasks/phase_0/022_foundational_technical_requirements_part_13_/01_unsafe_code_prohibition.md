# Task: Workspace-wide Unsafe Code Prohibition (Sub-Epic: 022_Foundational Technical Requirements (Part 13))

## Covered Requirements
- [2_TAS-REQ-004G]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a temporary crate in the workspace or modify an existing one (e.g., `devs-core`) to include an `unsafe { }` block or `#[allow(unsafe_code)]`.
- [ ] Write a test script (or use a temporary bash command) that runs `./do lint` and asserts that it exits with a non-zero status and reports a clippy or lint error related to `unsafe_code`.

## 2. Task Implementation
- [ ] Update the root `Cargo.toml` workspace lints section (`[workspace.lints.rust]`) to include `unsafe_code = "deny"`.
- [ ] Ensure all member crates have `[lints] workspace = true`.
- [ ] Update `./do lint` to ensure it runs `cargo clippy --workspace --all-targets --all-features -- -D warnings`, which will now include the `unsafe_code` denial.
- [ ] Verify that no `#[allow(unsafe_code)]` or `unsafe` block exists in any workspace source file (except for dev-dependencies or external crates, as per [2_TAS-REQ-004B]).
- [ ] Implement a custom check in `./do lint` using `grep` to ensure no `#[allow(unsafe_code)]` exists in the codebase, even if clippy doesn't catch it for some reason (e.g., if it's commented out in a way that bypasses standard checks).

## 3. Code Review
- [ ] Verify that the `unsafe_code = "deny"` lint is active at the workspace level.
- [ ] Confirm that no `unsafe` keyword is present in any non-dev source file.
- [ ] If any third-party crate requires a safe abstraction for its `unsafe` API, verify it's wrapped in a safe module with a `SAFETY:` comment (though the `unsafe` keyword in workspace source remains prohibited per [2_TAS-REQ-004G]).

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure it passes on the clean codebase.
- [ ] Introduce a dummy `unsafe` block and confirm `./do lint` fails.

## 5. Update Documentation
- [ ] Ensure the agent's memory or `GEMINI.md` reflects that `unsafe_code` is strictly prohibited in this workspace.

## 6. Automated Verification
- [ ] Run `cargo clippy --workspace -- -D unsafe_code` to confirm the lint is active.
- [ ] Run the `./do lint` command and verify its output for unsafe code checks.
