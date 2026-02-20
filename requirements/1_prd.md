# Requirements from PRD (Product Requirements Document) (specs/1_prd.md)

## 1. Project Goals

### **[REQ-GOAL-001]** Radical Compression of Time-to-Market (TTM)
- **Type:** Functional
- **Description:** Compress the traditional discovery, architecture, and initial build phases from weeks to hours/days to deliver a functional, production-ready MVP.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-GOAL-002]** Elimination of Architectural Debt and "Boilerplate Tax"
- **Type:** Technical
- **Description:** Automate the generation of standardized, clean-code project foundations adhering to modern patterns (Clean Architecture, SOLID, Hexagonal).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-GOAL-003]** Absolute User Agency & Intervention Control
- **Type:** UX
- **Description:** Provide a "Human-in-the-Loop" experience with explicit approval checkpoints at every critical junction.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-GOAL-004]** Standardizing "Agent-Ready" Software
- **Type:** Technical
- **Description:** Every project must include a built-in MCP server for introspection and comprehensive agent-oriented documentation.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-GOAL-005]** Deterministic Reliability via Multi-Agent Verification
- **Type:** Technical
- **Description:** Establish a "Zero-Defect" baseline by mandating a 100% pass rate on all generated tests within a sandboxed environment using multi-agent cross-verification.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-GOAL-006]** Proactive Entropy Detection & Resource Efficiency
- **Type:** Technical
- **Description:** Implement monitoring to detect lack of progress (entropy) and automatically pause for human intervention after a predefined threshold of failed attempts.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-GOAL-007]** Multi-Tiered Context & Memory Management
- **Type:** Technical
- **Description:** Implementation of Short-term (task-specific), Medium-term (Epic/Phase), and Long-term (Project-wide constraints/decisions) memory to maintain consistent project context.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-GOAL-008]** Secure, Sandboxed Autonomy
- **Type:** Security
- **Description:** Ensure all code execution, dependency installation, and testing occur within a strictly isolated environment (Docker/WebContainers) with restricted network and filesystem access.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

## 2. Architectural Pillars

### **[REQ-PIL-001]** Research-First Methodology
- **Type:** Technical
- **Description:** No code is written until the problem space, competitive landscape, and technology options are exhaustively analyzed.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PIL-002]** Architecture-Driven Development (ADD)
- **Type:** Technical
- **Description:** Every project must have a validated PRD and TAS before implementation begins.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PIL-003]** Strict TDD (Test-Driven Development) Loop
- **Type:** Technical
- **Description:** Implementation follows a rigorous "Red-Green-Refactor" cycle validated by automated tests executed in a secure sandbox.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PIL-004]** Agentic Observability & Traceability (Glass-Box)
- **Type:** Technical
- **Description:** Every decision, tool call, and reasoning step is logged and queryable, allowing the user to inspect the agent's thought process.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PIL-005]** MCP-Native (Model Context Protocol)
- **Type:** Technical
- **Description:** Both the orchestrator and generated projects are built with native support for the Model Context Protocol for introspection, debugging, and profiling.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

## 3. Technical Constraints

### **[REQ-CON-001]** Rate Limiting & Token Management
- **Type:** Technical
- **Description:** The system must gracefully handle LLM API rate limits, implementing exponential backoff and prioritizing critical reasoning tasks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-CON-002]** State Persistence & Recovery
- **Type:** Technical
- **Description:** Every state change must be persisted locally, allowing the system to resume from any point after a crash or pause.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-CON-003]** Conflict Resolution
- **Type:** Technical
- **Description:** In cases where agents disagree, the system must attempt an automated resolution or escalate to the user.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-CON-004]** Context Window Optimization
- **Type:** Technical
- **Description:** Implement efficient context pruning to prioritize the most relevant information within the LLM context window.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-CON-005]** Dependency Management
- **Type:** Technical
- **Description:** Ensure agents do not introduce conflicting or insecure third-party dependencies.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

## 4. Persona Needs

