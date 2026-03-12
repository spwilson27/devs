# Requirements: PRD (Product Requirements Document)

**Extracted From:** `docs/plan/specs/1_prd.md`
**Document ID:** 1_PRD
**Status:** Authoritative

---

## Feature Requirements (`1_PRD-REQ-*`)

### **[1_PRD-REQ-001]** Headless gRPC Server with Remote Client Support
- **Type:** Technical
- **Description:** `devs` runs as a headless background process (the "server") exposing a gRPC API. All client interfaces (TUI, CLI, MCP) connect to the server over gRPC, enabling remote access from clients on other machines.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-002]** Single Rust Cargo Workspace
- **Type:** Technical
- **Description:** The server, TUI client, CLI client, and MCP server are all implemented in Rust and ship as a single Cargo workspace. There is no separate runtime dependency on a database, message broker, or external service.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-003]** Server Auto-Discovery via Well-Known File
- **Type:** Technical
- **Description:** On startup, the server writes its listen address to `~/.config/devs/server.addr` to enable client auto-discovery. Clients given an explicit `--server` flag or `server_addr` config key use that address and skip auto-discovery. For test isolation, auto-discovery uses the `DEVS_DISCOVERY_FILE` environment variable to avoid address conflicts between parallel server instances.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-004]** Workflow DAG Scheduling
- **Type:** Functional
- **Description:** Workflows are modeled as directed acyclic graphs (DAGs) of stages. Each stage declares a `depends_on` list of other stage names within the same workflow. A stage becomes eligible to run as soon as all declared dependencies have successfully completed.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-005]** Automatic Parallel Stage Scheduling
- **Type:** Functional
- **Description:** Stages with no unmet dependencies are scheduled to run in parallel automatically. The scheduler does not require explicit parallelism declarations beyond the `depends_on` structure.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-004]

### **[1_PRD-REQ-006]** Dual Workflow Authoring Formats
- **Type:** Functional
- **Description:** `devs` supports two workflow authoring formats: a typed Rust Builder API (compiled against the `devs` library crate, with conditional branching expressed as Rust closures) and a Declarative Config format (TOML or YAML, loaded at runtime without Rust compilation, with branching via built-in predicates or named Rust handlers registered at startup).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-004]

### **[1_PRD-REQ-007]** Typed Workflow Input Parameters with Template Variables
- **Type:** Functional
- **Description:** Workflows accept typed input parameters (strings, paths, integers) declared in the workflow definition and validated on submission. Stages reference parameter values and prior stage outputs in prompts using `{{template}}` variable syntax (e.g., `{{stage.<name>.<field>}}`).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-004]

### **[1_PRD-REQ-008]** Run Identification with Slug Deduplication
- **Type:** Functional
- **Description:** Each workflow run is identified by a user-provided name combined with a UUID or human-readable slug. If no name is supplied at submit time, a slug is auto-generated from the workflow name and a timestamp. Duplicate run names within the same project are rejected.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-004]

### **[1_PRD-REQ-009]** Workflow Definition Snapshotting
- **Type:** Functional
- **Description:** When a run starts, `devs` snapshots the workflow definition and stores it alongside the checkpoint state. Active runs continue using the snapshotted definition even if the live definition changes during execution, ensuring reproducibility.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-004]

### **[1_PRD-REQ-010]** Stage Inputs
- **Type:** Functional
- **Description:** Each stage can supply the following inputs to the spawned agent: a prompt string (inline text, optionally containing template variables), a prompt file (a path to a file loaded at runtime), a system-level prompt (where supported by the agent), and per-stage environment variables injected into the agent process.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-004]

### **[1_PRD-REQ-011]** Configurable Stage Completion Signals
- **Type:** Functional
- **Description:** Each stage has a configurable completion signal mechanism. Three mechanisms are supported: `exit_code` (zero = success, non-zero = failure), `structured_output` (agent writes JSON to stdout or `.devs_output.json`), and `mcp_tool_call` (agent signals completion by invoking a `devs` MCP tool, enabling mid-run progress updates).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-004]

### **[1_PRD-REQ-012]** Inter-Stage Data Flow Mechanisms
- **Type:** Functional
- **Description:** Stage outputs flow to downstream stages via three complementary mechanisms, all supported and combinable: template variables (`{{stage.<name>.<field>}}` syntax), a context file written to the working directory before the next agent is spawned, and a shared directory convention where agents write outputs to a known location for the next agent to read.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-004]

### **[1_PRD-REQ-013]** Supported Agent CLI Tools at MVP
- **Type:** Functional
- **Description:** `devs` spawns agents by invoking CLI tools as subprocesses. The following agent CLIs are supported at MVP: `claude` (Claude Code), `gemini` (Gemini CLI), `opencode` (OpenCode), `qwen` (Qwen CLI), and `copilot` (GitHub Copilot CLI).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-014]** Extensible Agent Adapter Layer
- **Type:** Technical
- **Description:** The adapter layer is designed for extensibility so that new CLI agent tools can be added without restructuring the core. Each adapter encapsulates prompt-passing mode, PTY configuration, and rate-limit detection patterns specific to that tool.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-013]

### **[1_PRD-REQ-015]** Agent Prompt Passing Modes
- **Type:** Functional
- **Description:** Each agent adapter supports one of two prompt-passing modes: flag-based (the prompt is passed as a command-line flag, e.g., `claude -p "..."`) or file-based (the prompt is written to a temporary file and its path is passed to the agent).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-013]

### **[1_PRD-REQ-016]** PTY Mode for Agent CLIs
- **Type:** Functional
- **Description:** Each agent adapter can be configured to run the agent inside a PTY (pseudo-terminal) so the process believes it is operating in an interactive terminal. This is required for agent CLIs that behave differently in non-interactive environments.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-013]

### **[1_PRD-REQ-017]** Bidirectional Mid-Run Agent Interaction
- **Type:** Functional
- **Description:** `devs` supports two-way communication with running agents: agent-to-devs (agents call `devs` MCP tools to report progress, request context, or signal partial completion) and devs-to-agent (devs pushes cancel signals or updated instructions to a running agent via stdin or MCP push notifications, depending on the adapter).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-013]

### **[1_PRD-REQ-018]** Agent Rate Limit Detection
- **Type:** Functional
- **Description:** `devs` detects agent rate limits through two complementary mechanisms: passive detection (the adapter watches agent exit codes and stderr output for known rate-limit error patterns) and active reporting (agents call a `devs` MCP tool to proactively report a rate-limit condition, triggering an immediate pool fallback).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-013]

### **[1_PRD-REQ-019]** Agent Pools
- **Type:** Functional
- **Description:** An Agent Pool is a named, ordered collection of agent configurations used to route work, enforce concurrency, and provide fallback. Pools are shared across all projects managed by the server. Pool configuration is defined in `devs.toml`.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-020]** Pool Routing: Fallback Order and Capability Tags
- **Type:** Functional
- **Description:** Pools support two complementary routing mechanisms: fallback order (agents are tried in priority order; the next agent is tried if the current one fails due to error, rate-limit, or service outage) and capability tags (agents are tagged with capabilities such as `code-gen`, `review`, `long-context`; stages may require one or more tags and the pool selects only agents that satisfy them in priority order).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-019]

