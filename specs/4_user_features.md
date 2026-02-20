# User Features Specification: devs

## 1. Feature Overview & Categorization

The `devs` system provides a comprehensive suite of features designed to manage the entire Software Development Life Cycle (SDLC) through an agentic, "Glass-Box" architecture. These features are categorized into seven primary functional domains, which collaborate to transform a high-level project description into a verified, functional codebase.

### 1.1 Feature Domain Matrix

| Domain | Functional Scope | Primary User Value | Key Artifacts / UI Components |
| :--- | :--- | :--- | :--- |
| **1. Research & Discovery** | Multi-agent competitive, market, and tech research. | Validated product-market fit and tech stack choice. | `research/` reports, Discovery Dashboard. |
| **2. Architectural Design** | Generation of PRD, TAS, Security, and UI/UX specs. | Authoritative, AI-ready blueprint for implementation. | `specs/` (Markdown + Mermaid), Spec Linter. |
| **3. Requirement Planning** | Distillation into ROM and topological task ordering. | Deterministic, traceable, and dependency-aware roadmap. | `requirements/distilled.json`, Roadmap Monitor. |
| **4. Implementation (TDD)** | Red-Green-Refactor cycles in sandboxed environments. | Verified, production-quality code with 100% test coverage. | `src/`, `tests/`, TDD Progress Stream. |
| **5. Glass-Box Observability** | Real-time "Thought" streams and action logs. | Absolute transparency and trust in agent reasoning. | State Graph, Thought Sidebar, Tool Audit Log. |
| **6. Time-Travel & Control** | Branching, forking, and state restoration. | Surgical steerability and recovery from agent drift. | Timeline Navigator, Branching UI, HITL Gates. |
| **7. Agentic Maintenance** | MCP-based introspection and self-documentation. | Long-term maintainability and AI-readiness. | `mcp-server/`, `GEMINI.md`, Documentation Portal. |

### 1.2 Domain 1: Research & Discovery
This domain is responsible for establishing the "Ground Truth" for the project before any code is written. It utilizes a swarm of specialized researchers to validate assumptions and select the optimal technical path.

*   **Key Features:**
    *   **Autonomous Scouting Swarm:** Invocation of specialized agents for Market (TAM/SAM/SOM), Competitive (Feature Matrix), and Tech Landscape (Stack Audit).
    *   **Citation Management:** Every claim made in a research report must include a `source_url` and a confidence score.
    *   **Decision Fork Clarification:** Identifying "Irreversible Decisions" early and prompting the user for guidance (e.g., "SQL vs. NoSQL for this specific scale?").
*   **Detailed Requirements:**
    *   Must support both "Basic" (cached/fast) and "Advanced" (deep/tavily) search modes.
    *   Must summarize competitive gaps into a "Differentiation Strategy" for the PRD.
*   **Edge Cases & Risks:**
    *   **Contradictory Research:** If the Market Agent suggests feature X but the Tech Agent says X is impossible at the requested budget. *Mitigation: Conflict Resolution Agent.*
    *   **Search Loop Stagnation:** Agent getting stuck searching for non-existent documentation. *Mitigation: Hard timeout and human escalation.*

### 1.3 Domain 2: Architectural Specification
Transforms raw research into an authoritative, machine-readable blueprint. This domain ensures that the project follows rigorous engineering standards from day one.

*   **Key Features:**
    *   **AI-Ready Spec Authoring:** Generation of `1_prd.md`, `2_tas.md`, `3_security.md`, and `4_ui_ux.md`.
    *   **Mermaid.js Integration:** Automated generation of ERDs, Sequence Diagrams, and User Flowcharts.
    *   **Cross-Doc Linter:** An agent that audits the TAS against the PRD to ensure 100% requirement coverage at the design level.
*   **Detailed Requirements:**
    *   Security Design must include a STRIDE threat model and a Data Classification matrix.
    *   TAS must define folder structures, naming conventions, and specific library versions.
*   **Edge Cases & Risks:**
    *   **Architectural Hallucination:** Agent suggesting patterns that don't exist or are incompatible.
    *   **Pattern Overload:** Recommending complex Microservices for a simple MVP. *Mitigation: "Lean-First" heuristic in the Architect Persona.*

### 1.4 Domain 3: Requirement Distillation & Planning
The bridge between static documentation and the executable, dependency-aware roadmap.

*   **Key Features:**
    *   **ROM Distillation:** Automatic extraction of requirements into a machine-readable `distilled.json` with unique `REQ-###` IDs.
    *   **Topological Dependency Sort:** Ordering tasks based on structural necessity (e.g., Auth must precede Profile).
    *   **Atomic Task Breakdown:** Ensuring tasks are small enough to be implemented in a single TDD turn (< 25 turns).
*   **Detailed Requirements:**
    *   Every requirement must have a natural-language "Validation Criteria" used by the Reviewer Agent.
    *   Roadmap must include "Milestone Gates" that require explicit human approval.
*   **Edge Cases & Risks:**
    *   **Circular Dependencies:** Detecting and flagging logic loops in the TAS (A depends on B, B depends on A).
    *   **Requirement Bloat:** Detecting redundant or overlapping requirements from different specs.

### 1.5 Domain 4: Implementation & TDD Lifecycle
The core execution engine where verified code is produced through a strict "Green-Light" protocol.

*   **Key Features:**
    *   **Red-Green-Refactor Engine:** Mandates a failing test file before implementation. Blocks implementation if the test passes prematurely.
    *   **Secondary Auditor Review:** A separate LLM model (e.g., Gemini Pro) audits the implementation for TAS compliance and security.
    *   **Sandbox Isolation:** Execution of all commands in a Docker container with restricted FS and Network access.
*   **Detailed Requirements:**
    *   Must support `npm`, `pnpm`, `cargo`, and `pip` environments.
    *   Must stream real-time container telemetry (CPU, Memory, Logs) to the VSCode extension.
*   **Edge Cases & Risks:**
    *   **Tautological Tests:** Agents writing `expect(true).toBe(true)` to bypass TDD. *Mitigation: Reviewer Agent audits test quality.*
    *   **The "Fix-Regress" Death Loop:** Agent fixing one bug and breaking another repeatedly. *Mitigation: Heuristic loop detection and "State Reset."*

### 1.6 Domain 5: Glass-Box Observability
The visual and diagnostic head of the system, ensuring absolute transparency.

*   **Key Features:**
    *   **Interactive State Graph:** D3-based DAG showing every turn, tool call, and decision.
    *   **Thought Stream Analytics:** Categorized logs of the agent's internal reasoning (Observation, Reflection, Strategy).
    *   **Audit Trail:** Searchable, hashed logs of all filesystem and shell actions.
