# User Features Specification: Project 'devs'

## 1. Feature Overview & Categorization

The 'devs' system features are categorized by the project lifecycle phase, primary mode of user interaction, and core architectural function. The system adheres to the "Glass-Box" philosophy, ensuring that every autonomous action is visible, auditable, and interruptible.

### 1.1 Interface-Specific Features

#### 1.1.1 CLI (Headless First & Automation)
*   **[FEAT-CLI-001] Project Lifecycle Management**: Comprehensive command set for `init` (bootstrapping), `run` (continuous implementation), `pause`, `resume`, and `status`. 
*   **[FEAT-CLI-002] Deterministic Rewind (Time-Travel)**: Command `devs rewind --to <task_id>` to revert the filesystem (Git) and state (SQLite/Vector) to a specific historical checkpoint with 100% fidelity.
*   **[FEAT-CLI-003] Structured Audit Export**: Support for `--json` and `--markdown` flags on all status and log commands to facilitate integration with external CI/CD pipelines and automated auditing tools.
*   **[FEAT-CLI-004] Interactive TUI Approval Gates**: A high-fidelity Terminal User Interface for reviewing research reports and architecture specs, providing a rich, non-GUI way to manage human-in-the-loop gates.
*   **[FEAT-CLI-005] System Health (devs doctor)**: Automated diagnostic tool to verify Docker/WebContainer availability, API connectivity, and `.devs/` directory integrity.

#### 1.1.2 VSCode Extension (Integrated Workspace)
*   **[FEAT-VSC-001] Multi-Agent Dashboard**: A dedicated sidebar view rendering the current Epic progress, active task details, and a real-time visualization of the Task Dependency DAG.
*   **[FEAT-VSC-002] Glass-Box Trace Streamer**: A specialized "Agent Console" utilizing the Structured Agent-Orchestrator Protocol (SAOP) to stream reasoning (thoughts), tool calls (actions), and sandbox outputs (observations) with semantic highlighting.
*   **[FEAT-VSC-003] Blueprint & Spec Previewer**: Native rendering for all Mermaid-based diagrams within PRDs/TAS documents, including live-updating ERDs and sequence diagrams during the Design phase.
*   **[FEAT-VSC-004] Gated Autonomy UI**: Visual popups and status indicators for mandatory human-in-the-loop sign-offs, with integrated diff views for approving agent-proposed architectural changes.
*   **[FEAT-VSC-005] Context Injection (Whispering)**: A dedicated input field to send mid-task "Directives" directly to the active agent's short-term memory without pausing the execution loop.

#### 1.1.3 MCP Interoperability (Agent-to-Agent)
*   **[FEAT-MCP-001] Orchestrator Control Server**: Exposes the `devs` state machine and requirement fulfillment status as an MCP server, allowing external agents (e.g., Cursor, Gemini) to query project status and inject tasks.
*   **[FEAT-MCP-002] Project Introspection Server**: Every generated project includes an internal MCP server (`/mcp-server`) that provides tools for debugging, state inspection, and live profiling of the newly built codebase.

### 1.2 Orchestration & State Management
*   **[FEAT-SYS-001] LangGraph State Persistence**: ACID-compliant checkpointing of the entire multi-agent state machine to `state.sqlite`, ensuring the system can resume from the exact node/turn after a crash or network drop.
*   **[FEAT-SYS-002] Requirement-to-Task Distillation**: Automated extraction of atomic requirements from specs, mapping each to a unique `REQ-ID` that is traced through the entire implementation lifecycle.
*   **[FEAT-SYS-003] Dependency DAG Execution**: Intelligent task scheduler that respects technical dependencies and enables parallel execution of independent tasks within the same Epic.
*   **[FEAT-SYS-004] Multi-Agent Cross-Verification**: Mandatory review of implementation tasks by a separate "Reviewer Agent" using a clean sandbox to verify that tests pass and TAS patterns are followed.

### 1.3 Memory & Context Management
*   **[FEAT-MEM-001] Tiered Memory Hierarchy**: 
    *   **Short-Term**: Working set of active files and tool outputs (volatile).
    *   **Medium-Term**: Epic-level decisions and task summaries (SQLite).
    *   **Long-Term**: Project-wide constraints and architectural DNA (Vector DB).
