# Task: Distinct Port and Discovery Path Configuration (Sub-Epic: 089_Detailed Domain Specifications (Part 54))

## Covered Requirements
- [2_TAS-REQ-602]

## Dependencies
- depends_on: [none]
- shared_components: [devs-grpc]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-grpc` (or a dedicated E2E test) that spawns two mock server instances.
- [ ] Verify that when both servers use the same discovery file path, the second one overwrites the first (atomic rename).
- [ ] Verify that a client attempting to connect to the address from the overwritten (stale) discovery file receives a connection error or identifies the mismatch, and the CLI wrapper exits with code 3.
- [ ] Verify that providing distinct ports and discovery file paths allows both servers to operate independently.

## 2. Task Implementation
- [ ] Implement atomic discovery file writing in the server bootstrap logic (e.g., write to a temp file then `std::fs::rename`).
- [ ] Implement client-side detection of stale server addresses (e.g., via a handshake or health check that fails for the old address).
- [ ] Ensure the CLI/TUI clients exit with code 3 when they detect a stale discovery file or connection failure to the specified discovery address.
- [ ] Update server configuration logic to allow specifying both the port and the discovery file path via environment variables or CLI flags.

## 3. Code Review
- [ ] Verify that `std::fs::rename` is used for atomic replacement of the discovery file.
- [ ] Ensure that the client exit code 3 is explicitly handled and documented.
- [ ] Confirm that no race conditions exist during the atomic rename process.

## 4. Run Automated Tests to Verify
- [ ] Run the newly created integration/E2E tests.
- [ ] Ensure `cargo test -p devs-grpc` passes.

## 5. Update Documentation
- [ ] Document the "last writer wins" behavior for discovery files in `docs/architecture.md` (or relevant section).
- [ ] Update the CLI help text for server start-up to mention distinct ports and discovery paths.

## 6. Automated Verification
- [ ] Verify that the E2E test suite includes a case for discovery file conflict and exit code 3.
