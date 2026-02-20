# devs Ordered Requirements

This document presents the project requirements in a logical implementation sequence.

## Phase 1: Foundational Vision & Research

### **[GOALS]** Project Goals
- **Type:** Functional
- **Description:** High-level project goals including Time-to-Market compression, elimination of boilerplate, and deterministic reliability.
- **Source:** PRD (specs/1_prd.md), Competitive Analysis (research/competitive_analysis.md), Market Research (research/market_research.md), User Research (research/user_research.md)
- **Dependencies:** None

### **[PILLARS]** Architectural Pillars
- **Type:** Technical
- **Description:** Fundamental architectural pillars: Research-First, ADD, TDD, Glass-Box, and MCP-Native development.
- **Source:** PRD (specs/1_prd.md), Competitive Analysis (research/competitive_analysis.md), User Research (research/user_research.md)
- **Dependencies:** None

### **[REQ-RES-PLAN]** Research & Planning
- **Type:** Functional
- **Description:** Requirements for research management, feature mapping, and project planning. [REQ-RES-001] [REQ-RES-002] [REQ-RES-003] [REQ-RES-004] [REQ-RES-005] [REQ-MAP-001] [REQ-MAP-002] [REQ-MAP-003] [REQ-MAP-004] [REQ-MAP-005] [REQ-MAP-006] [REQ-PLAN-001] [REQ-PLAN-002] [REQ-PLAN-003] [REQ-PLAN-004] [REQ-PLAN-005]
- **Source:** PRD (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MR-CORE]** Market Research
- **Type:** Functional
- **Description:** Market Research requirements including MCP support, VSCode integration, and zero-data-retention for enterprise. [REQ-MR-001] [REQ-MR-002] [REQ-MR-003] [REQ-MR-004] [REQ-MR-005] [REQ-MR-006] [REQ-MR-007] [REQ-MR-008] [REQ-MR-009] [REQ-MR-010] [REQ-MR-011] [REQ-MR-012] [REQ-MR-013] [REQ-MR-014] [REQ-MR-015]
- **Source:** Market Research (research/market_research.md)
- **Dependencies:** None

### **[REQ-UR-CORE]** User Research
- **Type:** Functional
- **Description:** User Research requirements for Glass-Box monitoring and empirical code verification. [REQ-UR-001] [REQ-UR-002] [REQ-UR-003] [REQ-UR-004] [REQ-UR-005] [REQ-UR-006] [REQ-UR-007] [REQ-UR-008] [REQ-UR-009] [REQ-UR-010] [REQ-UR-011] [REQ-UR-012] [REQ-UR-013] [REQ-UR-014] [REQ-UR-015] [REQ-UR-016] [REQ-UR-017] [REQ-UR-018] [REQ-UR-019] [REQ-UR-020]
- **Source:** User Research (research/user_research.md)
- **Dependencies:** None

### **[REQ-NEED-CORE]** Persona Needs
- **Type:** UX
- **Description:** Persona-specific needs for Makers, Architects, Domain Experts, and Developers. [REQ-NEED-AGENT-01] [REQ-NEED-AGENT-02] [REQ-NEED-AGENT-03] [REQ-NEED-ARCH-01] [REQ-NEED-ARCH-02] [REQ-NEED-ARCH-03] [REQ-NEED-DEVS-01] [REQ-NEED-DEVS-02] [REQ-NEED-DEVS-03] [REQ-NEED-DOMAIN-01] [REQ-NEED-DOMAIN-02] [REQ-NEED-DOMAIN-03] [REQ-NEED-MAKER-01] [REQ-NEED-MAKER-02] [REQ-NEED-MAKER-03]
- **Source:** PRD (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-COMP-CORE]** Competitive Analysis
- **Type:** Functional
- **Description:** Competitive Analysis requirements for architecture prioritization and TDD loops. [REQ-COMP-001] [REQ-COMP-002] [REQ-COMP-003] [REQ-COMP-004] [REQ-COMP-005] [REQ-COMP-006] [REQ-COMP-007] [REQ-COMP-008] [REQ-COMP-009] [REQ-COMP-010] [REQ-COMP-011] [REQ-COMP-012] [REQ-COMP-013] [REQ-COMP-014] [REQ-COMP-015] [REQ-COMP-016] [REQ-COMP-017] [REQ-COMP-018] [REQ-COMP-019] [REQ-COMP-020] [REQ-COMP-021] [REQ-COMP-022] [REQ-COMP-023] [REQ-COMP-024] [REQ-COMP-025] [REQ-COMP-026] [REQ-COMP-027]
- **Source:** Competitive Analysis (research/competitive_analysis.md)
- **Dependencies:** None

## Phase 2: Architecture & Foundation