### **[REQ-NEED-MAKER-01]** Instant project scaffolding
- **Type:** UX
- **Description:** Instant project scaffolding without manual configuration.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-NEED-MAKER-02]** Clear progress summaries
- **Type:** UX
- **Description:** Clear, non-technical progress summaries (Epics/Milestones).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-NEED-MAKER-03]** Cost and token usage estimation
- **Type:** Functional
- **Description:** Cost and token usage estimation per project phase.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-NEED-ARCH-01]** Strict enforcement of specific patterns
- **Type:** Technical
- **Description:** Ability to enforce specific architectural patterns (e.g., Functional Programming).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-NEED-ARCH-02]** Granular approval of TAS and PRD
- **Type:** UX
- **Description:** Granular approval of TAS and PRD before code generation.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-NEED-ARCH-03]** Automated Reviewer Agents
- **Type:** Technical
- **Description:** Automated Reviewer Agents that catch "anti-patterns" or security flaws.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-NEED-DOMAIN-01]** High-fidelity Research Reports
- **Type:** Functional
- **Description:** Research Reports explaining the "Why" behind tech choices.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-NEED-DOMAIN-02]** Agentic profiling via MCP
- **Type:** Technical
- **Description:** Agentic profiling via MCP to explain performance bottlenecks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-NEED-DOMAIN-03]** Interactive Q&A with Architect Agent
- **Type:** UX
- **Description:** Interactive "Q&A" sessions with the Architect Agent regarding the TAS.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-NEED-AGENT-01]** Long-Term Context Access
- **Type:** Technical
- **Description:** Access to project-wide architectural decisions (TAS) during every task.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-NEED-AGENT-02]** Tool-Rich Environment
- **Type:** Technical
- **Description:** Seamless MCP access to file system, terminal, and live profilers.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-NEED-AGENT-03]** Deterministic Sandbox and Test Runner
- **Type:** Technical
- **Description:** Consistent behavior from the Sandbox and Test Runner.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-NEED-DEVS-01]** Detailed tracing of Agent communication
- **Type:** Technical
- **Description:** Detailed tracing of "Agent-to-Agent" communication.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-NEED-DEVS-02]** Time-Travel debugging
- **Type:** Technical
- **Description:** Ability to rewind the system state to a previous task or Epic.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-NEED-DEVS-03]** System-wide profiling
- **Type:** Technical
- **Description:** System-wide profiling to identify slow or token-intensive phases.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

## 5. Feature Mapping

### **[REQ-MAP-001]** Parallelized Research Agents
- **Type:** Functional
- **Description:** Parallelized Research Agents (Market/Comp/Tech) for speed.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MAP-002]** Persistent decision log
- **Type:** Technical
- **Description:** Persistent decision log in `.devs/state.sqlite` for auditability.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MAP-003]** Research report trade-offs
- **Type:** Functional
- **Description:** Research reports must include "Pros/Cons" and "Trade-offs" sections.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MAP-004]** MCP injection into Sandbox
- **Type:** Technical
- **Description:** MCP servers MUST be injected into the Sandbox on startup.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MAP-005]** VSCode state streaming
- **Type:** UX
- **Description:** Real-time streaming of LangGraph state to VSCode Sidebar.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MAP-006]** Mandatory entropy detection
- **Type:** Technical
- **Description:** Mandatory entropy detection (Max 3 retries per task).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

## 6. HITL Checkpoints

### **[REQ-HITL-001]** Phase 1 Completion Approval
- **Type:** UX
- **Description:** User must approve the Research Suite (Market, Comp, Tech, User).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-HITL-002]** Architecture Suite Approval
- **Type:** UX
- **Description:** User must sign off on PRD and TAS before the Distiller runs.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-HITL-003]** Roadmap & Epic Review Approval
- **Type:** UX
- **Description:** User must approve the sequence of 8-16 Epics.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-HITL-004]** Epic Start Checkpoint
- **Type:** UX
- **Description:** User can review the 25+ tasks for the upcoming Epic and add/remove tasks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-HITL-005]** Task Failure Handoff
- **Type:** UX
- **Description:** If an agent hits the entropy limit, the system MUST hand off to the user for manual correction or requirement adjustment.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

