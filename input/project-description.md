# Project Description

`devs` is an AI agent workflow definer and orchestrator. Users define stages,
prompts, conditions, and decision trees to build complex agentic-development
workflows. It runs as a headless server with TUI, CLI, and MCP client
interfaces. A post-MVP GUI is planned but out of scope for the initial release.

`devs` is designed from the ground up to support agentic development of itself
and of user projects. It uses a "Glass-Box" philosophy: the MCP server exposes
the full internal state of the application so that AI agents can observe,
debug, profile, test, and control it.

---

## Workflow Definition

Workflows are directed acyclic graphs (DAGs) of stages. Each stage declares
which other stages it depends on. `devs` schedules stages automatically:
a stage becomes eligible to run as soon as all of its dependencies have
successfully completed. Stages with no unmet dependencies run in parallel.

```
# Example dependency graph (non-normative)

Task 1  ──┬──► Task 2 ─┐
           └──► Task 3 ─┴──► Task 4

Time 0: Task 1 starts (no dependencies).
Time 1: Task 1 completes → Task 2 and Task 3 are spawned in parallel.
Time 2: Task 2 and Task 3 complete → Task 4 is spawned.
```

This model is distinct from fan-out (which runs N copies of the same stage in
parallel). Dependency scheduling lets independently defined stages with
different prompts, pools, and configurations run concurrently whenever the
graph allows it.

Two authoring formats are supported:

### Rust Builder API

A typed Rust builder API for defining workflows programmatically. Stages,
conditions, fan-out, and routing are expressed as Rust code compiled against
the `devs` library crate. Conditional branching is expressed as Rust closures
that receive stage outputs and return the next stage identifier.

```rust
// Example sketch (non-normative)
Workflow::new("feature")
    .stage("plan", agent("claude").prompt("Plan the feature..."))
    .stage("implement-api",
        agent("opencode").prompt("Implement the API layer.").depends_on(["plan"]))
    .stage("implement-ui",
        agent("opencode").prompt("Implement the UI layer.").depends_on(["plan"]))
    // implement-api and implement-ui run in parallel once plan completes
    .stage("review",
        agent("gemini").prompt("Review the implementation...")
            .depends_on(["implement-api", "implement-ui"]))
    .branch(|ctx| match ctx.exit_code() {
        0 => "merge",
        _ => "plan",  // retry
    })
```

### Declarative Config (TOML / YAML)

A declarative format loaded by the server at runtime — no Rust compilation
required. Two branching mechanisms are available in declarative workflows:

- **Built-in predicates**: a small set of common conditions (`exit_code`,
  `stdout_contains`, `output_field`, etc.) that route to a named stage.
- **Named handlers**: a reference to a Rust function registered with the server
  at startup, used for logic that cannot be expressed as a built-in predicate.

```toml
# Example sketch (non-normative)
[workflow]
name = "feature"

[[stage]]
name    = "plan"
pool    = "claude"
prompt  = "Plan the feature described in TASK.md."
completion = "exit_code"

[[stage]]
name       = "implement-api"
pool       = "opencode"
prompt     = "Implement the API layer."
depends_on = ["plan"]
completion = "exit_code"

[[stage]]
name       = "implement-ui"
pool       = "opencode"
prompt     = "Implement the UI layer."
depends_on = ["plan"]
completion = "exit_code"
# implement-api and implement-ui are spawned in parallel once plan completes

[[stage]]
name       = "review"
pool       = "gemini"
prompt     = "Review the implementation and approve or reject."
depends_on = ["implement-api", "implement-ui"]
completion = "structured_output"

[stage.branch]
handler = "review_router"  # named Rust handler registered at startup
```

### Workflow Inputs

Workflows accept typed input parameters at submit time (strings, paths,
integers, etc.) that stages can reference in their prompts via template
variables. Parameters are declared in the workflow definition and validated
on submission.

### Run Identification

