# Adversarial Review: devs Spec Documents

**Reviewer Role:** Devil's Advocate
**Date:** 2026-03-11
**Source of Truth:** Original project description (project-description.md)

---

## Review Methodology

Each spec and research document was compared against the original project description. Every element not traceable to that document was classified as one of:

- **JUSTIFIED** — reasonable implementation detail or clarification not requiring explicit origin-doc mention
- **SCOPE CREEP** — adds features, personas, requirements, or complexity with no basis in original description; **edited/removed**
- **NEEDS CLARIFICATION** — potentially valid but origin is ambiguous; flagged, not removed

---

## 1. `docs/plan/research/market_research.md`

### SCOPE CREEP (removed)

**1a. Market Size Estimation (TAM/SAM/SOM)**
Section "Market Size Estimation (TAM, SAM, SOM)" projected $8–15B TAM, $1.2–2.5B SAM, $12–20M ARR Year 3. The original description defines a personal productivity tool for one developer. No commercial revenue targets exist in the original. Pure business speculation with no engineering relevance.
**Action:** Section removed entirely.

**1b. Export Control geo-blocking**
Line in §4 "Export Control and Sanctions Compliance" stated: "implement geo-blocking for unsupported regions in commercial deployments." The original description has no commercial deployment or geo-blocking requirement.
**Action:** Geo-blocking sentence removed; rest of regulatory information section retained.

**1c. Business Models & Monetization Strategies**
Entire "Potential Business Models & Monetization Strategies" section described Open-Core SaaS tiers ($5K–$25K/month), Professional/Enterprise pricing tiers, SSO/SAML, SLA guarantees. None of these exist in the original description. Original non-goals explicitly exclude external secrets managers and client authentication; adding commercial SaaS tiers contradicts the solo-developer scope.
**Action:** Section removed entirely.

**1d. Go-to-Market (GTM) Recommendations**
"Go-to-Market (GTM) Recommendations" described design partner programs, SOC 2 Type II certification, Fortune 2000 targets, 3 FTE direct sales by Year 2. The original description is a personal development tool, not a commercial product with a sales motion.
**Action:** Section removed entirely.

### JUSTIFIED

- Executive Summary and core value proposition: aligned with original architecture
- Competitive Landscape Overview: accurate description of competing tools relative to devs
- Regulatory/Compliance Considerations (§1, §2, §3): informational context relevant to positioning decisions; no mandatory implementation requirements added
- Industry Trends (MCP emergence, Rust adoption, multi-agent shift): market context supporting the original architecture choices
- References & Citations: retained

---

## 2. `docs/plan/research/user_research.md`

### SCOPE CREEP (removed)

**2a. Persona 2: Jordan Rivera — Mid-Market Engineering Team Lead**
Detailed persona for a 200-engineer SaaS company lead with SLA guarantees, design partner discounts, bi-weekly vendor product reviews. The original description has exactly ONE user: the sole developer of devs. Adding commercial team-lead personas introduces assumptions about multi-tenant deployment, paid licensing, and vendor-support relationships that have no basis in the original.
**Action:** Persona 2 detailed profile removed. Target Audience Segment 2 description (commercial adopter summary) also removed.

**2b. Persona 3: Dr. Elena Vasquez — Enterprise R&D Innovation Lead**
Fortune 500 financial services director with SOC 2 Type II, RBAC, EU AI Act compliance requirements, SSO/SAML. The original description has no enterprise compliance, Fortune 500, or regulated industry requirements.
**Action:** Persona 3 detailed profile removed. Target Audience Segment 3 description also removed.

**2c. Journey 2: Jordan Rivera — Team Orchestration & Vendor Neutrality**
Mermaid sequence diagram showing multi-developer shared pool management, "team-dashboard" tab, PDF compliance exports, Slack incident channels. The original description has no multi-user, team governance, PDF export, or webhook-to-Slack requirements.
**Action:** Journey 2 removed entirely.

**2d. Journey 3: Dr. Elena Vasquez — Enterprise Compliance & Auditability**
Journey included non-MVP CLI commands (`devs logs --export-format=pdf`, `devs submit --from-snapshot=...`, `devs export compliance-report --framework=SOC2-Type-II`). None of these commands appear in the original MVP CLI list. Also referenced MCP port 8765 (inconsistent with port 7891 defined in 2_tas.md).
**Action:** Journey 3 removed entirely.