*   **Detailed Requirements:**
    *   UI must support "Time-Travel Scrubbing" (dragging a slider to see project state at any turn).
    *   Must display real-time token consumption and estimated project cost.
*   **Edge Cases & Risks:**
    *   **UI Performance:** Handling graphs with >10k nodes in VSCode Webview.
    *   **Context Fragmentation:** Summarizing old turns without losing the "Why" behind a decision.

### 1.7 Domain 6: Time-Travel, Branching & Control
Empowers the user to act as the "Lead Architect" and steer the agentic swarm.

*   **Key Features:**
    *   **Atomic Restoration:** Coordinated Git/SQLite/LLM-Context reset to any historical checkpoint.
    *   **Directive Injection:** Pausing an agent to inject a "Surgical Directive" (e.g., "Use a different library for this task").
    *   **Branching & Forking:** Creating parallel timelines to compare different architectural approaches.
*   **Detailed Requirements:**
    *   Must support "Manual Reconciliation" if the user edits code while the agent is paused.
    *   Restoration must be verified via a "State Pulse" to ensure FS and Ledger are in sync.
*   **Edge Cases & Risks:**
    *   **State Divergence:** User editing code and then resuming the agent without reconciliation.
    *   **History Corruption:** Managing SQLite WAL integrity during high-frequency turn cycles.

### 1.8 Domain 7: Agentic-Native Maintenance
Ensures the finished project is "AI-Ready" for long-term maintenance and evolution.

*   **Key Features:**
    *   **Internal MCP Server:** Exposes tools for introspection (`get_architecture_map`, `inspect_symbols`) to future agents.
    *   **GEMINI.md Manifest:** A long-term memory anchor for global project mandates.
    *   **Traceability Inlays:** Automated injection of requirement IDs into source code metadata.
*   **Detailed Requirements:**
    *   Must generate a self-documenting API portal (e.g., Swagger/OpenAPI) by default.
    *   Must produce "AI-optimized" READMEs in every major directory.
*   **Edge Cases & Risks:**
    *   **Metadata Staleness:** When manual edits by future developers invalidate the traceability tags.
    *   **MCP Protocol Drift:** Ensuring the generated server remains compatible with future versions of `devs`.

### 1.9 Cross-Domain Interoperability Requirements
*   **Data Consistency:** All domains MUST share a single `state.db` (SQLite) source of truth.
*   **Latency Budget:** Turn transitions between domains (e.g., Research -> Architecture) MUST be < 30 seconds for the user.
*   **Security Blanket:** All tool-calls across all domains MUST pass through the Secret Scrubber middleware.

---

## 2. Detailed User Journeys

### 2.1 The "Greenfield Genesis" Journey (The Maker - Alex)
*Goal: Transform a high-level intent into a dependency-aware, verified architectural roadmap.*

1.  **Project Initialization & Intent Capture:** 
    - Alex executes `devs init "A local-first encrypted notes app with p2p sync"`. 
    - The `Orchestrator` initializes the `state.db` Ledger and creates a root `PROJECT` entry.
    - **Technical Deep-Dive:** The system generates a `project_manifest.json` containing the raw prompt, user-selected tech stack preferences, and initial `GEMINI.md` global constraints.
2.  **Interactive Clarification & Boundary Definition:**
    - The `Clarification Agent` (Gemini 3.1 Flash) identifies ambiguities: "Which encryption standard (AES-GCM vs. ChaCha20)?", "Sync via WebRTC or Automerge?". 
    - Alex interacts through the VSCode Intervention Portal. 
    - **State Transition:** These clarifications are stored as `DIRECTIVE` turns, effectively biasing all downstream research.
3.  **Autonomous Research Swarm (The "Scout" Phase):**
    - The `Orchestrator` triggers three parallel LangGraph nodes: `market_research`, `competitive_analysis`, and `tech_landscape`.
    - **Market Agent:** Uses Tavily to pull TAM/SAM/SOM.
    - **Tech Agent:** Evaluates `Yjs` vs. `Automerge`, generating a `research/landscape/` audit. 
    - **Safety Check:** Every `web_search` call passes through the `SecretScrubber` to prevent accidental credential leakage in search queries.
4.  **Synthesis, Human Gate & Grounding:** 
    - The `Synthesis Agent` merges findings into `research/summary.md`. 
    - Alex reviews the "Discovery Dashboard" and clicks **[APPROVE RESEARCH]**. 
    - **Grounding Logic:** The approved summary becomes the "Contextual Anchor" for the Architect persona.
5.  **Authoritative Spec Generation (The "Architect" Phase):**
    - The `Architect Agent` (Gemini 3.1 Pro) generates `specs/1_prd.md` and `specs/2_tas.md` in parallel nodes.
    - The `Security Agent` performs a STRIDE threat model, resulting in `specs/3_security.md`.
    - **Mermaid Generation:** The agent invokes the `generate_mermaid` tool to create ERDs and sequence diagrams, ensuring 100% visual documentation.
6.  **Consistency Linter & Verification Gate:** 
    - A specialized `Linter Agent` audits the documents against the PRD goals. 
    - **Failure Case:** If "P2P Sync" (PRD) lacks a schema in the TAS, the system flags the turn as `FAILED_VERIFICATION` and triggers a "Refactor" turn for the Architect.
7.  **Requirement Distillation & Object Mapping (ROM):** 
    - The `Planner Agent` parses approved `specs/` into `requirements/distilled.json`.
    - **Data Model:** Each requirement includes `REQ-ID`, `Source_Doc_Ref`, `Priority`, and `Validation_Criteria` (e.g., "Must pass AES-GCM 256-bit vector tests").
8.  **Topological Task Ordering & Roadmap Generation:** 
    - The system identifies ~150 atomic tasks and performs a **Topological Sort** based on structural dependencies.
    - **Circular Dependency Detection:** If the TAS defines circular logic (e.g., A depends on B, B depends on A), the Planner halts and requests an "Architectural Tie-breaker" from the user.
9.  **Roadmap Sign-off:** Alex approves the final `planning/roadmap.md` and `tasks.json`. The project is now implementation-ready.

**Edge Cases & Risks:**
- **[RISK-GEN-001] Research Hallucination:** Agent cites a non-existent library. *Mitigation: The Tech Agent must verify library existence via npm/github lookup tools.*
- **[RISK-GEN-002] Vague Specs:** The PRD is too high-level for task breakdown. *Mitigation: The Planner Agent calculates a "Complexity-to-Detail" ratio and triggers a clarification loop if the ratio is too high.*

