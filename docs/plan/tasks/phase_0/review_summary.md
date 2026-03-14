# Phase 0 Task Review Summary

## Review Date: 2026-03-14

## Overview

Phase 0 originally contained **498 task files** across 103 sub-epic directories. After review, **100 duplicate/redundant task files were deleted**, leaving **398 task files**.

## Actions Taken

### Duplicate Removal (100 files deleted)

The task generation process produced systematic duplication: for many requirements, two nearly-identical task files were created covering the same work. The pattern was consistent — one file would describe the work as "Implement X" and another as "Define X Contract" or "Verify X", but both specified the same tests, same implementation, and same requirement IDs.

#### Sub-epic 001 (Workspace & Toolchain Setup) — 3 deleted
- `01_initialize_toolchain_and_root_manifest.md` — duplicate of `01_rust_toolchain_pinning.md` (both REQ-003/004)
- `02_scaffold_workspace_crates.md` — duplicate of `02_cargo_workspace_manifest.md` (both PRD-REQ-002/TAS-REQ-021)
- `03_configure_workspace_dependencies.md` — subsumed by `02_cargo_workspace_manifest.md` + `03_workspace_build_validation.md`

#### Sub-epic 004 (Developer Script Behaviors) — 3 deleted
- All 3 tasks were exact duplicates of work already specified in sub-epic 003 (Developer Entrypoint Script)

#### Sub-epic 006 (Quality Gate Enforcement) — 2 deleted
- `01_gitlab_ci_pipeline_configuration.md` — duplicate of 005/`01_multi_platform_ci_config.md`
- `02_linting_and_documentation_gate.md` — duplicate of 005/02 + 003/03

#### Sub-epic 015 (Foundational Technical Requirements Part 6) — 5 deleted
- 5 duplicate files covering same requirements as their paired counterparts (wire type boundary, config validation, discovery file, project restoration, port binding)

#### Sub-epic 021 (Part 12) — 3 deleted
- Root manifest, feature flag, and CI all-features tasks duplicated

#### Sub-epic 022 (Part 13) — 4 deleted
- Unsafe code, anyhow restriction, dependency audit, and proto header tasks duplicated

#### Sub-epic 024 (Part 15) — 2 deleted
- POSIX sh compliance and GitLab CI foundation duplicated

#### Sub-epic 025 (Part 16) — 2 deleted
- Formatting policy and CI command mechanism duplicated

#### Sub-epic 031 (Part 22) — 3 deleted
- Structured output parsing, workflow validation, scheduler latency all duplicated

#### Sub-epic 032 (Part 23) — 5 deleted
- Fan-out, multi-project scheduling, retry delay, Docker executor, SSH executor all duplicated

#### Sub-epic 040 (Part 5) — 2 deleted
- GUI compatibility review and architectural non-goals duplicated

#### Sub-epic 050 (Part 15) — 3 deleted
- Webhook delivery/payload and retry policy duplicated

#### Sub-epic 055 (Part 20) — 3 deleted
- Webhook event enumeration, payload schema, and dispatcher logic duplicated (covered by sub-epics 034, 050)

#### Sub-epic 056 (Part 21) — 4 deleted
- Domain types, checkpoint store trait, server config schema, webhook CLI all duplicated

#### Sub-epic 064 (Part 29) — 5 deleted
- Client version, JSON nulls, log sequences, push restriction, reconnect semantics all duplicated

#### Sub-epic 065 (Part 30) — 3 deleted
- Server startup config, discovery interlock, resilient recovery all duplicated

#### Sub-epic 066 (Part 31) — 5 deleted
- gRPC/MCP discovery, two-port architecture, agent MCP injection, concurrent request handling, safety all duplicated

#### Sub-epic 069 (Part 34) — 3 deleted
- Server discovery, concurrent submit, E2E isolation all duplicated

#### Sub-epic 070 (Part 35) — 5 deleted
- Documentation completeness, dependency isolation, project loading, crash recovery, gRPC reflection all duplicated

#### Sub-epic 071 (Part 36) — 4 deleted
- Toolchain, config path, MCP bridge, state consistency all duplicated

#### Sub-epic 072 (Part 37) — 4 deleted
- Dependency lint, workspace lint, stable Rust, formatting lint all duplicated

#### Sub-epic 075 (Part 40) — 3 deleted
- Dependency audits, unsafe prohibition, setup verification all duplicated

#### Sub-epic 078 (Part 43) — 3 deleted
- Workflow validation, input validation, prompt exclusivity all duplicated

#### Sub-epic 079 (Part 44) — 3 deleted
- Control flow, retry config, agent pool all duplicated

#### Sub-epic 080 (Part 45) — 3 deleted
- Project/webhook validation, snapshot/attempt/exit code, exit code persistence all duplicated

#### Sub-epic 082 (Part 47) — 5 deleted
- Checkpoint write safety, atomic write resilience, output truncation, template resolution, collision rejection all duplicated

#### Sub-epic 086 (Part 51) — 2 deleted
- Template/output enforcement and domain validation limits duplicated

#### Sub-epic 087 (Part 52) — 3 deleted
- RunSlug format, webhook config, exhaustion episode all duplicated

#### Sub-epic 088 (Part 53) — 2 deleted
- Webhook config validation and delivery mechanics duplicated (covered by sub-epics 050, 054, 087)

#### Sub-epic 095 (Part 6) — 2 deleted
- Presubmit compliance and robustness testing duplicated

## Gaps Identified (Not Addressed — Flagged for Human Review)

The following requirements from `docs/plan/phases/phase_0.md` may have thin or missing coverage in the remaining tasks:

1. **RISK-005/RISK-009 specific business rules** (RISK-005-BR-001 through -004, RISK-009-BR-001 through -006): These risk mitigation business rules are mentioned in several tasks but lack dedicated, focused task files. Coverage is spread across sub-epics 001, 010, and 036.

2. **Several 9_PROJECT_ROADMAP-REQ requirements** (REQ-026 through REQ-031): Flaky CI, Windows path normalization, Phase 5 QG-005 failure handling, BOOTSTRAP-STUB discovery, bootstrap coverage gate failure, and duplicate PTC handling are referenced in roadmap tasks (sub-epic 001 tasks 07-13) but some may need more targeted implementation tasks.

3. **[1_PRD-REQ-002], [2_TAS-REQ-021]**: After removing the duplicate crate scaffolding task, ensure the remaining `02_cargo_workspace_manifest.md` fully covers all 15 crate stubs.

4. **Phase-specific acceptance criteria** (AC-ROAD-P1 through AC-ROAD-P5): Many of these are defined as "Phase 0 defines the enforcement mechanism" but actual verification will only work once the respective phases deliver code. The existing stub tests (sub-epic 001/13) may be sufficient but should be validated.

## Remaining Task Count

- **Before review**: 498 task files
- **After review**: 398 task files
- **Deleted**: 100 task files (20% reduction)
- **New files created**: 0 (subtractive only, per constraint)

## Recommendation

The remaining 398 tasks are still a very large number for Phase 0. Many of the "Detailed Domain Specifications" sub-epics (030-103) define foundational domain types and contracts that could arguably be deferred to later phases when those domain types are actually needed. A second review pass focused on phase-scoping (moving tasks to their natural owning phase) would further reduce the Phase 0 task count significantly.