*   **[FEAT-MEM-002] Context Pruning & Refresh**: Automatic sliding-window management to keep agent context windows focused while re-injecting core TAS/PRD blueprints every 10 turns to prevent "reasoning decay."
*   **[FEAT-MEM-003] Semantic Memory Retrieval**: Proactive RAG (Retrieval-Augmented Generation) that fetches relevant historical decisions from LanceDB before starting a new task to ensure architectural consistency.

### 1.4 Safety, Security & Isolation
*   **[FEAT-SEC-001] Ephemeral Sandbox Isolation**: Mandatory execution of all agent commands in isolated Docker or WebContainer environments with restricted CPU/Memory quotas and "Default Deny" network policies.
*   **[FEAT-SEC-002] PII & Secret Redaction**: Real-time `SecretMasker` middleware that intercepts sandbox output and redacts high-entropy strings (API keys, tokens) before they enter the logs or LLM context.
*   **[FEAT-SEC-003] Entropy & Loop Detection**: Algorithmic monitoring of repeating error hashes; automatically triggers a "Strategy Pivot" or human-in-the-loop pause if an agent gets stuck in a failing implementation cycle.
*   **[FEAT-SEC-004] Git-Backed State Integrity**: Automatic Git commits after every successful task, creating a permanent, verifiable audit trail of code evolution.

---

## 2. Detailed User Journeys

The following journeys illustrate the end-to-end operation of 'devs', highlighting the "Glass-Box" transparency, human-in-the-loop control, and autonomous agentic behavior.

### 2.1 The "Vision-to-Blueprint" Journey (The Architect's Path)
**Primary Persona**: Alex (Maker/Founder) or Sarah (Senior Architect)
**Objective**: Transform a high-level project idea into a validated, human-approved architectural specification.

1.  **Project Initialization**: The user runs `devs init` via the CLI or VSCode Extension, providing a project name and a brief description (e.g., "A secure, multi-tenant SaaS for tracking carbon credits").
2.  **Briefing & Intent Expansion**: The user provides detailed user journeys and constraints (e.g., "Must support offline mobile sync," "Never store PII in plaintext").
3.  **Autonomous Research Suite**: The orchestrator deploys parallel Research Agents.
    *   **Market/Competitive**: Agents crawl the web to identify existing solutions and feature gaps.
    *   **Tech Landscape**: Agents evaluate frameworks (e.g., Next.js vs. Remix) against the project's specific constraints, producing a weighted decision matrix.
    *   **Output**: A set of reports in the `/research` directory with confidence scores and source citations.
4.  **Specification Drafting**: The Architect Agent ingests the research and generates the **Phase 2 Documents**:
    *   **PRD**: Detailed user stories in Gherkin format.
    *   **TAS**: Proposed folder structure, data models (Mermaid ERDs), and interface contracts.
    *   **MCP Design**: Specification of the project's internal introspection tools.
5.  **Human-in-the-Loop Review (Gate 1)**: The system enters a `WAITING_FOR_APPROVAL` state.
    *   **Visual Review**: The user reviews the specs in VSCode, utilizing integrated Mermaid previews for diagrams.
    *   **Iterative Refinement**: The user edits the TAS directly to change a database choice (e.g., switching from MongoDB to PostgreSQL).
    *   **Sign-off**: The user clicks "Approve Architecture."
6.  **Roadmap Distillation**: The Distiller Agent transforms the approved blueprints into a Directed Acyclic Graph (DAG) of 8-16 Epics and 200+ atomic Tasks.
7.  **Task Confirmation (Gate 2)**: The user reviews the task sequence, dependencies, and requirement mappings before authorizing the first Epic.

### 2.2 The "TDD Implementation" Loop (The Developer's Path)
**Primary Persona**: AI Developer Agent (Supervised by Alex/Sarah)
**Objective**: Iterative, test-validated implementation of features with 100% requirement traceability.

1.  **Task Assignment**: The orchestrator picks the next available task from the DAG and assigns it to the Developer Agent.
2.  **Sandbox Provisioning**: A fresh, ephemeral Docker or WebContainer sandbox is spun up. The `SandboxServer` (MCP) is injected with project-specific tools.
3.  **Red-Phase Verification (TDD)**:
    *   The agent analyzes the task requirement (e.g., `REQ-AUTH-001: Implement JWT session handling`).
    *   The agent writes a test file in `tests/unit/`.
    *   The agent executes the test; the orchestrator confirms it **FAILS** with a `RED` exit code.