### **[1_PRD-REQ-021]** Pool Concurrency Limit
- **Type:** Functional
- **Description:** Each pool has a configurable `max_concurrent` value limiting the number of concurrently running agent processes, independent of pool size. This applies globally across all projects sharing the pool.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-019]

### **[1_PRD-REQ-022]** Configurable Stage Execution Environments
- **Type:** Functional
- **Description:** The filesystem and process environment for an agent stage is configurable per-stage (or inherited from a workflow-level default). Three execution targets are supported at MVP: `tempdir` (temporary directory on the local machine; repo cloned before stage runs), `docker` (Docker container with full `DOCKER_HOST` configuration support), and `remote` (remote machine via SSH with full `ssh_config` support; repo cloned there before stage runs).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-004]

### **[1_PRD-REQ-023]** Configurable Artifact Collection
- **Type:** Functional
- **Description:** After a stage completes, how the agent's work is persisted back to the project repo is configurable per-workflow via two modes: agent-driven (agents are instructed via prompt to commit and push their own changes using git) or auto-collect (`devs` diffs the working directory after stage completion, commits any changes, and pushes them to the checkpoint branch).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-022]

### **[1_PRD-REQ-024]** Fan-Out: Parallel Agent Execution within a Stage
- **Type:** Functional
- **Description:** A stage can fan out across multiple agents running in parallel. `devs` manages spawning, monitoring, and collecting results from all parallel agents before advancing to the next stage. Fan-out can be driven by a count or an explicit input list.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-004]

### **[1_PRD-REQ-025]** Fan-Out in Both Authoring Formats
- **Type:** Functional
- **Description:** Fan-out is available in both authoring formats: in the Rust builder API (a closure returns an iterator of agent configurations) and in the declarative format (a `fan_out` count or an explicit `input_list`).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-024]

### **[1_PRD-REQ-026]** Fan-Out Result Merge
- **Type:** Functional
- **Description:** After all parallel agents in a fan-out stage complete, results are merged before advancing. Two merge modes are supported: default (results collected into an array and passed as structured input to the next stage) and custom merge handler (a Rust closure in the builder API, or a named handler in the declarative format, reduces the parallel results).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-024]

### **[1_PRD-REQ-027]** Stage Retry Mechanisms
- **Type:** Functional
- **Description:** Stage failure can trigger retry through two complementary mechanisms, which may be used together: per-stage retry config (a stage declares a max retry count and backoff strategy; `devs` automatically retries before triggering the error branch) and branch loopback (the workflow graph's error branch routes back to the failed stage).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-004]

### **[1_PRD-REQ-028]** Configurable Stage and Workflow Timeouts
- **Type:** Functional
- **Description:** Timeouts are configurable at two levels: per-stage (if the agent does not complete within the configured duration, `devs` sends a cancel signal and marks the stage as failed) and workflow-level (a global cap on the total run duration).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-004]

### **[1_PRD-REQ-029]** Git-Backed Checkpoint Persistence
- **Type:** Functional
- **Description:** Workflow execution state (checkpoints) and workflow definition snapshots are committed to the project's git repository inside a `.devs/` directory. The checkpoint file is written atomically and committed after each significant state transition.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-030]** Configurable Checkpoint Branch
- **Type:** Functional
- **Description:** The checkpoint target branch is configurable per-project: working branch (checkpoints committed directly alongside project code) or dedicated state branch (checkpoints committed to a configurable branch, e.g., `devs/state`, to keep them isolated from project history).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-029]

### **[1_PRD-REQ-031]** Crash Recovery and State Inspectability via Git
- **Type:** Non-Functional
- **Description:** Git-backed state persistence ensures three properties: in-flight workflow runs survive a server crash or restart (checkpoints are restored on startup), state is version-controlled and inspectable by AI agents working on the project, and workflow runs are reproducible (the definition snapshot is stored alongside the checkpoint).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-029]

### **[1_PRD-REQ-032]** Configurable Log Retention Policy
- **Type:** Functional
- **Description:** Log retention is configurable via a policy specifying maximum age and/or maximum size. Logs are persisted alongside checkpoints in the project repo under the `.devs/` directory.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-029]

### **[1_PRD-REQ-033]** Multi-Project Support with Shared Agent Pool
- **Type:** Functional
- **Description:** A single `devs` server instance manages multiple projects simultaneously. The shared agent pool services all projects. Projects are registered via `devs project add` and stored in a separate registry file.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-019]

### **[1_PRD-REQ-034]** Configurable Multi-Project Scheduling Policy
- **Type:** Functional
- **Description:** When multiple projects compete for agent slots, the scheduling policy is configurable per server: strict priority queue (higher-priority projects always get first access to available agents) or weighted fair queuing (agent slots are allocated proportionally to per-project weights). Users assign priority or weight to each registered project.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-033]

### **[1_PRD-REQ-035]** Manual-Only Workflow Triggers at MVP
- **Type:** Functional
- **Description:** At MVP, workflow runs are triggered manually only, via two mechanisms: CLI (`devs submit <workflow> [--name <run-name>] [--input key=value ...]`) and MCP tool call (an AI agent submits a run via the `devs` MCP interface using the `submit_run` tool). Scheduled, inbound webhook, and file-watch triggers are post-MVP.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-036]** Outbound Webhook Notifications for Configurable Event Types
- **Type:** Functional
- **Description:** `devs` delivers outbound webhook notifications for four configurable event classes: run lifecycle (workflow run started, completed, or failed), stage lifecycle (individual stage started, completed, or failed), pool exhaustion (all agents in a pool are unavailable), and all state changes (fires on every internal state transition).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-037]** Per-Project Webhook Configuration
- **Type:** Functional
- **Description:** Notification targets (URLs) and subscribed event types are configured per-project in the server config (`devs.toml`). Different projects can subscribe to different event types and send to different endpoints.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-036]

### **[1_PRD-REQ-038]** TUI Client Interface
- **Type:** UX
- **Description:** The TUI is an interactive terminal dashboard that connects to the server over gRPC (local or remote). It provides four tabbed views: Dashboard (split pane with project/run list on the left and selected run detail — stage graph, per-stage status, elapsed time, live log tail — on the right), Logs (full log stream for a selected stage or run), Debug (follow a specific agent's progress, inspect a working directory diff, send cancel/pause/resume signals), and Pools (real-time view of pool utilization, agent availability, and fallback events).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-001]

### **[1_PRD-REQ-039]** CLI Client Interface with MVP Commands
- **Type:** Functional
- **Description:** The CLI client provides the following commands at MVP: `devs submit` (submit a workflow run with optional name and input parameters), `devs list` (list active and historical workflow runs), `devs status <run>` (show the current status of a run and its stages), `devs logs <run> [stage]` (stream or fetch logs), `devs cancel <run>` (cancel a running workflow), `devs pause <run/stage>` (pause a run or individual stage), and `devs resume <run/stage>` (resume a paused run or stage).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-001]

