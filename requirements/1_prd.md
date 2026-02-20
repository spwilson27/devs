### **[REQ-PIL-001]** Research-First Methodology
- **Type:** Technical
- **Description:** No code must be written until the problem space, competitive landscape, and technology options are exhaustively analyzed.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PIL-002]** Architecture-Driven Development (ADD)
- **Type:** Technical
- **Description:** Every project must have a validated PRD and TAS before implementation begins.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PIL-003]** Strict TDD (Test-Driven Development) Loop
- **Type:** Technical
- **Description:** Implementation must follow a rigorous "Red-Green-Refactor" cycle where every feature is validated by automated tests executed in a secure sandbox before completion.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PIL-004]** Agentic Observability & Traceability (Glass-Box)
- **Type:** Technical
- **Description:** Every decision, tool call, and reasoning step must be logged and queryable by the user.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PIL-005]** MCP-Native (Model Context Protocol)
- **Type:** Technical
- **Description:** The orchestrator and the generated projects must support native Model Context Protocol for introspection, debugging, and profiling.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-GOAL-001]** Radical Compression of Time-to-Market (TTM)
- **Type:** Functional
- **Description:** Compress discovery, architecture, and initial build phases from weeks to hours/days.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-GOAL-002]** Elimination of Architectural Debt and "Boilerplate Tax"
- **Type:** Technical
- **Description:** Automate the generation of standardized, clean-code project foundations (Clean Architecture, SOLID, Hexagonal).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-GOAL-003]** Absolute User Agency & Intervention Control
- **Type:** UX
- **Description:** Provide a "Human-in-the-Loop" experience with granular monitoring and mid-stream adjustments.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-GOAL-004]** Standardizing "Agent-Ready" Software
- **Type:** Technical
- **Description:** Every project produced must include a built-in MCP server for introspection and comprehensive agent-oriented documentation.
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
- **Description:** Maintain consistent project context across long-running development cycles using Short-term, Medium-term, and Long-term memory.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-GOAL-008]** Secure, Sandboxed Autonomy
- **Type:** Security
- **Description:** All code execution, dependency installation, and testing must occur within a strictly isolated environment (Docker/WebContainers) with restricted access.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-CON-001]** Rate Limiting & Token Management
- **Type:** Technical
- **Description:** Handle LLM API rate limits with exponential backoff and prioritize critical reasoning tasks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-CON-002]** State Persistence & Recovery
- **Type:** Technical
- **Description:** Persist every state change locally to allow resuming from any point after failure.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-CON-003]** Conflict Resolution
- **Type:** Functional
- **Description:** Automated resolution or escalation to user when Reviewer and Developer agents disagree.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-CON-004]** Context Window Optimization
- **Type:** Technical
- **Description:** Efficient context pruning to prioritize relevant information (task requirements, file context, architectural constraints).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-CON-005]** Dependency Management
- **Type:** Security
- **Description:** Ensure agents do not introduce conflicting or insecure third-party dependencies.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MAP-003]** Research Report Detail
- **Type:** Functional
- **Description:** Research reports must include "Pros/Cons" and "Trade-offs" sections.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MAP-004]** MCP Sandbox Injection
- **Type:** Technical
- **Description:** MCP servers MUST be injected into the Sandbox on startup.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MAP-005]** Real-time State Streaming
- **Type:** UX
- **Description:** Real-time streaming of LangGraph state to VSCode Sidebar.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MAP-006]** Mandatory Entropy Detection
- **Type:** Technical
- **Description:** Mandatory entropy detection with a maximum of 3 retries per task.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-HITL-001]** Phase 1 Research Suite Approval
- **Type:** UX
- **Description:** User must approve the Research Suite (Market, Comp, Tech, User) before proceeding.
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