Each workflow run is identified by a user-provided name combined with a
UUID/human-readable slug to prevent duplicates. If no name is supplied at
submit time, a slug is auto-generated from the workflow name and a timestamp.

### Workflow Snapshotting

When a run starts, `devs` snapshots the workflow definition and stores it
alongside the checkpoint state. This ensures runs are reproducible even if
the live definition changes during execution.

---

## Stage Inputs

Each stage can supply the following inputs to the spawned agent:

| Input | Description |
|---|---|
| Prompt string | A text prompt, optionally containing `{{template}}` variables referencing workflow inputs or prior stage outputs. |
| Prompt file | A path to a file loaded at runtime and used as the prompt. |
| System prompt | A separate system-level prompt passed to the agent where supported. |
| Environment variables | Per-stage key-value pairs injected into the agent's process environment, in addition to inherited server environment variables. |

---

## Stage Completion Signals

How `devs` knows a stage is done is configurable per-stage. Three mechanisms
are supported:

| Mechanism | Description |
|---|---|
| `exit_code` | Zero = success, non-zero = failure. No structured output. |
| `structured_output` | Agent writes JSON to stdout or a known file. `devs` parses it to determine outcome and extract data for the next stage. |
| `mcp_tool_call` | The agent signals completion by invoking a `devs` MCP tool, optionally passing result data. Enables mid-run progress updates as well. |

---

## Data Flow Between Stages

Stage outputs flow to subsequent stages via three complementary mechanisms,
all of which are supported and can be combined:

- **Template variables**: stage outputs (structured JSON fields, exit codes,
  etc.) are available as named variables. Prompts and conditions reference
  them with `{{stage.<name>.<field>}}` syntax.
- **Context file**: the full output of prior stages is written to a context
  file that `devs` passes to the next agent.
- **Shared directory convention**: agents write outputs to a known location in
  the working directory; the next agent reads from it directly.

---

## Agent Tools

`devs` spawns agents by invoking CLI tools as subprocesses. Supported agent
CLIs at MVP:

- **claude** (Claude Code)
- **gemini** (Gemini CLI)
- **opencode** (OpenCode)
- **qwen** (Qwen CLI)
- **copilot** (GitHub Copilot CLI)

The adapter layer is designed to be extensible so that new CLI tools can be
added without restructuring the core.

### Agent Invocation

How `devs` passes prompts and context to an agent is configured per adapter:

- **Flag-based**: the prompt is passed as a command-line flag (e.g.,
  `claude -p "..."`).
- **File-based**: the prompt is written to a temporary file and its path is
  passed to the agent.

### PTY Mode

Each agent adapter can be configured to run the agent inside a PTY so the
process believes it is operating in an interactive terminal. This is required
for agent CLIs that behave differently in non-interactive environments.

### Bidirectional Mid-Run Interaction

`devs` supports two-way communication with running agents:

- **Agent → devs**: agents can call `devs` MCP tools mid-run to report
  progress, request context, or signal partial completion.
- **devs → agent**: `devs` can push updates (e.g., cancel signals, updated
  instructions) to a running agent via stdin or via MCP push notifications,
  depending on the adapter.

### Rate Limit Detection

`devs` detects agent rate limits through two complementary mechanisms:

- **Passive**: the adapter watches agent exit codes and stderr output for
  known rate-limit error patterns.
- **Active**: agents can call a `devs` MCP tool to proactively report a
  rate-limit condition, triggering an immediate pool fallback.

---

## Agent Pools

An Agent Pool is a named, ordered collection of agent configurations used to
route work, enforce concurrency, and provide fallback. Pools are shared across
all projects managed by the server.

### Routing

Pools support two complementary routing mechanisms:

- **Fallback order**: agents are tried in priority order; the next agent is
  tried if the current one fails due to error, rate-limit, or service outage.
- **Capability tags**: agents can be tagged with capabilities (e.g.,
  `code-gen`, `review`, `long-context`). Stages can require one or more tags
  and the pool selects only agents that satisfy them, in priority order.

### Concurrency