### 2.2 The "Verified Implementation" Journey (The AI Developer Agent)
*Goal: Implement a single requirement through a strictly gated, sandboxed TDD cycle.*

1.  **Task Assignment & Context Hydration:** 
    - The `Orchestrator` assigns `TASK-UUID-789` ("Implement AES-GCM encryption service") to the `Implementer Agent`.
    - **Context Strategy:** The system loads `GEMINI.md` (LTM), `specs/2_tas.md` (MTM), and current task history (STM). It uses **Gemini Context Caching** for the 1MB specs to ensure sub-10s turn latency.
2.  **Red Phase (Test Generation & Failure Validation):**
    - The agent uses `write_file` to create `tests/encryption.test.ts`.
    - It executes `run_shell_command("npm test")` via the **MCP Sandbox**.
    - **Mandatory Gate:** The test MUST fail with a specific, expected error (e.g., `ReferenceError` or `AssertionError`). If the test passes, the `Validation Agent` rejects the turn, suspecting a "Tautological Test."
3.  **Green Phase (Implementation & Verification):**
    - The agent modifies/creates `src/services/encryption.ts`.
    - It re-runs the specific test. 
    - **Verification Logic:** The `Validation Agent` parses the JSON test results. If `success: true`, the loop proceeds.
4.  **Regression Sweep & Structural Integrity:** 
    - The agent is forced to run the *entire* project test suite. 
    - **Safety Guard:** If any existing test fails, the agent enters a "Regression Repair" sub-loop.
5.  **Reviewer Agent Audit (The "Lead Architect" Review):** 
    - A secondary `Reviewer Agent` (Gemini 3.1 Pro) audits the diff. 
    - **Checklist:** 1) TAS Compliance, 2) Type Safety, 3) JSDoc `@satisfies REQ-042` tags, 4) No external side-effects.
    - **Rejection Example:** "Reject: Implementation uses `var`. Project mandate (GEMINI.md) requires `const/let` and Functional patterns."
6.  **Finalization & Triple-Anchor Checkpoint:** 
    - Upon approval, the system executes `snapshot_state()`.
    - **Ledger Update:** SQLite record created mapping `TASK-UUID-789` -> `git_hash_abc`. 
    - **Requirement Status:** `REQ-042` is updated to "Verified" in the Traceability Matrix.

**Edge Cases & Risks:**
- **[RISK-IMP-001] The "Death Loop":** Agent fix causes a regression, and the regression fix breaks the original task. *Mitigation: Heuristic Oscillation detection triggers a "Persona Swap" to a Debugger persona after 3 cycles.*
- **[RISK-IMP-002] Sandbox Timeout:** A complex test suite exceeds the 60s Docker timeout. *Mitigation: Orchestrator increments resources or splits the suite based on metadata.*

### 2.3 The "Surgical Intervention" Journey (The Architect - Sarah)
*Goal: Navigate history and steer the agentic swarm through Time-Travel and Branching.*

1.  **Observation & Anomaly Detection:** Sarah monitors the "Thought Stream" in the VSCode Extension. She notices the agent thinking: "I will use a local JSON file for the database," violating the TAS mandate for SQLite. 
2.  **Autonomy Suspension:** Sarah clicks **[PAUSE AGENT]**. The system finishes the current tool-call and halts.
3.  **Timeline Navigation & Historical Inspection:** 
    - Sarah uses the **Timeline Navigator** (D3 Graph) to find Turn ID `101`. 
    - She clicks a node to see the exact state of the project at that moment (Filesystem, Agent Memory, Token usage).
4.  **Triple-Anchor Restoration:** 
    - Sarah clicks **[RESTORE CHECKPOINT]**. 
    - **Technical Execution:** 1) `git reset --hard git_hash_101`, 2) SQLite Ledger state rollback, 3) LLM context cache re-hydration.
5.  **Branching & Directive Injection:** 
    - Sarah clicks **[CREATE BRANCH]** `fix-db-architecture`. 
    - She injects a **User Directive**: "Strictly use the SQLite schema defined in TAS Section 3.2. Re-generate the database service now."
6.  **Autonomous Resumption & Reconciliation:** 
    - The agent resumes on the new branch, acknowledging the new constraint.
    - **Manual Intervention:** Sarah decides to manually edit `schema.ts`. 
    - **Reconciliation Pulse:** On resume, the system detects a "Ghost Edit" (Git diff vs. Ledger). It triggers a `Reconciliation_Agent` to analyze the change and update the AI's STM before implementation continues.

**Edge Cases & Risks:**
- **[RISK-INT-001] State Divergence:** User edits a file and deletes the `.gemini/` directory. *Mitigation: System performs a "Sanity Check" on startup; if the Ledger is missing, it offers to rebuild it from Git history and snapshots.*
- **[RISK-INT-002] Context Fragmentation:** Sarah branches from a turn that has been summarized/pruned. *Mitigation: The system uses the "MTM Lessons Learned" blob to restore high-level awareness.*

### 2.4 The "Agentic Maintenance" Journey (The Consultant - Jordan)
*Goal: Leverage the project's native AI interfaces to evolve a finished codebase.*

1.  **Project Ingestion & Situational Awareness:** 
    - Jordan inherits a `devs` project and runs `devs start`. 
    - The system reads `GEMINI.md` to establish global architectural boundaries.
2.  **Structural Introspection (MCP Protocol):** 
    - Jordan requests an "Architecture Map." 
    - The VSCode Extension connects to the project's **Internal MCP Server** and calls `get_architecture_map()`. 
    - Jordan sees a high-fidelity dependency graph of the Node.js services and SQLite tables.
3.  **Feature Extension & Traceability Audit:** 
    - Jordan requests a "Cloud Sync" feature. 
    - The agent uses `inspect_symbols` to find the `SyncEngine` class. 
    - **Traceability Check:** The agent reads `traceability.json` and flags that this change will impact `REQ-001` (Local-First).
4.  **Verified Evolution (The TDD Cycle):** 
    - The agent implements the feature using the Journey 2.2 TDD Loop. 
    - It ensures that the "Local-First" requirement remains uncompromised by running the original Journey 2.1 test suites.
5.  **Self-Healing Documentation:** 
    - After implementation, the agent invokes the `update_docs` tool. 
    - It updates `specs/4_user_features.md` and regenerates the OpenAPI schema in `mcp-server/`.
6.  **Handoff Persistence:** Jordan reviews the changes. The new requirements are distilled and added to the ROM, maintaining 100% lineage for the next developer.