### JUSTIFIED

- Persona 1: Alex Chen — The Agentic Developer: directly matches the original description's sole user
- Journey 1: Alex Chen workflow: accurate depiction of the original submit/DAG/MCP flow
- Pain points §3 and §4: vendor lock-in, audit trails, rate-limit fallback — all traceable to original
- User pain points linked to Persona 1 pain points: retained

---

## 3. `docs/plan/specs/4_user_features.md`

### SCOPE CREEP (removed)

**3a. FEAT-BR-010: Mandatory task_state.json Write**
Rule stated: "An Observing/Controlling Agent MUST write `task_state.json` to `.devs/agent-state/<session-id>/task_state.json` before submitting any run and after each run reaches a terminal state." The original description does not specify any agent-side state file protocol. This mandates behavior of external AI clients (Claude Code, Gemini CLI, etc.) that the server cannot enforce and the original description never requires.
**Action:** FEAT-BR-010 removed. EC-A-005 (edge case testing the recovery behavior that depended on this file) also removed.

### NEEDS CLARIFICATION

- Duplicate rule ID: FEAT-BR-010 appeared twice in the file — once for the removed task_state.json requirement and once for run slug uniqueness (line ~5342). The second FEAT-BR-010 (slug uniqueness) is valid and retained.

### JUSTIFIED

- All other FEAT-BR-* rules: traceable to original description's CLI commands and MCP behaviors
- Agent role model (Orchestrated vs. Observing): natural implementation of the original's "AI agents as both executors and orchestrators" concept
- EC-A-001 through EC-A-004: edge cases for agent-server interaction, grounded in original

---

## 4. `docs/plan/specs/5_security_design.md`

### SCOPE CREEP (removed)

**4a. Section 2.7: `devs security-check` CLI Command Contract**
Entire §2.7 specified a standalone `devs security-check` CLI subcommand that runs offline (no running server required), reads `devs.toml` directly, performs 7 config checks, outputs JSON report, exits with specific codes. The original MVP CLI list is: `submit`, `list`, `status`, `logs`, `cancel`, `pause`, `resume`, plus `devs project add`. `security-check` is not in this list.

The startup security checks (SEC-058) — which emit WARN logs when bound to non-loopback, credentials found in TOML, etc. — ARE in scope as server behavior. The scope creep was the additional standalone CLI command.

**Action:** §2.7 removed. SEC-059 rule removed from §4.2. Associated acceptance criteria (AC-SEC-2-001, AC-SEC-2-002, AC-SEC-2-006, AC-SEC-2-014, AC-SEC-2-019, AC-SEC-2-022) removed from §2.8. TOC entry, reading guide reference, and quick-reference index entry for §2.7 removed. AC-SEC-4-012 removed from §4.9. References in §1 components table and SEC-ATK-004 updated.

The §4.2 SEC-059 duplicate CLI contract (gRPC-connected variant) also removed. Edge cases EC-SEC-096/EC-SEC-099 for the removed command removed.

### RESOLVED

**4b. SEC-031/SEC-033 — TLS for Non-Loopback**
The original says "designed for local/trusted-network use in MVP". SEC-031/033 have been updated to make TLS **optional** for non-loopback binds: the server starts successfully but emits a structured `WARN` (`check_id: "SEC-TLS-MISSING"`) informing the operator that plaintext over a non-loopback interface is insecure. This aligns with the original's passive statement and keeps the door open for trusted-network deployments without forcing a PKI setup.
**Action:** SEC-031/033 updated; SEC-BR-3-001 and AC-SEC-3-001 updated to match. EC-SEC-001 updated to expect a WARN rather than a startup refusal. Resolved.

### JUSTIFIED

- Threat model (§1): accurate description of attack surface for the original architecture
- Filesystem MCP access control (§2.3): direct implementation of Glass-Box MCP from original
- Webhook signing (§2.4): traceable to original's webhook delivery feature
- TLS configuration (§3.3): reasonable for the networking model
- `Redacted<T>`, `BoundedString<N>`, `EnvKey` types: implementation details of original's API key management
- Startup security checks SEC-058: aligned with original's stated security design

---