### **[TAS-CORE]** Technical Architecture Specification Core
- **Type:** Technical
- **Description:** Technical Architecture Specification core requirements including TypeScript, LangGraph.js, SQLite, LanceDB, and MCP integration. [TAS-001] [TAS-002] [TAS-003] [TAS-004] [TAS-005] [TAS-006] [TAS-007] [TAS-008] [TAS-009] [TAS-010] [TAS-011] [TAS-012] [TAS-013] [TAS-014] [TAS-015] [TAS-016] [TAS-017] [TAS-018] [TAS-019] [TAS-020] [TAS-021] [TAS-022] [TAS-023] [TAS-024] [TAS-025] [TAS-026] [TAS-027] [TAS-028] [TAS-029] [TAS-030] [TAS-031] [TAS-032] [TAS-033] [TAS-035] [TAS-036] [TAS-037] [TAS-038] [TAS-039] [TAS-040] [TAS-041] [TAS-042] [TAS-043] [TAS-044] [TAS-045] [TAS-046] [TAS-047] [TAS-048] [TAS-049] [TAS-050] [TAS-051] [TAS-052] [TAS-053] [TAS-054] [TAS-055] [TAS-056] [TAS-057] [TAS-058] [TAS-059] [TAS-060] [TAS-061] [TAS-062] [TAS-063] [TAS-064] [TAS-065] [TAS-066] [TAS-067] [TAS-068] [TAS-069] [TAS-070] [TAS-071] [TAS-072] [TAS-073] [TAS-074] [TAS-075] [TAS-076] [TAS-077] [TAS-078] [TAS-079] [TAS-080] [TAS-081] [TAS-082] [TAS-083] [TAS-084] [TAS-085] [TAS-086] [TAS-087] [TAS-088] [TAS-089] [TAS-090] [TAS-091] [TAS-092] [TAS-093] [TAS-094] [TAS-095] [TAS-096] [TAS-097] [TAS-098] [TAS-099] [TAS-100] [TAS-101] [TAS-102] [TAS-103] [TAS-104] [TAS-105] [TAS-106] [TAS-107] [TAS-108] [TAS-109] [TAS-110] [TAS-111] [TAS-112] [TAS-113] [TAS-114] [TASK-101] [TASK-102] [TASK-103] [TASK-104] [TASK-105] [TASK-106] [TASK-201] [TASK-202] [TASK-203] [TASK-204] [TASK-205] [TASK-206] [TASK-207] [TASK-301] [TASK-302] [TASK-303] [TASK-304] [TASK-305] [TASK-401] [TASK-402] [TASK-403] [TASK-404] [TASK-405] [TASK-501] [TASK-502] [TASK-503] [TASK-504] [TASK-505] [TASK-601] [TASK-602] [TASK-603] [TASK-604] [TASK-605] [TASK-606] [TASK-701] [TASK-702] [TASK-703] [TASK-704] [TASK-705] [TASK-706] [TASK-801] [TASK-802] [TASK-803] [TASK-804] [TASK-805]
- **Source:** TAS (specs/2_tas.md), Technology Landscape (research/tech_landscape.md)
- **Dependencies:** None

### **[REQ-TL-CORE]** Technology Landscape
- **Type:** Technical
- **Description:** Technology Landscape requirements for Node.js, Gemini 2.0 Pro/Flash, and standardized tool access. [REQ-TL-001] [REQ-TL-002] [REQ-TL-003] [REQ-TL-004] [REQ-TL-005] [REQ-TL-006] [REQ-TL-007] [REQ-TL-008] [REQ-TL-009] [REQ-TL-010] [REQ-TL-011] [REQ-TL-012] [REQ-TL-013] [REQ-TL-014] [REQ-TL-015] [REQ-TL-016] [REQ-TL-017] [REQ-TL-018] [REQ-TL-019] [REQ-TL-020] [REQ-TL-021]
- **Source:** Technology Landscape (research/tech_landscape.md)
- **Dependencies:** [TAS-CORE]

### **[MCP-CORE]** MCP Infrastructure
- **Type:** Technical
- **Description:** MCP specific requirements. [MCP-001] [MCP-002] [MCP-009]
- **Source:** MCP Design (specs/3_mcp_design.md)
- **Dependencies:** [TAS-CORE]

### **[REQ-SYS-CORE]** System Policies
- **Type:** Technical
- **Description:** System-level policies for token optimization, crash recovery, and model orchestration. [REQ-SYS-001] [REQ-SYS-002] [REQ-SYS-003] [REQ-SYS-004]
- **Source:** PRD (specs/1_prd.md), MCP Design (specs/3_mcp_design.md)
- **Dependencies:** [TAS-CORE]

## Phase 3: Policy & Interface Design

### **[REQ-INT-CORE]** Interface Operability
- **Type:** Functional
- **Description:** Interface operability requirements for CLI, VSCode, and MCP. [REQ-INT-001] [REQ-INT-002] [REQ-INT-003] [REQ-INT-004] [REQ-INT-005] [REQ-INT-006] [REQ-INT-007] [REQ-INT-008] [REQ-INT-009] [REQ-INT-010] [REQ-INT-011] [REQ-INT-012]
- **Source:** PRD (specs/1_prd.md)
- **Dependencies:** [TAS-CORE]

