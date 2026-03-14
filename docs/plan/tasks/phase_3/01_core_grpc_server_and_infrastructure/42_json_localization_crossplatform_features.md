# Task: JSON Output, Localization, and Cross-Platform Features (Sub-Epic: 01_core_grpc_server_and_infrastructure)

## Covered Requirements
- [4_USER_FEATURES-AC-4-JSON-001], [4_USER_FEATURES-AC-4-JSON-002], [4_USER_FEATURES-AC-4-JSON-003], [4_USER_FEATURES-AC-4-JSON-004], [4_USER_FEATURES-AC-4-JSON-005], [4_USER_FEATURES-AC-4-JSON-006], [4_USER_FEATURES-AC-4-JSON-007], [4_USER_FEATURES-AC-4-JSON-008], [4_USER_FEATURES-AC-4-JSON-009], [4_USER_FEATURES-AC-4-JSON-010], [4_USER_FEATURES-AC-4-JSON-011], [4_USER_FEATURES-AC-4-JSON-012], [4_USER_FEATURES-AC-4-L10N-001], [4_USER_FEATURES-AC-4-L10N-002], [4_USER_FEATURES-AC-4-L10N-003], [4_USER_FEATURES-AC-4-L10N-004], [4_USER_FEATURES-AC-4-L10N-005], [4_USER_FEATURES-AC-4-L10N-006], [4_USER_FEATURES-AC-4-XPLAT-001], [4_USER_FEATURES-AC-4-XPLAT-002], [4_USER_FEATURES-AC-4-XPLAT-003], [4_USER_FEATURES-AC-4-XPLAT-004], [4_USER_FEATURES-AC-4-XPLAT-005], [4_USER_FEATURES-AC-4-XPLAT-006], [4_USER_FEATURES-AC-4-XPLAT-007]

## Dependencies
- depends_on: ["32_cli_interface_features_business_rules.md"]
- shared_components: ["devs-cli (consumer)", "devs-tui (consumer)", "devs-core (consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-cli/tests/json_output_test.rs` with tests for JSON output: `--format json` produces valid JSON (AC-4-JSON-001), consistent field names (AC-4-JSON-002), null handling (AC-4-JSON-003), array wrapping for lists (AC-4-JSON-004), ISO 8601 timestamps (AC-4-JSON-005), nested object support (AC-4-JSON-006).
- [ ] Write tests for JSON streaming: newline-delimited JSON for log streaming (AC-4-JSON-007), JSON error responses (AC-4-JSON-008), empty result handling (AC-4-JSON-009), JSON schema stability (AC-4-JSON-010), pretty-print option (AC-4-JSON-011), JSON output pipe-safe (AC-4-JSON-012).
- [ ] Write tests for localization: UTF-8 support in all output (AC-4-L10N-001), non-ASCII workflow names (AC-4-L10N-002), Unicode in stage outputs (AC-4-L10N-003), locale-independent number formatting (AC-4-L10N-004), locale-independent date formatting (AC-4-L10N-005), error messages in English (AC-4-L10N-006).
- [ ] Write tests for cross-platform: Windows path normalization (AC-4-XPLAT-001), Unix path handling (AC-4-XPLAT-002), line ending normalization (AC-4-XPLAT-003), signal handling per platform (AC-4-XPLAT-004), temp directory handling (AC-4-XPLAT-005), home directory resolution (AC-4-XPLAT-006), CI platform parity (AC-4-XPLAT-007).

## 2. Task Implementation
- [ ] Implement JSON output formatting with consistent field names and ISO 8601 timestamps.
- [ ] Implement newline-delimited JSON for streaming output.
- [ ] Ensure all string handling is UTF-8 throughout the codebase.
- [ ] Implement cross-platform path normalization using `std::path` abstractions.
- [ ] Ensure locale-independent formatting for numbers and dates.

## 3. Code Review
- [ ] Verify JSON output is machine-parseable by piping to `jq`.
- [ ] Confirm no locale-dependent formatting in any output path.
- [ ] Ensure Windows path separators are handled correctly in all file operations.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- json_output` and `cargo test -- xplat` and confirm all pass.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations for all 25 requirements.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.
