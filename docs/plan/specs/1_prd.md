# Product Requirements Document (PRD): Project 'devs'

## 1. Executive Summary & Goals

### 1.1 Project Vision
'devs' is a next-generation agentic AI system engineered to automate the end-to-end lifecycle of greenfield software development. It serves as a "Virtual Engineering Team," capable of taking a minimal project brief and translating it into a fully documented, tested, and production-ready codebase. Unlike first-generation AI assistants that focus on isolated code completion, 'devs' prioritizes architectural integrity, empirical verification, and long-term maintainability. The ultimate vision is a system where a single developer can oversee the creation of complex, high-quality software systems that are natively "Agent-Ready"—meaning they are optimized for both human maintenance and future AI-driven evolution.

### 1.2 Core Philosophy: The Glass-Box Orchestrator
The 'devs' system is built on five non-negotiable architectural pillars that ensure the output is professional-grade, audit-ready, and resilient:

1.  **[1_PRD-REQ-PIL-001] Research-First Methodology**: No code is written until the problem space, competitive landscape, and technology options are exhaustively analyzed. This prevents "architectural drift" and ensures the stack is optimal for the specific use case.
2.  **[1_PRD-REQ-PIL-002] Architecture-Driven Development (ADD)**: Every project must have a validated PRD and TAS before implementation begins. This "blueprint-first" approach ensures that the agents are building against a stable, human-approved design.
3.  **[1_PRD-REQ-PIL-003] Strict TDD (Test-Driven Development) Loop**: Implementation follows a rigorous "Red-Green-Refactor" cycle. Every feature is validated by automated tests executed in a secure sandbox *before* the task is marked as complete. Tests are the primary source of truth for requirement fulfillment.
4.  **[1_PRD-REQ-PIL-004] Agentic Observability & Traceability (Glass-Box)**: Every decision, tool call, and reasoning step is logged and queryable. The user can inspect the "thought process" of any agent at any time, eliminating the "Black-Box" mystery of autonomous systems.
5.  **[1_PRD-REQ-PIL-005] MCP-Native (Model Context Protocol)**: Both the 'devs' orchestrator and the projects it generates are built with native support for the Model Context Protocol. This enables deep introspection, debugging, and profiling via standardized interfaces, allowing agents to "understand" the code they are writing and the environment it runs in.

### 1.3 High-Level Business & Technical Goals

#### [1_PRD-REQ-GOAL-001] Radical Compression of Time-to-Market (TTM)
*   **Objective**: Compress the traditional discovery, architecture, and initial build phases from weeks to hours/days.
*   **Outcome**: A functional, production-ready MVP delivered at a fraction of the cost of traditional teams, without sacrificing quality.

#### [1_PRD-REQ-GOAL-002] Elimination of Architectural Debt and "Boilerplate Tax"
*   **Objective**: Automate the generation of standardized, clean-code project foundations.
*   **Outcome**: Every project adheres to modern patterns (Clean Architecture, SOLID, Hexagonal) out of the box, ensuring that rapid prototyping does not lead to long-term maintainability issues.

#### [1_PRD-REQ-GOAL-003] Absolute User Agency & Intervention Control
*   **Objective**: Provide a "Human-in-the-Loop" experience that allows for granular monitoring and mid-stream adjustments.
*   **Outcome**: Users have explicit approval checkpoints at every critical junction (Research, Architecture, Roadmap, Implementation) and can provide feedback that agents must incorporate immediately.

#### [1_PRD-REQ-GOAL-004] Standardizing "Agent-Ready" Software
*   **Objective**: Every project produced by 'devs' must include a built-in MCP server for introspection and comprehensive agent-oriented documentation.
*   **Outcome**: The resulting software is natively optimized for maintenance by both humans and AI agents, reducing the friction for future automated updates or debugging.

#### [1_PRD-REQ-GOAL-005] Deterministic Reliability via Multi-Agent Verification
*   **Objective**: Establish a "Zero-Defect" baseline by mandating a 100% pass rate on all generated tests within a sandboxed environment.
*   **Outcome**: Use multi-agent cross-verification (e.g., a Developer Agent checked by a separate Reviewer Agent) to ensure logic fidelity and security.

#### [1_PRD-REQ-GOAL-006] Proactive Entropy Detection & Resource Efficiency
*   **Objective**: Implement monitoring to prevent agents from getting trapped in infinite loops or wasting tokens on failing strategies.
*   **Outcome**: The system detects lack of progress (entropy) and automatically pauses for human intervention after a predefined threshold of failed attempts.

#### [1_PRD-REQ-GOAL-007] Multi-Tiered Context & Memory Management
*   **Objective**: Maintain consistent project context across long-running development cycles.
*   **Outcome**: Implementation of Short-term (task-specific), Medium-term (Epic/Phase), and Long-term (Project-wide constraints/decisions) memory to ensure agents never "forget" architectural decisions or user preferences.

#### [1_PRD-REQ-GOAL-008] Secure, Sandboxed Autonomy
*   **Objective**: Ensure that autonomous agents cannot damage the host system or execute unsafe operations.
*   **Outcome**: All code execution, dependency installation, and testing must occur within a strictly isolated environment (Docker/WebContainers) with restricted network and filesystem access.

### 1.4 Technical Constraints & Edge Cases

*   **[1_PRD-REQ-CON-001] Rate Limiting & Token Management**: The system must gracefully handle LLM API rate limits, implementing exponential backoff and prioritizing critical reasoning tasks over routine code reviews.
*   **[1_PRD-REQ-CON-002] State Persistence & Recovery**: Every state change (from requirement distillation to task completion) must be persisted locally. The system must be able to resume from any point after a crash, network failure, or user-initiated pause.
*   **[1_PRD-REQ-CON-003] Conflict Resolution**: In cases where the Reviewer Agent and Developer Agent disagree, the system must either attempt an automated resolution turn or escalate to the user.
*   **[1_PRD-REQ-CON-004] Context Window Optimization**: Despite the large context window of Gemini 3 Pro, the system must implement efficient context pruning to ensure that the most relevant information (current task requirements, relevant file context, and architectural constraints) is prioritized.
*   **[1_PRD-REQ-CON-005] Dependency Management**: The system must ensure that agents do not introduce conflicting or insecure third-party dependencies during the implementation phase.

### 1.5 Risks & Unknowns