### **[REQ-DOC-CORE]** Documentation Generation
- **Type:** Functional
- **Description:** Documentation generation requirements. [REQ-DOC-001] [REQ-DOC-002] [REQ-DOC-003] [REQ-DOC-004] [REQ-DOC-005] [REQ-DOC-006] [REQ-DOC-007] [REQ-DOC-008] [REQ-DOC-009] [REQ-DOC-010]
- **Source:** PRD (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-IMP-CORE]** Implementation Loop
- **Type:** Technical
- **Description:** Implementation loop and TDD policies. [REQ-IMP-001] [REQ-IMP-002] [REQ-IMP-003] [REQ-IMP-004] [REQ-IMP-005] [REQ-IMP-006] [REQ-IMP-007] [REQ-IMP-008] [REQ-IMP-009]
- **Source:** PRD (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-CORE]** UI & HITL Policies
- **Type:** UX
- **Description:** UI and HITL control policies. [REQ-UI-001] [REQ-UI-002] [REQ-UI-003] [REQ-UI-004] [REQ-UI-005] [REQ-UI-006] [REQ-UI-007] [REQ-UI-008] [REQ-UI-009] [REQ-UI-010] [REQ-UI-011] [REQ-UI-012] [REQ-UI-013] [REQ-UI-014] [REQ-UI-015] [REQ-UI-016] [REQ-UI-017] [REQ-UI-018] [REQ-UI-019] [REQ-UI-020] [REQ-UI-021] [REQ-UI-022] [REQ-UI-023] [REQ-UI-024] [REQ-UI-025] [REQ-UI-026] [REQ-UI-027] [REQ-UI-028] [REQ-UI-RISK-001] [REQ-UI-RISK-002] [REQ-UI-RISK-003] [REQ-UI-RISK-004] [REQ-UI-RISK-005] [REQ-UI-RISK-006] [REQ-UI-UNK-001] [REQ-UI-UNK-002] [REQ-UI-UNK-003] [REQ-UI-UNK-004]
- **Source:** PRD (specs/1_prd.md), MCP Design (specs/3_mcp_design.md)
- **Dependencies:** [REQ-INT-CORE]

## Phase 4: Security & Risk

### **[REQ-SEC-CORE]** Security Policies
- **Type:** Security
- **Description:** Security policies for containerization, network egress, and secret redaction. [REQ-SEC-001] [REQ-SEC-002] [REQ-SEC-003] [REQ-SEC-004] [REQ-SEC-005] [REQ-SEC-006] [REQ-SEC-007] [REQ-SEC-008] [REQ-SEC-009] [REQ-SEC-010] [REQ-SEC-011] [REQ-SEC-012] [REQ-SEC-013] [REQ-SEC-QST-001] [REQ-SEC-QST-002] [REQ-SEC-QST-201] [REQ-SEC-QST-901] [REQ-SEC-QST-902]
- **Source:** PRD (specs/1_prd.md), Security Design (specs/5_security_design.md)
- **Dependencies:** [TAS-CORE]

### **[REQ-SEC-SD-CORE]** Security Design Details
- **Type:** Security
- **Description:** Security Design details: User Context, Directory Hardening, IPC Security, and TLS enforcement. [REQ-SEC-SD-010] [REQ-SEC-SD-011] [REQ-SEC-SD-012] [REQ-SEC-SD-013] [REQ-SEC-SD-014] [REQ-SEC-SD-015] [REQ-SEC-SD-016] [REQ-SEC-SD-017] [REQ-SEC-SD-019] [REQ-SEC-SD-020] [REQ-SEC-SD-021] [REQ-SEC-SD-022] [REQ-SEC-SD-023] [REQ-SEC-SD-024] [REQ-SEC-SD-025] [REQ-SEC-SD-026] [REQ-SEC-SD-027] [REQ-SEC-SD-028] [REQ-SEC-SD-029] [REQ-SEC-SD-030] [REQ-SEC-SD-031] [REQ-SEC-SD-032] [REQ-SEC-SD-033] [REQ-SEC-SD-034] [REQ-SEC-SD-035] [REQ-SEC-SD-036] [REQ-SEC-SD-037] [REQ-SEC-SD-038] [REQ-SEC-SD-039] [REQ-SEC-SD-040] [REQ-SEC-SD-041] [REQ-SEC-SD-042] [REQ-SEC-SD-043] [REQ-SEC-SD-044] [REQ-SEC-SD-045] [REQ-SEC-SD-046] [REQ-SEC-SD-047] [REQ-SEC-SD-048] [REQ-SEC-SD-049] [REQ-SEC-SD-050] [REQ-SEC-SD-051] [REQ-SEC-SD-052] [REQ-SEC-SD-053] [REQ-SEC-SD-054] [REQ-SEC-SD-055] [REQ-SEC-SD-056] [REQ-SEC-SD-057] [REQ-SEC-SD-058] [REQ-SEC-SD-059] [REQ-SEC-SD-060] [REQ-SEC-SD-061] [REQ-SEC-SD-062] [REQ-SEC-SD-063] [REQ-SEC-SD-064] [REQ-SEC-SD-065] [REQ-SEC-SD-066] [REQ-SEC-SD-067] [REQ-SEC-SD-068] [REQ-SEC-SD-069] [REQ-SEC-SD-070] [REQ-SEC-SD-071] [REQ-SEC-SD-072] [REQ-SEC-SD-073] [REQ-SEC-SD-074] [REQ-SEC-SD-075] [REQ-SEC-SD-076] [REQ-SEC-SD-077] [REQ-SEC-SD-078] [REQ-SEC-SD-079] [REQ-SEC-SD-080] [REQ-SEC-SD-081] [REQ-SEC-SD-082] [REQ-SEC-SD-083] [REQ-SEC-SD-084] [REQ-SEC-SD-085] [REQ-SEC-SD-086] [REQ-SEC-SD-087]
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [REQ-SEC-CORE]

### **[REQ-SEC-STRIDE]** Threat Modeling
- **Type:** Security
- **Description:** Threat modeling and STRIDE mitigations. [REQ-SEC-STR-001] [REQ-SEC-STR-002] [REQ-SEC-STR-003] [REQ-SEC-STR-004] [REQ-SEC-STR-005] [REQ-SEC-STR-006] [REQ-SEC-THR-001] [REQ-SEC-THR-002] [REQ-SEC-THR-003] [REQ-SEC-THR-004]
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [REQ-SEC-CORE]

