# Technical Requirements: TAS (Technical Architecture Specification)

### **[TAS-001]** Glass-Box Transparency & Auditability
- **Type:** Technical
- **Description:** Every state transition and agent reasoning step is persisted to a local SQLite database (`.devs/state.sqlite`). This serves as the "Flight Recorder" for the project, allowing human developers or auditor agents to understand *why* a specific architectural decision was made.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-002]** Stateless & Resumable Orchestration
- **Type:** Technical
- **Description:** The core engine is stateless; the entire project context (Agent memory, requirement DAGs, and task status) is reloaded from the project's `.devs/` directory. This ensures resilience against system crashes or network interruptions.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-003]** Native Agentic Observability (MCP)
- **Type:** Technical
- **Description:** The generated project is natively "Agent-Ready." It includes a built-in MCP server that exposes internal state, logs, and profiling data, allowing AI agents to debug and optimize the code they write using the same tools a human expert would use.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-004]** Strict TDD-Driven Implementation
- **Type:** Technical
- **Description:** Implementation is non-negotiable and follows a mandatory "Red-Green-Refactor" cycle. Code is only written once a failing test case has been established in the sandbox, ensuring 100% requirement fulfillment.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-005]** Programming Language (TypeScript)
- **Type:** Technical
- **Description:** Mandatory use of TypeScript 5.4+ in Strict Mode (`strict: true`, `noImplicitAny: true`, and `exactOptionalPropertyTypes: true`) to ensure type safety in the complex multi-agent state machine.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-006]** Package Manager (pnpm)
- **Type:** Technical
- **Description:** Use of `pnpm` v9.x in a monorepo workspace structure for core logic, CLI, and extension packages, utilizing content-addressable storage to minimize disk footprint.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-007]** Primary Reasoning Model (Gemini 3 Pro)
- **Type:** Technical
- **Description:** Google Gemini 3 Pro is used for its 1M+ token context window, high-level research, architectural design, and complex implementation tasks.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-008]** Utility & Review Model (Gemini 3 Flash)
- **Type:** Technical
- **Description:** Google Gemini 3 Flash is employed for low-latency tasks including code linting, unit test generation, and real-time summarization of agent execution logs.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-009]** Orchestration Engine (LangGraph.js)
- **Type:** Technical
- **Description:** `LangGraph.js` orchestrates the multi-agent workflow as a stateful, cyclical graph, utilizing a custom `SQLiteSaver` for persistence.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-010]** Relational State Store (SQLite 3)
- **Type:** Technical
- **Description:** SQLite 3 via `better-sqlite3` is used for relational state, configured with WAL mode and synchronous NORMAL for high-throughput ACID compliance.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-011]** Vector Memory (LanceDB)
- **Type:** Technical
- **Description:** LanceDB is used for long-term semantic memory, storing embeddings of project requirements, architectural decisions, and user preferences.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-012]** Filesystem & Change Tracking (Git)
- **Type:** Technical
- **Description:** `simple-git` is used for atomic state snapshots. Every successful task completion results in a git commit to the target repository.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-013]** Agent Sandboxing
- **Type:** Security
- **Description:** Isolated execution environment using Docker Engine (CLI mode) or WebContainers API (Extension mode) with restricted profiles and network access.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-014]** Model Context Protocol (MCP) Integration
- **Type:** Technical
- **Description:** Full integration of `@modelcontextprotocol/sdk` to standardize agent tools and expose orchestrator internal state.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-015]** User Approval Gate
- **Type:** UX
- **Description:** Explicit user sign-off required at Phase 2 (Blueprint Generation) before the project can proceed to distillation.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-016]** Short-term Memory
- **Type:** Technical
- **Description:** In-context task logs, recent tool calls, and local file contents within the active context window.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-017]** Medium-term Memory
- **Type:** Technical
- **Description:** Epic-level decisions and recently resolved task summaries stored in SQLite `agent_logs`.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-018]** Long-term Memory
- **Type:** Technical
- **Description:** Project-wide constraints, TAS architecture, and user preferences stored in LanceDB.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-019]** Deterministic Entropy Detection
- **Type:** Technical
- **Description:** Monitoring of agent loops by hashing the last 3 error outputs; triggers a strategy pivot if repetition is detected.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-020]** Escalation Pause
- **Type:** UX
- **Description:** After 5 total failures for a task, the system executes an escalation pause for human intervention.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-021]** Sandbox Resource Constraints
- **Type:** Technical
- **Description:** Sandboxes are limited to 2 vCPUs, 4GB RAM, 2GB ephemeral storage, and 300s timeout per tool call.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-013]