## 7. Interfaces

### **[REQ-INT-001]** CLI Operability
- **Type:** Functional
- **Description:** The system MUST be operable via a terminal interface (e.g., `devs init`, `devs run`, `devs status`).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-INT-002]** VSCode Extension
- **Type:** UX
- **Description:** VSCode Extension providing project dashboard, document editor, agent console, and HITL popups.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-INT-003]** MCP Orchestrator Server
- **Type:** Technical
- **Description:** The 'devs' system MUST expose its own internal state via an MCP server.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-INT-004]** Real-time State Synchronization
- **Type:** Technical
- **Description:** The CLI and VSCode extension MUST share a common state file to ensure seamless switching between interfaces.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-INT-005]** CLI Headless Mode
- **Type:** Functional
- **Description:** Support for `--json` output for all commands to allow integration into CI/CD pipelines or other scripts.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-INT-001]

### **[REQ-INT-006]** CLI State Control
- **Type:** Functional
- **Description:** Commands to `pause`, `resume`, `rewind` (to specific task/epic), and `skip` current operations.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-INT-001]

### **[REQ-INT-007]** VSCode Project Dashboard
- **Type:** UX
- **Description:** A dedicated sidebar view showing the status of the current Epic, a progress bar, and a tree-view of all Tasks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-INT-002]

### **[REQ-INT-008]** VSCode Document Editor
- **Type:** UX
- **Description:** Integrated Markdown preview and editor for generated documents with "Sync & Regenerate" capabilities.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-INT-002]

### **[REQ-INT-009]** VSCode Agent Console
- **Type:** UX
- **Description:** A streaming log view that differentiates between "Thoughts", "Actions", and "Observations".
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-INT-002]

### **[REQ-INT-010]** VSCode Human-in-the-Loop Popups
- **Type:** UX
- **Description:** Visual prompts for approvals at defined checkpoints within VSCode.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-INT-002]

### **[REQ-INT-011]** MCP State Exposure
- **Type:** Technical
- **Description:** The 'devs' system MUST expose its own internal state via an MCP server.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-INT-003]

### **[REQ-INT-012]** MCP Assistant Querying
- **Type:** Technical
- **Description:** Allows user's primary AI assistant to query the `devs` status, read requirements, and inspect the task DAG directly via MCP.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-INT-003]

## 8. Research

### **[REQ-RES-001]** Market & Competitive Analysis
- **Type:** Functional
- **Description:** Combined report identifying 5+ competitors, SWOT analysis, and source validation.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-RES-002]** Technology Landscape & Decision Matrix
- **Type:** Technical
- **Description:** Evaluation of stacks against performance, scalability, and "Agent-Friendliness" with a decision matrix.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-RES-003]** User Persona & Journey Mapping
- **Type:** UX
- **Description:** Detailed profiles for 3+ personas and journey visualization using Mermaid.js.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-RES-004]** Niche Market Analysis
- **Type:** Functional
- **Description:** If no direct competitors are found, analyze "Adjacent Markets" or "Manual Workarounds".
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-RES-005]** Stale Data Prevention
- **Type:** Technical
- **Description:** Perform live searches to ensure recommended libraries are not deprecated.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

## 9. Documentation

### **[REQ-DOC-001]** PRD Generation
- **Type:** Functional
- **Description:** MUST include: Goals, Non-Goals, User Stories (Gherkin format), and high-level Constraints.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-DOC-002]** TAS Generation
- **Type:** Technical
- **Description:** Detailed technical architecture specification including system layout, data model, and API contracts.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-DOC-003]** MCP & Glass-Box Architecture Spec
- **Type:** Technical
- **Description:** Specification for the project's internal MCP server and definition of "Introspection Points".
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-DOC-004]** UI/UX Design System Spec
- **Type:** UX
- **Description:** Definition of color palettes, typography, core component library, and site map.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-DOC-005]** Security & Mitigation Plan Spec
- **Type:** Security
- **Description:** Threat model identifying Top 3 risks and mitigation strategies.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-DOC-006]** System Layout Proposal
- **Type:** Technical
- **Description:** Detailed folder structure proposal as part of the TAS.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-DOC-002]

