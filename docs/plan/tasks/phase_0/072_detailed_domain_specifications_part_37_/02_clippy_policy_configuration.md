# Task: Clippy Policy Configuration (Sub-Epic: 072_Detailed Domain Specifications (Part 37))

## Covered Requirements
- [2_TAS-REQ-436]

## Dependencies
- depends_on: ["none"]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Write an integration test that parses the workspace-level `Cargo.toml` `[workspace.lints.clippy]` table and asserts:
  1. `clippy::all` is set to `"deny"`.
  2. `clippy::pedantic` is set to `"warn"` (not `"deny"`).
- [ ] Write a test that scans all workspace member `Cargo.toml` files and asserts none of them override the workspace clippy policy with per-crate `[lints.clippy]` entries that contradict the workspace settings (i.e., no crate sets `clippy::pedantic = "deny"` or `clippy::all = "warn"`).

## 2. Task Implementation
- [ ] In the workspace root `Cargo.toml`, add or update the `[workspace.lints.clippy]` section:
  ```toml
  [workspace.lints.clippy]
  all = "deny"
  pedantic = "warn"
  ```
- [ ] Ensure each workspace member `Cargo.toml` includes `[lints] workspace = true` to inherit the workspace lint table.
- [ ] Verify `./do lint` invokes clippy with settings that respect the workspace lint table (no extra `-D clippy::pedantic` flag that would override the `warn` level).

## 3. Code Review
- [ ] Confirm the workspace `Cargo.toml` lint table is the single source of truth — no per-crate overrides exist.
- [ ] Confirm that `clippy::pedantic` at `warn` level allows the build to succeed while still surfacing pedantic warnings for iterative improvement.

## 4. Run Automated Tests to Verify
- [ ] Run the integration test confirming the lint table values.
- [ ] Run `cargo clippy --workspace -- -D warnings` and confirm it compiles (pedantic warnings do not block because they are `warn`, not `deny`; `clippy::all` denials do block).

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-436` annotation to each test.

## 6. Automated Verification
- [ ] Run `./do lint` and verify exit code 0.
- [ ] Run `cargo clippy --workspace` and confirm no `clippy::all`-level errors exist.