### **[REQ-SEC-CRYPTO]** Cryptographic Implementation
- **Type:** Technical
- **Description:** Cryptographic implementation details and key management. [REQ-SEC-CRY-001] [REQ-SEC-CRY-002] [REQ-SEC-CRY-003] [REQ-SEC-CRY-004] [REQ-SEC-CRY-005] [REQ-SEC-CRY-006] [REQ-SEC-CRY-007] [REQ-SEC-EDG-001] [REQ-SEC-EDG-002]
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [REQ-SEC-CORE]

### **[RISKS-CORE]** Risk Assessment
- **Type:** Security
- **Description:** Risk assessment and mitigation strategies for agent loops, sandbox escape, and architectural drift. [RISK-101] [RISK-102] [RISK-201] [RISK-202] [RISK-301] [RISK-302] [RISK-303] [RISK-401] [RISK-402] [RISK-501] [RISK-502] [RISK-503] [RISK-601] [RISK-602] [RISK-801] [RISK-802] [RISK-SEC-01] [RISK-UI-201] [RISK-UI-202] [RISK-UI-203] [RSK-001] [RSK-002] [RSK-003] [RSK-004] [RSK-005] [RSK-006] [RSK-007] [RSK-008] [RSK-009] [RSK-010] [RSK-011] [RSK-012] [RSK-013] [RSK-014] [RSK-015] [RSK-016] [RSK-017] [RSK-018] [RSK-019] [RSK-020] [RSK-021] [RSK-022] [RSK-023] [RSK-MKT-001] [RSK-MKT-002] [RSK-MKT-003] [RSK-MKT-004] [RSK-MKT-005] [RSK-MKT-006] [REQ-SEC-RSK-001] [REQ-SEC-RSK-002] [REQ-SEC-RSK-101] [REQ-SEC-RSK-102] [REQ-SEC-RSK-103] [REQ-SEC-RSK-201] [REQ-SEC-RSK-901] [REQ-SEC-RSK-902]
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md), TAS (specs/2_tas.md), Security Design (specs/5_security_design.md)
- **Dependencies:** [REQ-SEC-CORE]

### **[PROC-CORE]** Standard Operating Procedures
- **Type:** Reliability
- **Description:** Standard Operating Procedures for rewind, strategy pivot, and sandbox reconstruction. [PROC-001] [PROC-002] [PROC-003] [PROC-004] [PROC-005] [PROC-006] [PROC-007]
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

## Phase 5: Features & Roadmap

### **[FEAT-CORE]** Core Functional Features
- **Type:** Functional
- **Description:** Core features for CLI lifecycle management, VSCode Dashboard, and Project Introspection. [FEAT-CLI-001] [FEAT-CLI-002] [FEAT-CLI-003] [FEAT-CLI-004] [FEAT-CLI-005] [FEAT-CTL-001] [FEAT-CTL-002] [FEAT-CTL-003] [FEAT-CTL-004] [FEAT-CTL-005] [FEAT-CTL-006] [FEAT-CTL-007] [FEAT-ERR-001] [FEAT-ERR-002] [FEAT-ERR-003] [FEAT-ERR-011] [FEAT-ERR-012] [FEAT-ERR-013] [FEAT-ERR-014] [FEAT-ERR-015] [FEAT-ERR-016] [FEAT-ERR-017] [FEAT-ERR-018] [FEAT-ERR-019] [FEAT-ERR-020] [FEAT-ERR-021] [FEAT-ERR-022] [FEAT-ERR-023] [FEAT-ERR-024] [FEAT-MCP-001] [FEAT-MCP-002] [FEAT-MEM-001] [FEAT-MEM-002] [FEAT-MEM-003] [FEAT-POR-001] [FEAT-POR-002] [FEAT-RES-001] [FEAT-RES-002] [FEAT-SEC-001] [FEAT-SEC-002] [FEAT-SEC-003] [FEAT-SEC-004] [FEAT-SYS-001] [FEAT-SYS-002] [FEAT-SYS-003] [FEAT-SYS-004] [FEAT-VSC-001] [FEAT-VSC-002] [FEAT-VSC-003] [FEAT-VSC-004] [FEAT-VSC-005]
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** [TAS-CORE]

### **[ROADMAP-PHASES]** Project Roadmap Phases
- **Type:** Technical
- **Description:** High-level project phases and milestones. [ROAD-001] [ROAD-002] [ROAD-003] [ROAD-004] [ROAD-005] [ROAD-006] [ROAD-007] [ROAD-008] [M-1] [M-2] [M-3]
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [REQ-RES-PLAN]

### **[ROADMAP-TASKS]** Granular Tasks
- **Type:** Technical
- **Description:** Granular implementation tasks across all phases. (Mapped in TAS-CORE)
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROADMAP-PHASES]

### **[DOD-CORE]** Definition of Done
- **Type:** Technical
- **Description:** Definitions of Done and phase-specific verification criteria. [DOD-P1] [DOD-P2] [DOD-P3] [DOD-P4] [DOD-P5] [DOD-P6] [DOD-P7] [DOD-P8] [REQ-ROAD-001] [REQ-ROAD-002] [REQ-ROAD-003] [REQ-ROAD-004] [REQ-ROAD-005] [REQ-ROAD-006] [REQ-ROAD-007] [REQ-ROAD-008] [REQ-ROAD-009] [REQ-ROAD-010] [REQ-ROAD-011] [REQ-ROAD-012] [REQ-ROAD-013] [REQ-ROAD-014] [REQ-ROAD-015] [REQ-ROAD-016] [REQ-ROAD-017] [REQ-ROAD-018] [REQ-ROAD-019] [REQ-ROAD-020] [REQ-ROAD-021] [REQ-ROAD-022] [REQ-ROAD-023] [REQ-ROAD-024] [REQ-ROAD-025] [REQ-ROAD-026] [REQ-ROAD-027] [REQ-ROAD-028] [REQ-ROAD-029] [REQ-ROAD-030] [REQ-ROAD-031] [REQ-ROAD-032] [REQ-ROAD-033] [REQ-ROAD-034] [REQ-ROAD-035] [REQ-ROAD-036] [REQ-ROAD-037] [REQ-ROAD-038] [REQ-ROAD-039] [REQ-ROAD-040] [REQ-ROAD-041] [REQ-ROAD-042]
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROADMAP-PHASES]

