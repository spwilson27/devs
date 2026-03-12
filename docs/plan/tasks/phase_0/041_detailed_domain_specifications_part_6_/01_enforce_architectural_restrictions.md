# Task: Enforce Architectural Restrictions (No-Web, No-Auth, Protos as Source of Truth) (Sub-Epic: 041_Detailed Domain Specifications (Part 6))

## Covered Requirements
- [1_PRD-REQ-059], [1_PRD-REQ-060], [1_PRD-REQ-061], [1_PRD-REQ-063]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python script `.tools/verify_architecture_constraints.py` that will be used to enforce these constraints.
- [ ] Add a test case to `tests/test_architecture_constraints.py` (create if needed) that:
  - Asserts that no `axum`, `warp`, `actix-web`, or `rocket` dependencies exist in any `Cargo.toml`.
  - Asserts that no files matching `**/openapi.json`, `**/openapi.yaml`, `**/swagger.json`, or `**/swagger.yaml` exist in the repository.
  - Asserts that no `tonic` interceptors named `AuthInterceptor` or similar exist (by searching for `Interceptor` trait implementations and checking for "auth" keywords).
  - Asserts that `proto/devs/v1/` contains the authoritative `.proto` files and no other `.json` or `.yaml` files are used for service definitions.

## 2. Task Implementation
- [ ] Implement `.tools/verify_architecture_constraints.py`:
  - Use `toml` library to parse all `Cargo.toml` files and check for forbidden dependencies (axum, warp, actix, rocket, tower-http).
  - Use `glob` to scan the repository for forbidden API description files.
  - Use `ripgrep` or a regex search to scan for `tonic` interceptors and verify they are not implementing authentication.
  - Verify that `devs-proto` is the only crate containing API definitions.
- [ ] Integrate this script into the `./do lint` command so it runs during every presubmit.
- [ ] Update `Cargo.toml` workspace-level lints or documentation to explicitly mention these constraints.

## 3. Code Review
- [ ] Ensure the script provides clear error messages identifying which file or dependency violated the constraint.
- [ ] Verify that the script is cross-platform (Linux, macOS, Windows).
- [ ] Ensure no "just-in-case" web dependencies were accidentally included during setup.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure it passes (since we haven't added any forbidden dependencies yet).
- [ ] Temporarily add a forbidden dependency (e.g., `axum`) to a `Cargo.toml` and verify that `./do lint` fails with a clear error.
- [ ] Revert the temporary change.

## 5. Update Documentation
- [ ] Update `GEMINI.md` or a central architecture document (if exists) reflecting these established constraints.

## 6. Automated Verification
- [ ] Run `python3 .tools/verify_architecture_constraints.py` manually and check its output.
