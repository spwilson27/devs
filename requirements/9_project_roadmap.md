# Requirements from Project Roadmap (specs/9_project_roadmap.md)

### **[ROAD-001]** Phase 1: Core Orchestrator & State Persistence
- **Type:** Technical
- **Description:** Establish the central "Brain" of the system with deterministic state management and long-term memory.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-002]** Phase 2: Sandbox Isolation & MCP Infrastructure
- **Type:** Technical
- **Description:** Build the "Motor Cortex" providing isolated execution and standardized tool access.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-001]

### **[ROAD-003]** Phase 3: Discovery & Research Agents
- **Type:** Technical
- **Description:** Deploy the "Eyes" of the system to analyze the problem space and technology landscape.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-001]

### **[ROAD-004]** Phase 4: Documentation & Blueprinting Agents
- **Type:** Technical
- **Description:** Generate authoritative blueprints (PRD/TAS) that guide the development process.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-003]

### **[ROAD-005]** Phase 5: Requirement Distiller & Roadmap Generator
- **Type:** Technical
- **Description:** Translate specs into a Directed Acyclic Graph (DAG) of implementation tasks.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-004]

### **[ROAD-006]** Phase 6: TDD Implementation Engine & Reviewer Agent
- **Type:** Technical
- **Description:** Activate the implementation loop with rigorous verification and loop prevention.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-002], [ROAD-005]

### **[ROAD-007]** Phase 7: Multi-Modal Interface (CLI & VSCode Extension)
- **Type:** UX
- **Description:** Provide the visual "Glass-Box" for monitoring and human-in-the-loop control.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-001]

### **[ROAD-008]** Phase 8: Validation, Self-Hosting & Optimization
- **Type:** Technical
- **Description:** Final hardening, performance benchmarking, and system self-hosting.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-006], [ROAD-007]

### **[TASK-101]** Implement LangGraph.js state machine
- **Type:** Technical
- **Description:** Implement LangGraph.js state machine with cyclical implementation nodes and explicit state transitions.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-102]** Schema design for SQLite state.sqlite
- **Type:** Technical
- **Description:** Schema design for SQLite state.sqlite (projects, documents, requirements, epics, tasks, agent_logs, entropy_events).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-103]** Implement SQLiteSaver checkpointer
- **Type:** Technical
- **Description:** Implement SQLiteSaver checkpointer for ACID-compliant state snapshots, ensuring zero data loss on process crash.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [TASK-102]

### **[TASK-104]** Integrate LanceDB for vectorized Long-term Memory
- **Type:** Technical
- **Description:** Integrate LanceDB for vectorized Long-term Memory (Project DNA, Architectural Decisions).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-105]** Develop the ContextPruner
- **Type:** Technical
- **Description:** Develop the ContextPruner utilizing Gemini 3 Flash for summarizing intermediate reasoning turns (1M context window management).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-106]** Implement the SAOP parser and validator
- **Type:** Technical
- **Description:** Implement the SAOP (Structured Agent-Orchestrator Protocol) parser and validator.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-201]** Create hardened Docker base images
- **Type:** Security
- **Description:** Create hardened Docker base images (Alpine-based, non-root user, minimal syscalls).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-202]** Implement SandboxProvider
- **Type:** Technical
- **Description:** Implement SandboxProvider for Docker (CLI) and WebContainers (VSCode Web).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [TASK-201]

### **[TASK-203]** Build the Network Egress Proxy
- **Type:** Security
- **Description:** Build the Network Egress Proxy with domain whitelist enforcement (npm, pypi, github).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-204]** Implement the SecretMasker middleware
- **Type:** Security
- **Description:** Implement the SecretMasker middleware (Regex + Shannon Entropy > 4.5 detection).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-205]** Setup MCP Tool Registry
- **Type:** Technical
- **Description:** Setup MCP Tool Registry: read_file, write_file, shell_exec, git_commit, surgical_edit.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-206]** Implement surgical_edit tool
- **Type:** Technical
- **Description:** Implement surgical_edit tool to prevent full-file overwrites and minimize context drift.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-207]** Implement resource quotas for sandboxes
- **Type:** Technical
- **Description:** Implement resource quotas for sandboxes (CPU/RAM limiting via Cgroups).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [TASK-201]