*   **Risk**: **Reasoning Depth Limits**. While Gemini 3 Pro is highly capable, extremely complex architectural patterns might still require human intervention to guide the agent.
*   **Risk**: **Token Costs**. End-to-end project generation involves high token counts. The system must provide cost estimates and monitoring.
*   **Risk**: **Sandbox Escape**. While sandboxing is a requirement, ensuring 100% isolation from the host system while allowing necessary tool access is a non-trivial engineering challenge.
*   **Unknown**: **Performance of Agentic Profiling**. The effectiveness of using agents to profile and optimize code via MCP is an experimental area and may require significant tuning.
*   **Unknown**: **Requirement Stability**. If a user changes a high-level requirement late in the implementation phase, the cost and complexity of "re-architecting" the already implemented tasks may be high.

### 1.6 Strategic Differentiation
'devs' distinguishes itself from general-purpose agents (e.g., Devin) and IDE-centric tools (e.g., Cursor) by focusing on the **Greenfield Architectural Core**. While competitors excel at editing existing code or simple web-app scaffolding, 'devs' is designed to be the definitive tool for **starting right**, ensuring that the very first commit of a project is built on a foundation of rigorous research, validated architecture, and mandatory testing. It is the only system that treats "Agent-Readiness" as a first-class citizen of the generated codebase.

## 2. Persona & User Needs Map

The 'devs' system is designed to serve a diverse set of human stakeholders and the AI agents that perform the work. Each persona has unique requirements for transparency, control, and technical output.

### 2.1 Persona Matrix

| Persona | Primary Objective | Key Pain Point | Success Metric |
| :--- | :--- | :--- | :--- |
| **The Maker (Agile Alex)** | Rapid MVP delivery. | Boilerplate tax & setup time. | Time-to-first-commit < 1hr. |
| **The Architect (Structured Sarah)** | Long-term maintainability. | AI "magic" & architectural drift. | 100% TAS-to-Code fidelity. |
| **The Domain Expert (Polyglot Paul)** | Bridging tech knowledge gaps. | "JS Fatigue" & stack complexity. | Depth of Research reports. |
| **The AI Developer Agent** | Autonomous task execution. | Context loss & tool failure. | Task completion autonomy > 90%. |
| **The 'devs' Creator** | System-level optimization. | Debugging complex orchestrations. | Orchestrator test coverage > 95%. |

### 2.2 Detailed Persona Profiles & Requirements

#### 2.2.1 The Maker (Founder / Solopreneur)
*   **Profile**: High-level vision, low-to-medium implementation bandwidth. Focused on business logic and user journeys.
*   **User Needs**: 
    *   **[1_PRD-REQ-NEED-MAKER-01]** Instant project scaffolding without manual configuration.
    *   **[1_PRD-REQ-NEED-MAKER-02]** Clear, non-technical progress summaries (Epics/Milestones).
    *   **[1_PRD-REQ-NEED-MAKER-03]** Cost and token usage estimation per project phase.
*   **Technical Edge Cases**: 
    *   User provides extremely vague project descriptions ("Make a social media for dogs").
    *   User wants to change the UI framework midway through Epic 3.
    *   User interrupts the agent during a long-running implementation task.

#### 2.2.2 The Architect (Technical Lead / Senior Engineer)
*   **Profile**: Expert-level knowledge. Deeply skeptical of AI-generated "spaghetti code." Values clean architecture, SOLID principles, and exhaustive testing.
*   **User Needs**:
    *   **[1_PRD-REQ-NEED-ARCH-01]** Strict enforcement of specific patterns (e.g., "Must use Functional Programming with Effect-TS").
    *   **[1_PRD-REQ-NEED-ARCH-02]** Granular approval of TAS and PRD before code generation.
    *   **[1_PRD-REQ-NEED-ARCH-03]** Automated Reviewer Agents that catch "anti-patterns" or security flaws.
*   **Technical Edge Cases**: 
    *   The Developer Agent proposes a library that is deprecated or has known CVEs.
    *   The Architect Agent generates a TAS that is logically inconsistent with the PRD.
    *   The user rejects a task completion because the agent used "any" in TypeScript, even if the test passed.

#### 2.2.3 The Domain Specialist (The Learner / Cross-Stack Dev)
*   **Profile**: Expert in one domain (e.g., Python Data Science) building in another (e.g., React/TypeScript). Uses the agent as a mentor and implementation partner.
*   **User Needs**:
    *   **[1_PRD-REQ-NEED-DOMAIN-01]** High-fidelity "Research Reports" explaining the "Why" behind tech choices.
    *   **[1_PRD-REQ-NEED-DOMAIN-02]** Agentic profiling via MCP to explain performance bottlenecks in unfamiliar code.
    *   **[1_PRD-REQ-NEED-DOMAIN-03]** Interactive "Q&A" sessions with the Architect Agent regarding the TAS.
*   **Technical Edge Cases**: 
    *   User requests a technology that is poorly suited for the task (e.g., using a Relational DB for high-frequency time-series data).
    *   Agent generates code that is "correct" but uses obscure, hard-to-understand syntax for a learner.

#### 2.2.4 The AI Developer Agent (Internal Stakeholder)
*   **Profile**: The autonomous worker that executes the plan. Requires stable environment and precise constraints.
*   **User Needs**:
    *   **[1_PRD-REQ-NEED-AGENT-01]** **Long-Term Context**: Access to project-wide architectural decisions (TAS) during every task.
    *   **[1_PRD-REQ-NEED-AGENT-02]** **Tool-Rich Environment**: Seamless MCP access to file system, terminal, and live profilers.
    *   **[1_PRD-REQ-NEED-AGENT-03]** **Determinism**: Consistent behavior from the Sandbox and Test Runner.
*   **Technical Edge Cases**: 
    *   **Token Limit Reach**: The task context becomes so large it hits the 1M token limit (rare but possible in massive refactors).
    *   **Ambiguous Requirements**: Two requirements from different documents contradict each other.
    *   **Sandbox Isolation**: The agent tries to access a local network resource that is blocked by the Docker sandbox.