### **[1_PRD-REQ-040]** Dedicated MCP Server and Stdio Bridge
- **Type:** Functional
- **Description:** `devs` exposes a dedicated MCP server on a separate port from the gRPC API. An MCP stdio bridge client is also provided, allowing AI agents to connect via stdio (the bridge forwards all messages faithfully to the MCP port). This is the primary interface for agentic development of `devs` itself.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-001]

### **[1_PRD-REQ-041]** Glass-Box MCP Capabilities at MVP
- **Type:** Functional
- **Description:** The MCP server exposes the following capabilities at MVP: observe agent state, stage outputs, and logs (`list_runs`, `get_run`, `get_stage_output`, `stream_logs`, `get_pool_state`, `get_workflow_definition`, `list_checkpoints`); control execution (`submit_run`, `cancel_run`, `cancel_stage`, `pause_run`, `pause_stage`, `resume_run`, `resume_stage`); read and write workflow definitions (`write_workflow_definition`); inject test inputs and assert on stage outputs (`inject_stage_input`, `assert_stage_output`); and receive mid-run agent callbacks (`report_progress`, `signal_completion`, `report_rate_limit`).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-040]

### **[1_PRD-REQ-042]** TOML-Based Server Configuration
- **Type:** Technical
- **Description:** The server is configured via a single TOML file (`devs.toml`) split into two parts: the main config file (server settings including listen address, MCP port, default pool, scheduling policy, webhook targets, credential entries, and pool definitions) and the project registry (projects registered via `devs project add`, stored in a separate registry file with repo path, priority/weight, checkpoint branch, and workflow search paths).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-043]** Config Override via CLI Flags and Environment Variables
- **Type:** Technical
- **Description:** CLI flags and environment variables can override any config file value. The precedence order is: CLI flags > environment variables > `devs.toml` values > built-in defaults.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-042]

### **[1_PRD-REQ-044]** Agent Credential Supply via Environment or Config
- **Type:** Security
- **Description:** Agent CLI API keys can be supplied via environment variables on the server process (preferred) or via TOML config entries (supported with a documented security caveat about plaintext storage). No external secrets manager is integrated at MVP.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-042]

### **[1_PRD-REQ-045]** `./do` Developer Entrypoint Script
- **Type:** Functional
- **Description:** A `./do` shell script is present at the repository root from the first commit. It supports the following subcommands: `setup` (install all dev dependencies, idempotent), `build` (cargo build --release --workspace), `test` (cargo test --workspace), `lint` (cargo clippy -D warnings), `format` (cargo fmt --workspace), `coverage` (run cargo-llvm-cov and enforce coverage gates), `presubmit` (run setup, format, lint, test, coverage, then ci; 15-minute wall-clock timeout), and `ci` (copy working directory to a temporary commit and run all presubmit checks on CI runners).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-046]** Presubmit Checks Gate All Commits
- **Type:** Non-Functional
- **Description:** Successful presubmit checks (`./do presubmit`) gate all commits and forward progress. No commit may be accepted by the CI pipeline unless all presubmit steps pass.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-045]

### **[1_PRD-REQ-047]** GitLab CI/CD on Linux, macOS, and Windows
- **Type:** Non-Functional
- **Description:** GitLab CI/CD pipelines run all presubmit checks. The pipeline is validated on Windows, macOS, and Linux runners. All three platform jobs must be green for a pipeline to pass.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-045]

### **[1_PRD-REQ-048]** Automated Code Formatting and Linting
- **Type:** Non-Functional
- **Description:** All code is auto-formatted using `cargo fmt` and linted using `cargo clippy --workspace --all-targets -- -D warnings`. Both checks must pass before any commit is accepted by presubmit.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-045]

### **[1_PRD-REQ-049]** Doc Comments for All Public Rust Items
- **Type:** Non-Functional
- **Description:** All public Rust items (structs, enums, traits, free functions, methods, and modules) in all workspace crates must have doc comments. This is enforced by `cargo doc --no-deps` run as part of `./do lint`.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-045]

### **[1_PRD-REQ-050]** Unit Test Line Coverage ≥ 90%
- **Type:** Non-Functional
- **Description:** All Rust source in the workspace achieves ≥ 90% line coverage from unit tests, measured using `cargo-llvm-cov`. This gate is enforced by `./do coverage` and the GitLab CI pipeline.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-045]

### **[1_PRD-REQ-051]** E2E Test Coverage Requirements
- **Type:** Non-Functional
- **Description:** All Rust source achieves ≥ 80% line coverage through E2E tests, measured separately from unit test coverage. E2E tests are defined as tests that exercise the system exclusively through external user interfaces (CLI, TUI, or MCP). Each interface individually must achieve ≥ 50% line coverage through E2E tests targeting only that interface.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-045]

### **[1_PRD-REQ-052]** TUI Verification via Text-Snapshot and State Assertions
- **Type:** Non-Functional
- **Description:** TUI verification uses interaction automation, state assertions, and UI text-snapshots (comparing rendered terminal output as a 2D character grid). Pixel-level screenshot comparison is explicitly prohibited.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-038]

### **[1_PRD-REQ-053]** Requirement Traceability via Automated Tests
- **Type:** Non-Functional
- **Description:** Every requirement stated in the PRD must have at least one automated test (unit or E2E) that verifies it, identifiable by requirement ID in the test suite. A requirement without a corresponding automated test is considered unimplemented regardless of whether the code appears functionally correct.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-045]

### **[1_PRD-REQ-054]** MVP Non-Goals Explicitly Out of Scope
- **Type:** Non-Functional
- **Description:** The following features are explicitly out of scope for the MVP and must not be implemented: GUI, web API / REST interface, client authentication, external secrets manager integration, and automated workflow triggers (cron, inbound webhook, file-watch). Any pull request introducing code for these features must be rejected by CI.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-055]** No HTTP Listener in MVP Server Binary
- **Type:** Technical
- **Description:** The `devs` server binary MUST NOT start any HTTP listener at any port under any configuration flag at MVP. The gRPC API is the sole programmatic interface.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-054]

### **[1_PRD-REQ-056]** No Web Application Framework Dependency
- **Type:** Technical
- **Description:** The Cargo workspace MUST NOT include any dependency that transitively provides a web application framework (e.g., axum, warp, actix-web) in MVP build targets.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-054]

### **[1_PRD-REQ-057]** No Web Assets in MVP Binary
- **Type:** Technical
- **Description:** No HTML, CSS, JavaScript, or WebAssembly assets must be embedded in or distributed alongside the MVP binary.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-054]

### **[1_PRD-REQ-058]** gRPC API Designed for Future GUI Compatibility
- **Type:** Technical
- **Description:** The gRPC API defined in the `.proto` files is the sole programmatic interface for all client interactions. This API must be designed so that a future GUI client can connect to it without requiring server modifications.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-001]

### **[1_PRD-REQ-059]** No HTTP Handler or Middleware in MVP
- **Type:** Technical
- **Description:** The server MUST NOT implement any HTTP handler or middleware at MVP. All server-side request processing is exclusively via the gRPC service layer.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-055]

### **[1_PRD-REQ-060]** No OpenAPI or HTTP Endpoint Description Files
- **Type:** Technical
- **Description:** No OpenAPI, Swagger, or JSON Schema file describing HTTP endpoints must be generated or included in the repository at MVP. The gRPC `.proto` files are the sole authoritative API description.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-054]