4.  **Implementation Turn (Green Phase)**:
    *   The agent implements the logic in `src/`.
    *   The agent utilizes `apply_surgical_edits` to minimize file corruption.
    *   The agent executes the test; it **PASSES** with a `GREEN` exit code.
5.  **Multi-Agent Audit & Review**:
    *   A separate **Reviewer Agent** is provisioned with a clean sandbox.
    *   The Reviewer runs the new test *plus* all existing tests in the Epic to ensure no regressions.
    *   The Reviewer audits the code for TAS pattern compliance and Agent-Oriented Documentation (`.agent.md`) density.
6.  **Atomic State Commit**:
    *   On success, the orchestrator executes a `git commit` with a message linking to the `TASK-ID`.
    *   The reasoning trace and tool logs are persisted to `state.sqlite`.
    *   The project roadmap UI updates in real-time.

### 2.3 The "Glass-Box" Intervention (Mid-Stream Directive)
**Primary Persona**: Alex (User)
**Objective**: Course-correct an autonomous agent during an active task without restarting the project.

1.  **Trace Monitoring**: Alex monitors the "Agent Console" in VSCode, seeing the agent's internal reasoning (SAOP thoughts) in real-time.
2.  **Detection of Deviation**: Alex notices the agent is using `axios` instead of the project's preferred `fetch` wrapper (a rule Sarah added to Long-term Memory).
3.  **Directive Injection (Whispering)**: Alex types a directive in the sidebar: "Use the internal `apiClient` wrapper in `src/lib/` instead of raw axios."
4.  **Immediate Context Update**: The orchestrator intercepts the directive and injects it into the agent's active short-term memory window with `HIGH_PRIORITY` weighting.
5.  **Agent Pivot**: The agent reflects on the new directive: "Reflection: User requested pivot to apiClient. I will revert axios installation and update imports."
6.  **Verification**: Alex sees the updated code in the next "Action" log and the subsequent successful commit.

### 2.4 The "Deep Debugging & Profiling" Journey
**Primary Persona**: Paul (Domain Specialist) or Developer Agent
**Objective**: Resolve performance bottlenecks or complex logical bugs using agentic introspection.

1.  **Heuristic Trigger**: During a refactoring turn, the Reviewer Agent detects that a new module is 50% slower than the baseline specified in the Security & Performance spec.
2.  **Agentic Profiling**: The agent invokes the `run_profiler` tool via the **Project MCP Server**.
3.  **State Introspection**: The agent queries `inspect_state` to see the internal heap allocation and active event loop timers in the sandboxed application.
4.  **Root Cause Analysis (RCA)**: The agent identifies an O(n^2) loop in a tenant-filtering utility.
5.  **Optimization Turn**: The agent refactors the code to use a Map-based lookup, re-runs the profiler, and confirms the performance delta is within TAS limits.
6.  **Documentation**: The agent updates the module's `.agent.md` file with the performance findings and optimization notes for future agents.

### 2.5 The "Architectural Rewind" (Recovery from Drift)
**Primary Persona**: Sarah (Senior Architect)
**Objective**: Recover from a fundamental design error discovered multiple Epics into the project.

1.  **Recognition**: Sarah realizes that the "Soft Delete" strategy implemented in Epic 2 is causing data integrity issues in Epic 5.
2.  **Global Pause**: Sarah hits "Pause" in the dashboard, suspending all active agent threads.
3.  **Deterministic Rewind**: Sarah uses `devs rewind --to <Task_ID_Epic_2_End>`.
    *   **Filesystem**: `git checkout` restores the codebase.
    *   **State**: `state.sqlite` purges all logs/tasks after that point.
    *   **Memory**: Vector DB is pruned of "future" memories to prevent hallucinations.
4.  **Blueprint Correction**: Sarah edits the TAS and Security Design docs to specify a "Hard Delete with Archival" strategy.
5.  **Re-Distillation**: Sarah runs `devs distill --force`. The roadmap is updated; Tasks in Epics 3-5 are regenerated to reflect the new architecture.
6.  **Resumption**: implementation restarts. The agents rebuild the subsequent features on the corrected foundation.

## 3. Core Interactions & Edge Cases

The 'devs' system is built around a series of high-stakes interactions between the human user and the agentic orchestrator. This section defines the technical requirements, UI/CLI behaviors, and recovery protocols for these interactions across the project lifecycle.