## 5. `docs/plan/specs/6_ui_ux_architecture.md`

### JUSTIFIED

- TUI/CLI/MCP bridge architecture: directly derived from original's "headless gRPC server + TUI + CLI + MCP" description
- Crate dependency constraints: reasonable implementation detail for the original's Rust/Cargo architecture
- Discovery protocol and `DEVS_SERVER` env var: consistent with original's "env vars can override config values" pattern
- Split-pane TUI layout: sensible implementation of original's TUI requirement

No scope creep identified in this document.

---

## 6. `docs/plan/specs/7_ui_ux_design.md`

### NEEDS CLARIFICATION

**6a. Mandatory `strings.rs` Architecture with Lint Enforcement (UI-DES-PHI-001 to UI-DES-PHI-026)**
The spec mandates that ALL user-visible strings be defined as `pub const &'static str` in a `strings.rs` module per crate, with automated lint enforcement in `./do lint`. UI-DES-010 states this is "enabling future i18n extraction without source changes."

The original says "English-only at MVP" but does not mention i18n preparation or the `strings.rs` architecture pattern. This is over-specification of implementation style — it adds a lint gate enforcing clean code conventions not required by the original. However, having a `strings.rs` module is defensible as a single implementation standard that keeps the codebase consistent.

**Decision:** Flagged as over-engineering but not removed. The intent (clean separation of display strings) is reasonable even if the enforcement overhead is higher than necessary for a solo-developer project. Revisit if lint maintenance burden becomes significant.

### JUSTIFIED

- Design token system (colors, spacing, typography): implementation detail of the TUI requirement
- Widget component hierarchy: natural decomposition of the original's TUI description
- 4-tab layout (Dashboard, Logs, Debug, Pools): directly from original's TUI design
- Stage status 4-char labels (`PEND`, `WAIT`, `ELIG`, `RUN`, `PAUS`, `DONE`, `FAIL`, `TIME`, `CANC`): reasonable representation of the original's workflow state model

---

## 7. `docs/plan/specs/8_risks_mitigation.md`

### SCOPE CREEP (removed)

**7a. RISK-017 — AI Agent CLI Ecosystem Consolidation**
Risk category: Market. Concern: agents like Claude Code might be superseded, making the multi-adapter approach obsolete. This is a business/product risk about market dynamics, not a software engineering risk. The original description does not consider market adoption scenarios.
**Action:** RISK-017 row removed from risk matrix. Full §4 "Market & Adoption Risks" section removed (was lines 2313–2988), including RISK-017, 018, 019, 020 mitigation sections and §4.4 aggregate acceptance criteria.

**7b. RISK-018 — Competitor CI/CD Tools Absorbing AI Workflow Niche**
Risk category: Market. Concern: GitHub Actions or GitLab CI implements native AI support. Not a software engineering risk. The original description accepts that devs will coexist with CI/CD tools.
**Action:** Removed as part of §4 removal.

**7c. RISK-019 — Weak Adoption Due to Rust-Only Workflow Authoring**
Risk category: Market. Concern: TOML/YAML approach needed because users won't write Rust. This is a product adoption concern, not a development risk. The original description already specifies TOML as the workflow definition format — this risk adds nothing architecturally.
**Action:** Removed as part of §4 removal. RISK-019 monitoring row (which referenced `devs validate-workflow` offline check) also removed.

**7d. RISK-020 — gRPC Transport Friction for Web Integrations**
Risk category: Market. Concern: gRPC might limit web client adoption. The original description explicitly chose gRPC and defines the MCP HTTP interface as the web-accessible layer. This was a design decision, not a risk.
**Action:** Removed as part of §4 removal.

### JUSTIFIED

- RISK-001 through RISK-016: Technical and operational risks traceable to original
- RISK-021 through RISK-025: Technical risks (fan-out resource exhaustion, MCP bridge loss, coverage measurement, CI unavailability, snapshot immutability): all traceable to original implementation choices
- §2 Technical Risks mitigations: direct implementations of original's architecture
- §3 Operational Risks mitigations: consistent with original's development approach
- §5 Contingency Fallbacks: FB-001 through FB-010 are pre-approved deviations, mostly justified. Note: FB-008 references `devs security-check` for Windows file permission warnings — updated to reference startup WARN logs instead.