### **[TAS-022]** Network Egress Control
- **Type:** Security
- **Description:** Default Deny network policy in sandboxes, with allow-list restricted to specific registries during dependency installation.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-013]

### **[TAS-023]** Secret Masking & Redaction
- **Type:** Security
- **Description:** Middleware layer intercepts sandbox stdout/stderr and redacts API keys, credentials, or PII using regex and entropy-based detection.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-024]** Context Pruning
- **Type:** Technical
- **Description:** When task context exceeds 800k tokens, the system summarizes the earliest 50% of the log using the Flash model.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-025]** Dependency Deadlock Handling
- **Type:** Technical
- **Description:** If a DeveloperAgent attempts to install a package conflicting with the TAS, the ReviewerAgent blocks the commit and triggers TAS reconciliation.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-026]** Rate Limit Handling
- **Type:** Technical
- **Description:** Exponential backoff (2s to 60s) for LLM API calls with state persistence before retries.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-027]** Real-time Search Integration
- **Type:** Technical
- **Description:** Google Search API (via Serper) for validating documentation and gathering competitive intelligence.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-028]** Content Extraction
- **Type:** Technical
- **Description:** Use of `Firecrawl` or `Jina Reader` to convert web content into LLM-optimized Markdown.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-029]** View Layer (React)
- **Type:** Technical
- **Description:** React 18+ with Tailwind CSS for the VSCode Webview dashboard.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-030]** Component Architecture (VSCode UI)
- **Type:** UX
- **Description:** Use of `vscode-webview-ui-toolkit` for seamless integration with VSCode themes.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-031]** Documentation Rendering (Mermaid)
- **Type:** UX
- **Description:** `Mermaid.js` for dynamic rendering of architectural diagrams and roadmaps within Markdown previews.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-032]** Orchestrator Verification (Vitest)
- **Type:** Technical
- **Description:** `Vitest` for unit and integration testing of agent nodes and state transitions.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-033]** Automated Code Auditing
- **Type:** Technical
- **Description:** Integration of `ESLint`, `Prettier`, and language-specific static analysis tools in the TDD loop.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-035]** Structured Agent-Orchestrator Protocol (SAOP)
- **Type:** Technical
- **Description:** All agent-orchestrator interactions must follow the SAOP specification, separating reasoning, strategy, and tool execution.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-036]** MCP Standardization
- **Type:** Technical
- **Description:** Use of MCP standard for a unified, modular interface for all tool-based operations.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-038]** Real-time Trace & Event Streaming (RTES)
- **Type:** Technical
- **Description:** Real-time event bus to synchronize state between the core and user interfaces.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-039]** Persistence & Inter-Agent Handoff
- **Type:** Technical
- **Description:** All state transitions must be persistent and stateless; handoffs occur via shared database state.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-010]

### **[TAS-040]** Generated Project Directory Structure
- **Type:** Technical
- **Description:** Standardized directory structure for generated projects, separating orchestrator state, agent documentation, and production code.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-041]** TDD Verification & Binary Gate Protocol
- **Type:** Technical
- **Description:** Use of deterministic exit-code gates (RED, GREEN, REGRESSION, QUALITY) to control task progression.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-042]** Agent-Oriented Documentation (AOD)
- **Type:** Technical
- **Description:** Documentation written specifically for AI agents, providing context, intent, and agentic hooks.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-043]** Generated Project MCP API
- **Type:** Technical
- **Description:** Every generated project must include an internal MCP server for post-delivery maintenance and observability.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-044]** Standardized Specifications (Docs)
- **Type:** Technical
- **Description:** Standardized Markdown files (PRD, TAS, etc.) generated during Phase 1 & 2 as source of truth.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-045]** Modular Source & Test Structure
- **Type:** Technical
- **Description:** `src/` and `tests/` directories structured for modularity, with file headers linking to REQ-IDs.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-046]** Full Traceability
- **Type:** Technical
- **Description:** Every agent thought, decision, tool call, and terminal output is captured and queryable.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-047]** Stateful Determinism
- **Type:** Technical
- **Description:** The system can be paused, resumed, or rewound to any previous state (Task/Epic) with 100% fidelity.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-048]** Gated Autonomy (HITL)
- **Type:** UX
- **Description:** Explicit checkpoints where users must approve architectural blueprints and roadmaps.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-049]** Phase 1: Discovery & Research
- **Type:** Functional
- **Description:** Deployment of parallel agents to analyze the market, technology landscape, and competitive space.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-050]** Phase 2: Blueprint Generation
- **Type:** Functional
- **Description:** Architect Agent generates authoritative PRDs and TAS documents; ends with user approval.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-015]