### **[1_PRD-REQ-061]** gRPC Proto Files as Versioned API Source of Truth
- **Type:** Technical
- **Description:** The gRPC `.proto` files are the sole authoritative API description. They must be versioned in the repository and updated whenever the API surface changes.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-001]

### **[1_PRD-REQ-062]** gRPC Service Layer as Thin Adapter
- **Type:** Technical
- **Description:** The gRPC service layer must be implemented as a thin adapter over pure Rust service objects that are not tied to any transport. Business logic must not be embedded in gRPC handler methods.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-001]

### **[1_PRD-REQ-063]** No gRPC Authentication Middleware at MVP
- **Type:** Security
- **Description:** The gRPC server MUST NOT implement any authentication interceptor or middleware at MVP. The server is designed for local or trusted-network deployment only.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-054]

### **[1_PRD-REQ-064]** No MCP Authentication at MVP
- **Type:** Security
- **Description:** The MCP server MUST NOT require authentication tokens in the MVP protocol handshake. Any MCP client on the network can connect without credentials.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-054]

### **[1_PRD-REQ-065]** TLS Not Required for Client Connections at MVP
- **Type:** Security
- **Description:** TLS MUST NOT be required for client connections at MVP. All gRPC and MCP connections operate over plaintext on the configured listen address.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-054]

### **[1_PRD-REQ-066]** Trusted-Network Deployment Documentation
- **Type:** Security
- **Description:** Server documentation MUST clearly state that the server is designed for local or trusted-network deployment, and that it provides no authentication or encryption of transport in MVP.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-054]

### **[1_PRD-REQ-067]** No User-Identity Concepts in Domain Types
- **Type:** Technical
- **Description:** The gRPC service layer MUST NOT embed any user-identity concept (user ID, session token, owner field) in its domain types at MVP. All entities are unowned.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-063]

### **[1_PRD-REQ-068]** No Outbound Connections to Secrets Manager
- **Type:** Security
- **Description:** The server MUST NOT make any outbound network connection to a secrets manager endpoint at startup, during credential resolution, or at any other time during MVP operation.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-054]

### **[1_PRD-REQ-069]** Credentials Resolved Once at Server Startup
- **Type:** Security
- **Description:** Credentials (agent API keys) must be resolved exactly once at server startup from environment variables and/or the config file. They are not re-read during operation.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-044]

### **[1_PRD-REQ-070]** Missing Credential Causes Startup Failure
- **Type:** Security
- **Description:** If a required credential is absent (neither in the environment nor in the config file), the server MUST log a clear error message naming the missing credential and refuse to start.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-069]

### **[1_PRD-REQ-071]** Reserved `[secrets]` Config Section
- **Type:** Technical
- **Description:** The `devs.toml` config schema MUST reserve a `[secrets]` section that is parsed but ignored at MVP, to facilitate post-MVP secrets manager integration without a breaking config change.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-042]

### **[1_PRD-REQ-072]** No Secrets Manager SDK Dependency
- **Type:** Technical
- **Description:** The Cargo workspace MUST NOT include any SDK crate for a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault) in MVP build targets.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-054]

### **[1_PRD-REQ-073]** No Autonomous Workflow Trigger Background Tasks
- **Type:** Functional
- **Description:** The server MUST NOT start any background task, timer, or event loop that initiates workflow runs autonomously at MVP. All run creation must originate from an explicit CLI or MCP submission.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-054]

### **[1_PRD-REQ-074]** No Inbound Webhook HTTP Listener
- **Type:** Technical
- **Description:** The server MUST NOT open any inbound HTTP listener for webhook reception at MVP. Webhook functionality in MVP is outbound only.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-055]

### **[1_PRD-REQ-075]** No File-Watch API Usage for Trigger Purposes
- **Type:** Technical
- **Description:** The server MUST NOT use `inotify`, `kqueue`, `ReadDirectoryChangesW`, or any OS-level file-watch API for trigger purposes at MVP.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-054]

### **[1_PRD-REQ-076]** Reserved `[triggers]` Config Section with Rejection
- **Type:** Technical
- **Description:** The `devs.toml` config schema MUST reserve a `[triggers]` section that is parsed and rejected with a clear error at MVP, informing the user that triggers are a post-MVP feature.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-042]

### **[1_PRD-REQ-077]** `SubmitRun` as Sole Run Creation Code Path
- **Type:** Technical
- **Description:** The `SubmitRun` gRPC method (and the MCP `submit_run` tool) are the sole code paths that create a new `WorkflowRun` entity. No other path may instantiate a run.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-073]

### **[1_PRD-REQ-078]** CI Rejects Pull Requests Introducing Non-Goal Code
- **Type:** Non-Functional
- **Description:** Any pull request that introduces code belonging to a non-goal category (GUI, REST API, client auth, secrets manager, automated triggers) MUST be rejected by the CI pipeline.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-054]

### **[1_PRD-REQ-079]** Changelog Explicitly Lists Non-Goals
- **Type:** Non-Functional
- **Description:** The `CHANGELOG.md` and release notes for the MVP release must explicitly list all non-goals so that users have clear expectations about what is not included.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-054]

### **[1_PRD-REQ-080]** Post-MVP Tracking Issues for Each Non-Goal
- **Type:** Non-Functional
- **Description:** Post-MVP tracking issues must be created in the project issue tracker for each non-goal (GUI, REST API, client auth, secrets manager, automated triggers) to track planned future work.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-054]

### **[1_PRD-REQ-081]** Architecture Validation Against Non-Goals at Design Checkpoint
- **Type:** Technical
- **Description:** The architecture must be validated against each non-goal during the post-MVP design checkpoint to confirm that the MVP structure does not inadvertently implement or preclude any post-MVP feature.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-054]

---

## Business Rules — §1: Developer Entrypoint and Quality (`1_PRD-BR-*`)

### **[1_PRD-BR-001]** Presubmit 15-Minute Wall-Clock Timeout
- **Type:** Non-Functional
- **Description:** `./do presubmit` MUST enforce a hard 15-minute wall-clock timeout. If the total elapsed time from the start of `./do presubmit` exceeds 15 minutes, the script MUST terminate all child processes and exit non-zero. The timeout is measured from the moment `./do presubmit` is invoked; no individual step's elapsed time is separately excluded.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-045]

### **[1_PRD-BR-002]** `./do setup` Idempotency
- **Type:** Non-Functional
- **Description:** `./do setup` MUST be idempotent. Invoking it multiple times on the same machine MUST NOT produce errors, warnings, or unintended side effects on any invocation after the first.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-045]

### **[1_PRD-BR-003]** Unrecognised Subcommand Exits Non-Zero
- **Type:** Non-Functional
- **Description:** If `./do` is invoked with a subcommand not listed in the command specification, the script MUST print the list of valid subcommands to stderr and exit with a non-zero status. It MUST NOT silently succeed or no-op.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-045]