Each pool has a configurable maximum number of concurrently running agents,
independent of pool size.

### Pool Config Example

```toml
# Example pool config (non-normative)
[[pool]]
name        = "primary"
max_concurrent = 4

  [[pool.agent]]
  tool         = "claude"
  capabilities = ["code-gen", "review", "long-context"]

  [[pool.agent]]
  tool         = "opencode"
  capabilities = ["code-gen"]
  fallback     = true

  [[pool.agent]]
  tool         = "gemini"
  capabilities = ["code-gen", "review"]
  fallback     = true
```

---

## Execution Environments

The filesystem and process environment for an agent stage is configurable
per-stage (or inherited from a workflow-level default). Three execution targets
are supported at MVP:

| Target | Description |
|---|---|
| `tempdir` | A temporary directory on the local machine. The project repo is cloned into it before the stage runs. |
| `docker` | A Docker container. Supports full `DOCKER_HOST` configuration for local or remote daemons. The project repo is cloned into the container before the stage runs. |
| `remote` | A remote machine accessed via SSH. Supports full `ssh_config` for connection configuration. The repo is cloned onto the remote machine; agents are spawned there. |

### Artifact Collection

After a stage completes, how the agent's work is persisted back to the project
repo is configurable per-workflow:

- **Agent-driven**: agents are instructed (via prompt) to commit and push their
  own changes using git.
- **Auto-collect**: `devs` diffs the working directory after the stage
  completes, commits any changes, and pushes them back to the project repo.

---

## Parallelism (Fan-Out)

A stage can fan out across multiple agents running in parallel. `devs` manages
spawning, monitoring, and collecting results from all parallel agents before
advancing to the next stage.

Fan-out is available in both authoring formats:

- **Rust builder API**: a closure returns an iterator of agent configurations.
- **Declarative format**: a `fan_out` count or an explicit input list.

### Fan-Out Merge

After all parallel agents complete, results are merged before the next stage:

- **Default**: results are collected into an array and passed as structured
  input to the next stage.
- **Custom merge handler**: a Rust closure (builder API) or named handler
  (declarative format) reduces the parallel results before advancing.

---

## Retry and Timeouts

### Retry

Stage failure can trigger retry through two complementary mechanisms:

- **Per-stage retry config**: a stage declares a max retry count and backoff
  strategy. `devs` automatically retries before triggering the error branch.
- **Branch loopback**: the workflow graph's error branch routes back to the
  failed stage.

Both mechanisms can be used together.

### Timeouts

Timeouts can be specified at two levels:

- **Per-stage**: if the agent does not complete within the configured duration,
  `devs` sends a cancel signal and marks the stage as failed.
- **Workflow-level**: a global cap on the total run duration.

---

## State Persistence

Workflow execution state (checkpoints) and workflow definition snapshots are
committed to the project's git repository inside a `.devs/` directory. The
target branch is configurable:

- **Working branch**: checkpoints are committed directly alongside project code.
- **Dedicated state branch**: checkpoints are committed to a separate,
  configurable branch (e.g., `devs/state`) to keep them isolated from project
  history.

This ensures:

- In-flight workflow runs survive a server crash or restart.
- State is version-controlled and inspectable by AI agents working on the project.
- Workflow runs are reproducible (definition snapshot is stored with checkpoint).

Log retention is configurable via a policy (max age and/or max size). Logs are
persisted alongside checkpoints in the project repo.

---

## Multi-Project Support

A single `devs` server instance manages multiple projects simultaneously. The
shared agent pool services all projects.

### Project Priority

When multiple projects compete for agent slots, the scheduling policy is
configurable:

- **Strict priority queue**: higher-priority projects always get first access
  to available agents.
- **Weighted fair queuing**: agent slots are allocated proportionally to
  per-project weights.

Users assign priority or weight to each registered project.

---

## Workflow Triggers

In MVP, workflow runs are triggered manually:

