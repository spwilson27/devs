# Conflict Resolution Log

## Summary
- Documents reviewed: 13 (9 spec docs + 4 research docs)
- Conflicts found: 12
- Conflicts resolved: 12

---

## Resolutions

### Conflict 1: Default gRPC Port (7890 vs 7890)
- **Documents:** `docs/plan/specs/1_prd.md` vs `docs/plan/specs/2_tas.md`
- **Conflict:** `1_prd.md` used port `7890` as the default/example gRPC listen address in multiple places (config examples, topology diagrams, discovery file examples). `2_tas.md` defines the default gRPC port as `7890`.
- **Winner:** `docs/plan/specs/2_tas.md` (TAS is the authoritative source for implementation-level defaults)
- **Resolution:** All occurrences of `7890` in `1_prd.md` replaced with `7890`. All occurrences of `7890` in `2_tas.md` (discovery file format table and example) replaced with `7890`.
- **Priority Rule Applied:** PRD (2) > TAS (3) for WHAT to build; but TAS (3) is authoritative for HOW (implementation defaults). Port defaults are an implementation detail → TAS wins. Both documents now agree on 7890.

---

### Conflict 2: MCP Tool Namespace Prefix
- **Documents:** `docs/plan/specs/1_prd.md` (§B.8.2) vs `docs/plan/specs/3_mcp_design.md`
- **Conflict:** `1_prd.md` listed all MCP tools with a `devs.` namespace prefix (e.g., `get_run`, `list_runs`, `cancel_run`). `3_mcp_design.md` defines the canonical tool names without any namespace prefix (e.g., `get_run`, `list_runs`, `cancel_run`).
- **Winner:** `docs/plan/specs/3_mcp_design.md` (MCP Design is the authoritative wire-level protocol definition)
- **Resolution:** The `devs.` prefix was removed from all MCP tool names in `1_prd.md` §B.8.2, §B.8.3, §B.8.4, §B.8.5, and §B acceptance criteria.
- **Priority Rule Applied:** MCP Design (3) > PRD appendix B for wire-level tool naming conventions.

---

### Conflict 3: MCP Tool Name — `get_pool_state` vs `get_pool_state`
- **Documents:** `docs/plan/specs/1_prd.md` vs `docs/plan/specs/3_mcp_design.md`
- **Conflict:** `1_prd.md` §B.8.2 listed the pool observation tool as `get_pool_state`. `3_mcp_design.md` [MCP-012] defines the canonical name as `get_pool_state`.
- **Winner:** `docs/plan/specs/3_mcp_design.md`
- **Resolution:** Renamed to `get_pool_state` in `1_prd.md`.
- **Priority Rule Applied:** MCP Design (3) > PRD appendix B for tool naming.

---

### Conflict 4: MCP Tool Name — `write_workflow_definition` / `get_workflow_definition` vs `write_workflow_definition` / `get_workflow_definition`
- **Documents:** `docs/plan/specs/1_prd.md` vs `docs/plan/specs/3_mcp_design.md`
- **Conflict:** `1_prd.md` used `write_workflow_definition` and `get_workflow_definition`. `3_mcp_design.md` [MCP-019] defines these as `write_workflow_definition` and `get_workflow_definition`.
- **Winner:** `docs/plan/specs/3_mcp_design.md`
- **Resolution:** Renamed both tools in `1_prd.md` §B.8.2 and all cross-references.
- **Priority Rule Applied:** MCP Design (3) > PRD appendix B for tool naming.

---

### Conflict 5: MCP Tool Name — `signal_completion` vs `signal_completion`
- **Documents:** `docs/plan/specs/1_prd.md` vs `docs/plan/specs/3_mcp_design.md`
- **Conflict:** `1_prd.md` §B.8.2 listed the stage completion signal tool as `signal_completion`. `3_mcp_design.md` [MCP-023] defines the canonical name as `signal_completion`.
- **Winner:** `docs/plan/specs/3_mcp_design.md`
- **Resolution:** Renamed to `signal_completion` in `1_prd.md` §B.8.2 and §B.8.3 protocol example.
- **Priority Rule Applied:** MCP Design (3) > PRD appendix B for tool naming.

---

### Conflict 6: MCP Tool Names — `inject_stage_input` / `assert_stage_output` vs Canonical Names
- **Documents:** `docs/plan/specs/1_prd.md` vs `docs/plan/specs/3_mcp_design.md`
- **Conflict:** `1_prd.md` §B.8.2 listed testing tools as `inject_stage_input` and `assert_stage_output`. `3_mcp_design.md` [MCP-020], [MCP-021] define these as `inject_stage_input` and `assert_stage_output`.
- **Winner:** `docs/plan/specs/3_mcp_design.md`
- **Resolution:** Renamed both tools in `1_prd.md` §B.8.2 and all acceptance criteria references.
- **Priority Rule Applied:** MCP Design (3) > PRD appendix B for tool naming.

---

### Conflict 7: MCP Tool Count (Claimed 17 vs Actual 20)
- **Documents:** `docs/plan/specs/3_mcp_design.md` (internal inconsistency)
- **Conflict:** `3_mcp_design.md` repeatedly claimed "20 MCP tools" in its table of contents, summary table, and acceptance criteria (AC-2.01), but the document's own enumerated tool list [MCP-008] through [MCP-027] defines 20 tools.
- **Winner:** The actual enumerated tool definitions within `3_mcp_design.md`
- **Resolution:** Changed all "20 tools" references to "20 tools" in `3_mcp_design.md` (TOC entry, summary table, AC-2.01, cross-reference table).
- **Priority Rule Applied:** Internal consistency; actual specification content overrides stale summary counts.