### **[REQ-DOC-007]** Data Model Design
- **Type:** Technical
- **Description:** Mermaid.js ERD (Entity Relationship Diagram) as part of the TAS.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-DOC-002]

### **[REQ-DOC-008]** API/Interface Contracts
- **Type:** Technical
- **Description:** Definition of core internal interfaces (e.g., TypeScript interfaces) as part of the TAS.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-DOC-002]

### **[REQ-DOC-009]** Site Map Visualization
- **Type:** UX
- **Description:** Mermaid.js Site Map showing page hierarchy as part of UI/UX design.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-DOC-004]

### **[REQ-DOC-010]** Mitigation Strategies Definition
- **Type:** Security
- **Description:** Explicit mitigation strategies for identified security risks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-DOC-005]

## 10. Planning

### **[REQ-PLAN-001]** Atomic Requirement Extraction
- **Type:** Technical
- **Description:** Extract unique, non-overlapping, testable, and traceable requirements from all Phase 1 & 2 documents.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PLAN-002]** Epic Count
- **Type:** Functional
- **Description:** Generate 8-16 phases, each representing a logical milestone.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PLAN-003]** Dependency DAG
- **Type:** Technical
- **Description:** Generate a Directed Acyclic Graph of all tasks with support for parallel execution.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PLAN-004]** Task Granularity
- **Type:** Technical
- **Description:** 25+ tasks per Epic, ensuring no task exceeds estimated 200 lines of code change.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-PLAN-002]

### **[REQ-PLAN-005]** Task Definition
- **Type:** Technical
- **Description:** Every task MUST include ID, Title, Description, Input Files, Success Criteria (Tests), and Dependencies.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-PLAN-002]

## 11. Implementation

### **[REQ-IMP-001]** Sandbox Provisioning
- **Type:** Technical
- **Description:** Spin up a fresh sandbox (Docker/WebContainer) for each task.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-IMP-002]** Strict TDD Cycle
- **Type:** Technical
- **Description:** Follow Red-Green-Validation cycle for every task.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-IMP-003]** Agentic Memory & Decision Logging
- **Type:** Technical
- **Description:** Use short-term, medium-term, and long-term memory (LanceDB) to maintain context and decisions.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-IMP-004]** Git Repository Management
- **Type:** Technical
- **Description:** Manage a git repository for the generated project.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-IMP-005]** Strategy Shift on Failure
- **Type:** Technical
- **Description:** If a task fails TDD loop 3 times, attempt a reasoning pivot/strategy shift.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-IMP-006]** Sandbox Pre-flight Injection
- **Type:** Technical
- **Description:** Inject sandbox with current codebase, task requirements, and MCP tools.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-IMP-001]

### **[REQ-IMP-007]** Sandbox Cleanup & Persistence
- **Type:** Technical
- **Description:** Persist failed sandboxes for debugging, destroy successful ones.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-IMP-001]

### **[REQ-IMP-008]** Atomic Commits
- **Type:** Technical
- **Description:** Each task completion results in a commit with Task ID and summary.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-IMP-004]

### **[REQ-IMP-009]** Automated Hand-off on Failure
- **Type:** UX
- **Description:** After 5 total task failures, pause and hand off to the user with a detailed report.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-IMP-005]

## 12. System

### **[REQ-SYS-001]** Token Optimization
- **Type:** Technical
- **Description:** Intelligent context pruning and summarization handoffs between Epics.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SYS-002]** Crash Recovery
- **Type:** Technical
- **Description:** Fully stateless orchestrator allowing resume from any point after interruption.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SYS-003]** Multi-Model Orchestration
- **Type:** Technical
- **Description:** Use Gemini 3 Pro for high reasoning tasks and Gemini 3 Flash for routine tasks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SYS-004]** Agentic Profiling via MCP
- **Type:** Technical
- **Description:** Support for MCP server that allows running code, capturing traces, and inspecting variables.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

## 13. UI/UX & HITL Control

