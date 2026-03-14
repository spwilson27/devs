# Task: Core User Features Part 2 — Interfaces, Quality, and Extended Features (Sub-Epic: 01_core_grpc_server_and_infrastructure)

## Covered Requirements
- [4_USER_FEATURES-FEAT-058], [4_USER_FEATURES-FEAT-059], [4_USER_FEATURES-FEAT-060], [4_USER_FEATURES-FEAT-061], [4_USER_FEATURES-FEAT-062], [4_USER_FEATURES-FEAT-063], [4_USER_FEATURES-FEAT-064], [4_USER_FEATURES-FEAT-064-EXT], [4_USER_FEATURES-FEAT-065], [4_USER_FEATURES-FEAT-066], [4_USER_FEATURES-FEAT-067], [4_USER_FEATURES-FEAT-068], [4_USER_FEATURES-FEAT-069], [4_USER_FEATURES-FEAT-070], [4_USER_FEATURES-FEAT-071], [4_USER_FEATURES-FEAT-072], [4_USER_FEATURES-FEAT-073], [4_USER_FEATURES-FEAT-074], [4_USER_FEATURES-FEAT-075], [4_USER_FEATURES-FEAT-076], [4_USER_FEATURES-FEAT-077], [4_USER_FEATURES-FEAT-078], [4_USER_FEATURES-FEAT-079], [4_USER_FEATURES-FEAT-080], [4_USER_FEATURES-FEAT-081], [4_USER_FEATURES-FEAT-082], [4_USER_FEATURES-FEAT-083], [4_USER_FEATURES-FEAT-084], [4_USER_FEATURES-FEAT-085], [4_USER_FEATURES-FEAT-086], [4_USER_FEATURES-FEAT-087], [4_USER_FEATURES-FEAT-088], [4_USER_FEATURES-FEAT-089], [4_USER_FEATURES-FEAT-090], [4_USER_FEATURES-FEAT-091], [4_USER_FEATURES-FEAT-092], [4_USER_FEATURES-FEAT-093], [4_USER_FEATURES-FEAT-094], [4_USER_FEATURES-FEAT-095], [4_USER_FEATURES-FEAT-096], [4_USER_FEATURES-FEAT-097], [4_USER_FEATURES-FEAT-098], [4_USER_FEATURES-FEAT-099], [4_USER_FEATURES-FEAT-100], [4_USER_FEATURES-FEAT-101], [4_USER_FEATURES-FEAT-102], [4_USER_FEATURES-FEAT-103], [4_USER_FEATURES-FEAT-104], [4_USER_FEATURES-FEAT-105], [4_USER_FEATURES-FEAT-106], [4_USER_FEATURES-FEAT-107], [4_USER_FEATURES-FEAT-108], [4_USER_FEATURES-FEAT-109], [4_USER_FEATURES-FEAT-110], [4_USER_FEATURES-FEAT-111], [4_USER_FEATURES-FEAT-112], [4_USER_FEATURES-FEAT-113], [4_USER_FEATURES-0-9], [4_USER_FEATURES-3_PRD-BR-047], [4_USER_FEATURES-A-Z], [4_USER_FEATURES-A-Z0-9_], [4_USER_FEATURES-A-Z_]

## Dependencies
- depends_on: ["36_user_features_core_part1.md"]
- shared_components: ["devs-cli (consumer)", "devs-tui (consumer)", "devs-mcp (consumer)", "devs-server (consumer)"]

## 1. Initial Test Written
- [ ] Create `tests/user_features_core2_test.rs` with integration tests for FEAT-058 through FEAT-113: interface features (TUI tabs, CLI commands, MCP tools), quality features (coverage, traceability, linting), and extended features (cross-platform, accessibility, security).
- [ ] Write tests for validation pattern requirements: character class validation for run names accepting `[0-9]` (4_USER_FEATURES-0-9), `[A-Z]` (4_USER_FEATURES-A-Z), `[A-Z0-9_]` (4_USER_FEATURES-A-Z0-9_), `[A-Z_]` (4_USER_FEATURES-A-Z_).
- [ ] Write a test verifying log retention policy enforcement per `4_USER_FEATURES-3_PRD-BR-047`.

## 2. Task Implementation
- [ ] Implement integration tests verifying FEAT-058 through FEAT-113 are functional.
- [ ] Implement character class validation for run names and environment variable keys.
- [ ] Verify log retention policy is enforced per the referenced PRD business rule.
- [ ] Ensure all extended features (cross-platform, accessibility) are testable.

## 3. Code Review
- [ ] Verify each feature test exercises the feature through the appropriate interface.
- [ ] Confirm character class validation is consistent with EnvKey and BoundedString implementations.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- user_features_core2` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations for all 62 requirements.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.