---

### Conflict 8: Webhook HTTPS Enforcement — Rejection vs Warning
- **Documents:** `docs/plan/specs/1_prd.md` (BR-WEBHOOK-05) vs `docs/plan/specs/5_security_design.md` (SEC-035)
- **Conflict:** `1_prd.md` BR-WEBHOOK-05 stated: "The dispatcher MUST validate that `WebhookConfig.url` is an HTTPS URL at server startup. HTTP-only URLs are rejected." `5_security_design.md` SEC-035 stated: "HTTP (non-TLS) webhook targets MUST log a `WARN` on every delivery attempt... HTTP webhook targets are permitted at MVP to support local testing (e.g., `http://localhost:8080/hook`)."  `2_tas.md` EC-WH-05 confirmed both `http` and `https` schemes are valid (only non-HTTP/HTTPS like `ftp` are rejected).
- **Winner:** `docs/plan/specs/5_security_design.md` (more nuanced; confirmed by TAS)
- **Resolution:** Updated `1_prd.md` BR-WEBHOOK-05 to: HTTP is permitted for loopback/localhost URLs but triggers a `WARN` on each delivery attempt; only non-HTTP/HTTPS schemes are rejected at startup.
- **Priority Rule Applied:** Security Design (5) provides the authoritative security policy for implementation details not fully specified in the PRD; TAS (3) confirmation breaks the tie.

---

### Conflict 9: Presubmit Step Order (lint before format)
- **Documents:** `docs/plan/specs/4_user_features.md` (FEAT-BR-035) vs Original Project Description
- **Conflict:** `4_user_features.md` showed the presubmit sequence as `setup → format → lint → test → coverage → ci` (format missing, lint before where format would be). The original project description defines: `setup → format → lint → test → coverage → ci`.
- **Winner:** Original Project Description (absolute authority)
- **Resolution:** Updated `4_user_features.md` FEAT-BR-035 step table to `setup → format → lint → test → coverage → ci` (two occurrences).
- **Priority Rule Applied:** Original Project Description > all spec documents.

---

### Conflict 10: Presubmit Step Enum Ordering in Roadmap
- **Documents:** `docs/plan/specs/9_project_roadmap.md` vs Original Project Description
- **Conflict:** `9_project_roadmap.md` listed the `./do presubmit` step enum as `setup, format, lint, ...` (lint before format). The canonical sequence from the original description is `setup, format, lint, ...`.
- **Winner:** Original Project Description
- **Resolution:** Updated `9_project_roadmap.md` to list `setup, format, lint, ...` preserving the canonical ordering.
- **Priority Rule Applied:** Original Project Description > all spec documents.

---

### Conflict 11: Discovery File Example Port in 2_tas.md
- **Documents:** `docs/plan/specs/2_tas.md` vs `docs/plan/specs/2_tas.md` (internal inconsistency with its own default port definition)
- **Conflict:** `2_tas.md` §1.5 defined the default port as `7890` in the port field description but showed example discovery file content using `127.0.0.1:7890`.
- **Winner:** `2_tas.md`'s own default port declaration (7890)
- **Resolution:** Updated the discovery file format table example in `2_tas.md` §1.5 from `7890` to `7890`.
- **Priority Rule Applied:** Internal consistency within TAS; the explicit default definition overrides the stale example value.

---

### Conflict 12: `WorkflowInputParam.default` Constraint in User Features
- **Documents:** `docs/plan/specs/1_prd.md` vs `docs/plan/specs/4_user_features.md`
- **Conflict:** `1_prd.md` data model specified: `default: Option<String> — must be absent when required = true`. `4_user_features.md` §2.2.1 showed `# default = "TASK.md"  # optional; must match declared type` with no mention of the `required = true` restriction.
- **Winner:** `docs/plan/specs/1_prd.md`
- **Resolution:** Updated `4_user_features.md` §2.2.1 TOML skeleton comment to: `# optional; must be absent when required = true; must match declared type`.
- **Priority Rule Applied:** PRD (2) > User Features (4) for data model constraints.

---

## No Additional Conflicts Found

The following areas were specifically reviewed and found to be consistent across all documents:

- **StageStatus state machine**: `Pending`, `Running`, `Completed`, `Failed`, `Cancelled`, `Paused` variants are consistently defined across `1_prd.md`, `3_mcp_design.md`, and `4_user_features.md`.
- **GUI / REST API scope**: All documents correctly scope GUI and REST interface as post-MVP only.
- **Client authentication**: All documents correctly note client auth is post-MVP.
- **Agent list (claude, gemini, opencode, qwen, copilot)**: Consistent across all spec documents.
- **Execution environments (tempdir, docker, remote SSH)**: Consistent across all spec documents.
- **Git-backed persistence**: All documents use git (no database) for checkpoints and logs.
- **Workflow triggers**: All documents correctly identify manual triggers only (CLI and MCP) at MVP; cron/webhook/file-watch are post-MVP.
- **External secrets manager**: All documents correctly note this is post-MVP.
- **Single Cargo workspace**: Consistently described across all spec documents.
- **Coverage requirements**: 90% unit, 80% E2E, 50% per interface (TUI, CLI, MCP) — consistent.
- **`./do` script commands**: setup, build, test, lint, format, coverage, presubmit, ci — consistent (after fixes above).
- **MCP port (separate port with stdio bridge)**: Consistently described.
- **Research documents**: All four research documents (competitive_analysis, market_research, tech_landscape, user_research) are advisory and do not contradict spec documents on any normative requirement.