### **[REQ-UI-001]** Research Suite Sign-off
- **Type:** UX
- **Description:** Gated approval of Phase 1 research reports.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-002]** Architecture Suite Sign-off
- **Type:** UX
- **Description:** Gated approval of Phase 2 architecture documents.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-003]** Roadmap & Task DAG Approval
- **Type:** UX
- **Description:** Gated approval of Epics and Tasks before implementation.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-004]** Epic Commencement Checkpoint
- **Type:** UX
- **Description:** "Just-in-Time" review of tasks at the start of each Epic.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-005]** Live Trace Streaming
- **Type:** UX
- **Description:** Real-time stream of Thoughts, Actions, and Observations.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-006]** Visual Task Progress (DAG View)
- **Type:** UX
- **Description:** Real-time visualization of the task dependency graph and statuses.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-007]** Tool Call Interception (Safety Mode)
- **Type:** Security
- **Description:** Prompt for approval before executing modifying commands or network requests.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-008]** Global Pause/Resume
- **Type:** UX
- **Description:** Immediate suspension and persistent resumption of all active agents.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-009]** Mid-Task Context Injection (Directives)
- **Type:** UX
- **Description:** Ability to provide "Whisper" directives that take precedence during a task.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-010]** Task Skip & Manual Completion
- **Type:** UX
- **Description:** Ability for user to manually fix code and mark a task as complete.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-011]** Project Rewind (Time-Travel)
- **Type:** UX
- **Description:** Revert project to a specific Task ID state using git and SQLite.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-012]** Entropy Pause (Max-Retry Threshold)
- **Type:** UX
- **Description:** Pause and present failure analysis after 3 TDD loop failures.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-013]** Agent-Initiated Clarification (AIC)
- **Type:** UX
- **Description:** Agent MUST emit a clarification event when detecting logical contradictions.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-014]** Token/Cost Budgeting
- **Type:** Functional
- **Description:** Hard and soft USD/Token budgets per Epic with automatic pause.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-015]** Sandbox Escape Monitoring
- **Type:** Security
- **Description:** Real-time monitoring of unauthorized filesystem or network access by agents.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-016]** Deterministic "Snapshot" Points
- **Type:** Technical
- **Description:** Create filesystem snapshots before starting large or experimental tasks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

## 14. Security

### **[REQ-SEC-001]** Mandatory Containerization
- **Type:** Security
- **Description:** All AI-generated code execution must occur within a fresh, ephemeral sandbox.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SEC-002]** Deny-All Network Policy
- **Type:** Security
- **Description:** Sandboxes MUST operate on a "Deny-All" network policy by default.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SEC-003]** Filesystem Integrity
- **Type:** Security
- **Description:** Sandbox MUST only have write access to project directory, host system directories protected.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SEC-004]** Resource Quotas
- **Type:** Technical
- **Description:** Restrict CPU and Memory usage per sandbox to prevent resource exhaustion attacks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SEC-005]** Automated Secret Redaction Scanner
- **Type:** Security
- **Description:** Scan logs and outputs for secrets before persistence.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SEC-006]** Untrusted Input Handling
- **Type:** Security
- **Description:** Treat all external research data as untrusted input to mitigate prompt injection.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SEC-007]** Dependency Vulnerability Scanning
- **Type:** Security
- **Description:** Run security audits after every dependency installation.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SEC-008]** Explicit Allow-lists
- **Type:** Security
- **Description:** Implement allow-lists for package managers and approved APIs.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-SEC-002]

### **[REQ-SEC-009]** Host Protection
- **Type:** Security
- **Description:** Ensure host's `.git` and `.devs` are read-only or excluded from sandbox.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-SEC-003]

### **[REQ-SEC-010]** Execution Time Cap
- **Type:** Technical
- **Description:** Cap execution time at 5 minutes per tool call.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-SEC-004]

### **[REQ-SEC-011]** Secret Replacement
- **Type:** Security
- **Description:** Replace detected secrets with `[REDACTED]`.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-SEC-005]