**Edge Cases & Risks:**
- **[RISK-MAIN-001] Metadata Staleness:** Jordan manually deletes `@satisfies` tags. *Mitigation: The internal MCP server's `run_health_check` identifies the missing lineage and prompts the agent to "Re-Anchor" the code.*
- **[RISK-MAIN-002] Protocol Version Drift:** The project's MCP server is outdated. *Mitigation: The CLI includes a `devs update-mcp` command to migrate the project's introspection server to the latest spec.*

---

## 3. Detailed Feature Specifications

### 3.1 Research & Discovery Features
- **[FEAT-101] Parallel Research Orbs**
  - **Requirement:** Invocation of specialized agents for Market, Competitive, and Tech research. Each "Orb" uses search-engines (Tavily/Exa) and summarizes findings with source citations.
  - **Technical Detail:** Research agents must operate as independent LangGraph nodes with specific system prompts. Results must be persisted in `research/` as Markdown with Mermaid diagrams.
  - **Edge Case:** Rate limiting on search APIs or "Dead-end" searches. *Mitigation:* Implement a retry queue with exponential backoff and a "Broaden Search" fallback strategy.
  - **Data Model:** `ResearchReport { id, type, sources: { url, snippet, confidence }[], findings: string[], summary_json, generated_at }`.

- **[FEAT-102] Feature Parity Matrix**
  - **Requirement:** Automated generation of a comparison table between the user's idea and existing competitors.
  - **Technical Detail:** Uses LLM to extract features from competitor reports and map them against the PRD. Must be rendered as a Markdown table in `research/competitive/`.
  - **Validation:** Must include at least 3 direct competitors if available and identify at least 2 "Unique Value Propositions" (UVPs).

- **[FEAT-103] Stack Recommendation Engine**
  - **Requirement:** Evaluates candidate frameworks based on "Agentic Friendliness" (strong typing, documented patterns, minimal magic).
  - **Technical Detail:** Tech researcher queries npm/GitHub/Docs to find libraries. Scores them based on TypeScript support, active maintenance, and boilerplate complexity.
  - **Decision Matrix:** Weightings: Type Safety (40%), Documentation Quality (30%), Ecosystem Stability (20%), Performance (10%).
  - **Output:** A `tech_stack_audit.md` comparing at least 2 alternative stacks with an "AI Choice" justification.

- **[FEAT-104] Clarification Dialog**
  - **Requirement:** A pre-research step where the AI identifies "Decision Fork-in-the-Roads" and asks the user for a preference to prevent wasted research.
  - **Technical Detail:** Uses a fast model (Gemini 3.1 Flash) to analyze the initial prompt and journeys. Generates a list of clarifying questions with "AI Recommendations" for each.
  - **Human Gate:** Mandatory pause before the research swarm begins. Approval is recorded as a `DIRECTIVE` in the Ledger.

### 3.2 Architectural Design Features
- **[FEAT-201] spec-to-Mermaid Generator**
  - **Requirement:** Converts architectural decisions into interactive Mermaid.js diagrams (Sequence, ERD, Class, State).
  - **Technical Detail:** Architect agent uses a specialized `generate_diagram` tool that validates Mermaid syntax before writing to Markdown.
  - **Diagram Types:** Every project MUST include at least one ERD for data models and one Sequence Diagram for the primary user journey in `specs/`.

- **[FEAT-202] Cross-Document Consistency Linter**
  - **Requirement:** An agent that audits the TAS against the PRD, flagging missing requirements or contradictory tech choices.
  - **Technical Detail:** Multi-document context analysis. If PRD specifies a goal (e.g., "Offline First") and TAS uses a cloud-only dependency, the linter must fail the turn and propose a fix.
  - **Output:** A `lint_report.json` mapping spec sections to PRD goals with a "Consistency Score."

- **[FEAT-203] Security Threat Modeler**
  - **Requirement:** Automated STRIDE analysis of the TAS, generating a `3_security.md` document with mitigation strategies.
  - **Technical Detail:** Security persona analyzes the TAS data flow and API endpoints. Generates a table of threats, impact (Low/Med/High), and specific mitigation requirements.
  - **Traceability:** Mitigation steps must be mapped to specific security requirements (e.g., `REQ-SEC-###`).

- **[FEAT-204] UI/UX Journey Mapper**
  - **Requirement:** Translates user stories into wireframe descriptions and navigation flowcharts.
  - **Technical Detail:** Generates a `4_ui_ux.md` file using Mermaid `stateDiagram-v2` for navigation and `componentDiagram` for layout hierarchies.
  - **Artifacts:** Must describe specific components, state transitions, and interactive behaviors for every user journey provided.

### 3.3 Requirement & Planning Features
- **[FEAT-301] Requirement Distillation (ROM)**
  - **Requirement:** Extracts atomic requirements from Markdown specs into a machine-readable JSON object model (`requirements/distilled.json`).
  - **Data Model:** `Requirement { id (REQ-###), title, description, source_doc, source_line, priority (P0-P2), validation_criteria, status (Pending/Verified) }`.
  - **Traceability:** Uses LLM extraction to ensure every authoritative statement in the specs is mapped to at least one requirement.

- **[FEAT-302] Topological Task Scheduler**
  - **Requirement:** Orders ~200+ tasks based on structural dependencies, ensuring "DB Schema" always precedes "API Endpoint."
  - **Algorithm:** Uses a directed acyclic graph (DAG) of tasks. Tasks define `depends_on: UUID[]`.
  - **Edge Case:** Circular dependencies or "Impossible Roadmap." *Mitigation:* System identifies the cycle and prompts the user to resolve by breaking a dependency or editing the TAS.

- **[FEAT-303] Validation Criteria Mapping**
  - **Requirement:** Every requirement is assigned a "Success Script" or description used by the Validation Agent to gate task completion.
  - **Technical Detail:** Criteria must be specific enough for a Reviewer LLM to verify (e.g., "Endpoint /login returns 200 on valid credentials and 401 on invalid").
  - **Persistence:** Stored in the SQLite Ledger for real-time requirement coverage reporting.

- **[FEAT-304] Cascading Impact Analysis**
  - **Requirement:** When a requirement is edited, the system identifies all dependent tasks that need to be reverted or refactored.
  - **Technical Detail:** Traverses the task dependency graph backwards from the modified requirement's mapped tasks.
  - **Action:** Marks impacted tasks as `STALE` in the roadmap and alerts the user to "Re-verify" or "Re-implement."

### 3.4 Implementation & TDD Features
- **[FEAT-401] Red-Green-Refactor Engine**
  - **Requirement:** Mandates a failing test file before source code edits. Gated by a "Test Failure Validator."
  - **Technical Detail:** Implementer agent MUST first create a `*.test.ts`. The orchestrator runs this test in the sandbox. If it passes, implementation is blocked until the test is refactored to fail correctly.
  - **Verification:** Orchestrator parses test output (JUnit XML or JSON) to confirm the specific failure type matches the requirement intent.