### 3.1 The Discovery & Research Interaction (Phase 1)
The goal is to move from a minimal project description to an authoritative research suite.

*   **Interaction Protocol**:
    *   **Input**: User provides a prompt and journeys via `devs init` or the VSCode "New Project" wizard.
    *   **Agent Action**: Orchestrator spawns `ResearchAgent` clusters. Each agent emits a `RESEARCH_START` event with a target domain.
    *   **UI Feedback**: **[REQ-UI-001]** VSCode Sidebar shows a "Researching..." status with a list of active search queries and scraped URLs. **[REQ-UI-002]** CLI shows a progress bar with `[Scraping competitors...]`.
*   **Edge Cases & Failure Modes**:
    *   **[EDGE-RES-01] Ambiguous Brief**: If the prompt is < 100 characters or lacks a clear objective, the agent MUST emit a `CLARIFICATION_REQUIRED` status. The UI must present a "Clarification Input" field.
    *   **[EDGE-RES-02] Search Dead-end**: If no relevant competitors are found, the agent must not return an empty report. It MUST perform "Adjacent Market Analysis" and explain why a direct match was not found.
    *   **[EDGE-RES-03] Source Contradiction**: If two scraped sources provide conflicting data on a technology's stability, the agent must flag this as a "Contradictory Finding" in the Tech Landscape report with a lower confidence score.

### 3.2 The Gated Blueprint Interaction (Phase 2)
The transition from research to architecture is a hard human-in-the-loop gate.

*   **Interaction Protocol**:
    *   **Delivery**: Architect Agent generates PRD/TAS and moves to `WAITING_FOR_APPROVAL` state.
    *   **Review Mode**: **[REQ-UI-003]** VSCode renders a "Review Dashboard" with a side-by-side view of the Brief and the new Specs. **[REQ-UI-004]** Mermaid diagrams (ERDs, Sequence) are rendered as interactive SVG blocks.
    *   **Approval**: User clicks "Approve" or provides a "Revision Directive".
*   **Edge Cases & Failure Modes**:
    *   **[EDGE-ARC-01] Manual Markdown Corruption**: If the user manually edits the PRD/TAS Markdown and introduces syntax errors (e.g., broken Mermaid blocks), the system must run a `LINT_SPECS` check. On failure, it blocks progress and highlights the error line in the editor.
    *   **[EDGE-ARC-02] Pattern Conflict**: If the user requests a pattern in a directive (e.g., "Use Redux") that contradicts a project-wide constraint in Long-term Memory (e.g., "No external state libraries"), the system MUST trigger a "Constraint Violation Dialog" asking the user to override the global rule.

### 3.3 The Requirement Distillation Interaction (Phase 3)
The transformation of documents into an executable roadmap.

*   **Interaction Protocol**:
    *   **Logic**: Distiller Agent parses all `docs/*.md` and generates the `requirements` and `tasks` tables in `state.sqlite`.
    *   **UI Presentation**: **[REQ-UI-005]** A "Roadmap Viewer" (Gantt-style or DAG) showing the 8-16 Epics. Each Epic is expandable to show its constituent tasks.
*   **Edge Cases & Failure Modes**:
    *   **[EDGE-PLN-01] Requirement Orphanage**: If a requirement is extracted from the PRD but cannot be mapped to any implementation task, the system flags a "Coverage Gap" and forces the agent to re-decompose the Epic.
    *   **[EDGE-PLN-02] Circular Task Dependencies**: If the DAG generator creates a cycle (Task A -> B -> A), the orchestrator must automatically run a "Cycle Resolution" turn or prompt the user to manually reorder the tasks.

### 3.4 The TDD Implementation & Verification Loop (Phase 4)
The core execution engine where requirements become code.

*   **Interaction Protocol (Plan-Act-Verify)**:
    *   **Task Start**: Agent retrieves context -> **[REQ-UI-006]** UI shows "Active Task" card with REQ-ID.
    *   **Red Phase**: Agent writes test -> **[REQ-UI-007]** CLI/VSCode Terminal shows `npm test` failure -> Success status: "Test Established (Red)".
    *   **Green Phase**: Agent writes code -> CLI/VSCode Terminal shows `npm test` success -> Success status: "Requirement Met (Green)".
    *   **Review Phase**: Separate Reviewer Agent runs regression suite -> UI shows "Reviewing...".
