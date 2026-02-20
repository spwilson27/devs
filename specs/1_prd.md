# PRD: devs - Agentic Software Engineering System

## 1. Executive Summary & Goals

### 1.1 Project Overview
**devs** is an autonomous, local-first meta-framework for agentic software engineering. It is engineered to transform high-level project descriptions and user journeys into complete, production-ready, and fully-tested greenfield software projects. Unlike traditional AI coding assistants that operate on localized context for code completion (e.g., GitHub Copilot, Cursor), `devs` orchestrates the entire Software Development Life Cycle (SDLC) through a sophisticated multi-agent system.

The core of `devs` is a **"Glass-Box"** orchestration engine built on `LangGraph.js`, which manages specialized agents for research, architecture, planning, and implementation. The system ensures absolute transparency and steerability by maintaining a unified state graph persisted in SQLite, coupled with Git-based filesystem snapshots and Gemini-native context checkpoints. This allows users to "time-travel" to any point in the project's evolution, branch off new ideas, and intervene with surgical precision.

`devs` is delivered as a unified developer experience:
- **VSCode Extension:** Provides a high-fidelity visual interface for project monitoring, state graph navigation, and interactive decision gates.
- **CLI Tool:** A high-performance interface for headless automation, CI/CD integration, and power-user workflows.
- **MCP Infrastructure:** Every aspect of the system—from internal agent tools to the generated projects themselves—leverages the **Model Context Protocol (MCP)**, ensuring standardized, extensible, and observable interaction between AI agents and the development environment.

### 1.2 Primary Goals & Technical Objectives
*   **[GOAL-001] Autonomous SDLC Orchestration:** Automate the end-to-end transition from initial "Idea" to "Validated Architecture" and "Verified Implementation." The system must autonomously transition through five distinct phases: Research & Discovery, Architectural Specification, Requirement Distillation, ordered Project Planning (Epics/Tasks), and TDD Implementation.
*   **[GOAL-002] Enforced Engineering Rigor (TDD-First):** Mandate a strict Test-Driven Development (TDD) cycle as the primary engine of implementation. Every atomic task must follow a "Test-First" protocol, where implementation is gated by failing tests and final acceptance is gated by both automated validation and a secondary AI "Code Review" agent.
*   **[GOAL-003] Absolute Observability & Time-Travel (Glass-Box):** Implement a robust state-management system that captures every agent turn, tool invocation, and filesystem change. Users must be able to navigate this state graph, inspect agent "memory" (short, medium, and long-term), and resume or "branch" the development process from any historical snapshot without loss of context.
*   **[GOAL-004] Standardized Tool-Agent Interoperability:** Utilize MCP as the universal interface for agents to interact with the local filesystem, shell, debuggers, and profilers. This eliminates proprietary tool-calling silos and ensures the system is extensible via third-party MCP servers.
*   **[GOAL-005] Cognitive & Resource Safety:** Implement active guardrails to prevent AI "trapping" (recursive loops), excessive token consumption, and unauthorized system access. This includes heuristic loop detection (monitoring tool-call patterns and state oscillations) and restricted execution via local sandboxing (Docker or isolated child processes).
*   **[GOAL-006] Generation of "Agentic-Native" Projects:** Every software project produced by `devs` must be "AI-ready" by default. This includes comprehensive documentation (PRD/TAS), 100% test coverage, and a built-in MCP server that allows future AI agents to introspect, debug, and maintain the codebase with the same level of precision as the original creator.

---

## 2. Persona & User Needs Map

### 2.1 Persona 1: Alex (The Maker / Rapid Prototyper)
*   **Focus:** Time-to-Market, MVP validation, and reducing cognitive overhead of boilerplate/research.
*   **Technical Needs:**
    *   **Automated Discovery:** High-signal market, competitive, and technical research without manual searching.
    *   **Authoritative Scaffolding:** Immediate generation of project structure, configuration, and documentation (PRD/TAS) from minimal input.
    *   **Requirement Distillation:** Transitioning from "loose" project descriptions to rigid, implementation-ready requirement lists.
*   **Edge Cases & Risks:**
    *   **Vague Prompts:** How the system handles "I want to build the next Uber" vs. a detailed spec. *Mitigation: Interactive clarification agent.*
    *   **Requirement Drift:** Ensuring the agent doesn't over-engineer beyond the MVP scope.
