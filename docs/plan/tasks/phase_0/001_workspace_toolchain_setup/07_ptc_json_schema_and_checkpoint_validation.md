# Task: Implement PTC JSON Schema and Checkpoint Validation (Sub-Epic: 001_workspace_toolchain_setup)

## Covered Requirements
- [ROAD-SCHEMA-001], [ROAD-SCHEMA-002], [ROAD-SCHEMA-003], [ROAD-SCHEMA-004], [ROAD-SCHEMA-005], [ROAD-SCHEMA-006], [ROAD-SCHEMA-007], [ROAD-SCHEMA-008], [ROAD-SCHEMA-009], [ROAD-SCHEMA-010], [ROAD-SCHEMA-011], [ROAD-SCHEMA-012], [ROAD-SCHEMA-013], [ROAD-SCHEMA-014], [ROAD-SCHEMA-015], [ROAD-SCHEMA-016], [AC-ROAD-CHECK-001], [AC-ROAD-CHECK-002], [AC-ROAD-CHECK-003], [AC-ROAD-CHECK-004], [AC-ROAD-CHECK-005], [AC-ROAD-CHECK-007], [AC-ROAD-CHECK-008], [AC-ROAD-CHECK-009], [AC-ROAD-CHECK-010], [AC-ROAD-007], [ROAD-CHECK-001], [ROAD-CHECK-002], [ROAD-CHECK-003], [ROAD-CHECK-004], [ROAD-CHECK-005], [ROAD-CHECK-006], [ROAD-CHECK-BR-001], [ROAD-CHECK-BR-002], [ROAD-CHECK-BR-003], [ROAD-CHECK-BR-004], [ROAD-CHECK-BR-005], [ROAD-CHECK-BR-006], [ROAD-CHECK-BR-007], [ROAD-CHECK-BR-008], [ROAD-CHECK-BR-009], [ROAD-CHECK-BR-010], [ROAD-CHECK-BR-011], [ROAD-CHECK-BR-012]