## Phase 6: UI/UX Implementation

### **[UI-ARCH-CORE]** UI Architecture
- **Type:** Technical
- **Description:** UI Architecture details for VSCode Extension and CLI TUI. [UI-ARCH-001] [UI-ARCH-002] [UI-ARCH-003] [UI-ARCH-004] [UI-ARCH-005] [UI-ARCH-020] [UI-ARCH-021] [UI-ARCH-024] [UI-ARCH-025] [UI-ARCH-026] [UI-ARCH-027] [UI-ARCH-028] [UI-ARCH-029] [UI-ARCH-030] [UI-ARCH-031] [UI-ARCH-032] [UI-ARCH-033] [UI-ARCH-034] [UI-ARCH-035] [UI-ARCH-036] [UI-ARCH-037] [UI-ARCH-038] [UI-ARCH-039] [UI-ARCH-040] [UI-ARCH-041] [UI-ARCH-042] [UI-ARCH-043] [UI-ARCH-044] [UI-ARCH-047] [UI-ARCH-048]
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [FEAT-CORE]

### **[UI-DESIGN-TOKENS]** UI Design System
- **Type:** UX
- **Description:** Detailed design system specs including color palettes, typography, spacing, and interactive states. [REQ-UI-DES-001] [REQ-UI-DES-002] [REQ-UI-DES-002-1] [REQ-UI-DES-002-2] [REQ-UI-DES-002-3] [REQ-UI-DES-003] [REQ-UI-DES-003-1] [REQ-UI-DES-003-2] [REQ-UI-DES-004] [REQ-UI-DES-004-1] [REQ-UI-DES-004-2] [REQ-UI-DES-005] [REQ-UI-DES-005-1] [REQ-UI-DES-005-2] [REQ-UI-DES-006] [REQ-UI-DES-006-1] [REQ-UI-DES-006-2] [REQ-UI-DES-007] [REQ-UI-DES-008] [REQ-UI-DES-010] [REQ-UI-DES-011] [REQ-UI-DES-012] [REQ-UI-DES-013] [REQ-UI-DES-014] [REQ-UI-DES-015] [REQ-UI-DES-016] [REQ-UI-DES-017] [REQ-UI-DES-018] [REQ-UI-DES-019] [REQ-UI-DES-020] [REQ-UI-DES-021] [REQ-UI-DES-022] [REQ-UI-DES-023] [REQ-UI-DES-024] [REQ-UI-DES-024-1] [REQ-UI-DES-024-2] [REQ-UI-DES-024-3] [REQ-UI-DES-024-4] [REQ-UI-DES-024-5] [REQ-UI-DES-025] [REQ-UI-DES-025-1] [REQ-UI-DES-025-2] [REQ-UI-DES-025-3] [REQ-UI-DES-026] [REQ-UI-DES-027] [REQ-UI-DES-027-1] [REQ-UI-DES-027-2] [REQ-UI-DES-027-3] [REQ-UI-DES-028] [REQ-UI-DES-030] [REQ-UI-DES-031] [REQ-UI-DES-031-1] [REQ-UI-DES-031-2] [REQ-UI-DES-031-3] [REQ-UI-DES-032] [REQ-UI-DES-033] [REQ-UI-DES-033-1] [REQ-UI-DES-033-2] [REQ-UI-DES-033-3] [REQ-UI-DES-033-4] [REQ-UI-DES-033-5] [REQ-UI-DES-033-6] [REQ-UI-DES-034] [REQ-UI-DES-034-1] [REQ-UI-DES-034-2] [REQ-UI-DES-034-3] [REQ-UI-DES-035] [REQ-UI-DES-035-1] [REQ-UI-DES-035-2] [REQ-UI-DES-035-3] [REQ-UI-DES-036] [REQ-UI-DES-036-1] [REQ-UI-DES-036-2] [REQ-UI-DES-037] [REQ-UI-DES-037-1] [REQ-UI-DES-037-2] [REQ-UI-DES-038] [REQ-UI-DES-038-1] [REQ-UI-DES-039] [REQ-UI-DES-039-1] [REQ-UI-DES-039-2] [REQ-UI-DES-040] [REQ-UI-DES-041] [REQ-UI-DES-042] [REQ-UI-DES-043] [REQ-UI-DES-044] [REQ-UI-DES-044-1] [REQ-UI-DES-044-2] [REQ-UI-DES-045] [REQ-UI-DES-045-1] [REQ-UI-DES-045-2] [REQ-UI-DES-045-3] [REQ-UI-DES-045-4] [REQ-UI-DES-046] [REQ-UI-DES-046-1] [REQ-UI-DES-046-2] [REQ-UI-DES-046-3] [REQ-UI-DES-046-4] [REQ-UI-DES-047] [REQ-UI-DES-047-1] [REQ-UI-DES-047-2] [REQ-UI-DES-047-3] [REQ-UI-DES-047-3-1] [REQ-UI-DES-047-3-2] [REQ-UI-DES-048] [REQ-UI-DES-048-1] [REQ-UI-DES-048-2] [REQ-UI-DES-049] [REQ-UI-DES-049-1] [REQ-UI-DES-049-2] [REQ-UI-DES-049-3] [REQ-UI-DES-049-4] [REQ-UI-DES-049-Z0] [REQ-UI-DES-049-Z1] [REQ-UI-DES-049-Z2] [REQ-UI-DES-049-Z3] [REQ-UI-DES-049-Z4] [REQ-UI-DES-050] [REQ-UI-DES-051] [REQ-UI-DES-051-1] [REQ-UI-DES-051-2] [REQ-UI-DES-051-3] [REQ-UI-DES-052] [REQ-UI-DES-052-1] [REQ-UI-DES-052-2] [REQ-UI-DES-052-3] [REQ-UI-DES-052-4] [REQ-UI-DES-053] [REQ-UI-DES-053-1] [REQ-UI-DES-053-2] [REQ-UI-DES-053-3] [REQ-UI-DES-054] [REQ-UI-DES-054-1] [REQ-UI-DES-054-2] [REQ-UI-DES-054-3] [REQ-UI-DES-055] [REQ-UI-DES-055-1] [REQ-UI-DES-055-2] [REQ-UI-DES-055-3] [REQ-UI-DES-056] [REQ-UI-DES-056-1] [REQ-UI-DES-056-2] [REQ-UI-DES-057] [REQ-UI-DES-057-1] [REQ-UI-DES-057-2] [REQ-UI-DES-057-3] [REQ-UI-DES-058] [REQ-UI-DES-058-1] [REQ-UI-DES-058-2] [REQ-UI-DES-059] [REQ-UI-DES-059-1] [REQ-UI-DES-059-2] [REQ-UI-DES-059-3] [REQ-UI-DES-060] [REQ-UI-DES-061] [REQ-UI-DES-061-1] [REQ-UI-DES-061-2] [REQ-UI-DES-061-3] [REQ-UI-DES-061-4] [REQ-UI-DES-062] [REQ-UI-DES-062-1] [REQ-UI-DES-062-2] [REQ-UI-DES-062-3] [REQ-UI-DES-063] [REQ-UI-DES-063-1] [REQ-UI-DES-063-2] [REQ-UI-DES-063-3] [REQ-UI-DES-064] [REQ-UI-DES-064-1] [REQ-UI-DES-064-2] [REQ-UI-DES-064-3] [REQ-UI-DES-064-4] [REQ-UI-DES-064-5] [REQ-UI-DES-064-6] [REQ-UI-DES-065] [REQ-UI-DES-065-1] [REQ-UI-DES-065-2] [REQ-UI-DES-066] [REQ-UI-DES-066-1] [REQ-UI-DES-066-2] [REQ-UI-DES-066-3] [REQ-UI-DES-066-4] [REQ-UI-DES-067] [REQ-UI-DES-068] [REQ-UI-DES-068-1] [REQ-UI-DES-068-2] [REQ-UI-DES-069] [REQ-UI-DES-070] [REQ-UI-DES-070-1] [REQ-UI-DES-070-2] [REQ-UI-DES-080] [REQ-UI-DES-081] [REQ-UI-DES-081-1] [REQ-UI-DES-081-2] [REQ-UI-DES-081-3] [REQ-UI-DES-081-4] [REQ-UI-DES-081-5] [REQ-UI-DES-082] [REQ-UI-DES-083] [REQ-UI-DES-083-1] [REQ-UI-DES-083-1-1] [REQ-UI-DES-083-1-2] [REQ-UI-DES-083-1-3] [REQ-UI-DES-083-2] [REQ-UI-DES-083-2-1] [REQ-UI-DES-083-2-2] [REQ-UI-DES-084] [REQ-UI-DES-084-1] [REQ-UI-DES-084-2] [REQ-UI-DES-084-3] [REQ-UI-DES-085] [REQ-UI-DES-085-1] [REQ-UI-DES-085-2] [REQ-UI-DES-085-3] [REQ-UI-DES-085-4] [REQ-UI-DES-086] [REQ-UI-DES-086-1] [REQ-UI-DES-086-2] [REQ-UI-DES-086-3] [REQ-UI-DES-087] [REQ-UI-DES-087-1] [REQ-UI-DES-087-2] [REQ-UI-DES-090] [REQ-UI-DES-090-1] [REQ-UI-DES-090-2] [REQ-UI-DES-090-3] [REQ-UI-DES-090-4] [REQ-UI-DES-091] [REQ-UI-DES-091-1] [REQ-UI-DES-091-2] [REQ-UI-DES-091-3] [REQ-UI-DES-092] [REQ-UI-DES-092-1] [REQ-UI-DES-092-2] [REQ-UI-DES-092-3] [REQ-UI-DES-093] [REQ-UI-DES-093-1] [REQ-UI-DES-093-2] [REQ-UI-DES-093-3] [REQ-UI-DES-093-4] [REQ-UI-DES-094] [REQ-UI-DES-094-1] [REQ-UI-DES-094-2] [REQ-UI-DES-094-3] [REQ-UI-DES-100] [REQ-UI-DES-100-1] [REQ-UI-DES-100-2] [REQ-UI-DES-100-3] [REQ-UI-DES-100-4] [REQ-UI-DES-101] [REQ-UI-DES-101-1] [REQ-UI-DES-101-2] [REQ-UI-DES-110] [REQ-UI-DES-110-1] [REQ-UI-DES-110-2] [REQ-UI-DES-110-3] [REQ-UI-DES-111] [REQ-UI-DES-111-1] [REQ-UI-DES-111-2] [REQ-UI-DES-120] [REQ-UI-DES-120-1] [REQ-UI-DES-120-2] [REQ-UI-DES-121] [REQ-UI-DES-122] [REQ-UI-DES-123] [REQ-UI-DES-130] [REQ-UI-DES-130-1] [REQ-UI-DES-130-2] [REQ-UI-DES-140] [REQ-UI-DES-140-1] [REQ-UI-DES-140-2] [REQ-UI-DES-141]
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [UI-ARCH-CORE]

