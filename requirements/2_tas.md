### **[TAS-001]** Glass-Box Transparency & Auditability
- **Type:** Technical
- **Description:** Every state transition and agent reasoning step must be persisted to a local SQLite database (`.devs/state.sqlite`) to serve as a "Flight Recorder" for the project.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-002]** Stateless & Resumable Orchestration
- **Type:** Technical
- **Description:** The core engine must be stateless, reloading the entire project context (Agent memory, requirement DAGs, and task status) from the project's `.devs/` directory to ensure resilience.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-003]** Native Agentic Observability (MCP)
- **Type:** Technical
- **Description:** The generated project must include a built-in MCP server that exposes internal state, logs, and profiling data for AI agents to debug and optimize.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-004]** Strict TDD-Driven Implementation
- **Type:** Technical
- **Description:** Implementation must follow a mandatory "Red-Green-Refactor" cycle where code is only written once a failing test case has been established in the sandbox.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-060]** Runtime Environment
- **Type:** Technical
- **Description:** The orchestrator must run on Node.js v22.x (LTS) for high-performance asynchronous I/O and VSCode compatibility.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-005]** Programming Language
- **Type:** Technical
- **Description:** Use TypeScript 5.4+ in Strict Mode (`strict: true`, `noImplicitAny: true`, `exactOptionalPropertyTypes: true`) for all core development.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-006]** Package Manager
- **Type:** Technical
- **Description:** Use `pnpm` v9.x for package management within a monorepo workspace structure.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-007]** Primary Reasoning Model
- **Type:** Technical
- **Description:** Google Gemini 3 Pro must be used as the primary reasoning model, leveraging its 1M+ token context window.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-013]** Agent Sandboxing (Isolated Runtime)
- **Type:** Technical
- **Description:** Agent execution must be isolated: CLI mode uses Docker Engine (Alpine-based, restricted `seccomp`), and Extension mode uses `WebContainers` API.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-014]** Model Context Protocol (MCP) Integration
- **Type:** Technical
- **Description:** Full integration of `@modelcontextprotocol/sdk` for standardized system tools and orchestrator state observability.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-023]** Secret Masking & Redaction
- **Type:** Security
- **Description:** Middleware layer must intercept all sandbox `stdout/stderr` and apply regex/entropy-based masking to prevent secrets/PII from entering logs or LLM context.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-027]** Real-time Search Integration
- **Type:** Technical
- **Description:** Use Google Search API (via Serper) for validating documentation and checking for package deprecations.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-028]** Content Extraction
- **Type:** Technical
- **Description:** Use `Firecrawl` or `Jina Reader` to convert dynamic web content into clean, LLM-optimized Markdown.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-029]** View Layer
- **Type:** Technical
- **Description:** Use React 18+ with Tailwind CSS for the VSCode Webview dashboard.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-030]** Component Architecture
- **Type:** UX
- **Description:** Utilize `vscode-webview-ui-toolkit` to ensure aesthetic integration with VSCode themes.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-031]** Documentation Rendering
- **Type:** UX
- **Description:** Use `Mermaid.js` for dynamic rendering of architectural diagrams and roadmaps within Markdown previews.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-032]** Orchestrator Verification
- **Type:** Technical
- **Description:** Use `Vitest` for unit and integration testing of orchestrator agent nodes and state transitions.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-033]** Automated Code Auditing
- **Type:** Technical
- **Description:** Integrate `ESLint`, `Prettier`, and language-specific static analysis tools as mandatory verification steps in the TDD loop.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-015]** User Approval Gate
- **Type:** Functional
- **Description:** Mandatory user sign-off gate on generated blueprints (PRD and TAS) before the project can proceed to distillation and implementation.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-016]** Short-term Memory Management
- **Type:** Technical
- **Description:** Manage active task context, recent tool calls, and local file contents within the LLM context window.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-017]** Medium-term Memory Persistence
- **Type:** Technical
- **Description:** Store Epic-level decisions and resolved task summaries in the SQLite `agent_logs`.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-001]

