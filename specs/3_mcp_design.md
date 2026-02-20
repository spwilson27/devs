# MCP and AI Development Design: devs

## 1. AI Development Philosophy & Glass-Box Architecture

The `devs` project is built on the principle of **"Glass-Box" Agentic Engineering**. Unlike traditional AI assistants that operate as opaque black boxes, `devs` treats the AI's internal reasoning, state transitions, and tool interactions as first-class, immutable citizens of the development environment. This philosophy ensures that the system is not only autonomous but also authoritative, auditable, and steerable.

### 1.1 The Transparency Mandate (Glass-Box vs. Black-Box)
**[MCP-001] Explicit Reasoning Trace:** Agents MUST expose their internal "Chain-of-Thought" (CoT) for every decision node. This includes the initial hypothesis, the selection of tools, the interpretation of tool outputs, and the final conclusion. These "thoughts" are not merely logs but are persisted in the SQLite Ledger as structured metadata linked to each Turn.
- **Implementation Detail:** The `thought` field in the `turns` table MUST use a structured format (e.g., Markdown or JSON) that separates "Observation," "Reflection," and "Strategy."
- **Edge Case:** If an agent's reasoning exceeds a certain token limit, it MUST be programmatically summarized for the UI while the full trace is preserved in the Ledger for auditing.

**[MCP-002] Tool-Call Atomicity:** Every interaction with the external environment (filesystem, shell, network) MUST be captured as a discrete "Action" record. This record MUST include the exact arguments, the raw stdout/stderr/exit_code, and a cryptographic hash (SHA-256) of any modified files to detect external tampering.
- **Audit Requirement:** The system MUST support a "Verify Action" tool that can re-calculate hashes of the filesystem and compare them against the Action record to ensure no unrecorded side effects occurred.

**[MCP-003] Observability over Inference:** The system rejects the concept of "inferring" agent state. The UI MUST provide a real-time, high-fidelity visualization of the agent's internal memory state (STM/MTM/LTM) and the current execution context, allowing the user to see exactly what the agent sees.
- **Visual Mapping:** The state graph MUST visually distinguish between "Planned Actions," "Executed Actions," and "Failed Attempts," allowing users to see the agent's struggle and recovery paths.

### 1.2 Time-Travel Reproducibility & Branching
**[MCP-004] Triple-Anchor State Management:** To ensure 100% reproducibility of any point in the project's history, the system synchronizes three distinct state layers:
1.  **Filesystem State (Git):** Every successful task or phase transition triggers a Git commit. The `git_hash` serves as the anchor for the physical source code.
2.  **Metadata & Intent State (SQLite):** The Ledger stores the Turn ID, persona context, and requirement traceability. This anchors "why" and "how" the code was written.
3.  **Mental State (Gemini Context Cache):** The exact LLM context (including system prompts, previous turns, and injected documents) is snapshotted or summarized. This anchors the agent's "understanding" at that moment.

**[MCP-005] Branching and Parallel Timelines:**
- **Non-Linear Development:** Users MUST be able to "fork" a project from any Turn ID in the Ledger. This creates a new timeline in the State Graph, allowing for experimentation without corrupting the `main` development path.
- **State Hydration Logic:** Resuming from a historical checkpoint involves a coordinated `git checkout`, a SQLite state restoration (re-populating the active context from historical turns), and the re-hydration of the LLM context.
- **Checkpoint Resilience:** If the Gemini Context Cache has expired, the orchestrator MUST reconstruct the context via weighted summarization of previous turns, prioritizing "Directives" and "Architectural Decisions" over routine tool outputs.

### 1.3 Steerability & Human-in-the-Loop (HITL)
**[MCP-006] The Intervention API:** The system MUST support a "Pause-Inject-Resume" workflow. At any point, a human user can:
- **Inject Directives:** Add new constraints or requirements mid-task (e.g., "Actually, use a NoSQL database"). These are stored as `RECONCILIATION` turns.
- **Modify Proposals:** Edit the content of a `write_file` or `shell_command` before it is executed. The agent must acknowledge this modification as a "User Override."
- **Manual Reconciliation:** Fix a failing implementation manually. The system MUST then perform a "Reconciliation Turn" where the agent re-indexes the changes (using `git diff`) to align its internal memory with the new filesystem reality.

**[MCP-007] Decision Gates:** Mandatory suspension of autonomy occurs at high-stakes transition points:
- After Research Phase (Approve Reports).
- After Architecture Phase (Approve PRD/TAS/Roadmap).
- After Planning Phase (Approve Epic/Task breakdown).
- Before merging a high-priority Epic.
- **User Preference:** Users MUST be able to configure "Confidence Thresholds" where the agent can bypass gates if the Validation Agent's confidence score is above a certain level (e.g., >0.95).

