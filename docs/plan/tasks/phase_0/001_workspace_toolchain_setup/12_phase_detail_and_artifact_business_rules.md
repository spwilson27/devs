# Task: Implement Phase Detail, Timing Artifact, Dependency Graph, Execution Flow, and Phase Artifact Business Rules (Sub-Epic: 001_workspace_toolchain_setup)

## Covered Requirements
- [ROAD-BR-101], [ROAD-BR-102], [ROAD-BR-103], [ROAD-BR-104], [ROAD-BR-105], [ROAD-BR-106], [ROAD-BR-107], [ROAD-BR-108], [ROAD-BR-109], [ROAD-BR-110], [ROAD-BR-111], [ROAD-BR-112], [ROAD-BR-201], [ROAD-BR-202], [ROAD-BR-203], [ROAD-BR-204], [ROAD-BR-205], [ROAD-BR-206], [ROAD-BR-207], [ROAD-BR-208], [ROAD-BR-209], [ROAD-BR-210], [ROAD-BR-211], [ROAD-BR-212], [ROAD-BR-301], [ROAD-BR-302], [ROAD-BR-303], [ROAD-BR-304], [ROAD-BR-305], [ROAD-BR-306], [ROAD-BR-307], [ROAD-BR-308], [ROAD-BR-309], [ROAD-BR-311], [ROAD-BR-312], [ROAD-BR-401], [ROAD-BR-402], [ROAD-BR-403], [ROAD-BR-404], [ROAD-BR-405], [ROAD-BR-407], [ROAD-BR-408], [ROAD-BR-501], [ROAD-BR-502], [ROAD-BR-503], [ROAD-BR-504], [ROAD-BR-505], [ROAD-BR-506], [ROAD-BR-507], [ROAD-BR-508], [ROAD-BR-509], [ROAD-BR-510]

## Dependencies
- depends_on: ["09_roadmap_phase_definitions_and_dependency_graph.md", "10_presubmit_timing_timeout_and_lint_rules.md"]
- shared_components: [devs-core, Phase Transition Checkpoint (PTC) Model, ./do Entrypoint Script & CI Pipeline, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-core/tests/business_rules.rs` organized by category:
  **Phase Detail Rules (ROAD-BR-101 through ROAD-BR-112):**
  - [ ] One test per rule verifying each phase detail invariant is encoded. These rules govern per-phase deliverable expectations, gate condition specifics, and phase scope boundaries. Annotate `// Covers: ROAD-BR-101` through `// Covers: ROAD-BR-112`.

  **Timing Artifact Rules (ROAD-BR-201 through ROAD-BR-212):**
  - [ ] One test per rule verifying timing artifact invariants: JSONL format, required fields, write ordering, survival under kill, baseline comparison, step naming conventions, epoch format, and aggregation rules. Annotate `// Covers: ROAD-BR-201` through `// Covers: ROAD-BR-212`.

  **Dependency Graph Rules (ROAD-BR-301 through ROAD-BR-312, excluding ROAD-BR-310):**
  - [ ] One test per rule verifying dependency graph invariants: no cycles, phase ordering respected, cross-phase edges only through declared interfaces, crate boundary enforcement, forbidden import lists, parallel work window correctness, and node completeness. Annotate `// Covers: ROAD-BR-301` through `// Covers: ROAD-BR-312`.

  **Execution Flow Rules (ROAD-BR-401 through ROAD-BR-408, excluding ROAD-BR-406):**
  - [ ] One test per rule verifying execution flow invariants: presubmit step ordering (format → lint → test → coverage → ci), step failure halts pipeline, lint substep ordering, coverage tool invocation order, CI temporary commit mechanism, and artifact retention. Annotate `// Covers: ROAD-BR-401` through `// Covers: ROAD-BR-408`.

  **Phase Artifact Rules (ROAD-BR-501 through ROAD-BR-510):**
  - [ ] One test per rule verifying phase artifact invariants: PTC file produced per phase, traceability.json format, coverage report format, presubmit_timings.jsonl schema, CI artifact paths, ADR directory structure, and artifact versioning. Annotate `// Covers: ROAD-BR-501` through `// Covers: ROAD-BR-510`.

## 2. Task Implementation
- [ ] Define business rule registry in `crates/devs-core/src/business_rules.rs`:
  - `BusinessRule` struct with `id: String`, `category: BusinessRuleCategory`, `description: String`, `phase_scope: Option<u8>`.
  - `BusinessRuleCategory` enum: `PhaseDetail`, `TimingArtifact`, `DependencyGraph`, `ExecutionFlow`, `PhaseArtifact`.
  - Static `BUSINESS_RULES` array containing all 51 rules with their metadata.
- [ ] Implement validation functions per category:
  - `validate_phase_detail_rules(phase: u8, deliverables: &[Deliverable]) -> Result<(), Vec<RuleViolation>>`
  - `validate_timing_artifact(timings_path: &Path) -> Result<(), Vec<RuleViolation>>` — validates JSONL schema, field presence, epoch format.
  - `validate_dependency_graph_rules(graph: &CrateDependencyGraph) -> Result<(), Vec<RuleViolation>>` — validates all graph invariants.
  - `validate_execution_flow(steps: &[PresubmitStep]) -> Result<(), Vec<RuleViolation>>` — validates step ordering and failure semantics.
  - `validate_phase_artifacts(phase: u8, artifact_dir: &Path) -> Result<(), Vec<RuleViolation>>` — validates artifact presence and format.
- [ ] Integrate timing artifact validation into `./do test` — after test run, validate `target/presubmit_timings.jsonl` if it exists.
- [ ] Integrate dependency graph rule checks into `./do lint` — verify `cargo tree` output against all ROAD-BR-3xx rules.

## 3. Code Review
- [ ] Verify all 51 requirement IDs have `// Covers:` annotations in test code.
- [ ] Verify business rule definitions match the descriptions in `docs/plan/phases/phase_0.md`.
- [ ] Verify no runtime dependencies added to `devs-core`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- business_rules` and confirm all tests pass.
- [ ] Run `./do lint` and confirm dependency graph checks pass.

## 5. Update Documentation
- [ ] Add doc comments to `BusinessRule` struct and category enum.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core` and confirm zero failures.
- [ ] Run `grep -c 'Covers: ROAD-BR-' crates/devs-core/tests/business_rules.rs` and confirm it returns at least 51.