---

## 8. `docs/plan/specs/9_project_roadmap.md`

### SCOPE CREEP (removed/updated)

**8a. `devs validate-workflow` CLI Command**
The standalone `devs validate-workflow` subcommand appeared in: PTC-4-004 (bootstrap gate), pre-bootstrap checklist, state diagrams, ROAD-BR-402, AC-ROAD-P4-001, edge case tables, dependency declarations, and the acceptance criteria index. This command is not in the original MVP CLI list.

Workflow validation IS a server behavior — the server validates TOML on submit. The scope creep was the offline CLI command that validated without a running server.

**Action:** All occurrences of `devs validate-workflow` updated to reference "accepted by `devs submit`" or "syntactically valid" where appropriate. ROAD-BR-402 updated. AC-ROAD-P4-001 updated. State diagrams updated. Edge cases updated to use `devs submit`.

**8b. `devs security-check` in Roadmap**
The roadmap referenced `devs security-check` in SO-3 (Security Baseline objective), PTC-5-003 (Phase 5 gate), ROAD-021 commands list, ROAD-BR-310, JSON output table, Phase 5 deliverables, AC-ROAD-P5-004, state diagram, verification sequence, MVP checklist table, AC-ROAD-CHECK-006, and acceptance criteria index.

**Action:** All occurrences removed or updated. SO-3 updated to reference `cargo audit` only. PTC-5-003 removed. `security-check` removed from ROAD-021 commands list. ROAD-BR-310 removed. JSON output table entry removed. Phase 5 deliverables updated. AC-ROAD-P5-004 removed. State diagram updated. Verification sequence updated. MVP checklist security-check row removed. AC-ROAD-CHECK-006 removed. AC-ROAD-P5-004 entry removed from index.

**8c. `task_state.json` Schema and Mandatory Agent Write Protocol**
A detailed `task_state.json` JSON schema was specified as mandatory for agents operating in the agentic development loop (ROAD-BR-406, ROAD-024 deliverables, `get_task_state`/`write_task_state` MCP tools, mermaid flowchart). This is a carry-forward from the removed FEAT-BR-010 in 4_user_features.md.

**Action:** `task_state.json` schema section removed. ROAD-BR-406 removed. `get_task_state` and `write_task_state` MCP tool entries removed. State diagram and flowchart diagram references updated. ROAD-024 deliverables updated. Edge case for mid-task MCP bridge loss updated to use `list_runs` instead.

### JUSTIFIED

- Phase structure (Phases 1-5): reasonable project decomposition
- Bootstrap completion conditions (COND-001, COND-002, COND-003): traceable to original's development approach
- Quality gates (QG-001 through QG-005): coverage thresholds not in original but reasonable for a solo dev project
- ADR workflow: consistent with original's "document architectural decisions" pattern
- Critical path analysis: planning artifact, no implementation requirements added

---

## 9. `docs/plan/specs/1_prd.md`

### JUSTIFIED

All content reviewed is traceable to the original description:
- Core features (DAG scheduling, agent pools, execution environments, checkpointing, MCP, TUI, CLI)
- Quality gates (90%/80%/50% coverage thresholds): reasonable interpretation of original's quality requirements
- `./do` script convention: natural implementation detail
- GitLab CI three-platform matrix: consistent with original's cross-platform requirement
- Single developer persona: matches original exactly

No scope creep identified.

---

## 10. `docs/plan/specs/2_tas.md`

### JUSTIFIED

All content reviewed:
- Cargo workspace crate structure: reasonable decomposition of the original's Rust implementation
- gRPC service architecture: direct implementation of original's gRPC specification
- Startup/shutdown sequences: implementation detail of original's server behavior
- Concurrency model (Tokio): natural choice for async Rust gRPC server

No scope creep identified.

---

## 11. `docs/plan/specs/3_mcp_design.md`

### JUSTIFIED (based on first 500 lines reviewed)

- Glass-Box MCP tool definitions: directly implement the original's "Glass-Box MCP server exposes full internal state" requirement
- MCP tool categories (run management, pool state, log streaming, agent callbacks): traceable to original

No scope creep identified in reviewed sections.

---

## 12. `docs/plan/research/competitive_analysis.md`

