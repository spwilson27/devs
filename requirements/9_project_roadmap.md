### **[ROAD-REQ-001]** Dependency-Aware Phasing Strategy
- **Type:** Technical
- **Description:** The project must follow a Foundation-First Infrastructure approach, prioritizing the Orchestrator and Sandbox before implementing Research and Implementation Agents.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-REQ-002]** Glass-Box Mandate
- **Type:** Non-Functional
- **Description:** Every phase of the project must produce queryable state and audit logs to ensure system transparency and observability.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-REQ-003]** LangGraph.js State Machine
- **Type:** Technical
- **Description:** Implement the central orchestrator using LangGraph.js to manage deterministic state transitions and cyclical implementation nodes.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-REQ-004]** SQLite ACID Persistence
- **Type:** Technical
- **Description:** Use SQLite for state persistence (state.sqlite) to store projects, documents, requirements, epics, tasks, agent logs, and entropy events with ACID compliance.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-REQ-005]** Tiered Memory Architecture
- **Type:** Technical
- **Description:** Implement a tiered memory system (Short/Medium/Long-term) using SQLite for state snapshots and LanceDB for vectorized long-term memory.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-004]

### **[ROAD-REQ-006]** SAOP (Structured Agent-Orchestrator Protocol)
- **Type:** Technical
- **Description:** Define and implement a structured protocol (SAOP) for communication between agents and the orchestrator, including a parser and validator.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-REQ-007]** ContextPruner Utility
- **Type:** Technical
- **Description:** Develop a ContextPruner (utilizing Gemini 3 Flash) to summarize intermediate reasoning turns and manage the 1M token context window.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-REQ-008]** Isolated Execution Sandbox
- **Type:** Security
- **Description:** Provide a hardened Docker-based (for CLI) and WebContainer-based (for VSCode Web) isolated execution environment for agent commands.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-REQ-009]** Real-time SecretMasker
- **Type:** Security
- **Description:** Implement middleware to detect and mask secrets (API keys, tokens) in agent outputs using regex and Shannon Entropy detection.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-REQ-010]** Network Egress Proxy
- **Type:** Security
- **Description:** Implement a proxy with domain whitelist enforcement to restrict agent network access to approved registries (npm, pypi, github).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-008]

### **[ROAD-REQ-011]** MCP Tool Registry
- **Type:** Technical
- **Description:** Integrate the Model Context Protocol (MCP) SDK and set up a tool registry for file operations, shell execution, and git commits.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-REQ-012]** Surgical Edit Tool
- **Type:** Technical
- **Description:** Implement a 'surgical_edit' tool to perform precise code modifications, preventing full-file overwrites and minimizing context drift.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-011]

### **[ROAD-REQ-013]** Parallel Research Manager
- **Type:** Functional
- **Description:** Develop a ResearchManager agent to parallelize market, competitive, and technology landscape searches using Serper/Google Search APIs.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-REQ-014]** Source Credibility Scoring
- **Type:** Functional
- **Description:** Implement a scoring system to evaluate the credibility of sources used by research agents.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-013]

### **[ROAD-REQ-015]** Markdown Content Extraction
- **Type:** Technical
- **Description:** Implement a utility to extract clean Markdown content from dynamic or SPA websites, stripping navigation and advertising noise.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-REQ-016]** Architect Agent (Blueprinting)
- **Type:** Functional
- **Description:** Deploy an Architect Agent to generate authoritative high-level documents (PRD, TAS, Security Design, UI/UX Architecture) using Gemini 3 Pro.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-013]

### **[ROAD-REQ-017]** Mermaid.js Auto-Generation
- **Type:** Technical
- **Description:** Automatically generate Mermaid.js diagrams (ERDs, Sequence Diagrams, Site Maps) from architectural specifications.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-016]

### **[ROAD-REQ-018]** Human-in-the-Loop (HITL) Approval Gates
- **Type:** UX
- **Description:** Implement blocking synchronous wait states (Research, Blueprint, Roadmap, Epic Start, Final Validation) requiring user approval to proceed.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-003]