### **[UI-COMPONENTS]** Specialized UI Components
- **Type:** Functional
- **Description:** Specialized UI components: ThoughtStreamer, DAGCanvas, MermaidHost, and DirectiveWhisperer. [COMP-001] [COMP-002] [COMP-003] [COMP-004]
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [UI-ARCH-CORE]

### **[UI-STATES-ROUTES]** UI State & Performance
- **Type:** Technical
- **Description:** UI state management, routing, styling, and performance optimizations. [UI-STATE-001] [UI-STATE-002] [UI-STATE-003] [UI-STATE-004] [UI-STATE-005] [UI-STATE-006] [UI-STATE-007] [UI-STATE-008] [UI-STATE-009] [UI-STATE-010] [UI-STATE-011] [UI-STATE-012] [UI-ROUT-001] [UI-ROUT-002] [UI-ROUT-003] [UI-ROUT-004] [UI-ROUT-005] [UI-ROUT-006] [UI-ROUT-007] [UI-ROUT-008] [UI-ROUT-009] [UI-ROUT-010] [UI-ROUT-011] [UI-ROUT-012] [UI-STYLE-001] [UI-STYLE-002] [UI-STYLE-003] [UI-ASSET-001] [UI-ASSET-002] [UI-ASSET-003] [UI-TYPO-001] [UI-TYPO-002] [UI-PERF-019] [UI-PERF-020] [UI-PERF-021]
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [UI-ARCH-CORE]