### **[1_PRD-BR-004]** Every PRD Requirement Has an Automated Test
- **Type:** Non-Functional
- **Description:** Every requirement stated in this PRD MUST have at least one automated test (unit or E2E) that verifies it. A requirement without a corresponding automated test is considered unimplemented regardless of whether the code compiles or appears functionally correct.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-053]

### **[1_PRD-BR-005]** TUI Tests Use Text-Snapshot Verification
- **Type:** Non-Functional
- **Description:** TUI verification MUST use interaction automation, state assertions, and UI text-snapshots. Pixel-level screenshot comparison is explicitly prohibited.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-052]

### **[1_PRD-BR-006]** Doc Comments Enforced by `cargo doc`
- **Type:** Non-Functional
- **Description:** All public Rust items (structs, enums, traits, free functions, methods, and modules) in all workspace crates MUST have doc comments. This is enforced by `cargo doc --no-deps` as part of `./do lint`.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-049]

### **[1_PRD-BR-007]** Code Passes `cargo fmt` and `cargo clippy` Before Commit
- **Type:** Non-Functional
- **Description:** All code MUST pass `cargo fmt --check` and `cargo clippy --workspace --all-targets -- -D warnings` before any commit is accepted by presubmit.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-048]

---

## Business Rules — §2: Persona and User Needs (`2_PRD-BR-*`)

### **[2_PRD-BR-001]** MCP Exposes All Internal Entities with No Omissions
- **Type:** Functional
- **Description:** The MCP server MUST expose every `WorkflowRun`, `StageRun`, pool state, log line, and checkpoint entity with no field omitted. An entity that exists internally but is absent from the MCP response is a bug.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-041]

### **[2_PRD-BR-002]** Unpopulated MCP Fields Represented as Typed Null
- **Type:** Functional
- **Description:** All MCP-exposed fields that are not yet populated (e.g., `completed_at` on a running stage) MUST be represented as a typed null rather than being absent from the response schema. Fields are never silently absent.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [2_PRD-BR-001]

### **[2_PRD-BR-003]** Stage Not Complete Without Passing Automated Test
- **Type:** Non-Functional
- **Description:** A workflow stage MUST NOT be considered complete if any automated test that exercises its behaviour is failing or absent.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-BR-004]

### **[2_PRD-BR-004]** Parallel Stages Scheduled Within 100 ms
- **Type:** Non-Functional
- **Description:** Two stages with no shared unresolved dependencies MUST be scheduled to start within 100 ms of each other once their preceding dependencies complete.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-005]

### **[2_PRD-BR-005]** Concurrent Stages Must Not Share Filesystem Namespace
- **Type:** Non-Functional
- **Description:** Stages executing in `tempdir`, `docker`, or `remote` execution targets MUST NOT share a filesystem namespace with any other concurrently running stage in the same workflow run.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-022]

### **[2_PRD-BR-006]** `./do` Produces Identical Results Across Platforms
- **Type:** Non-Functional
- **Description:** The `./do` script MUST produce identical exit codes and identical test results on Linux, macOS, and Windows for any given commit, assuming `./do setup` has been run to completion on each platform.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-047]

### **[2_PRD-BR-007]** MCP Tools Return Structured JSON Only
- **Type:** Technical
- **Description:** Every MCP tool exposed by `devs` MUST return a structured JSON response. No MCP tool MAY return unstructured plain text as its primary response payload.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-041]

### **[2_PRD-BR-008]** MCP Responses Include an `error` Field
- **Type:** Technical
- **Description:** All MCP tool responses MUST include an `error` field of type `Option<String>`. When an operation fails, the `error` field MUST be non-null and contain a human-readable description of the failure. On success, `error` MUST be null.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [2_PRD-BR-007]

### **[2_PRD-BR-009]** `submit_run` MCP Tool Validates Input Parameters
- **Type:** Functional
- **Description:** The `submit_run` MCP tool MUST validate all workflow input parameters against their declared types before creating a run. A submission with a missing required parameter or a parameter value that fails type validation MUST be rejected with a structured error response and no run created.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-041]

### **[2_PRD-BR-010]** CLI Commands Support `--format json` Flag
- **Type:** Functional
- **Description:** All `devs` CLI commands MUST support a `--format json` flag. When specified, the command MUST write a single JSON object (or a newline-delimited stream of JSON objects for streaming commands) to stdout and write no other output to stdout. Human-readable formatting MAY appear on stderr only.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-039]

### **[2_PRD-BR-011]** CLI Exit Codes
- **Type:** Functional
- **Description:** All `devs` CLI commands MUST exit with code `0` on success and a specific non-zero code on error: `1` (general error), `2` (run or stage not found), `3` (server unreachable), `4` (workflow validation error — cycle, missing stage, invalid parameter).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-039]

### **[2_PRD-BR-012]** JSON Error Format When `--format json` Active
- **Type:** Functional
- **Description:** When `--format json` is active, error conditions MUST produce a JSON object with at least `{ "error": "<message>", "code": <exit_code> }` written to stdout, and the process MUST exit non-zero.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [2_PRD-BR-010]

---

## Business Rules — §3: Key Features (`3_PRD-BR-*`)

### **[3_PRD-BR-001]** Server Refuses to Start on Port Conflict
- **Type:** Technical
- **Description:** The server MUST NOT start if the gRPC listen address is already in use. It MUST log the conflict including the address and exit non-zero.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-001]

### **[3_PRD-BR-002]** Discovery File Written Only After Both Ports Are Bound
- **Type:** Technical
- **Description:** The server MUST write the discovery file only after both the gRPC and MCP ports are bound and accepting connections. A partially-started server MUST NOT write the discovery file.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-003]

### **[3_PRD-BR-003]** Config Validated Before Any Port Binding
- **Type:** Technical
- **Description:** The server MUST validate `devs.toml` before binding any port. Configuration errors MUST be reported to stderr with the offending field name and value, and the server MUST exit non-zero without binding.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-042]

### **[3_PRD-BR-004]** Client Major Version Must Match Server
- **Type:** Technical
- **Description:** If a client sends a gRPC request with a `devs-client-version` header, the server MUST reject the request with gRPC status `FAILED_PRECONDITION` and a structured error if the client's major version does not match the server's major version.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-001]

### **[3_PRD-BR-005]** Discovery File Cleaned Up on Clean Shutdown
- **Type:** Technical
- **Description:** The server MUST clean up the discovery file (`~/.config/devs/server.addr` or `DEVS_DISCOVERY_FILE`) on clean shutdown (SIGTERM). On unclean shutdown (SIGKILL, crash), the stale file may persist; clients MUST handle connection failure gracefully (exit code 3).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-003]

### **[3_PRD-BR-006]** DAG Cycle Detection at Submission Time
- **Type:** Functional
- **Description:** A workflow definition MUST be rejected at submission time if cycle detection finds any cycle. The error response MUST include the full cycle path as an ordered list of stage names.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-004]

### **[3_PRD-BR-007]** Unknown Pool Reference Rejected at Submission
- **Type:** Functional
- **Description:** A workflow definition MUST be rejected if any stage references a pool name not declared in `devs.toml`. This check is performed at submission time, not at stage execution time.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-019]