- **CLI**: `devs submit <workflow> [--name <run-name>] [--input key=value ...]`
- **MCP tool call**: an AI agent submits a run via the `devs` MCP interface.

Scheduled (cron), inbound webhook, and file-watch triggers are post-MVP.

---

## Webhooks and Notifications

`devs` delivers outbound webhook notifications for configurable event types:

| Event class | Description |
|---|---|
| Run lifecycle | Workflow run started, completed, or failed. |
| Stage lifecycle | Individual stage started, completed, or failed. |
| Pool exhaustion | All agents in a pool are unavailable. |
| All state changes | Fire on every internal state transition. |

Notification targets and subscribed event types are configured per-project in
the server config.

---

## Interfaces

### Headless Server (gRPC)

The `devs` server runs as a background process and exposes a gRPC API. All
client interfaces connect over gRPC, enabling remote access from TUI, CLI,
and MCP clients on other machines.

### Server Discovery

Clients locate the server via:

1. **Explicit address**: a `--server` flag or `server_addr` config key.
2. **Auto-discovery**: if no explicit address is given, the client reads the
   server's address from a well-known file (`~/.config/devs/server.addr`)
   written by the server at startup. For testing, auto-discovery uses an
   isolated mechanism to avoid address conflicts between parallel server
   instances.

Explicit address takes precedence over auto-discovery.

### TUI Client

An interactive terminal dashboard that connects to the server over gRPC
(local or remote). The TUI layout combines tabbed views and split panes:

- **Dashboard tab**: split pane — project/run list on the left, selected run
  detail (stage graph, per-stage status, elapsed time, live log tail) on the right.
- **Logs tab**: full log stream for a selected stage or run.
- **Debug tab**: follow a specific agent's progress; inspect a diff of its
  working directory; send cancel/pause/resume signals.
- **Pools tab**: real-time view of pool utilization, agent availability, and
  fallback events.

### CLI Interface

A command-line client for scripting, CI integration, and headless operation.
MVP commands:

| Command | Description |
|---|---|
| `devs submit` | Submit a workflow run with optional name and input parameters. |
| `devs list` | List active and historical workflow runs. |
| `devs status <run>` | Show the current status of a run and its stages. |
| `devs logs <run> [stage]` | Stream or fetch logs for a run or specific stage. |
| `devs cancel <run>` | Cancel a running workflow. |
| `devs pause <run/stage>` | Pause a run or individual stage. |
| `devs resume <run/stage>` | Resume a paused run or stage. |

### MCP Server (Glass-Box Interface)

`devs` exposes a dedicated MCP server on a separate port. An MCP stdio bridge
client is also provided, allowing AI agents to connect via stdio (the bridge
forwards to the MCP port). This is the primary interface for agentic
development of `devs` itself.

MCP capabilities at MVP:

- Observe agent state, stage outputs, and logs
- Pause, resume, retry, or cancel individual agents or stages
- Read and write workflow definitions at runtime
- Inject test inputs and assert on stage outputs for automated testing and
  performance monitoring

---

## Server Configuration

The server is configured via a single TOML file. CLI flags and environment
variables can override any config file value. Configuration is split into two
parts:

- **Main config file** (`devs.toml`): server settings (listen address, MCP
  port, default pool, scheduling policy, webhook targets, credential entries,
  etc.) and pool definitions.
- **Project registry**: projects are registered via `devs project add` CLI
  command and stored in a separate registry file managed by `devs`. Each
  project entry records the repo path, priority/weight, checkpoint branch, and
  workflow search paths.

### Credentials

Agent CLI API keys can be supplied via:

- **Environment variables** on the server process (preferred).
- **TOML config entries** (supported with a documented security caveat).

`devs` does not integrate with an external secrets manager in MVP.

---

## High Level Features

