# Task: Implement Wire Type Boundary Verification Lint (Sub-Epic: 015_Foundational Technical Requirements (Part 6))

## Covered Requirements
- [2_TAS-REQ-001G]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python test script `tests/test_boundary_enforcement.py` that:
    - Sets up a mock Rust workspace with crates `devs-proto`, `devs-scheduler`, `devs-executor`, and `devs-pool`.
    - Injects a `devs_proto` type into the public API of `devs-scheduler`.
    - Asserts that the verification script correctly identifies and reports this violation.
    - Injects a `devs_proto` type into the private (internal) modules of `devs-scheduler` and asserts it is NOT reported (only public API is restricted).
    - Verifies that `devs-core` types are allowed in the public API.

## 2. Task Implementation
- [ ] Implement a verification script `.tools/verify_boundary_enforcement.py` that:
    - Uses `cargo metadata` to identify the crates `devs-scheduler`, `devs-executor`, and `devs-pool`.
    - Scans the `src/` directories of these crates for `pub` items.
    - Uses a regex or a simple parser to detect usage of `devs_proto` types in the signature of `pub` functions, structs, enums, and traits.
    - Exits with a non-zero status if any violations are found, printing the file, line number, and offending type.
- [ ] Integrate this script into `./do lint`:
    - Add a step to `docs/plan/phases/phase_0.md` or the script itself that runs this verification as part of the linting sequence.
    - Ensure it is executed after `cargo clippy` and before `cargo doc`.

## 3. Code Review
- [ ] Verify that the script correctly handles nested `pub` items (e.g., `pub struct` with `pub` fields).
- [ ] Ensure that the script does not flag `devs-core` types, which are the intended common types for cross-crate communication.
- [ ] Confirm that the script is cross-platform (handles path separators correctly).

## 4. Run Automated Tests to Verify
- [ ] Run `python3 tests/test_boundary_enforcement.py` and ensure it passes.
- [ ] Run `./do lint` on the current project and ensure it doesn't fail due to this new check (since no logic is implemented yet, it should pass).

## 5. Update Documentation
- [ ] Update `.tools/README.md` to document the new boundary enforcement check and how to resolve violations.

## 6. Automated Verification
- [ ] Execute `grep "verify_boundary_enforcement" ./do` to confirm the lint is integrated.
- [ ] Run `cargo metadata` to verify that `devs-scheduler`, `devs-executor`, and `devs-pool` do not have `devs-proto` in their `[dependencies]` (though REQ-001G focuses on types, this is a good complementary check).