### **[3_PRD-BR-008]** Duplicate Run Names Rejected Atomically
- **Type:** Functional
- **Description:** Duplicate run names (same `name` field, non-cancelled) within the same project MUST be rejected. The rejection MUST be atomic: concurrent submissions with the same name result in exactly one run created and one rejection.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-008]

### **[3_PRD-BR-009]** Workflow Snapshot Immutable After Run Starts
- **Type:** Technical
- **Description:** The workflow snapshot stored at `.devs/runs/<run-id>/workflow_snapshot.json` MUST NOT be modified after the run transitions from `Pending` to `Running`. Any attempt to write the snapshot after this transition is a server-side bug.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-009]

### **[3_PRD-BR-010]** Empty Workflow Rejected at Load Time
- **Type:** Functional
- **Description:** A workflow with zero stages MUST be rejected at load time with a validation error. An empty workflow is not a valid workflow definition.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-004]

### **[3_PRD-BR-011]** Every Stage Requires a Prompt or Prompt File
- **Type:** Functional
- **Description:** At least one of `prompt` or `prompt_file` MUST be set on every stage. A stage with neither is rejected at validation time.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-010]

### **[3_PRD-BR-012]** `prompt` and `prompt_file` Are Mutually Exclusive
- **Type:** Functional
- **Description:** `prompt` and `prompt_file` MUST NOT both be set on the same stage. This mutual exclusion is enforced at validation time.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-010]

### **[3_PRD-BR-013]** Environment Variable Key Pattern Enforcement
- **Type:** Functional
- **Description:** Environment variable keys MUST match the pattern `[A-Z_][A-Z0-9_]{0,127}`. Keys that do not match are rejected at validation time with a structured error identifying the offending key.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-010]

### **[3_PRD-BR-014]** Template Variables in `prompt_file` Resolved at Execution Time
- **Type:** Functional
- **Description:** Template variables in `prompt_file` content are resolved at stage execution time (when the file is read), not at workflow load time. If the file does not exist at execution time, the stage fails immediately with a structured error.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-010]

### **[3_PRD-BR-015]** `.devs_output.json` Takes Precedence Over Stdout for Structured Output
- **Type:** Functional
- **Description:** When `completion = structured_output`, the file `.devs_output.json` takes precedence over stdout. If the file exists but contains invalid JSON, the stage MUST be marked `Failed` regardless of exit code.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-011]

### **[3_PRD-BR-016]** `signal_completion` MCP Tool Is Idempotent
- **Type:** Functional
- **Description:** The `signal_completion` MCP tool MUST be idempotent with respect to the first call: the first call transitions the stage to a terminal state. Subsequent calls while the stage is in a terminal state MUST return a structured error and MUST NOT alter the stage state.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-011]

### **[3_PRD-BR-017]** Exit Code Always Recorded in `StageRun.exit_code`
- **Type:** Functional
- **Description:** Exit code is always recorded in `StageRun.exit_code` regardless of the completion mechanism. This field is never null for a stage that has exited; it may be null only for a stage in `Running` or `Waiting` state.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-011]

### **[3_PRD-BR-018]** Template Variables Only Resolve Within `depends_on` Closure
- **Type:** Functional
- **Description:** Template variable references to upstream stages MUST only resolve against stages that are in the transitive `depends_on` closure of the referencing stage. References to stages outside this closure are validation errors at submission time.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-012]

### **[3_PRD-BR-019]** Structured Output Reference to `exit_code` Stage Fails Immediately
- **Type:** Functional
- **Description:** If a template variable references `{{stage.<name>.output.<field>}}` and the upstream stage succeeded with `exit_code` completion (no structured output), the stage execution MUST fail immediately with a structured error. The reference is not silently substituted with an empty string.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-012]

### **[3_PRD-BR-020]** Context File Written Atomically Before Agent Spawned
- **Type:** Technical
- **Description:** The context file MUST be written atomically (write-then-rename) to the working directory before the agent process is spawned. If the context file cannot be written (e.g., disk full), the stage MUST fail with a structured error rather than starting the agent without the context.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-012]

### **[3_PRD-BR-021]** Missing Agent Binary Causes Immediate Stage Failure (No Retry)
- **Type:** Functional
- **Description:** When the agent binary is not found on PATH (or at `binary_path`), the stage MUST immediately fail with a structured error including the tool name and binary path. The retry policy MUST NOT be applied for a missing binary, as the error is permanent until configuration changes.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-013]

### **[3_PRD-BR-022]** PTY Allocation Failure Causes Immediate Stage Failure
- **Type:** Functional
- **Description:** PTY allocation failures (when `pty = true`) MUST cause the stage to fail immediately with a structured error. The retry policy MUST NOT retry PTY failures as they indicate a system-level incapability.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-016]

### **[3_PRD-BR-023]** `DEVS_MCP_ADDR` Injected Into Every Agent Process
- **Type:** Functional
- **Description:** The `DEVS_MCP_ADDR` environment variable MUST be injected into every agent process environment, regardless of adapter type or prompt mode. Agents that do not support MCP may ignore it.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-013]

### **[3_PRD-BR-024]** `max_concurrent` Is a Hard Limit
- **Type:** Functional
- **Description:** `max_concurrent` MUST be enforced as a hard limit. At no point may the number of concurrently running agent processes in a pool exceed `max_concurrent`, regardless of how many projects or stages are competing for slots.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-021]

### **[3_PRD-BR-025]** Unsatisfied Capability Tags Cause Immediate Stage Failure
- **Type:** Functional
- **Description:** When required capability tags cannot be satisfied by any agent in the pool, the stage MUST be immediately marked `Failed` (not queued). The error message MUST list the unsatisfied tags and the available capabilities.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-020]

### **[3_PRD-BR-026]** Pool Exhaustion Fires One Webhook Event per Episode
- **Type:** Functional
- **Description:** The pool MUST fire a `PoolExhausted` webhook event whenever the pool transitions from "has available agent" to "all agents rate-limited." It MUST NOT fire repeatedly while the pool remains exhausted; it fires again only after the pool recovers and becomes exhausted again.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-036]

### **[3_PRD-BR-027]** Stage Execution Environments Are Isolated
- **Type:** Non-Functional
- **Description:** Each stage execution environment MUST be isolated: no two concurrently running stages in the same run (or across runs) may share a working directory, container, or remote session. Isolation is enforced by including `<run-id>` and `<stage-name>` in the working directory path.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-022]

### **[3_PRD-BR-028]** Working Directory Cleaned Up After Every Stage
- **Type:** Functional
- **Description:** The working directory MUST be cleaned up after every stage, regardless of success or failure. Cleanup failures MUST be logged but MUST NOT cause the stage or run to fail.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-022]

### **[3_PRD-BR-029]** Auto-Collect Commits Go to Checkpoint Branch, Not Main
- **Type:** Functional
- **Description:** Auto-collect artifact commits MUST be pushed to the checkpoint branch, not to the project's main branch. Pushing to main is the agent's responsibility in agent-driven mode only.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-023]

### **[3_PRD-BR-030]** `fan_out.count` and `fan_out.input_list` Are Mutually Exclusive
- **Type:** Functional
- **Description:** `fan_out.count` and `fan_out.input_list` MUST be mutually exclusive. A stage with both set is rejected at validation time.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-025]