*   **Key PRD Alignment:** [REQ-007] Research Agents, [REQ-011] Requirement Distillation, [REQ-012] Task Breakdown.

### 2.2 Persona 2: Sarah (The Senior Architect / Tech Lead)
*   **Focus:** Maintainability, architectural integrity, and absolute control over the development process.
*   **Technical Needs:**
    *   **Glass-Box Observability:** Real-time visibility into the agent's "Chain of Thought," tool usage, and internal decision logic.
    *   **Time-Travel & Branching:** The ability to "checkpoint" the project state (Filesystem + Agent Memory) and branch off to test different architectural patterns.
    *   **Intervention API:** A mechanism to pause the agent, inject new constraints (e.g., "Use the Repository Pattern"), and resume or re-generate from that point.
    *   **Audit Trails:** Comprehensive logs of why every architectural decision was made, linked back to the Research Phase.
*   **Edge Cases & Risks:**
    *   **Conflicting Patterns:** User manual intervention conflicting with previously established TAS constraints. *Mitigation: Real-time consistency checking against the 'Long-term Memory' (Global Constraints).*
    *   **State Divergence:** Ensuring filesystem state and agent "memory" of that state remain synchronized after manual edits.
*   **Key PRD Alignment:** [REQ-002] State Management, [REQ-003] Time-Travel, [REQ-004] HITL Control, [REQ-014] Hierarchical Memory.

### 2.3 Persona 3: Jordan (The Polyglot / Consultant)
*   **Focus:** Technical accuracy across diverse stacks and delivering standardized, high-quality codebases to clients.
*   **Technical Needs:**
    *   **Stack-Agnostic Expertise:** Agents must be capable of researching and implementing best practices in unfamiliar languages/frameworks (e.g., Rust/Axum, Go/Temporal).
    *   **Standardized Project Structure:** Every project must follow a predictable, "Agentic-Native" layout for easy maintenance.
    *   **Verification Rigor:** Automated validation that the generated code is not just "working" but idiomatic and secure.
*   **Edge Cases & Risks:**
    *   **Obscure Frameworks:** Agent choosing a bleeding-edge library with poor documentation. *Mitigation: Technology Landscape Agent must prioritize "Stability" and "Documentation Quality" in its decision matrix.*
*   **Key PRD Alignment:** [REQ-007] Technology Landscape Agent, [REQ-013] TDD Loop, [REQ-015] Agentic-Native Projects.

### 2.4 Persona 4: The AI Developer Agent (Internal System Persona)
*   **Focus:** Execution efficiency, accuracy, and adherence to constraints within a restricted environment.
*   **Technical Needs:**
    *   **Hierarchical Memory Access:**
        *   *Short-term:* Recent terminal output, file diffs, and current sub-task context.
        *   *Medium-term:* Current Epic goals and architectural decisions from the TAS.
        *   *Long-term/Global:* Immutable project constraints (e.g., "No external CSS," "Must use TypeScript").
    *   **Standardized Tooling (MCP):** A consistent interface to interact with the shell, filesystem, and debugger.
    *   **Sandboxed Execution:** A secure "playground" (Docker/Sandbox) where it can run tests and execute shell commands without harming the host system.
    *   **Context Management:** Efficient use of the LLM context window (Gemini 1.5 Pro) through pruning and relevance-weighted RAG.
*   **Edge Cases & Risks:**
    *   **Loop Trapping:** Getting stuck in a "fix-test-fail" cycle. *Mitigation: Heuristic loop detection and mandatory escalation to Persona 2 after N failures.*
    *   **Scope Creep:** Attempting to implement features from future Epics. *Mitigation: Strict task-based sandboxing and file-access whitelisting.*
*   **Key PRD Alignment:** [REQ-005] Loop Protection, [REQ-006] Sandboxing, [REQ-014] Hierarchical Memory, [REQ-017] Filesystem Whitelisting.

---

## 3. Detailed Functional Requirements