### 1.4 Technical Requirements for State Integrity
- **[MCP-008] State Divergence Detection:** The orchestrator MUST perform a "Consistency Pulse" before every turn, comparing the current `git_hash` and project directory checksum against the last Ledger entry. If divergence is detected, the system MUST force a reconciliation turn to prevent the agent from operating on a "Ghost State."
- **[MCP-009] Transactional Integrity:** Operations involving Git commits and SQLite turn insertions MUST be atomic. A failure to commit to Git MUST rollback the SQLite entry to maintain strict synchronization.
- **[MCP-010] Loop Detection & Stagnation Heuristics:**
    - **Oscillation Detection:** Detect if the agent reverts a file change it just made within 3 turns.
    - **Stagnation Guard:** Detect if the same tool call with identical arguments fails 3 times consecutively.
    - **Escalation Path:** Upon loop detection, the system MUST: 1) Pause autonomy, 2) Snapshot the state, 3) Perform a "Persona Swap" to a `DEBUGGER` agent with a higher temperature and broader context access to diagnose the loop.

### 1.5 Cognitive Safety and Resource Governance
**[MCP-011] Token Quotas and Budgeting:** Users can set hard and soft token limits per Task or Epic. If a limit is reached, the agent MUST suspend itself and request a "Budget Extension" from the user.
**[MCP-012] Sensitive Data Scrubbing:** A real-time middleware MUST intercept all LLM prompts and responses to redact PII, API keys, and hardcoded secrets using both regex patterns and entropy-based detection. Redacted content is replaced with `[REDACTED_SECRET]` in the Ledger.
**[MCP-013] Sandbox Exit Policy:** Agents are forbidden from making outbound network calls during the implementation phase, except to whitelisted package registries. Any attempt to access unauthorized domains MUST trigger an immediate safety shutdown.

---

## 2. Required MCP Servers & Tools

The `devs` ecosystem relies on a dual-server MCP architecture: the **Orchestrator Host** (which provides system-level capabilities to the agents) and the **Generated Project Server** (which provides codebase-specific introspection).

### 2.1 The Orchestrator MCP Host (System Tools)
The orchestrator acts as the primary MCP host, exposing a restricted but powerful set of tools to all agent personas. All tools MUST implement strict input validation using JSON Schema.

#### 2.1.1 Filesystem Operations (The "Safe-FS" Protocol)
**[MCP-SYS-001] Path-Restricted I/O:** All filesystem operations are strictly confined to the project root. Any attempt to use `..` to escape the root MUST be rejected.
- `read_file(path: string, encoding?: 'utf8' | 'base64')`: Returns file content. Large files (>1MB) MUST be truncated with a "Read More" pointer to prevent context overflow.
- `write_file(path: string, content: string)`: Writes or overwrites a file. Triggers a "Filesystem Change" event in the Ledger.
- `patch_file(path: string, old_string: string, new_string: string, expected_replacements?: number)`: Performs exact-match string replacement. This is the PREFERRED method for modifications to avoid overwriting concurrent changes.
- `list_directory(path: string, recursive?: boolean, ignore?: string[])`: Returns a tree structure. MUST respect `.gitignore` and `.geminiignore`.
- `glob_search(pattern: string)`: High-performance file discovery (e.g., `src/**/*.ts`).
- `get_file_metadata(path: string)`: Returns size, last modified, and SHA-256 hash.

#### 2.1.2 Version Control & State Anchoring (The "Git-Anchor" Suite)
**[MCP-SYS-002] Atomic State Control:** Coordinates the physical filesystem with the logical Ledger.
- `snapshot_state(message: string, epic_id?: string, task_id?: string)`: Performs a `git commit` and creates a corresponding `CHECKPOINT` in SQLite. Returns the `git_hash` and `snapshot_id`.
- `restore_checkpoint(snapshot_id: UUID)`: Performs a `git reset --hard` and restores the agent's memory state from the Ledger.
- `get_semantic_diff(base: string, head: string)`: Returns a diff that includes file changes plus a summary of the "Intent" pulled from the Ledger turns between those hashes.
- `verify_filesystem_integrity()`: Re-calculates hashes for all tracked files and compares them against the last `snapshot_state` record. Alerts if "Ghost Edits" (manual changes without a turn) are detected.