*   **Edge Cases & Failure Modes**:
    *   **[EDGE-IMP-01] Test Hallucination**: The agent writes a test that passes incorrectly (e.g., `expect(true).toBe(true)`). The Reviewer Agent must perform a "Logic Verification" turn, analyzing the test code against the requirement text.
    *   **[EDGE-IMP-02] Sandbox Resource Exhaustion**: If the implementation task triggers a memory leak or infinite loop in the sandbox, the `SandboxMonitor` kills the process. The user sees a "Resource Limit Exceeded" alert and the agent is forced into an "Optimization Pivot".
    *   **[EDGE-IMP-03] Flaky Test Detection**: If a test passes in the Green phase but fails during the Reviewer's regression check, the system flags it as `FLAKY_POTENTIAL` and executes 3 consecutive runs to verify stability.

### 3.5 Global Interactions & Orchestration Edge Cases
System-wide events that impact the entire project state.

*   **The Rewind (Time-Travel) Interaction**:
    *   **User Action**: User clicks a historical Task ID in the DAG and selects "Rewind to Here".
    *   **Edge Case [EDGE-SYS-01]**: Workspace is "Dirty" (uncommitted manual changes). The system MUST block the rewind and prompt the user to "Commit, Stash, or Discard" changes before reverting the Git/DB state.
*   **Context Saturation & Refresh**:
    *   **System Action**: When the active task log hits 800k tokens, the orchestrator triggers a "Context Refresh".
    *   **Edge Case [EDGE-SYS-02]**: Critical information (e.g., a specific variable name from Turn 2) is lost in the summary. The agent MUST have a `read_logs` tool to retrieve raw historical data if the summary is insufficient.
*   **Network/API Interruption**:
    *   **Edge Case [EDGE-SYS-03]**: Internet connection is lost mid-task. The orchestrator MUST perform a "Graceful Suspension," saving the current turn's `SAOP_Envelope` to a `pending_completion` state in SQLite. Upon reconnection, it executes a `devs resume` automatically.

## 4. Accessibility & Localization Requirements

The 'devs' system is designed for a global, diverse user base of professional developers and makers. As an agentic AI system, it must maintain a high level of accessibility and localization to ensure that the "Glass-Box" transparency is available to everyone, regardless of physical ability or primary language.

### 4.1 Accessibility (A11y) Standards & Compliance
*   **[REQ-ACC-001] WCAG 2.1 Level AA Compliance**: The VSCode extension and any web-based dashboards MUST adhere to WCAG 2.1 AA standards for contrast, focus management, and structural semantics.
*   **[REQ-ACC-002] Screen Reader Optimization (ARIA-Live)**: The "Agent Console" MUST utilize `aria-live` regions to announce real-time agent thoughts, actions, and observations. These regions should be prioritized (e.g., `aria-live="polite"` for thoughts, `aria-live="assertive"` for critical interventions).
*   **[REQ-ACC-003] Keyboard-First Navigation**: Every interactive element in the CLI and VSCode UI MUST be reachable and operable via keyboard alone. This includes complex visualizations like the Task Dependency DAG and the Epic Roadmap.
*   **[REQ-ACC-004] High-Contrast & Color Blindness Support**:
    *   **Theme Inheritance**: The VSCode Extension must dynamically inherit and respect the user's active VSCode theme, including High Contrast modes.
    *   **Diagram Accessibility**: Mermaid diagrams MUST utilize accessible color palettes and supplementary visual cues (patterns, distinct stroke styles, or labels) to ensure readability for color-blind users.
*   **[REQ-ACC-005] Responsive Sizing & Reflow**: The UI MUST support text scaling up to 200% without loss of functionality, content truncation, or overlapping elements. The layout must reflow gracefully in narrow viewports.

### 4.2 Internationalization (i18n) & Localization (L10n)
*   **[REQ-LOC-001] Universal Unicode Support**: The system MUST support UTF-8 encoding across all project artifacts, including PRDs, TAS, code, and agent reasoning logs, to accommodate all global scripts and symbols.
*   **[REQ-LOC-002] Multi-Lingual Research & Analysis**: The Research Agent MUST be capable of scraping, analyzing, and distilling documentation in multiple languages (e.g., English, Chinese, Spanish, Japanese) to provide a global Technology Landscape perspective.
*   **[REQ-LOC-003] Locale-Aware Formatting**: All timestamps, numbers, and currencies in the UI MUST be formatted according to the user's system locale, while internal storage (SQLite/Logs) remains in a standardized, deterministic format (e.g., ISO 8601 UTC).
*   **[REQ-LOC-004] Language-Specific Model Support**: The orchestrator SHOULD allow users to specify LLM models that are optimized for their native language for reasoning and documentation generation.
*   **[REQ-LOC-005] Pluralization & Gendered Grammar**: All UI strings MUST be externalized and managed via a localization framework (e.g., `i18next`) that handles complex pluralization and grammatical rules across different languages.

