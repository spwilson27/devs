# Cross-Phase Task Review Summary — Pass 2

## Review Date: 2026-03-14

## Overview

Second pass cross-phase review of all task files across Phases 0–5, following Pass 1 which deleted 41 cross-phase duplicates (reducing from 845 to 802 files).

**Before review (pass 2 start):** 802 task files
**After review (pass 2 end):** 802 task files
**Deleted this pass:** 0 files

---

## Analysis Performed

### 1. Phase 5 Internal Duplicate Risk Sub-Epics (18 pairs checked)

Phase 5 has 47+ risk verification sub-epics, with many risks appearing in multiple directories (e.g., `07_risk_001_verification`, `11_risk_001_verification`, `13_risk_001_verification`). All 18 suspicious pairs were examined by comparing their "Covered Requirements" sections.

**Finding: NO duplicates.** Every pair covers distinct requirement IDs (different acceptance criteria or business rules for the same risk). The multiple sub-epics per risk are complementary — they address different facets of each risk's mitigation strategy. Examples:
- RISK-001 split across sub-epics 07 (matrix audit), 11 (mutex concurrency), 13 (cascade cancellation)
- RISK-003 split across sub-epics 16 (disk-full resilience) and 17 (orphan cleanup)
- RISK-013 split across sub-epics 37 (traceability gates), 38 (rename audit), 39 (report freshness)

### 2. Phase 3 Sub-Epic 09 vs Phase 5 Risk Verification (Coverage vs Verification Pattern)

Phase 3's `09_risks_and_roadmap_integration` (10 tasks) defines risk covering tests as part of server implementation. Phase 5's risk verification sub-epics (100+ tasks) verify those tests pass and audit implementations for edge cases.

**Finding: NOT duplicates — intentional temporal layering.**
- **Phase 3** = "Write tests that cover risks + implement the features those tests exercise" (breadth-first, all risks in one sub-epic)
- **Phase 5** = "Verify the already-written tests pass + deep audit implementation for edge cases" (depth-first, one sub-epic per risk)

An agent implementing Phase 3 task 02's `test_concurrent_stage_completion_serialization` would NOT re-implement it in Phase 5; they would verify it passes and audit the mutex usage for correctness.

### 3. Phase 3 TUI Sub-Epics 07 and 08 (Overlap Check)

Phase 3 has two large TUI sub-epics: 07 (TUI Framework, 20 tasks, ~450 `6_UI_UX_ARCHITECTURE-REQ-*` requirements) and 08 (TUI Visualization, 16 tasks, ~470 `7_UI_UX_DESIGN-REQ-*` requirements).

**Finding: NOT duplicates — different requirement document prefixes.**
Four suspect pairs were examined:
- String constants (07/07 vs 08/01): Different req sets (`6_UI_UX_ARCHITECTURE` vs `7_UI_UX_DESIGN`)
- DAG rendering (07/09 vs 08/09): Different req sets with minimal overlap (~3 shared REQs)
- ANSI stripping (07/11 vs 08/04): Different req sets
- App architecture (07/12 vs 08/06): Minor overlap (REQ-191 through REQ-195) but different focus areas

The two sub-epics derive from different specification documents and are complementary.

### 4. Phase 0 vs Phase 1 Implementation Overlap (Design Inconsistency)

Four pairs of Phase 0 "domain specification" tasks and Phase 1 "implementation" tasks were compared at the code level.

**Finding: NOT code duplicates, but a DESIGN INCONSISTENCY concern.**

Phase 0 and Phase 1 tasks implement the same *concepts* with conflicting designs:
- **State machines**: Phase 0 defines `WorkflowRunStatus`/`WorkflowRunEvent` with one trait signature; Phase 1 defines `RunStatus`/`StageStatus` with a different signature
- **Template resolver**: Phase 0 implements full `{{...}}` template string parsing; Phase 1 implements key-based resolution with different types
- **Validation errors**: Phase 0 defines `ValidationError` as a struct with `ValidationErrorCode` enum (12 variants); Phase 1 defines it as an enum with different variant names
- **Server config**: Phase 0 defines `ServerConfig` with `SchedulingMode`; Phase 1 defines it with `SchedulingPolicy` (different name, different variants)

