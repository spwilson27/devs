### **[FEAT-CLI-001]** Project Lifecycle Management
- **Type:** Functional
- **Description:** Comprehensive command set for `init` (bootstrapping), `run` (continuous implementation), `pause`, `resume`, and `status`.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CLI-002]** Deterministic Rewind (Time-Travel)
- **Type:** Technical
- **Description:** Command `devs rewind --to <task_id>` to revert the filesystem (Git) and state (SQLite/Vector) to a specific historical checkpoint with 100% fidelity.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CLI-003]** Structured Audit Export
- **Type:** Technical
- **Description:** Support for `--json` and `--markdown` flags on all status and log commands to facilitate integration with external CI/CD pipelines and automated auditing tools.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CLI-004]** Interactive TUI Approval Gates
- **Type:** UX
- **Description:** A high-fidelity Terminal User Interface for reviewing research reports and architecture specs, providing a rich, non-GUI way to manage human-in-the-loop gates.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CLI-005]** System Health (devs doctor)
- **Type:** Technical
- **Description:** Automated diagnostic tool to verify Docker/WebContainer availability, API connectivity, and `.devs/` directory integrity.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-VSC-001]** Multi-Agent Dashboard
- **Type:** UX
- **Description:** A dedicated sidebar view rendering the current Epic progress, active task details, and a real-time visualization of the Task Dependency DAG.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-VSC-002]** Glass-Box Trace Streamer
- **Type:** UX
- **Description:** A specialized "Agent Console" utilizing the Structured Agent-Orchestrator Protocol (SAOP) to stream reasoning (thoughts), tool calls (actions), and sandbox outputs (observations) with semantic highlighting.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-VSC-003]** Blueprint & Spec Previewer
- **Type:** UX
- **Description:** Native rendering for all Mermaid-based diagrams within PRDs/TAS documents, including live-updating ERDs and sequence diagrams during the Design phase.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-VSC-004]** Gated Autonomy UI
- **Type:** UX
- **Description:** Visual popups and status indicators for mandatory human-in-the-loop sign-offs, with integrated diff views for approving agent-proposed architectural changes.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-VSC-005]** Context Injection (Whispering)
- **Type:** UX
- **Description:** A dedicated input field to send mid-task "Directives" directly to the active agent's short-term memory without pausing the execution loop.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-MCP-001]** Orchestrator Control Server
- **Type:** Technical
- **Description:** Exposes the `devs` state machine and requirement fulfillment status as an MCP server, allowing external agents (e.g., Cursor, Gemini) to query project status and inject tasks.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-MCP-002]** Project Introspection Server
- **Type:** Technical
- **Description:** Every generated project includes an internal MCP server (`/mcp-server`) that provides tools for debugging, state inspection, and live profiling of the newly built codebase.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-SYS-001]** LangGraph State Persistence
- **Type:** Technical
- **Description:** ACID-compliant checkpointing of the entire multi-agent state machine to `state.sqlite`, ensuring the system can resume from the exact node/turn after a crash or network drop.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-SYS-002]** Requirement-to-Task Distillation
- **Type:** Technical
- **Description:** Automated extraction of atomic requirements from specs, mapping each to a unique `REQ-ID` that is traced through the entire implementation lifecycle.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-SYS-003]** Dependency DAG Execution
- **Type:** Technical
- **Description:** Intelligent task scheduler that respects technical dependencies and enables parallel execution of independent tasks within the same Epic.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-SYS-004]** Multi-Agent Cross-Verification
- **Type:** Technical
- **Description:** Mandatory review of implementation tasks by a separate "Reviewer Agent" using a clean sandbox to verify that tests pass and TAS patterns are followed.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-MEM-001]** Tiered Memory Hierarchy
- **Type:** Technical
- **Description:** Short-term (active files/tools), Medium-term (Epic decisions/tasks in SQLite), and Long-term (Project constraints/architectural DNA in Vector DB) memory management.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-MEM-002]** Context Pruning & Refresh
- **Type:** Technical
- **Description:** Automatic sliding-window management to keep agent context windows focused while re-injecting core TAS/PRD blueprints every 10 turns.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-MEM-003]** Semantic Memory Retrieval
- **Type:** Technical
- **Description:** Proactive RAG (Retrieval-Augmented Generation) that fetches relevant historical decisions from LanceDB before starting a new task.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-SEC-001]** Ephemeral Sandbox Isolation
- **Type:** Security
- **Description:** Mandatory execution of all agent commands in isolated Docker or WebContainer environments with restricted CPU/Memory quotas and "Default Deny" network policies.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-SEC-002]** PII & Secret Redaction
- **Type:** Security
- **Description:** Real-time `SecretMasker` middleware that intercepts sandbox output and redacts high-entropy strings (API keys, tokens) before they enter the logs or LLM context.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-SEC-003]** Entropy & Loop Detection
- **Type:** Security
- **Description:** Algorithmic monitoring of repeating error hashes; automatically triggers a "Strategy Pivot" or human-in-the-loop pause if an agent gets stuck.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-SEC-004]** Git-Backed State Integrity
- **Type:** Technical
- **Description:** Automatic Git commits after every successful task, creating a permanent, verifiable audit trail of code evolution.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-UI-001]** Research Progress UI
- **Type:** UX
- **Description:** VSCode Sidebar shows a "Researching..." status with a list of active search queries and scraped URLs.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-UI-002]** Research Progress CLI
- **Type:** UX
- **Description:** CLI shows a progress bar with `[Scraping competitors...]`.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[EDGE-RES-01]** Ambiguous Brief
- **Type:** UX
- **Description:** If the prompt is < 100 characters or lacks a clear objective, the agent MUST emit a `CLARIFICATION_REQUIRED` status and present a clarification input.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[EDGE-RES-02]** Search Dead-end
- **Type:** Functional
- **Description:** If no relevant competitors are found, the agent MUST perform "Adjacent Market Analysis" and explain why a direct match was not found.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[EDGE-RES-03]** Source Contradiction
- **Type:** Functional
- **Description:** If scraped sources provide conflicting data, the agent must flag this as a "Contradictory Finding" with a lower confidence score.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-UI-003]** Blueprint Review Dashboard
- **Type:** UX
- **Description:** VSCode renders a "Review Dashboard" with a side-by-side view of the Brief and the new Specs.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-UI-004]** Interactive Diagrams
- **Type:** UX
- **Description:** Mermaid diagrams (ERDs, Sequence) are rendered as interactive SVG blocks in the review dashboard.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[EDGE-ARC-01]** Manual Markdown Corruption
- **Type:** Technical
- **Description:** If manual edits introduce syntax errors in PRD/TAS, the system must run a `LINT_SPECS` check and block progress.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[EDGE-ARC-02]** Pattern Conflict
- **Type:** Functional
- **Description:** If a requested pattern contradicts project-wide constraints, trigger a "Constraint Violation Dialog" for user override.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-UI-005]** Roadmap Viewer
- **Type:** UX
- **Description:** A "Roadmap Viewer" (Gantt-style or DAG) showing the 8-16 Epics, expandable to show constituent tasks.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[EDGE-PLN-01]** Requirement Orphanage
- **Type:** Technical
- **Description:** If a requirement cannot be mapped to any implementation task, flag a "Coverage Gap" and force re-decomposition.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[EDGE-PLN-02]** Circular Task Dependencies
- **Type:** Technical
- **Description:** If the DAG generator creates a cycle, automatically run "Cycle Resolution" or prompt the user for reordering.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-UI-006]** Active Task Visibility
- **Type:** UX
- **Description:** UI shows "Active Task" card with REQ-ID.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-UI-007]** TDD Phase Feedback
- **Type:** UX
- **Description:** CLI/VSCode Terminal shows TDD phase progress (Test Established Red, Requirement Met Green) and Reviewer status.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[EDGE-IMP-01]** Test Hallucination
- **Type:** Technical
- **Description:** If a test passes incorrectly, Reviewer Agent performs "Logic Verification" comparing test code to requirement text.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[EDGE-IMP-02]** Sandbox Resource Exhaustion
- **Type:** Technical
- **Description:** If a task triggers a memory leak or infinite loop, SandboxMonitor kills the process and alerts the user.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[EDGE-IMP-03]** Flaky Test Detection
- **Type:** Technical
- **Description:** If a test is unstable during regression checks, flag as `FLAKY_POTENTIAL` and execute 3 consecutive runs.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[EDGE-SYS-01]** Dirty Workspace Rewind Block
- **Type:** Technical
- **Description:** Block rewind if workspace has uncommitted manual changes; prompt user to commit, stash, or discard.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[EDGE-SYS-02]** Context Refresh Log Retrieval
- **Type:** Technical
- **Description:** Agent MUST have a `read_logs` tool to retrieve raw historical data if context refresh summary is insufficient.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[EDGE-SYS-03]** Network Interruption Graceful Suspension
- **Type:** Technical
- **Description:** Perform "Graceful Suspension" on network loss, saving state for automatic resume.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-ACC-001]** WCAG 2.1 Level AA Compliance
- **Type:** UX
- **Description:** VSCode extension and dashboards must adhere to WCAG 2.1 AA standards.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-ACC-002]** Screen Reader Optimization (ARIA-Live)
- **Type:** UX
- **Description:** Agent Console must use `aria-live` regions for real-time thoughts, actions, and observations.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-ACC-003]** Keyboard-First Navigation
- **Type:** UX
- **Description:** Every interactive element must be reachable and operable via keyboard alone.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-ACC-004]** High-Contrast & Color Blindness Support
- **Type:** UX
- **Description:** Dynamic inheritance of VSCode themes and accessible color palettes for Mermaid diagrams.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-ACC-005]** Responsive Sizing & Reflow
- **Type:** UX
- **Description:** Support text scaling up to 200% and graceful layout reflow.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-LOC-001]** Universal Unicode Support
- **Type:** Technical
- **Description:** UTF-8 encoding across all project artifacts and reasoning logs.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-LOC-002]** Multi-Lingual Research & Analysis
- **Type:** Technical
- **Description:** Research Agent must be capable of scraping and distilling documentation in multiple languages.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-LOC-003]** Locale-Aware Formatting
- **Type:** UX
- **Description:** Timestamps, numbers, and currencies formatted according to user system locale.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-LOC-004]** Language-Specific Model Support
- **Type:** Technical
- **Description:** Allow users to specify LLM models optimized for their native language.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-LOC-005]** Pluralization & Gendered Grammar
- **Type:** UX
- **Description:** Externalized UI strings managed via localization framework handling complex grammatical rules.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-ACC-006]** Structural Navigation & Semantics
- **Type:** UX
- **Description:** Semantic Markdown/HTML headers in generated documents for assistive technology navigation.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-ACC-007]** Contextual Focus Management
- **Type:** UX
- **Description:** Automatic focus management during human-in-the-loop gates.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-ACC-008]** Text-to-Speech (TTS) Compatibility
- **Type:** UX
- **Description:** Structured agent logs to avoid excessive punctuation/noise for better TTS experience.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[EDGE-ACC-01]** Visual Diagram Alternatives
- **Type:** UX
- **Description:** Provide machine-generated text summary or queryable table format for all visual diagrams.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[EDGE-LOC-01]** RTL Layout Support
- **Type:** UX
- **Description:** Support RTL mirroring for languages like Arabic/Hebrew using CSS logical properties.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[EDGE-LOC-02]** Cross-Language Requirement Traceability
- **Type:** Technical
- **Description:** Verify semantic intent preservation across language boundaries (e.g., requirement in one language, implementation in English).
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-011]** Root Cause Analysis (RCA) Reports
- **Type:** Technical
- **Description:** Reviewer Agent generates Markdown reports identifying likely cause of task failure.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-012]** Interactive Failure Diffs
- **Type:** UX
- **Description:** Visual comparison between failing test output and implementation, highlighting specific requirements.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-013]** "Suspended Sandbox" Access
- **Type:** Technical
- **Description:** One-click terminal access to the exact container state where failure occurred.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-014]** Visual Loop Indicators
- **Type:** UX
- **Description:** Roadmap DAG highlights repeating tasks with color-coding (e.g., orange/red).
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-015]** Entropy Pivot Prompts
- **Type:** UX
- **Description:** "Pivot Rationalization" messages explaining why a previous approach was abandoned.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-016]** Manual Intervention Thresholds
- **Type:** Functional
- **Description:** User-configurable "Max Turns" and "Max Cost" limits per task, triggering hard pauses.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-017]** AIC Interaction Dialogs
- **Type:** UX
- **Description:** High-priority popups for agent-initiated clarifications on ambiguous requirements.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-018]** Multi-Choice Resolution
- **Type:** Functional
- **Description:** Agents propose 2-3 resolution strategies for identified conflicts.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-019]** Directive History Trace
- **Type:** Technical
- **Description:** Log of human interventions vectorized into Long-term Memory for future sessions.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-020]** Real-time Resource Gauges
- **Type:** UX
- **Description:** Visual feedback on CPU, Memory, and Token usage for active sandbox/orchestrator.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-021]** API Connectivity Monitoring
- **Type:** Technical
- **Description:** Real-time status indicators for Gemini API, Docker socket, and search provider connectivity.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-022]** Automated State Integrity Checks
- **Type:** Technical
- **Description:** Background validation of state.sqlite and memory.lancedb with auto-repair prompts.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-023]** Feedback Injection Tool
- **Type:** UX
- **Description:** Interface to provide global feedback (e.g., "Always use async/await") that updates Long-term Memory.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-024]** Requirement Refinement Mode
- **Type:** Functional
- **Description:** Edit PRD/TAS during pause and re-distill roadmap to reflect changes.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CTL-001]** Deterministic Rollback
- **Type:** Technical
- **Description:** Reverts filesystem (Git) and state database to any historical Task ID.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CTL-002]** Memory Syncing
- **Type:** Technical
- **Description:** Pruning of Vector DB to remove memories generated after a rewind point.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CTL-003]** Short-term Memory Injection
- **Type:** Technical
- **Description:** Send directives to an active agent that take precedence over the TAS for the current task.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CTL-004]** Strategy Override
- **Type:** Functional
- **Description:** Forcing an agent to pivot its implementation approach (e.g., "Use library X instead of Y").
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CTL-005]** Observation Hashing
- **Type:** Technical
- **Description:** Real-time monitoring of repeating error messages to detect infinite loops.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CTL-006]** Strategy Pivot
- **Type:** Technical
- **Description:** Automatic forced "reasoning from first principles" when a loop is detected.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CTL-007]** Entropy Pause
- **Type:** Functional
- **Description:** Automatic suspension and hand-off to the user after 5 failed implementation attempts.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-001]** Requirement Contradiction
- **Type:** Functional
- **Description:** Detect logical mismatch between docs (e.g., PRD vs TAS) and trigger user clarification.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-002]** Sandbox Escape / Resource Exhaustion
- **Type:** Security
- **Description:** Sandbox Monitor kills processes exceeding resource limits (e.g., 100% CPU for 10s).
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-003]** Token Limit / Context Bloat
- **Type:** Technical
- **Description:** Trigger "Context Refresh" at 800k tokens, summarizing history while keeping critical blueprints.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-RES-001]** Token Budgeting
- **Type:** Functional
- **Description:** Users can set hard and soft USD limits per project or per Epic.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-RES-002]** Cost Transparency
- **Type:** UX
- **Description:** Real-time estimation of "Current Task Cost" and "Epic Spend" in dashboard.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-POR-001]** Zero-External-Dependency Storage
- **Type:** Technical
- **Description:** All project state (SQLite, Vector DB, Logs) stored within .devs/ folder for portability.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-POR-002]** Project Export
- **Type:** Technical
- **Description:** Generate "Final Validation Report" and archive project for handover.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None