#### 2.1.3 Ledger & Traceability (The "RTM" Interface)
**[MCP-SYS-003] Traceability Management:**
- `sync_requirement(req: RequirementSchema)`: Distills and persists a requirement from a spec.
- `map_task_to_requirement(task_id: UUID, req_id: string)`: Establishes a link in the Traceability Matrix.
- `get_project_status()`: Returns a dashboard view of Requirements (Satisfied/Pending), Epics (Progress), and Tasks (Completed/Blocked).

#### 2.1.4 Research & Knowledge Bridge
**[MCP-SYS-004] AI-Optimized Discovery:**
- `web_search(query: string, search_depth: 'basic' | 'advanced')`: Leverages Tavily/Exa to find technical documentation or market data.
- `fetch_and_distill(url: string)`: Fetches a URL, strips boilerplate/nav, and returns a Markdown representation suitable for LLM consumption.

### 2.2 The Generated Project MCP Server (Agentic-Native)
Every project generated by `devs` MUST include a built-in MCP server (located in `mcp-server/`). This server allows the `devs` orchestrator (and future agents) to "talk" to the codebase.

#### 2.2.1 Structural Introspection
- `get_architecture_map()`: Returns a JSON dependency graph of modules, services, and data models.
- `inspect_symbols(file_path: string)`: Returns a list of exported functions, classes, and types (LSP-lite).
- `get_api_spec(endpoint?: string)`: Returns OpenAPI/Swagger schemas for the project's API.

#### 2.2.2 Runtime & Database Diagnostics
- `query_dev_database(sql: string)`: Read-only access to the local development database for verifying data persistence during TDD.
- `get_service_health()`: Checks status of internal components (e.g., "Is the Redis cache reachable?").
- `tail_logs(limit: number, level: string)`: Returns the last $N$ lines of application logs.

#### 2.2.3 Automated Quality & Validation Gates
- `run_validation_suite(scope: 'all' | 'unit' | 'integration' | 'e2e')`: Executes tests and returns a structured JSON report (Success/Failure, Coverage, Failure Diffs).
- `run_security_audit()`: Invokes internal security tools to check for CVEs in dependencies and hardcoded secrets in the implementation.
- `verify_requirement_compliance(req_id: string)`: Runs the specific validation script associated with a requirement.

### 2.3 Execution Sandbox & Security Middleware

#### 2.3.1 The "Agent Playground" (Docker Isolation)
**[MCP-SEC-001] Containerized Execution:** All implementation agents MUST execute shell commands inside a transient Docker container.
- **Image:** `node:20-alpine` (or stack-appropriate image).
- **Isolation:** No access to host networking (except for authorized registries). No access to host environment variables.
- **Volume Mapping:** Only the project root is mounted with restricted permissions.
- **Persistence:** Container state is wiped between Epics, but the project root persists.

#### 2.3.2 Secret Scrubbing & Privacy Guard
**[MCP-SEC-002] Real-time Redaction:** A middleware layer intercepts all MCP communication.
- **Regex Detection:** Scans for AWS keys, GitHub tokens, Bearer tokens, etc.
- **Entropy Thresholding:** Detects high-entropy strings that likely represent secrets.
- **Whitelist:** Allows known safe strings (e.g., project IDs, UUIDs).
- **Action:** Replaces secrets with `[REDACTED_SECRET]` in all logs and LLM prompts.

#### 2.3.3 Loop & Resource Guardrail
- **Execution Limits:** Hard 60s timeout for all shell commands. 1GB RAM / 1 CPU core cap.
- **Oscillation Detection:** Heuristic engine that monitors the Ledger for "Edit-Revert" cycles. If detected, it triggers a "Breakpoint" for human intervention.
- **Stagnation Guard:** Suspends the agent if it makes 3 identical failed attempts at a task (e.g., trying to install a non-existent package repeatedly).

---

## 3. Agentic Development Loops

The `devs` system orchestrates the SDLC through a series of nested, stateful loops. Each loop is designed to be self-correcting, observable, and strictly gated by both automated validation and human intervention.

### 3.1 The TDD Implementation Loop (The "Green-Light" Cycle)
**[MCP-LOOP-001] Mandatory Test-First Protocol:** Every atomic task assigned to an Implementation Agent MUST follow a rigorous TDD lifecycle. No code implementation is permitted without a preceding failing test.

1.  **Phase 0: Context Hydration & Pruning:**
    - The agent loads the **Global Constraints** (`GEMINI.md`), the **TAS**, and the specific **Requirement ID** (`REQ-XXX`).
    - The orchestrator prunes the LLM context to include only the relevant module's source code and existing tests to maximize reasoning precision.