### 4.3 Screen Reader & Assistive Technology Integration
*   **[REQ-ACC-006] Structural Navigation & Semantics**: All generated documents (PRD, TAS, Roadmap) MUST use semantic Markdown/HTML headers to enable rapid structural navigation by assistive technology users.
*   **[REQ-ACC-007] Contextual Focus Management**: During mandatory human-in-the-loop gates, the UI MUST automatically manage focus, moving it to the primary approval action or clarification field to reduce navigation friction.
*   **[REQ-ACC-008] Text-to-Speech (TTS) Compatibility**: Agent logs and "Thoughts" MUST be structured to avoid excessive punctuation or technical noise that degrades the TTS experience, providing a "Clean Log" mode for audio consumption.

### 4.4 Accessibility & Localization Edge Cases
*   **[EDGE-ACC-01] Visual Diagram Alternatives**: Since Mermaid diagrams are inherently visual, the system MUST provide a machine-generated text summary or a queryable table format as an alternative for every diagram in the specs.
*   **[EDGE-LOC-01] RTL (Right-to-Left) Layout Support**: For languages such as Arabic or Hebrew, the VSCode Extension's dashboard MUST support RTL mirroring. The layout MUST use CSS logical properties to ensure correct alignment.
*   **[EDGE-LOC-02] Cross-Language Requirement Traceability**: If a requirement is defined in one language and implemented in a code environment that uses English-based naming conventions, the Reviewer Agent MUST verify that the semantic intent is preserved across the language boundary.

## 5. Error Handling & User Feedback

The 'devs' system treats errors not just as exceptions, but as critical interaction points in the agentic development lifecycle. The goal is to ensure that whenever an agent fails or the environment becomes unstable, the user is provided with maximum signal and clear resolution paths.

### 5.1 Automated Failure Analysis & Root Cause Diagnosis
When a task fails to meet the TDD requirements or hits the entropy threshold, the system must perform an automated post-mortem.
*   **[FEAT-ERR-011] Root Cause Analysis (RCA) Reports**: On task failure, the Reviewer Agent generates a Markdown report identifying the likely cause (e.g., "Dependency Conflict," "Logical Hallucination," "Missing Environmental Variable").
*   **[FEAT-ERR-012] Interactive Failure Diffs**: Visual comparison between the failing test output and the current implementation, highlighting the specific lines of code and the associated requirements (`REQ-ID`).
*   **[FEAT-ERR-013] "Suspended Sandbox" Access**: A one-click button in VSCode or a CLI command (`devs debug --task <ID>`) that opens a terminal session inside the exact container state where the failure occurred.

### 5.2 Entropy & Loop Management UI
Visibility into the agent's struggle is a core "Glass-Box" requirement.
*   **[FEAT-ERR-014] Visual Loop Indicators**: The roadmap DAG UI must highlight tasks that are repeating (e.g., color-coding turns 3+ in orange, turns 5+ in red).
*   **[FEAT-ERR-015] Entropy Pivot Prompts**: When the system forces a strategy pivot, the user is notified with a "Pivot Rationalization" message explaining why the previous approach was abandoned.
*   **[FEAT-ERR-016] Manual Intervention Thresholds**: User-configurable limits for "Max Turns" and "Max Cost" per task, triggering a hard pause when exceeded.

### 5.3 Agent-Initiated Clarification (AIC)
A mechanism for agents to proactively ask for help when requirements are ambiguous or contradictory.
*   **[FEAT-ERR-017] AIC Interaction Dialogs**: High-priority popups in VSCode or interactive prompts in the CLI when an agent identifies a conflict (e.g., TAS vs. PRD mismatch).
*   **[FEAT-ERR-018] Multi-Choice Resolution**: Agents should propose 2-3 resolution strategies (e.g., "Strategy A: Update TAS to support MongoDB," "Strategy B: Stick to Postgres and refactor implementation").
*   **[FEAT-ERR-019] Directive History Trace**: A log of all human interventions provided during a failure state, ensuring they are vectorized into Long-term Memory for future task sessions.