- **[FEAT-402] Persona-Based Code Review**
  - **Requirement:** Uses a secondary, more powerful model (e.g., Gemini Pro) to audit the primary agent's implementation for TAS compliance.
  - **Audit Checklist:** 1) TAS patterns, 2) Type safety, 3) JSDoc `@satisfies REQ-###` tags, 4) No external side-effects (e.g., hardcoded paths or un-ignored secrets).
  - **Feedback Loop:** Rejection triggers a "Refactor" turn with specific review comments injected into the Implementer's context.

- **[FEAT-403] Sandbox Telemetry**
  - **Requirement:** Real-time streaming of container logs (stdout/stderr) and shell command history to the VSCode UI.
  - **Technical Detail:** Uses a WebSocket/SSE stream from the MCP Host. Telemetry includes CPU/Memory usage per shell command to detect runaway processes.
  - **Safety:** Automatically masks detected secrets (using `SecretScrubber`) in the stream before they reach the UI.

- **[FEAT-404] Regression Sweep**
  - **Requirement:** Automated execution of the *entire* project test suite after every task completion to ensure zero side-effects.
  - **Technical Detail:** Gated by the `snapshot_state()` tool. If regression tests fail, the snapshot is blocked, and the agent must fix the regression.
  - **Optimization:** For large projects, uses a "Change-Impact" heuristic to run a subset of relevant tests, with full sweeps mandatory before Epic completion.

### 3.5 Glass-Box Observability Features
- **[FEAT-501] Interactive State Graph**
  - **Requirement:** A D3.js-based DAG visualizer in a VSCode Webview showing turns, tools, and decisions.
  - **Capabilities:** Zoom/Pan, Search by Task ID, Filter by Failure nodes or Branch points.
  - **Data Inspection:** Clicking a node reveals the full LLM prompt, response (Chain-of-Thought), and a diff of filesystem changes made in that turn.

- **[FEAT-502] Thought Stream Sidebar**
  - **Requirement:** A rolling log of the agent's internal reasoning, categorized by intent.
  - **Technical Detail:** Agent responses MUST use structured tags (e.g., `<thought>...</thought>`) which the UI parses into "Observation," "Reflection," and "Strategy" sections.
  - **Visuals:** Icons and color-coding to indicate "Reasoning," "Tool Use," and "System Feedback."

- **[FEAT-503] Tool Audit Log**
  - **Requirement:** A searchable record of every filesystem write, shell command, and web search, including exact arguments and results.
  - **Technical Detail:** Persistent storage in SQLite `actions` table. Each entry includes a SHA-256 hash of the filesystem before and after the action to detect "Ghost Edits."
  - **Security:** Redacts secrets in the log using the real-time `SecretScrubber`.

### 3.6 Time-Travel & HITL Features
- **[FEAT-601] Checkpoint Restoration**
  - **Requirement:** Roll back the entire project (Filesystem + SQLite State + LLM Context) to any historical Turn ID.
  - **Technical Detail:** Orchestrates `git checkout <hash>`, `sqlite3 state.db` restoration (for the branch), and LLM context cache re-hydration.
  - **Validation:** Project-wide health check (linters/tests) must run immediately after restoration to confirm state integrity.

- **[FEAT-602] Directive Injection API**
  - **Requirement:** A "Pause & Chat" interface where users can inject new constraints or provide feedback on a failed attempt.
  - **Technical Detail:** User input is injected as a `DIRECTIVE` turn into the LangGraph state. This turn is prioritized at the top of the next implementation prompt.
  - **HITL Gate:** Mandatory approval gate at the end of every Epic, allowing the user to review all changes before proceeding to the next phase.

- **[FEAT-603] Branching & Forking**
  - **Requirement:** Create parallel development timelines to test different architectural approaches. Supports "Branch Diffing" to compare implementations.
  - **Technical Detail:** Creates a new `branches` record in SQLite and a new Git branch. Turn lineage is tracked via `parent_turn_id`.
  - **UI:** A visual "Tree" view in VSCode showing branch points, parentage, and merge status.

- **[FEAT-604] Manual Reconciliation Gate**
  - **Requirement:** If a user edits files manually while the agent is paused, the system triggers a "Reconciliation Turn" to re-index the project and update the AI's mental state.
  - **Technical Detail:** Uses `git diff` to identify changes. A `ReconciliationAgent` analyzes the diff and updates the `agent_memory` (STM).
  - **Validation:** Automated Linter check to ensure manual edits didn't violate the global mandates in `GEMINI.md`.

### 3.7 Agentic-Native Features
- **[FEAT-701] Internal MCP Server**
  - **Requirement:** A built-in project-level server providing tools for introspection and validation.
  - **Technical Detail:** Standardized JSON-RPC interface. Tools: `get_architecture_map`, `inspect_symbols`, `run_tests`, `read_docs`, `get_api_spec`.
  - **Discovery:** Agents find the server via `.gemini/mcp.json`.

- **[FEAT-702] GEMINI.md Manifest**
  - **Requirement:** A "Long-Term Memory" (LTM) anchor containing global project constraints, identity, and architectural mandates.
  - **Technical Detail:** Markdown file in `.gemini/`. Must be concise and authoritative. Injected into every agent prompt across all implementation phases.
  - **Sections:** Identity, Mandates (Styling, Testing, Patterns), Blacklist (Forbidden libs), Context Hints for maintenance.

- **[FEAT-703] Traceability Metadata**
  - **Requirement:** Automated injection of `@satisfies REQ-###` tags into JSDoc/TSDoc to link code back to the original requirement.
  - **Technical Detail:** Implementer agent uses AST-aware patching to insert comments above public functions and classes.
  - **Audit Tool:** A CLI command `devs coverage` that matches tags against `distilled.json` and reports "Gaps."

- **[FEAT-704] Self-Healing Documentation**
  - **Requirement:** Agents automatically update Markdown docs and API schemas whenever the codebase changes.
  - **Technical Detail:** Post-Epic hook that triggers the `Architect` agent to review the `src/` directory and update `specs/` and `docs/` to match implementation reality.
  - **Verification:** Generated documentation must pass a Markdown linter and Mermaid syntax check.

---

## 4. User Interface Requirements

The `devs` user interface is split between a rich, interactive VSCode Extension (for deep observability and steering) and a high-performance CLI Tool (for automation and power-user workflows). Both interfaces communicate with the same local `state.db` Ledger and LangGraph orchestration engine via a standardized JSON-RPC bridge.

### 4.1 VSCode Extension (Primary "Glass-Box" Head)