2.  **Phase 1: Red (Test Generation):**
    - The agent creates or updates a test file (e.g., `tests/auth.test.ts`).
    - The agent executes `run_validation_suite(scope: 'unit', path: '...')` via the MCP Sandbox.
    - **Success Criteria:** The test MUST fail with an expected error (e.g., `ReferenceError` or `AssertionError`).
    - **Edge Case:** If the test passes immediately, the agent MUST flag it as a "Tautological Test" and refactor the test logic before proceeding.
3.  **Phase 2: Green (Implementation):**
    - The agent modifies source code to satisfy the failing test.
    - The agent executes the unit test again.
    - **Success Criteria:** The specific test MUST pass.
4.  **Phase 3: Verification (Regression Testing):**
    - The agent executes `run_validation_suite(scope: 'all')` to ensure no side effects were introduced in unrelated modules.
    - **Success Criteria:** 100% pass rate across the entire codebase.
5.  **Phase 4: Refactor & Review (Persona Swap):**
    - A secondary **Reviewer Agent** (distinct persona) audits the diff.
    - **Audit Criteria:** Adherence to TAS patterns, type safety, documentation (JSDoc/TSDoc), and security best practices.
    - If rejected, the Implementer enters a "Refactor Sub-loop" to address the feedback.
6.  **Phase 5: Checkpoint & Traceability:**
    - Upon success, the orchestrator triggers `snapshot_state()`.
    - The Ledger is updated, marking the `REQ-XXX` as "Verified" in the Traceability Matrix.

### 3.2 The Discovery & Architecture Loop (Phase 1 & 2)
**[MCP-LOOP-002] Multi-Agent Synthesis:** Before any code is written, the system must establish an authoritative architectural foundation through an iterative research loop.

1.  **Parallel Research (The "Scout" Phase):**
    - **Market, Competitive,** and **Tech Landscape** agents run in parallel, using the `web_search` MCP tool.
    - Each agent produces a structured report in the `research/` directory.
2.  **Synthesis & Conflict Resolution:**
    - A **Synthesis Agent** identifies contradictions (e.g., the Tech Agent suggests a library that the Security Agent flags as vulnerable).
    - Contradictions are resolved through a "Reasoning Debate" or escalated to the user.
3.  **Human Gate (Architectural Approval):**
    - Autonomy suspends. The user MUST approve the Research Summary before the Architect Agent is invoked.
4.  **Specification Generation:**
    - The **Architect Agent** generates the PRD and TAS, followed by the **Security Agent's** threat model.
    - A **Linter Agent** performs a "Cross-Doc Audit" to ensure the TAS satisfies 100% of the goals defined in the PRD.

### 3.3 The Planning & Requirement Distillation Loop (Phase 3)
**[MCP-LOOP-003] Atomic Task Ordering:** The transition from static documentation to an executable roadmap is managed via a topological sorting loop.

1.  **Requirement Distillation:**
    - The **Planner Agent** parses the specs into `distilled.json`. Each requirement is assigned a unique `REQ-###` ID and "Validation Criteria."
2.  **Epic & Task Mapping:**
    - The agent generates 8-16 high-level Epics.
    - Each Epic is broken down into ~25 atomic tasks. Each task MUST map to at least one `REQ-###`.
3.  **Topological Dependency Sort:**
    - The agent calculates dependencies between tasks (e.g., "Database Schema" must precede "User Login").
    - **Traceability Check:** A Linter Agent verifies that 100% of requirements in `distilled.json` are covered by at least one task.
4.  **Human Gate (Roadmap Sign-off):** The user reviews the `roadmap.md` and `tasks.json` before implementation begins.

### 3.4 State Reconciliation & Intervention Loop
**[MCP-LOOP-004] Glass-Box Steerability:** Handles manual user edits and "Time-Travel" operations to prevent state divergence.

1.  **The "Pulse" Check:** Before every turn, the orchestrator runs `verify_filesystem_integrity()`.
2.  **Divergence Detection:** If the `git_hash` has changed without a corresponding Ledger turn, the system triggers a **Reconciliation Breakpoint**.
3.  **Reconciliation Agent (RA) Analysis:**
    - The RA uses `get_semantic_diff()` to analyze the manual changes.
    - The RA updates the **Short-Term Memory** (STM) with the "Ground Truth" of the user's manual work.
    - If the manual edit violates a TAS constraint or PRD goal, the RA alerts the user.
4.  **Resumption & Branching:**
    - The agent acknowledges the manual changes in its next turn (e.g., "I see you have implemented the Repository Pattern manually; I will now proceed with the Service Layer...").
    - The user can choose to "Branch" from this reconciled node in the State Graph.

