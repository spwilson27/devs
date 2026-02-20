### **[FEAT-CLI-001]** Project Lifecycle Management
- **Type:** Functional
- **Description:** Provide a comprehensive command set for project management including `init` (bootstrapping), `run` (continuous implementation), `pause`, `resume`, and `status`.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CLI-002]** Deterministic Rewind (Time-Travel)
- **Type:** Technical
- **Description:** Support the command `devs rewind --to <task_id>` to revert the filesystem (Git) and state (SQLite/Vector) to a specific historical checkpoint with 100% fidelity.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CLI-003]** Structured Audit Export
- **Type:** Technical
- **Description:** Support `--json` and `--markdown` flags on all status and log commands to facilitate integration with external CI/CD pipelines and automated auditing tools.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CLI-004]** Interactive TUI Approval Gates
- **Type:** UX
- **Description:** Implement a high-fidelity Terminal User Interface (TUI) for reviewing research reports and architecture specs, providing a rich, non-GUI way to manage human-in-the-loop gates.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CLI-005]** System Health (devs doctor)
- **Type:** Technical
- **Description:** Provide an automated diagnostic tool to verify Docker/WebContainer availability, API connectivity, and `.devs/` directory integrity.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-VSC-001]** Multi-Agent Dashboard
- **Type:** UX
- **Description:** Provide a dedicated VSCode sidebar view rendering current Epic progress, active task details, and a real-time visualization of the Task Dependency DAG.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-VSC-002]** Glass-Box Trace Streamer
- **Type:** UX
- **Description:** Implement a specialized "Agent Console" utilizing the Structured Agent-Orchestrator Protocol (SAOP) to stream reasoning (thoughts), tool calls (actions), and sandbox outputs (observations) with semantic highlighting.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-VSC-003]** Blueprint & Spec Previewer
- **Type:** UX
- **Description:** Provide native rendering for all Mermaid-based diagrams within PRDs/TAS documents, including live-updating ERDs and sequence diagrams.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-VSC-004]** Gated Autonomy UI
- **Type:** UX
- **Description:** Implement visual popups and status indicators for mandatory human-in-the-loop sign-offs, with integrated diff views for approving agent-proposed architectural changes.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-VSC-005]** Context Injection (Whispering)
- **Type:** Functional
- **Description:** Provide a dedicated input field to send mid-task "Directives" directly to the active agent's short-term memory without pausing the execution loop.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-MCP-001]** Orchestrator Control Server
- **Type:** Technical
- **Description:** Expose the `devs` state machine and requirement fulfillment status as an MCP server, allowing external agents to query project status and inject tasks.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-MCP-002]** Project Introspection Server
- **Type:** Technical
- **Description:** Every generated project must include an internal MCP server (`/mcp-server`) that provides tools for debugging, state inspection, and live profiling of the codebase.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-SYS-001]** LangGraph State Persistence
- **Type:** Technical
- **Description:** Implement ACID-compliant checkpointing of the entire multi-agent state machine to `state.sqlite`, ensuring the system can resume from the exact node/turn after interruption.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-SYS-002]** Requirement-to-Task Distillation
- **Type:** Functional
- **Description:** Automate the extraction of atomic requirements from specs, mapping each to a unique `REQ-ID` that is traced through the entire implementation lifecycle.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-SYS-003]** Dependency DAG Execution
- **Type:** Technical
- **Description:** Implement an intelligent task scheduler that respects technical dependencies and enables parallel execution of independent tasks within the same Epic.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-SYS-004]** Multi-Agent Cross-Verification
- **Type:** Security
- **Description:** Require mandatory review of implementation tasks by a separate "Reviewer Agent" using a clean sandbox to verify tests pass and TAS patterns are followed.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-MEM-001]** Tiered Memory Hierarchy
- **Type:** Technical
- **Description:** Implement a tiered memory system: Short-Term (volatile working set), Medium-Term (Epic-level decisions/summaries in SQLite), and Long-Term (project-wide constraints in Vector DB).
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-MEM-002]** Context Pruning & Refresh
- **Type:** Technical
- **Description:** Implement automatic sliding-window management and periodic (every 10 turns) re-injection of core TAS/PRD blueprints to prevent reasoning decay.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-MEM-003]** Semantic Memory Retrieval
- **Type:** Technical
- **Description:** Utilize proactive RAG (Retrieval-Augmented Generation) to fetch relevant historical decisions from LanceDB before starting a new task to ensure architectural consistency.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-SEC-001]** Ephemeral Sandbox Isolation
- **Type:** Security
- **Description:** Execute all agent commands in isolated Docker or WebContainer environments with restricted CPU/Memory quotas and "Default Deny" network policies.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-SEC-002]** PII & Secret Redaction
- **Type:** Security
- **Description:** Implement `SecretMasker` middleware to redact high-entropy strings (API keys, tokens) from sandbox outputs before they enter logs or LLM context.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-SEC-003]** Entropy & Loop Detection
- **Type:** Technical
- **Description:** Monitor repeating error hashes algorithmically; automatically trigger a "Strategy Pivot" or human-in-the-loop pause if an agent is stuck.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-SEC-004]** Git-Backed State Integrity
- **Type:** Security
- **Description:** Perform automatic Git commits after every successful task to create a permanent, verifiable audit trail of code evolution.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-ACC-001]** WCAG 2.1 Level AA Compliance
- **Type:** UX
- **Description:** The VSCode extension and web-based dashboards must adhere to WCAG 2.1 AA standards for contrast, focus management, and structural semantics.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-ACC-002]** Screen Reader Optimization (ARIA-Live)
- **Type:** UX
- **Description:** The "Agent Console" must utilize `aria-live` regions to announce real-time agent thoughts, actions, and observations (polite for thoughts, assertive for critical interventions).
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-ACC-003]** Keyboard-First Navigation
- **Type:** UX
- **Description:** Every interactive element in the CLI and VSCode UI must be reachable and operable via keyboard alone.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-ACC-004]** High-Contrast & Color Blindness Support
- **Type:** UX
- **Description:** The VSCode Extension must inherit active VSCode themes (including High Contrast) and Mermaid diagrams must use accessible color palettes and visual cues.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-ACC-005]** Responsive Sizing & Reflow
- **Type:** UX
- **Description:** The UI must support text scaling up to 200% without loss of functionality or layout breakage, reflowing gracefully in narrow viewports.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-LOC-001]** Universal Unicode Support
- **Type:** Technical
- **Description:** Support UTF-8 encoding across all project artifacts including PRDs, TAS, code, and reasoning logs.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-LOC-002]** Multi-Lingual Research & Analysis
- **Type:** Functional
- **Description:** Research Agents must be capable of scraping and analyzing documentation in multiple languages to provide a global technology perspective.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-LOC-003]** Locale-Aware Formatting
- **Type:** UX
- **Description:** Format all timestamps, numbers, and currencies according to the user's system locale in the UI.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-LOC-004]** Language-Specific Model Support
- **Type:** Technical
- **Description:** Allow users to specify LLM models optimized for their native language for reasoning and documentation.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-LOC-005]** Pluralization & Gendered Grammar
- **Type:** UX
- **Description:** Externalize all UI strings and manage via a localization framework that handles complex pluralization and grammatical rules.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-ACC-006]** Structural Navigation & Semantics
- **Type:** UX
- **Description:** Use semantic Markdown/HTML headers in all generated documents to enable rapid structural navigation by assistive technology.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-ACC-007]** Contextual Focus Management
- **Type:** UX
- **Description:** Automatically move focus to primary approval actions or clarification fields during human-in-the-loop gates.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-ACC-008]** Text-to-Speech (TTS) Compatibility
- **Type:** UX
- **Description:** Structure agent logs and thoughts to avoid technical noise, providing a "Clean Log" mode for audio consumption.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-011]** Root Cause Analysis (RCA) Reports
- **Type:** Technical
- **Description:** Generate a Markdown report identifying the likely cause of task failure (e.g., dependency conflict, hallucination) upon failure.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-012]** Interactive Failure Diffs
- **Type:** UX
- **Description:** Provide a visual comparison between failing test output and current implementation, highlighting code lines and associated `REQ-ID`.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-013]** "Suspended Sandbox" Access
- **Type:** Technical
- **Description:** Provide a one-click button or CLI command (`devs debug --task <ID>`) to open a terminal session inside the failing container state.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-014]** Visual Loop Indicators
- **Type:** UX
- **Description:** Highlight repeating tasks in the roadmap DAG UI using color-coding (e.g., orange for 3+ turns, red for 5+).
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-015]** Entropy Pivot Prompts
- **Type:** UX
- **Description:** Notify the user with a "Pivot Rationalization" message explaining why a previous approach was abandoned during a strategy pivot.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-016]** Manual Intervention Thresholds
- **Type:** Functional
- **Description:** Allow user-configurable limits for "Max Turns" and "Max Cost" per task, triggering a hard pause when exceeded.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-017]** AIC Interaction Dialogs
- **Type:** UX
- **Description:** Provide high-priority popups or interactive prompts when an agent identifies ambiguous or contradictory requirements.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-018]** Multi-Choice Resolution
- **Type:** Functional
- **Description:** Agents must propose 2-3 resolution strategies when asking for clarification.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-019]** Directive History Trace
- **Type:** Technical
- **Description:** Log all human interventions provided during failure states and vectorize them into Long-term Memory for future sessions.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-020]** Real-time Resource Gauges
- **Type:** UX
- **Description:** Provide visual feedback on current CPU, Memory, and Token usage for the active sandbox and orchestrator.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-021]** API Connectivity Monitoring
- **Type:** Technical
- **Description:** Implement real-time status indicators for Gemini API, Docker socket, and search provider connectivity.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-022]** Automated State Integrity Checks
- **Type:** Technical
- **Description:** Perform background validation of state and memory files, providing "Auto-Repair" prompts if corruption is detected.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-023]** Feedback Injection Tool
- **Type:** Functional
- **Description:** Provide an interface to inject global feedback (e.g., coding standards) that updates the project's Long-term Memory.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-ERR-024]** Requirement Refinement Mode
- **Type:** Functional
- **Description:** Allow users to edit PRD/TAS during a pause and offer to "Re-distill" the roadmap.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CTL-001]** Deterministic Rollback
- **Type:** Technical
- **Description:** Revert filesystem (Git) and state database to any historical Task ID.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CTL-002]** Memory Syncing
- **Type:** Technical
- **Description:** Prune the Vector DB (LanceDB) to remove semantic memories generated after a rewind point.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** [FEAT-CTL-001]