- Headless gRPC server with TUI, CLI, and MCP client interfaces
- Remote client connections — TUI/CLI/MCP can attach to a server on any machine
- Rust builder API for programmatic workflow DAG definition
- Declarative TOML/YAML format with built-in predicates and named branch handlers
- Workflow runtime input parameters with template variable interpolation in prompts
- Named agent pools with priority fallback, capability-based routing, and concurrency limits
- Support for Claude Code, Gemini CLI, OpenCode, Qwen, and Copilot at MVP; extensible adapter layer
- Per-stage configurable completion signals: exit code, structured output, MCP tool call
- Bidirectional mid-run agent interaction: agent → devs via MCP, devs → agent via stdin or MCP push
- PTY mode for agent CLIs that require an interactive terminal
- Per-stage configurable execution environments: tempdir, Docker (DOCKER_HOST), remote SSH (ssh_config)
- Configurable artifact collection: agent-driven commit/push or auto-collect by devs
- Dependency-driven DAG scheduling — stages declare `depends_on` lists; eligible stages run in parallel automatically
- Fan-out: parallel agent execution within a single workflow stage
- Configurable fan-out merge: default array join or custom merge handler
- Per-stage and workflow-level timeout enforcement
- Per-stage retry config and/or branch-loopback retry
- Git-backed checkpoint and log persistence with configurable retention policy
- Configurable checkpoint branch: working branch or dedicated state branch
- Workflow definition snapshotting for reproducible runs
- User-provided run names with UUID/slug deduplication
- Multi-project support with shared agent pool and configurable priority scheduling
- Outbound webhooks and notifications for configurable event types
- Auto-discovery of server address via well-known file, with explicit override
- Glass-Box MCP server exposing full internal state for agentic development, testing, and profiling

---

## Non-Goals (MVP)

- No GUI (post-MVP)
- No web API / REST interface (post-MVP)
- No client authentication (post-MVP; server is designed for local / trusted-network use in MVP)
- No external secrets manager integration (post-MVP)
- No automated workflow triggers (cron, inbound webhook, file-watch) — manual submission only

---

## Tech Stack

- **Rust** — server, TUI client, MCP server, CLI interface
- **gRPC** — transport between server and all clients
- All components ship as a single Cargo workspace

---

## User Journeys

### The Developer of `devs`

As the sole developer of `devs`, I want to develop exclusively using agentic AI
tools. From the start, the project should support agentic development through
its Glass-Box architecture: AI agents can observe and manipulate the full
internal state of the application via MCP. MCP is a first-class interface,
designed specifically for agents to debug, profile, test, and configure the
application.

I want a strong, stable MVP first, with design checkpoints to plan post-MVP
features.

**Development standards:**

- All verification is automated through unit and E2E tests.
- TUI verification uses interaction, state assertions, and UI text-snapshots (not pixel snapshots).
- Every requirement is verified by an automated test.
- All code is auto-formatted and linted.
- All code is documented with doc comments.
- All code achieves 90% line coverage from unit tests.
- All code achieves at least 80% line coverage through E2E tests (separately from unit test coverage).
  - E2E tests are defined as test which must go through the external user interfaces (CLI, TUI, and MCP).
  - Each interface (TUI, CLI, MCP) must individually achieve at least 50% line coverage through E2E tests.

**Entrypoint script** (`./do`) is available from the first commit:

| Command | Description |
|---|---|
| `./do setup` | Install all dev dependencies |
| `./do build` | Build for release |
| `./do test` | Run all tests |
| `./do lint` | Run all linters |
| `./do format` | Run all formatters |
| `./do coverage` | Run all coverage tools |
| `./do presubmit` | Run setup, format, lint, test, coverage, then `./do ci`. Enforces a 15-minute timeout. |
| `./do ci` | Copy working directory to a temporary commit and run all presubmit checks on CI runners. |

Successful presubmit checks gate all commits and forward progress.

**CI/CD:** GitLab pipelines run all presubmit checks. The pipeline is validated
on Windows, macOS, and Linux machines.

**Parallel development:** Tasks are broken into small, independent chunks.
Each task description clearly identifies its dependencies so that multiple AI
agents can work in parallel without conflict.