### 3.5 Loop Protection & Stagnation Workflows
**[MCP-LOOP-005] Heuristic Safeguards:** Prevents runaway token costs and recursive "trapping."

1.  **Oscillation Monitor:** If an agent reverts a file change it made within the last 3 turns, the orchestrator increments an "Oscillation Counter."
2.  **Stagnation Guard:** If `run_validation_suite` returns the same error 3 times consecutively despite implementation attempts, the agent is flagged as "Stuck."
3.  **The "Breakout" Protocol:**
    - Autonomy is suspended.
    - A **Debugger Persona** is swapped in with a broad context window (Gemini 3.1 Pro) and a "High Temperature" setting to propose non-obvious fixes.
    - If the Debugger fails, the system forces a **Human Intervention**.

---

## 4. Hierarchical Memory & Context Management

The `devs` system implements a sophisticated hierarchical memory architecture to manage the high cognitive load of autonomous engineering while staying within the token limits and performance constraints of the Gemini 3.1 Pro/Flash models. This architecture ensures that agents have "infinite" project-wide awareness without being overwhelmed by noisy, low-signal data.

### 4.1 The Tiered Memory Model (STM / MTM / LTM)
**[MCP-MEM-001] Memory Segmentation:** The system divides agent context into three distinct layers based on volatility, scope, and "importance" to the engineering lifecycle.

| Tier | Name | Persistence | Scope | Content Examples |
| :--- | :--- | :--- | :--- | :--- |
| **LTM** | Long-Term Memory | Immutable | Project-Wide | `GEMINI.md` (Global Constraints), PRD, TAS, Security Design, Roadmap. |
| **MTM** | Medium-Term Memory | Cumulative | Epic/Phase | Epic-level goals, summaries of previously completed tasks, architectural ADRs. |
| **STM** | Short-Term Memory | Volatile | Task/Turn | Current `TASK_ID` context, last 15-20 turns (CoT, Tool Calls, Sandbox logs). |

- **LTM Anchor:** The LTM is injected into every prompt. It represents the "Ground Truth" and "Identity" of the project. Any violation of LTM during implementation triggers a rejection by the Reviewer Agent.
- **MTM Evolution:** As tasks are completed, their results are condensed into the MTM. This prevents the agent from re-implementing logic or repeating research while allowing it to understand the broader context of the current Epic.
- **STM Flow:** The STM is the agent's "Working Memory." It is strictly pruned to keep the agent focused on the atomic task at hand.

### 4.2 Context Window Management & Optimization
**[MCP-MEM-002] Proactive Context Pruning:** To maximize the utility of the 1M token context window, the orchestrator employs a "Weighted Pruning" algorithm.
- **Signal-to-Noise Filtering:** Raw tool outputs (e.g., `npm install` logs, long stack traces, or binary file reads) are programmatically truncated or summarized if they exceed 5k tokens.
- **CoT Preservation:** The agent's "Thought" blocks are preserved with higher priority than tool outputs, as they contain the logical intent required for debugging.
- **Recursive Summarization:** When the total prompt size exceeds a user-defined threshold (e.g., 500k tokens), a specialized "Summarizer Persona" collapses the oldest turns in the STM into a "Lessons Learned" entry in the MTM.

**[MCP-MEM-003] Programmatic Context Caching:**
- The orchestrator leverages Gemini-native context caching for static LTM artifacts (PRD/TAS).
- **TTL Strategy:** Caches are refreshed whenever a spec document is modified (via a Reconciliation Turn). This significantly reduces per-turn latency and token costs during the Implementation Phase.

### 4.3 RAG (Retrieval-Augmented Generation) & Semantic Indexing
**[MCP-MEM-004] Codebase-Wide Retrieval:** For projects exceeding the 1M token window (or for cost-optimized operations), `devs` implements a local RAG pipeline.
- **Indexing:** Every `snapshot_state()` triggers an incremental update to a local vector store (located in `.gemini/memory/`). Files are chunked using an AST-aware parser to preserve semantic boundaries (e.g., keeping functions or classes whole).
- **Retrieval:** Agents can invoke a `search_codebase(query: string)` tool to retrieve relevant snippets from outside their active context.
- **Context Injection:** Retrieved snippets are injected as "Ephemeral Context," marked clearly to distinguish them from the active working files.

### 4.4 State Hydration & "Mental State" Reconstruction
**[MCP-MEM-005] Time-Travel Memory Restoration:** When a user branches or time-travels to a historical Turn $T_{x}$:
- **Filesystem Reset:** Git hard reset to $Checkpoint(T_{x}).hash$.
- **Ledger Replay:** The orchestrator re-reads the Ledger from $T_{0}$ to $T_{x}$.
- **Context Re-hydration:** 
    - The orchestrator reconstructs the "Mental State" by re-assembling the LTM, MTM, and STM as they existed at $T_{x}$.
    - If the user injects a new Directive at the branching point, it is prioritized at the top of the STM to bias the agent's subsequent reasoning.