#### 2.2.5 The 'devs' Creator (Meta-Persona)
*   **Profile**: The engineer building 'devs' itself. Focused on observability of the multi-agent system.
*   **User Needs**:
    *   **[1_PRD-REQ-NEED-DEVS-01]** Detailed tracing of "Agent-to-Agent" communication.
    *   **[1_PRD-REQ-NEED-DEVS-02]** "Time-Travel" debugging: The ability to rewind the system state to a previous task or Epic.
    *   **[1_PRD-REQ-NEED-DEVS-03]** System-wide profiling to identify which agent phase is the slowest or most token-intensive.
*   **Technical Edge Cases**: 
    *   State corruption in the SQLite project database.
    *   The Orchestrator itself gets stuck in a recursive loop between the Distiller and the Epic Generator.
    *   Version mismatch between the VSCode extension and the CLI tool.

### 2.3 User Needs & Requirement Mapping

| Requirement ID | Persona | Need | Implementation Detail |
| :--- | :--- | :--- | :--- |
| **[1_PRD-REQ-MAP-001]** | Maker | Speed | Parallelized Research Agents (Market/Comp/Tech). |
| **[1_PRD-REQ-MAP-002]** | Architect | Auditability | Persistent decision log in `.devs/state.sqlite`. |
| **[1_PRD-REQ-MAP-003]** | Domain | Learning | Research reports must include "Pros/Cons" and "Trade-offs" sections. |
| **[1_PRD-REQ-MAP-004]** | Agent | Tooling | MCP servers MUST be injected into the Sandbox on startup. |
| **[1_PRD-REQ-MAP-005]** | Creator | Observability | Real-time streaming of LangGraph state to VSCode Sidebar. |
| **[1_PRD-REQ-MAP-006]** | All | Reliability | Mandatory entropy detection (Max 3 retries per task). |

### 2.4 Critical Human-in-the-Loop Checkpoints

To ensure the "Glass-Box" philosophy, the following checkpoints are hard-coded into the orchestration engine:

1.  **[1_PRD-REQ-HITL-001] Phase 1 Completion**: User must approve the Research Suite (Market, Comp, Tech, User).
2.  **[1_PRD-REQ-HITL-002] Architecture Suite Approval**: User must sign off on PRD and TAS before the Distiller runs.
3.  **[1_PRD-REQ-HITL-003] Roadmap & Epic Review**: User must approve the sequence of 8-16 Epics.
4.  **[1_PRD-REQ-HITL-004] Epic Start**: User can review the 25+ tasks for the upcoming Epic and add/remove tasks.
5.  **[1_PRD-REQ-HITL-005] Task Failure**: If an agent hits the entropy limit, the system MUST hand off to the user for manual correction or requirement adjustment.

## 3. Detailed Functional Requirements

### 3.1 Orchestrator Interface & Multi-Modal Access
*   **[1_PRD-REQ-INT-001] CLI Operability**: The system MUST be operable via a terminal interface (e.g., `devs init`, `devs run`, `devs status`).
*   **[1_PRD-REQ-INT-005] CLI Headless Mode**: Support for `--json` output for all commands to allow integration into CI/CD pipelines or other scripts.
*   **[1_PRD-REQ-INT-006] CLI State Control**: Commands to `pause`, `resume`, `rewind` (to specific task/epic), and `skip` current operations.
*   **[1_PRD-REQ-INT-002] VSCode Extension**: 
    *   **[1_PRD-REQ-INT-007] VSCode Project Dashboard**: A dedicated sidebar view showing the status of the current Epic, a progress bar for the overall project, and a tree-view of all Tasks.
    *   **[1_PRD-REQ-INT-008] VSCode Document Editor**: Integrated Markdown preview and editor for PRD, TAS, and other generated documents with "Sync & Regenerate" capabilities.
    *   **[1_PRD-REQ-INT-009] VSCode Agent Console**: A streaming log view that differentiates between "Thoughts" (internal reasoning), "Actions" (tool calls), and "Observations" (tool output).
    *   **[1_PRD-REQ-INT-010] VSCode Human-in-the-Loop Popups**: Visual prompts for approvals at defined checkpoints.
*   **[1_PRD-REQ-INT-003] MCP Orchestrator Server**: 
    *   **[1_PRD-REQ-INT-011] MCP State Exposure**: The 'devs' system MUST expose its own internal state via an MCP server.
    *   **[1_PRD-REQ-INT-012] MCP Assistant Querying**: This allows the user's primary AI assistant (e.g., Gemini in VSCode) to query the `devs` status, read requirements, and inspect the task DAG directly.
*   **[1_PRD-REQ-INT-004] Real-time State Synchronization**: 
    *   **[1_PRD-REQ-INT-013] Real-time State Sharing**: The CLI and VSCode extension MUST share a common state file (`.devs/state.json` or SQLite) to ensure seamless switching between interfaces.

### 3.2 Phase 1: Autonomous Research (Deep Discovery)
**[1_PRD-REQ-RES-007] Research Agent Deployment & Scoring**: The system MUST deploy specialized agents to generate a research suite. Every report MUST include a "Confidence Score" (0-100) and a list of cited sources.
*   **[1_PRD-REQ-RES-001] Market & Competitive Analysis**:
    *   **Deliverable**: A combined report identifying 5+ competitors, their feature sets, pricing models (where public), and a SWOT analysis for the proposed project.
    *   **Source Validation**: Agents MUST prioritize official documentation, reputable tech blogs, and GitHub repositories over generic marketing copy.
*   **[1_PRD-REQ-RES-002] Technology Landscape & Decision Matrix**:
    *   **Evaluation Criteria**: Stacks MUST be evaluated against: Performance, Scalability, Community Support, Type Safety, and "Agent-Friendliness" (ease of automated testing/profiling).
    *   **Decision Matrix**: A weighted comparison of at least 2 viable stacks (e.g., Next.js/Supabase vs. FastAPI/PostgreSQL).
*   **[1_PRD-REQ-RES-003] User Persona & Journey Mapping**:
    *   **Deliverable**: Detailed profiles for 3+ personas (User, Admin, Developer).
    *   **Journey Visualization**: Mermaid.js sequence diagrams for the "Primary Value Journey" (the core thing the app does).
*   **[1_PRD-REQ-RES-004] Research Edge Cases**:
    *   **[1_PRD-REQ-RES-005] Niche Markets**: If no direct competitors are found, the agent MUST analyze "Adjacent Markets" or "Manual Workarounds" currently used by the target personas.
    *   **[1_PRD-REQ-RES-006] Stale Data Prevention**: Agents MUST perform a live search to ensure recommended libraries are not deprecated (e.g., checking last commit date on GitHub).