### **[FEAT-CTL-003]** Short-term Memory Injection
- **Type:** Functional
- **Description:** Allow users to send directives to an active agent that take precedence over the TAS for the current task.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CTL-004]** Strategy Override
- **Type:** Functional
- **Description:** Force an agent to pivot its implementation approach via user directive.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CTL-005]** Observation Hashing
- **Type:** Technical
- **Description:** Monitor repeating error messages in real-time to detect infinite loops.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-CTL-006]** Strategy Pivot
- **Type:** Technical
- **Description:** Automatically force "reasoning from first principles" when an agent loop is detected.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** [FEAT-CTL-005]

### **[FEAT-CTL-007]** Entropy Pause
- **Type:** Functional
- **Description:** Automatically suspend and hand-off to the user after 5 failed implementation attempts.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-RES-001]** Token Budgeting
- **Type:** Functional
- **Description:** Allow users to set hard and soft USD limits per project or per Epic.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-RES-002]** Cost Transparency
- **Type:** UX
- **Description:** Display real-time estimation of "Current Task Cost" and "Epic Spend" in the dashboard.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-POR-001]** Zero-External-Dependency Storage
- **Type:** Technical
- **Description:** Store all project state (SQLite, Vector DB, Logs) within the `.devs/` folder for 100% portability.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[FEAT-POR-002]** Project Export
- **Type:** Functional
- **Description:** Provide a command to generate a "Final Validation Report" and archive the project for handover.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-RES-001]** Research Confidence and Citations
- **Type:** Technical
- **Description:** Research reports must include confidence scores and source citations for all findings.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-DOC-001]** Gherkin User Stories
- **Type:** Technical
- **Description:** The PRD generated by the system must include detailed user stories in Gherkin format.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-DOC-002]** TAS Architectural Specs
- **Type:** Technical
- **Description:** The TAS must include proposed folder structure, data models (Mermaid ERDs), and interface contracts.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-TDD-001]** Red-Phase Verification
- **Type:** Technical
- **Description:** Agent must write a test that fails (Red Phase) before implementing logic for any requirement.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-TDD-002]** Green-Phase Implementation
- **Type:** Technical
- **Description:** Agent must implement logic to make the failing test pass (Green Phase) and use surgical edits to minimize file corruption.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** [REQ-TDD-001]