### 4.5 Implementation Requirements & Data Models
- **[MCP-MEM-006] Memory Ledger Schema:** The `agent_memory` table in SQLite MUST track the `importance_score` (0.0 - 1.0) and `type` for every fragment.
- **[MCP-MEM-007] Hallucinated Memory Guard:** Agents MUST NEVER manually edit the memory ledger. All updates to MTM/LTM are performed by the Orchestrator Engine based on validated task completions or user-approved spec changes.
- **[MCP-MEM-008] Multi-Model Memory Interop:** If the system switches models (e.g., from Gemini Pro to Flash for speed), the orchestrator MUST ensure the context is reformatted to match the target model's specific prompt template and tokenization limits.

### 4.6 Risks & Unknowns
- **[RISK-MEM-001] Nuance Loss during Summarization:** Critical but subtle implementation details (e.g., a specific race condition fix) might be lost when a task is "collapsed" into MTM. *Mitigation:* The Ledger remains the source of truth; agents can "Deep Dive" into historical turns via a specialized tool if they detect a regression.
- **[Q-MEM-001]** What is the optimal "Context Balance" (ratio of STM vs. MTM vs. LTM) for implementation tasks?
- **[Q-MEM-002]** Should the agent be allowed to "Pin" specific turns to prevent them from being pruned during summarization?

---

## 5. Agentic-Native Project Design

Every project produced by `devs` is engineered to be **"Agentic-Native"**—optimized from the ground up for autonomous maintenance, debugging, and evolution by AI agents. This "AI-First" design ensures that future agents (including `devs` itself during maintenance cycles) can land in the codebase and achieve 100% architectural situational awareness within a single context window.

### 5.1 The Internal Project MCP Server (`mcp-server/`)
**[MCP-NATIVE-001] Native Introspection Interface:** Every generated project MUST include a lightweight, built-in MCP server that acts as the codebase's "Nervous System." This server allows agents to interact with the project's runtime and internal logic through standardized tools.
- **Discovery Protocol:** The server's entry point and capabilities are defined in `/.gemini/mcp.json`.
- **Core Introspection Tools:**
    - `get_architecture_map()`: Returns a JSON-formatted dependency graph of the project's modules, services, and data models.
    - `list_symbols(file_path)`: Uses an AST-aware parser to return a structured list of exported functions, classes, and types (LSP-lite).
    - `get_api_spec()`: Dynamically assembles and returns OpenAPI/Swagger schemas for all exposed endpoints.
    - `query_metadata(query)`: Searches a local SQLite database containing metadata about file responsibility, requirement mapping, and last-known-good states.
- **Validation & Health Tools:**
    - `run_health_check()`: Executes a comprehensive suite of linters, type-checkers, and unit tests, returning a structured JSON report.
    - `verify_compliance(req_id)`: Runs specific validation scripts or test cases associated with a given Requirement ID.

### 5.2 Machine-Readable Context & Long-Term Memory (LTM)
**[MCP-NATIVE-002] The `GEMINI.md` Manifest:** Located at `/.gemini/GEMINI.md`, this file serves as the project's "Soul" and primary LTM anchor for agents. It MUST be written in a concise, authoritative style optimized for LLM consumption.
- **Architectural Mandates:** Explicitly states the core patterns (e.g., "Clean Architecture," "Functional Core/Imperative Shell") that MUST be maintained.
- **Constraint Whitelist/Blacklist:**
    - *Whitelist:* Approved libraries, permitted side effects, and required naming conventions.
    - *Blacklist:* Forbidden patterns (e.g., "No inheritance," "No external CSS frameworks"), deprecated modules, and restricted APIs.
- **Module Map:** A high-signal guide to "Load-bearing" files—the 10% of the codebase that explains 90% of the logic.
- **Contextual Hints:** Directives for future agents on how to debug specific complex modules or handle sensitive data paths.

### 5.3 Structural Traceability & Requirement Mapping
**[MCP-NATIVE-003] In-Code Requirement Anchors:** To prevent "Architectural Drift," the generated code MUST include explicit metadata linking implementation to design.
- **Annotation Standard:** Public functions, classes, and complex logic blocks MUST use JSDoc/TSDoc tags (e.g., `@satisfies REQ-042`) to map back to the Requirement Distillation phase.
- **Traceability Ledger:** A machine-readable `/.gemini/traceability.json` file that maps every file in the `src/` directory to its corresponding EPIC and REQUIREMENT IDs.
- **Impact Analysis Tool:** The internal MCP server uses this ledger to answer the question: "If I modify this file, which requirements might be compromised?"