## Dependencies
- depends_on: [03_workspace_build_validation.md]
- shared_components: [devs-core, Phase Transition Checkpoint (PTC) Model, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-core/tests/ptc_schema.rs` that verify:
  1. A valid `PhaseTransitionCheckpoint` struct serializes and deserializes correctly with all required fields: `schema_version`, `phase_id`, `phase_name`, `completed_at`, `completed_by`, `ci_pipeline_url`, `platforms_verified`, `gate_conditions`, `risk_mitigations_confirmed`, `bootstrap_stubs_present`, `notes`. Annotate `// Covers: ROAD-SCHEMA-001` through `// Covers: ROAD-SCHEMA-011`.
  2. `schema_version` must always equal `1` — reject any other value. Annotate `// Covers: ROAD-SCHEMA-012`.
  3. `phase_id` must match format `phase_N` where N is 0–5. Annotate `// Covers: ROAD-SCHEMA-013`, `// Covers: AC-ROAD-CHECK-002`.
  4. `completed_at` must be valid RFC 3339 timestamp. Annotate `// Covers: ROAD-SCHEMA-014`, `// Covers: AC-ROAD-CHECK-003`.
  5. `platforms_verified` must contain exactly `["linux", "macos", "windows"]` for non-Phase-0 PTCs. Annotate `// Covers: ROAD-SCHEMA-015`, `// Covers: AC-ROAD-CHECK-005`.
  6. `gate_conditions` must be non-empty and every entry must have `verified: true`. Annotate `// Covers: ROAD-SCHEMA-016`, `// Covers: AC-ROAD-CHECK-004`.
  7. PTC file naming must match `docs/adr/<NNNN>-phase-<N>-complete.md`. Annotate `// Covers: AC-ROAD-CHECK-008`.
  8. `ci_pipeline_url` must be a non-empty string when present. Annotate `// Covers: AC-ROAD-CHECK-009`.
  9. `completed_by` must be a non-empty string. Annotate `// Covers: AC-ROAD-CHECK-010`.
  10. `schema_version` validation rejects values != 1. Annotate `// Covers: AC-ROAD-CHECK-001`.
  11. `bootstrap_stubs_present` must be `true` for phases 0–3, `false` for phases 4–5. Annotate `// Covers: AC-ROAD-CHECK-007`.
- [ ] Create tests for programmatic PTC validation (`validate()` method) that returns all errors in a single pass. Annotate `// Covers: AC-ROAD-007`.
- [ ] Create tests for checkpoint verification rules:
  1. Verify a PTC cannot be committed with any `verified: false` gate condition. Annotate `// Covers: ROAD-CHECK-001`.
  2. Verify duplicate PTCs for the same phase are rejected. Annotate `// Covers: ROAD-CHECK-002`.
  3. Verify PTC must reference a valid CI pipeline run. Annotate `// Covers: ROAD-CHECK-003`.
  4. Verify PTC must list all three platforms as verified. Annotate `// Covers: ROAD-CHECK-004`.
  5. Verify PTC gate conditions map to testable assertions. Annotate `// Covers: ROAD-CHECK-005`.
  6. Verify PTC validation is integrated into `./do lint`. Annotate `// Covers: ROAD-CHECK-006`.
- [ ] Create tests for checkpoint business rules:
  1–12. Write one test per ROAD-CHECK-BR rule (ROAD-CHECK-BR-001 through ROAD-CHECK-BR-012) verifying the corresponding checkpoint invariant (e.g., no re-opening completed phases, no skipping phases, no partial gate verification).

## 2. Task Implementation
- [ ] Define `PhaseTransitionCheckpoint` struct in `crates/devs-core/src/ptc.rs` with all 11 schema fields from ROAD-SCHEMA-001 through ROAD-SCHEMA-011.
- [ ] Implement `GateCondition` struct with `id: String`, `description: String`, `verified: bool` fields.
- [ ] Implement `PhaseTransitionCheckpoint::validate(&self) -> Result<(), Vec<PtcValidationError>>` that collects all validation errors in a single pass:
  - Schema version must be 1.
  - Phase ID format must match `phase_[0-5]`.
  - `completed_at` must parse as RFC 3339.
  - `gate_conditions` must be non-empty with all entries `verified: true`.
  - `platforms_verified` must contain the three required platforms.
  - `bootstrap_stubs_present` must align with phase number.
- [ ] Implement PTC file name validation function: `validate_ptc_filename(path: &str) -> Result<u8, PtcValidationError>` returning the phase number.
- [ ] Add PTC validation to `./do lint`:
  - Scan `docs/adr/` for PTC files matching the naming convention.
  - Parse embedded JSON and run `validate()`.
  - Reject duplicate phase PTCs.
  - Exit non-zero on any validation failure.
- [ ] Add PTC gate information to `target/traceability.json` output from `./do test` with `phase_gates` array.

## 3. Code Review
- [ ] Verify `PhaseTransitionCheckpoint` has `#[derive(Serialize, Deserialize)]` and all fields are documented.
- [ ] Verify validation collects all errors rather than failing on first error.
- [ ] Verify no `tokio`, `git2`, `reqwest`, or `tonic` imports in `devs-core`.
- [ ] Verify all 43 requirement IDs are annotated in test code with `// Covers:` comments.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- ptc_schema` and confirm all tests pass.
- [ ] Run `./do lint` with a valid PTC file and confirm it passes.
- [ ] Run `./do lint` with an invalid PTC file (e.g., `verified: false`) and confirm it fails.

## 5. Update Documentation
- [ ] Add doc comments to the `PhaseTransitionCheckpoint` struct and all its fields explaining the schema constraints.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core` and confirm zero failures.
- [ ] Run `./do lint` and confirm PTC validation is active.
- [ ] Verify `target/traceability.json` contains a `phase_gates` array after running `./do test`.