### **[ROAD-REQ-019]** Requirement Distiller
- **Type:** Technical
- **Description:** Implement a "Compiler" to extract atomic requirements from documents and map them to specific Requirement IDs.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-016]

### **[ROAD-REQ-020]** Epic and Task DAG Generator
- **Type:** Technical
- **Description:** Automatically generate a Directed Acyclic Graph (DAG) of 8-16 project epics and 200+ atomic tasks based on distilled requirements.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-019]

### **[ROAD-REQ-021]** RTI (Requirement Traceability Index) Calculator
- **Type:** Technical
- **Description:** Implement a calculator to ensure 100% of "Must-have" requirements are mapped to at least one task in the DAG.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-020]

### **[ROAD-REQ-022]** TDD Implementation Loop
- **Type:** Functional
- **Description:** Implement a Red-Green-Refactor execution loop: Plan Strategy -> Write Failing Test -> Implement Code -> Verify Pass -> Audit -> Commit.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-008], [ROAD-REQ-020]

### **[ROAD-REQ-023]** Red-Phase Gate Verification
- **Type:** Technical
- **Description:** Enforcement that a task MUST fail its test in the sandbox before implementation begins to prevent hallucination-driven success.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-022]

### **[ROAD-REQ-024]** Entropy and Loop Detection
- **Type:** Technical
- **Description:** Detect "logical loops" by hashing terminal outputs and interrupting execution if an agent is failing to make progress.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-022]

### **[ROAD-REQ-025]** Strategy Pivot Agent
- **Type:** Functional
- **Description:** Implement an agent to rethink implementation strategy from first principles when the Entropy Detector identifies a loop or failure.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-024]

### **[ROAD-REQ-026]** Independent Reviewer Agent
- **Type:** Functional
- **Description:** Use a separate agent instance ("Hostile Auditor") to validate functional integrity, architectural fidelity, and documentation density before commits.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-022]

### **[ROAD-REQ-027]** CLI with Ink TUI
- **Type:** UX
- **Description:** Build a Command Line Interface using Ink to provide real-time progress bars and log streaming.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-REQ-028]** VSCode Extension Interface
- **Type:** UX
- **Description:** Develop a VSCode extension with a React/Tailwind webview to provide an interactive "Glass-Box" view of the development process.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-REQ-029]** Interactive DAG Visualization
- **Type:** UX
- **Description:** Provide a visual representation of the Task DAG (D3 or React) allowing users to monitor progress and dependencies.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-020], [ROAD-REQ-028]

### **[ROAD-REQ-030]** Time-Travel (devs rewind)
- **Type:** Functional
- **Description:** Implement a command to synchronize the filesystem (Git) and the state database (SQLite) to a previous Task ID.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-004], [ROAD-REQ-011]

### **[ROAD-REQ-031]** Global Project Validation
- **Type:** Technical
- **Description:** Implement a final validation phase to audit the full project against requirements and run all tests in a clean sandbox.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-022]

### **[ROAD-REQ-032]** Project MCP Server Generation
- **Type:** Technical
- **Description:** Automatically generate an MCP server for every project created by devs to support agentic debugging and profiling.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-REQ-033]** Self-Hosting Capability
- **Type:** Functional
- **Description:** The 'devs' system must be capable of using its own autonomous loop to implement new features for itself.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-022]

### **[ROAD-REQ-034]** Token and Cost Monitoring
- **Type:** Non-Functional
- **Description:** Implement heuristics and real-time tracking for token usage and costs per Epic and Phase.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-REQ-035]** Task Complexity Enforcement
- **Type:** Technical
- **Description:** Enforce a task complexity cap during distillation; tasks estimated to require > 10 implementation turns must be recursively decomposed.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-019]

### **[ROAD-REQ-036]** ACID State Snapshots
- **Type:** Technical
- **Description:** The system must support ACID-compliant state snapshots to ensure zero data loss and perfect resumption after process crashes.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** [ROAD-REQ-004]
