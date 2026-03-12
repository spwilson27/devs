# Requirements: Risks and Mitigation

### **[8_RISKS-REQ-001]** Risk Assessment Matrix Framework
- **Type:** Technical
- **Description:** 1. Risk Assessment Matrix
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-001] [8_RISKS-REQ-002]** Requirement RISK-001
- **Type:** Technical
- **Description:** | [RISK-001] | DAG scheduler race conditions under concurrent stage completions | Technical | HIGH | MEDIUM | 6 | MIT-001 | — |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-002] [8_RISKS-REQ-003]** Requirement RISK-002
- **Type:** Technical
- **Description:** | [RISK-002] | PTY mode incompatibility on Windows Git Bash | Technical | HIGH | HIGH | 9 | MIT-002 | FB-002 |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-003] [8_RISKS-REQ-004]** Requirement RISK-003
- **Type:** Technical
- **Description:** | [RISK-003] | Git checkpoint store corruption under disk-full or crash conditions | Technical | HIGH | MEDIUM | 6 | MIT-003 | FB-005 |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-004] [8_RISKS-REQ-005]** Requirement RISK-004
- **Type:** Technical
- **Description:** | [RISK-004] | Agent adapter CLI interface breakage from upstream changes | Technical | HIGH | HIGH | 9 | MIT-004 | FB-010 |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-005] [8_RISKS-REQ-006]** Requirement RISK-005
- **Type:** Technical
- **Description:** | [RISK-005] | 15-minute presubmit timeout exceeded due to Rust compile times | Technical | HIGH | HIGH | 9 | MIT-005 | FB-001 |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-006] [8_RISKS-REQ-007]** Requirement RISK-006
- **Type:** Technical
- **Description:** | [RISK-006] | 90%/80%/50% coverage gates unachievable within MVP timeline | Technical | HIGH | MEDIUM | 6 | MIT-006 | — |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-007] [8_RISKS-REQ-008]** Requirement RISK-007
- **Type:** Technical
- **Description:** | [RISK-007] | Template injection via attacker-controlled stage output | Technical | HIGH | LOW | 3 | MIT-007 | — |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-008] [8_RISKS-REQ-009]** Requirement RISK-008
- **Type:** Technical
- **Description:** | [RISK-008] | Docker/SSH execution environment setup complexity blocks E2E testing | Technical | MEDIUM | HIGH | 6 | MIT-008 | FB-003 |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-009] [8_RISKS-REQ-010]** Requirement RISK-009
- **Type:** Technical
- **Description:** | [RISK-009] | Bootstrapping deadlock — `devs` cannot develop itself until minimally functional | Operational | HIGH | HIGH | 9 | MIT-009 | FB-007 |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-010] [8_RISKS-REQ-011]** Requirement RISK-010
- **Type:** Technical
- **Description:** | [RISK-010] | AI agent rate limits stall development velocity | Operational | MEDIUM | HIGH | 6 | MIT-010 | FB-004 |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-011] [8_RISKS-REQ-012]** Requirement RISK-011
- **Type:** Technical
- **Description:** | [RISK-011] | E2E test isolation failures from shared server discovery files | Operational | MEDIUM | MEDIUM | 4 | MIT-011 | — |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-012] [8_RISKS-REQ-013]** Requirement RISK-012
- **Type:** Technical
- **Description:** | [RISK-012] | Cross-platform behavioral divergence (macOS/Windows) in `./do` and file modes | Operational | HIGH | MEDIUM | 6 | MIT-012 | FB-008 |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-013] [8_RISKS-REQ-014]** Requirement RISK-013
- **Type:** Technical
- **Description:** | [RISK-013] | 100% requirement traceability gate creates annotation maintenance burden | Operational | MEDIUM | HIGH | 6 | MIT-013 | — |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-014] [8_RISKS-REQ-015]** Requirement RISK-014
- **Type:** Technical
- **Description:** | [RISK-014] | Webhook SSRF mitigation DNS-rebinding window remains open | Technical | MEDIUM | LOW | 2 | MIT-014 | — |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-015] [8_RISKS-REQ-016]** Requirement RISK-015
- **Type:** Technical
- **Description:** | [RISK-015] | Glass-Box MCP exposure of full server state on non-loopback deploys | Technical | HIGH | MEDIUM | 6 | MIT-015 | FB-009 |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-016] [8_RISKS-REQ-017]** Requirement RISK-016
- **Type:** Technical
- **Description:** | [RISK-016] | Single-developer project with no code review creates blind spots | Operational | MEDIUM | HIGH | 6 | MIT-016 | — |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-021] [8_RISKS-REQ-018]** Requirement RISK-021
- **Type:** Technical
- **Description:** | [RISK-021] | Fan-out sub-agent resource exhaustion causes pool starvation | Technical | HIGH | MEDIUM | 6 | MIT-021 | — |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-022] [8_RISKS-REQ-019]** Requirement RISK-022
- **Type:** Technical
- **Description:** | [RISK-022] | MCP stdio bridge connection loss causes irrecoverable agent state | Technical | MEDIUM | MEDIUM | 4 | MIT-022 | — |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-023] [8_RISKS-REQ-020]** Requirement RISK-023
- **Type:** Technical
- **Description:** | [RISK-023] | `cargo-llvm-cov` inaccurate coverage measurement for E2E tests | Technical | MEDIUM | LOW | 2 | MIT-023 | — |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-024] [8_RISKS-REQ-021]** Requirement RISK-024
- **Type:** Technical
- **Description:** | [RISK-024] | GitLab CI pipeline unavailability blocks all forward progress | Operational | HIGH | LOW | 3 | MIT-024 | FB-006 |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-025] [8_RISKS-REQ-022]** Requirement RISK-025
- **Type:** Technical
- **Description:** | [RISK-025] | Workflow snapshot immutability violated by concurrent checkpoint writes | Technical | HIGH | LOW | 3 | MIT-025 | — |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[8_RISKS-REQ-023]** Risk Record JSON Schema
- **Type:** Technical
- **Description:** 1.1 Risk Record Data Model
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[8_RISKS-REQ-024]** Fallback Activation Record Schema
- **Type:** Technical
- **Description:** Fallback Activation Record** — written to `docs/adr/NNNN-fallback-<name>.md` when a fallback is activated:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[8_RISKS-REQ-025]** Risk Record Field Constraints
- **Type:** Technical
- **Description:** Field Constraints:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-001] [8_RISKS-REQ-026]** Requirement RISK-BR-001
- **Type:** Functional
- **Description:** - **[RISK-BR-001]** Every `[RISK-NNN]` entry in the matrix MUST have a corresponding mitigation section in §2, §3, or §4 with matching `[MIT-NNN]` tag.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-002] [8_RISKS-REQ-027]** Requirement RISK-BR-002
- **Type:** Functional
- **Description:** - **[RISK-BR-002]** Risks with `severity_score >= 6` MUST have at least one automated test annotated `// Covers: RISK-NNN`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-003] [8_RISKS-REQ-028]** Requirement RISK-BR-003
- **Type:** Functional
- **Description:** - **[RISK-BR-003]** New risks discovered during implementation MUST be added to this document with a unique ID before work begins on the affected component.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-004] [8_RISKS-REQ-029]** Requirement RISK-BR-004
- **Type:** Functional
- **Description:** - **[RISK-BR-004]** A risk MAY NOT be marked `Retired` until its covering tests pass and the contingency trigger condition is no longer possible.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-005] [8_RISKS-REQ-030]** Requirement RISK-BR-005
- **Type:** Functional
- **Description:** - **[RISK-BR-005]** Fallback activation records MUST be written to `docs/adr/` as a git-committed file before implementing the fallback change.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[8_RISKS-REQ-031]** Risk Lifecycle State Machine
- **Type:** Technical
- **Description:** 1.2 Risk Lifecycle State Machine
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-006] [8_RISKS-REQ-032]** Requirement RISK-BR-006
- **Type:** Functional
- **Description:** [RISK-BR-006]** A risk whose status is `Mitigated` and whose covering test subsequently fails MUST be immediately transitioned back to `Open` by the automated traceability pipeline (`./do test`). The traceability report (`target/traceability.json`) is the authoritative source for risk-to-test coverage.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-007] [8_RISKS-REQ-033]** Requirement RISK-BR-007
- **Type:** Functional
- **Description:** [RISK-BR-007]** Risk records MAY NOT be manually deleted from this document. Risks that are no longer applicable MUST be transitioned to `Retired` with an `ADR` documenting the elimination condition and the date it was verified.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[8_RISKS-REQ-034]** Risk Category Definitions
- **Type:** Technical
- **Description:** 1.3 Risk Category Definitions
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-008] [8_RISKS-REQ-035]** Requirement RISK-BR-008
- **Type:** Functional
- **Description:** - **[RISK-BR-008]** A risk MUST be assigned exactly one category. When a risk spans categories (e.g., a technical bug that also has market impact), assign it to the category that describes its root cause, not its downstream effect.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-009] [8_RISKS-REQ-036]** Requirement RISK-BR-009
- **Type:** Functional
- **Description:** - **[RISK-BR-009]** `Market` category risks with severity_score ≤ 4 are reviewed monthly only; they do NOT block commits and do NOT require automated test coverage.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-010] [8_RISKS-REQ-037]** Requirement RISK-BR-010
- **Type:** Functional
- **Description:** - **[RISK-BR-010]** `Technical` and `Operational` risks with severity_score ≥ 6 require at least one automated test with `// Covers: RISK-NNN` annotation before the affected component is merged.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[8_RISKS-REQ-038]** Severity Scoring Methodology
- **Type:** Technical
- **Description:** 1.4 Severity Scoring Methodology
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[8_RISKS-REQ-039]** Impact Axis Definitions
- **Type:** Technical
- **Description:** Impact Axis Definitions:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[8_RISKS-REQ-040]** Probability Axis Definitions
- **Type:** Technical
- **Description:** Probability Axis Definitions:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[8_RISKS-REQ-041]** Score-to-Action Mapping
- **Type:** Functional
- **Description:** Score-to-Action Mapping:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[8_RISKS-REQ-042]** Score Recalculation Requirement
- **Type:** Operational
- **Description:** 1. **Score recalculation on new evidence.** If new information changes the probability or impact assessment, the risk record MUST be updated before the next sprint. The `last_reviewed_at` field is updated; `status` reverts to `Open` if the score increases past a threshold boundary (e.g., was 4 `Accepted`, now recalculated as 6 → must implement mitigation).
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[8_RISKS-REQ-043]** Compound Risk Handling
- **Type:** Technical
- **Description:** 2. **Compound risks.** When two `MEDIUM/MEDIUM` (score=4) risks share a common failure mode, their combined score is NOT automatically promoted. Instead, a new `RISK-NNN` entry is added with the compound scenario documented in its description and a cross-reference to the constituent risks.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[8_RISKS-REQ-044]** Maximum Severity Score
- **Type:** Technical
- **Description:** 3. **Score ceiling.** The maximum score is 9 (HIGH×HIGH). A score of 9 does NOT mean the risk is catastrophic or project-ending — it means it is both highly likely and highly impactful within the scope of MVP development. All score-9 risks in this document have viable mitigations.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-011] [8_RISKS-REQ-045]** Requirement RISK-BR-011
- **Type:** Functional
- **Description:** - **[RISK-BR-011]** Score recalculations MUST be recorded with a `last_reviewed_at` timestamp update. The previous score MAY be noted in a comment line below the risk entry in the matrix if the change is significant.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-012] [8_RISKS-REQ-046]** Requirement RISK-BR-012
- **Type:** Functional
- **Description:** - **[RISK-BR-012]** Impact and probability levels are set by the project lead, not automatically derived from test results. Tests verify that mitigations work; they do not determine the score.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-013] [8_RISKS-REQ-047]** Requirement RISK-BR-013
- **Type:** Functional
- **Description:** - **[RISK-BR-013]** A risk may not have its probability or impact downgraded based solely on the existence of a mitigation. Scores reflect inherent risk; mitigation status is tracked separately in `status`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[8_RISKS-REQ-048]** Active Monitoring Requirements Table
- **Type:** Technical
- **Description:** 1.5 Active Monitoring Requirements
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-001] [8_RISKS-REQ-049]** Requirement RISK-001
- **Type:** Technical
- **Description:** | [RISK-001] | 6 | Unit test `AC-RISK-001-01` in CI | Test failure | Fix within same session; block merge |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-002] [8_RISKS-REQ-050]** Requirement RISK-002
- **Type:** Technical
- **Description:** | [RISK-002] | 9 | `presubmit-windows` CI job | Any PTY-related `Failed` stage in CI | Activate FB-002; document in ADR within 24h |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-003] [8_RISKS-REQ-051]** Requirement RISK-003
- **Type:** Technical
- **Description:** | [RISK-003] | 6 | Integration test `AC-RISK-003-04` | Test failure | Fix before next checkpoint write |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-004] [8_RISKS-REQ-052]** Requirement RISK-004
- **Type:** Technical
- **Description:** | [RISK-004] | 9 | `./do lint` adapter-version audit | `adapter-versions.json` stale or `compatible: false` | Pin last compatible version; file issue against upstream within 24h |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-005] [8_RISKS-REQ-053]** Requirement RISK-005
- **Type:** Technical
- **Description:** | [RISK-005] | 9 | `target/presubmit_timings.jsonl` per-step monitoring | Any step `over_budget: true` by >20% | Investigate and optimize; if persistent, activate FB-001 |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-006] [8_RISKS-REQ-054]** Requirement RISK-006
- **Type:** Technical
- **Description:** | [RISK-006] | 6 | `target/coverage/report.json` `overall_passed` field | `overall_passed: false` in any CI run | Fix coverage gap before merge; no exceptions |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-008] [8_RISKS-REQ-055]** Requirement RISK-008
- **Type:** Technical
- **Description:** | [RISK-008] | 6 | `presubmit-linux` Docker E2E job | Docker E2E tests fail or are erroneously skipped | Activate FB-003; investigate Docker-in-Docker setup |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-009] [8_RISKS-REQ-056]** Requirement RISK-009
- **Type:** Technical
- **Description:** | [RISK-009] | 9 | Milestone tracker: server bindable checkpoint | Milestone missed | Activate FB-007 immediately; no waiting for next sprint |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-010] [8_RISKS-REQ-057]** Requirement RISK-010
- **Type:** Technical
- **Description:** | [RISK-010] | 6 | Pool state observation during development sessions | `get_pool_state` shows all agents rate-limited | Activate FB-004; wait 60s minimum before retrying |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-012] [8_RISKS-REQ-058]** Requirement RISK-012
- **Type:** Technical
- **Description:** | [RISK-012] | 6 | `presubmit-macos` and `presubmit-windows` CI jobs | Platform-specific test failures not present on Linux | File platform-specific fix within 24h |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-013] [8_RISKS-REQ-059]** Requirement RISK-013
- **Type:** Technical
- **Description:** | [RISK-013] | 6 | `target/traceability.json` `overall_passed` field | `overall_passed: false` | Add missing annotation before merge; no exceptions |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-015] [8_RISKS-REQ-060]** Requirement RISK-015
- **Type:** Technical
- **Description:** | [RISK-015] | 6 | Server startup `WARN` logs | `SEC-BIND-ADDR` warn in CI | Verify loopback bind; document intentional non-loopback in ADR |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-016] [8_RISKS-REQ-061]** Requirement RISK-016
- **Type:** Technical
- **Description:** | [RISK-016] | 6 | MCP Glass-Box self-review via presubmit workflow | `presubmit-check` run fails after implementation | Full `presubmit-check` pass required; no cherry-pick workarounds |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-021] [8_RISKS-REQ-062]** Requirement RISK-021
- **Type:** Technical
- **Description:** | [RISK-021] | 6 | `get_pool_state.queued_count` in TUI Pools tab | `queued_count > max_concurrent × 4` | Alert operator via `pool.exhausted` webhook; document pool tuning |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-014] [8_RISKS-REQ-063]** Requirement RISK-BR-014
- **Type:** Functional
- **Description:** - **[RISK-BR-014]** Every monitoring mechanism in the table above MUST be implemented before the component it monitors is declared ready. A monitoring mechanism is a concrete artifact: a test, a log event, a CI job, or a metric. "Manual observation" is only acceptable for `Market` category risks.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-015] [8_RISKS-REQ-064]** Requirement RISK-BR-015
- **Type:** Functional
- **Description:** - **[RISK-BR-015]** The `target/presubmit_timings.jsonl` file MUST be committed to GitLab CI artifacts with `expire_in: 7 days` to enable trend analysis across commits.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-016] [8_RISKS-REQ-065]** Requirement RISK-BR-016
- **Type:** Functional
- **Description:** - **[RISK-BR-016]** Any monitoring mechanism that fires in CI MUST cause the CI job to exit non-zero. Monitoring that only logs a warning without blocking is insufficient for score ≥ 6 risks.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[8_RISKS-REQ-066]** Risk Interdependency Matrix
- **Type:** Technical
- **Description:** 1.6 Risk Interdependency Matrix
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-009] [8_RISKS-REQ-067]** Requirement RISK-009
- **Type:** Technical
- **Description:** | [RISK-009] Bootstrapping deadlock | [RISK-005] Compile timeout | `depends-on` | If compile times exceed 15 min, the bootstrapping milestone is delayed because `./do presubmit` cannot pass, blocking the first server-startable commit |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-009] [8_RISKS-REQ-068]** Requirement RISK-009
- **Type:** Technical
- **Description:** | [RISK-009] Bootstrapping deadlock | [RISK-004] Adapter breakage | `amplifies` | If adapter CLIs change before the first working server, the bootstrapping milestone cannot be reached because adapters cannot be tested |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-006] [8_RISKS-REQ-069]** Requirement RISK-006
- **Type:** Technical
- **Description:** | [RISK-006] Coverage gates | [RISK-005] Compile timeout | `depends-on` | If `./do coverage` takes >10 min due to instrumentation overhead, the 15-min presubmit budget is consumed before coverage runs complete |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-010] [8_RISKS-REQ-070]** Requirement RISK-010
- **Type:** Technical
- **Description:** | [RISK-010] Rate limits stall velocity | [RISK-004] Adapter breakage | `amplifies` | If an adapter is broken AND rate-limited, fallback agents in the pool are consumed faster, exhausting the pool sooner |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-001] [8_RISKS-REQ-071]** Requirement RISK-001
- **Type:** Technical
- **Description:** | [RISK-001] Scheduler races | [RISK-003] Checkpoint corruption | `amplifies` | A scheduler race that produces an illegal transition may write a corrupt checkpoint if the checkpoint write is not serialized behind the per-run Mutex |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-008] [8_RISKS-REQ-072]** Requirement RISK-008
- **Type:** Technical
- **Description:** | [RISK-008] Docker/SSH E2E complexity | [RISK-006] Coverage gates | `amplifies` | Docker/SSH execution env code is hard to cover; if Docker E2E is skipped on macOS/Windows, QG-002 (80% E2E) may be unachievable without compensating coverage elsewhere |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-015] [8_RISKS-REQ-073]** Requirement RISK-015
- **Type:** Technical
- **Description:** | [RISK-015] MCP state exposure | [RISK-007] Template injection | `amplifies` | If an attacker can observe MCP state (RISK-015) and also craft a prompt that triggers template injection (RISK-007), they can exfiltrate structured outputs from other stages |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-021] [8_RISKS-REQ-074]** Requirement RISK-021
- **Type:** Technical
- **Description:** | [RISK-021] Fan-out pool starvation | [RISK-010] Rate limits stall velocity | `amplifies` | If fan-out consumes all pool slots AND the dispatched agents hit rate limits, no slots are freed during the 60s cooldown, causing complete pool exhaustion for all projects |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-011] [8_RISKS-REQ-075]** Requirement RISK-011
- **Type:** Technical
- **Description:** | [RISK-011] E2E test isolation | [RISK-001] Scheduler races | `amplifies` | If E2E tests share server discovery files, a residual server from a previous test may process events from a new test's run, masking scheduler race conditions or producing false positives |
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[8_RISKS-REQ-076]** Risk Interdependency Graph
- **Type:** Technical
- **Description:** Interdependency Graph:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-017] [8_RISKS-REQ-077]** Requirement RISK-BR-017
- **Type:** Functional
- **Description:** - **[RISK-BR-017]** When a primary risk is triggered, ALL risks that list it under `Depends On / Amplified By` MUST be assessed for compound activation. The compound activation assessment is documented in the fallback activation record (`docs/adr/`).
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-018] [8_RISKS-REQ-078]** Requirement RISK-BR-018
- **Type:** Functional
- **Description:** - **[RISK-BR-018]** New interdependencies discovered during implementation MUST be added to §1.6 before the affected component is merged. Interdependencies are not retroactively exempted.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-019] [8_RISKS-REQ-079]** Requirement RISK-BR-019
- **Type:** Functional
- **Description:** [RISK-BR-019]** `./do test` MUST exit non-zero when `risk_matrix_violations` is non-empty, even if all `cargo test` invocations pass. Risk schema integrity is enforced with the same weight as requirement traceability.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-020] [8_RISKS-REQ-080]** Requirement RISK-BR-020
- **Type:** Functional
- **Description:** [RISK-BR-020]** `risk_matrix_violations` of type `missing_covering_test` are only emitted for risks with `severity_score >= 6` and `status` not `Retired` or `Accepted`. Accepted risks with score ≥ 6 require a justification comment in the `docs/adr/` document cited in the `status` field.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-MATRIX-001] [8_RISKS-REQ-081]** Requirement AC-RISK-MATRIX-001
- **Type:** Technical
- **Description:** - **[AC-RISK-MATRIX-001]** `./do test` generates `target/traceability.json` with a `risk_matrix_violations` array; the array is empty when the risk matrix is correctly formed and all score ≥ 6 risks have covering tests.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-MATRIX-002] [8_RISKS-REQ-082]** Requirement AC-RISK-MATRIX-002
- **Type:** Technical
- **Description:** - **[AC-RISK-MATRIX-002]** Every `[RISK-NNN]` ID in the matrix has a corresponding `[MIT-NNN]` section in §2, §3, or §4. `./do test` exits non-zero if any matrix row lacks a matching mitigation section.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-MATRIX-003] [8_RISKS-REQ-083]** Requirement AC-RISK-MATRIX-003
- **Type:** Technical
- **Description:** - **[AC-RISK-MATRIX-003]** Every risk with `severity_score >= 6` has at least one test annotated `// Covers: RISK-NNN`. `./do test` exits non-zero if any score ≥ 6 risk lacks a covering test and its `status` is not `Accepted`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-MATRIX-004] [8_RISKS-REQ-084]** Requirement AC-RISK-MATRIX-004
- **Type:** Technical
- **Description:** - **[AC-RISK-MATRIX-004]** The severity score for every risk in the matrix equals `impact_value × probability_value` as defined in §1.4. A validation script run by `./do lint` parses the matrix table, recomputes scores, and exits non-zero on any mismatch.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-MATRIX-005] [8_RISKS-REQ-085]** Requirement AC-RISK-MATRIX-005
- **Type:** Technical
- **Description:** - **[AC-RISK-MATRIX-005]** Risk IDs are unique across the matrix. Duplicate IDs cause `./do test` to exit non-zero with `"duplicate_risk_id"` in `risk_matrix_violations`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-MATRIX-006] [8_RISKS-REQ-086]** Requirement AC-RISK-MATRIX-006
- **Type:** Technical
- **Description:** - **[AC-RISK-MATRIX-006]** Every `[FB-NNN]` fallback ID referenced in the matrix has a corresponding fallback definition in §5 of this document. `./do test` exits non-zero if any referenced fallback ID has no matching definition.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-MATRIX-007] [8_RISKS-REQ-087]** Requirement AC-RISK-MATRIX-007
- **Type:** Technical
- **Description:** - **[AC-RISK-MATRIX-007]** The category of every risk is exactly one of `Technical`, `Operational`, or `Market`. Any other value causes the validation script to exit non-zero.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-MATRIX-008] [8_RISKS-REQ-088]** Requirement AC-RISK-MATRIX-008
- **Type:** Technical
- **Description:** - **[AC-RISK-MATRIX-008]** The risk record data model (§1.1) JSON schema is validated against the schema definition on every `./do test` invocation using a built-in schema validator. A risk record with a missing required field (e.g., absent `status`) causes exit non-zero.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-MATRIX-009] [8_RISKS-REQ-089]** Requirement AC-RISK-MATRIX-009
- **Type:** Technical
- **Description:** - **[AC-RISK-MATRIX-009]** When a risk transitions from `Mitigated` to `Open` due to a covering test regression, `target/traceability.json` reflects the regression within the same `./do test` invocation that detected the failing test.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-MATRIX-010] [8_RISKS-REQ-090]** Requirement AC-RISK-MATRIX-010
- **Type:** Technical
- **Description:** - **[AC-RISK-MATRIX-010]** The `risk_count_by_category` summary in §1.3 matches the actual counts in the matrix. The validation script recomputes counts from the parsed matrix table and exits non-zero if the table in §1.3 does not match.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-001] [8_RISKS-REQ-091]** Requirement RISK-001
- **Type:** Technical
- **Description:** [RISK-001]** DAG Scheduler Race Conditions
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-001] [8_RISKS-REQ-092]** Requirement MIT-001
- **Type:** Technical
- **Description:** [MIT-001] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-001-BR-001] [8_RISKS-REQ-093]** Requirement RISK-001-BR-001
- **Type:** Functional
- **Description:** - **[RISK-001-BR-001]** Every state transition on a `WorkflowRun` or `StageRun` MUST be executed while holding the per-run `Arc<tokio::sync::Mutex<RunState>>`; reads or writes to any `StageRun.status` field outside this lock are prohibited.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-001-BR-002] [8_RISKS-REQ-094]** Requirement RISK-001-BR-002
- **Type:** Functional
- **Description:** - **[RISK-001-BR-002]** `StateMachine::transition()` MUST be idempotent for duplicate terminal events: calling it a second time with the same terminal event MUST return `Err(TransitionError::IllegalTransition)` without modifying any state or writing a checkpoint.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-001-BR-003] [8_RISKS-REQ-095]** Requirement RISK-001-BR-003
- **Type:** Functional
- **Description:** - **[RISK-001-BR-003]** DAG eligibility evaluation (determining which stages become `Eligible` after a `stage_complete` event) MUST occur within the same per-run mutex lock acquisition as the preceding `stage_complete` transition; splitting them across two separate lock acquisitions is prohibited, as it creates a window where a second thread can observe a stale dependency set.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-001-BR-004] [8_RISKS-REQ-096]** Requirement RISK-001-BR-004
- **Type:** Functional
- **Description:** - **[RISK-001-BR-004]** Only a `Completed` (not `Failed`, `TimedOut`, or `Cancelled`) `StageRun` status satisfies a `depends_on` prerequisite; any terminal-but-non-successful dependency MUST cascade `Cancelled` to all downstream `Waiting` stages in the same lock acquisition.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-001-01] [8_RISKS-REQ-097]** Requirement AC-RISK-001-01
- **Type:** Technical
- **Description:** - **[AC-RISK-001-01]** Under `tokio::join!` with 100 concurrent `stage_complete_tx` events for the same run, exactly one `Completed` transition is recorded in `checkpoint.json`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-001-02] [8_RISKS-REQ-098]** Requirement AC-RISK-001-02
- **Type:** Technical
- **Description:** - **[AC-RISK-001-02]** `StateMachine::transition()` called with a duplicate terminal event returns `Err(TransitionError::IllegalTransition)` within 1ms without modifying state.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-001-03] [8_RISKS-REQ-099]** Requirement AC-RISK-001-03
- **Type:** Technical
- **Description:** - **[AC-RISK-001-03]** Fan-out stage with `count=64` produces exactly 64 sub-`StageRun` records and exactly 1 parent `StageRun` transition.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-001-04] [8_RISKS-REQ-100]** Requirement AC-RISK-001-04
- **Type:** Technical
- **Description:** - **[AC-RISK-001-04]** `cargo test --workspace -- scheduler` passes with `--test-threads 8` without data races (verified by `cargo test` + optional `ThreadSanitizer` in CI).
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-001-05] [8_RISKS-REQ-101]** Requirement AC-RISK-001-05
- **Type:** Technical
- **Description:** - **[AC-RISK-001-05]** A `Failed` dependency stage causes all downstream `Waiting` stages in its transitive fan-out to transition to `Cancelled` in the same atomic checkpoint write, verified by reading `checkpoint.json` after a single `stage_complete_tx` event.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-001-06] [8_RISKS-REQ-102]** Requirement AC-RISK-001-06
- **Type:** Technical
- **Description:** - **[AC-RISK-001-06]** Lock acquisition order violation (acquiring `PoolState` before `SchedulerState`) is detected by a static lint check in `./do lint` that scans for known anti-patterns in lock acquisition sequences.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-002] [8_RISKS-REQ-103]** Requirement RISK-002
- **Type:** Technical
- **Description:** [RISK-002]** PTY Mode Incompatibility on Windows
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-002] [8_RISKS-REQ-104]** Requirement MIT-002
- **Type:** Technical
- **Description:** [MIT-002] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-002-BR-001] [8_RISKS-REQ-105]** Requirement RISK-002-BR-001
- **Type:** Functional
- **Description:** - **[RISK-002-BR-001]** The PTY capability probe MUST be performed exactly once at server startup using `tokio::task::spawn_blocking`; the result is stored in a process-global `static AtomicBool` and MUST NOT be re-evaluated per stage dispatch or per agent pool initialization.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-002-BR-002] [8_RISKS-REQ-106]** Requirement RISK-002-BR-002
- **Type:** Functional
- **Description:** - **[RISK-002-BR-002]** When `PTY_AVAILABLE = false` and an adapter's configured or default `pty = true`, the server MUST emit a structured `WARN` log with `event_type: "adapter.pty_fallback"` and `"tool": "<adapter_name>"` before spawning the agent without PTY; the log MUST be emitted once per stage dispatch, not once globally.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-002-BR-003] [8_RISKS-REQ-107]** Requirement RISK-002-BR-003
- **Type:** Functional
- **Description:** - **[RISK-002-BR-003]** `get_pool_state` MCP response MUST include `"pty_active": bool` per agent entry, reflecting the runtime PTY capability (`PTY_AVAILABLE && agent.pty_config`), not merely the configured default; this field MUST be present even when `pty_active: false`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-002-BR-004] [8_RISKS-REQ-108]** Requirement RISK-002-BR-004
- **Type:** Functional
- **Description:** - **[RISK-002-BR-004]** A stage explicitly configured with `pty = true` on a platform where PTY allocation fails MUST transition to `Failed` with `failure_reason: "pty_unavailable"` and MUST NOT be retried automatically; the user must change the agent config to `pty = false` to resolve it (`[3_PRD-BR-022]`).
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-002-01] [8_RISKS-REQ-109]** Requirement AC-RISK-002-01
- **Type:** Technical
- **Description:** - **[AC-RISK-002-01]** On a system where PTY allocation fails, `devs` starts successfully, logs `WARN` with `event_type: "adapter.pty_fallback"`, and dispatches `opencode` stages without PTY.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-002-02] [8_RISKS-REQ-110]** Requirement AC-RISK-002-02
- **Type:** Technical
- **Description:** - **[AC-RISK-002-02]** `get_pool_state` MCP response includes `"pty_active": false` for agents running in PTY-fallback mode.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-002-03] [8_RISKS-REQ-111]** Requirement AC-RISK-002-03
- **Type:** Technical
- **Description:** - **[AC-RISK-002-03]** `presubmit-windows` CI job completes without PTY-related `Failed` stages for the `presubmit-check` standard workflow.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-002-04] [8_RISKS-REQ-112]** Requirement AC-RISK-002-04
- **Type:** Technical
- **Description:** - **[AC-RISK-002-04]** A stage explicitly configured `pty = true` on a PTY-unavailable system transitions to `Failed` with `failure_reason: "pty_unavailable"` and does NOT retry.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-003] [8_RISKS-REQ-113]** Requirement RISK-003
- **Type:** Technical
- **Description:** [RISK-003]** Git Checkpoint Store Corruption
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-003] [8_RISKS-REQ-114]** Requirement MIT-003
- **Type:** Technical
- **Description:** [MIT-003] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-003-BR-001] [8_RISKS-REQ-115]** Requirement RISK-003-BR-001
- **Type:** Functional
- **Description:** - **[RISK-003-BR-001]** The atomic write sequence is invariant: `serialize → write .tmp → fsync → rename()`. These steps MUST NOT be reordered and the `rename()` operation is the sole commit point; any failure before `rename()` leaves `checkpoint.json` at its previous valid state.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-003-BR-002] [8_RISKS-REQ-116]** Requirement RISK-003-BR-002
- **Type:** Functional
- **Description:** - **[RISK-003-BR-002]** On server startup, `load_all_runs` MUST scan for orphaned `checkpoint.json.tmp` files in all run directories and delete them with `WARN` log before reading any `checkpoint.json`; failure to clean up orphans does not block startup.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-003-BR-003] [8_RISKS-REQ-117]** Requirement RISK-003-BR-003
- **Type:** Functional
- **Description:** - **[RISK-003-BR-003]** A disk-full (`ENOSPC`) or quota-exceeded error during any checkpoint write step MUST cause the server to log `ERROR` with `event_type: "checkpoint.write_failed"` and `"run_id": "<id>"` and continue; the server MUST NOT crash, exit, or attempt to free disk space.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-003-BR-004] [8_RISKS-REQ-118]** Requirement RISK-003-BR-004
- **Type:** Functional
- **Description:** - **[RISK-003-BR-004]** `git2` push failures are non-fatal: the local checkpoint file is authoritative for crash recovery. A failed push is logged at `WARN` with `event_type: "checkpoint.push_failed"` and retried on the next successful checkpoint write for the same run.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-003-01] [8_RISKS-REQ-119]** Requirement AC-RISK-003-01
- **Type:** Technical
- **Description:** - **[AC-RISK-003-01]** A mock `CheckpointStore` returning `Err(io::ErrorKind::StorageFull)` causes the server to log `ERROR` with `event_type: "checkpoint.write_failed"` and continue processing other runs.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-003-02] [8_RISKS-REQ-120]** Requirement AC-RISK-003-02
- **Type:** Technical
- **Description:** - **[AC-RISK-003-02]** A `checkpoint.json` containing invalid JSON is detected by `validate_checkpoint`, the run is marked `Unrecoverable`, and the server starts successfully processing other runs.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-003-03] [8_RISKS-REQ-121]** Requirement AC-RISK-003-03
- **Type:** Technical
- **Description:** - **[AC-RISK-003-03]** An orphaned `checkpoint.json.tmp` file from a previous crash is deleted with `WARN` log during `load_all_runs`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-003-04] [8_RISKS-REQ-122]** Requirement AC-RISK-003-04
- **Type:** Technical
- **Description:** - **[AC-RISK-003-04]** After a simulated mid-write crash (kill between write and rename), server restart produces at most one `Unrecoverable` run and all other runs recover correctly.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-004] [8_RISKS-REQ-123]** Requirement RISK-004
- **Type:** Technical
- **Description:** [RISK-004]** Agent Adapter CLI Interface Breakage
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-004] [8_RISKS-REQ-124]** Requirement MIT-004
- **Type:** Technical
- **Description:** [MIT-004] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-004-BR-001] [8_RISKS-REQ-125]** Requirement RISK-004-BR-001
- **Type:** Functional
- **Description:** - **[RISK-004-BR-001]** `AgentAdapter::detect_rate_limit()` MUST return `false` when `exit_code == 0`, regardless of stderr content; a zero exit code unambiguously signals success, not a rate limit.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-004-BR-002] [8_RISKS-REQ-126]** Requirement RISK-004-BR-002
- **Type:** Functional
- **Description:** - **[RISK-004-BR-002]** All adapter CLI flags MUST be defined as `const &str` values in `devs-adapters/src/<name>/config.rs`; inline string literals for CLI flags in `build_command()` implementations are prohibited and enforced by a `./do lint` check that scans for string literals in adapter command construction.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-004-BR-003] [8_RISKS-REQ-127]** Requirement RISK-004-BR-003
- **Type:** Functional
- **Description:** - **[RISK-004-BR-003]** `target/adapter-versions.json` MUST be regenerated by `./do setup` and its `captured_at` timestamp MUST be within 7 days; `./do lint` MUST fail if the file is absent or stale, treating a missing compatibility check as equivalent to a compatibility failure.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-004-BR-004] [8_RISKS-REQ-128]** Requirement RISK-004-BR-004
- **Type:** Functional
- **Description:** - **[RISK-004-BR-004]** Rate-limit pattern matching MUST use case-insensitive substring search against the full stderr content; regex-based matching is not required and MUST NOT be introduced to avoid adding `regex` as a production dependency of `devs-adapters`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-004-01] [8_RISKS-REQ-129]** Requirement AC-RISK-004-01
- **Type:** Technical
- **Description:** - **[AC-RISK-004-01]** Each of the 5 adapter compatibility tests passes with the version captured in `target/adapter-versions.json`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-004-02] [8_RISKS-REQ-130]** Requirement AC-RISK-004-02
- **Type:** Technical
- **Description:** - **[AC-RISK-004-02]** A stage targeting a missing binary transitions to `Failed` with `failure_reason: "binary_not_found"` within 100ms and does NOT retry.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-004-03] [8_RISKS-REQ-131]** Requirement AC-RISK-004-03
- **Type:** Technical
- **Description:** - **[AC-RISK-004-03]** Rate-limit pattern tests in `devs-adapters/tests/<name>_rate_limit_test.rs` cover all patterns listed in the compatibility table.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-004-04] [8_RISKS-REQ-132]** Requirement AC-RISK-004-04
- **Type:** Technical
- **Description:** - **[AC-RISK-004-04]** `./do lint` fails if `target/adapter-versions.json` is absent or its `captured_at` timestamp is older than 7 days.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-005] [8_RISKS-REQ-133]** Requirement RISK-005
- **Type:** Technical
- **Description:** [RISK-005]** 15-Minute Presubmit Timeout
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-005] [8_RISKS-REQ-134]** Requirement MIT-005
- **Type:** Technical
- **Description:** [MIT-005] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-005-BR-001] [8_RISKS-REQ-135]** Requirement RISK-005-BR-001
- **Type:** Functional
- **Description:** - **[RISK-005-BR-001]** The 900-second presubmit timeout is measured as wall-clock elapsed time from the first step start, not CPU time; the timer runs in a background subprocess so it fires even if the main process is blocked in a synchronous operation.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-005-BR-002] [8_RISKS-REQ-136]** Requirement RISK-005-BR-002
- **Type:** Functional
- **Description:** - **[RISK-005-BR-002]** `target/presubmit_timings.jsonl` MUST be written incrementally with one JSON object per step flushed immediately after each step completes (not buffered to completion); this ensures partial timing data is available for analysis even after a timeout or failure.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-005-BR-003] [8_RISKS-REQ-137]** Requirement RISK-005-BR-003
- **Type:** Functional
- **Description:** - **[RISK-005-BR-003]** The background timer process (`target/.presubmit_timer.pid`) MUST be explicitly killed when `./do presubmit` exits successfully; a leaked timer process from a previous successful run MUST NOT terminate a subsequent `./do presubmit` invocation.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-005-BR-004] [8_RISKS-REQ-138]** Requirement RISK-005-BR-004
- **Type:** Functional
- **Description:** - **[RISK-005-BR-004]** A step that exceeds its sub-budget by >20% MUST emit an `over_budget: true` entry in `timings.jsonl` and a `WARN` message to stderr, but MUST NOT cause presubmit to exit non-zero; only the 900-second hard timeout exits non-zero.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-005-01] [8_RISKS-REQ-139]** Requirement AC-RISK-005-01
- **Type:** Technical
- **Description:** - **[AC-RISK-005-01]** `target/presubmit_timings.jsonl` is created by `./do presubmit` with one entry per step.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-005-02] [8_RISKS-REQ-140]** Requirement AC-RISK-005-02
- **Type:** Technical
- **Description:** - **[AC-RISK-005-02]** `./do presubmit` exits non-zero within 905 seconds (15min + 5s kill grace) when a step hangs.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-005-03] [8_RISKS-REQ-141]** Requirement AC-RISK-005-03
- **Type:** Technical
- **Description:** - **[AC-RISK-005-03]** All three CI jobs (`presubmit-linux`, `presubmit-macos`, `presubmit-windows`) complete within their respective 25-minute CI timeout.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-005-04] [8_RISKS-REQ-142]** Requirement AC-RISK-005-04
- **Type:** Technical
- **Description:** - **[AC-RISK-005-04]** `./do presubmit` on a clean checkout (no `target/` cache) completes within 15 minutes on the GitLab `presubmit-linux` runner.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-006] [8_RISKS-REQ-143]** Requirement RISK-006
- **Type:** Technical
- **Description:** [RISK-006]** High Coverage Gate Unachievability
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-006] [8_RISKS-REQ-144]** Requirement MIT-006
- **Type:** Technical
- **Description:** [MIT-006] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-006-BR-001] [8_RISKS-REQ-145]** Requirement RISK-006-BR-001
- **Type:** Functional
- **Description:** - **[RISK-006-BR-001]** Coverage exclusions via `// llvm-cov:ignore` are only permitted for platform-conditional branches (`#[cfg(windows)]`, `#[cfg(unix)]`), unreachable error paths in infrastructure code (`unreachable!()`, `panic!()` in infallible paths), and generated code in `devs-proto/src/gen/`. Business logic exclusions are prohibited.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-006-BR-002] [8_RISKS-REQ-146]** Requirement RISK-006-BR-002
- **Type:** Functional
- **Description:** - **[RISK-006-BR-002]** Calling an internal Rust function directly in a `#[test]` function does NOT satisfy QG-003 (CLI E2E), QG-004 (TUI E2E), or QG-005 (MCP E2E) coverage requirements; only tests exercising the interface boundary (subprocess spawn via `assert_cmd`, `TestBackend` full `handle_event→render` cycle, or HTTP POST to a running server) count toward those gates.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-006-BR-003] [8_RISKS-REQ-147]** Requirement RISK-006-BR-003
- **Type:** Functional
- **Description:** - **[RISK-006-BR-003]** The `delta_pct` field in `report.json` compares against the most recent `report.json` artifact committed to the GitLab CI `7 days` artifact store; a missing baseline causes `delta_pct: null` (not an error); `./do coverage` proceeds normally.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-006-BR-004] [8_RISKS-REQ-148]** Requirement RISK-006-BR-004
- **Type:** Functional
- **Description:** - **[RISK-006-BR-004]** `target/coverage/excluded_lines.txt` MUST be committed alongside source changes that introduce new `// llvm-cov:ignore` annotations; `./do lint` MUST fail if an `// llvm-cov:ignore` annotation exists in source but the corresponding line is absent from `excluded_lines.txt`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-006-01] [8_RISKS-REQ-149]** Requirement AC-RISK-006-01
- **Type:** Technical
- **Description:** - **[AC-RISK-006-01]** `./do coverage` exits non-zero when any of QG-001–QG-005 fails.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-006-02] [8_RISKS-REQ-150]** Requirement AC-RISK-006-02
- **Type:** Technical
- **Description:** - **[AC-RISK-006-02]** `target/coverage/report.json` contains exactly 5 gate entries with `gate_id` values `QG-001` through `QG-005`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-006-03] [8_RISKS-REQ-151]** Requirement AC-RISK-006-03
- **Type:** Technical
- **Description:** - **[AC-RISK-006-03]** `delta_pct` in `report.json` is non-null and reflects the difference from the previous successful coverage run.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-006-04] [8_RISKS-REQ-152]** Requirement AC-RISK-006-04
- **Type:** Technical
- **Description:** - **[AC-RISK-006-04]** `uncovered_lines` is populated for any failing gate and points to real source locations in the workspace.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-007] [8_RISKS-REQ-153]** Requirement RISK-007
- **Type:** Technical
- **Description:** [RISK-007]** Template Injection via Stage Output
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-007] [8_RISKS-REQ-154]** Requirement MIT-007
- **Type:** Technical
- **Description:** [MIT-007] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-007-BR-001] [8_RISKS-REQ-155]** Requirement RISK-007-BR-001
- **Type:** Functional
- **Description:** - **[RISK-007-BR-001]** `TemplateResolver::resolve()` MUST process the template string in a single left-to-right pass; after substituting a `{{...}}` expression, the scan position MUST advance to `end + 2` (past the closing `}}`), never to the beginning of the substituted value.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-007-BR-002] [8_RISKS-REQ-156]** Requirement RISK-007-BR-002
- **Type:** Functional
- **Description:** - **[RISK-007-BR-002]** Only scalar JSON types (string, number, boolean, null) from `stage.<name>.output.<field>` are permitted as template variable values; accessing a JSON object or array field MUST return `TemplateError::NonScalarField` before any partial substitution occurs.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-007-BR-003] [8_RISKS-REQ-157]** Requirement RISK-007-BR-003
- **Type:** Functional
- **Description:** - **[RISK-007-BR-003]** The 10,240-byte truncation of stdout/stderr in template context MUST preserve the last 10,240 bytes (most recent content), consistent with `BoundedBytes` truncation semantics and `[SEC-042]`; truncation from the beginning (oldest content discarded) applies.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-007-BR-004] [8_RISKS-REQ-158]** Requirement RISK-007-BR-004
- **Type:** Functional
- **Description:** - **[RISK-007-BR-004]** Template resolution of `{{stage.<name>.stdout}}` and `{{stage.<name>.stderr}}` MUST use the truncated 10,240-byte copy, NOT the full `StageOutput.stdout/stderr` field which may be up to 1 MiB; the truncation MUST happen before the string is passed to `TemplateContext`, not after substitution.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-007-01] [8_RISKS-REQ-159]** Requirement AC-RISK-007-01
- **Type:** Technical
- **Description:** - **[AC-RISK-007-01]** A prompt containing `{{stage.A.stdout}}` where A's stdout is `"{{stage.B.stdout}}"` resolves to the literal string `"{{stage.B.stdout}}"` in the next stage's prompt, not to B's output. (Unit test required; `// Covers: SEC-040`)
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-007-02] [8_RISKS-REQ-160]** Requirement AC-RISK-007-02
- **Type:** Technical
- **Description:** - **[AC-RISK-007-02]** `TemplateResolver` returns `TemplateError::NonScalarField` when a structured output field referenced in a template contains a JSON object or array.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-007-03] [8_RISKS-REQ-161]** Requirement AC-RISK-007-03
- **Type:** Technical
- **Description:** - **[AC-RISK-007-03]** stdout/stderr truncation to 10,240 bytes is verified by a unit test passing a 20,480-byte string and asserting the resolved template contains exactly 10,240 bytes from the end of the string.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-007-04] [8_RISKS-REQ-162]** Requirement AC-RISK-007-04
- **Type:** Technical
- **Description:** - **[AC-RISK-007-04]** A structured output field with a JSON boolean value (`true` or `false`) referenced in a template resolves to the string `"true"` or `"false"` respectively; scalar boolean injection is permitted and correctly stringified.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-007-05] [8_RISKS-REQ-163]** Requirement AC-RISK-007-05
- **Type:** Technical
- **Description:** - **[AC-RISK-007-05]** `TemplateResolver::resolve()` processes a 1 MiB template string containing 1,000 `{{...}}` variable expressions in under 100ms on the CI Linux runner, measured by a dedicated performance regression test.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-008] [8_RISKS-REQ-164]** Requirement RISK-008
- **Type:** Technical
- **Description:** [RISK-008]** Docker and SSH E2E Test Complexity
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-008] [8_RISKS-REQ-165]** Requirement MIT-008
- **Type:** Technical
- **Description:** [MIT-008] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-008-BR-001] [8_RISKS-REQ-166]** Requirement RISK-008-BR-001
- **Type:** Functional
- **Description:** - **[RISK-008-BR-001]** Docker E2E tests MUST use the `bollard` Rust crate for all Docker API calls (container create, start, exec, remove); shell-out to the `docker` CLI binary is prohibited in test code, as it introduces PATH-dependent behavior.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-008-BR-002] [8_RISKS-REQ-167]** Requirement RISK-008-BR-002
- **Type:** Functional
- **Description:** - **[RISK-008-BR-002]** SSH E2E test key files MUST be created with mode `0600` by `./do setup`; the setup script MUST verify permissions after creation and exit non-zero if they cannot be set (e.g., FAT32 filesystem on Windows).
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-008-BR-003] [8_RISKS-REQ-168]** Requirement RISK-008-BR-003
- **Type:** Functional
- **Description:** - **[RISK-008-BR-003]** Docker and SSH E2E tests MUST be tagged with Cargo features (`e2e_docker`, `e2e_ssh`) and MUST be skipped (not failed) when the corresponding infrastructure is unavailable; QG-002 gate MUST still pass through compensating tempdir E2E coverage.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-008-BR-004] [8_RISKS-REQ-169]** Requirement RISK-008-BR-004
- **Type:** Functional
- **Description:** - **[RISK-008-BR-004]** `StageExecutor::cleanup()` MUST complete regardless of stage outcome (success or failure); cleanup errors MUST be logged at `WARN` with `event_type: "executor.cleanup_failed"` and MUST NOT propagate to the caller or affect the stage's terminal status.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-008-01] [8_RISKS-REQ-170]** Requirement AC-RISK-008-01
- **Type:** Technical
- **Description:** - **[AC-RISK-008-01]** `MockExecutor` unit tests cover all three `ExecutionEnv` variants (Tempdir, Docker, RemoteSsh) including failure paths (clone failure, artifact collection failure, cleanup failure).
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-008-02] [8_RISKS-REQ-171]** Requirement AC-RISK-008-02
- **Type:** Technical
- **Description:** - **[AC-RISK-008-02]** The `presubmit-linux` CI job runs Docker E2E tests and they pass with `DOCKER_HOST=tcp://docker:2375`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-008-03] [8_RISKS-REQ-172]** Requirement AC-RISK-008-03
- **Type:** Technical
- **Description:** - **[AC-RISK-008-03]** SSH E2E test connects to `localhost`, runs a trivial agent command (`echo ok`), and confirms the stage completes as `Completed`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-008-04] [8_RISKS-REQ-173]** Requirement AC-RISK-008-04
- **Type:** Technical
- **Description:** - **[AC-RISK-008-04]** QG-002 (≥80% E2E aggregate) passes even on macOS and Windows where Docker/SSH E2E tests are skipped.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-014] [8_RISKS-REQ-174]** Requirement RISK-014
- **Type:** Technical
- **Description:** [RISK-014]** Webhook SSRF DNS-Rebinding Window
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-014] [8_RISKS-REQ-175]** Requirement MIT-014
- **Type:** Technical
- **Description:** [MIT-014] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-014-BR-001] [8_RISKS-REQ-176]** Requirement RISK-014-BR-001
- **Type:** Functional
- **Description:** - **[RISK-014-BR-001]** `check_ssrf()` MUST be called as the first operation of every delivery attempt, immediately after DNS resolution; no delivery attempt proceeds without an SSRF check on the resolved addresses from that attempt's DNS query.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-014-BR-002] [8_RISKS-REQ-177]** Requirement RISK-014-BR-002
- **Type:** Functional
- **Description:** - **[RISK-014-BR-002]** ALL IP addresses resolved from the webhook URL hostname in a single DNS query MUST pass the SSRF blocklist check; even one blocked address causes permanent delivery failure (no retry) with `event_type: "webhook.ssrf_blocked"`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-014-BR-003] [8_RISKS-REQ-178]** Requirement RISK-014-BR-003
- **Type:** Functional
- **Description:** - **[RISK-014-BR-003]** A DNS resolution failure (timeout, NXDOMAIN, network error) MUST cause the delivery attempt to fail and be retried per the backoff schedule; it MUST NOT be treated as an SSRF violation and MUST NOT result in permanent block.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-014-BR-004] [8_RISKS-REQ-179]** Requirement RISK-014-BR-004
- **Type:** Functional
- **Description:** - **[RISK-014-BR-004]** SSRF-blocked webhook deliveries MUST be logged with `event_type: "webhook.ssrf_blocked"`, `"url"` (with query params redacted as `?<redacted>`), `"resolved_ip"`, and `"reason"` fields; this log event is a security audit event at `WARN` level.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-014-01] [8_RISKS-REQ-180]** Requirement AC-RISK-014-01
- **Type:** Technical
- **Description:** - **[AC-RISK-014-01]** `check_ssrf("http://169.254.169.254/latest/meta-data", false)` returns `Err(SsrfError::BlockedAddress)`. (Unit test; `// Covers: SEC-036`)
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-014-02] [8_RISKS-REQ-181]** Requirement AC-RISK-014-02
- **Type:** Technical
- **Description:** - **[AC-RISK-014-02]** `check_ssrf()` called before every delivery attempt; verified by mock `reqwest` interceptor in unit tests.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-014-03] [8_RISKS-REQ-182]** Requirement AC-RISK-014-03
- **Type:** Technical
- **Description:** - **[AC-RISK-014-03]** A URL resolving to both `1.2.3.4` (public) and `192.168.1.1` (private) fails SSRF check.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-014-04] [8_RISKS-REQ-183]** Requirement AC-RISK-014-04
- **Type:** Technical
- **Description:** - **[AC-RISK-014-04]** `devs security-check` reports `SEC-WEBHOOK-TLS` with `status: "warn"` and `detail` mentioning the DNS-rebinding residual risk.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-015] [8_RISKS-REQ-184]** Requirement RISK-015
- **Type:** Technical
- **Description:** [RISK-015]** Glass-Box MCP Full State Exposure
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-015] [8_RISKS-REQ-185]** Requirement MIT-015
- **Type:** Technical
- **Description:** [MIT-015] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-015-BR-001] [8_RISKS-REQ-186]** Requirement RISK-015-BR-001
- **Type:** Functional
- **Description:** - **[RISK-015-BR-001]** The structured security warning `event_type: "security.misconfiguration"` with `check_id: "SEC-BIND-ADDR"` MUST be emitted to `tracing` (at `WARN` level) within 1 second of server startup when either `server.listen` or `mcp_port` is bound to a non-loopback address; this MUST NOT block startup.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-015-BR-002] [8_RISKS-REQ-187]** Requirement RISK-015-BR-002
- **Type:** Functional
- **Description:** - **[RISK-015-BR-002]** All MCP HTTP responses (200, 400, 404, 405, 413, 415, 500) MUST include the three mandatory security headers (`X-Content-Type-Options: nosniff`, `Cache-Control: no-store`, `X-Frame-Options: DENY`) regardless of request success or failure; missing headers on any response are a test failure.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-015-BR-003] [8_RISKS-REQ-188]** Requirement RISK-015-BR-003
- **Type:** Functional
- **Description:** - **[RISK-015-BR-003]** `Redacted<T>` MUST serialize to the exact literal string `"[REDACTED]"` (13 characters, no variation) in all `serde::Serialize` contexts including MCP JSON-RPC responses, webhook payloads, checkpoint files, and `tracing` structured log fields.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-015-BR-004] [8_RISKS-REQ-189]** Requirement RISK-015-BR-004
- **Type:** Functional
- **Description:** - **[RISK-015-BR-004]** Arbitrary agent stdout/stderr content (from `get_stage_output`) is NOT redacted by the MCP server; if an agent accidentally prints an API key, it appears verbatim in the MCP response; this is an accepted MVP risk documented in `[SEC-013]` and operators MUST understand that agent output is not credential-safe.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-015-01] [8_RISKS-REQ-190]** Requirement AC-RISK-015-01
- **Type:** Technical
- **Description:** - **[AC-RISK-015-01]** Server started with `listen = "0.0.0.0:7890"` logs `event_type: "security.misconfiguration"` with `check_id: "SEC-BIND-ADDR"` within 1 second of startup.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-015-02] [8_RISKS-REQ-191]** Requirement AC-RISK-015-02
- **Type:** Technical
- **Description:** - **[AC-RISK-015-02]** `devs security-check` exits code 1 and reports `SEC-BIND-ADDR` as `warn` when `server.listen` does not start with `127.`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-015-03] [8_RISKS-REQ-192]** Requirement AC-RISK-015-03
- **Type:** Technical
- **Description:** - **[AC-RISK-015-03]** `Redacted<T>` fields in `devs.toml` appear as `"[REDACTED]"` in all MCP `get_*` responses.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-015-04] [8_RISKS-REQ-193]** Requirement AC-RISK-015-04
- **Type:** Technical
- **Description:** - **[AC-RISK-015-04]** Server bound to a non-loopback address without a TLS certificate starts successfully and logs a `WARN` with `check_id: "SEC-TLS-MISSING"` and `detail: "plaintext gRPC on non-loopback address; configure [server.tls] to suppress"`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-021] [8_RISKS-REQ-194]** Requirement RISK-021
- **Type:** Technical
- **Description:** [RISK-021]** Fan-Out Pool Starvation
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-021] [8_RISKS-REQ-195]** Requirement MIT-021
- **Type:** Technical
- **Description:** [MIT-021] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-021-BR-001] [8_RISKS-REQ-196]** Requirement RISK-021-BR-001
- **Type:** Functional
- **Description:** - **[RISK-021-BR-001]** Fan-out sub-agents compete for pool semaphore permits on equal footing with all other dispatched stages; they are subject to the multi-project scheduling policy (strict priority or weighted fair queue) and MUST NOT bypass the dispatcher's eligibility queue by acquiring permits directly.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-021-BR-002] [8_RISKS-REQ-197]** Requirement RISK-021-BR-002
- **Type:** Functional
- **Description:** - **[RISK-021-BR-002]** A paused fan-out stage's Running sub-agents MUST receive `devs:pause\n` via stdin within 1 second of the `pause_run` or `pause_stage` command; Eligible sub-agents MUST be held from acquiring semaphore permits; the semaphore permits held by Running (now Paused) sub-agents are NOT released until the sub-agents exit.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-021-BR-003] [8_RISKS-REQ-198]** Requirement RISK-021-BR-003
- **Type:** Functional
- **Description:** - **[RISK-021-BR-003]** The default merge handler (no `merge_handler` configured) MUST cause the parent stage to transition to `Failed` if ANY sub-agent fails, with `structured.failed_indices: [N, ...]` listing the zero-based fan-out indices of all failed sub-agents.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-021-BR-004] [8_RISKS-REQ-199]** Requirement RISK-021-BR-004
- **Type:** Functional
- **Description:** - **[RISK-021-BR-004]** Fan-out sub-agent `StageRun` records MUST appear under the parent stage's `fan_out_sub_runs` field, NOT in the top-level `WorkflowRun.stage_runs` array; the stage counts in `RunSummary` (`stage_count`, `completed_stage_count`, `failed_stage_count`) MUST NOT include fan-out sub-agents.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-021-01] [8_RISKS-REQ-200]** Requirement AC-RISK-021-01
- **Type:** Technical
- **Description:** - **[AC-RISK-021-01]** A fan-out with `count=64` and pool `max_concurrent=4` dispatches exactly 4 sub-agents simultaneously, verified by polling `get_pool_state` and asserting `active_count == 4` and `queued_count == 60`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-021-02] [8_RISKS-REQ-201]** Requirement AC-RISK-021-02
- **Type:** Technical
- **Description:** - **[AC-RISK-021-02]** When a fan-out stage is cancelled, `get_pool_state` shows `queued_count` decreasing to 0 within 15 seconds.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-021-03] [8_RISKS-REQ-202]** Requirement AC-RISK-021-03
- **Type:** Technical
- **Description:** - **[AC-RISK-021-03]** A higher-priority project's stage acquires a pool semaphore permit within 100ms of a fan-out sub-agent completing, in strict scheduling mode.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-021-04] [8_RISKS-REQ-203]** Requirement AC-RISK-021-04
- **Type:** Technical
- **Description:** - **[AC-RISK-021-04]** Default merge with one sub-agent failure (exit non-zero) and 63 sub-agent successes produces a parent stage `Failed` result with `structured.failed_indices: [<N>]` containing exactly the zero-based index of the failing sub-agent.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-021-05] [8_RISKS-REQ-204]** Requirement AC-RISK-021-05
- **Type:** Technical
- **Description:** - **[AC-RISK-021-05]** Fan-out sub-agent `StageRun` records appear in `WorkflowRun.stage_runs[<parent>].fan_out_sub_runs`, not in the top-level `stage_runs` array, confirmed by `get_run` MCP response schema validation.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-021-06] [8_RISKS-REQ-205]** Requirement AC-RISK-021-06
- **Type:** Technical
- **Description:** - **[AC-RISK-021-06]** `get_pool_state` `active_count` accurately reflects the number of currently running sub-agents (not yet-spawned or already-completed sub-agents) throughout the fan-out execution.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-022] [8_RISKS-REQ-206]** Requirement RISK-022
- **Type:** Technical
- **Description:** [RISK-022]** MCP stdio Bridge Connection Loss
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-022] [8_RISKS-REQ-207]** Requirement MIT-022
- **Type:** Technical
- **Description:** [MIT-022] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-022-BR-001] [8_RISKS-REQ-208]** Requirement RISK-022-BR-001
- **Type:** Functional
- **Description:** - **[RISK-022-BR-001]** `devs-mcp-bridge` MUST perform exactly one reconnect attempt after a 1-second wait following any HTTP connection error; if the reconnect fails, it MUST write the fatal JSON (`"fatal": true`) to stdout and exit code 1 without further retry; multiple reconnect attempts are prohibited.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-022-BR-002] [8_RISKS-REQ-209]** Requirement RISK-022-BR-002
- **Type:** Functional
- **Description:** - **[RISK-022-BR-002]** Invalid JSON on `devs-mcp-bridge` stdin MUST produce a JSON-RPC parse error (`{"jsonrpc":"2.0","error":{"code":-32700,"message":"Parse error"},"id":null}`) to stdout and the bridge MUST continue processing subsequent lines; it MUST NOT exit on invalid input (`[UI-ROUTE-018]`).
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-022-BR-003] [8_RISKS-REQ-210]** Requirement RISK-022-BR-003
- **Type:** Functional
- **Description:** - **[RISK-022-BR-003]** `devs-mcp-bridge` MUST NOT create any TCP listener; it is exclusively a stdin-to-HTTP proxy (`[SEC-ATK-002]`); the bridge binary MUST be verified to have zero open listening sockets during its operational state by an E2E test.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-022-BR-004] [8_RISKS-REQ-211]** Requirement RISK-022-BR-004
- **Type:** Functional
- **Description:** - **[RISK-022-BR-004]** The `"fatal": true` field in the connection-loss error JSON is mandatory and distinguishes terminal (irrecoverable) errors from standard tool error responses; bridge output without `"fatal"` is never terminal from the bridge's perspective.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-022-01] [8_RISKS-REQ-212]** Requirement AC-RISK-022-01
- **Type:** Technical
- **Description:** - **[AC-RISK-022-01]** `devs-mcp-bridge` exits code 1 and writes `{"result":null,"error":"server_unreachable: ...","fatal":true}` within 2 seconds of MCP server becoming unavailable.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-022-02] [8_RISKS-REQ-213]** Requirement AC-RISK-022-02
- **Type:** Technical
- **Description:** - **[AC-RISK-022-02]** A stage with `completion = "mcp_tool_call"` whose agent exits without calling `signal_completion` transitions to either `Completed` or `Failed` based on the agent's exit code (fallback behavior), not hanging indefinitely.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-022-03] [8_RISKS-REQ-214]** Requirement AC-RISK-022-03
- **Type:** Technical
- **Description:** - **[AC-RISK-022-03]** Invalid JSON on bridge stdin produces a JSON-RPC `-32700` error on stdout and the bridge continues processing subsequent lines.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-022-04] [8_RISKS-REQ-215]** Requirement AC-RISK-022-04
- **Type:** Technical
- **Description:** - **[AC-RISK-022-04]** `devs-mcp-bridge` E2E test verifies that a request forwarded through the bridge produces the same result as a direct `POST /mcp/v1/call`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-023] [8_RISKS-REQ-216]** Requirement RISK-023
- **Type:** Technical
- **Description:** [RISK-023]** `cargo-llvm-cov` Inaccurate E2E Coverage Measurement
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-023] [8_RISKS-REQ-217]** Requirement MIT-023
- **Type:** Technical
- **Description:** [MIT-023] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-023-BR-001] [8_RISKS-REQ-218]** Requirement RISK-023-BR-001
- **Type:** Functional
- **Description:** - **[RISK-023-BR-001]** All E2E test helpers that spawn `devs` server or CLI binary as a subprocess MUST set `LLVM_PROFILE_FILE` to a path with `%p` (PID) suffix; a shared `LLVM_PROFILE_FILE` without `%p` will cause data race corruption between concurrent test processes and is prohibited.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-023-BR-002] [8_RISKS-REQ-219]** Requirement RISK-023-BR-002
- **Type:** Functional
- **Description:** - **[RISK-023-BR-002]** TUI E2E tests using `ratatui::backend::TestBackend` MUST run in-process (not as a subprocess); their coverage is captured naturally by `cargo-llvm-cov` without any `LLVM_PROFILE_FILE` configuration; spawning TUI as a subprocess for coverage purposes is prohibited.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-023-BR-003] [8_RISKS-REQ-220]** Requirement RISK-023-BR-003
- **Type:** Functional
- **Description:** - **[RISK-023-BR-003]** `./do coverage` MUST fail with a descriptive error (`"internal: zero .profraw files found for E2E subprocess runs"`) and exit non-zero if zero `.profraw` files are found for E2E subprocess runs; silently reporting 0% E2E coverage is prohibited.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-023-BR-004] [8_RISKS-REQ-221]** Requirement RISK-023-BR-004
- **Type:** Functional
- **Description:** - **[RISK-023-BR-004]** Coverage data from unit tests (`#[test]` functions calling internal Rust APIs directly) MUST NOT be included in the QG-003, QG-004, or QG-005 gate calculations; `./do coverage` uses separate `cargo llvm-cov` invocations with `--test '*_e2e*'` pattern to isolate E2E coverage from unit coverage.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-023-01] [8_RISKS-REQ-222]** Requirement AC-RISK-023-01
- **Type:** Technical
- **Description:** - **[AC-RISK-023-01]** `./do coverage` sets `LLVM_PROFILE_FILE` with `%p` suffix for all subprocess-spawning E2E tests, verified by inspecting the generated `.profraw` files in `/tmp/`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-023-02] [8_RISKS-REQ-223]** Requirement AC-RISK-023-02
- **Type:** Technical
- **Description:** - **[AC-RISK-023-02]** QG-003 (CLI E2E ≥50%) is met with coverage attributed only from `assert_cmd` subprocess invocations, not from unit tests calling CLI handler functions directly.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-023-03] [8_RISKS-REQ-224]** Requirement AC-RISK-023-03
- **Type:** Technical
- **Description:** - **[AC-RISK-023-03]** Clean server shutdown during E2E tests (SIGTERM, not SIGKILL) produces a non-empty `.profraw` file for the server process.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-023-04] [8_RISKS-REQ-225]** Requirement AC-RISK-023-04
- **Type:** Technical
- **Description:** - **[AC-RISK-023-04]** `./do coverage` fails with a descriptive error if zero `.profraw` files are found for E2E test runs.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-025] [8_RISKS-REQ-226]** Requirement RISK-025
- **Type:** Technical
- **Description:** [RISK-025]** Workflow Snapshot Immutability Violation
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-025] [8_RISKS-REQ-227]** Requirement MIT-025
- **Type:** Technical
- **Description:** [MIT-025] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-025-BR-001] [8_RISKS-REQ-228]** Requirement RISK-025-BR-001
- **Type:** Functional
- **Description:** - **[RISK-025-BR-001]** The `definition_snapshot` field in `WorkflowRun` MUST be an owned, deep-cloned copy of `WorkflowDefinition` captured under the per-project mutex at `submit_run` time; `Arc` pointers into the live workflow map are prohibited for this field.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-025-BR-002] [8_RISKS-REQ-229]** Requirement RISK-025-BR-002
- **Type:** Functional
- **Description:** - **[RISK-025-BR-002]** `workflow_snapshot.json` is write-once: the persist layer MUST return `Err(SnapshotError::AlreadyExists)` if the file already exists for a given `run-id`; the caller MUST treat `AlreadyExists` as idempotency confirmation (snapshot is correct) and NOT as an error that fails the submission.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-025-BR-003] [8_RISKS-REQ-230]** Requirement RISK-025-BR-003
- **Type:** Functional
- **Description:** - **[RISK-025-BR-003]** `write_workflow_definition` MUST update only the live `WorkflowDefinitions` map; it MUST NOT read, modify, or overwrite any existing `workflow_snapshot.json` for any run in any state.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-025-BR-004] [8_RISKS-REQ-231]** Requirement RISK-025-BR-004
- **Type:** Functional
- **Description:** - **[RISK-025-BR-004]** The duplicate run name check and the snapshot write MUST occur within the same per-project mutex lock acquisition; releasing the lock between these two operations creates a TOCTOU window where a duplicate name could be accepted or a concurrent snapshot could overwrite the correct one.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-025-01] [8_RISKS-REQ-232]** Requirement AC-RISK-025-01
- **Type:** Technical
- **Description:** - **[AC-RISK-025-01]** `workflow_snapshot.json` content matches the `WorkflowDefinition` at the time of `submit_run`, not the definition at the time of first stage dispatch, even when `write_workflow_definition` is called in between.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-025-02] [8_RISKS-REQ-233]** Requirement AC-RISK-025-02
- **Type:** Technical
- **Description:** - **[AC-RISK-025-02]** Attempting to write `workflow_snapshot.json` for a run that already has one returns `Err(SnapshotError::AlreadyExists)` and leaves the existing file unchanged.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-025-03] [8_RISKS-REQ-234]** Requirement AC-RISK-025-03
- **Type:** Technical
- **Description:** - **[AC-RISK-025-03]** Concurrent `submit_run` + `write_workflow_definition` under `tokio::join!` produces two distinct snapshots, each reflecting the definition at the moment of their respective `submit_run` calls.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-025-04] [8_RISKS-REQ-235]** Requirement AC-RISK-025-04
- **Type:** Technical
- **Description:** - **[AC-RISK-025-04]** `write_workflow_definition` called while two active runs are using the same workflow leaves both runs' `definition_snapshot` fields unchanged; both runs complete using their originally captured definitions, verified by reading `workflow_snapshot.json` for each run after `write_workflow_definition` completes.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-025-05] [8_RISKS-REQ-236]** Requirement AC-RISK-025-05
- **Type:** Technical
- **Description:** - **[AC-RISK-025-05]** `workflow_snapshot.json` schema is validated on load: it MUST contain `"schema_version": 1`, `"captured_at"` (RFC 3339 string), `"run_id"` (UUID4 string), and `"definition"` (valid `WorkflowDefinition` object); a snapshot with any missing field causes the run to be marked `Unrecoverable`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-009] [8_RISKS-REQ-237]** Requirement RISK-009
- **Type:** Technical
- **Description:** [RISK-009]** Bootstrapping Deadlock
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[8_RISKS-REQ-238]** Bootstrap Phase Milestone Definition
- **Type:** Operational
- **Description:** Bootstrap Phase Definition:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[8_RISKS-REQ-239]** Bootstrap Milestone JSON Schema
- **Type:** Technical
- **Description:** Bootstrap Milestone Data Model:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[8_RISKS-REQ-240]** Bootstrap Phase State Machine
- **Type:** Technical
- **Description:** Bootstrap Phase State Machine:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-009] [8_RISKS-REQ-241]** Requirement MIT-009
- **Type:** Technical
- **Description:** [MIT-009] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-009-BR-001] [8_RISKS-REQ-242]** Requirement RISK-009-BR-001
- **Type:** Functional
- **Description:** - **[RISK-009-BR-001]** Bootstrap Phase is bounded by a time-box of 150% of its planned duration. Exceeding this threshold MUST trigger FB-007 activation without exception. The trigger is evaluated by the project lead at the start of each development session; if the cumulative time-in-bootstrap exceeds the threshold, no new crate work may begin until the ADR is written and scope is reduced.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-009-BR-002] [8_RISKS-REQ-243]** Requirement RISK-009-BR-002
- **Type:** Functional
- **Description:** - **[RISK-009-BR-002]** During Bootstrap Phase, `./do presubmit` on Linux MUST pass for every committed crate before work on the next crate in the dependency order begins. This prevents defect accumulation in infrastructure code that cannot yet be verified by `devs` itself.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-009-BR-003] [8_RISKS-REQ-244]** Requirement RISK-009-BR-003
- **Type:** Functional
- **Description:** - **[RISK-009-BR-003]** Stub implementations (`unimplemented!()`) are permissible only during Bootstrap Phase. Every stub MUST be annotated `// TODO: BOOTSTRAP-STUB`. After `BootstrapComplete` state is reached, `./do lint` counts stubs and exits non-zero if any remain. The stub count is zero before the Bootstrap milestone ADR is written.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-009-BR-004] [8_RISKS-REQ-245]** Requirement RISK-009-BR-004
- **Type:** Functional
- **Description:** - **[RISK-009-BR-004]** Standard workflow TOML files in `.devs/workflows/` MUST be committed and accepted by `devs submit` without validation errors before `SelfHostingAttempt` state is entered. Starting a self-hosting attempt without committed and valid workflow files is prohibited; the `./do lint` check verifies their presence.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-009-BR-005] [8_RISKS-REQ-246]** Requirement RISK-009-BR-005
- **Type:** Functional
- **Description:** - **[RISK-009-BR-005]** If `SelfHostingAttempt` fails (any stage `Failed` or `TimedOut`), the failure MUST be diagnosed using `get_stage_output` and `stream_logs` (following the mandatory diagnostic sequence in §3.4 of `3_mcp_design.md`) before any code changes are made. Speculative edits during Bootstrap Phase debugging are prohibited.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-009-BR-006] [8_RISKS-REQ-247]** Requirement RISK-009-BR-006
- **Type:** Functional
- **Description:** - **[RISK-009-BR-006]** The bootstrapping milestone is recorded in `docs/adr/NNNN-bootstrap-complete.md` with the exact commit SHA, CI pipeline URL, and all three `COND-NNN` conditions listed as verified. This ADR MUST be committed in the same PR that contains the passing `SelfHostingAttempt` evidence.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-009-01] [8_RISKS-REQ-248]** Requirement AC-RISK-009-01
- **Type:** Technical
- **Description:** - **[AC-RISK-009-01]** `devs submit presubmit-check` via `devs-cli` results in a `Completed` run with all stages at `Completed` status, confirmed by `devs status <run-id> --format json`, marking the end of Bootstrap Phase.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-009-02] [8_RISKS-REQ-249]** Requirement AC-RISK-009-02
- **Type:** Technical
- **Description:** - **[AC-RISK-009-02]** All 6 standard workflow TOML files in `.devs/workflows/` are committed and accepted by `devs submit` without validation errors before Bootstrap Phase ends.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-009-03] [8_RISKS-REQ-250]** Requirement AC-RISK-009-03
- **Type:** Technical
- **Description:** - **[AC-RISK-009-03]** `./do presubmit` passes on Linux for all crates completed during Bootstrap Phase before self-hosting begins.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-009-04] [8_RISKS-REQ-251]** Requirement AC-RISK-009-04
- **Type:** Technical
- **Description:** - **[AC-RISK-009-04]** `./do lint` exits non-zero when any `// TODO: BOOTSTRAP-STUB` comment exists in the workspace after the `BootstrapComplete` ADR is committed (enforced via `grep -rn "BOOTSTRAP-STUB" crates/` in the lint script).
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-009-05] [8_RISKS-REQ-252]** Requirement AC-RISK-009-05
- **Type:** Technical
- **Description:** - **[AC-RISK-009-05]** `docs/adr/NNNN-bootstrap-complete.md` exists and contains the commit SHA, CI pipeline URL, and all three `COND-NNN` conditions (`COND-001`, `COND-002`, `COND-003`) listed as verified.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-010] [8_RISKS-REQ-253]** Requirement RISK-010
- **Type:** Technical
- **Description:** [RISK-010]** AI Agent Rate Limits Stalling Development
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-010] [8_RISKS-REQ-254]** Requirement MIT-010
- **Type:** Technical
- **Description:** [MIT-010] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-010-BR-001] [8_RISKS-REQ-255]** Requirement RISK-010-BR-001
- **Type:** Functional
- **Description:** - **[RISK-010-BR-001]** `report_rate_limit` MUST NOT increment `StageRun.attempt`. Rate-limit events are not genuine failures; only execution failures (non-rate-limit non-zero exit codes) increment the attempt counter. This is enforced in `devs-pool` by setting `attempt_incremented: false` in the `RateLimitEvent` struct.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-010-BR-002] [8_RISKS-REQ-256]** Requirement RISK-010-BR-002
- **Type:** Functional
- **Description:** - **[RISK-010-BR-002]** The 60-second cooldown timer starts at the moment `report_rate_limit` is received (active detection) or at the moment the rate-limit exit code pattern is matched (passive detection). The cooldown is stored as an absolute `rate_limited_until: DateTime<Utc>` in `PoolState`; it is not reset by additional rate-limit events from the same agent during the cooldown window.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-010-BR-003] [8_RISKS-REQ-257]** Requirement RISK-010-BR-003
- **Type:** Functional
- **Description:** - **[RISK-010-BR-003]** `pool.exhausted` webhook fires at most once per exhaustion episode. An episode begins when all agents in the pool are simultaneously rate-limited or unavailable. An episode ends when at least one agent becomes available. A new episode begins only after at least one successful dispatch after the end of the previous episode.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-010-BR-004] [8_RISKS-REQ-258]** Requirement RISK-010-BR-004
- **Type:** Functional
- **Description:** - **[RISK-010-BR-004]** When a stage is re-queued due to rate limiting, it retains its original `required_capabilities` and `depends_on` state. It does NOT restart from `Pending`; it returns to `Eligible` and is re-dispatched as soon as a capable agent becomes available.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-010-BR-005] [8_RISKS-REQ-259]** Requirement RISK-010-BR-005
- **Type:** Functional
- **Description:** - **[RISK-010-BR-005]** The primary development pool configuration MUST include at least two agents from different API providers. A pool configuration with all agents from the same provider is rejected at server startup with `INVALID_ARGUMENT: "pool '<name>' has no provider diversity: all agents use the same API provider"`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-010-01] [8_RISKS-REQ-260]** Requirement AC-RISK-010-01
- **Type:** Technical
- **Description:** - **[AC-RISK-010-01]** `report_rate_limit` MCP call on a stage with a fallback agent triggers pool fallback within 1 second without incrementing `StageRun.attempt`; verified by `get_run` showing `attempt` unchanged after rate-limit event.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-010-02] [8_RISKS-REQ-261]** Requirement AC-RISK-010-02
- **Type:** Technical
- **Description:** - **[AC-RISK-010-02]** `pool.exhausted` webhook fires exactly once per exhaustion episode (all agents rate-limited → any agent available = one episode); a second simultaneous exhaustion during the cooldown does NOT fire a second webhook.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-010-03] [8_RISKS-REQ-262]** Requirement AC-RISK-010-03
- **Type:** Technical
- **Description:** - **[AC-RISK-010-03]** `get_pool_state` MCP response includes `"rate_limited_until": "<ISO8601>"` for each rate-limited agent during cooldown, and `null` once cooldown expires.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-010-04] [8_RISKS-REQ-263]** Requirement AC-RISK-010-04
- **Type:** Technical
- **Description:** - **[AC-RISK-010-04]** A passive rate-limit detection event (exit code 1 + matching stderr pattern) does NOT increment `StageRun.attempt`; verified by checking attempt count before and after the detection event via `get_run`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-010-05] [8_RISKS-REQ-264]** Requirement AC-RISK-010-05
- **Type:** Technical
- **Description:** - **[AC-RISK-010-05]** A pool configuration with all agents from the same provider causes server startup to exit non-zero with a message containing `"no provider diversity"`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-011] [8_RISKS-REQ-265]** Requirement RISK-011
- **Type:** Technical
- **Description:** [RISK-011]** E2E Test Isolation Failures
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-011] [8_RISKS-REQ-266]** Requirement MIT-011
- **Type:** Technical
- **Description:** [MIT-011] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-011-BR-001] [8_RISKS-REQ-267]** Requirement RISK-011-BR-001
- **Type:** Functional
- **Description:** - **[RISK-011-BR-001]** Every E2E test that starts a `devs-server` MUST use `devs_test_helper::start_server()`. Direct `std::process::Command::new("devs-server")` in test code is prohibited and causes `./do lint` to exit non-zero.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-011-BR-002] [8_RISKS-REQ-268]** Requirement RISK-011-BR-002
- **Type:** Functional
- **Description:** - **[RISK-011-BR-002]** `ServerHandle::drop()` MUST send SIGTERM to the server process and wait up to 10 seconds for a clean exit before sending SIGKILL. It MUST NOT return until the process has exited. This ensures port release before the next test begins.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-011-BR-003] [8_RISKS-REQ-269]** Requirement RISK-011-BR-003
- **Type:** Functional
- **Description:** - **[RISK-011-BR-003]** E2E test binaries that require a running server MUST set `test-threads = 1` in `.cargo/config.toml` for their test target. Violating this (setting `test-threads > 1` for E2E tests) causes non-deterministic `EADDRINUSE` failures in CI.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-011-BR-004] [8_RISKS-REQ-270]** Requirement RISK-011-BR-004
- **Type:** Functional
- **Description:** - **[RISK-011-BR-004]** The `DEVS_DISCOVERY_FILE` environment variable for each test server MUST be unique and within the test's `TempDir`. Using a hardcoded path (e.g., `/tmp/devs-test.addr`) is prohibited and causes `./do lint` to exit non-zero.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-011-01] [8_RISKS-REQ-271]** Requirement AC-RISK-011-01
- **Type:** Technical
- **Description:** - **[AC-RISK-011-01]** 100 E2E tests run sequentially (`--test-threads 1`) without any `EADDRINUSE` errors or stale discovery file reads, verified by checking server startup logs for successful port binding.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-011-02] [8_RISKS-REQ-272]** Requirement AC-RISK-011-02
- **Type:** Technical
- **Description:** - **[AC-RISK-011-02]** `./do lint` exits non-zero if any file in `tests/**/*.rs` contains `Command::new` with a literal `"devs"` or `"devs-server"` string outside of `devs_test_helper`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-011-03] [8_RISKS-REQ-273]** Requirement AC-RISK-011-03
- **Type:** Technical
- **Description:** - **[AC-RISK-011-03]** `devs_test_helper::start_server()` accepts `TestServerConfig { temp_dir: TempDir, .. }` (not `&str` or `PathBuf`), enforcing uniqueness at the type level; `TestServerConfig::new()` panics if `TempDir` creation fails.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-011-04] [8_RISKS-REQ-274]** Requirement AC-RISK-011-04
- **Type:** Technical
- **Description:** - **[AC-RISK-011-04]** `ServerHandle::drop()` sends SIGTERM, waits up to 10 seconds, sends SIGKILL if still alive, and returns only after the process has exited; verified by a test that checks port reuse succeeds immediately after the previous `ServerHandle` is dropped.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-012] [8_RISKS-REQ-275]** Requirement RISK-012
- **Type:** Technical
- **Description:** [RISK-012]** Cross-Platform Behavioral Divergence
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-012] [8_RISKS-REQ-276]** Requirement MIT-012
- **Type:** Technical
- **Description:** [MIT-012] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-012-BR-001] [8_RISKS-REQ-277]** Requirement RISK-012-BR-001
- **Type:** Functional
- **Description:** - **[RISK-012-BR-001]** Every call to set file or directory permissions MUST go through `devs_persist::permissions::set_secure_file()` or `set_secure_dir()`. Direct `std::fs::set_permissions()` calls outside `devs-checkpoint/src/permissions.rs` cause `./do lint` to exit non-zero.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-012-BR-002] [8_RISKS-REQ-278]** Requirement RISK-012-BR-002
- **Type:** Functional
- **Description:** - **[RISK-012-BR-002]** All paths written to gRPC messages, MCP JSON responses, checkpoint files, and the discovery file MUST be normalized to forward-slash separators via `normalize_path_display()`. Raw `PathBuf::display()` output is prohibited in serialized output.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-012-BR-003] [8_RISKS-REQ-279]** Requirement RISK-012-BR-003
- **Type:** Functional
- **Description:** - **[RISK-012-BR-003]** `./do` MUST be POSIX `sh` compliant. `shellcheck --shell=sh ./do` exits 0. Any bash-specific syntax is a lint failure that blocks commits. Permitted: `$(...)`, `$((...))`; prohibited: `[[`, `local`, `declare`, bash arrays.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-012-BR-004] [8_RISKS-REQ-280]** Requirement RISK-012-BR-004
- **Type:** Functional
- **Description:** - **[RISK-012-BR-004]** All platform-specific code paths MUST be tested in the CI matrix. A `#[cfg(windows)]` or `#[cfg(unix)]` code path that has no corresponding test annotation (`// Covers: RISK-012`) in the Windows or Unix CI job is a traceability violation.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-012-BR-005] [8_RISKS-REQ-281]** Requirement RISK-012-BR-005
- **Type:** Functional
- **Description:** - **[RISK-012-BR-005]** `devs security-check` on Windows MUST report `SEC-FILE-PERM-WINDOWS` as a `warn` (not `error` or `pass`) with remediation text `"File permissions not enforced on Windows; use OS-level ACLs or restrict server deployment to Unix systems"`. This is a documented accepted limitation, not a defect.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-012-01] [8_RISKS-REQ-282]** Requirement AC-RISK-012-01
- **Type:** Technical
- **Description:** - **[AC-RISK-012-01]** `shellcheck --shell=sh ./do` exits 0; any bash-specific syntax causes exit non-zero with specific line number and syntax error.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-012-02] [8_RISKS-REQ-283]** Requirement AC-RISK-012-02
- **Type:** Technical
- **Description:** - **[AC-RISK-012-02]** `presubmit-windows` CI job passes with exactly one `WARN` event per call to `set_secure_file()` or `set_secure_dir()` on a Windows runner (verified by log line count in CI artifacts).
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-012-03] [8_RISKS-REQ-284]** Requirement AC-RISK-012-03
- **Type:** Technical
- **Description:** - **[AC-RISK-012-03]** `devs security-check` on Windows outputs JSON with `"check_id": "SEC-FILE-PERM-WINDOWS"`, `"status": "warn"`, and a non-empty `"remediation"` string.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-012-04] [8_RISKS-REQ-285]** Requirement AC-RISK-012-04
- **Type:** Technical
- **Description:** - **[AC-RISK-012-04]** TUI snapshot `dashboard__run_running` produces identical text output on all three CI platforms (verified by `insta` snapshot comparison; binary-identical `.txt` files across platforms).
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-012-05] [8_RISKS-REQ-286]** Requirement AC-RISK-012-05
- **Type:** Technical
- **Description:** - **[AC-RISK-012-05]** `./do lint` exits non-zero if `grep -rn "fs::set_permissions" crates/` finds any call outside `devs-checkpoint/src/permissions.rs`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-013] [8_RISKS-REQ-287]** Requirement RISK-013
- **Type:** Technical
- **Description:** [RISK-013]** Requirement Traceability Maintenance Burden
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-013] [8_RISKS-REQ-288]** Requirement MIT-013
- **Type:** Technical
- **Description:** [MIT-013] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-013-BR-001] [8_RISKS-REQ-289]** Requirement RISK-013-BR-001
- **Type:** Functional
- **Description:** - **[RISK-013-BR-001]** `./do test` MUST exit non-zero when `traceability_pct < 100.0`, even if all `cargo test` invocations pass. The traceability check is a mandatory gate equal in weight to test execution.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-013-BR-002] [8_RISKS-REQ-290]** Requirement RISK-013-BR-002
- **Type:** Functional
- **Description:** - **[RISK-013-BR-002]** `./do test` MUST exit non-zero when `stale_annotations` is non-empty, even if all requirements are covered. An annotation referencing a non-existent ID is an error, not a warning. The annotation must be removed or corrected.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-013-BR-003] [8_RISKS-REQ-291]** Requirement RISK-013-BR-003
- **Type:** Functional
- **Description:** - **[RISK-013-BR-003]** New requirement IDs MUST be added to spec documents in the same commit that adds their covering test. It is prohibited to add an ID to a spec document in a commit that does not also add at least one `// Covers: <id>` annotation for that ID.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-013-BR-004] [8_RISKS-REQ-292]** Requirement RISK-013-BR-004
- **Type:** Functional
- **Description:** - **[RISK-013-BR-004]** The traceability scanner scans ALL `.rs` files matching the patterns above, not just files in a specific directory. A `// Covers: <id>` annotation in a non-test source file (e.g., a production source file) is valid and counted. However, coverage from unit tests does NOT satisfy QG-003, QG-004, or QG-005 (E2E interface gates); the annotation satisfies only the traceability check.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-013-BR-005] [8_RISKS-REQ-293]** Requirement RISK-013-BR-005
- **Type:** Functional
- **Description:** - **[RISK-013-BR-005]** When a spec document is renamed or a requirement ID changes, all affected annotations MUST be updated in the same commit as the rename/change. A post-rename commit with stale annotations causes `./do test` to exit non-zero. `git mv` for spec file renames automatically triggers annotation audit in `./do lint`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-013-01] [8_RISKS-REQ-294]** Requirement AC-RISK-013-01
- **Type:** Technical
- **Description:** - **[AC-RISK-013-01]** `./do test` exits non-zero when `traceability_pct < 100.0`, even if all `cargo test` cases pass; verified by temporarily removing one `// Covers:` annotation and observing exit code 1.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-013-02] [8_RISKS-REQ-295]** Requirement AC-RISK-013-02
- **Type:** Technical
- **Description:** - **[AC-RISK-013-02]** `traceability.json` `stale_annotations` is empty when all annotated IDs reference real requirement IDs in the scanned spec documents.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-013-03] [8_RISKS-REQ-296]** Requirement AC-RISK-013-03
- **Type:** Technical
- **Description:** - **[AC-RISK-013-03]** Adding a new `[FEAT-NNN]` tag to a spec without adding a `// Covers: FEAT-NNN` annotation in a test file causes `./do test` to exit non-zero in the same commit.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-013-04] [8_RISKS-REQ-297]** Requirement AC-RISK-013-04
- **Type:** Technical
- **Description:** - **[AC-RISK-013-04]** `traceability.json` is regenerated fresh on every `./do test` invocation; its `generated_at` timestamp is within 60 seconds of the `./do test` invocation time (verified by checking timestamp freshness in a test that reads the file after running `./do test`).
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-016] [8_RISKS-REQ-298]** Requirement RISK-016
- **Type:** Technical
- **Description:** [RISK-016]** Single Developer with No Code Review
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-016] [8_RISKS-REQ-299]** Requirement MIT-016
- **Type:** Technical
- **Description:** [MIT-016] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-016-BR-001] [8_RISKS-REQ-300]** Requirement RISK-016-BR-001
- **Type:** Functional
- **Description:** - **[RISK-016-BR-001]** Every new crate MUST have at least one ADR in `docs/adr/` documenting its primary design decisions before it is merged to `main`. The ADR MUST be committed in the same PR as the crate implementation; not retroactively after merge.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-016-BR-002] [8_RISKS-REQ-301]** Requirement RISK-016-BR-002
- **Type:** Functional
- **Description:** - **[RISK-016-BR-002]** `cargo clippy --workspace --all-targets -- -D warnings` MUST exit 0 on every commit. This is enforced by `./do lint` and blocks the `presubmit` gate. No clippy suppression (`#[allow(clippy::...)]`) without a comment explaining why the suppression is justified.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-016-BR-003] [8_RISKS-REQ-302]** Requirement RISK-016-BR-003
- **Type:** Functional
- **Description:** - **[RISK-016-BR-003]** Security-critical crates (`devs-mcp`, `devs-adapters`, `devs-checkpoint`, `devs-core` template resolution) MUST have a completed `code-review` workflow run with `critical_findings: 0` and `high_findings: 0` in `docs/reviews/` before the MVP milestone is declared. A run with any critical or high finding must have a corresponding remediation commit before the finding is waived.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-016-BR-004] [8_RISKS-REQ-303]** Requirement RISK-016-BR-004
- **Type:** Functional
- **Description:** - **[RISK-016-BR-004]** If an AI review agent produces a structured output with `critical_findings > 0`, the `code-review` workflow MUST NOT advance to `Completed`; it transitions via branch predicate to `halt-for-remediation`. The developer MUST resolve all critical findings before the crate is merged.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-016-BR-005] [8_RISKS-REQ-304]** Requirement RISK-016-BR-005
- **Type:** Functional
- **Description:** - **[RISK-016-BR-005]** A `code-review` workflow run MUST use a different agent `tool` than the one that implemented the code being reviewed. If the implementing agent was `claude`, the review pool MUST select `gemini` or `opencode`. This cross-agent review policy is documented in `.devs/workflows/code-review.toml` via a dedicated `review-pool` configuration.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-016-01] [8_RISKS-REQ-305]** Requirement AC-RISK-016-01
- **Type:** Technical
- **Description:** - **[AC-RISK-016-01]** Every crate in the Cargo workspace has a corresponding `docs/adr/NNNN-<crate-name>-design.md` (or a referenced ADR covering its design) committed before the crate's first merge to `main`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-016-02] [8_RISKS-REQ-306]** Requirement AC-RISK-016-02
- **Type:** Technical
- **Description:** - **[AC-RISK-016-02]** `cargo clippy --workspace --all-targets -- -D warnings` exits 0 on all crates at every commit; verified by `presubmit-linux`, `presubmit-macos`, `presubmit-windows` CI jobs.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-016-03] [8_RISKS-REQ-307]** Requirement AC-RISK-016-03
- **Type:** Technical
- **Description:** - **[AC-RISK-016-03]** `devs-mcp`, `devs-adapters`, `devs-checkpoint`, and `devs-core` template resolution each have a completed `code-review` workflow run recorded as JSON in `docs/reviews/<crate>-<date>.json` with `critical_findings: 0` before the MVP milestone.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-016-04] [8_RISKS-REQ-308]** Requirement AC-RISK-016-04
- **Type:** Technical
- **Description:** - **[AC-RISK-016-04]** A `code-review` workflow run with `critical_findings > 0` in the structured output does NOT transition to `Completed`; it transitions to `halt-for-remediation` via the branch predicate; verified by an E2E test injecting a mock review output with `critical_findings: 1`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-016-05] [8_RISKS-REQ-309]** Requirement AC-RISK-016-05
- **Type:** Technical
- **Description:** - **[AC-RISK-016-05]** `./do lint` scans `docs/adr/*.md` for references to non-existent crate names (names not appearing in `Cargo.toml` workspace members) and exits non-zero if any are found.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-024] [8_RISKS-REQ-310]** Requirement RISK-024
- **Type:** Technical
- **Description:** [RISK-024]** GitLab CI Unavailability
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MIT-024] [8_RISKS-REQ-311]** Requirement MIT-024
- **Type:** Technical
- **Description:** [MIT-024] Mitigation:
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-024-BR-001] [8_RISKS-REQ-312]** Requirement RISK-024-BR-001
- **Type:** Functional
- **Description:** - **[RISK-024-BR-001]** `./do ci` MUST exit non-zero if any of the three CI jobs (`presubmit-linux`, `presubmit-macos`, `presubmit-windows`) exit with a non-zero status. A pipeline that has two passing jobs and one failing job is a CI failure; the merge to `main` is blocked.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-024-BR-002] [8_RISKS-REQ-313]** Requirement RISK-024-BR-002
- **Type:** Functional
- **Description:** - **[RISK-024-BR-002]** `./do ci` MUST exit non-zero if the pipeline does not complete (all three jobs reach terminal status) within 30 minutes of pipeline creation. The exit message is `"ci_timeout: pipeline did not complete within 30 minutes"`. The temporary branch is deleted before exit regardless of timeout.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-024-BR-003] [8_RISKS-REQ-314]** Requirement RISK-024-BR-003
- **Type:** Functional
- **Description:** - **[RISK-024-BR-003]** `.gitlab-ci.yml` MUST be validated by `yamllint .gitlab-ci.yml` in `./do lint` on every invocation. An invalid pipeline YAML causes `./do lint` to exit non-zero before any other check runs.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-024-BR-004] [8_RISKS-REQ-315]** Requirement RISK-024-BR-004
- **Type:** Functional
- **Description:** - **[RISK-024-BR-004]** CI artifact paths (`target/coverage/report.json`, `target/presubmit_timings.jsonl`, `target/traceability.json`) MUST be committed to GitLab CI artifacts with `expire_in: 7 days` and `when: always`. Artifacts from failed pipelines are preserved to enable post-failure diagnosis. This is specified in `.gitlab-ci.yml` and verified by `./do lint` via YAML parsing.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-024-01] [8_RISKS-REQ-316]** Requirement AC-RISK-024-01
- **Type:** Technical
- **Description:** - **[AC-RISK-024-01]** `./do ci` exits non-zero if any of the three CI jobs (`presubmit-linux`, `presubmit-macos`, `presubmit-windows`) fail; verified by a mock that returns a failed pipeline status for one job.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-024-02] [8_RISKS-REQ-317]** Requirement AC-RISK-024-02
- **Type:** Technical
- **Description:** - **[AC-RISK-024-02]** `./do presubmit` on Linux produces the same pass/fail result as the `presubmit-linux` CI job for the same source tree (same commit, same Rust version, same `./do setup` outcome).
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-024-03] [8_RISKS-REQ-318]** Requirement AC-RISK-024-03
- **Type:** Technical
- **Description:** - **[AC-RISK-024-03]** `yamllint .gitlab-ci.yml` in `./do lint` exits 0; `.gitlab-ci.yml` is syntactically valid YAML and contains all three required job names (`presubmit-linux`, `presubmit-macos`, `presubmit-windows`).
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-024-04] [8_RISKS-REQ-319]** Requirement AC-RISK-024-04
- **Type:** Technical
- **Description:** - **[AC-RISK-024-04]** CI artifacts (`target/coverage/report.json`, `target/presubmit_timings.jsonl`, `target/traceability.json`) are present in GitLab CI artifacts for both passing and failing pipeline runs (verified by checking `when: always` in `.gitlab-ci.yml`).
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-024-05] [8_RISKS-REQ-320]** Requirement AC-RISK-024-05
- **Type:** Technical
- **Description:** - **[AC-RISK-024-05]** `./do ci` deletes the temporary branch even when the pipeline times out or fails; verified by checking that no `devs-ci-*` branches exist on the remote after `./do ci` returns.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-DATA-001] [8_RISKS-REQ-321]** Requirement FB-DATA-001
- **Type:** Technical
- **Description:** [FB-DATA-001]** `active_count` in `fallback-registry.json` MUST equal the exact count of entries where `status == "Active"`. Any mismatch is a fatal lint error that blocks `./do presubmit`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-DATA-002] [8_RISKS-REQ-322]** Requirement FB-DATA-002
- **Type:** Technical
- **Description:** [FB-DATA-002]** Every `adr_path` value for a non-`Retired` entry MUST reference a file that exists at the time `./do presubmit` runs. A missing ADR file is a fatal lint error.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-DATA-003] [8_RISKS-REQ-323]** Requirement FB-DATA-003
- **Type:** Technical
- **Description:** [FB-DATA-003]** A `fallback_id` MUST NOT appear more than once in the registry with a non-`Retired` status. Duplicate active entries are a fatal lint error.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-DATA-004] [8_RISKS-REQ-324]** Requirement FB-DATA-004
- **Type:** Technical
- **Description:** [FB-DATA-004]** `commit_sha` MUST be non-empty for any entry with `status == "Active"` that has `activated_at` more than 24 hours in the past. A stale empty `commit_sha` is a lint warning.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-SM-001] [8_RISKS-REQ-325]** Requirement FB-SM-001
- **Type:** Technical
- **Description:** [FB-SM-001]** The only valid transition into `Active` is from `Implementing`. A fallback MUST NOT be recorded as `Active` in `fallback-registry.json` without a corresponding implementation commit.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-SM-002] [8_RISKS-REQ-326]** Requirement FB-SM-002
- **Type:** Technical
- **Description:** [FB-SM-002]** Transition from `Extended` to `PRD_Amendment` requires a formal amendment document committed to `docs/plan/specs/` with an updated `[RISK-NNN]` entry covering the fallback-as-permanent-risk.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-SM-003] [8_RISKS-REQ-327]** Requirement FB-SM-003
- **Type:** Technical
- **Description:** [FB-SM-003]** `Retired` is a terminal state. A retired `fallback_id` MUST NOT be reused for a new activation of the same fallback. A new activation creates a new FAR with a new sequential ADR number.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-SM-004] [8_RISKS-REQ-328]** Requirement FB-SM-004
- **Type:** Technical
- **Description:** [FB-SM-004]** When `active_count` reaches 3, any new `Triggered` state MUST enter `Blocked` first. The `Blocked` state persists until an architecture review session clears it and a slot becomes available (another fallback is retired).
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-SM-005] [8_RISKS-REQ-329]** Requirement FB-SM-005
- **Type:** Technical
- **Description:** [FB-SM-005]** Emergency rollback from `Active` directly to `Inactive` is permitted when a fallback makes the trigger condition worse (see EC-FB-004). The FAR frontmatter is updated to `status = "Retired"` and a `## Retirement Notes` section documents the rollback.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-PROTO-001] [8_RISKS-REQ-330]** Requirement FB-PROTO-001
- **Type:** Technical
- **Description:** [FB-PROTO-001]** Steps 5 and 6 MUST produce separate git commits. A combined commit containing both the FAR and any implementation code is detected and rejected by `./do lint` (scans for `docs/adr/NNNN-fallback-*.md` and implementation files in the same diff).
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-PROTO-002] [8_RISKS-REQ-331]** Requirement FB-PROTO-002
- **Type:** Technical
- **Description:** [FB-PROTO-002]** If the trigger condition self-resolves before step 5 (FAR commit), the activation is cancelled. Any partially-drafted FAR file MUST be deleted (not stashed, not committed). `fallback-registry.json` MUST NOT be updated.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-PROTO-003] [8_RISKS-REQ-332]** Requirement FB-PROTO-003
- **Type:** Technical
- **Description:** [FB-PROTO-003]** `commit_sha` in the FAR frontmatter MUST be updated within 24 hours of the implementation commit. After 24 hours, a stale `commit_sha = ""` is reported as a lint warning by `./do presubmit`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-RET-001] [8_RISKS-REQ-333]** Requirement FB-RET-001
- **Type:** Technical
- **Description:** [FB-RET-001]** A fallback that required PRD amendment (FB-001) or architecture review (FB-005) MUST have the corresponding amendment or review document updated to reflect retirement before the retirement commit is merged.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-RET-002] [8_RISKS-REQ-334]** Requirement FB-RET-002
- **Type:** Technical
- **Description:** [FB-RET-002]** A fallback in `Retiring` state MUST complete retirement within one sprint. If retirement is not completed within one sprint, the entry reverts to `Active` status in the registry with `expected_retirement_sprint` updated to the next sprint.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-RET-003] [8_RISKS-REQ-335]** Requirement FB-RET-003
- **Type:** Technical
- **Description:** [FB-RET-003]** Retired FAR files MUST NOT be deleted. They are permanent historical records. `./do lint` verifies that any `Retired` entry in `fallback-registry.json` has a corresponding readable `adr_path` file.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-BR-001] [8_RISKS-REQ-336]** Requirement FB-BR-001
- **Type:** Functional
- **Description:** - **[FB-BR-001]** A fallback MUST NOT be activated without a corresponding FAR committed to `docs/adr/`. The FAR commit MUST precede the implementation commit. A combined single commit containing both FAR and implementation code is detected and rejected by `./do lint`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-BR-002] [8_RISKS-REQ-337]** Requirement FB-BR-002
- **Type:** Functional
- **Description:** - **[FB-BR-002]** Pre-approved fallbacks (marked "Yes" in §5.1) do NOT require leadership approval before activation, but MUST produce a FAR in `docs/adr/` before any implementation code is written.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-BR-003] [8_RISKS-REQ-338]** Requirement FB-BR-003
- **Type:** Functional
- **Description:** - **[FB-BR-003]** Fallbacks marked "Requires PRD amendment" or "Requires architecture review" MUST NOT be activated until the amendment or review is approved, documented, and committed to the repository.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-BR-004] [8_RISKS-REQ-339]** Requirement FB-BR-004
- **Type:** Functional
- **Description:** - **[FB-BR-004]** At most 3 fallbacks may have `status == "Active"` simultaneously. A 4th trigger enters `Blocked` state and requires architecture review before activation. `./do presubmit` exits non-zero if `active_count > 3`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-BR-005] [8_RISKS-REQ-340]** Requirement FB-BR-005
- **Type:** Functional
- **Description:** - **[FB-BR-005]** `./do presubmit` MUST emit one `WARN:` line per `Active` fallback entry. If `active_count > 0` and no WARN lines appear, that is a test failure (`AC-FB-003`).
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-BR-006] [8_RISKS-REQ-341]** Requirement FB-BR-006
- **Type:** Functional
- **Description:** - **[FB-BR-006]** An `Active` fallback that has passed its `expected_retirement_sprint` without retirement enters the `Extended` state. Two sprints in `Extended` triggers the `PRD_Amendment` transition, requiring a formal amendment before any further work on the affected component.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-BR-007] [8_RISKS-REQ-342]** Requirement FB-BR-007
- **Type:** Functional
- **Description:** - **[FB-BR-007]** `fallback-registry.json` is the authoritative source for `active_count`. FAR frontmatter is the authoritative source for individual fallback metadata. Any inconsistency between the two is a fatal lint error.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-BR-008] [8_RISKS-REQ-343]** Requirement FB-BR-008
- **Type:** Functional
- **Description:** - **[FB-BR-008]** Retiring a fallback that lowered a quality gate MUST restore the gate to its original threshold. The threshold restoration and implementation revert MUST be in the same commit.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-BR-009] [8_RISKS-REQ-344]** Requirement FB-BR-009
- **Type:** Functional
- **Description:** - **[FB-BR-009]** Retired FAR files (those with `status = "Retired"` in frontmatter) MUST NOT be deleted from `docs/adr/`. They are permanent historical records. `./do lint` verifies that every `Retired` entry in `fallback-registry.json` has a readable `adr_path`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-BR-010] [8_RISKS-REQ-345]** Requirement FB-BR-010
- **Type:** Functional
- **Description:** - **[FB-BR-010]** Fallback implementations MUST be confined to the minimum scope described in §5.3 for the specific fallback. A fallback MUST NOT introduce new external crate dependencies or new public API surface without explicit PRD amendment.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-BR-011] [8_RISKS-REQ-346]** Requirement FB-BR-011
- **Type:** Functional
- **Description:** - **[FB-BR-011]** The `## Trigger` section in every FAR MUST reference at least one numeric metric value (e.g., seconds, count, percentage). Qualitative-only descriptions are rejected by the `./do lint` check that scans for digits in the `## Trigger` section body.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FB-BR-012] [8_RISKS-REQ-347]** Requirement FB-BR-012
- **Type:** Functional
- **Description:** - **[FB-BR-012]** Platform-conditional fallbacks (FB-002, FB-008) MUST use `#[cfg(windows)]` or equivalent compile-time guards. Runtime `if cfg!(target_os = "windows")` guards are permitted only when compile-time guards are insufficient. Catch-all implementations that alter Linux/macOS behavior are prohibited.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-FB-001] [8_RISKS-REQ-348]** Requirement AC-FB-001
- **Type:** Technical
- **Description:** - **[AC-FB-001]** `./do presubmit` exits non-zero when `fallback-registry.json` `active_count` field does not equal the count of entries with `status == "Active"` in the `fallbacks` array.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-FB-002] [8_RISKS-REQ-349]** Requirement AC-FB-002
- **Type:** Technical
- **Description:** - **[AC-FB-002]** `./do presubmit` exits non-zero when any non-`Retired` entry's `adr_path` references a file that does not exist on disk.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-FB-003] [8_RISKS-REQ-350]** Requirement AC-FB-003
- **Type:** Technical
- **Description:** - **[AC-FB-003]** `./do presubmit` stdout contains exactly one `WARN: Fallback FB-NNN is ACTIVE` line per entry with `status == "Active"` in `fallback-registry.json`. Zero WARNs when `active_count == 0`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-FB-004] [8_RISKS-REQ-351]** Requirement AC-FB-004
- **Type:** Technical
- **Description:** - **[AC-FB-004]** `./do presubmit` exits non-zero when `fallback-registry.json` `active_count` exceeds 3.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-FB-005] [8_RISKS-REQ-352]** Requirement AC-FB-005
- **Type:** Technical
- **Description:** - **[AC-FB-005]** (FB-002) `get_pool_state` MCP response for each agent includes `"pty_available": false` when the `#[cfg(windows)]` PTY fallback code path is compiled in. On Linux/macOS with the same config, `"pty_available": true` for adapters with `pty = true`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-FB-006] [8_RISKS-REQ-353]** Requirement AC-FB-006
- **Type:** Technical
- **Description:** - **[AC-FB-006]** (FB-002) A stage definition with `pty = true` returns `StageStatus::Failed` with a `stage.failed` audit event containing `"failure_reason": "pty_unavailable"` when the Windows PTY fallback is active. No retry is performed.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-FB-007] [8_RISKS-REQ-354]** Requirement AC-FB-007
- **Type:** Technical
- **Description:** - **[AC-FB-007]** (FB-003) `target/coverage/report.json` QG-002 entry has `"threshold_pct": 77.0` and `"exception": "FB-003"` when a FB-003 `Active` entry exists in `fallback-registry.json`. When FB-003 is `Retired`, QG-002 threshold is `80.0` with no `"exception"` field.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-FB-008] [8_RISKS-REQ-355]** Requirement AC-FB-008
- **Type:** Technical
- **Description:** - **[AC-FB-008]** (FB-008) `devs security-check` on a platform where `set_secure_permissions` emits the Windows WARN path reports `SEC-FILE-PERM-WINDOWS` with `"status": "warn"` (not `"error"`) and exits with code 1.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-FB-009] [8_RISKS-REQ-356]** Requirement AC-FB-009
- **Type:** Technical
- **Description:** - **[AC-FB-009]** (FB-009) MCP `POST /mcp/v1/call` without an `Authorization` header returns HTTP 401 with body `{"result": null, "error": "permission_denied: valid bearer token required"}` when `mcp_require_token` is set in `ServerConfig`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-FB-010] [8_RISKS-REQ-357]** Requirement AC-FB-010
- **Type:** Technical
- **Description:** - **[AC-FB-010]** (FB-009) MCP `POST /mcp/v1/call` with `Authorization: Bearer <correct-token>` returns HTTP 200 with a valid JSON-RPC response when `mcp_require_token` is set.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-FB-011] [8_RISKS-REQ-358]** Requirement AC-FB-011
- **Type:** Technical
- **Description:** - **[AC-FB-011]** (FB-009) The value of `mcp_require_token` does NOT appear as a literal string in any `tracing` log output at any level, including DEBUG and TRACE. All occurrences appear as `"[REDACTED]"`.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-FB-012] [8_RISKS-REQ-359]** Requirement AC-FB-012
- **Type:** Technical
- **Description:** - **[AC-FB-012]** `./do fallback-regen` produces a valid `fallback-registry.json` (parseable by `jq`, passes FB-DATA-001–004 checks) from FAR frontmatter in `docs/adr/` when the registry file is absent or deleted.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-FB-013] [8_RISKS-REQ-360]** Requirement AC-FB-013
- **Type:** Technical
- **Description:** - **[AC-FB-013]** A FAR frontmatter with `status = "Active"`, `commit_sha = ""`, and `activated_at` set to a date > 24 hours in the past causes `./do presubmit` to emit a `WARN:` line containing `"stale commit_sha"` for that fallback.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-FB-014] [8_RISKS-REQ-361]** Requirement AC-FB-014
- **Type:** Technical
- **Description:** - **[AC-FB-014]** After retiring a fallback (setting `status = "Retired"` in `fallback-registry.json` and the corresponding FAR), `./do presubmit` `active_count` reflects the decremented value and no WARN line appears for the retired fallback.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-FB-015] [8_RISKS-REQ-362]** Requirement AC-FB-015
- **Type:** Technical
- **Description:** - **[AC-FB-015]** (FB-002, FB-008) Platform-conditional fallback code compiles without the fallback path when targeting `x86_64-unknown-linux-gnu`. Verified by `cargo build --workspace --target x86_64-unknown-linux-gnu` passing without `#[cfg(windows)]`-gated code being included.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-006] [8_RISKS-REQ-363]** Requirement RISK-BR-006
- **Type:** Functional
- **Description:** - **[RISK-BR-006]** Any new risk with `severity_score >= 6` MUST block the current sprint's first merge until its mitigation is designed and its covering test is written (even if the test fails — Red phase is sufficient).
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-007] [8_RISKS-REQ-364]** Requirement RISK-BR-007
- **Type:** Functional
- **Description:** - **[RISK-BR-007]** Risk statuses are reviewed at the start of each development sprint by reading `target/traceability.json` and checking that all `severity_score >= 6` risks have non-zero `covering_tests` entries.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-008] [8_RISKS-REQ-365]** Requirement RISK-BR-008
- **Type:** Functional
- **Description:** - **[RISK-BR-008]** Server startup security checks (bind address, credential exposure, file permissions, webhook TLS) MUST be verified by passing integration tests in `./do test` that confirm correct WARN log events are emitted for each misconfiguration. Any failing security check test blocks the test step.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-009] [8_RISKS-REQ-366]** Requirement RISK-BR-009
- **Type:** Functional
- **Description:** - **[RISK-BR-009]** A contingency fallback that has been `Active` for more than two sprints MUST have a dedicated `[RISK-NNN]` entry created for the fallback itself (meta-risk: fallback becomes permanent).
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[RISK-BR-010] [8_RISKS-REQ-367]** Requirement RISK-BR-010
- **Type:** Functional
- **Description:** - **[RISK-BR-010]** The risk matrix in §1 MUST be kept current. Adding a mitigation section in §2/§3/§4 without a corresponding matrix row is an error caught by `./do lint` scanning for `[MIT-NNN]` tags without matching `[RISK-NNN]` entries.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None

