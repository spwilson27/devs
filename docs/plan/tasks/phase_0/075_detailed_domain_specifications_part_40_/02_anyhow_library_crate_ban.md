# Task: Enforce anyhow Ban in Library Crates (Sub-Epic: 075_Detailed Domain Specifications (Part 40))

## Covered Requirements
- [2_TAS-REQ-451]

## Dependencies
- depends_on: ["none"]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Create a test that for each library crate in the workspace (`devs-core`, `devs-config`, `devs-checkpoint`, `devs-adapters`, `devs-pool`, `devs-executor`, `devs-scheduler`, `devs-webhook`, `devs-grpc`, `devs-mcp`, `devs-proto`), reads `Cargo.toml` and asserts that `anyhow` does not appear under `[dependencies]` or `[dependencies.*]`.
- [ ] The test should parse each `Cargo.toml` using a TOML parser (or simple text search for `anyhow` under `[dependencies]` sections) and fail with `"FAIL [2_TAS-REQ-451]: anyhow found in [dependencies] of <crate>"`.
- [ ] Binary crates (e.g., `devs-server`, `devs-cli`, `devs-tui`) are explicitly excluded from this check — they MAY use `anyhow`.

## 2. Task Implementation
- [ ] Add a dependency-audit step to `./do lint` that iterates over all library crate `Cargo.toml` files and checks for `anyhow` in the `[dependencies]` table.
- [ ] The list of library crates must be maintained as a constant (array of paths) in the lint script. If a crate directory does not yet exist (early phases), skip it with a warning rather than failing.
- [ ] If `anyhow` is found, exit non-zero: `"ERROR [2_TAS-REQ-451]: anyhow is forbidden in library crate <crate>. Use typed errors instead."`.

## 3. Code Review
- [ ] Verify the check only inspects `[dependencies]`, not `[dev-dependencies]` or `[build-dependencies]` — `anyhow` in dev-dependencies is acceptable for test helpers.
- [ ] Confirm the crate list matches the 11 library crates specified in the requirement exactly.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and confirm exit 0.
- [ ] For any library crate that exists, temporarily add `anyhow = "1"` to its `[dependencies]`, run `./do lint`, confirm non-zero exit with the expected message. Revert.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-451` annotation to the lint check code.

## 6. Automated Verification
- [ ] Run `./do lint` in CI and confirm exit code 0 with the anyhow audit step reporting PASS.