The VSCode extension serves as the primary visual interface for the "Glass-Box" architecture, providing real-time visibility into the agent's reasoning and the ability to steer the development process with surgical precision.

#### 4.1.1 Glass-Box View (Main Webview)
- **State Graph Visualizer:**
    - **Technology:** D3.js or Canvas-based rendering for high performance with thousands of nodes.
    - **Interactivity:**
        - **Zoom/Pan:** Fluid navigation of the project's evolution timeline.
        - **Node Selection:** Clicking a turn node reveals detailed metadata in the sidebar (Thought, Tools, Diff).
        - **Lineage Highlighting:** Visualizing branches, forks, and parentage through color-coded edges.
        - **Status Indicators:** Nodes are color-coded by status (Success: Green, Failed: Red, Pending: Blue, Reconciled: Orange).
- **Timeline Navigator (Scrubbing):**
    - **Time-Travel Slider:** A horizontal slider that allows users to "scrub" through the project's history, updating the file explorer and editor to match the state at that specific turn.
    - **Checkpoint Markers:** Visual indicators for major milestones, Epic completions, and user-initiated snapshots.

#### 4.1.2 Agent Monitor & Thought Stream (Sidebar)
- **Real-Time Thought Feed:**
    - **Structured Parsing:** The sidebar parses agent responses into "Observation," "Reflection," and "Strategy" blocks with distinct icons and semantic color-coding.
    - **Streaming:** Thoughts are streamed word-by-word (SSE) to reduce perceived latency and provide immediate feedback.
- **Tool Audit Log:**
    - **Invocation Tracking:** Real-time display of tool calls (e.g., `write_file`, `npm test`) with their exact arguments and execution status.
    - **Jump-to-File:** Clicking a `write_file` or `patch_file` action opens the modified file in the editor with a diff view.
- **Status Dashboard:**
    - **Active Persona:** Displays the current agent's icon and role (Researcher, Architect, Implementer).
    - **Resource Usage:** Real-time CPU/Memory telemetry from the sandbox container, including network activity logs.

#### 4.1.3 Roadmap & Traceability Monitor (Sidebar)
- **Epic/Task Tree:** A hierarchical view of the `roadmap.md` and `tasks.json`.
    - **Task States:** Pending, Running, Verified, Failed, Stale (impacted by requirement changes).
    - **Requirement Mapping:** Hovering over a task shows the linked `REQ-###` IDs and their specific "Validation Criteria."
- **Coverage Heatmap:** A visual indicator of requirement coverage across the project's modules, highlighting "Gaps" where requirements are defined but not yet implemented or tested.

#### 4.1.4 Intervention Portal & HITL Interface
- **Breakpoint Manager:**
    - **Mandatory Gates:** UI modals that block execution until the user clicks **[Approve]**, **[Reject]**, or **[Edit]** at major SDLC milestones.
    - **Proposal Diff:** For code-modifying actions, the portal shows a side-by-side diff of the proposed change, allowing the user to edit the proposal before execution.
- **Directive Input:**
    - **Chat Interface:** A text area for providing natural language feedback or new constraints mid-task.
    - **Surgical Overrides:** Ability to manually "Fix" a file and have the agent treat the fix as the new ground truth via a "Reconciliation Pulse."

#### 4.1.5 Cost & Performance Dashboard
- **Token Analytics:**
    - **Model Breakdown:** Detailed usage stats for Gemini 3.1 Pro vs. Flash.
    - **Project Estimate:** Predicted total cost and time-to-completion based on current velocity and remaining tasks.
- **Latency Monitoring:** Turn-by-turn latency tracking with breakdown of LLM inference vs. Sandbox tool execution time.

### 4.2 CLI Tool (Automation & Headless Head)

The CLI tool is built for speed, portability, and integration into professional developer environments (CI/CD, remote servers).

#### 4.2.1 Core Command Suite
- **`devs init [description]`:**
    - **Flags:** `--stack <name>`, `--git`, `--interactive`, `--template <id>`.
    - **Logic:** Initializes the `.gemini/` structure, sets up the Ledger, and triggers the Clarification Agent.
- **`devs dev`:**
    - **Flags:** `--epic <id>`, `--task <id>`, `--no-sandbox`, `--watch`, `--max-tokens <n>`.
    - **TUI:** Uses `Ink` or `Blessed` to provide a rich terminal dashboard with real-time thought streams, progress bars, and sandbox logs.
- **`devs branch <turn_id>`:**
    - **Flags:** `--name <branch_name>`, `--restore-fs`, `--force`.
    - **Logic:** Performs the triple-anchor restoration (Git/SQL/LLM) to a new development timeline.
- **`devs status`:**
    - **Flags:** `--json`, `--summary`, `--coverage`, `--diff`.
    - **Logic:** Machine-readable output of project health, requirement coverage, and task progress.
- **`devs audit`:**
    - **Logic:** Manually triggers the Cross-Doc Linter, Security Threat Modeler, and Requirement Traceability audit.

#### 4.2.2 Output & Formatting
- **Pretty-Print (TUI):** Color-coded logs, emoji indicators, and animated progress spinners for human use.
- **JSON Mode:** Strictly typed JSON output for integration with other tools (e.g., `jq`, `grep`, or custom scripts).
- **Log Streaming:** Ability to stream container logs (`stdout`/`stderr`) directly to the terminal with `--follow`.

#### 4.2.3 Environment Integration
- **Shell Completion:** Zsh/Bash/Fish tab-completion for epics, tasks, requirements, and turn IDs.
- **Git Integration:** Automated pre-commit hooks that run the `devs audit` before manual commits are permitted.
- **Secret Scrubbing:** Local scrubbing of all terminal output to prevent accidental secret leakage in CI/CD logs.

### 4.3 Shared UI Protocols & Design Standards

- **Theme Synchronization:** Both VSCode and CLI MUST respect the user's system color theme (Light/Dark/High Contrast) and editor-specific color tokens.
- **Notification System:** Standardized alerts for "Loop Detected," "Task Failed," "Budget Exhausted," and "Intervention Required."
- **Progress Reporting Protocol:** Uses a standardized JSON-RPC progress protocol (LSP-compatible) to report task percentage, epic velocity, and estimated TTM (Time To Milestone).

### 4.4 UI Edge Cases & Technical Risks