### **[TAS-051]** Phase 3: Requirement Compilation
- **Type:** Functional
- **Description:** Distiller Agent translates documents into atomic requirements and a Task DAG.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-052]** Phase 4: TDD Implementation
- **Type:** Functional
- **Description:** Iterative execution of tasks following the Red-Green-Refactor cycle.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-004]

### **[TAS-053]** Phase 5: Full System Validation
- **Type:** Functional
- **Description:** Global Reviewer agent runs the entire test suite and verifies documentation density.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-054]** Snapshot-at-Commit Strategy
- **Type:** Technical
- **Description:** State management strategy where git snapshots, trace persistence, and vector memory updates occur after every successful task.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-012]

### **[TAS-055]** Git Snapshots
- **Type:** Technical
- **Description:** Commits code changes to the project's Git repository after every successful task.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-012]

### **[TAS-056]** Trace Persistence
- **Type:** Technical
- **Description:** Persists the agent's reasoning trace to the SQLite database after every task.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-010]

### **[TAS-057]** Vector Memory Updates
- **Type:** Technical
- **Description:** Updates the Vector DB with any new architectural decisions made during a task.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-011]

### **[TAS-058]** Trace Streaming
- **Type:** Technical
- **Description:** Real-time websocket streaming of agent "Thoughts" to the VSCode UI.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-059]** Decision Logs
- **Type:** Technical
- **Description:** Searchable history of every alternative the agent considered but rejected.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-060]** Runtime Environment (Node.js)
- **Type:** Technical
- **Description:** Core orchestrator runs on Node.js v22.x (LTS).
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-061]** .devs Directory (Internal State)
- **Type:** Technical
- **Description:** Internal orchestrator state directory containing SQLite, LanceDB, and trace logs; excluded from agent write-access.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-062]** mcp-server Directory
- **Type:** Technical
- **Description:** Standalone project implementing the Model Context Protocol for application observability.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-014]

### **[TAS-063]** Requirement Mapping
- **Type:** Technical
- **Description:** Every function and test in the generated codebase is tagged with a REQ-ID for auditability.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-064]** Entropy Detection Loop Prevention
- **Type:** Technical
- **Description:** Real-time monitoring of agent loops; pauses and alerts user if a strategy repeats 3 times.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-019]

### **[TAS-065]** Standardized Observation Format
- **Type:** Technical
- **Description:** Tool outputs must be returned in a standardized JSON structure with content, exit code, and context hints.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-066]** Relational Source of Truth
- **Type:** Technical
- **Description:** The SQLite database is the primary source of truth for the project's state machine and audit logs.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-010]

### **[TAS-067]** ACID-Compliant Transactions
- **Type:** Technical
- **Description:** All database tables use ACID-compliant transactions to ensure consistency during multi-agent handoffs.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-010]

### **[TAS-068]** Orphaned Requirements Verification
- **Type:** Technical
- **Description:** System verifies that every requirement is mapped to at least one task during Phase 3.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-069]** State Recovery
- **Type:** Technical
- **Description:** Ability to reconstruct the requirement map from code comments/documentation if the `.devs` folder is deleted.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-070]** Concurrency Management
- **Type:** Technical
- **Description:** DB writes use WAL mode and row-level locking to prevent corruption during parallel agent execution.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-010]

### **[TAS-071]** Scaling Traces
- **Type:** Technical
- **Description:** Archival strategy for `agent_logs` exceeding 100MB, moving them to compressed JSON files.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-072]** Command Execution Flow
- **Type:** Technical
- **Description:** Validated tool call flow: agent -> core -> sandbox -> logs -> result -> agent.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-073]** State Checkpointing Flow
- **Type:** Technical
- **Description:** Automatic ACID commit to SQLite after every node transition in LangGraph.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-010], [TAS-009]