### **[TAS-018]** Long-term Memory Vector Storage
- **Type:** Technical
- **Description:** Store project-wide constraints, architecture decisions, and user preferences in a LanceDB vector store using `text-embedding-004`.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-019]** Deterministic Entropy Detection
- **Type:** Technical
- **Description:** Monitor for agent loops by hashing the last 3 error outputs; if a loop is detected, the agent must "Reason from First Principles" to pivot strategy.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-020]** Escalation Pause
- **Type:** Functional
- **Description:** After 5 total task failures or persistent loops, the system must pause and alert the user for manual intervention.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-019]

### **[TAS-021]** Sandbox Resource Constraints
- **Type:** Technical
- **Description:** Limit sandboxes to 2 vCPUs, 4GB RAM, 2GB ephemeral storage, and a 300s timeout per tool call.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-013]

### **[TAS-022]** Network Egress Policy
- **Type:** Security
- **Description:** Default-deny network egress; allow-list is restricted to `npmjs.org`, `pypi.org`, and `github.com` during dependency installation only.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-013]

### **[TAS-035]** Structured Agent-Orchestrator Protocol (SAOP)
- **Type:** Technical
- **Description:** All agent interactions must follow the SAOP specification, requiring a strictly-typed JSON envelope containing analysis, intent, and commands.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-065]** Standardized Observation Format
- **Type:** Technical
- **Description:** Tool outputs (observations) must be returned to agents in a standardized JSON structure including status, data (content, exit_code, truncation), and context hints.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-043]** Generated Project MCP API
- **Type:** Functional
- **Description:** Every generated project must include an internal MCP server with tools for `inspect_state`, `run_diagnostic`, and `query_log_history`.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-003]

### **[TAS-038]** Real-time Trace & Event Streaming (RTES)
- **Type:** UX
- **Description:** Implement a real-time event bus to stream agent thoughts, tool lifecycles, and sandbox output buffers to the user interface.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-041]** Binary Gate Protocol
- **Type:** Technical
- **Description:** Control task progression via deterministic exit-code gates: RED (fail assertion), GREEN (all task tests pass), REGRESSION (all epic tests pass), and QUALITY (zero lint errors).
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-004]

### **[TAS-039]** Shared Database State Persistence
- **Type:** Technical
- **Description:** Agent handoffs must occur via the shared database state; no agent may hold long-term state in internal memory.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-001]

### **[TAS-024]** Context Pruning Strategy
- **Type:** Technical
- **Description:** When task context exceeds 800k tokens, use a Flash model to summarize the earliest 50% of logs while preserving the TAS and active requirements.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-026]** Rate Limit Handling
- **Type:** Technical
- **Description:** Implement exponential backoff (2s to 60s) for LLM API calls, saving state before every retry.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-001]

### **[TAS-040]** Project Directory Structure
- **Type:** Technical
- **Description:** Generated projects must follow a specific top-level structure: `.devs/`, `.agent/`, `mcp-server/`, `src/`, `tests/`, `docs/`, `scripts/`.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-061]** Flight Recorder Isolation
- **Type:** Technical
- **Description:** The `.devs/` directory must be excluded from Developer Agent write-access and contain the primary relational/vector stores and trace logs.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-001], [TAS-018], [TAS-040]

### **[TAS-042]** Agent-Oriented Documentation (AOD)
- **Type:** Technical
- **Description:** The `.agent/` directory must contain machine-readable AOD (index, catalog, and module-specific markdown) to provide intent and architectural hooks for agents.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-040]

### **[TAS-062]** Standalone MCP Server Implementation
- **Type:** Technical
- **Description:** The `mcp-server/` directory in the generated project must be a standalone Node.js/TypeScript project implementing the Model Context Protocol.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-003], [TAS-040]

### **[TAS-044]** Specification Document Repository
- **Type:** Technical
- **Description:** The `docs/` directory must store research reports and standardized high-level specification markdown files generated during Phase 1 & 2.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-040]

### **[TAS-045]** Requirement-Linked Source Structure
- **Type:** Technical
- **Description:** `src/` and `tests/` files should include header comments linking code units to specific `REQ-ID`s.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-040]