### 5.4 Glass-Box Observability in the Generated Project
**[MCP-NATIVE-004] Instrumented Implementations:** Projects are structured to expose their internal state during development and testing.
- **Structured Logging:** All generated code uses a standard, machine-parsable logging format (e.g., JSON-based Pino/Winston) with correlation IDs, making it easy for agents to trace errors across service boundaries.
- **Diagnostic Endpoints:** Internal APIs (accessible via the MCP server) allow agents to "peek" into the state of caches, message queues, and database connections without modifying application state.
- **Test-Driven Traceability:** Every test case includes metadata describing the *intent* of the test, allowing a Validation Agent to distinguish between "Implementation Detail" failures and "Requirement Violation" failures.

### 5.5 "Agent-Ready" Documentation Standards
**[MCP-NATIVE-005] LLM-Optimized Documentation:** The `docs/` directory is not just for humans; it is structured for RAG and context-injection.
- **Flat-File Hierarchy:** Documentation is stored in a shallow, predictable folder structure to minimize agent traversal costs.
- **High-Density Markdown:** Avoids flowery language; uses Mermaid for all diagrams and code blocks for all configuration examples.
- **Summary Sidecars:** Every major directory contains a `README.ai.md`—a hyper-condensed summary of the directory's purpose and logic for quick context loading.

### 5.6 Edge Cases & Implementation Risks
- **[RISK-NATIVE-001] Metadata Bloat:** Excessive in-code annotations can reduce human readability. *Mitigation:* Focus annotations on public APIs and complex "Load-bearing" logic; use the `traceability.json` ledger for granular file-to-requirement mapping.
- **[RISK-NATIVE-002] MCP Server Overhead:** Running a secondary server during development might consume resources. *Mitigation:* The MCP server is lightweight and only activated during agentic sessions or validation cycles.
- **[Q-NATIVE-001]** How should the project handle "Manual Drift"—when a human user modifies the code and forgets to update the `@satisfies` tags?
- **[Q-NATIVE-002]** Can we implement a "Self-Healing" git hook that runs the compliance audit and rejects commits that violate `GEMINI.md`?

---

## 6. Implementation Detail: LangGraph Orchestration

### 6.1 State Graph Definition
The `devs` engine uses a `StateGraph` where each node corresponds to an agent persona or a validation gate.

| Node | Responsibility | Transitions To |
| :--- | :--- | :--- |
| `research_node` | Generate research reports | `arch_node` (after approval) |
| `arch_node` | Generate PRD/TAS | `plan_node` (after approval) |
| `implement_node` | TDD implementation | `review_node` |
| `review_node` | Audit code quality | `implement_node` (if reject) or `checkpoint_node` |
| `reconcile_node` | Align state after user edit | `implement_node` |

---

## 7. Risks & Technical Unknowns

The implementation of a "Glass-Box" agentic engineering system using MCP and LangGraph introduces several high-stakes technical risks and architectural unknowns. These must be addressed to ensure the system remains reliable, secure, and steerable.

### 7.1 Architectural & State Risks
**[RISK-MCP-001] Triple-Anchor State Divergence:**
- **Description:** A critical failure where the Filesystem (Git), the Metadata Ledger (SQLite), and the LLM Mental State (Context Cache) fall out of sync. This can occur due to unmonitored manual edits, partial tool-call failures, or crashes during atomic transactions.
- **Impact:** The agent operates on a "Ghost State," leading to hallucinated implementation paths or corrupted history.
- **Mitigation:** Mandatory "Consistency Pulses" before every turn; using Git as the ultimate source of truth for the filesystem; implementing orchestrator-level WAL (Write-Ahead Logging) to recover interrupted transitions.

**[RISK-MCP-002] Ledger Bloat and Traversal Latency:**
- **Description:** As projects grow to thousands of tasks and turns, the SQLite Ledger's turn-lineage graph may become performantly expensive to traverse for "Time-Travel" UI or agentic context reconstruction.
- **Impact:** Degraded user experience in the VSCode extension; increased latency in agent turn transitions.
- **Mitigation:** Implementing incremental indexing for the State Graph; periodic "Vacuuming" and archival of non-critical branch history into external object stores.