### **[TAS-074]** Cross-Agent Verification Flow
- **Type:** Technical
- **Description:** DeveloperAgent success triggers ReviewerAgent in a clean sandbox for independent TDD verification.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-075]** Data Locality
- **Type:** Technical
- **Description:** Agents must not hold long-term state internally; all findings must be written to the shared database.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-076]** Version Manifest
- **Type:** Technical
- **Description:** `package.json` must include a `devs` section for project-level metadata (ID, version, stack).
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-077]** Toolset Scoping
- **Type:** Technical
- **Description:** Tools are exposed to agents based on the current Phase and Epic context.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-014]

### **[TAS-078]** Orchestration Layer (LangGraph.js)
- **Type:** Technical
- **Description:** Use of LangGraph.js to manage high-level state machine, handoffs, and signaling.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-079]** Agent Suite (Specialized Agents)
- **Type:** Technical
- **Description:** Collection of specialized agents (Research, Architect, Developer, Reviewer) with dedicated prompts and tools.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-080]** Execution Layer (Isolated Sandbox)
- **Type:** Technical
- **Description:** Isolated Docker or WebContainer environment for file I/O, tests, and shell commands.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-081]** Memory Layer (Tiered)
- **Type:** Technical
- **Description:** Tiered memory system consisting of Short-term, Medium-term, and Long-term storage.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-082]** User Input (Briefs/Journeys)
- **Type:** Functional
- **Description:** System accepts short project descriptions and example user journeys as initial input.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-083]** Cyclical Refinement Pattern
- **Type:** Technical
- **Description:** Data flow pattern: Expansion -> Compression -> Decomposition -> Execution -> Verification.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-091]** Embedding Model (text-embedding-004)
- **Type:** Technical
- **Description:** Use of `text-embedding-004` (768 dimensions) for semantic embeddings in LanceDB.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-011]

### **[TAS-092]** Indexing Strategy (IVF-PQ)
- **Type:** Technical
- **Description:** Use of Inverted File with Product Quantization (IVF-PQ) for indexing vector memory.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-011]

### **[TAS-093]** Vector Schema
- **Type:** Technical
- **Description:** LanceDB schema including id, vector, content, type, metadata, and timestamp.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-011]

### **[TAS-094]** State Machine Checkpoints
- **Type:** Technical
- **Description:** LangGraph graph state is persisted as a Checkpoint object (Binary/JSON) in SQLite.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-009], [TAS-010]

### **[TAS-095]** Project Rewind Capability
- **Type:** Technical
- **Description:** Restore both filesystem (Git) and DB state (SQLite) to any historical Task ID.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-012], [TAS-010]

### **[TAS-096]** Module Architecture (Monorepo)
- **Type:** Technical
- **Description:** Monorepo structure with clear dependencies between cli, vscode, core, agents, sandbox, memory, and mcp.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-097]** Core Orchestration Engine Responsibilities
- **Type:** Technical
- **Description:** `@devs/core` handles state transitions, persistence, event bus, and HITL management.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-098]** Agent Intelligence Responsibilities
- **Type:** Technical
- **Description:** `@devs/agents` handles LLM logic, prompts, tool bindings, and reasoning protocols.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-099]** Isolated Execution Responsibilities
- **Type:** Technical
- **Description:** `@devs/sandbox` handles secure shell execution, file operations, and driver management.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-100]** Memory Persistence Responsibilities
- **Type:** Technical
- **Description:** `@devs/memory` handles vector store integration, context pruning, and memory refreshing.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-101]** Communication Protocol Responsibilities
- **Type:** Technical
- **Description:** `@devs/mcp` standardizes orchestrator and project MCP servers and tool proxies.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-102]** User Interface Responsibilities
- **Type:** Technical
- **Description:** `@devs/cli` and `@devs/vscode` handle user interaction, environment setup, and real-time reporting.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-103]** Orchestration Graph Nodes
- **Type:** Technical
- **Description:** Defined lifecycle nodes: Research, Design, Distill, and the TDD Implementation Loop.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-009]

### **[TAS-104]** Top-Level Directory Overview
- **Type:** Technical
- **Description:** Defined project root structure including .devs, .agent, mcp-server, src, tests, docs, etc.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-105]** Projects Table Schema
- **Type:** Technical
- **Description:** SQL schema for project metadata, phase tracking, and status.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-010]