### 5.4 System Health & Resource Feedback
Monitoring the health of the orchestrator itself and its underlying infrastructure.
*   **[FEAT-ERR-020] Real-time Resource Gauges**: Visual feedback on current CPU, Memory, and Token usage for the active sandbox and orchestrator process.
*   **[FEAT-ERR-021] API Connectivity Monitoring**: Real-time status indicators for Gemini API, Docker socket, and search provider connectivity.
*   **[FEAT-ERR-022] Automated State Integrity Checks**: Background validation of the `.devs/state.sqlite` and `.devs/memory.lancedb` files; provides "Auto-Repair" prompts if corruption is detected.

### 5.5 User Feedback & Global Correction
*   **[FEAT-ERR-023] Feedback Injection Tool**: A dedicated interface to provide global feedback (e.g., "Always use async/await for I/O operations") that updates the project's Long-term Memory (LanceDB).
*   **[FEAT-ERR-024] Requirement Refinement Mode**: During a pause, users can edit the PRD/TAS, and the system must offer to "Re-distill" the roadmap to reflect the changes.

## 6. Advanced Interaction & Control Features

### 6.1 Project Rewind (Time-Travel)
*   **[FEAT-CTL-001] Deterministic Rollback**: Reverts the filesystem (Git checkout) and the state database (`state.sqlite`) to any historical Task ID.
*   **[FEAT-CTL-002] Memory Syncing**: Pruning of the Vector DB (LanceDB) to remove semantic memories generated after the rewind point.

### 6.2 Mid-Task Directives (Whispering)
*   **[FEAT-CTL-003] Short-term Memory Injection**: Users can send a directive to an active agent that takes precedence over the TAS for the current task.
*   **[FEAT-CTL-004] Strategy Override**: Forcing an agent to pivot its implementation approach (e.g., "Use library X instead of Y").

### 6.3 Entropy & Loop Detection
*   **[FEAT-CTL-005] Observation Hashing**: Real-time monitoring of repeating error messages to detect infinite loops.
*   **[FEAT-CTL-006] Strategy Pivot**: Automatic forced "reasoning from first principles" when a loop is detected.
*   **[FEAT-CTL-007] Entropy Pause**: Automatic suspension and hand-off to the user after 5 failed implementation attempts.

## 7. Edge Cases & Safety Scenarios

### 7.1 Requirement Contradiction
*   **Scenario**: PRD specifies "Offline First," but TAS specifies "PostgreSQL-only" (which requires a server).
*   **Feature [FEAT-ERR-001]**: The Distiller Agent detects the logical mismatch and triggers a `USER_CLARIFICATION_REQUIRED` event.
*   **Interaction**: The user is presented with the contradiction and must choose a resolution path before the Roadmap is generated.

### 7.2 Sandbox Escape / Resource Exhaustion
*   **Scenario**: A Developer Agent accidentally (or via hallucination) runs a recursive script that consumes all CPU.
*   **Feature [FEAT-ERR-002]**: The Sandbox Monitor detects the 100% CPU usage spike.
*   **Action**: The process is killed at the 10-second mark, the sandbox is reset, and the agent is notified of the resource violation.

### 7.3 Token Limit / Context Bloat
*   **Scenario**: A complex refactoring task generates so many logs it approaches the 1M token limit.
*   **Feature [FEAT-ERR-003]**: At 800k tokens, the system triggers a **Context Refresh**.
*   **Action**: A Flash-model summarizes the turn history, keeping only the TAS and the active failing test in the raw window.

## 8. Resources & System Management

### 8.1 Resource Management
*   **[FEAT-RES-001] Token Budgeting**: Users can set hard and soft USD limits per project or per Epic.
*   **[FEAT-RES-002] Cost Transparency**: The VSCode dashboard displays a real-time estimation of the "Current Task Cost" and "Epic Spend."

### 8.2 Local Persistence & Portability
*   **[FEAT-POR-001] Zero-External-Dependency Storage**: All project state (SQLite, Vector DB, Logs) is stored within the `.devs/` folder, allowing for 100% portability between machines.
*   **[FEAT-POR-002] Project Export**: Command to generate a "Final Validation Report" and archive the project for handover.