### 7.2 AI & Reasoning Risks
**[RISK-MCP-003] Nuance Loss during Context Pruning:**
- **Description:** To stay within token limits, the system summarizes old turns into Medium-Term Memory (MTM). Critical but subtle implementation details (e.g., a specific race condition fix or a non-obvious dependency constraint) might be lost in the summarization process.
- **Impact:** Regressions where the agent inadvertently re-introduces bugs it previously solved.
- **Mitigation:** Weighted summarization that prioritizes "Architectural Decisions" and "Failed Hypothesis" logs; implementation of a "Deep-Dive" tool that allows agents to retrieve raw historical turns via semantic search (RAG) when a regression is detected.

**[RISK-MCP-004] Tautological or Shallow Testing (The "Green-Wash" Effect):**
- **Description:** Agents might optimize for "Green Lights" by writing tests that don't actually validate the requirement (e.g., testing that a function exists rather than its logic) or by writing tests that pass by default.
- **Impact:** High test coverage with zero actual validation rigor.
- **Mitigation:** A separate "Validation Agent" whose only task is to audit the *quality* and *relevance* of the generated tests; mandatory "Red Phase" verification where the test MUST fail before implementation begins.

**[RISK-MCP-005] Non-Deterministic Architectural Drift:**
- **Description:** Minor variations in LLM responses during the TAS/PRD generation phase can lead to radically different project structures from the same initial prompt.
- **Impact:** Inconsistency in "Time-Travel" reproduction and difficulty in standardizing agent behaviors across different projects.
- **Mitigation:** Strict temperature settings (0.0) for architectural nodes; persistence of the full system prompt and seed in the Ledger for every decision.

### 7.3 Security & Operational Risks
**[RISK-MCP-006] Sandbox Escape and Host Integrity:**
- **Description:** While Implementation agents are containerized, a malicious or accidental command could theoretically exploit a kernel vulnerability or a volume mount misconfiguration to escape the Docker sandbox.
- **Impact:** Potential loss of user data, credential theft, or host system compromise.
- **Mitigation:** Use of `gVisor` or `Kata Containers` for higher isolation; strict `seccomp` profiles; disabling network access by default during implementation turns; mandatory human approval for commands targeting paths outside the project root.

**[RISK-MCP-007] Dependency Chain Poisoning:**
- **Description:** The Research Agent might suggest a library found on npm/GitHub that contains malicious code or has been hijacked (supply chain attack).
- **Impact:** The generated project itself becomes a vector for malware.
- **Mitigation:** Automated security scanning (e.g., `npm audit`, `snyk`) of all suggested dependencies before they are added to the TAS; prioritizing libraries with high "Agentic Friendliness" and stable maintenance history.

**[RISK-MCP-008] Runaway Token Consumption (The "Death Loop" Cost):**
- **Description:** An agent trapped in a recursive "Test-Fix-Fail" loop can consume thousands of dollars in API tokens in minutes if not monitored.
- **Impact:** Unexpected financial burden on the user.
- **Mitigation:** Heuristic loop detection (Oscillation/Stagnation monitors); hard-coded token quotas per task; mandatory user "Budget Approval" gates when a task exceeds its estimate.

### 7.4 Technical Unknowns & Open Questions
- **[Q-MCP-001] Multi-Language Debugging Standard:** How can an MCP server provide a uniform interface for debugging and profiling across radically different runtimes (e.g., a TypeScript agent debugging a Rust WASM module or a Go microservice)?
- **[Q-MCP-002] Optimal Token-to-Signal Ratio:** What is the "Golden Ratio" of raw logs vs. summarized intent that should be maintained in the STM to maximize reasoning accuracy without hitting the context ceiling?
- **[Q-MCP-003] Cross-Agent Memory Consistency:** In a multi-agent scenario (e.g., a Security Agent and an Implementation Agent working concurrently), how do we synchronize their individual "Mental States" to prevent one from violating a constraint the other just established?
- **[Q-MCP-004] Deterministic State Reproduction:** Can we guarantee 100% reproduction of an agent's reasoning path given the non-deterministic nature of LLMs, even with fixed seeds and temperatures?
- **[Q-MCP-005] User Intent Ambiguity Resolution:** At what point does the "Clarification Agent" stop asking questions and start making authoritative assumptions, and how do we flag those assumptions in the TAS?
- **[Q-MCP-006] Scaling the State Graph:** Will SQLite remain the optimal backend for projects with >10,000 turns, or will a transition to a dedicated Graph Database (e.g., Neo4j) be required for efficient lineage traversal?
- **[Q-MCP-007] MCP Protocol Evolution:** How do we handle breaking changes in the Model Context Protocol specification while maintaining backward compatibility for projects generated with older versions of `devs`?