### 3.3 Phase 2: High-Level Documentation (Agent-Ready Blueprints)
**[1_PRD-REQ-DOC-011] Machine-Readable Document Schema**: The system MUST generate authoritative documents. Each document MUST follow a strict schema to ensure they are machine-readable by the Distiller Agent.
*   **[1_PRD-REQ-DOC-001] PRD (Product Requirements Document)**:
    *   MUST include: Goals, Non-Goals, User Stories (Gherkin format preferred), and high-level Constraints.
*   **[1_PRD-REQ-DOC-002] TAS (Technical Architecture Specification)**:
    *   **[1_PRD-REQ-DOC-006] System Layout**: Detailed folder structure proposal.
    *   **[1_PRD-REQ-DOC-007] Data Model**: Mermaid.js ERD (Entity Relationship Diagram).
    *   **[1_PRD-REQ-DOC-008] API/Interface Contracts**: Definition of core internal interfaces (e.g., TypeScript interfaces or Protobuf definitions).
*   **[1_PRD-REQ-DOC-003] MCP & Glass-Box Architecture**:
    *   Specification for the project's internal MCP server.
    *   Definition of "Introspection Points": Where the agent will hook in to profile or debug the system.
*   **[1_PRD-REQ-DOC-004] UI/UX Design System**:
    *   Definition of color palettes, typography, and core component library (e.g., Tailwind + Radix UI).
    *   **[1_PRD-REQ-DOC-009] Site Map**: Mermaid.js Site Map showing page hierarchy.
*   **[1_PRD-REQ-DOC-005] Security & Mitigation Plan**:
    *   Threat model identifying at least the Top 3 security risks.
    *   **[1_PRD-REQ-DOC-010] Mitigation Strategies**: Mitigation strategies for each risk (e.g., "Use Zod for input validation to prevent injection").

### 3.4 Phase 3: Requirement Distillation & Roadmap Generation
*   **[1_PRD-REQ-PLAN-001] Atomic Requirement Extraction**: 
    *   The Distiller Agent MUST parse all Phase 1 & 2 docs to extract unique, non-overlapping requirements.
    *   Each requirement MUST be: **Atomic** (one thing), **Testable** (can be verified by code), and **Traceable** (points back to a document section).
*   **[1_PRD-REQ-PLAN-002] Epic & Task Orchestration**:
    *   **[1_PRD-REQ-PLAN-006] Epic Count**: 8-16 phases, each representing a logical milestone (e.g., "Epic 1: Auth & User Profiles").
    *   **[1_PRD-REQ-PLAN-004] Task Granularity**: 25+ tasks per Epic. A task is considered "Too Large" if its estimated LoC change exceeds 200 lines.
    *   **[1_PRD-REQ-PLAN-005] Task Definition**: Every task MUST include: `ID`, `Title`, `Description`, `Input Files`, `Success Criteria (Tests)`, and `Dependencies`.
*   **[1_PRD-REQ-PLAN-003] Dependency DAG**:
    *   The system MUST generate a Directed Acyclic Graph of all tasks.
    *   The scheduler MUST support parallel task execution where no dependencies exist (within the same Epic).

### 3.5 Phase 4: TDD Implementation & Verification Loop
**[1_PRD-REQ-IMP-013] Deterministic Execution Engine**: This is the core execution engine. It MUST be deterministic and resilient.
*   **[1_PRD-REQ-IMP-001] Sandbox Lifecycle Management**:
    *   **[1_PRD-REQ-IMP-010] Provisioning**: For each task, the orchestrator MUST spin up a fresh sandbox (Docker container or WebContainer).
    *   **[1_PRD-REQ-IMP-006] Pre-flight**: The sandbox MUST be injected with: the current codebase, the task requirements, and the necessary MCP tools.
    *   **[1_PRD-REQ-IMP-007] Cleanup**: Sandboxes MUST be persisted to a "Suspended" state on failure to allow user debugging, and destroyed on success.
*   **[1_PRD-REQ-IMP-002] Strict TDD Cycle**:
    *   **Step A (Red)**: Agent writes a test that covers the task requirement. Test MUST FAIL in the sandbox.
    *   **Step B (Green)**: Agent implements the code. Test MUST PASS.
    *   **Step C (Validation)**: The Reviewer Agent runs *all* tests in the current Epic to ensure no regressions.
*   **[1_PRD-REQ-IMP-003] Agentic Memory & Decision Logging**:
    *   **Short-term**: Local file context and recent tool calls.
    *   **Medium-term**: Decisions made within the current Epic (e.g., "We chose library X over Y").
    *   **Long-term**: Project-wide constraints (e.g., "Never use 'any' in TypeScript"). Stored in `.devs/memory.lancedb`.
*   **[1_PRD-REQ-IMP-004] Git Strategy & Atomic Commits**:
    *   **[1_PRD-REQ-IMP-011] Git Repository Management**: The system MUST manage a git repository for the generated project.
    *   **[1_PRD-REQ-IMP-008] Atomic Commits**: Each task completion MUST result in a commit. The commit message MUST include the Task ID and a concise summary of the change.
*   **[1_PRD-REQ-IMP-005] Entropy Detection & Automated Backoff**:
    *   **[1_PRD-REQ-IMP-012] Strategy Shift**: If a task fails the TDD loop 3 times, the agent MUST attempt a "Strategy Shift" (e.g., "I will try a different library" or "I will simplify the implementation").
    *   **[1_PRD-REQ-IMP-009] Automated Hand-off**: After 5 total failures, the system MUST pause and hand off to the user with a detailed "Failure Report" and logs.

### 3.6 Cross-Cutting System Requirements
*   **[1_PRD-REQ-SYS-001] Token Optimization**:
    *   The system MUST implement intelligent context pruning, keeping only the TAS, current Epic requirements, and the file(s) being edited in the active context window.
    *   Use of "Summarization Handoffs" between Epics to reduce noise.
*   **[1_PRD-REQ-SYS-002] Crash Recovery**:
    *   The orchestrator MUST be fully stateless. Any interruption (power loss, network drop) MUST allow for a `devs resume` that picks up at the exact same task and state.