### **[REQ-SEC-012]** Structured Prompting
- **Type:** Security
- **Description:** Use structured prompting and delimiters to minimize data-driven prompt injection.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-SEC-006]

### **[REQ-SEC-013]** Vulnerability Trigger
- **Type:** Security
- **Description:** High/Critical vulnerability detection MUST trigger task failure and risk update.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-SEC-007]

## 15. Reliability

### **[REQ-REL-001]** Delta Monitoring
- **Type:** Technical
- **Description:** Monitor "Semantic Delta" between task attempts to detect loops.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-REL-002]** Turn Limit
- **Type:** Technical
- **Description:** Hard limit of 10 implementation turns per task.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-REL-003]** Deterministic State Recovery (ACID Compliance)
- **Type:** Technical
- **Description:** Persist state transitions to SQLite using ACID-compliant transactions.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-REL-004]** Multi-Agent Cross-Verification
- **Type:** Technical
- **Description:** Implementation tasks verified by a separate Reviewer Agent in a clean sandbox.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-REL-005]** Strategy Pivot
- **Type:** Technical
- **Description:** Force a reasoning pivot when strategy entropy is detected.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-REL-001]

### **[REQ-REL-006]** Token Budget Enforcement
- **Type:** Technical
- **Description:** Automatic pause when task token budget (e.g., 200k) is exceeded.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-REL-002]

## 16. Performance

### **[REQ-PERF-001]** Sliding Relevance Window
- **Type:** Technical
- **Description:** Implement a sliding window for context management.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PERF-002]** Tiered Model Orchestration
- **Type:** Technical
- **Description:** Strategically assign Gemini Pro or Flash based on task complexity.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PERF-003]** Parallel Task Execution
- **Type:** Technical
- **Description:** Execute independent tasks in parallel sandboxes.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PERF-004]** Summarization Handoffs
- **Type:** Technical
- **Description:** Summarize older logs and move to Vector DB to keep active context focused.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-PERF-001]

## 17. Observability

### **[REQ-OBS-001]** Introspection via MCP
- **Type:** Technical
- **Description:** Read access to internal state, logs, and environment variables via MCP.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OBS-002]** Intent Documentation (AOD)
- **Type:** Technical
- **Description:** Explicit definition of "Why" a module exists.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OBS-003]** Real-time State Tracing
- **Type:** Technical
- **Description:** Stream all internal communication and tool calls to a trace log.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OBS-004]** Execution via MCP
- **Type:** Technical
- **Description:** Ability to run modules or tests in isolation via MCP.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-OBS-001]

### **[REQ-OBS-005]** Profiling via MCP
- **Type:** Technical
- **Description:** Access to CPU/Memory traces via MCP.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-OBS-001]

### **[REQ-OBS-006]** Testability Documentation
- **Type:** Technical
- **Description:** Explicit instructions on "How" to test a module.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-OBS-002]

### **[REQ-OBS-007]** Edge Case Documentation
- **Type:** Technical
- **Description:** Known edge cases and constraints for future developer agents.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** [REQ-OBS-002]

## 18. Success Metrics