- **[RISK-UI-001] Graph Scalability:** Large projects with >10,000 turns will cause SVG-based graphs to lag or crash the Webview. *Mitigation:* Implement canvas-based rendering and hierarchical "Level of Detail" (LoD) zooming.
- **[RISK-UI-002] State Divergence (The "Ghost Edit"):** User editing files in the VSCode editor while the agent is running on the same branch. *Mitigation:* VSCode `FileSystemWatcher` triggers an immediate agent pause and forces a Reconciliation Turn.
- **[RISK-UI-003] Intermittent Connectivity:** Handling LLM timeouts or network drops gracefully in the UI without losing the active "Mental State" of the agent. *Mitigation:* Implement optimistic UI updates and robust retry indicators with exponential backoff.
- **[Q-UI-001]** Should we support a "Headless Web Dashboard" for remote project monitoring and multi-device intervention?
- **[Q-UI-002]** How do we handle VSCode's restrictive Webview sandbox when performing complex D3 animations or file-system-intensive visualizations?

---

## 5. Safety, Governance & Edge Cases

The `devs` system operates in a high-stakes "Agentic" environment where autonomous agents possess the capability to execute shell commands, modify files, and consume significant API resources. To ensure system integrity, user security, and cost-predictability, the system implements a multi-layered Safety and Governance framework.

### 5.1 The "Agent Playground" (Sandbox & Security)

Implementation agents are strictly confined to an isolated execution environment to prevent accidental or malicious host system compromise.

*   **[FEAT-511] Containerized Implementation Sandbox**
    - **Requirement:** All implementation turns (shell commands, test execution, builds) MUST run within a local Docker container or a restricted child process with `seccomp` profiles.
    - **Technical Detail:** 
        - **Image:** Default to `node:20-alpine` (or stack-specific equivalent).
        - **Volumes:** Only the `${projectRoot}` is mounted. No access to `~/.ssh`, `~/.aws`, or root system paths.
        - **Privileges:** Commands run as a non-root `node` user. `sudo` and kernel-level syscalls are disabled via Seccomp and AppArmor profiles.
        - **Persistence:** Container state (filesystem changes in whitelisted paths) persists across turns within a task, but the container is recycled between Epics to prevent state "pollution."
    - **Edge Case:** Docker not present on host. *Mitigation:* Fallback to `child_process.spawn` with strict `cwd` enforcement and a "Safety Warning" in the UI.

*   **[FEAT-512] Network Egress Control & Whitelisting**
    - **Requirement:** Deny all outbound network traffic by default during the implementation phase.
    - **Whitelisting:** Access is permitted EXCLUSIVELY to authorized package registries (e.g., `registry.npmjs.org`, `pypi.org`, `crates.io`) during dependency installation tasks.
    - **Technical Detail:** Managed via Docker network bridge policies or `iptables` rules. Any unauthorized network probe triggers an immediate `SAFE_SHUTDOWN` event in the Ledger.

*   **[FEAT-513] Filesystem Whitelisting & Symlink Protection**
    - **Requirement:** Agent write access is strictly confined to the project root. 
    - **Validation:** Every `write_file` or `patch_file` call is intercepted by the `PathValidator` middleware. 
    - **Symlink Guard:** Agents are forbidden from creating or following symlinks that resolve to paths outside the project root (e.g., attempting to symlink `/etc/passwd` to `src/config.txt`).

### 5.2 Cognitive Safety & Loop Protection

Autonomous agents can become "trapped" in recursive reasoning loops, wasting tokens and time. `devs` implements heuristic monitoring to detect and break these patterns.

*   **[FEAT-521] Heuristic Oscillation Monitor**
    - **Requirement:** Detect "Action Flip-Flops" where an agent repeatedly reverts its own changes.
    - **Logic:** The `LoopMonitor` analyzes the `actions` ledger. If a file `F` is modified in Turn $T_n$ and then `git checkout` (reverted) in Turn $T_{n+1}$ more than twice in a single task, the system triggers a **Breakpoint**.
    - **Action:** Autonomy is suspended. The user is presented with a "Loop Alert" and a diff of the oscillating changes.

*   **[FEAT-522] Stagnation & "Persona Swap" Breakout**
    - **Requirement:** Detect if an agent is failing a task with the same error repeatedly.
    - **Threshold:** 3 consecutive identical tool-call failures (e.g., a failing test with the same stack trace despite implementation attempts).
    - **Breakout Protocol:** 
        1. **Suspend** the current persona. 
        2. **Swap** to a `Debugger Persona` (Gemini 3.1 Pro) with a higher temperature (0.7) and a "Broaden Context" directive to identify non-obvious root causes.
        3. If the Debugger fails, escalate to a **Human Intervention**.

*   **[FEAT-523] Token Quotas & Budget Guardrails**
    - **Requirement:** Enforce hard and soft token limits per Task and Epic.
    - **Data Model:** `Budget { soft_limit: number, hard_limit: number, current_usage: number, model_breakdown: JSON }`.
    - **UI Feedback:** A real-time progress bar in the VSCode status bar showing "Budget Consumed." 
    - **Behavior:** Reaching the `soft_limit` (80%) triggers a notification. Reaching the `hard_limit` (100%) triggers a mandatory pause for "Budget Extension."

### 5.3 Data Governance & Privacy

`devs` follows a "Local-First" data philosophy to ensure user IP and sensitive data never leave the local environment unnecessarily.

*   **[FEAT-531] Real-time Secret Scrubbing Middleware**
    - **Requirement:** Mask all sensitive strings before they are logged to SQLite or sent to the LLM.
    - **Detection Engine:** 
        - **Regex:** Standard patterns for AWS, GitHub, Stripe, and Bearer tokens.
        - **Entropy:** Detect high-entropy strings (e.g., base64 encoded keys).
        - **Pre-flight Scan:** Before an implementation phase, the system scans for un-ignored `.env` files and warns the user.
    - **Redaction:** Replaces content with `[REDACTED_SECRET]`. Original values are never stored in the Ledger.

*   **[FEAT-532] Local-First State Persistence**
    - **Requirement:** 100% of the project's source code, documentation, and agent state MUST remain on the user's machine.
    - **Cloud Privacy:** No code is sent to `devs` servers. Communication with LLM providers (Google/Anthropic) is direct via the user's API keys.
    - **Telemetry Opt-out:** Users can opt-out of anonymous usage telemetry (Task Duration, Token Efficiency) via a global toggle in `GEMINI.md`.

### 5.4 Edge Case Management

*   **[EDGE-541] Large File Handling (Context Safety)**
    - **Requirement:** Prevent `read_file` from overflowing the 1M token context window.
    - **Behavior:** Files exceeding 500KB are truncated. The agent receives the first 100KB, the last 100KB, and a list of internal symbols (functions/classes) found in the middle.
    - **Tooling:** Agents can use `read_file_range(offset, limit)` to paginate through large files if deep inspection is needed.