*   **[1_PRD-REQ-SYS-003] Multi-Model Orchestration**:
    *   **Architect Agent**: MUST use Gemini 3 Pro (High Reasoning).
    *   **Developer Agent**: MUST use Gemini 3 Pro (Complex Implementation).
    *   **Reviewer/Linter Agent**: MAY use Gemini 3 Flash (Speed & Cost Efficiency).
*   **[1_PRD-REQ-SYS-004] Agentic Profiling via MCP**:
    *   The generated project MUST support an MCP server that allows the developer agent to run the code, capture performance traces, and inspect variables during the TDD loop.

## 4. User Intervention & Control

The 'devs' system is built on a "Human-in-the-Loop" (HITL) philosophy, ensuring that while the agents are autonomous, the user remains the ultimate authority. This section defines the mechanisms for monitoring, steering, and overriding the agentic orchestrator.

### 4.1 The Approval Framework (Gated Autonomy)
**[1_PRD-REQ-UI-017] Mandatory Approval Gates**: The system MUST implement mandatory "Wait-for-Approval" gates at critical architectural junctions. No agent may proceed past these gates without an explicit signature (CLI confirm or VSCode button press).

*   **[1_PRD-REQ-UI-001] Research Suite Sign-off**: 
    - **Trigger**: Completion of Market, Tech, Competitive, and User reports.
    - **User Action**: Review reports for accuracy and alignment with vision. 
    - **System Behavior**: Agents are blocked from starting Phase 2 until approval.
*   **[1_PRD-REQ-UI-002] Architecture Suite Sign-off**: 
    - **Trigger**: Generation of PRD, TAS, Security, and UI/UX documents.
    - **User Action**: Validate technical stack, data models, and interface contracts.
    - **System Behavior**: This is the most critical gate. Approval "freezes" the architecture for the Distillation phase.
*   **[1_PRD-REQ-UI-003] Roadmap & Task DAG Approval**: 
    - **Trigger**: Distiller produces the 8-16 Epics and 200+ Tasks.
    - **User Action**: Review the dependency graph and task granularity.
    - **Capabilities**: User MUST be able to delete, merge, or re-order tasks at this stage.
*   **[1_PRD-REQ-UI-004] Epic Commencement Checkpoint**: 
    - **Trigger**: Start of a new Epic.
    - **User Action**: Quick review of the upcoming ~25 tasks.
    - **Outcome**: Allows for "Just-in-Time" adjustments based on progress in previous Epics.

### 4.2 "Glass-Box" Observability & Real-time Monitoring
**[1_PRD-REQ-UI-018] Transparency and Exposure**: To eliminate the "Black-Box" problem, every internal state change and reasoning step must be exposed to the user.

*   **[1_PRD-REQ-UI-005] Live Trace Streaming**: 
    - The orchestrator MUST stream a real-time log of:
        - **Thoughts**: The agent's internal reasoning/planning.
        - **Actions**: The specific tool call being made (e.g., `read_file`, `npm test`).
        - **Observations**: The raw output from the tool.
    - **Implementation**: VSCode "Agent Console" or CLI `--verbose` mode.
*   **[1_PRD-REQ-UI-006] Visual Task Progress (DAG View)**: 
    - A real-time visualization of the task dependency graph.
    - **States**: `Pending`, `In-Progress` (with active agent ID), `Completed`, `Failed`, `Paused`.
*   **[1_PRD-REQ-UI-007] Tool Call Interception (Safety Mode)**: 
    - A configurable "Safe Mode" where the system MUST prompt for approval before executing any command that modifies the filesystem outside of the `/src` directory or performs network requests.

### 4.3 Mid-Stream Intervention & Directives
Users require the ability to "course-correct" agents without restarting the entire project.

*   **[1_PRD-REQ-UI-008] Global Pause/Resume**: 
    - Immediate suspension of all active agents. State MUST be persisted to SQLite, allowing for a clean resume even after a system reboot.
*   **[1_PRD-REQ-UI-009] Mid-Task Context Injection (Directives)**: 
    - Users MUST be able to "Whisper" to the agent during a task.
    - **Example**: "Use `fetch` instead of `axios` for this specific module."
    - **Logic**: The directive is appended to the agent's short-term memory and takes precedence over the TAS for that specific task.
*   **[1_PRD-REQ-UI-010] Task Skip & Manual Completion**: 
    - If an agent is struggling with a trivial UI alignment task, the user can manually fix the code and mark the task as `Manual-Complete`.
*   **[1_PRD-REQ-UI-011] Project Rewind (Time-Travel)**: 
    - The ability to revert the project to the state of a specific `Task ID`.
    - **Action**: Resets the git HEAD to that task's commit and updates the SQLite state.

### 4.4 Automated Escalation & Entropy Management
The system must recognize when it is stuck and proactively "ask for help" rather than wasting tokens.

*   **[1_PRD-REQ-UI-012] Entropy Pause (Max-Retry Threshold)**: 
    - If a task fails the TDD loop 3 times, the orchestrator MUST pause and present a "Failure Analysis" to the user.
    - **Analysis Includes**: The failing test case, the agent's 3 implementation attempts, and the error logs from the sandbox.
*   **[1_PRD-REQ-UI-013] Agent-Initiated Clarification (AIC)**: 
    - When an agent detects a logical contradiction (e.g., PRD says "Use Postgres", TAS says "Use MongoDB"), it MUST emit a `USER_CLARIFICATION_REQUIRED` event.
    - The agent MUST provide a clear summary of the conflict and proposed resolution options.

### 4.5 Resource, Budget & Safety Controls
*   **[1_PRD-REQ-UI-014] Token/Cost Budgeting**: 
    - Hard and soft limits on USD/Token spend per Epic.
    - **Soft Limit (80%)**: Warning notification.
    - **Hard Limit (100%)**: Immediate pause and wait for budget increase.
*   **[1_PRD-REQ-UI-015] Sandbox Escape Monitoring**: 
    - Real-time monitoring of agent filesystem/network access. Any attempt to access paths outside the project root or unauthorized domains triggers an immediate "Security Pause."
*   **[1_PRD-REQ-UI-016] Deterministic "Snapshot" Points**: 
    - Before starting any "Large" or "Experimental" task (as flagged by the Architect), the system MUST create a filesystem snapshot to ensure 100% reliable recovery.

## 5. Security, Reliability & Performance

