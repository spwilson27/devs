# Sub-Epic: 44_Risk 016 Verification

## Overview
This sub-epic verifies the RISK-016 mitigation strategy: **Single-developer project with no code review creates blind spots**. The mitigation uses a multi-layered approach combining automated tooling, cross-agent code reviews, and architectural documentation.

## Covered Requirements
| Requirement ID | Type | Description |
|---|---|---|
| [MIT-016] | Technical | Mitigation strategy for RISK-016: cross-agent reviews, ADRs, clippy enforcement |
| [RISK-016-BR-004] | Functional | Code-review workflow halts on critical findings > 0 |
| [RISK-016-BR-005] | Functional | Cross-agent review policy: reviewer must use different tool than implementer |
| [AC-RISK-016-01] | Technical | Every crate has a corresponding design ADR before merge to main |
| [AC-RISK-016-02] | Technical | `cargo clippy --workspace --all-targets -- -D warnings` exits 0 on all platforms |

## Task Breakdown
| Task | File | Requirements | Dependencies |
|---|---|---|---|
| 1. Parse MIT-016 Mitigation Strategy | `01_parse_mit_016_mitigation_strategy.md` | [MIT-016] | none |
| 2. Create Code Review Workflow TOML | `02_create_code_review_workflow_toml.md` | [RISK-016-BR-005] | 01 |
| 3. Implement Halt-for-Remediation Branch Logic | `03_implement_halt_for_remediation_branch_logic.md` | [RISK-016-BR-004] | 02 |
| 4. Implement ADR Presence Verification | `04_implement_adr_presence_verification.md` | [AC-RISK-016-01] | none |
| 5. Implement Clippy Warnings Enforcement | `05_implement_clippy_warnings_enforcement.md` | [AC-RISK-016-02] | none |

## Shared Components
| Component | Role | Tasks |
|---|---|---|
| `devs-core` | Domain types for mitigation strategy, ADR validation | 01, 03, 04 |
| `devs-config` | Workflow TOML parsing, mitigation strategy validation | 01, 02 |
| `devs-scheduler` | Branch handler for review routing, state transitions | 02, 03 |
| `./do Entrypoint Script` | Lint integration for ADR and clippy checks | 04, 05 |

## Execution Order
```
01_parse_mit_016_mitigation_strategy.md ──┐
04_implement_adr_presence_verification.md  ├─> All can run in parallel
05_implement_clippy_warnings_enforcement.md ─┘
02_create_code_review_workflow_toml.md ──> 03_implement_halt_for_remediation_branch_logic.md
```

## Verification Criteria
- [ ] All 5 requirements have `// Covers:` annotations in test code
- [ ] `target/traceability.json` reports `traceability_pct` includes all 5 IDs
- [ ] `./tools/verify_requirements.py` exits 0 with all IDs marked as covered
- [ ] `./do lint` includes ADR presence check and clippy enforcement
- [ ] `./do test` runs E2E tests for code-review workflow halt logic
- [ ] `.devs/workflows/code-review.toml` exists with valid TOML structure
- [ ] `review_router` branch handler is registered and functional
- [ ] All crates have corresponding ADR files in `docs/adr/`
- [ ] No clippy warnings exist in the workspace

## Notes
- Tasks 04 and 05 can be executed in parallel with tasks 01-03
- Task 03 depends on task 02 because the branch handler is defined in the workflow TOML
- The MIT-016 requirement is foundational and informs the implementation of all other tasks