## Referenced Requirements

### **[SEC-043]** Referenced Requirement SEC-043
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[3_PRD-BR-016]** Referenced Requirement 3_PRD-BR-016
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[2_TAS-REQ-002]** Referenced Requirement 2_TAS-REQ-002
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[SEC-009]** Referenced Requirement SEC-009
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[SEC-001]** Referenced Requirement SEC-001
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[A-Z]** Referenced Requirement A-Z
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[2_TAS-BR-021]** Referenced Requirement 2_TAS-BR-021
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[A-Z0-9-]** Referenced Requirement A-Z0-9-
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[3_PRD-BR-024]** Referenced Requirement 3_PRD-BR-024
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[SEC-033]** Referenced Requirement SEC-033
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[SEC-040]** Referenced Requirement SEC-040
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[2_TAS-BR-013]** Referenced Requirement 2_TAS-BR-013
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[SEC-006]** Referenced Requirement SEC-006
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MCP-DBG-BR-015]** Referenced Requirement MCP-DBG-BR-015
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[2_TAS-BR-019]** Referenced Requirement 2_TAS-BR-019
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[3_PRD-BR-023]** Referenced Requirement 3_PRD-BR-023
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MCP-DBG-BR-016]** Referenced Requirement MCP-DBG-BR-016
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[SEC-036]** Referenced Requirement SEC-036
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[3_PRD-BR-043]** Referenced Requirement 3_PRD-BR-043
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[SEC-020-BR-002]** Referenced Requirement SEC-020-BR-002
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[SEC-037]** Referenced Requirement SEC-037
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[1_PRD-BR-001]** Referenced Requirement 1_PRD-BR-001
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[2_TAS-REQ-112]** Referenced Requirement 2_TAS-REQ-112
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[FEAT-BR-001]** Referenced Requirement FEAT-BR-001
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[2_TAS-BR-022]** Referenced Requirement 2_TAS-BR-022
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[AC-RISK-NNN-NN]** Referenced Requirement AC-RISK-NNN-NN
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[3_PRD-BR-021]** Referenced Requirement 3_PRD-BR-021
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[2_TAS-REQ-109]** Referenced Requirement 2_TAS-REQ-109
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[UI-DES-002]** Referenced Requirement UI-DES-002
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[MCP-057]** Referenced Requirement MCP-057
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[UI-ROUTE-023]** Referenced Requirement UI-ROUTE-023
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[0-9]** Referenced Requirement 0-9
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
### **[SEC-066]** Referenced Requirement SEC-066
- **Type:** Technical
- **Description:** Referenced requirement from another document or internal reference.
- **Source:** Risks and Mitigation (docs/plan/specs/8_risks_mitigation.md)
- **Dependencies:** None