The 'devs' system operates in a high-stakes environment where autonomous agents execute code and make architectural decisions. This section defines the rigorous standards for isolation, reliability, and efficiency required to ensure the system is safe, deterministic, and performant.

### 5.1 Agentic Sandboxing & Environment Isolation
All AI-generated code execution MUST be strictly isolated from the host machine to prevent accidental or malicious damage.

*   **[1_PRD-REQ-SEC-001] Mandatory Containerization**: Every task involving code execution, dependency installation, or automated testing MUST occur within a fresh, ephemeral sandbox (e.g., Docker or WebContainers).
*   **[1_PRD-REQ-SEC-002] Network Egress Control**: 
    *   **[1_PRD-REQ-SEC-002] Deny-All Policy**: Sandboxes MUST operate on a "Deny-All" network policy by default.
    *   **[1_PRD-REQ-SEC-008] Explicit Allow-lists**: Explicit allow-lists MUST be implemented for:
        - Known package managers (npm, pip, cargo) during dependency installation phases.
        - Specific user-approved external APIs if required by the research phase.
*   **[1_PRD-REQ-SEC-003] Filesystem Integrity**: 
    *   **[1_PRD-REQ-SEC-003] Write Access**: The sandbox MUST only have write access to the specific project directory (`/workspace`).
    *   **[1_PRD-REQ-SEC-009] Host Protection**: The host's `.git` and `.devs` directories MUST be mounted as read-only or excluded entirely from the sandbox to prevent agents from corrupting project state or history.
*   **[1_PRD-REQ-SEC-004] Resource Quotas**: 
    *   **[1_PRD-REQ-SEC-004] CPU/Memory Restrictions**: Each sandbox MUST be restricted to a maximum CPU (e.g., 2 cores) and Memory (e.g., 4GB) usage to prevent "Fork Bombs" or memory leak attacks from consuming host resources.
    *   **[1_PRD-REQ-SEC-010] Execution Time Cap**: Execution time MUST be capped at 5 minutes per tool call; exceeding this triggers an immediate "Process Kill" and failure log.

### 5.2 LLM Security & Data Privacy
Protecting sensitive information and ensuring the integrity of agent reasoning is paramount.

*   **[1_PRD-REQ-SEC-005] Automated Secret & PII Redaction**: 
    *   **[1_PRD-REQ-SEC-005] Redaction Scanner**: All agent logs, reasoning traces, and tool outputs MUST be passed through a regex-based and LLM-assisted scanner before being persisted to the SQLite database.
    *   **[1_PRD-REQ-SEC-011] Secret Replacement**: Detected secrets (API keys, AWS tokens, SSH keys) MUST be replaced with `[REDACTED]`.
*   **[1_PRD-REQ-SEC-006] Prompt Injection Mitigation**: 
    *   **[1_PRD-REQ-SEC-006] Untrusted Input Handling**: All external research data (web scrapes, competitor docs) MUST be treated as "Untrusted Input."
    *   **[1_PRD-REQ-SEC-012] Structured Prompting**: The system MUST use structured prompting and delimited sections (e.g., `<untrusted_context>`) to minimize the risk of data-driven prompt injection overriding agent instructions.
*   **[1_PRD-REQ-SEC-007] Dependency Vulnerability Scanning**: 
    *   **[1_PRD-REQ-SEC-007] Security Audit**: The Developer Agent MUST run a security audit (e.g., `npm audit`) after every dependency installation.
    *   **[1_PRD-REQ-SEC-013] Vulnerability Trigger**: Any "High" or "Critical" vulnerability MUST trigger a task failure and an immediate "Risk & Mitigation" update.

### 5.3 Reliability, Fault Tolerance & Loop Prevention
The system MUST be resilient to LLM hallucinations and transient errors.

*   **[1_PRD-REQ-REL-001] Entropy & Loop Detection**: 
    *   **[1_PRD-REQ-REL-001] Delta Monitoring**: The orchestrator MUST monitor the "Semantic Delta" between task attempts.
    *   **[1_PRD-REQ-REL-005] Strategy Pivot**: If the agent generates the same error or identical code across 3 consecutive turns, the system MUST flag "Strategy Entropy" and force a reasoning pivot or pause for human intervention.
*   **[1_PRD-REQ-REL-002] Maximum Turn & Token Budgets**: 
    *   **[1_PRD-REQ-REL-002] Turn Limit**: Every task MUST have a hard limit of 10 implementation turns and a token budget (e.g., 200k tokens).
    *   **[1_PRD-REQ-REL-006] Token Budget**: Exceeding these limits triggers an automatic `PAUSE` and a detailed failure report presented to the user.
*   **[1_PRD-REQ-REL-003] Deterministic State Recovery (ACID Compliance)**: 
    - All project state transitions MUST be persisted to the local `.devs/state.sqlite` database using ACID-compliant transactions.
    - The system MUST support `RESUME` from any interrupted state (crash, network loss) by re-loading the last successful Task Snapshot.
*   **[1_PRD-REQ-REL-004] Multi-Agent Cross-Verification**: 
    - Implementation tasks MUST be verified by a separate "Reviewer Agent" with a different system prompt.
    - The Reviewer Agent MUST independently execute the generated tests in a clean sandbox before marking a task as `PASSED`.

### 5.4 Performance & Resource Optimization
Scaling to 200+ tasks requires efficient management of LLM context and system resources.

*   **[1_PRD-REQ-PERF-001] Context Window Compression & Pruning**: 
    *   **[1_PRD-REQ-PERF-001] Sliding Window**: While leveraging Gemini's 1M+ token window, the system MUST implement a "Sliding Relevance Window."
    *   **[1_PRD-REQ-PERF-004] Summarization Handoffs**: Older task logs and reasoning MUST be summarized and moved to "Medium-term Memory" (Vector DB) to keep the active context window focused on the TAS, PRD, and current task requirements.
*   **[1_PRD-REQ-PERF-002] Tiered Model Orchestration**: 
    - **Tier 1 (Pro)**: Gemini 3 Pro used for Research, Architecture, and Task Implementation.
    - **Tier 2 (Flash)**: Gemini 3 Flash used for routine Code Review, Linting, and simple Unit Test generation to minimize latency and cost.
*   **[1_PRD-REQ-PERF-003] Parallel Task Execution**: 
    - The orchestrator MUST identify independent tasks within the same Epic and execute them in parallel sandboxes where possible, respecting the Dependency DAG.