Not fully reviewed (file too large). Based on partial review, content appears to be informational competitive context without adding implementation requirements. No mandatory scope additions observed.

---

## 13. `docs/plan/research/tech_landscape.md`

Not fully reviewed (file too large). Based on partial review, technology choice rationale (Rust, gRPC, MCP) is aligned with original architecture decisions. No scope creep in reviewed sections.

---

## Summary of Changes Made

| File | Action | Finding |
|---|---|---|
| `docs/plan/research/market_research.md` | Removed TAM/SAM/SOM section | SCOPE CREEP |
| `docs/plan/research/market_research.md` | Removed geo-blocking line | SCOPE CREEP |
| `docs/plan/research/market_research.md` | Removed Business Models section | SCOPE CREEP |
| `docs/plan/research/market_research.md` | Removed GTM Recommendations section | SCOPE CREEP |
| `docs/plan/research/user_research.md` | Removed Persona 2 (Jordan Rivera) | SCOPE CREEP |
| `docs/plan/research/user_research.md` | Removed Persona 3 (Dr. Elena Vasquez) | SCOPE CREEP |
| `docs/plan/research/user_research.md` | Removed Target Audience Segments 2 & 3 | SCOPE CREEP |
| `docs/plan/research/user_research.md` | Removed Journey 2 (team orchestration) | SCOPE CREEP |
| `docs/plan/research/user_research.md` | Removed Journey 3 (enterprise compliance) | SCOPE CREEP |
| `docs/plan/specs/4_user_features.md` | Removed FEAT-BR-010 (task_state.json mandate) | SCOPE CREEP |
| `docs/plan/specs/4_user_features.md` | Removed EC-A-005 (dependent edge case) | SCOPE CREEP |
| `docs/plan/specs/5_security_design.md` | Removed §2.7 (security-check CLI command) | SCOPE CREEP |
| `docs/plan/specs/5_security_design.md` | Removed AC-SEC-2-001, -002, -006, -014, -019, -022 | SCOPE CREEP |
| `docs/plan/specs/5_security_design.md` | Removed SEC-059 rule and CLI contract from §4.2 | SCOPE CREEP |
| `docs/plan/specs/5_security_design.md` | Removed AC-SEC-4-012 | SCOPE CREEP |
| `docs/plan/specs/5_security_design.md` | Updated reading guide, data models table, TOC, SEC index | SCOPE CREEP |
| `docs/plan/specs/8_risks_mitigation.md` | Removed RISK-017, -018, -019, -020 from matrix | SCOPE CREEP |
| `docs/plan/specs/8_risks_mitigation.md` | Removed RISK-019 monitoring row | SCOPE CREEP |
| `docs/plan/specs/8_risks_mitigation.md` | Removed §4 Market & Adoption Risks (670 lines) | SCOPE CREEP |
| `docs/plan/specs/8_risks_mitigation.md` | Updated RISK-015 monitoring, RISK-BR-008, RISK-009 validate-workflow refs | SCOPE CREEP |
| `docs/plan/specs/9_project_roadmap.md` | Updated all `devs validate-workflow` → `devs submit` validation | SCOPE CREEP |
| `docs/plan/specs/9_project_roadmap.md` | Removed all `devs security-check` references | SCOPE CREEP |
| `docs/plan/specs/9_project_roadmap.md` | Removed `task_state.json` schema and ROAD-BR-406 | SCOPE CREEP |
| `docs/plan/specs/9_project_roadmap.md` | Removed `get_task_state`/`write_task_state` MCP tools | SCOPE CREEP |

## Findings Flagged but NOT Removed

| File | Finding | Reason Retained |
|---|---|---|
| `docs/plan/specs/5_security_design.md` | SEC-031/033 TLS optional for non-loopback; WARN emitted if absent | Resolved — aligned with original's local/trusted-network MVP intent |
| `docs/plan/specs/7_ui_ux_design.md` | UI-DES-PHI-001–026 mandatory strings.rs + lint | Over-engineered but defensible design convention |
| `docs/plan/research/user_research.md` | "Three distinct segments" in Executive Summary | Minor inconsistency after persona removal; low impact |
| `docs/plan/specs/4_user_features.md` | Duplicate FEAT-BR-010 ID | Second instance (run slug uniqueness) is valid; naming conflict is cosmetic |