### **[TAS-106]** Documents Table Schema
- **Type:** Technical
- **Description:** SQL schema for document versions, content, and approval status.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-010]

### **[TAS-107]** Requirements Table Schema
- **Type:** Technical
- **Description:** SQL schema for atomic requirements, priority, and fulfillment status.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-010]

### **[TAS-108]** Epics Table Schema
- **Type:** Technical
- **Description:** SQL schema for high-level project phases and roadmap order.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-010]

### **[TAS-109]** Tasks Table Schema
- **Type:** Technical
- **Description:** SQL schema for implementation tasks, mapping to REQ-IDs and git commits.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-010]

### **[TAS-110]** Agent Logs Table Schema
- **Type:** Technical
- **Description:** SQL schema for detailed "Glass-Box" audit logs of agent reasoning and tool usage.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-010]

### **[TAS-111]** Entropy Events Table Schema
- **Type:** Technical
- **Description:** SQL schema for tracking repeating failures and loop detection events.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-010]

### **[TAS-112]** Turn Envelope Schema (SAOP)
- **Type:** Technical
- **Description:** Strictly-typed JSON structure for every interaction turn, including analysis, intent, and commands.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-035]

### **[TAS-113]** RTES Event Types and Payloads
- **Type:** Technical
- **Description:** Defined event types: THOUGHT_STREAM, TOOL_LIFECYCLE, BUFFER_PULSE, and HITL_BLOCK.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-038]

### **[TAS-114]** Git State Correlation
- **Type:** Technical
- **Description:** Mapping of every task transition to a Git HEAD hash for environment restoration.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-012]

### **[REQ-GOAL-004]** Agent-Ready Debugging Blueprint
- **Type:** Technical
- **Description:** Blueprint for the MCP server that is injected into every generated project to enable "Agent-Ready" debugging and observability.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[REQ-SEC-003]** Git/Devs State Protection
- **Type:** Security
- **Description:** Protection of `.git` and `.devs` directories from unintended agent modification within the sandbox.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[REQ-SYS-001]** Sliding-Window Context Management
- **Type:** Technical
- **Description:** Sophisticated context pruning to ensure agents stay within the 1M token limit without losing critical architectural context.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[RISK-401]** Sandbox Latency
- **Type:** Technical
- **Description:** Docker container overhead for every task execution (Red, Green, Lint) may introduce significant latency.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[RISK-402]** Extension Memory Limits
- **Type:** Technical
- **Description:** Running the full orchestrator inside a VSCode extension may hit memory limits, especially with large Vector DB indexes.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[RISK-601]** Monorepo Complexity
- **Type:** Technical
- **Description:** Potential complexity in mapping requirements if the generated project evolves into a monorepo.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[RISK-602]** Documentation Drift
- **Type:** Technical
- **Description:** Potential for source code and agent-oriented documentation to drift over time.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[RISK-801]** Non-UTF8 Tool Output
- **Type:** Technical
- **Description:** Handling binary data or non-standard characters in terminal outputs could crash the JSON-based SAOP.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[RISK-802]** Context Window Exhaustion
- **Type:** Technical
- **Description:** Long-running implementation tasks with heavy test failures can quickly fill the 1M token context window.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[UNKNOWN-401]** WebContainer Feature Support
- **Type:** Technical
- **Description:** Uncertainty if `WebContainers` will support all features required by complex backend projects (e.g., specific native dependencies).
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[UNKNOWN-601]** SQLite Persistence Strategy
- **Type:** Technical
- **Description:** Decision on whether `.devs/state.sqlite` should be committed to Git or remain local.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[UNKNOWN-602]** Hidden File Handling
- **Type:** Technical
- **Description:** Determination of how the system should handle "Hidden" project files (e.g., `.vscode/settings.json`) that influence the agent's environment.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[UNKNOWN-801]** Parallel Turn Execution
- **Type:** Technical
- **Description:** Requirement to determine if the SAOP schema needs to support multi-agent parallel turn execution.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[UNKNOWN-802]** Sandbox Transient Flakiness
- **Type:** Technical
- **Description:** Strategy for handling transient errors in the sandbox (e.g., network timeouts) without triggering entropy detection.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None