### 5.5 Agentic Observability & Profiling (The Glass-Box)
The generated project MUST be natively optimized for inspection and debugging by both humans and agents.

*   **[1_PRD-REQ-OBS-001] Native MCP Server Integration**: 
    *   Every project generated by 'devs' MUST include a standardized MCP server (`/mcp-server`) that provides:
        - **[1_PRD-REQ-OBS-001] Introspection**: Read access to internal state, logs, and environment variables.
        - **[1_PRD-REQ-OBS-004] Execution**: Ability to run specific modules or tests in isolation.
        - **[1_PRD-REQ-OBS-005] Profiling**: Access to CPU/Memory traces during execution.
*   **[1_PRD-REQ-OBS-002] Agent-Oriented Documentation (AOD)**: 
    *   Each module MUST include a `.agent.md` file (or equivalent JSDoc/Docstrings) that explicitly defines:
        - **[1_PRD-REQ-OBS-002] Intent**: "Why" the module exists (intent).
        - **[1_PRD-REQ-OBS-006] Testability**: "How" to test it.
        - **[1_PRD-REQ-OBS-007] Edge Cases**: Known "Edge Cases" and constraints for future developer agents.
*   **[1_PRD-REQ-OBS-003] Real-time State Tracing**: 
    - All internal "Agent-to-Agent" communication and tool calls MUST be streamed to the `.devs/trace.log` for real-time monitoring via the VSCode Extension.

## 6. Success Metrics & KPIs

To ensure 'devs' meets the high standards of a "Virtual Engineering Team," success will be measured across five dimensions: Autonomy, Quality, Efficiency, Resilience, and User Agency. Each metric is designed to be programmatically verifiable where possible.

### 6.1 Core Performance KPIs (The "North Star" Metrics)

*   **[1_PRD-REQ-MET-001] Task Autonomy Rate (TAR)**:
    *   **Definition**: The percentage of tasks within an Epic completed from "Pending" to "Approved" without human intervention (no mid-task directives or manual code fixes).
    *   **Target**: >85% for standard implementation tasks; >70% for complex architectural refactors.
    *   **Edge Case**: Tasks that require a "Strategy Shift" (internal retry) but still succeed autonomously are counted as successful but flagged for "Efficiency Analysis."
*   **[1_PRD-REQ-MET-002] Time-to-First-Commit (TTFC)**:
    *   **Definition**: Total clock time from the initial `devs init` command to the first successful implementation commit in Phase 4.
    *   **Target**: < 60 minutes for a standard web application project description.
*   **[1_PRD-REQ-MET-003] Requirement Traceability Index (RTI)**:
    *   **Definition**: The percentage of atomic requirements extracted in Phase 3 that are mapped to at least one passing test case and one code block in the final repository.
    *   **Target**: **100%**. Any requirement not explicitly verified by a test is a project-level failure.

### 6.2 Architectural & Engineering Quality Metrics

*   **[1_PRD-REQ-MET-004] Architectural Fidelity Score (AFS)**:
    *   **Definition**: A comparison between the proposed TAS (Technical Architecture Specification) folder structure/dependency graph and the final implemented repository.
    *   **Target**: < 5% variance (e.g., no unplanned top-level directories or circular dependencies not approved in the TAS).
*   **[1_PRD-REQ-MET-005] Test Suite Integrity**:
    *   **Definition**: 100% pass rate on all unit, integration, and E2E tests generated during the TDD loop.
    *   **Verification**: The system must run a final "Full Project Validation" (Phase 5) where all tests pass in a clean, isolated sandbox.
*   **[1_PRD-REQ-MET-006] Lint & Build Cleanliness**:
    *   **Definition**: Zero errors and warnings from the project's configured linter (e.g., ESLint/Prettier) and build tool (e.g., `tsc`, `go build`).
    *   **Constraint**: The agent is NOT allowed to use `@ts-ignore` or `any` unless explicitly permitted in the "Long-term Memory" (Project Constraints).
*   **[1_PRD-REQ-MET-007] Documentation Density (AOD)**:
    *   **Definition**: Ratio of logic modules (classes/functions) to Agent-Oriented Documentation (`.agent.md`) files or formatted docstrings.
    *   **Target**: 1:1. Every significant module must have machine-readable documentation explaining its intent and "Agent-Ready" hook points.

### 6.3 Operational & Resource Efficiency Metrics

*   **[1_PRD-REQ-MET-008] Token-to-Value Ratio (TVR)**:
    *   **Definition**: Total USD cost of LLM tokens consumed per successfully completed Task.
    *   **Target**: < $1.50 per task (average) using the Tiered Model Orchestration (Gemini 3 Pro/Flash mix).
*   **[1_PRD-REQ-MET-009] Sandbox Provisioning Latency**:
    *   **Definition**: Time from Task assignment to "Sandbox Ready" state (including dependency warm-up).
    *   **Target**: < 30 seconds for local Docker; < 10 seconds for WebContainers.
*   **[1_PRD-REQ-MET-010] Context Optimization Efficiency**:
    *   **Definition**: Percentage of the 1M token context window utilized for *irrelevant* data (e.g., logs from 3 Epics ago).
    *   **Goal**: Keep active context windows < 200k tokens for 90% of tasks to minimize latency and cost.

### 6.4 User Experience & Intervention Metrics

*   **[1_PRD-REQ-MET-011] Intervention Frequency**:
    *   **Definition**: Number of times a user must manually "Rewind" or "Override" an agent's decision per Epic.
    *   **Target**: < 2 per Epic (avg). High intervention rates trigger a "TAS Review" event.
*   **[1_PRD-REQ-MET-012] Decision Transparency Score**:
    *   **Definition**: User-rated clarity of the "Agent Reasoning" logs during a failure.
    *   **Goal**: 100% of failures must provide a "Root Cause" and "Suggested Fix" that allows the user to resolve the issue in < 5 minutes.