## Phase 7: Operations & Metrics

### **[REQ-MET-CORE]** Success Metrics
- **Type:** Non-Functional
- **Description:** Project success metrics: TAR, TTFC, RTI, AFS, etc. [REQ-MET-001] [REQ-MET-002] [REQ-MET-003] [REQ-MET-004] [REQ-MET-005] [REQ-MET-006] [REQ-MET-007] [REQ-MET-008] [REQ-MET-009] [REQ-MET-010] [REQ-MET-011] [REQ-MET-012] [REQ-MET-013] [REQ-MET-014] [REQ-MET-015] [REQ-MET-016]
- **Source:** PRD (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-CON-CORE]** Technical Constraints
- **Type:** Technical
- **Description:** Technical constraints for rate limiting and state persistence. [REQ-CON-001] [REQ-CON-002] [REQ-CON-003] [REQ-CON-004] [REQ-CON-005]
- **Source:** PRD (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-HITL-CORE]** HITL Checkpoints
- **Type:** UX
- **Description:** Human-in-the-loop checkpoints. [REQ-HITL-001] [REQ-HITL-002] [REQ-HITL-003] [REQ-HITL-004] [REQ-HITL-005]
- **Source:** PRD (specs/1_prd.md)
- **Dependencies:** [REQ-UI-CORE]

### **[EDGE-CORE]** Edge Case Handling
- **Type:** Technical
- **Description:** Edge case handling for research, architecture, planning, and implementation. [EDGE-ACC-01] [EDGE-ARC-01] [EDGE-ARC-02] [EDGE-IMP-01] [EDGE-IMP-02] [EDGE-IMP-03] [EDGE-LOC-01] [EDGE-LOC-02] [EDGE-PLN-01] [EDGE-PLN-02] [EDGE-RES-01] [EDGE-RES-02] [EDGE-RES-03] [EDGE-SYS-01] [EDGE-SYS-02] [EDGE-SYS-03]
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

## Phase 8: Misc & Unknowns