*   **[EDGE-542] Concurrent "Ghost Edits" (Manual vs. AI)**
    - **Requirement:** Detect and reconcile manual user edits made while the agent is active or paused.
    - **Mechanism:** The `FileSystemWatcher` triggers a `RECONCILIATION` pulse if a file is modified externally.
    - **Resolution:** The agent is given a `git diff` of the manual changes and must acknowledge them in its "Mental Model" before proceeding.

*   **[EDGE-543] Binary & Heavy Asset Management**
    - **Requirement:** Agents MUST NOT attempt to read, write, or refactor binary files (images, PDFs, compiled blobs).
    - **Protection:** The `Safe-FS` tool blocks access to binary MIME types, returning only metadata (size, hash) to the agent.

*   **[EDGE-544] Flaky Test Detection**
    - **Requirement:** Identify non-deterministic test results to prevent the agent from "chasing ghosts."
    - **Heuristic:** If a test fails in the Green phase, the system automatically re-runs it 3 times. If results vary, the test is flagged as `FLAKY` in the Ledger, and the agent is instructed to "Stabilize" the test before implementing logic.

### 5.5 Safety & Governance Roadmap (Future Considerations)
- **[Q-SAFE-001]** Should we implement a "Multi-Model Consensus" gate for security-critical functions where three different LLMs must approve a code change?
- **[Q-SAFE-002]** How can we standardize "Agentic Permissions" across different OS environments (Windows vs. macOS vs. Linux) without relying exclusively on Docker?
- **[Q-SAFE-003]** Implementation of "Time-Limited Credentials"—temporary API keys that expire after a task is completed to minimize leakage risk.

---

## 6. Technical Unknowns & Design Questions

The implementation of `devs` introduces several high-stakes technical challenges and architectural unknowns that require rigorous investigation and prototyping. These are categorized into Performance, State Integrity, AI Reasoning, and Security.

### 6.1 Performance & Scalability Unknowns
- **[Q-611] State Graph UI Scaling:** Can the VSCode Webview handle a D3/Canvas-based State Graph with >10,000 nodes (turns and actions) without significant latency? 
    - *Investigation:* Prototype hierarchical node clustering and "Level of Detail" (LoD) rendering where distant history is collapsed into summary nodes.
- **[Q-612] Ledger Query Performance:** As the SQLite `turns` table grows, will complex recursive queries for turn-lineage and "Time-Travel" state reconstruction remain sub-second?
    - *Investigation:* Evaluate the need for a dedicated Graph Database (e.g., Neo4j) or specialized recursive Common Table Expressions (CTEs) and indexing strategies for the parent-child relationship.
- **[Q-613] Context Window Fragmentation:** In extremely long-running projects, how do we prevent "Instruction Drift" when the 1M token window is filled with thousands of turns of tool-outputs?
    - *Investigation:* Benchmark different RAG strategies vs. recursive summarization (MTM) for maintaining architectural intent over 6+ months of development.

### 6.2 State Integrity & "Time-Travel" Edge Cases
- **[Q-621] Non-Deterministic Divergence:** If a user "Time-Travels" to Turn $T_{101}$ and resumes with the exact same prompt, but the LLM (Gemini 3.1 Pro) provides a different response due to non-determinism, how does the UI represent this "Ghost Timeline"?
    - *Design Question:* Should we enforce `temperature: 0` for all non-creative tasks, or allow the UI to branch automatically upon divergence detection?
- **[Q-622] Manual VCS Desync:** How do we prevent a user from corrupting the `state.db` by performing a manual `git rebase` or `git filter-branch` that alters the commit hashes linked to Ledger checkpoints?
    - *Design Question:* Should `devs` implement a custom Git hook that blocks destructive VCS operations on the `devs-main` branch?
- **[Q-623] Partial Tool-Call Rollback:** If a multi-file tool call (e.g., a complex `patch_file`) fails halfway through execution, how do we ensure the filesystem is rolled back to a "Clean State" without a full Git reset?
    - *Investigation:* Implementation of a "Virtual Filesystem" (VFS) layer or a transactional "Dry-Run" phase for all multi-file operations.

### 6.3 AI Reasoning & TDD Rigor
- **[Q-631] The "Tautological Test" Detection:** How can the `Validation Agent` reliably distinguish between a meaningful test and a "Green-Washing" test (e.g., `expect(true).toBe(true)`) without executing expensive coverage audits every turn?
    - *Design Question:* Should we implement a "Mutation Testing" orb that temporarily injects bugs into the implementation to see if the agent's tests fail?
- **[Q-632] Cross-Language MCP Parity:** How do we ensure that the internal `mcp-server/` generated for a Rust or Go project provides the same level of architectural situational awareness as the Node.js implementation?
    - *Investigation:* Develop a "Standard MCP Interface" test suite that every generated project must pass to be considered "Agentic-Native."
- **[Q-633] Intent Loss during Summarization:** When "collapsing" short-term memory (STM) into medium-term memory (MTM), what is the "Signal-to-Noise" threshold for implementation details (e.g., specific race-condition fixes) that MUST be preserved vs. noisy log data?

### 6.4 Security & Governance Risks
- **[Q-641] Sandbox Hardware Parity:** How do we handle implementation tasks that require specific hardware acceleration (e.g., GPUs for ML projects) or low-level kernel access within the Docker sandbox?
    - *Risk:* Reduced developer experience if the sandbox cannot run the project's native environment.
- **[Q-642] Third-Party MCP Poisoning:** If a user plugs in a third-party MCP server (e.g., a "Cloud Provisioner"), how do we prevent that server from leaking the project's entire source code to an external API?
    - *Design Question:* Should `devs` implement an "MCP Permissions" manifest (similar to Android permissions) for all connected servers?
- **[Q-643] Budget Escalation Attack:** Could a malicious prompt (Prompt Injection) cause an agent to enter an infinite loop of high-token-cost research tasks to intentionally exhaust the user's API credits?
    - *Mitigation:* Hard-coded rate limits on "High-Cost Tools" and mandatory human approval for tasks exceeding a $5.00 token estimate.

### 6.5 User Experience (UX) & Intervention
- **[Q-651] HITL Gate Fatigue:** At what point do mandatory approval gates stop being a safety feature and start being a productivity blocker?
    - *Proposed:* Implement "Confidence-Based Autonomy" where the user can set a threshold (e.g., 0.95) for the Validation Agent to auto-approve minor implementation turns.
- **[Q-652] Multi-Agent Collaboration Conflicts:** If we move to a parallel multi-agent model (e.g., Research and Architecture running concurrently), how do we prevent "Race Conditions" in the SQLite Ledger or the Filesystem?
    - *Investigation:* Use of optimistic concurrency control or a centralized "Resource Locking" service within the Orchestrator.

---