*   **[1_PRD-REQ-MET-013] Approval Latency**:
    *   **Definition**: Total time the system spends in "Wait-for-Approval" state. (Though this is a human metric, it indicates the effectiveness of the system's "Gated Autonomy").

### 6.5 Resilience & Edge Case Metrics

*   **[1_PRD-REQ-MET-014] State Recovery Success Rate**:
    *   **Definition**: Percentage of `devs resume` operations that successfully pick up from the exact point of failure/interruption without data loss or duplicate commits.
    *   **Target**: **100%**. The system must be bulletproof against power/network loss.
*   **[1_PRD-REQ-MET-015] Entropy Detection Accuracy**:
    *   **Definition**: Percentage of "Infinite Loops" or "Failed Retries" correctly identified and paused by the system before exceeding the turn budget.
    *   **Target**: > 95%.
*   **[1_PRD-REQ-MET-016] Zero Sandbox Escapes**:
    *   **Definition**: Number of unauthorized filesystem or network access attempts detected by the sandbox monitor.
    *   **Target**: **0**. This is a hard security constraint.

### 6.6 Unknowns & Risk Factors for Measurement

1.  **Readability vs. Correctness**: How do we measure if the code is "clean" for a human, beyond just passing a linter?
2.  **Long-Term Memory Drift**: At what point does the "Long-term Memory" become so large it introduces noise/hallucinations in the Developer Agent?
3.  **Cross-Project Performance**: How do metrics vary between different stacks (e.g., Rust vs. Python)? We may need stack-specific KPI targets.
4.  **User Fatigue**: Does the "Gated Autonomy" model lead to "Approval Fatigue," where users stop scrutinizing TAS/PRDs? We need a way to track "Review Time" per document.

## 7. Out of Scope / Non-Goals

*   **[1_PRD-REQ-OOS-001] Legacy System Refactoring & Migration**: 'devs' is strictly optimized for greenfield development. It does NOT support the ingestion of existing brownfield codebases, automated refactoring of legacy systems, or the migration of logic from deprecated frameworks (e.g., porting jQuery to React).
*   **[1_PRD-REQ-OOS-002] Live Production Infrastructure Provisioning**: While the system may generate Infrastructure-as-Code (IaC) templates (Terraform, Pulumi), it will NOT execute deployment commands (`apply`, `up`) to live cloud environments (AWS, GCP, Azure). The user is responsible for the final execution of provisioning scripts.
*   **[1_PRD-REQ-OOS-003] Creative Asset & Marketing Content Generation**: The system does NOT generate non-technical assets such as logos, custom branding, marketing copy, SEO blog posts, or social media content. It focuses exclusively on technical documentation and implementation.
*   **[1_PRD-REQ-OOS-004] Ongoing "Agent-as-a-Service" Maintenance**: Post-delivery, the system does NOT provide long-term maintenance, real-time monitoring, or incident response. Once the project is marked "Completed," the orchestration terminates.
*   **[1_PRD-REQ-OOS-005] Hardware-Specific & Embedded Systems Development**: No support for proprietary hardware interfaces, FPGA programming, or Real-Time Operating Systems (RTOS) that lack high-level simulation environments or standard LSP/tooling support.
*   **[1_PRD-REQ-OOS-006] App Store & Marketplace Submission Management**: The system will NOT manage the bureaucratic workflows of submitting applications to the Apple App Store, Google Play Store, or VSCode Marketplace.
*   **[1_PRD-REQ-OOS-007] Legal, Regulatory & Compliance Certification**: While the system follows security best practices, it does NOT provide legal or regulatory guarantees for GDPR, HIPAA, SOC2, or PCI-DSS compliance. Compliance auditing remains a human-driven requirement.
*   **[1_PRD-REQ-OOS-008] Niche or Proprietary Language Support**: Support is limited to mainstream languages with robust ecosystem tooling (LSP, automated test runners, and debugger interfaces). High-level support for niche or proprietary languages (e.g., ABAP, COBOL, or closed-source DSLs) is out of scope.
*   **[1_PRD-REQ-OOS-009] Data Migration, Cleaning & ETL**: The system does NOT handle the migration of existing production data, complex ETL (Extract, Transform, Load) pipelines for data warehousing, or manual data cleaning tasks.
*   **[1_PRD-REQ-OOS-010] Real-time Multi-User Orchestration (Collaboration)**: The orchestrator is designed as a single-user tool. Real-time collaborative editing of the `.devs` state machine by multiple simultaneous users is not supported.
*   **[1_PRD-REQ-OOS-011] Local LLM Hosting & Inference Management**: The 'devs' orchestrator does NOT provide or manage local LLM inference engines (e.g., Ollama, vLLM). It assumes access to external or user-provided API endpoints.
*   **[1_PRD-REQ-OOS-012] Subjective Manual UI/UX QA**: No manual "look-and-feel" or aesthetic testing is performed. All UI validation is strictly functional and must be expressed via automated E2E (Playwright/Cypress) or component tests.
*   **[1_PRD-REQ-OOS-013] Advanced Red-Team Security Penetration Testing**: While basic dependency audits and linting are included, the system does NOT simulate Advanced Persistent Threats (APTs), social engineering, or deep network-level penetration testing.
*   **[1_PRD-REQ-OOS-014] Distributed Load & Stress Testing**: The system profiles individual tasks and components but does NOT execute large-scale distributed load tests (e.g., simulating 100k+ concurrent users across multiple regions).
*   **[1_PRD-REQ-OOS-015] Secret Management & Vault Hosting**: The system does NOT host or manage secrets (e.g., Vault, AWS Secrets Manager). It only generates the integration code and expected environment variable mappings.
*   **[1_PRD-REQ-OOS-016] Browser/OS-Specific Polyfilling & Quirk-Handling**: No support for legacy browser polyfills (e.g., IE11) or handling of non-standard, version-specific operating system quirks unless explicitly defined in the TAS.
*   **[1_PRD-REQ-OOS-017] 3D Modeling, Texturing & Game Asset Pipelines**: The system does NOT generate 3D meshes, textures, animation rigging, or spatial audio assets.
*   **[1_PRD-REQ-OOS-018] Formal Cryptographic & Smart Contract Auditing**: No formal verification of smart contracts or high-stakes cryptographic primitives beyond standard unit testing protocols.
*   **[1_PRD-REQ-OOS-019] Full Offline Operational Mode**: Due to the reliance on high-reasoning LLMs (Gemini 3 Pro), an active internet connection for API communication is a hard requirement.
*   **[1_PRD-REQ-OOS-020] Project Hosting & PaaS Functionality**: 'devs' is a development orchestrator, not a hosting provider. It does NOT provide any platform-as-a-service (PaaS) capabilities for the generated code.

