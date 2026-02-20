### **[4_USER_FEATURES-REQ-001]** Project Lifecycle Management
- **Type:** Functional
- **Description:** Comprehensive command set for `init` (bootstrapping), `run` (continuous implementation), `pause`, `resume`, and `status`.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-002]** Deterministic Rewind (Time-Travel)
- **Type:** Functional
- **Description:** Command `devs rewind --to <task_id>` to revert the filesystem (Git) and state (SQLite/Vector) to a specific historical checkpoint with 100% fidelity.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-003]** Structured Audit Export
- **Type:** Technical
- **Description:** Support for `--json` and `--markdown` flags on all status and log commands to facilitate integration with external CI/CD pipelines and automated auditing tools.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-004]** Interactive TUI Approval Gates
- **Type:** UX
- **Description:** A high-fidelity Terminal User Interface for reviewing research reports and architecture specs, providing a rich, non-GUI way to manage human-in-the-loop gates.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-005]** System Health (devs doctor)
- **Type:** Technical
- **Description:** Automated diagnostic tool to verify Docker/WebContainer availability, API connectivity, and `.devs/` directory integrity.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-006]** Multi-Agent Dashboard
- **Type:** UX
- **Description:** A dedicated sidebar view rendering the current Epic progress, active task details, and a real-time visualization of the Task Dependency DAG.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-007]** Glass-Box Trace Streamer
- **Type:** UX
- **Description:** A specialized "Agent Console" utilizing the Structured Agent-Orchestrator Protocol (SAOP) to stream reasoning (thoughts), tool calls (actions), and sandbox outputs (observations) with semantic highlighting.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-008]** Blueprint & Spec Previewer
- **Type:** UX
- **Description:** Native rendering for all Mermaid-based diagrams within PRDs/TAS documents, including live-updating ERDs and sequence diagrams during the Design phase.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-009]** Gated Autonomy UI
- **Type:** UX
- **Description:** Visual popups and status indicators for mandatory human-in-the-loop sign-offs, with integrated diff views for approving agent-proposed architectural changes.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-010]** Context Injection (Whispering)
- **Type:** Functional
- **Description:** A dedicated input field to send mid-task "Directives" directly to the active agent's short-term memory without pausing the execution loop.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-011]** Orchestrator Control Server
- **Type:** Technical
- **Description:** Exposes the `devs` state machine and requirement fulfillment status as an MCP server, allowing external agents (e.g., Cursor, Gemini) to query project status and inject tasks.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-012]** Project Introspection Server
- **Type:** Technical
- **Description:** Every generated project includes an internal MCP server (`/mcp-server`) that provides tools for debugging, state inspection, and live profiling of the newly built codebase.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-013]** LangGraph State Persistence
- **Type:** Technical
- **Description:** ACID-compliant checkpointing of the entire multi-agent state machine to `state.sqlite`, ensuring the system can resume from the exact node/turn after a crash or network drop.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-014]** Requirement-to-Task Distillation
- **Type:** Technical
- **Description:** Automated extraction of atomic requirements from specs, mapping each to a unique `REQ-ID` that is traced through the entire implementation lifecycle.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-015]** Dependency DAG Execution
- **Type:** Technical
- **Description:** Intelligent task scheduler that respects technical dependencies and enables parallel execution of independent tasks within the same Epic.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-016]** Multi-Agent Cross-Verification
- **Type:** Technical
- **Description:** Mandatory review of implementation tasks by a separate "Reviewer Agent" using a clean sandbox to verify that tests pass and TAS patterns are followed.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-017]** Tiered Memory Hierarchy
- **Type:** Technical
- **Description:** Support for Short-Term (active files/tool outputs), Medium-Term (Epic-level decisions/task summaries in SQLite), and Long-Term (project-wide constraints/architectural DNA in Vector DB) memory.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-018]** Context Pruning & Refresh
- **Type:** Technical
- **Description:** Automatic sliding-window management to keep agent context windows focused while re-injecting core TAS/PRD blueprints every 10 turns to prevent "reasoning decay."
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-019]** Semantic Memory Retrieval
- **Type:** Technical
- **Description:** Proactive RAG (Retrieval-Augmented Generation) that fetches relevant historical decisions from LanceDB before starting a new task to ensure architectural consistency.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-020]** Ephemeral Sandbox Isolation
- **Type:** Security
- **Description:** Mandatory execution of all agent commands in isolated Docker or WebContainer environments with restricted CPU/Memory quotas and "Default Deny" network policies.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-021]** PII & Secret Redaction
- **Type:** Security
- **Description:** Real-time `SecretMasker` middleware that intercepts sandbox output and redacts high-entropy strings (API keys, tokens) before they enter the logs or LLM context.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-022]** Entropy & Loop Detection
- **Type:** Technical
- **Description:** Algorithmic monitoring of repeating error hashes; automatically triggers a "Strategy Pivot" or human-in-the-loop pause if an agent gets stuck in a failing implementation cycle.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-023]** Git-Backed State Integrity
- **Type:** Security
- **Description:** Automatic Git commits after every successful task, creating a permanent, verifiable audit trail of code evolution.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-024]** VSCode Sidebar Research Status
- **Type:** UX
- **Description:** VSCode Sidebar shows a "Researching..." status with a list of active search queries and scraped URLs during Phase 1.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-025]** CLI Progress Bar
- **Type:** UX
- **Description:** CLI shows a progress bar with `[Scraping competitors...]` during Phase 1 research.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-026]** Ambiguous Brief Handling
- **Type:** Functional
- **Description:** If the prompt is < 100 characters or lacks a clear objective, the agent MUST emit a `CLARIFICATION_REQUIRED` status and present a clarification field.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-027]** Search Dead-end Handling
- **Type:** Functional
- **Description:** If no relevant competitors are found, the agent MUST perform "Adjacent Market Analysis" and explain why a direct match was not found.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-028]** Source Contradiction Handling
- **Type:** Functional
- **Description:** If scraped sources provide conflicting data, the agent must flag this as a "Contradictory Finding" with a lower confidence score.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-029]** Review Dashboard UI
- **Type:** UX
- **Description:** VSCode renders a "Review Dashboard" with a side-by-side view of the Brief and the new Specs during Phase 2.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-030]** Interactive SVG Mermaid Diagrams
- **Type:** UX
- **Description:** Mermaid diagrams (ERDs, Sequence) are rendered as interactive SVG blocks within the VSCode review mode.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-031]** Manual Markdown Corruption Linting
- **Type:** Functional
- **Description:** If the user manually edits specs and introduces syntax errors, the system must run a `LINT_SPECS` check and highlight error lines.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-032]** Pattern Conflict Dialog
- **Type:** UX
- **Description:** If a user directive contradicts project-wide constraints, the system MUST trigger a "Constraint Violation Dialog" for override confirmation.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-033]** Roadmap Viewer (Gantt/DAG)
- **Type:** UX
- **Description:** A "Roadmap Viewer" (Gantt-style or DAG) showing 8-16 Epics, each expandable to show constituent tasks.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-034]** Requirement Orphanage Detection
- **Type:** Functional
- **Description:** If a PRD requirement cannot be mapped to any task, the system flags a "Coverage Gap" and forces re-decomposition.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-035]** Circular Task Dependency Resolution
- **Type:** Functional
- **Description:** If the DAG generator creates a cycle, the orchestrator must automatically run "Cycle Resolution" or prompt for manual reordering.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-036]** Active Task Card UI
- **Type:** UX
- **Description:** UI shows an "Active Task" card with the corresponding REQ-ID during implementation.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-037]** TDD Test Status UI
- **Type:** UX
- **Description:** CLI/VSCode Terminal shows `npm test` failure/success with statuses like "Test Established (Red)" and "Requirement Met (Green)".
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-038]** Test Hallucination Verification
- **Type:** Functional
- **Description:** Reviewer Agent performs a "Logic Verification" turn to ensure tests pass correctly and are not hallucinated (e.g., `expect(true).toBe(true)`).
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-039]** Sandbox Resource Exhaustion Management
- **Type:** Technical
- **Description:** `SandboxMonitor` kills processes exceeding limits (e.g., memory leak, infinite loop) and triggers an "Resource Limit Exceeded" alert.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-040]** Flaky Test Detection
- **Type:** Technical
- **Description:** If a test passes once but fails during review, it is flagged as `FLAKY_POTENTIAL` and executed 3 times to verify stability.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-041]** Dirty Workspace Rewind Block
- **Type:** Functional
- **Description:** System blocks rewind if the workspace has uncommitted manual changes, prompting to "Commit, Stash, or Discard".
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-042]** Historical Log Retrieval Tool
- **Type:** Technical
- **Description:** Agent MUST have a `read_logs` tool to retrieve raw historical data if context summaries are insufficient.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-043]** Graceful Suspension on Interruption
- **Type:** Technical
- **Description:** On network loss, the orchestrator saves the current turn state to SQLite and resumes automatically upon reconnection.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-044]** WCAG 2.1 Level AA Compliance
- **Type:** Non-Functional
- **Description:** The VSCode extension and web dashboards MUST adhere to WCAG 2.1 AA standards for contrast, focus, and semantics.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-045]** Screen Reader ARIA-Live Optimization
- **Type:** Non-Functional
- **Description:** "Agent Console" MUST use `aria-live` regions (polite for thoughts, assertive for interventions) for real-time announcements.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-046]** Keyboard-First Navigation
- **Type:** Non-Functional
- **Description:** Every interactive element in CLI and VSCode UI MUST be reachable and operable via keyboard.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-047]** High-Contrast & Color Blindness Support
- **Type:** Non-Functional
- **Description:** UI must respect VSCode High Contrast themes; Mermaid diagrams must use accessible palettes and visual cues.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-048]** Responsive Sizing & Reflow
- **Type:** Non-Functional
- **Description:** UI MUST support text scaling up to 200% and reflow gracefully without loss of functionality.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-049]** Universal Unicode Support
- **Type:** Non-Functional
- **Description:** Support UTF-8 encoding across all artifacts (specs, code, logs) for global scripts and symbols.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-050]** Multi-Lingual Research & Analysis
- **Type:** Non-Functional
- **Description:** Research Agent must be capable of scraping and distilling documentation in multiple languages (English, Chinese, Spanish, Japanese, etc.).
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-051]** Locale-Aware Formatting
- **Type:** Non-Functional
- **Description:** UI timestamps, numbers, and currencies MUST follow user system locale; internal storage uses ISO 8601 UTC.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-052]** Language-Specific Model Support
- **Type:** Non-Functional
- **Description:** Orchestrator should allow users to specify LLM models optimized for their native language.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-053]** Pluralization & Gendered Grammar
- **Type:** Non-Functional
- **Description:** UI strings must be externalized via a localization framework (e.g., `i18next`) handling complex grammatical rules.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-054]** Structural Navigation & Semantics
- **Type:** Non-Functional
- **Description:** Generated documents MUST use semantic headers to enable rapid structural navigation by assistive technologies.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-055]** Contextual Focus Management
- **Type:** Non-Functional
- **Description:** During human-in-the-loop gates, UI must automatically move focus to the primary action or clarification field.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-056]** Text-to-Speech (TTS) Compatibility
- **Type:** Non-Functional
- **Description:** Agent logs and thoughts must be structured to avoid technical noise, providing a "Clean Log" mode for audio.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-057]** Visual Diagram Alternatives
- **Type:** Non-Functional
- **Description:** System MUST provide text summaries or queryable table formats as alternatives for visual Mermaid diagrams.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-058]** RTL Layout Support
- **Type:** Non-Functional
- **Description:** VSCode Extension dashboard MUST support RTL mirroring and use CSS logical properties for languages like Arabic or Hebrew.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-059]** Cross-Language Requirement Traceability
- **Type:** Non-Functional
- **Description:** Reviewer Agent MUST verify semantic intent is preserved when requirements are in one language and code is in English.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-060]** Root Cause Analysis (RCA) Reports
- **Type:** Functional
- **Description:** Reviewer Agent generates Markdown reports on task failure identifying causes like dependency conflicts or hallucinations.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-061]** Interactive Failure Diffs
- **Type:** UX
- **Description:** Visual comparison between failing test output and implementation, highlighting associated REQ-IDs.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-062]** "Suspended Sandbox" Access
- **Type:** Technical
- **Description:** One-click terminal access (`devs debug --task <ID>`) into the exact container state where a failure occurred.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-063]** Visual Loop Indicators
- **Type:** UX
- **Description:** Roadmap DAG UI highlights repeating tasks with color-coding (orange for turns 3+, red for 5+).
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-064]** Entropy Pivot Prompts
- **Type:** UX
- **Description:** Users are notified with a "Pivot Rationalization" message when the system forces a strategy change.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-065]** Manual Intervention Thresholds
- **Type:** Functional
- **Description:** User-configurable limits for "Max Turns" and "Max Cost" per task that trigger a hard pause.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-066]** AIC Interaction Dialogs
- **Type:** UX
- **Description:** High-priority popups or CLI prompts for agent-initiated clarification when conflicts are detected.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-067]** Multi-Choice Resolution Proposals
- **Type:** Functional
- **Description:** Agents propose 2-3 resolution strategies for conflicts (e.g., updating TAS vs. refactoring implementation).
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-068]** Directive History Trace
- **Type:** Technical
- **Description:** Log of all human interventions during failure states, vectorized into Long-term Memory.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-069]** Real-time Resource Gauges
- **Type:** UX
- **Description:** Visual feedback on CPU, Memory, and Token usage for active sandbox and orchestrator.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-070]** API Connectivity Monitoring
- **Type:** Technical
- **Description:** Real-time status indicators for Gemini API, Docker socket, and search provider connectivity.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-071]** Automated State Integrity Checks
- **Type:** Technical
- **Description:** Background validation of SQLite and LanceDB files with "Auto-Repair" prompts for corruption.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-072]** Feedback Injection Tool
- **Type:** Functional
- **Description:** Dedicated interface to provide global feedback that updates Long-term Memory (LanceDB).
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-073]** Requirement Refinement Mode
- **Type:** Functional
- **Description:** During pause, users can edit specs and the system offers to "Re-distill" the roadmap.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-074]** Deterministic Rollback
- **Type:** Functional
- **Description:** Reverts filesystem (Git) and state database (SQLite) to any historical Task ID.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-075]** Memory Syncing on Rewind
- **Type:** Technical
- **Description:** Pruning of Vector DB (LanceDB) to remove semantic memories generated after the rewind point.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-076]** Short-term Memory Injection
- **Type:** Functional
- **Description:** Users can send directives to an active agent that take precedence over the TAS for the current task.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-077]** Strategy Override
- **Type:** Functional
- **Description:** Forcing an agent to pivot its implementation approach (e.g., changing libraries).
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-078]** Observation Hashing
- **Type:** Technical
- **Description:** Real-time monitoring of repeating error messages to detect infinite loops.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-079]** Strategy Pivot on Loop
- **Type:** Technical
- **Description:** Automatic forced "reasoning from first principles" when an agentic loop is detected.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-080]** Entropy Pause
- **Type:** Technical
- **Description:** Automatic suspension and hand-off to the user after 5 failed implementation attempts.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-081]** Requirement Contradiction Detection
- **Type:** Security
- **Description:** Distiller Agent detects logical mismatches between docs (e.g., Offline First vs. Postgres-only) and requires clarification.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-082]** Sandbox Escape/Resource Exhaustion Detection
- **Type:** Security
- **Description:** Sandbox Monitor kills processes at 100% CPU usage spike (e.g., recursive script) after 10 seconds.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-083]** Token Limit Context Refresh
- **Type:** Technical
- **Description:** At 800k tokens, system triggers a context refresh using a summary to keep within 1M token limit.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-084]** Token Budgeting
- **Type:** Functional
- **Description:** Users can set hard and soft USD limits per project or per Epic.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-085]** Cost Transparency
- **Type:** UX
- **Description:** VSCode dashboard displays real-time estimation of "Current Task Cost" and "Epic Spend."
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-086]** Zero-External-Dependency Storage
- **Type:** Technical
- **Description:** All project state (SQLite, Vector DB, Logs) is stored within the `.devs/` folder for 100% portability.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-087]** Project Export
- **Type:** Technical
- **Description:** Command to generate a "Final Validation Report" and archive the project for handover.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None
