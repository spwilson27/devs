# Task: Logging and Audit Foundation (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-011], [5_SECURITY_DESIGN-REQ-014], [5_SECURITY_DESIGN-REQ-053], [5_SECURITY_DESIGN-REQ-055], [5_SECURITY_DESIGN-REQ-060], [5_SECURITY_DESIGN-REQ-061], [5_SECURITY_DESIGN-REQ-062]

## Dependencies
- depends_on: []
- shared_components: [devs-grpc, devs-core]

## 1. Initial Test Written
- [ ] Write a test that initializes `tracing` with a JSON subscriber and verifies that log events contain the mandatory fields: `timestamp`, `level`, `target`, and `fields.event_type`.
- [ ] Create a unit test for UUID generation ensuring it uses `uuid` v4 (random) and sources from the OS CSPRNG.
- [ ] Implement a test in `./do lint` that runs `cargo audit --deny warnings` and fails if any advisories are found.

## 2. Task Implementation
- [ ] Set up the `tracing` crate with a JSON-formatted subscriber for server operational logs (stderr).
- [ ] Implement a custom `tracing-subscriber` layer to handle field redaction for sensitive fields.
- [ ] Define a registry of authoritative `event_type` strings (e.g., `run.submitted`, `security.misconfiguration`).
- [ ] Ensure UUID generation for all internal IDs uses UUID v4.
- [ ] Add `cargo audit` to the `./do setup` and `./do lint` scripts.
- [ ] Implement support for `audit.toml` to suppress known/accepted advisories with an expiry date.
- [ ] Add a workspace-wide lint to deny `unsafe_code`.

## 3. Code Review
- [ ] Confirm that `println!` and `eprintln!` are denied in favor of `tracing` macros.
- [ ] Verify that `cargo audit` is correctly integrated into the CI pipeline.
- [ ] Ensure that UUID generation is not sequential or timestamp-based.

## 4. Run Automated Tests to Verify
- [ ] `./do lint`
- [ ] `cargo test -p devs-core`

## 5. Update Documentation
- [ ] Update the project's security policy to include mandatory log formats and audit requirements.

## 6. Automated Verification
- [ ] Verify that `cargo audit` runs and produces a valid report (or failure) based on the current dependency set.
