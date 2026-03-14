# Task: CLI Standardized Output Format and Exit Code Contract (Sub-Epic: 012_Foundational Technical Requirements (Part 3))

## Covered Requirements
- [2_PRD-BR-010], [2_PRD-BR-011], [2_PRD-BR-012]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer — error enums), devs-cli (owner — not yet created, this task scaffolds CLI output foundations)]

## 1. Initial Test Written
- [ ] In `devs-core/src/cli.rs` (or `devs-core/src/error.rs` if extending existing error module), write unit tests for a `CliExitCode` enum with variants `Success = 0`, `GeneralError = 1`, `NotFound = 2`, `ServerUnreachable = 3`, `ValidationError = 4`. Test that each variant's `as_i32()` returns the correct integer value. Annotate: `// Covers: 2_PRD-BR-011`.
- [ ] Write a unit test for a `CliErrorResponse` struct with fields `error: String` and `code: i32`. Test that `serde_json::to_string(&CliErrorResponse { error: "not found".into(), code: 2 })` produces `{"error":"not found","code":2}`. Annotate: `// Covers: 2_PRD-BR-012`.
- [ ] Write a unit test for an `OutputFormat` enum (`Text`, `Json`) parsed from the string values `"text"` and `"json"`. Test that `OutputFormat::from_str("json")` returns `Ok(OutputFormat::Json)` and unknown values return an error. Annotate: `// Covers: 2_PRD-BR-010`.
- [ ] Write a unit test for a `CliOutput` helper that, given `OutputFormat::Json` and a serializable success payload, produces exactly one JSON object on a single line (no trailing newline noise). Annotate: `// Covers: 2_PRD-BR-010`.
- [ ] Write a unit test for `CliOutput` that, given `OutputFormat::Json` and a `CliErrorResponse`, serializes the error JSON to a `Vec<u8>` representing stdout and returns the correct non-zero exit code. Annotate: `// Covers: 2_PRD-BR-012`.
- [ ] Write a test that `CliOutput` in `Text` mode writes human-readable text (not JSON) to the output buffer. Annotate: `// Covers: 2_PRD-BR-010`.

## 2. Task Implementation
- [ ] Define `CliExitCode` as a `#[repr(i32)]` enum in `devs-core` with the five variants. Implement `From<CliExitCode> for i32` and `std::fmt::Display`.
- [ ] Define `CliErrorResponse` as a `#[derive(Serialize, Deserialize)]` struct with `error: String` and `code: i32`. Provide a constructor `CliErrorResponse::new(exit_code: CliExitCode, message: impl Into<String>)` that sets `code` from the exit code integer.
- [ ] Define `OutputFormat` enum with `Text` and `Json` variants. Implement `std::str::FromStr` for parsing from CLI flag values. Implement `Default` returning `Text`.
- [ ] Define a `CliOutput` struct or set of free functions that:
  - `write_success<T: Serialize>(format: OutputFormat, value: &T, writer: &mut impl Write) -> Result<()>` — writes JSON object to writer when format is Json, or uses `Display` for Text.
  - `write_error(format: OutputFormat, error: CliErrorResponse, writer: &mut impl Write) -> CliExitCode` — writes JSON error to writer when format is Json, human-readable to stderr equivalent when Text; returns the `CliExitCode`.
- [ ] Ensure `CliOutput` in Json mode writes exactly one JSON object per call (not wrapped in arrays, no extra whitespace lines).
- [ ] All types go in `devs-core` (not `devs-cli`) because they are pure domain types with no runtime dependencies — `devs-cli` will consume them when it is created in Phase 3.

## 3. Code Review
- [ ] Verify that `CliExitCode` integer values exactly match the spec: 0, 1, 2, 3, 4.
- [ ] Verify `CliErrorResponse` serialization produces the exact JSON shape `{"error":"...","code":N}` with no extra fields.
- [ ] Verify no `tokio`, `git2`, `reqwest`, or `tonic` imports were added to `devs-core`.
- [ ] Verify all public types have doc comments.
- [ ] Verify `#[deny(unsafe_code)]` is not violated.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- cli` (or the relevant module filter) and confirm all new tests pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm zero warnings.

## 5. Update Documentation
- [ ] Add doc comments to each public type and method explaining the CLI output contract.
- [ ] Ensure `cargo doc -p devs-core --no-deps` produces zero warnings.

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` includes entries for `2_PRD-BR-010`, `2_PRD-BR-011`, and `2_PRD-BR-012`.
- [ ] Run `./do lint` and confirm exit code 0.