These aren't deletable duplicates — they represent architectural decisions that need reconciliation during implementation. When an agent implements Phase 0's state machine and then reaches Phase 1, they'll need to align the naming conventions.

### 5. Webhook HMAC Signing (Phase 0 → Phase 1)

Phase 0 `055/03` implements the signing algorithm; Phase 1 `01/29` adds key validation and `Redacted<T>` wrapping. These are complementary (algorithm vs key management).

---

## Gaps Identified (Flagged for Human Review)

### 1. Phase 0 ↔ Phase 1 Naming Inconsistency (HIGH PRIORITY)
Phase 0 and Phase 1 define the same domain types with different names and signatures. This will cause confusion for implementing agents. Specific conflicts:
- `WorkflowRunStatus` (P0) vs `RunStatus` (P1)
- `WorkflowRunEvent` (P0) vs no event enum (P1 uses `transition(to: Self)`)
- `TemplateError::UnknownVariable` (P0) vs `ResolutionError` (P1)
- `SchedulingMode` (P0) vs `SchedulingPolicy` (P1)
- `ValidationErrorCode` enum (P0) vs `ValidationError` enum variants (P1)

**Recommendation:** The Phase 1 tasks should be treated as authoritative for implementation. Phase 0 tasks should be considered design exploration that Phase 1 supersedes. This should be documented in a CLAUDE.md or project convention note.

### 2. Phase 3 Mega-Tasks in Sub-Epic 01 (Tasks 25-48)
Phase 3's `01_core_grpc_server_and_infrastructure` contains tasks 25 through 48 (24 tasks) that are essentially requirement traceability anchors — each covers 50-200+ requirement IDs with minimal implementation detail. These are qualitatively different from the focused, actionable tasks in the rest of the project. They risk being un-implementable as written because they aggregate too many requirements per task.

**Recommendation:** These should be flagged for potential decomposition in a future planning pass (not this subtractive review).

### 3. Phase 5 Scale (188 tasks)
Phase 5's 188 task files represent a significant verification workload. Sub-epic `01_core_quality_gates` alone has 19 tasks covering performance SLOs (PERF-001 through PERF-221). This volume may exceed what's achievable in a single phase.

**Recommendation:** Monitor during execution. The existing task structure is correct (no duplicates found), but the volume should be evaluated against timeline constraints.

### 4. Gaps Carried Forward from Pass 1 (Unresolved)
- 367+ risk/mitigation requirements (8_RISKS-REQ-*) have no Phase 1 tasks
- Workflow submission validation pipeline (7-step sequence) has no dedicated Phase 2 task
- Run identification/slug generation at submit time lacks a Phase 2 task

---

## Conclusion

Pass 2 found **zero actionable cross-phase duplicates** remaining after Pass 1's cleanup of 41 files. The task structure across all 6 phases represents intentional architectural layering:

1. **Phase 0**: Domain type specifications and foundational contracts
2. **Phase 1**: Core crate implementations with security domain types
3. **Phase 2**: Scheduler, completion signals, fan-out, webhooks
4. **Phase 3**: Server assembly, gRPC/MCP/CLI/TUI interfaces, risk test infrastructure
5. **Phase 4**: Agent behaviors, TDD enforcement, MCP tool protocols
6. **Phase 5**: Quality gate verification, risk mitigation verification, coverage enforcement

The primary concern is not duplication but **design inconsistency** between Phase 0 specifications and Phase 1 implementations, which should be resolved by treating Phase 1 as authoritative.

## Final Statistics

| Phase | Task Files | Change from Pass 1 |
|-------|-----------|-------------------|
| Phase 0 | 356 | 0 |
| Phase 1 | 38 | 0 |
| Phase 2 | 30 | 0 |
| Phase 3 | 117 | 0 |
| Phase 4 | 50 | 0 |
| Phase 5 | 199 | 0 |
| **Total** | **790** | **0** |

Note: Counts exclude review_summary.md, README.md, REPORTS.md, SUB_EPIC_SUMMARY.md, REQUIREMENTS_TRACEABILITY.md, dag.json, and other index/metadata files.