### 3.1 Orchestration & "Glass-Box" Infrastructure
**[REQ-001] Multi-Interface Access:**
- **VSCode Extension:** Provides a high-fidelity visual interface for project monitoring, state graph navigation, and interactive decision gates. Must support theme synchronization and native VSCode editor integration for "jump-to-file" from agent logs.
- **CLI Tool:** A high-performance, OCLIF-based interface for headless automation, CI/CD integration, and power-user workflows. Must support `--json` output for all diagnostic and status commands.
- **MCP Host Integration:** Both interfaces MUST act as MCP hosts, allowing agents to use standardized tools (filesystem, shell, web search) across different local environments.

**[REQ-002] Unified State Management (The "State Graph"):**
- The system MUST maintain a persistent state graph in SQLite, tracking every **Turn**, **Action**, **Observation**, and **Decision**.
- **Schema Requirements:**
    - `Turns`: Timestamp, AgentID, Prompt, Response, Token Usage, Latency.
    - `Actions`: ToolName, Arguments, Result, Success/Failure status.
    - `Checkpoints`: Reference to a Git Commit Hash + SQLite Snapshot ID + LLM Context State.
- **[REQ-003] Time-Travel & Branching:**
    - **Navigation:** Users MUST be able to "checkout" any historical state. This involves a Git hard reset to the associated commit and a restoration of the agent's memory/context.
    - **Branching:** Users can create a "Fork" from any node in the graph. The system MUST track the lineage of these forks (e.g., `main` -> `feature-1-attempt-2`).
    - **Reconciliation:** If a user manually edits files in the working directory while the agent is paused, the system MUST perform a "State Reconciliation" (re-indexing files and updating the agent's "Short-Term Memory") before resumption.

**[REQ-004] Human-in-the-Loop (HITL) & Steering:**
- **Decision Gates:** Mandatory pauses for user approval after:
    1.  Completion of all Research Reports.
    2.  Finalization of the TAS and Project Roadmap.
    3.  Generation of the Epic/Task list.
- **Context Injection:** Users MUST be able to "chat" with the orchestrator at any time to inject new constraints or redirect the current agent. These injections MUST be flagged as "User Directive" in the memory hierarchy.
- **Intervention UI:** A "Pause and Edit" mode that allows the user to manually fix a failing test or implementation, which the agent then treats as "Ground Truth" for its next iteration.

**[REQ-005] Loop, Cost, & Safety Guardrails:**
- **Heuristic Loop Detection:**
    - **Oscillation:** Detect if the agent reverts a file change it just made within 3 turns.
    - **Stagnation:** Detect if the same tool call with identical arguments fails $N$ times.
- **Resource Quotas:**
    - **Max Tokens/Task:** User-defined limit (default: 50k tokens).
    - **Max Turns/Task:** Hard limit (default: 15 turns) before mandatory human intervention.
- **Token Scrubbing:** Automated masking of regex-detected secrets (API keys, `.env` content) before sending context to the LLM.

**[REQ-006] Sandboxed Execution (The "Agent Playground"):**
- All Implementation Agent commands MUST execute in a restricted environment (Docker container or isolated child process with `seccomp` profiles).
- **Filesystem Whitelisting:** Write access is restricted EXCLUSIVELY to the project root. Attempts to write to unauthorized paths MUST trigger an immediate system shutdown and alert.
- **Network Isolation:** Block all outbound traffic except to authorized domains (e.g., `npmjs.org`, `github.com`) during the Implementation phase.

### 3.2 Phase 1: Research & Discovery
**[REQ-007] Specialized Multi-Agent Research:**
- **Market Research Agent:** Uses Tavily/Exa to pull real-time data on TAM/SAM/SOM, market trends, and growth drivers.
- **Competitive Analysis Agent:** Builds a "Feature Parity Matrix" by analyzing competitor documentation and public repos.
- **Technology Landscape Agent:** Evaluates candidate stacks based on maintainability, compatibility, and "Agentic Friendliness" (strong typing, minimal "magic").
- **Synthesis Agent:** Resolves contradictions between researchers (e.g., Market Research suggests X, but Tech Research says X is deprecated).

**[REQ-008] Standardized Research Artifacts:**
- Reports MUST be stored in `research/` as Markdown with Mermaid diagrams.
- Must include a `summary.json` mapping research findings to specific high-level goals in the PRD.

### 3.3 Phase 2: Architectural Specification
**[REQ-009] Authoritative Document Suite:**
The "Architect Agent" MUST generate a complete suite of documents in the `specs/` directory:
- **PRD (Product Requirements Document):** Goals, non-goals, and success metrics.
- **TAS (Technical Architecture Spec):** Folder structure, data models, API schemas, and design patterns.
- **Security Design:** Threat model (STRIDE) and Identity/Access Management (IAM) plan.
- **UI/UX Design:** User journeys and Mermaid-based wireframes/component hierarchies.
- **[REQ-010] Consistency Enforcement:** A "Linter Agent" MUST verify that the TAS does not violate any goals set in the PRD (e.g., if the PRD says "Offline First," the TAS cannot use a cloud-only database).

### 3.4 Phase 3: Requirement Distillation & Planning
**[REQ-011] Requirement Object Model:**
Every requirement distilled MUST follow this schema:
- `id`: `REQ-XXX` (unique, immutable).
- `source`: Link to the specific document/line number in `specs/`.
- `priority`: P0 (Blocker) to P2 (Nice-to-have).
- `validation_criteria`: A natural language description of how to test this requirement.

**[REQ-012] Hierarchical Planning (Epics to Tasks):**
- **Epic Generation:** 8-16 high-level phases ordered by dependency.
- **Atomic Task Breakdown:** ~25 tasks per epic. Each task MUST be "Atomic" (solvable in < 5 file changes).
- **Traceability Matrix:** A generated `requirements.json` that maps 100% of distilled requirements to specific tasks. The system MUST block the Implementation phase if any requirement is unmapped.

### 3.5 Phase 4: TDD Implementation Lifecycle
**[REQ-013] The "Green-Light" TDD Loop:**
1.  **Context Loading:** Load relevant TAS sections, requirement ID, and global constraints.
2.  **Test Writing:** Implement a test file first. Run it to confirm it fails (Red).
3.  **Implementation:** Modify source code.
4.  **Verification:** Run the specific test + full project suite (Green).
5.  **Refactor & Review:** A separate "Reviewer Agent" audits the code against the TAS and Style Guide.
6.  **Checkpoint:** Automatically commit and snapshot the state graph upon task success.

**[REQ-014] Hierarchical Memory Management:**
- **Short-Term (Task Context):** Rolling window of recent tool calls, file diffs, and compiler/linter errors.
- **Medium-Term (Project Context):** Summary of the current Epic and a "Knowledge Base" of previously solved tasks.
- **Long-Term (Global Constraints):** Stored in `GEMINI.md`. Immutable rules (e.g., "Always use Functional Programming"). Agents MUST check LTM before every implementation turn.
- **Context Management:** Use Gemini 1.5 Pro's 2M context for "Project-Wide" awareness, but utilize "Context Pruning" to keep implementation prompts focused on the current task.

### 3.6 Phase 5: Agentic-Native Capability (MCP)
**[REQ-015] MCP Integration & Exposure:**
- Every project generated MUST include a standardized `mcp-server/` that allows external AI agents to:
    - `list_endpoints`, `get_schema`, `run_tests`, and `read_docs`.
- **Glass-Box Observability:** The `devs` orchestrator MUST be able to "attach" to the generated project's MCP server to verify implementation details during the TDD cycle.

---

## 4. Technical Constraints & Security

### 4.1 Technology Stack Constraints
- **Runtime Environment:**
  - **Node.js (v20+):** Required for the core orchestrator, CLI, and VSCode extension development.
  - **TypeScript:** Strict mode enabled across all internal system code and generated project code to ensure type safety for agentic reasoning.
- **Orchestration & AI:**
  - **LangGraph.js:** The core engine for stateful, cyclic multi-agent workflows. It must handle human-in-the-loop (HITL) transitions and branching logic.
  - **Google Gemini 1.5 Pro/Flash:** Primary LLMs. Pro is used for high-context research and architecture (2M+ tokens); Flash is used for rapid, iterative TDD implementation turns.
  - **LiteLLM / Vercel AI SDK:** Abstraction layers to ensure provider-agnostic LLM communication and support for fallback models (Claude 3.5, GPT-4o).
- **Persistence & State:**
  - **SQLite (Drizzle ORM):** Local-first relational store for structured metadata, turn-by-turn agent memory, and task state tracking.
  - **Git:** Mandatory for filesystem-level versioning. Every successful TDD task completion MUST trigger an automated Git commit with a standardized message.
- **Interfaces:**
  - **VSCode Extension API:** Primary visual head for the "Glass-Box" UI, leveraging Webviews for state graph visualization.
  - **OCLIF (Open CLI Framework):** Framework for the CLI tool, supporting structured JSON output and plugin extensibility.
  - **Model Context Protocol (MCP):** Standardized protocol for all agent-to-tool and agent-to-environment interactions.

### 4.2 Security & Sandboxing
- **[REQ-016] Secret Scrubbing:**
  - **Real-time Masking:** Automated regex-based detection and masking of API keys, Bearer tokens, and sensitive credentials in all logs, telemetry, and LLM prompts.
  - **Pre-emptive Scanning:** Before any implementation phase, the orchestrator must scan the directory for un-ignored `.env` files or hardcoded secrets and alert the user.
- **[REQ-017] Filesystem Isolation:**
  - **Path Whitelisting:** Agent write access is strictly confined to the project root. Attempts to access or modify paths outside this directory (e.g., `~/.ssh`, `/etc`) must trigger an immediate safety shutdown.
  - **Symlink Protection:** Agents are forbidden from following or creating symlinks that resolve outside the project root.
- **[REQ-018] Execution Sandbox:**
  - **Containerization:** All implementation tasks (shell commands, test execution) MUST run within a local Docker container or a restricted child process with `seccomp` profiles.
  - **Network Policy:** Outbound network access is disabled by default during implementation turns, except for authorized package registries (e.g., `npmjs.org`, `pypi.org`, `crates.io`).
  - **Resource Caps:** Hard limits on CPU (e.g., 1 core) and Memory (e.g., 1GB) for agent-spawned processes to prevent local DoS or runaway resource consumption.
- **[REQ-019] Human-in-the-Loop (HITL) for Destructive Actions:**
  - Any command involving destructive filesystem operations (`rm -rf`, `git reset --hard`) or system-level changes requires explicit user confirmation.

### 4.3 Cognitive & Loop Safety
- **[REQ-020] Heuristic Loop Detection:**
  - **Oscillation Detection:** Monitor for "Action Flip-Flops" where an agent repeatedly reverts a file change made in a previous turn.
  - **Stagnation Guard:** Limit of 3 consecutive identical tool-call failures or "No Change" implementations before mandatory suspension and user alert.
- **[REQ-021] Context Window Management:**
  - **Context Caching:** Mandatory use of Gemini-native context caching for large project specifications and TAS documents to reduce latency and cost.
  - **Summary Checkpointing:** Automated pruning of short-term memory through agentic summarization when context exceeds a user-defined threshold (default: 500k tokens).

### 4.4 Data Privacy & Integrity
- **Local-First Architecture:** No source code or documentation is sent to any intermediate `devs` server. All LLM communication occurs directly between the user's machine and the LLM provider.
- **Snapshot Consistency:** Every Git commit hash MUST be cross-referenced with a unique SQLite state ID to ensure perfect "Time-Travel" reconstruction of the AI's internal state at that specific commit.
- **Opt-in Telemetry:** Only anonymized usage metrics (e.g., "Task Duration," "Token Efficiency") are collected, with a clear global opt-out in the CLI and Extension settings.

### 4.5 Agentic Observability (Glass-Box)
- **Chain of Thought (CoT) Logging:** All internal agent reasoning ("thoughts") MUST be persisted and visible to the user in the UI/CLI.
- **Tool-Call Audit:** Every tool invocation (arguments and return values) is recorded with a SHA-256 hash for integrity verification.

---

## 5. Success Metrics & KPIs

### 5.1 Core Engineering & Quality KPIs
- **[KPI-001] First-Pass Task Completion Rate:** Percentage of atomic tasks that pass the full TDD cycle (Red-Green-Refactor) and the "Reviewer Agent" audit on the first attempt without human intervention. (Target: >75%)
- **[KPI-002] Requirement Traceability & Coverage:** 100% of generated code blocks must be mapped to a specific `REQ-XXX` ID. 100% of distilled requirements must be addressed by at least one atomic task and verified by at least one test case.
- **[KPI-003] Regression-Free Implementation:** Percentage of tasks completed where the entire existing project test suite remains green. (Target: 100%)
- **[KPI-004] Automated Test Coverage:** Every generated project must maintain a minimum of 90% line coverage and 100% branch coverage for critical business logic and API endpoints.
- **[KPI-005] Architectural Adherence Score:** A quantitative audit by the "Linter Agent" measuring the implementation's compliance with the patterns, folder structure, and constraints defined in the TAS. (Target: >95% compliance)

### 5.2 Agent Performance & Operational Efficiency
- **[KPI-006] Token Efficiency per Task:** Average number of LLM tokens consumed to successfully move an atomic task from "Pending" to "Verified." This includes all retries within the TDD loop. (Target: < 25,000 tokens for standard tasks).
- **[KPI-007] Mean Time to Verification (MTTV):** The average wall-clock time from the start of an atomic task implementation to its final verification and checkpoint. (Target: < 5 minutes for tasks in the Implementation Phase).
- **[KPI-008] Loop Detection Precision & Recall:** 
    - **Precision:** Percentage of "Loop Detected" alerts that correctly identified a recursive or stagnant agent state. (Target: >95%).
    - **Recall:** Percentage of actual agent loops that were successfully caught by the heuristic before exceeding the `Max Turns/Task` limit. (Target: 100%).
- **[KPI-009] Context Pruning Effectiveness:** The ratio of "high-signal" tokens (relevant to the current task) to "noise" tokens (unrelated project context) in the prompt, as measured by an internal context-scoring agent. (Target: >80% signal).

### 5.3 User Experience, Steerability & "Glass-Box" Trust
- **[KPI-010] User Intervention Frequency:** Average number of manual interventions required per Epic. An intervention is defined as any user-initiated pause, edit, or directive injection. (Target: < 3 interventions per 25 tasks).
- **[KPI-011] Time-Travel Restoration Integrity:** 100% success rate in restoring a project's filesystem, Git state, and agent "Memory Graph" to any historical checkpoint without state divergence.
- **[KPI-012] "Idea-to-Architecture" Velocity:** Total time from the initial user prompt and journeys to a fully approved, consistent set of Research and Architectural documents. (Target: < 15 minutes).
- **[KPI-013] Branching Success Rate:** The percentage of times the orchestrator successfully resumes and completes a project after a user creates a "Development Branch" from a historical node in the state graph.

### 5.4 Security, Safety & Governance
- **[KPI-014] Zero Sandbox Escapes:** Absolute requirement of zero incidents where an agent successfully bypasses filesystem whitelisting, network isolation, or resource caps. (Target: 0).
- **[KPI-015] Secret Leakage Prevention:** Number of times a secret (API key, token, credential) is included in an LLM prompt, detected by the real-time secret scrubbing engine. (Target: 0).
- **[KPI-016] Unauthorized Tool Access:** Number of times an agent attempts to invoke a tool or MCP capability that is not explicitly whitelisted for its current persona or phase. (Target: 0).

### 5.5 "Agentic-Native" Maturity & Observability
- **[KPI-017] MCP Interface Coverage:** Percentage of the generated project's core functionality (logic, data access, diagnostics) that is exposed via its internal MCP server for future agentic interaction. (Target: >85%).
- **[KPI-018] Documentation Completeness:** 100% of generated public APIs and internal modules must have accompanying JSDoc/TSDoc and Markdown documentation stored in the `docs/` directory.
- **[KPI-019] State Graph Granularity:** Ensuring that 100% of tool invocations and "Agent Thoughts" are captured in the SQLite state store with sub-millisecond precision timestamps.

---

## 6. Out of Scope / Non-Goals

The following areas are explicitly excluded from the current scope of the `devs` project. These decisions are made to maintain focus on the core "Idea-to-Verified-Code" mission and to ensure system reliability.

*   **[NON-001] Legacy Codebase Migration & Refactoring:** `devs` is strictly a greenfield project generator. It is not designed to ingest, refactor, or migrate existing "brownfield" codebases. While it can reference external libraries, it will not attempt to "fix" or "modernize" an existing legacy system.
*   **[NON-002] Production Infrastructure Management (DevOps):** `devs` will generate infrastructure-as-code (IaC) artifacts (e.g., `Dockerfile`, `docker-compose.yaml`, `terraform` scripts) as part of the implementation. However, it will **not** manage cloud provisioning, deployment pipelines, DNS, or server monitoring. The "Last Mile" of deployment remains the responsibility of the human user.
*   **[NON-003] Real-time Multi-user Collaboration:** The state management and "Time-Travel" features are optimized for a single human operator directing the agent. Synchronous multi-user editing or "pair-programming" with multiple humans in the same `devs` session is not supported.
*   **[NON-004] High-Fidelity Artistic Design:** While the UI/UX agents generate functional wireframes, component hierarchies, and CSS themes, `devs` is not a graphic design tool. It does not generate original logos, high-fidelity brand assets (Figma/Adobe XD files), or perform artistic "creative" design beyond standard UI patterns.
*   **[NON-005] Long-term Lifecycle Management (ALM):** `devs` is a development tool, not an Application Lifecycle Management (ALM) or Project Management (Jira/Linear) platform. Once the project reaches the "Finished" state as defined in the Roadmap, `devs`' primary role ends. It is not intended for multi-year ticket tracking or maintenance beyond its "Agentic-Native" maintenance capabilities.
*   **[NON-006] Production Secret Management:** `devs` handles the scaffolding for authentication and secret injection (e.g., generating `.env.example` or AWS Secrets Manager code). However, it will **never** manage or store real production secrets, API keys, or certificates. Users must manually provide these during the implementation phase via secure local methods.
*   **[NON-007] Legal, Regulatory, or Compliance Certification:** The "Security Design" and "Market Research" reports are generated for informational purposes to guide development. They do **not** constitute legal advice, nor do they guarantee compliance with GDPR, SOC2, HIPAA, or other regulations. A human expert must still audit the final output.
*   **[NON-008] Training or Fine-Tuning LLMs:** `devs` uses existing LLMs (Gemini, Claude, GPT) through RAG and context injection. It does not perform fine-tuning, training, or local model weight modification based on the project data.
*   **[NON-009] Mobile App Store Submission:** For mobile projects (Flutter, Compose), `devs` will generate the source code and build scripts. It will not handle the Apple App Store or Google Play Store submission, review process, or developer account management.
*   **[NON-010] Proprietary Hardware/Embedded Driver Development:** `devs` focuses on standard software stacks (Web, CLI, API, Mobile). It does not support development for proprietary hardware interfaces, real-time operating systems (RTOS), or kernel-level driver development unless they are accessible via standard Linux/POSIX APIs.

---

## 7. Risks & Unknowns

### 7.1 Technical & Architectural Risks
*   **[RISK-001] Context Window Bloat & Performance Degradation:**
    - **Description:** Even with Gemini 1.5 Pro's 2M token window, extremely long-running projects with deep histories, thousands of files, and complex dependency trees can exhaust the context or cause significant latency/cost spikes.
    - **Mitigation:** Implementation of hierarchical memory pruning, context-aware RAG for non-critical files, and mandatory "State Summarization" checkpoints every N turns.
*   **[RISK-002] State Divergence (The "Split Brain" Problem):**
    - **Description:** A critical risk where the filesystem state (Git), the agent's internal memory, and the SQLite state graph fall out of sync. This typically occurs after unmonitored manual user edits or partial tool-call failures.
    - **Mitigation:** Mandatory "State Reconciliation" pulses before every agent turn; using Git as the ultimate source of truth for the filesystem and SQLite for the "Agent Intent" graph.
*   **[RISK-003] MCP Protocol Fragility & Interoperability Gaps:**
    - **Description:** Relying on the Model Context Protocol (MCP) as a universal interface assumes consistent implementation across third-party tools. Breaking changes in the MCP specification or buggy servers could paralyze the "Glass-Box" debugging loop.
    - **Mitigation:** Strict version pinning for internal MCP servers; implementation of a "Standard Tooling" fallback layer that uses native shell/FS commands if MCP fails.
*   **[RISK-004] Sandbox Escape & Host System Integrity:**
    - **Description:** Implementation agents execute shell commands and tests. Maliciously crafted or accidental code (e.g., `rm -rf /`, network probes, or credential exfiltration) could theoretically bypass Docker or child-process isolation.
    - **Mitigation:** Zero-network-access policies by default; strict seccomp profiles for Linux-based execution; mandatory user approval for any command targeting paths outside the project root.
*   **[RISK-005] Non-Deterministic Architectural Drift:**
    - **Description:** LLM non-determinism may lead to inconsistent TAS/PRD generation from identical prompts. This makes the "Time-Travel" and "Branching" logic harder to debug if the agent's "reasoning path" cannot be perfectly reproduced.
    - **Mitigation:** Persistence of the full LLM context (including system prompts and temperature settings) in the SQLite state store for every decision node.

### 7.2 Process & Agentic Risks
*   **[RISK-006] Recursive Stagnation (The "Test-Fix" Death Loop):**
    - **Description:** An agent may get trapped in a loop where fixing one test failure introduces a regression elsewhere, or where it repeatedly attempts the same failed implementation due to lack of diverse reasoning.
    - **Mitigation:** Heuristic loop detection (REQ-005); mandatory agent "Persona Swap" (e.g., calling a fresh 'Senior Auditor' persona) after 3 failed implementation turns.
*   **[RISK-007] Hallucinated Engineering Rigor:**
    - **Description:** Agents might optimize for "Green Tests" by writing tautological or shallow tests (e.g., `expect(true).toBe(true)`) rather than meaningful assertions, creating a false sense of security.
    - **Mitigation:** A separate "Validation Agent" whose only task is to review the *quality* and *relevance* of the tests before implementation begins.
*   **[RISK-008] Signal Loss during Context Pruning:**
    - **Description:** To manage the context window, the system must prune old "turns." There is a risk that a critical architectural constraint from Phase 2 (TAS) is discarded, causing the agent to violate it in Phase 4 (Implementation).
    - **Mitigation:** Protection of "Long-term Memory" (GEMINI.md) from pruning; weighted summarization that prioritizes "Directives" over "Observations."

### 7.3 Security & Data Risks
*   **[RISK-009] Prompt Injection & Supply Chain Poisoning:**
    - **Description:** The Research Agent might pull in a malicious third-party library discovered during the "Tech Landscape" phase, or the user's initial prompt might contain "jailbreak" attempts to bypass safety guardrails.
    - **Mitigation:** Real-time secret scrubbing (REQ-016); automated security scanning (e.g., `npm audit`, `snyk`) of all suggested dependencies before they are written to the TAS.
*   **[RISK-010] Accidental Production Data Leakage:**
    - **Description:** If a user provides production logs or data as "Context" during an intervention, the agent might inadvertently commit this data to the repo or include it in subsequent prompts to the LLM.
    - **Mitigation:** PII/Secret scrubbing on all user-injected text; explicit warnings when the system detects large blobs of pasted text in the intervention UI.

### 7.4 Critical Unknowns
*   **[UNKNOWN-001] Optimal Intervention Frequency:** What is the "Golden Ratio" of agent autonomy vs. user control? Excessive gates lead to user fatigue, while too few lead to unrecoverable architectural drift.
*   **[UNKNOWN-002] Dynamic Dependency Resolution:** How should the system handle breaking changes in third-party libraries that are released *between* the Research phase and the Implementation phase?
*   **[UNKNOWN-003] Cross-Language MCP Standardization:** Can MCP provide a truly uniform interface for debugging and profiling across radically different execution environments (e.g., Compiled Rust vs. Interpreted Python)?
*   **[UNKNOWN-004] Scaling the State Graph:** For enterprise-scale projects with 1,000+ tasks, will the SQLite-based state graph remain performant, or will it require transition to a more robust graph-database backend?
*   **[UNKNOWN-005] User Intent Ambiguity:** To what degree can the "Clarification Agent" resolve vague or contradictory user journeys before they cause downstream failures in the TDD loop?
*   **[UNKNOWN-006] LLM "Common Sense" in UX:** Can an AI agent accurately predict and implement high-quality UX/UI (UI/UX Design Phase) without a real human-subject feedback loop during the wireframing stage?