### **[TASK-301]** Develop ResearchManager agent
- **Type:** Functional
- **Description:** Develop ResearchManager agent for parallelizing Market, Competitive, and Tech searches.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-302]** Integrate Serper/Google Search API
- **Type:** Technical
- **Description:** Integrate Serper/Google Search API with "Source Credibility" scoring.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-303]** Implement ContentExtractor
- **Type:** Technical
- **Description:** Implement ContentExtractor to convert dynamic/SPA content into clean Markdown.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-304]** Develop Tech Landscape decision matrix generator
- **Type:** Functional
- **Description:** Develop Tech Landscape decision matrix generator (weighted comparison of frameworks/libraries).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-305]** Implement automated Markdown report generation
- **Type:** Functional
- **Description:** Implement automated Markdown report generation with Mermaid SWOT and Decision Matrix diagrams.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-401]** Implement ArchitectAgent
- **Type:** Functional
- **Description:** Implement ArchitectAgent (Gemini 3 Pro) for PRD and TAS generation.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-402]** Build Mermaid.js auto-generator
- **Type:** Technical
- **Description:** Build Mermaid.js auto-generator for ERDs, Sequence Diagrams, and Site Maps.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-403]** Implement specialized Security and UI/UX agents
- **Type:** Functional
- **Description:** Implement specialized Security Design and UI/UX Architecture agents.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-404]** Develop the "Wait-for-Approval" HITL gate logic
- **Type:** Functional
- **Description:** Develop the "Wait-for-Approval" HITL gate logic in LangGraph.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-405]** Implement Spec Synchronization logic
- **Type:** Technical
- **Description:** Implement "Spec Synchronization" logic to detect and update requirements when docs are edited.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-501]** Implement Requirement Distiller
- **Type:** Functional
- **Description:** Implement Requirement Distiller (Atomic REQ extraction with REQ-ID mapping).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-502]** Develop Epic and Task generation algorithm
- **Type:** Functional
- **Description:** Develop the Epic (8-16) and Task (200+) generation algorithm.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-503]** Build Task Dependency DAG generator
- **Type:** Technical
- **Description:** Build the Task Dependency DAG (Directed Acyclic Graph) generator.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-504]** Implement Token/Cost Estimation heuristic
- **Type:** Technical
- **Description:** Implement Token/Cost Estimation heuristic per Epic and Phase.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-505]** Build the RTI calculator
- **Type:** Technical
- **Description:** Build the RTI (Requirement Traceability Index) calculator.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-601]** Implement the TDD Loop
- **Type:** Functional
- **Description:** Implement the TDD Loop (Plan -> Test -> Code -> Verify -> Commit).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-602]** Develop Developer Agent turn logic
- **Type:** Functional
- **Description:** Develop Developer Agent turn logic (SAOP implementation, file-level write locks).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-603]** Implement the Independent Reviewer Agent
- **Type:** Functional
- **Description:** Implement the Independent Reviewer Agent (regression audit, pattern compliance).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-604]** Build the Entropy Detector
- **Type:** Technical
- **Description:** Build the Entropy Detector (SHA-256 hash comparison of terminal stdout/stderr).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-605]** Implement the "Strategy Pivot" logic
- **Type:** Functional
- **Description:** Implement the "Strategy Pivot" logic (force reasoning shift from first principles).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-606]** Develop "Medium-term Memory" handoffs
- **Type:** Technical
- **Description:** Develop "Medium-term Memory" handoffs (summarizing task status for the next task).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-701]** Build CLI with Ink-based TUI
- **Type:** UX
- **Description:** Build CLI with Ink-based TUI (Progress bars, Real-time log streaming).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-702]** Develop VSCode Extension
- **Type:** UX
- **Description:** Develop VSCode Extension (React/Tailwind) with Webview bridge.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-703]** Implement the Agent Console
- **Type:** UX
- **Description:** Implement the "Agent Console" with SAOP streaming (Thought/Action/Observation).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-704]** Build the Interactive Task DAG visualization
- **Type:** UX
- **Description:** Build the Interactive Task DAG visualization (D3/React).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-705]** Implement Directive Injection UI and MCP tool
- **Type:** UX
- **Description:** Implement "Directive Injection" (User Whispering) UI and MCP tool.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-706]** Implement devs rewind command
- **Type:** Technical
- **Description:** Implement devs rewind command (Git HEAD + SQLite state restoration).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-801]** Implement Global Validation phase
- **Type:** Technical
- **Description:** Implement "Global Validation" phase for full project requirement audit.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-802]** Build the Project MCP Server template
- **Type:** Technical
- **Description:** Build the Project MCP Server template for generated codebases.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-803]** Develop the Benchmarking Suite
- **Type:** Technical
- **Description:** Develop the Benchmarking Suite (TAR, TTFC, RTI, and USD/Task metrics).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-804]** Project Self-Host
- **Type:** Technical
- **Description:** Use 'devs' to implement new 'devs' features (The Maker Journey).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TASK-805]** Create "Agent-Ready" project templates
- **Type:** Technical
- **Description:** Create "Agent-Ready" project templates (Next.js, FastAPI, Go).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-001]** The Research Gate
- **Type:** Functional
- **Description:** Approval of the Research Suite (Market, Tech, Comp, User).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-002]** The Blueprint Gate
- **Type:** Functional
- **Description:** Approval of the PRD and TAS. This freezes the architectural DNA.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-003]** The Roadmap Gate
- **Type:** Functional
- **Description:** Approval of the 8-16 Epics and 200+ Tasks. This authorizes the implementation spend.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-004]** The Epic Start Gate
- **Type:** Functional
- **Description:** User review of the upcoming tasks at the beginning of each Epic.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-005]** The Final Validation Gate
- **Type:** Functional
- **Description:** The "Zero-Defect" audit before the project is marked as COMPLETED.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-006]** Task Failure Gate (HITL Recovery)
- **Type:** Functional
- **Description:** Triggered if an agent hits the entropy limit.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-007]** Discovery-to-Architecture Transition
- **Type:** Technical
- **Description:** Transition occurs once Research Manager Agent confirms confidence scores > 85%.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-008]** The Blueprint Gate (Blocking)
- **Type:** Technical
- **Description:** Blocking synchronous wait; implementation cannot begin without approval_token.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-009]** The Distillation Compiler (Validation)
- **Type:** Technical
- **Description:** Validates 100% of Must-have PRD requirements are mapped to Tasks.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-010]** TDD implementation Loop (Context Injection)
- **Type:** Technical
- **Description:** Every turn preceded by ContextRefresh to ensure 1M token window contains active requirements.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-011]** TDD implementation Loop (Red-Phase Gate)
- **Type:** Technical
- **Description:** Task MUST fail its test in sandbox before implementation begins.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-012]** TDD implementation Loop (Entropy Detection)
- **Type:** Technical
- **Description:** Hashes last 3 terminal outputs; interrupts loop if matches found.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-013]** Multi-Agent Verification (ReviewNode)
- **Type:** Functional
- **Description:** Independent auditor validates functional integrity, architectural fidelity, and documentation density.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-014]** ACID State Transitions
- **Type:** Technical
- **Description:** Every node transition recorded as LangGraph checkpoint in SQLite for crash recovery.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-015]** Git-SQLite Correlation
- **Type:** Technical
- **Description:** CommitNode updates tasks table with git_commit_hash for time-travel synchronization.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-016]** DOD-P1: State Integrity
- **Type:** Technical
- **Description:** SQLiteSaver must pass Chaos Testing with 0% state corruption.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-017]** DOD-P1: Schema Validation
- **Type:** Technical
- **Description:** All 7 core tables must support ACID transactions.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-018]** DOD-P1: SAOP Compliance
- **Type:** Technical
- **Description:** SAOP must validate 100% of agent envelopes against JSON schema.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-019]** DOD-P1: Memory Efficiency
- **Type:** Technical
- **Description:** ContextPruner must compress 1M token context to <200k without losing must-have requirements.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-020]** DOD-P2: Sandbox Isolation
- **Type:** Security
- **Description:** 100% of unauthorized network egress attempts must be blocked and logged.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-021]** DOD-P2: Redaction Accuracy
- **Type:** Security
- **Description:** SecretMasker must achieve >99.9% recall on benchmark of 500+ diverse secrets.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-022]** DOD-P2: Surgical Precision
- **Type:** Technical
- **Description:** surgical_edit must pass Large File Refactor test with 20+ non-contiguous edits.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-023]** DOD-P2: MCP Handshake
- **Type:** Technical
- **Description:** 100% success rate for agent-to-tool handshakes via MCP SDK.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-024]** DOD-P3: Parallelization
- **Type:** Technical
- **Description:** ResearchManager must handle 3+ concurrent search/extract streams.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-025]** DOD-P3: Source Credibility
- **Type:** Technical
- **Description:** 100% of cited facts must be linked to verifiable URL with Confidence Score > 0.8.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-026]** DOD-P3: Content Extraction
- **Type:** Technical
- **Description:** ContentExtractor must convert SPA/Dynamic sites to clean Markdown without noise.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-027]** DOD-P4: Document Validity
- **Type:** Technical
- **Description:** PRD, TAS, Security, and UI/UX docs must pass Markdown linting and be stored as APPROVED.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-028]** DOD-P4: Visual Correctness
- **Type:** UX
- **Description:** 100% of Mermaid.js diagrams must render without syntax errors.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-029]** DOD-P4: Architectural Traceability
- **Type:** Technical
- **Description:** Every requirement in PRD must be linked to at least one interface contract in TAS.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-030]** DOD-P5: Requirement Coverage
- **Type:** Technical
- **Description:** RTI must be 1.0; 100% of requirements mapped to Task IDs.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-031]** DOD-P5: DAG Determinism
- **Type:** Technical
- **Description:** Task DAG must be a Directed Acyclic Graph with zero cycles.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-032]** DOD-P5: Cost Heuristics
- **Type:** Technical
- **Description:** TokenEstimate must be within 25% of actual usage for Foundation benchmark.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-033]** DOD-P6: TDD Fidelity
- **Type:** Technical
- **Description:** 100% of tasks must pass Red-Phase Gate (failing test verification).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-034]** DOD-P6: Reviewer Autonomy
- **Type:** Functional
- **Description:** Reviewer Agent must catch and revert at least one deliberate anti-pattern.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-035]** DOD-P6: Entropy Prevention
- **Type:** Technical
- **Description:** EntropyDetector must pause orchestrator within 1 turn of detected loop.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-036]** DOD-P7: Real-time Streaming
- **Type:** UX
- **Description:** VSCode Webview must maintain 60FPS during high-frequency log updates.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-037]** DOD-P7: State Synchronization
- **Type:** UX
- **Description:** 0ms desync between CLI TUI and VSCode UI.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-038]** DOD-P7: Rewind Fidelity
- **Type:** Technical
- **Description:** devs rewind must restore filesystem and state with 100% checksum match.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-039]** DOD-P8: Self-Host Success
- **Type:** Technical
- **Description:** devs must successfully implement a minor feature for its own orchestrator.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-040]** DOD-P8: Global Audit
- **Type:** Technical
- **Description:** Final Global Validation must pass all tests in a clean sandbox.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-041]** DOD-P8: AOD Density
- **Type:** Technical
- **Description:** 1:1 ratio between production modules and .agent.md documentation files.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-ROAD-042]** DOD-P8: Global Validation Phase
- **Type:** Technical
- **Description:** Implementation of "Global Validation" phase for full project requirement audit.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-UI-013]** Agent-Initiated Clarification (AIC)
- **Type:** UX
- **Description:** Research Agent triggers AIC on ambiguous brief.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-IMP-002]** TAS Violation Block
- **Type:** Technical
- **Description:** Reviewer Agent blocks commit on TAS violation.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-SEC-004]** Sandbox Breach Protection
- **Type:** Security
- **Description:** SandboxMonitor kills process and triggers SECURITY_PAUSE on breach.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-SYS-001]** Context Exhaustion Management
- **Type:** Technical
- **Description:** ContextPruner executes Flash-model summarization on context exhaustion.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-PLAN-003]** Dependency Deadlock Resolution
- **Type:** Technical
- **Description:** Distiller Agent flags circular dependency and requests user DAG edit.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-SYS-002]** LangGraph.js State Machine
- **Type:** Technical
- **Description:** Use LangGraph.js for deterministic state machine.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-SYS-003]** SQLite ACID Persistence
- **Type:** Technical
- **Description:** Use SQLite for ACID-compliant state persistence.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-MAP-002]** Requirement Traceability
- **Type:** Technical
- **Description:** Trace requirements from PRD to Task DAG.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TAS-010]** SAOP Schema Definition
- **Type:** Technical
- **Description:** Define SAOP JSON schema.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TAS-011]** SQLite Schema Implementation
- **Type:** Technical
- **Description:** Implement SQLite database schema.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-SEC-001]** Hardened Docker Sandbox
- **Type:** Security
- **Description:** Isolated execution environment using Docker.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-SEC-002]** Network Egress Proxy
- **Type:** Security
- **Description:** Whitelist-based network access control.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-SEC-003]** Real-time Secret Masking
- **Type:** Security
- **Description:** Detect and mask secrets in agent output.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TAS-013]** Docker Sandbox Provider
- **Type:** Technical
- **Description:** Implementation of Docker-based sandbox.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TAS-014]** WebContainer Sandbox Provider
- **Type:** Technical
- **Description:** Implementation of WebContainer-based sandbox.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-RES-001]** Parallel Research Manager
- **Type:** Functional
- **Description:** Orchestrate multiple research tasks in parallel.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-RES-002]** Serper API Integration
- **Type:** Technical
- **Description:** Use Serper for web search capabilities.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-RES-003]** Content Extraction
- **Type:** Technical
- **Description:** Extract clean text from web pages.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-RES-004]** Source Credibility Scoring
- **Type:** Technical
- **Description:** Score research sources based on reliability.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-DOC-001]** Architect Agent (PRD/TAS)
- **Type:** Functional
- **Description:** AI agent for generating architectural documents.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-DOC-002]** Mermaid.js Auto-Generation
- **Type:** Technical
- **Description:** Automatically generate Mermaid diagrams from specs.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-DOC-003]** Security Spec Agent
- **Type:** Functional
- **Description:** Specialized agent for security design.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-UI-001]** UX Spec Agent
- **Type:** Functional
- **Description:** Specialized agent for UI/UX design.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-UI-002]** HITL Approval Gates
- **Type:** Functional
- **Description:** Human-in-the-loop gates for major decisions.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-PLAN-001]** Requirement Distiller (REQ-ID Mapping)
- **Type:** Functional
- **Description:** Extract and map requirements to IDs.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-PLAN-002]** Epic & Task DAG Generator
- **Type:** Functional
- **Description:** Generate ordered tasks and epics.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-UI-003]** Token/Cost Estimation Heuristics
- **Type:** Technical
- **Description:** Estimate costs for agent execution.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-IMP-001]** TDD Orchestrator (Red-Green-Refactor)
- **Type:** Functional
- **Description:** Orchestrate the TDD implementation cycle.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-IMP-003]** Independent Reviewer
- **Type:** Functional
- **Description:** Second agent instance for code review.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-IMP-005]** Entropy/Loop Detector
- **Type:** Technical
- **Description:** Detect if agent is stuck in a loop.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-UI-012]** Context Pruner
- **Type:** Technical
- **Description:** Manage LLM context window efficiently.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TAS-019]** Strategy Pivot Agent
- **Type:** Functional
- **Description:** Agent to rethink strategy on failure.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-INT-001]** CLI (Ink TUI)
- **Type:** UX
- **Description:** Terminal user interface for devs.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-INT-002]** VSCode Extension (React)
- **Type:** UX
- **Description:** VSCode extension interface for devs.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-INT-003]** Real-time Trace Streaming
- **Type:** UX
- **Description:** Stream agent thoughts and actions in real-time.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-UI-005]** Interactive DAG UI
- **Type:** UX
- **Description:** Interactive visualization of the task graph.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-UI-009]** devs rewind Command
- **Type:** Technical
- **Description:** Command to revert to a previous state.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-SYS-004]** Global Validation Suite
- **Type:** Technical
- **Description:** Comprehensive validation of the finished project.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-MET-001]** TAR (Task Autonomy Rate) Metric
- **Type:** Technical
- **Description:** Measure percentage of tasks completed without HITL.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[REQ-MET-003]** RTI (Requirement Traceability Index) Metric
- **Type:** Technical
- **Description:** Measure coverage of requirements by tasks.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TAS-043]** Agent-Ready Templates
- **Type:** Technical
- **Description:** Pre-configured project scaffolds for agents.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[SPIKE-001]** WebContainer Parity
- **Type:** Technical
- **Description:** Determine if WebContainers support same syscalls as Docker.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[SPIKE-002]** Long-Term Memory Drift
- **Type:** Technical
- **Description:** Investigate impact of LanceDB noise on reasoning.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[SPIKE-003]** Multi-Agent Parallelism
- **Type:** Technical
- **Description:** Optimize file-level locking for simultaneous tasks.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[SPIKE-004]** Visual Requirement Mapping
- **Type:** UX
- **Description:** Research linking DAG nodes to PRD sections.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[M-1]** Milestone 1: Foundation (Phase 1-2)
- **Type:** Technical
- **Description:** Establishing the ACID-compliant state machine and secure environment.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[M-2]** Milestone 2: Intelligence (Phase 3-5)
- **Type:** Technical
- **Description:** Deploying Discovery and Design agents.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [M-1]