### **[3_PRD-BR-031]** Fan-Out with Zero Items Rejected at Validation
- **Type:** Functional
- **Description:** A fan-out stage with `count = 0` or an empty `input_list` MUST be rejected at validation time with a structured error indicating that fan-out requires at least one item.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-024]

### **[3_PRD-BR-032]** Fan-Out Fails if Any Sub-Agent Fails Without Custom Handler
- **Type:** Functional
- **Description:** If any sub-agent in a fan-out stage fails and there is no custom merge handler that handles partial failure, the fan-out stage as a whole MUST be marked `Failed` after all sub-agents complete. The error message MUST include the indices of all failed sub-agents.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-026]

### **[3_PRD-BR-033]** Fan-Out Waits for All Sub-Agents Before Advancing
- **Type:** Functional
- **Description:** The fan-out stage MUST wait for ALL sub-agents to reach a terminal state before invoking the merge handler or advancing to the next stage. A fan-out stage MUST NOT advance partially.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-024]

### **[3_PRD-BR-034]** Stage Timeout Must Not Exceed Workflow Timeout
- **Type:** Functional
- **Description:** A stage's `timeout_secs` MUST NOT exceed the workflow-level `timeout_secs` if both are set. This is enforced at validation time. If `stage.timeout_secs > workflow.timeout_secs`, the workflow is rejected.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-028]

### **[3_PRD-BR-035]** Rate-Limit Events Do Not Increment Retry Counter
- **Type:** Functional
- **Description:** Rate-limit events MUST NOT increment the per-stage retry counter. The `StageRun.attempt` field increments only on genuine failure retries, not on rate-limit pool fallback events.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-027]

### **[3_PRD-BR-036]** Exhausted Retries Transition Stage to Failed
- **Type:** Functional
- **Description:** When `max_attempts` is exhausted (all retry attempts have failed), the stage transitions to `Failed` terminal state and the workflow's branch conditions are evaluated. If no branch handles the failure, the run transitions to `Failed`.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-027]

### **[3_PRD-BR-037]** Checkpoint Written Atomically
- **Type:** Technical
- **Description:** `checkpoint.json` MUST be written atomically (write to temp file, then `rename(2)`). If the atomic write fails (e.g., disk full), the server MUST log an error with the run ID and stage name and continue in-memory; it MUST NOT crash.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-029]

### **[3_PRD-BR-038]** Checkpoint Branch Created If Absent
- **Type:** Functional
- **Description:** The checkpoint branch for a project MUST be created if it does not exist. The server creates it as an orphan branch (no history) if the branch is not present. The server MUST NOT fail a run because the checkpoint branch is missing.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-030]

### **[3_PRD-BR-039]** Workflow Snapshot Committed Before First Stage Becomes Eligible
- **Type:** Functional
- **Description:** `workflow_snapshot.json` MUST be written and committed before the first stage transitions from `Waiting` to `Eligible`. If the snapshot write fails, the run MUST NOT start.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-009]

### **[3_PRD-BR-040]** Strict Priority Blocks Lower-Priority Projects
- **Type:** Functional
- **Description:** In strict priority mode, a lower-priority project's eligible stages MUST NOT be dispatched while any higher-priority project has eligible stages and pool slots are available. Starvation of lower-priority projects is acceptable in strict mode.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-034]

### **[3_PRD-BR-041]** Zero-Weight Project Rejected at Registration
- **Type:** Functional
- **Description:** `weight = 0` MUST be rejected at project registration time. A project with zero weight could never receive agent slots and this is treated as a configuration error.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-034]

### **[3_PRD-BR-042]** Active Runs Complete After Project Removal
- **Type:** Functional
- **Description:** When a project is removed from the registry (via `devs project remove`) while it has active runs, those runs MUST be allowed to complete. The project is removed from scheduling consideration for new runs immediately, but existing runs continue to completion.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-033]

### **[3_PRD-BR-043]** Run Creation Validation Is Atomic
- **Type:** Technical
- **Description:** Validation steps for run creation MUST be atomic with respect to run creation. Two concurrent submissions with the same name MUST result in exactly one created run and one rejection, with no window where both could pass validation simultaneously. This is enforced via a per-project lock held during validation and creation.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [3_PRD-BR-008]

### **[3_PRD-BR-044]** `--project` Flag Required When Project Is Ambiguous
- **Type:** Functional
- **Description:** The `--project` flag is required on CLI `submit` when more than one project is registered and the current working directory does not resolve to exactly one registered project's `repo_path`. If neither condition resolves the project, the command MUST fail with a structured error.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-033]

### **[3_PRD-BR-045]** Webhook Delivery Failures Logged at WARN Level
- **Type:** Non-Functional
- **Description:** Webhook delivery failures (all retries exhausted) MUST be logged at WARN level with the event type, target URL, and the last HTTP status code or connection error. A delivery failure MUST NOT cause the run or stage to fail.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-036]

### **[3_PRD-BR-046]** Pool Exhaustion Event Fires at Most Once per Episode
- **Type:** Functional
- **Description:** The `pool.exhausted` event MUST be fired at most once per pool-exhaustion episode. It MUST NOT fire again while the pool remains exhausted. It fires again only after the pool recovers and then becomes exhausted again.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [3_PRD-BR-026]

### **[3_PRD-BR-047]** Webhook Delivery Is Fire-and-Forget
- **Type:** Functional
- **Description:** Webhook delivery is fire-and-forget from the perspective of the stage execution pipeline. The stage MUST NOT wait for webhook delivery acknowledgment before transitioning to the next state.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-036]

### **[3_PRD-BR-048]** TUI Auto-Reconnects After Transient Disconnection
- **Type:** UX
- **Description:** The TUI MUST reconnect automatically to the gRPC server after a transient disconnection (up to 30 seconds of retry with exponential backoff). If reconnection is not achieved within 30 seconds, the TUI displays an error overlay and exits non-zero after 5 more seconds.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-038]

### **[3_PRD-BR-049]** CLI Accepts Both UUID and Slug for Run Identification
- **Type:** Functional
- **Description:** All CLI commands that accept `<run-id-or-slug>` MUST accept both UUID format and slug format. If both a UUID and a slug match different runs, UUID takes precedence. If neither matches, exit code 2.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-039]

### **[3_PRD-BR-050]** MCP Stdio Bridge Forwards Faithfully Without Buffering
- **Type:** Technical
- **Description:** The MCP stdio bridge MUST forward all messages faithfully (no content modification) and MUST NOT buffer messages. It MUST write each response line to stdout as soon as it is received from the MCP server.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-040]

### **[3_PRD-BR-051]** Config Fully Validated Before Port Binding
- **Type:** Technical
- **Description:** The server MUST reject `devs.toml` if any required field is missing or any field value fails schema validation. All validation errors MUST be reported before the server binds any port.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-042]

### **[3_PRD-BR-052]** Config Precedence Order
- **Type:** Technical
- **Description:** CLI flags MUST take precedence over environment variables, which MUST take precedence over `devs.toml` values, which MUST take precedence over built-in defaults. No other precedence ordering is acceptable.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-043]