### **[REQ-MET-001]** Task Autonomy Rate (TAR)
- **Type:** Non-Functional
- **Description:** Percentage of tasks completed without human intervention (Target >85%).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-002]** Time-to-First-Commit (TTFC)
- **Type:** Non-Functional
- **Description:** Total time from init to first implementation commit (Target < 60 min).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-003]** Requirement Traceability Index (RTI)
- **Type:** Non-Functional
- **Description:** Percentage of requirements mapped to passing tests and code (Target 100%).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-004]** Architectural Fidelity Score (AFS)
- **Type:** Non-Functional
- **Description:** Variance between TAS proposal and final repo (Target < 5%).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-005]** Test Suite Integrity
- **Type:** Non-Functional
- **Description:** 100% pass rate on all tests in final validation.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-006]** Lint & Build Cleanliness
- **Type:** Non-Functional
- **Description:** Zero errors/warnings from linter and build tools.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-007]** Documentation Density (AOD)
- **Type:** Non-Functional
- **Description:** 1:1 ratio of logic modules to Agent-Oriented Documentation files.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-008]** Token-to-Value Ratio (TVR)
- **Type:** Non-Functional
- **Description:** Average USD cost of tokens per completed task (Target < $1.50).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-009]** Sandbox Provisioning Latency
- **Type:** Non-Functional
- **Description:** Time from assignment to "Sandbox Ready" (Target < 30s Docker / < 10s WebContainer).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-010]** Context Optimization Efficiency
- **Type:** Non-Functional
- **Description:** Keep active context windows < 200k tokens for 90% of tasks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-011]** Intervention Frequency
- **Type:** Non-Functional
- **Description:** Average manual overrides per Epic (Target < 2).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-012]** Decision Transparency Score
- **Type:** Non-Functional
- **Description:** 100% of failures must provide a root cause and suggested fix.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-013]** Approval Latency
- **Type:** Non-Functional
- **Description:** Total time spent in "Wait-for-Approval" state.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-014]** State Recovery Success Rate
- **Type:** Non-Functional
- **Description:** 100% success rate for resume operations.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-015]** Entropy Detection Accuracy
- **Type:** Non-Functional
- **Description:** Percentage of loops correctly identified and paused (Target > 95%).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-016]** Zero Sandbox Escapes
- **Type:** Non-Functional
- **Description:** Zero unauthorized filesystem or network access attempts.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

## 19. Out of Scope

### **[REQ-OOS-001]** Legacy System Refactoring & Migration
- **Type:** Non-Functional
- **Description:** No support for brownfield codebases or legacy migration.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-002]** Live Production Infrastructure Provisioning
- **Type:** Non-Functional
- **Description:** No automated execution of cloud provisioning commands.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-003]** Creative Asset & Marketing Content Generation
- **Type:** Non-Functional
- **Description:** No generation of non-technical assets (logos, marketing copy).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-004]** Ongoing Maintenance
- **Type:** Non-Functional
- **Description:** No post-delivery maintenance or monitoring.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-005]** Hardware & Embedded Systems
- **Type:** Non-Functional
- **Description:** No support for hardware-specific or RTOS development.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-006]** App Store Submission
- **Type:** Non-Functional
- **Description:** No management of app store submission workflows.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-007]** Legal & Compliance Certification
- **Type:** Non-Functional
- **Description:** No legal guarantees or formal compliance certifications.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-008]** Niche or Proprietary Language Support
- **Type:** Non-Functional
- **Description:** Limited to mainstream languages with robust ecosystem tooling.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-009]** Data Migration & ETL
- **Type:** Non-Functional
- **Description:** No handling of data migration or cleaning tasks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-010]** Real-time Multi-User Orchestration
- **Type:** Non-Functional
- **Description:** Designed as a single-user tool; no multi-user collaboration.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-011]** Local LLM Hosting
- **Type:** Non-Functional
- **Description:** No management of local LLM inference engines.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-012]** Subjective Manual UI/UX QA
- **Type:** Non-Functional
- **Description:** All UI validation must be expressed via automated tests.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-013]** Advanced Red-Team Security Testing
- **Type:** Non-Functional
- **Description:** No simulation of APTs or deep network penetration testing.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-014]** Distributed Load & Stress Testing
- **Type:** Non-Functional
- **Description:** No large-scale distributed load tests.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-015]** Secret Management Hosting
- **Type:** Non-Functional
- **Description:** No hosting of secret management vaults.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-016]** Browser/OS Polyfilling
- **Type:** Non-Functional
- **Description:** No support for legacy browser polyfills.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-017]** 3D Modeling & Game Assets
- **Type:** Non-Functional
- **Description:** No generation of 3D meshes, textures, or spatial audio.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-018]** Formal Cryptographic Auditing
- **Type:** Non-Functional
- **Description:** No formal verification of cryptographic primitives.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-019]** Full Offline Operational Mode
- **Type:** Non-Functional
- **Description:** Requires active internet connection for LLM API.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-020]** Project Hosting
- **Type:** Non-Functional
- **Description:** Orchestrator only, not a hosting provider.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None