### **[M-3]** Milestone 3: Autonomy (Phase 6-8)
- **Type:** Technical
- **Description:** Activating the TDD implementation engine and multi-modal interfaces.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [M-2]

### **[BLOCKER-001]** ContextPruner architectural intent
- **Type:** Technical
- **Description:** Will ContextPruner maintain architectural intent across 100+ turns?
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[BLOCKER-002]** surgical_edit precision
- **Type:** Technical
- **Description:** Is surgical_edit precise enough for multi-file refactors?
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[BLOCKER-003]** Dependency Deadlocks
- **Type:** Technical
- **Description:** Handling conflicting library versions in parallel tasks.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[FUTURE-001]** Support for local LLMs
- **Type:** Functional
- **Description:** Support for Ollama/vLLM for enterprise offline mode.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[FUTURE-002]** Team Mode
- **Type:** Functional
- **Description:** Multi-user collaborative project development.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[FUTURE-003]** Automated PR Reviewer
- **Type:** Functional
- **Description:** Integrating devs into existing GitHub workflows.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[FUTURE-004]** Native Mobile App
- **Type:** UX
- **Description:** Monitoring project builds on the go.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[RISK-401]** LangGraph recursion on Node.js memory
- **Type:** Technical
- **Description:** Performance impact of deep LangGraph recursion on Node.js memory limits.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[RISK-SEC-01]** WebContainer syscall compatibility
- **Type:** Security
- **Description:** WebContainer syscall compatibility for non-JS languages (Rust/Go).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[DOD-P1]** DOD-P1: Foundation (The Brain)
- **Type:** Technical
- **Description:** Entry and exit criteria for Phase 1.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[DOD-P2]** DOD-P2: Execution (The Hands)
- **Type:** Technical
- **Description:** Entry and exit criteria for Phase 2.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[DOD-P3]** DOD-P3: Discovery (The Eyes)
- **Type:** Technical
- **Description:** Entry and exit criteria for Phase 3.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[DOD-P4]** DOD-P4: Synthesis (The Blueprint)
- **Type:** Technical
- **Description:** Entry and exit criteria for Phase 4.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[DOD-P5]** DOD-P5: Planning (The Strategy)
- **Type:** Technical
- **Description:** Entry and exit criteria for Phase 5.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[DOD-P6]** DOD-P6: Implementation (The Loop)
- **Type:** Technical
- **Description:** Entry and exit criteria for Phase 6.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[DOD-P7]** DOD-P7: Interface (The Lens)
- **Type:** Technical
- **Description:** Entry and exit criteria for Phase 7.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[DOD-P8]** DOD-P8: Optimization (The Polish)
- **Type:** Technical
- **Description:** Entry and exit criteria for Phase 8.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None