### **[REQ-HITL-004]** Epic Start Task Review
- **Type:** UX
- **Description:** User can review the 25+ tasks for the upcoming Epic and add/remove tasks before commencement.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-HITL-005]** Task Failure Handoff
- **Type:** UX
- **Description:** If an agent hits the entropy limit, the system MUST hand off to the user for manual correction or requirement adjustment.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-INT-001]** CLI Tool Interface
- **Type:** Functional
- **Description:** System MUST be operable via terminal interface with commands like `init`, `run`, `status`.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-INT-001.1]** CLI Headless Mode
- **Type:** Technical
- **Description:** Support for `--json` output for all commands to allow integration into CI/CD pipelines.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-INT-001.2]** CLI State Control
- **Type:** Functional
- **Description:** CLI must support commands to `pause`, `resume`, `rewind` (to specific task/epic), and `skip`.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-INT-002]** VSCode Extension Interface
- **Type:** UX
- **Description:** System MUST provide a VSCode extension with a Project Dashboard, Document Editor, and Agent Console.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-INT-002.1]** VSCode Project Dashboard
- **Type:** UX
- **Description:** Sidebar view showing Epic status, project progress bar, and Task tree-view.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-INT-002.2]** VSCode Document Editor
- **Type:** UX
- **Description:** Integrated Markdown preview/editor for PRD, TAS, and generated docs with "Sync & Regenerate" capabilities.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-INT-002.3]** VSCode Agent Console
- **Type:** UX
- **Description:** Streaming log view differentiating between "Thoughts", "Actions", and "Observations".
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-INT-002.4]** VSCode HITL Popups
- **Type:** UX
- **Description:** Visual prompts for approvals at defined checkpoints.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-INT-003]** MCP Orchestrator Server
- **Type:** Technical
- **Description:** The system MUST expose its own internal state via an MCP server for external querying and inspection.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-INT-004]** Real-time State Synchronization
- **Type:** Technical
- **Description:** CLI and VSCode extension MUST share a common state file (`.devs/state.json` or SQLite).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-RES-001]** Market & Competitive Analysis
- **Type:** Functional
- **Description:** Combined report identifying 5+ competitors, features, pricing, and SWOT analysis.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-RES-001.1]** Research Source Validation
- **Type:** Technical
- **Description:** Prioritize official documentation, reputable tech blogs, and GitHub repositories over generic marketing copy.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-RES-002]** Technology Landscape & Decision Matrix
- **Type:** Technical
- **Description:** Evaluate stacks against Performance, Scalability, Community Support, Type Safety, and Agent-Friendliness.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-RES-002.1]** Weighted Decision Matrix
- **Type:** Technical
- **Description:** Weighted comparison of at least 2 viable stacks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-RES-003]** User Persona & Journey Mapping
- **Type:** Functional
- **Description:** Detailed profiles for 3+ personas (User, Admin, Developer).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-RES-003.1]** Journey Visualization
- **Type:** Functional
- **Description:** Mermaid.js sequence diagrams for the Primary Value Journey.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-RES-004]** Research Edge Case Analysis
- **Type:** Functional
- **Description:** Analyze "Adjacent Markets" or "Manual Workarounds" if no direct competitors are found.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-RES-004.1]** Stale Data Prevention
- **Type:** Technical
- **Description:** Perform live searches to ensure recommended libraries are not deprecated.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-DOC-001]** PRD Document Requirements
- **Type:** Functional
- **Description:** PRD MUST include: Goals, Non-Goals, User Stories (Gherkin format), and high-level Constraints.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-DOC-002]** TAS Document Requirements
- **Type:** Technical
- **Description:** TAS MUST include System Layout (folders), Data Model (Mermaid ERD), and API/Interface Contracts.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-DOC-003]** MCP & Glass-Box Architecture Spec
- **Type:** Technical
- **Description:** Specification for the project's internal MCP server and definition of "Introspection Points".
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-DOC-004]** UI/UX Design System Spec
- **Type:** UX
- **Description:** Definition of color palettes, typography, core component library, and Mermaid.js Site Map.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-DOC-005]** Security & Mitigation Plan
- **Type:** Security
- **Description:** Threat model identifying at least Top 3 security risks and mitigation strategies for each.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PLAN-001]** Atomic Requirement Extraction
- **Type:** Technical
- **Description:** Extract unique, non-overlapping requirements that are Atomic, Testable, and Traceable from all Phase 1 & 2 docs.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PLAN-002]** Epic & Task Orchestration
- **Type:** Functional
- **Description:** Define 8-16 logical milestones (Epics) with 25+ tasks each.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PLAN-002.1]** Task Granularity Limit
- **Type:** Technical
- **Description:** A task is considered "Too Large" if its estimated LoC change exceeds 200 lines.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PLAN-002.2]** Task Definition Schema
- **Type:** Technical
- **Description:** Every task MUST include: ID, Title, Description, Input Files, Success Criteria (Tests), and Dependencies.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PLAN-003]** Dependency DAG Generation
- **Type:** Technical
- **Description:** Generate a Directed Acyclic Graph of all tasks to support scheduler execution.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PLAN-003.1]** Parallel Task Execution
- **Type:** Technical
- **Description:** Support parallel task execution where no dependencies exist within the same Epic.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-IMP-001]** Sandbox Lifecycle Management
- **Type:** Technical
- **Description:** Provision a fresh ephemeral sandbox (Docker/WebContainer) for each task.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-IMP-001.1]** Sandbox Pre-flight Injection
- **Type:** Technical
- **Description:** Sandbox MUST be injected with the current codebase, task requirements, and MCP tools.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-IMP-001.2]** Sandbox Failure Persistence
- **Type:** Technical
- **Description:** Sandboxes MUST be persisted to a "Suspended" state on failure for debugging.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-IMP-002]** TDD Loop: Red Phase
- **Type:** Technical
- **Description:** Agent writes a test that covers the requirement. Test MUST FAIL in the sandbox initially.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-IMP-002.1]** TDD Loop: Green Phase
- **Type:** Technical
- **Description:** Agent implements code until the test passes.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-IMP-002.2]** TDD Loop: Validation Phase
- **Type:** Technical
- **Description:** Reviewer Agent runs all tests in the current Epic to ensure no regressions.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-IMP-003]** Hierarchical Agentic Memory
- **Type:** Technical
- **Description:** Implement Short-term (task context), Medium-term (Epic decisions), and Long-term (Project constraints) memory.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-IMP-004]** Git Strategy & Atomic Commits
- **Type:** Technical
- **Description:** Manage a git repository where each task completion results in a commit containing the Task ID and summary.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-IMP-005]** Strategy Shift on Task Failure
- **Type:** Technical
- **Description:** If a task fails 3 times, agent MUST attempt a "Strategy Shift" (e.g., different library or simpler logic).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SYS-001]** Intelligent Context Pruning
- **Type:** Technical
- **Description:** Keep only TAS, current Epic requirements, and active files in the context window; use summarization handoffs between Epics.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SYS-002]** Stateless Orchestrator & Crash Recovery
- **Type:** Technical
- **Description:** Orchestrator must be stateless and support `devs resume` to pick up at the exact same task and state after interruption.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SYS-003]** Multi-Model Tiered Orchestration
- **Type:** Technical
- **Description:** Use Gemini 3 Pro for Architect/Developer roles and Gemini 3 Flash for Reviewer/Linter roles.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SYS-004]** Agentic Profiling via Project MCP
- **Type:** Technical
- **Description:** Generated project MUST include an MCP server for running code, capturing traces, and inspecting variables.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-005]** Live Trace Streaming
- **Type:** UX
- **Description:** Real-time stream of Thoughts, Actions, and Observations to VSCode or CLI.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-006]** Visual Task Progress (DAG View)
- **Type:** UX
- **Description:** Real-time visualization of the task dependency graph showing task states.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-007]** Tool Call Interception (Safety Mode)
- **Type:** Security
- **Description:** Prompt for approval before executing commands that modify filesystem outside `/src` or perform network requests.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-008]** Global Pause/Resume with State Persistence
- **Type:** Functional
- **Description:** Immediate suspension of all agents with state persisted to SQLite for reliable resumption.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-009]** Mid-Task Context Injection (Directives)
- **Type:** UX
- **Description:** Allow users to inject "Whisper" directives during a task that take precedence over the TAS for that task.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-010]** Task Skip & Manual Completion
- **Type:** Functional
- **Description:** Allow user to manually fix code and mark a task as `Manual-Complete`.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-011]** Project Rewind (Time-Travel)
- **Type:** Functional
- **Description:** Revert project to the state of a specific Task ID, resetting git HEAD and SQLite state.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-012]** Entropy Pause & Failure Analysis
- **Type:** UX
- **Description:** If task fails 3 times, pause and present analysis (failing test, attempts, logs) to user.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-013]** Agent-Initiated Clarification (AIC)
- **Type:** UX
- **Description:** Agents must emit a clarification event when detecting logical contradictions between project documents.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-014]** Token/Cost Budgeting & Hard Limits
- **Type:** Functional
- **Description:** Implement USD/Token spend limits per Epic with 80% soft warning and 100% hard pause.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-015]** Sandbox Escape Monitoring
- **Type:** Security
- **Description:** Real-time monitoring of agent filesystem/network access; unauthorized attempts trigger security pause.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-UI-016]** Deterministic Snapshot Points
- **Type:** Technical
- **Description:** Create filesystem snapshots before starting "Large" or "Experimental" tasks for reliable recovery.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SEC-001]** Mandatory Containerization
- **Type:** Security
- **Description:** All AI-generated code execution must occur within an ephemeral sandbox.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SEC-002]** Network Egress Control
- **Type:** Security
- **Description:** Deny-all network policy by default with explicit allow-lists for package managers and approved APIs.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SEC-003]** Sandbox Filesystem Isolation
- **Type:** Security
- **Description:** Sandbox write access restricted to project directory; `.git` and `.devs` must be read-only or excluded.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SEC-004]** Sandbox Resource Quotas
- **Type:** Security
- **Description:** Restrict CPU, Memory, and execution time (max 5 mins per tool call) to prevent resource consumption attacks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SEC-005]** Automated Secret & PII Redaction
- **Type:** Security
- **Description:** Scan logs and traces for secrets/PII and redact them before persistence.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SEC-006]** Prompt Injection Mitigation
- **Type:** Security
- **Description:** Treat external research data as "Untrusted Input" using structured prompting and delimiters.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-SEC-007]** Post-Dependency Security Audit
- **Type:** Security
- **Description:** Run `npm audit` after every dependency installation; high/critical vulnerabilities trigger task failure.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-REL-001]** Semantic Delta Entropy Monitoring
- **Type:** Technical
- **Description:** Monitor differences between task attempts; identical errors or code across 3 turns forces reasoning pivot.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-REL-002]** Task implementation Limits
- **Type:** Technical
- **Description:** Hard limit of 10 implementation turns and specified token budget (e.g. 200k) per task.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-REL-003]** ACID-Compliant State Transitions
- **Type:** Technical
- **Description:** Persist all state transitions to SQLite using ACID-compliant transactions.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-REL-004]** Independent Reviewer Verification
- **Type:** Technical
- **Description:** Separate Reviewer Agent must independently execute tests in a clean sandbox.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PERF-001]** Sliding Relevance Window
- **Type:** Technical
- **Description:** Summarize and move older logs to Vector DB to keep active context focused and within limits.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-PERF-003]** Parallel Task Execution
- **Type:** Technical
- **Description:** Identify independent tasks and execute in parallel sandboxes respecting the DAG.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OBS-001]** Native Project MCP Server
- **Type:** Technical
- **Description:** Generated projects must include an MCP server providing Introspection, Execution, and Profiling.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OBS-002]** Agent-Oriented Documentation (AOD)
- **Type:** Technical
- **Description:** Each module must include `.agent.md` defining intent, testing methods, and edge cases.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OBS-003]** Real-time State Tracing Log
- **Type:** Technical
- **Description:** Stream all internal communication and tool calls to `.devs/trace.log`.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-001]** Task Autonomy Rate (TAR) KPI
- **Type:** Technical
- **Description:** Target >85% for standard tasks and >70% for complex refactors completed without human intervention.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-002]** Time-to-First-Commit (TTFC) KPI
- **Type:** Technical
- **Description:** Target < 60 minutes from `init` to first implementation commit.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-003]** Requirement Traceability Index (RTI) KPI
- **Type:** Technical
- **Description:** 100% of extracted atomic requirements must map to passing tests and code blocks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-004]** Architectural Fidelity Score (AFS) KPI
- **Type:** Technical
- **Description:** < 5% variance between proposed TAS structure and final repository.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-005]** Full Project Validation KPI
- **Type:** Technical
- **Description:** 100% pass rate on all tests in a clean, isolated sandbox at Phase 5.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-006]** Lint & Build Cleanliness KPI
- **Type:** Technical
- **Description:** Zero errors/warnings from linter and build tools; no `@ts-ignore` or `any` without permission.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-007]** Documentation Density (AOD) KPI
- **Type:** Technical
- **Description:** 1:1 ratio of logic modules to Agent-Oriented Documentation files.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-008]** Token-to-Value Ratio (TVR) KPI
- **Type:** Technical
- **Description:** Target average cost < $1.50 per task using tiered models.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-009]** Sandbox Provisioning Latency KPI
- **Type:** Technical
- **Description:** Target < 30s for Docker, < 10s for WebContainers.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-010]** Context Optimization Efficiency KPI
- **Type:** Technical
- **Description:** Keep active context windows < 200k tokens for 90% of tasks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-014]** State Recovery Success Rate KPI
- **Type:** Technical
- **Description:** 100% success rate for `devs resume` operations without data loss.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-015]** Entropy Detection Accuracy KPI
- **Type:** Technical
- **Description:** > 95% accuracy in identifying and pausing infinite loops/failed retries.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-MET-016]** Zero Sandbox Escapes KPI
- **Type:** Security
- **Description:** Hard target of 0 unauthorized access attempts detected.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-001]** Legacy System Refactoring & Migration
- **Type:** Technical
- **Description:** System does NOT support ingestion of brownfield codebases or automated refactoring of legacy systems.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-002]** Live Production Infrastructure Provisioning
- **Type:** Technical
- **Description:** System does NOT execute deployment commands to live cloud environments.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-003]** Creative Asset & Marketing Content Generation
- **Type:** Functional
- **Description:** System does NOT generate logos, branding, marketing copy, or SEO content.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-005]** Hardware-Specific & Embedded Systems
- **Type:** Technical
- **Description:** No support for proprietary hardware interfaces, FPGA, or RTOS.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-007]** Legal, Regulatory & Compliance Certification
- **Type:** Security
- **Description:** System does NOT provide legal or regulatory guarantees (GDPR, SOC2, etc.).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-011]** Local LLM Hosting & Inference Management
- **Type:** Technical
- **Description:** System does NOT manage local LLM inference engines.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-012]** Subjective Manual UI/UX QA
- **Type:** UX
- **Description:** All UI validation must be automated; no manual aesthetic testing is performed.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-013]** Advanced Red-Team Security Penetration Testing
- **Type:** Security
- **Description:** No simulation of APTs, social engineering, or deep network penetration testing.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-019]** Full Offline Operational Mode
- **Type:** Technical
- **Description:** Active internet connection is a hard requirement for LLM API communication.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[REQ-OOS-020]** Project Hosting & PaaS Functionality
- **Type:** Technical
- **Description:** System does NOT provide hosting or PaaS capabilities for generated code.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None