### **[UNKNOWN-CORE]** Project Unknowns
- **Type:** Technical
- **Description:** Project unknowns, blockers, spikes, and future considerations. [UNK-001] [UNK-002] [UNK-003] [UNKNOWN-101] [UNKNOWN-201] [UNKNOWN-301] [UNKNOWN-302] [UNKNOWN-401] [UNKNOWN-501] [UNKNOWN-502] [UNKNOWN-601] [UNKNOWN-602] [UNKNOWN-801] [UNKNOWN-802] [UNKNOWN-STYLE-001] [UNKNOWN-UI-201] [BLOCKER-001] [BLOCKER-002] [BLOCKER-003] [SPIKE-001] [SPIKE-002] [SPIKE-003] [SPIKE-004] [FUTURE-001] [FUTURE-002] [FUTURE-003] [FUTURE-004]
- **Source:** TAS (specs/2_tas.md), Project Roadmap (specs/9_project_roadmap.md), Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[OTHER-IDS]** Miscellaneous IDs
- **Type:** Technical
- **Description:** Miscellaneous IDs from source documents. [REQ-001] [REQ-ACC-001] [REQ-ACC-002] [REQ-ACC-003] [REQ-ACC-004] [REQ-ACC-005] [REQ-ACC-006] [REQ-ACC-007] [REQ-ACC-008] [REQ-GOAL-001] [REQ-GOAL-002] [REQ-GOAL-003] [REQ-GOAL-004] [REQ-GOAL-005] [REQ-GOAL-006] [REQ-GOAL-007] [REQ-GOAL-008] [REQ-LOC-001] [REQ-LOC-002] [REQ-LOC-003] [REQ-LOC-004] [REQ-LOC-005] [REQ-MCP-001] [REQ-OBS-001] [REQ-OBS-002] [REQ-OBS-003] [REQ-OBS-004] [REQ-OBS-005] [REQ-OBS-006] [REQ-OBS-007] [REQ-PERF-001] [REQ-PERF-002] [REQ-PERF-003] [REQ-PERF-004] [REQ-PIL-001] [REQ-PIL-002] [REQ-PIL-003] [REQ-PIL-004] [REQ-PIL-005] [REQ-REL-001] [REQ-REL-002] [REQ-REL-003] [REQ-REL-004] [REQ-REL-005] [REQ-REL-006] [REQ-RSK-001-1] [REQ-RSK-001-2] [REQ-RSK-001-3] [REQ-RSK-001-4] [REQ-RSK-002-1] [REQ-RSK-002-2] [REQ-RSK-002-3] [REQ-RSK-002-4] [REQ-RSK-003-1] [REQ-RSK-003-2] [REQ-RSK-003-3] [REQ-RSK-004-1] [REQ-RSK-004-2] [REQ-RSK-004-3] [REQ-RSK-004-4] [REQ-RSK-005-1] [REQ-RSK-005-2] [REQ-RSK-005-3] [REQ-RSK-006-1] [REQ-RSK-006-2] [REQ-RSK-007-1] [REQ-RSK-007-2] [REQ-RSK-007-3] [REQ-RSK-008-1] [REQ-RSK-008-2] [REQ-RSK-009-1] [REQ-RSK-009-2] [REQ-RSK-010-1] [REQ-RSK-010-2] [REQ-RSK-010-3] [REQ-RSK-011-1] [REQ-RSK-011-2] [REQ-RSK-011-3] [REQ-RSK-012-1] [REQ-RSK-012-2] [REQ-RSK-012-3] [REQ-RSK-013-1] [REQ-RSK-013-2] [REQ-RSK-013-3] [REQ-RSK-014-1] [REQ-RSK-014-2] [REQ-RSK-014-3] [REQ-RSK-015-1] [REQ-RSK-015-2] [REQ-RSK-016-1] [REQ-RSK-016-2] [REQ-RSK-016-3] [REQ-RSK-017-1] [REQ-RSK-017-2] [REQ-RSK-017-3] [REQ-RSK-017-4] [REQ-RSK-018-1] [REQ-RSK-018-2] [REQ-RSK-018-3] [REQ-RSK-019-1] [REQ-RSK-019-2] [REQ-RSK-019-3] [REQ-RSK-020-1] [REQ-RSK-020-2] [REQ-RSK-020-3] [REQ-RSK-021-1] [REQ-RSK-021-2] [REQ-RSK-021-3] [REQ-RSK-022-1] [REQ-RSK-022-2] [REQ-RSK-023-1] [REQ-RSK-023-2] [REQ-RSK-023-3] [REQ-RSK-024-1] [REQ-RSK-024-2] [REQ-RSK-024-3] [REQ-RSK-025-1] [REQ-RSK-025-2] [REQ-RSK-025-3] [REQ-RSK-025-4] [REQ-RSK-026-1] [REQ-RSK-026-2] [REQ-RSK-027-1] [REQ-RSK-028-1] [REQ-RSK-028-2] [REQ-RSK-029-1] [REQ-RSK-029-2] [REQ-RSK-029-3] [REQ-RSK-030-1] [REQ-RSK-030-2] [REQ-RSK-031] [REQ-RSK-032] [REQ-RSK-033] [REQ-RSK-034] [REQ-RSK-035] [REQ-RSK-036] [REQ-RSK-MKT-001-1] [REQ-RSK-MKT-001-2] [REQ-RSK-MKT-001-3] [REQ-RSK-MKT-002-1] [REQ-RSK-MKT-002-2] [REQ-RSK-MKT-002-3] [REQ-RSK-MKT-003-1] [REQ-RSK-MKT-003-2] [REQ-RSK-MKT-003-3] [REQ-RSK-MKT-004-1] [REQ-RSK-MKT-004-2] [REQ-RSK-MKT-004-3] [REQ-RSK-MKT-005-1] [REQ-RSK-MKT-005-2] [REQ-RSK-MKT-006-1] [REQ-RSK-MKT-006-2]
- **Source:** Various
- **Dependencies:** None

### **[REQ-OOS-CORE]** Out-of-Scope Items
- **Type:** Non-Functional
- **Description:** Out-of-scope items. [REQ-OOS-001] [REQ-OOS-002] [REQ-OOS-003] [REQ-OOS-004] [REQ-OOS-005] [REQ-OOS-006] [REQ-OOS-007] [REQ-OOS-008] [REQ-OOS-009] [REQ-OOS-010] [REQ-OOS-011] [REQ-OOS-012] [REQ-OOS-013] [REQ-OOS-014] [REQ-OOS-015] [REQ-OOS-016] [REQ-OOS-017] [REQ-OOS-018] [REQ-OOS-019] [REQ-OOS-020]
- **Source:** PRD (specs/1_prd.md)
- **Dependencies:** None