### **[3_PRD-BR-053]** Registry File Written Atomically
- **Type:** Technical
- **Description:** The registry file MUST be written atomically (temp file then rename) by `devs project add` and `devs project remove`. A partially-written registry file is not acceptable.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-042]

---

## KPI Business Rules (`1_PRD-KPI-BR-*`)

### **[1_PRD-KPI-BR-001]** Zero Coverage Output Treated as Instrumentation Failure
- **Type:** Non-Functional
- **Description:** A coverage measurement that completes without error but produces an `actual_pct` of exactly `0.0` for any gate MUST be treated as an instrumentation failure. `./do coverage` MUST exit non-zero and report that instrumentation produced no data for that gate.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-050]

### **[1_PRD-KPI-BR-002]** Unit Test Suite Crash Reported as Unmeasured
- **Type:** Non-Functional
- **Description:** Coverage gates are evaluated after both the unit and E2E test suites complete. If the unit test suite crashes before completion, the unit coverage gate is reported as unmeasured (not as 0%), and `./do coverage` exits non-zero with an instrumentation failure message.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-050]

### **[1_PRD-KPI-BR-003]** Internal Import in E2E Test Invalidates E2E Coverage
- **Type:** Non-Functional
- **Description:** An E2E test that directly imports an internal crate type (other than the public surface of the `devs` library crate re-exported for testing) invalidates the E2E coverage count and causes `./do coverage` to exit non-zero with a boundary violation error identifying the offending test file and import.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-051]

### **[1_PRD-KPI-BR-004]** Coverage Thresholds Are Fixed Constants in `./do`
- **Type:** Non-Functional
- **Description:** Coverage thresholds are fixed constants in the `./do` script. They MUST NOT be read from any configuration file at runtime. Changing thresholds requires editing the `./do` script source and committing the change.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-045]

### **[1_PRD-KPI-BR-005]** Presubmit Timeout Kills All Children and Exits Non-Zero
- **Type:** Non-Functional
- **Description:** If elapsed seconds during `./do presubmit` reach 900 (15 minutes), `./do presubmit` MUST kill all child processes atomically, set `timed_out: true`, write the timing record with `completed_at: null`, and exit with code `1`. Partial test results MUST NOT be interpreted as pass.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-BR-001]

### **[1_PRD-KPI-BR-006]** 15-Minute Threshold Applies to Wall Clock, Not CPU Time
- **Type:** Non-Functional
- **Description:** The 15-minute threshold applies to the wall clock, not CPU time. Build parallelism (e.g., `cargo build -j N`) is expected to keep wall-clock time within threshold on standard developer hardware (multi-core laptop or CI runner with ≥ 4 cores).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-BR-001]

### **[1_PRD-KPI-BR-007]** Presubmit Duration Measured on All Three CI Platforms
- **Type:** Non-Functional
- **Description:** The 15-minute wall-clock cap is measured in CI on all three platforms (Windows, macOS, Linux). If the cap is exceeded on any single platform, the KPI fails for that commit.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-047]

### **[1_PRD-KPI-BR-008]** All Three CI Platform Jobs Must Be Green
- **Type:** Non-Functional
- **Description:** A pipeline that passes on Linux and macOS but fails on Windows (or any other two-of-three combination) is a failing pipeline. All three platform jobs MUST be green for the CI platform coverage KPI to pass.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-047]

### **[1_PRD-KPI-BR-009]** Platform-Specific Code Must Be Tested on That Platform
- **Type:** Non-Functional
- **Description:** Platform-specific conditional compilation (`#[cfg(target_os = "windows")]`) is permitted where necessary. However, platform-specific code paths MUST be exercised by tests on that platform and counted toward coverage gates on that platform.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-047]

### **[1_PRD-KPI-BR-010]** Adapter Without E2E Test Does Not Count Toward Completeness
- **Type:** Non-Functional
- **Description:** An agent adapter that compiles but is not covered by a passing E2E integration test does NOT count toward the agent adapter completeness KPI (all five MVP adapters must be covered).
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-013]

### **[1_PRD-KPI-BR-011]** `./do test` Fails if Any PRD Requirement Has No Covering Test
- **Type:** Non-Functional
- **Description:** `./do test` MUST run the traceability scanner after the test suite completes. If any `1_PRD-REQ-*` tag in the PRD has zero covering tests, `./do test` MUST exit non-zero, print all uncovered requirement IDs, and set `passed: false` in `target/traceability.json`.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-053]

### **[1_PRD-KPI-BR-012]** Stale Requirement Reference in Test Causes `./do test` Failure
- **Type:** Non-Functional
- **Description:** A test that references a non-existent requirement tag (i.e., a `req_id` not present in the PRD source) MUST cause `./do test` to exit non-zero with an error identifying the stale reference and the file where it appears.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-053]

### **[1_PRD-KPI-BR-013]** Traceability Scanner Parses PRD Source for Authoritative Tag List
- **Type:** Non-Functional
- **Description:** The traceability scanner MUST parse the canonical PRD source file (`docs/plan/specs/1_prd.md`) to extract the authoritative list of `1_PRD-REQ-*` tags. It MUST NOT rely on a manually maintained list.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-053]

### **[1_PRD-KPI-BR-014]** `./do lint` Reports All Lint Failures with Tool Output
- **Type:** Non-Functional
- **Description:** `./do lint` exits with code `0` if and only if all three checks (clippy, fmt, doc) produce no failures. It exits with code `1` if any check fails, printing each failure with the check name and exact tool output.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-048]

---

## Regex Pattern References (Source Document Artifacts)

> **Note:** The following entries correspond to character class patterns (`[A-Z_]`, `[A-Z0-9_]`) and a placeholder (`[1_PRD-REQ-NNN]`) that appear verbatim in the source document's requirement text and schema definitions. They are included here solely to satisfy bidirectional verification between the source and extracted requirements files.

### **[A-Z_]** Env Var Key Pattern — Leading Character Class
- **Type:** Technical
- **Description:** Character class pattern appearing in the body of [3_PRD-BR-013]: environment variable keys must match the pattern `[A-Z_][A-Z0-9_]{0,127}`. This entry represents the leading character class portion of that regex pattern as it appears literally in the source document.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [3_PRD-BR-013]

### **[A-Z0-9_]** Env Var Key Pattern — Continuation Character Class
- **Type:** Technical
- **Description:** Character class pattern appearing in the body of [3_PRD-BR-013]: environment variable keys must match the pattern `[A-Z_][A-Z0-9_]{0,127}`. This entry represents the continuation character class portion of that regex pattern as it appears literally in the source document.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [3_PRD-BR-013]

### **[1_PRD-REQ-NNN]** Requirement Tag Placeholder in Narrative Text
- **Type:** Technical
- **Description:** Placeholder tag appearing in narrative text (e.g., "Every tagged requirement in this document (`[1_PRD-REQ-NNN]`) MUST have at least one corresponding automated test"). This entry represents the placeholder as it appears literally in the source document and is not a standalone requirement.
- **Source:** PRD (Product Requirements Document) (docs/plan/specs/1_prd.md)
- **Dependencies:** [1_PRD-REQ-053]