### **[REQ-AGENT-DOC-001]** Agent-Oriented Documentation
- **Type:** Technical
- **Description:** Agents must maintain `.agent.md` files with high documentation density, including performance findings and optimization notes.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-EDGE-RES-001]** Ambiguous Brief Handling
- **Type:** Functional
- **Description:** If project prompt is < 100 characters or lacks a clear objective, system must emit `CLARIFICATION_REQUIRED` and provide an input field.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-EDGE-RES-002]** Adjacent Market Analysis
- **Type:** Functional
- **Description:** If no direct competitors are found during research, agents must perform adjacent market analysis instead of returning empty results.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-EDGE-ARC-001]** Spec Linting
- **Type:** Technical
- **Description:** System must run `LINT_SPECS` on PRD/TAS manual edits and block progress if syntax errors (e.g., broken Mermaid) are found.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-EDGE-ARC-002]** Constraint Violation Handling
- **Type:** Functional
- **Description:** If a user directive contradicts project-wide constraints, system must trigger a "Constraint Violation Dialog" for override.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-EDGE-PLN-001]** Coverage Gap Detection
- **Type:** Technical
- **Description:** System must flag a "Coverage Gap" if a PRD requirement cannot be mapped to any implementation task.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-EDGE-PLN-002]** Cycle Resolution in DAG
- **Type:** Technical
- **Description:** Orchestrator must automatically run "Cycle Resolution" or prompt user if a circular dependency is detected in the Task DAG.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-EDGE-IMP-001]** Logic Verification Turn
- **Type:** Security
- **Description:** Reviewer Agent must analyze test code against requirement text to prevent "Test Hallucination" (tests that pass incorrectly).
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-EDGE-IMP-002]** Sandbox Resource Protection
- **Type:** Security
- **Description:** `SandboxMonitor` must kill processes exceeding limits (e.g., 10s CPU spike) and notify user with "Resource Limit Exceeded" alert.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-EDGE-IMP-003]** Flaky Test Mitigation
- **Type:** Technical
- **Description:** If a test fails in review after passing in implementation, system flags as `FLAKY_POTENTIAL` and runs 3 times to verify.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-EDGE-SYS-001]** Dirty Workspace Protection
- **Type:** Technical
- **Description:** Block rewind operations if the workspace has uncommitted manual changes; prompt user to commit, stash, or discard.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-EDGE-SYS-002]** Log Recovery Tool
- **Type:** Technical
- **Description:** Agent must have a `read_logs` tool to retrieve raw historical data if context refresh summaries are insufficient.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-EDGE-SYS-003]** Network Interruption Recovery
- **Type:** Technical
- **Description:** System must perform "Graceful Suspension" on network loss and auto-resume upon reconnection.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-EDGE-ACC-001]** Visual Diagram Alternatives
- **Type:** UX
- **Description:** System must provide machine-generated text summaries or queryable tables as alternatives for all visual Mermaid diagrams.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-EDGE-LOC-001]** RTL Layout Support
- **Type:** UX
- **Description:** VSCode Extension dashboard must support RTL mirroring for appropriate languages using CSS logical properties.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-EDGE-LOC-002]** Cross-Language Intent Verification
- **Type:** Security
- **Description:** Reviewer Agent must verify semantic intent is preserved when requirements and implementation code use different languages.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None
