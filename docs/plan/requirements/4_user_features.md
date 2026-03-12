### **[4_USER_FEATURES-TOC-BR-001]** Every `[4_USER_FEATURES-FEAT-*]` tag in this document is a normative requirement
- **Type:** UX
- **Description:** Every `[4_USER_FEATURES-FEAT-*]` tag in this document is a normative requirement. Implementation
is not complete until all tagged requirements are covered by automated tests.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-TOC-BR-002]** Every `[4_USER_FEATURES-FEAT-BR-*]` tag denotes a business rule stated as a concrete, testable
- **Type:** Technical
- **Description:** Every `[4_USER_FEATURES-FEAT-BR-*]` tag denotes a business rule stated as a concrete, testable
assertion. Business rules in subsections override any contradicting descriptive prose.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-TOC-BR-003]** The Quick-Reference tables in this ToC are informational summaries
- **Type:** UX
- **Description:** The Quick-Reference tables in this ToC are informational summaries. The normative
definitions are in §6 (Data Models) and §7 (API Contracts). On conflict, §6/§7 govern.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-TOC-BR-004]** All schemas in §6 and §7 define the complete set of fields
- **Type:** Functional
- **Description:** All schemas in §6 and §7 define the complete set of fields. No field may be added
to a response without a corresponding update to the schema and a new `[4_USER_FEATURES-FEAT-*]` tag.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-TOC-BR-005]** All acceptance criteria in §10 must have a corresponding automated test reachable
- **Type:** UX
- **Description:** All acceptance criteria in §10 must have a corresponding automated test reachable
through at least one external interface (CLI, TUI, or MCP). Tests that exercise internal Rust
functions directly do not satisfy acceptance criteria for E2E coverage gates QG-003, QG-004, QG-005.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-TOC-BR-006]** The state machine diagrams in §8 are normative
- **Type:** Functional
- **Description:** The state machine diagrams in §8 are normative. Every arrow represents a legal
transition; any transition not shown is illegal and MUST be rejected by `StateMachine::transition()`
returning `TransitionError::IllegalTransition`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-TOC-BR-007]** This document tracks all user-facing requirements
- **Type:** UX
- **Description:** This document tracks all user-facing requirements. Implementation-internal
constraints (crate boundaries, lock ordering, concurrency model) are specified in `2_TAS.md`.
When this document and `2_TAS.md` conflict on a user-observable behavior, this document governs.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-001]** The system serves two distinct user personas whose interaction patterns and trust
- **Type:** UX
- **Description:** The system serves two distinct user personas whose interaction patterns and trust
levels differ fundamentally:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-001]** The Human Developer's experience MUST be identical on Linux, macOS, and Windows
- **Type:** UX
- **Description:** The Human Developer's experience MUST be identical on Linux, macOS, and Windows
(Git Bash). All `./do` script commands MUST produce identical exit codes and output formats on all
three platforms. Platform-specific behavior that alters exit codes or output schemas is a defect.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-002]** The TUI MUST operate correctly in any terminal that supports ANSI escape codes at
- **Type:** UX
- **Description:** The TUI MUST operate correctly in any terminal that supports ANSI escape codes at
a minimum size of 80 columns × 24 rows. Rendering MUST NOT depend on Unicode-only box characters;
all stage boxes and DAG connectors MUST use ASCII characters only.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-003]** The Human Developer MUST NOT be required to have any agent CLI binary (claude,
- **Type:** UX
- **Description:** The Human Developer MUST NOT be required to have any agent CLI binary (claude,
gemini, opencode, qwen, copilot) installed on their local machine when they are using `devs` only
as a scheduler connected to remote execution environments. Agent binaries are required only on the
machine where stages execute.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-002]** AI Agent Clients are software processes — not humans — that interact with `devs`
- **Type:** UX
- **Description:** AI Agent Clients are software processes — not humans — that interact with `devs`
programmatically. All communication is machine-to-machine via MCP JSON-RPC or CLI. AI Agent Clients
have two sub-roles that are distinguished by their execution context and have strictly separated
tool access:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-004]** An Orchestrated Agent MUST call `signal_completion` before exiting if the
- **Type:** Technical
- **Description:** An Orchestrated Agent MUST call `signal_completion` before exiting if the
stage's `completion` field is `mcp_tool_call`. Exiting without this call causes the stage to be
evaluated by exit code fallback, which may produce an incorrect outcome.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-005]** An Orchestrated Agent MUST write `
- **Type:** Functional
- **Description:** An Orchestrated Agent MUST write `.devs_output.json` with `{"success": <bool>}`
before exiting if the stage's `completion` field is `structured_output`. Writing a file that omits
the `"success"` key or uses a non-boolean value (e.g., `"true"` as a string) causes the stage to
transition to `Failed`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-006]** An Orchestrated Agent MUST exit within 10 seconds of receiving `devs:cancel\n`
- **Type:** Functional
- **Description:** An Orchestrated Agent MUST exit within 10 seconds of receiving `devs:cancel\n`
on stdin. Failure to exit within this window triggers SIGTERM followed by SIGKILL.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-007]** An Orchestrated Agent MUST NOT use `submit_run`, `cancel_run`, `pause_run`,
- **Type:** Technical
- **Description:** An Orchestrated Agent MUST NOT use `submit_run`, `cancel_run`, `pause_run`,
`resume_run`, `write_workflow_definition`, `inject_stage_input`, or `assert_stage_output`. These
tools are reserved for Observing/Controlling Agents. Calling them from within a stage subprocess is
a usage error; the MCP server does not enforce this restriction at the transport layer, but the
calling agent must not rely on this.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-008]** An Observing/Controlling Agent MUST check `list_runs` for existing non-terminal
- **Type:** UX
- **Description:** An Observing/Controlling Agent MUST check `list_runs` for existing non-terminal
runs before calling `submit_run` for the same workflow. Submitting a duplicate run name returns
`already_exists:` and the agent MUST handle this error without creating ambiguity about which run
is active.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-009]** An Observing/Controlling Agent MUST use `stream_logs` with `follow: true` to
- **Type:** Functional
- **Description:** An Observing/Controlling Agent MUST use `stream_logs` with `follow: true` to
monitor active stages. Polling `get_run` in a loop with intervals shorter than 1 second is
prohibited. If `stream_logs` fails, the agent MAY fall back to polling `get_run` with a minimum
1-second interval and a maximum of 120 polls before treating the stage as unresolvable.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-011]** The MCP server MUST NOT enforce tool-level restrictions based on agent role at
- **Type:** Technical
- **Description:** The MCP server MUST NOT enforce tool-level restrictions based on agent role at
MVP. Role enforcement is a behavioral contract for implementing agents, not a server-side access
control mechanism. Post-MVP authentication may introduce enforcement.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-003]** Features are grouped into nine categories
- **Type:** UX
- **Description:** Features are grouped into nine categories. Each category is delivered through
specific interfaces and has bounded scope. The table below is the authoritative mapping; no feature
may span categories without an explicit cross-reference in both.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-012]** Category 9 (Server Configuration) is a prerequisite for all other categories
- **Type:** UX
- **Description:** Category 9 (Server Configuration) is a prerequisite for all other categories.
The server MUST NOT accept connections until configuration parsing and port binding complete
successfully. If configuration is invalid, no other category is accessible.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-013]** Category 7 (Development Lifecycle) operates independently of the running server
- **Type:** UX
- **Description:** Category 7 (Development Lifecycle) operates independently of the running server
for `./do build`, `./do lint`, and `./do format`. Only `./do test` (E2E tests) and `./do coverage`
require a running server instance. The `./do` script MUST manage its own server lifecycle for E2E
test execution.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-014]** TOML and YAML workflow definitions MUST be functionally equivalent; every field
- **Type:** UX
- **Description:** TOML and YAML workflow definitions MUST be functionally equivalent; every field
available in TOML is available in YAML with identical semantics. No feature is exclusive to one
declarative format.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-015]** The Rust builder API produces a `WorkflowDefinition` value identical in schema
- **Type:** UX
- **Description:** The Rust builder API produces a `WorkflowDefinition` value identical in schema
to one parsed from TOML/YAML. There is no builder-exclusive field or behavior.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-016]** A workflow definition file MUST be validated in full before any stage in that
- **Type:** Functional
- **Description:** A workflow definition file MUST be validated in full before any stage in that
workflow is dispatched. Validation runs all 13 checks listed in §6.1 in a single pass, collecting
all errors before returning. Partial validation (stopping at first error) is prohibited.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-017]** Submission validation is atomic and all-or-nothing: all 7 validation steps
- **Type:** UX
- **Description:** Submission validation is atomic and all-or-nothing: all 7 validation steps
(workflow exists, inputs valid, no active duplicate name, inputs type-coerced, no extra input keys,
required inputs present, server not shutting down) complete before any run record is created. A
failure in any step produces no side effects.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-018]** Run name uniqueness is scoped to a project
- **Type:** Functional
- **Description:** Run name uniqueness is scoped to a project. Two runs with the same name in
different projects are permitted. Two runs with the same name in the same project are rejected
unless the existing run is in `Cancelled` status.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-019]** If `--name` is not provided at submission, the server generates a slug in the
- **Type:** Functional
- **Description:** If `--name` is not provided at submission, the server generates a slug in the
format `<workflow-name>-<YYYYMMDD>-<4 random lowercase alphanum>`, maximum 128 characters, matching
`[a-z0-9-]+`. The slug is auto-generated once and is included in the successful submission response.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-020]** Every field in the monitoring data hierarchy MUST be present in every API
- **Type:** Functional
- **Description:** Every field in the monitoring data hierarchy MUST be present in every API
response. Fields that are not yet populated (e.g., `completed_at` for a running stage) MUST be
JSON `null`, not absent from the response object.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-021]** The TUI Dashboard MUST re-render within 50 milliseconds of receiving a
- **Type:** UX
- **Description:** The TUI Dashboard MUST re-render within 50 milliseconds of receiving a
`RunEvent` from the server's `StreamRunEvents` gRPC stream. Rendering is event-driven, not
timer-driven.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-022]** `devs list` without filters returns the 100 most-recently-created runs across
- **Type:** Functional
- **Description:** `devs list` without filters returns the 100 most-recently-created runs across
all projects, sorted by `created_at` descending. The response does NOT embed `stage_runs`; use
`devs status <run-id>` to retrieve stage detail.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-023]** Stage boxes MUST be connected by ASCII arrows (`──►`) that reflect the
- **Type:** Functional
- **Description:** Stage boxes MUST be connected by ASCII arrows (`──►`) that reflect the
`depends_on` relationships. A stage with no `depends_on` is drawn at the leftmost column. Stages
that share a common dependency are drawn on the same column tier.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-024]** `cancel_run` MUST transition all non-terminal `StageRun` records to `Cancelled`
- **Type:** UX
- **Description:** `cancel_run` MUST transition all non-terminal `StageRun` records to `Cancelled`
in a single atomic checkpoint write. It is not permissible to transition stages one-by-one across
multiple checkpoint writes.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-025]** `pause_run` sends `devs:pause\n` to all currently `Running` stage processes via
- **Type:** Functional
- **Description:** `pause_run` sends `devs:pause\n` to all currently `Running` stage processes via
stdin. Stages in `Eligible` or `Waiting` state are held (not dispatched) until the run is resumed.
The run status transitions to `Paused`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-026]** `resume_run` sends `devs:resume\n` to all `Paused` stage processes and resumes
- **Type:** Functional
- **Description:** `resume_run` sends `devs:resume\n` to all `Paused` stage processes and resumes
dispatching for all `Eligible` stages that were held. The run status transitions back to `Running`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-027]** Control tools MUST reject illegal state transitions with
- **Type:** Functional
- **Description:** Control tools MUST reject illegal state transitions with
`failed_precondition: <current-state> cannot transition to <target-state>`. The state is not
modified on rejection.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-028]** `devs logs <run> [<stage>]` without `--follow` prints all available log lines
- **Type:** Functional
- **Description:** `devs logs <run> [<stage>]` without `--follow` prints all available log lines
for the run or stage to stdout, then exits with code 0.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-029]** `devs logs <run> [<stage>] --follow` streams log lines as they are produced
- **Type:** UX
- **Description:** `devs logs <run> [<stage>] --follow` streams log lines as they are produced.
When the run (or stage) reaches a terminal state, the stream is closed. Exit code is 0 if the run
`Completed`, 1 if the run `Failed` or `Cancelled`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-030]** `get_stage_output` returns `stdout` and `stderr` as UTF-8 strings, each capped
- **Type:** Functional
- **Description:** `get_stage_output` returns `stdout` and `stderr` as UTF-8 strings, each capped
at 1 MiB (1,048,576 bytes). If truncated, `truncated: true` is set. Truncation removes the
beginning of the stream (oldest output), preserving the most recent content.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-031]** `stream_logs` with `follow: true` on a stage in `Pending`, `Waiting`, or
- **Type:** Functional
- **Description:** `stream_logs` with `follow: true` on a stage in `Pending`, `Waiting`, or
`Eligible` state holds the HTTP connection open until the stage starts running. If the stage never
starts (e.g., cancelled before dispatch), the server returns `{"done": true, "truncated": false,
"total_lines": 0}`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-032]** `get_pool_state` returns a snapshot of pool state at the instant of the call
- **Type:** Functional
- **Description:** `get_pool_state` returns a snapshot of pool state at the instant of the call.
The snapshot includes, for each pool: `name`, `max_concurrent`, `active_count`, `queued_count`,
and for each agent: `tool`, `capabilities`, `fallback`, `pty`, `rate_limited_until` (RFC 3339 or
null).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-033]** The TUI Pools tab MUST display pool utilization as a live view, updated on each
- **Type:** UX
- **Description:** The TUI Pools tab MUST display pool utilization as a live view, updated on each
`WatchPoolState` gRPC event. At minimum, it shows: pool name, active/max ratio, queued count, and
per-agent availability.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-034]** A `pool
- **Type:** Functional
- **Description:** A `pool.exhausted` webhook event fires at most once per exhaustion episode.
An exhaustion episode begins when the last available agent becomes unavailable (rate-limited or
failed). The episode ends when at least one agent becomes available. Only one `pool.exhausted`
event is fired per episode regardless of how many stages are queued.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-035]** `
- **Type:** Technical
- **Description:** `./do presubmit` enforces a hard 15-minute wall-clock timeout. If any step does
not complete within 15 minutes total, all child processes are killed and the script exits with
code 1. The timeout is measured from the first step starting, not from when the script is invoked.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-036]** `
- **Type:** UX
- **Description:** `./do setup` is idempotent. Running it multiple times MUST produce the same
result as running it once. It MUST NOT fail if the required tools are already at the correct
version.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-037]** `
- **Type:** UX
- **Description:** `./do test` generates `target/traceability.json` and exits non-zero if
`overall_passed` is false, even when all `cargo test` tests pass. Requirement coverage failures
are reported as test failures.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-038]** `
- **Type:** Functional
- **Description:** `./do coverage` generates `target/coverage/report.json` with exactly five gates
(QG-001 through QG-005). The file's `overall_passed` field is the logical AND of all five
individual gate `passed` fields.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-039]** `
- **Type:** Functional
- **Description:** `./do lint` includes a dependency audit that verifies all crates in the
workspace match the authoritative version table in §2 of the TAS. An undocumented crate dependency
causes `./do lint` to exit non-zero.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-040]** The Glass-Box MCP server MUST be operational from the first commit at which the
- **Type:** Technical
- **Description:** The Glass-Box MCP server MUST be operational from the first commit at which the
server binary can start. No feature flag controls MCP availability; it is always active when the
server is running with a bound MCP port.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-041]** Every internal entity (runs, stages, pools, workflow definitions, checkpoints)
- **Type:** Technical
- **Description:** Every internal entity (runs, stages, pools, workflow definitions, checkpoints)
MUST be fully observable via MCP tools with no field omitted or summarized. The MCP view is
identical to the in-process `Arc<RwLock<ServerState>>`; there is no separate representation.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-042]** AI agents implementing `devs` MUST follow the Red-Green-Refactor TDD loop:
- **Type:** Functional
- **Description:** AI agents implementing `devs` MUST follow the Red-Green-Refactor TDD loop:
(1) write a failing test with a `// Covers: <REQ-ID>` annotation, (2) verify the test fails
(exit code 1), (3) implement the minimum code to make it pass, (4) run `presubmit-check` workflow,
(5) proceed only after all gates pass.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-043]** Standard workflow definitions for agentic development (`tdd-red`, `tdd-green`,
- **Type:** UX
- **Description:** Standard workflow definitions for agentic development (`tdd-red`, `tdd-green`,
`presubmit-check`, `build-only`, `unit-test-crate`, `e2e-all`) MUST be stored in
`.devs/workflows/` and MUST be usable from the first server-startable commit.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-044]** E2E tests for MCP tools MUST call the MCP server via `POST /mcp/v1/call` using
- **Type:** UX
- **Description:** E2E tests for MCP tools MUST call the MCP server via `POST /mcp/v1/call` using
the `DEVS_MCP_ADDR` environment variable. Direct invocation of Rust functions implementing MCP
tool logic does not satisfy the E2E coverage requirement for QG-005.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-045]** `devs
- **Type:** Functional
- **Description:** `devs.toml` is parsed once at startup. Changes to `devs.toml` while the server
is running have no effect until restart. The only live-update exception is the project registry
(`projects.toml`), which is updated atomically by `devs project add/remove`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-046]** Configuration override precedence is strictly: CLI flag > environment variable
- **Type:** UX
- **Description:** Configuration override precedence is strictly: CLI flag > environment variable
(`DEVS_` prefix) > `devs.toml` > built-in default. A CLI flag that sets a value MUST always win
over the environment variable for the same key.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-047]** API keys and tokens in `devs
- **Type:** Functional
- **Description:** API keys and tokens in `devs.toml` trigger a startup `WARN` log entry: `WARNING:
credentials found in config file; prefer environment variables`. No startup failure is triggered by
this condition, but the warning MUST appear.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-048]** `devs project add` validates that the `repo_path` is an existing git repository
- **Type:** Functional
- **Description:** `devs project add` validates that the `repo_path` is an existing git repository
before writing to the project registry. A `repo_path` that does not contain a `.git` directory (or
is not a bare repository) is rejected.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-049]** When a project is removed with `devs project remove` while active runs exist,
- **Type:** UX
- **Description:** When a project is removed with `devs project remove` while active runs exist,
the project's status is set to `"removing"` in the registry. Active runs continue to completion.
No new submissions are accepted for a project in `"removing"` status. The project entry is
physically deleted from the registry only after all runs reach terminal state.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-050]** Every cell marked `✓` in the matrix above MUST have at least one E2E test that
- **Type:** UX
- **Description:** Every cell marked `✓` in the matrix above MUST have at least one E2E test that
exercises the feature through that interface boundary. Tests that call internal Rust functions
directly do not count toward the interface-specific coverage gates.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-1-001]** GIVEN a running server, WHEN an Orchestrated Agent calls `signal_completion`
- **Type:** Functional
- **Description:** GIVEN a running server, WHEN an Orchestrated Agent calls `signal_completion`
  twice for the same stage, THEN the first call succeeds and the second returns a
  `failed_precondition` error with no state change.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-1-002]** GIVEN a running server, WHEN two concurrent `submit_run` calls use the same
- **Type:** Functional
- **Description:** GIVEN a running server, WHEN two concurrent `submit_run` calls use the same
  `run_name` for the same project, THEN exactly one returns a successful `run_id` and the other
  returns `already_exists`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-1-003]** GIVEN a workflow with a cycle (A→B→A), WHEN the workflow definition is
- **Type:** Functional
- **Description:** GIVEN a workflow with a cycle (A→B→A), WHEN the workflow definition is
  submitted, THEN the server returns `invalid_argument: cycle detected` with `"cycle": ["A","B","A"]`
  and no run is created.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-1-004]** GIVEN a Human Developer running `
- **Type:** Technical
- **Description:** GIVEN a Human Developer running `./do presubmit` that takes more than 15
  minutes, WHEN the timeout fires, THEN all child processes are killed and the script exits with
  code 1 within 5 seconds of the timeout.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-1-005]** GIVEN a running server with an active run, WHEN `cancel_run` is called,
- **Type:** UX
- **Description:** GIVEN a running server with an active run, WHEN `cancel_run` is called,
  THEN all non-terminal stages transition to `Cancelled` in a single checkpoint commit and a
  subsequent `get_run` returns all stages as `cancelled`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-1-006]** GIVEN a stage producing more than 1 MiB of stdout, WHEN `get_stage_output`
- **Type:** Functional
- **Description:** GIVEN a stage producing more than 1 MiB of stdout, WHEN `get_stage_output`
  is called, THEN `stdout` is exactly 1,048,576 bytes, `truncated` is `true`, and the content is
  the last (most recent) 1,048,576 bytes.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-1-007]** GIVEN `devs
- **Type:** Technical
- **Description:** GIVEN `devs.toml` with `server.listen` and `server.mcp_port` set to the
  same value, WHEN the server starts, THEN it exits with a config validation error before binding
  any port.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-1-008]** GIVEN a project in `"removing"` status, WHEN `devs submit` is called for
- **Type:** Functional
- **Description:** GIVEN a project in `"removing"` status, WHEN `devs submit` is called for
  that project, THEN the server returns `failed_precondition: project is being removed` and no run
  is created.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-1-009]** GIVEN a TUI connected to a server, WHEN a `RunEvent` is emitted by the
- **Type:** UX
- **Description:** GIVEN a TUI connected to a server, WHEN a `RunEvent` is emitted by the
  server, THEN the TUI re-renders within 50 milliseconds.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-1-010]** GIVEN `
- **Type:** Functional
- **Description:** GIVEN `./do test` with a `// Covers: FEAT-BR-999` annotation in a test file
  where `FEAT-BR-999` does not exist in any spec document, WHEN `./do test` runs, THEN
  `target/traceability.json` contains `FEAT-BR-999` in `stale_annotations` and `./do test` exits
  with code 1.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-1NN]** rules are tagged `[4_USER_FEATURES-FEAT-BR-1NN]` and acceptance criteria are tagged `[4_USER_FEATURE...
- **Type:** UX
- **Description:** rules are tagged `[4_USER_FEATURES-FEAT-BR-1NN]` and acceptance criteria are tagged `[4_USER_FEATURES-AC-FEAT-2-NNN]`. All
acceptance criteria require an automated test annotated `// Covers: AC-FEAT-2-NNN`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-NNN]** rules are tagged `[4_USER_FEATURES-FEAT-BR-1NN]` and acceptance criteria are tagged `[4_USER_FEATURE...
- **Type:** UX
- **Description:** rules are tagged `[4_USER_FEATURES-FEAT-BR-1NN]` and acceptance criteria are tagged `[4_USER_FEATURES-AC-FEAT-2-NNN]`. All
acceptance criteria require an automated test annotated `// Covers: AC-FEAT-2-NNN`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-004]** A user starts the `devs` server and a client locates it automatically
- **Type:** Functional
- **Description:** A user starts the `devs` server and a client locates it automatically.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-005]** A client (TUI, CLI, or MCP bridge) locates the server:
- **Type:** UX
- **Description:** A client (TUI, CLI, or MCP bridge) locates the server:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-100]** The server MUST collect ALL `devs
- **Type:** Functional
- **Description:** The server MUST collect ALL `devs.toml` validation errors and report them to
stderr before exiting. Stopping at the first error and omitting subsequent errors is a defect. Zero
ports are bound when any configuration error is present.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-101]** If the gRPC port is already in use (`EADDRINUSE`), the server MUST exit
- **Type:** Technical
- **Description:** If the gRPC port is already in use (`EADDRINUSE`), the server MUST exit
immediately without binding any port and without writing the discovery file.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-102]** If the MCP port is already in use after the gRPC port has been bound, the server
- **Type:** Technical
- **Description:** If the MCP port is already in use after the gRPC port has been bound, the server
MUST release the gRPC port before exiting. No discovery file is written. The server exits non-zero.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-103]** The discovery file MUST be written atomically: content is written to a `
- **Type:** Functional
- **Description:** The discovery file MUST be written atomically: content is written to a `.tmp`
sibling file, then `rename(2)` is called to replace the target path. A partially written discovery
file MUST NOT be visible to clients at any point.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-104]** On `SIGTERM` (or `Ctrl+C`), the server MUST delete the discovery file before
- **Type:** Functional
- **Description:** On `SIGTERM` (or `Ctrl+C`), the server MUST delete the discovery file before
exiting. Clients that read a stale discovery file after server exit receive connection refusal and
MUST exit with code 3.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-105]** Per-project checkpoint recovery failures are non-fatal: the server logs `ERROR`
- **Type:** Functional
- **Description:** Per-project checkpoint recovery failures are non-fatal: the server logs `ERROR`
for the failing project and continues startup. A project whose checkpoints cannot be loaded is
marked `Unrecoverable`; its runs are not resumed.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-001]** GIVEN `devs
- **Type:** Functional
- **Description:** GIVEN `devs.toml` with two distinct validation errors, WHEN the server
  starts, THEN both errors appear on stderr before exit, zero ports are bound, and the process
  exits non-zero.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-002]** GIVEN a running server, WHEN SIGTERM is sent, THEN the discovery file is
- **Type:** Functional
- **Description:** GIVEN a running server, WHEN SIGTERM is sent, THEN the discovery file is
  deleted before the process exits and the exit code is 0.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-003]** GIVEN gRPC port already in use, WHEN the server starts, THEN it exits
- **Type:** Technical
- **Description:** GIVEN gRPC port already in use, WHEN the server starts, THEN it exits
  non-zero, the MCP port is never bound, and no discovery file is written.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-004]** GIVEN a client with `DEVS_DISCOVERY_FILE` set to a custom path, WHEN the
- **Type:** Technical
- **Description:** GIVEN a client with `DEVS_DISCOVERY_FILE` set to a custom path, WHEN the
  server writes its discovery file to that path, THEN the client connects to the gRPC address in
  that file and operates normally.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-005]** GIVEN a checkpoint with a `Running` stage, WHEN the server restarts and
- **Type:** Functional
- **Description:** GIVEN a checkpoint with a `Running` stage, WHEN the server restarts and
  recovers that checkpoint, THEN `get_run` shows the stage as `eligible` (or `running` once
  re-dispatched), not `running` with a stale process reference.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-006]** A developer authors a new workflow in TOML format
- **Type:** Functional
- **Description:** A developer authors a new workflow in TOML format.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-106]** `write_workflow_definition` MUST validate the incoming definition through all 13
- **Type:** Functional
- **Description:** `write_workflow_definition` MUST validate the incoming definition through all 13
checks before writing any file. On validation failure, the definition file on disk MUST remain
unchanged.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-107]** A workflow updated via `write_workflow_definition` while a run is active takes
- **Type:** Functional
- **Description:** A workflow updated via `write_workflow_definition` while a run is active takes
effect only for new submissions. Active runs continue using their immutable `definition_snapshot`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-006]** GIVEN a TOML definition with a cycle `A→B→A`, WHEN `write_workflow_definition`
- **Type:** Functional
- **Description:** GIVEN a TOML definition with a cycle `A→B→A`, WHEN `write_workflow_definition`
  is called, THEN the response contains `"error"` with `"cycle detected"` and the `"cycle"` array
  `["A","B","A"]`, and the file on disk is unmodified.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-007]** GIVEN a TOML definition with two simultaneous errors (duplicate stage name
- **Type:** Functional
- **Description:** GIVEN a TOML definition with two simultaneous errors (duplicate stage name
  and missing depends_on target), WHEN validation runs, THEN BOTH errors appear in the response
  before any file write.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-008]** GIVEN a workflow with `workflow
- **Type:** Functional
- **Description:** GIVEN a workflow with `workflow.timeout_secs = 60` and a stage with
  `timeout_secs = 61`, WHEN the definition is submitted, THEN validation returns
  `invalid_argument` and no run is created.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-009]** GIVEN a workflow definition updated via `write_workflow_definition` while
- **Type:** Functional
- **Description:** GIVEN a workflow definition updated via `write_workflow_definition` while
  a run is active, WHEN `get_run` is called on the active run, THEN `definition_snapshot` reflects
  the definition at the time the run was submitted, not the updated definition.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-007]** A developer submits a workflow run via the CLI
- **Type:** Functional
- **Description:** A developer submits a workflow run via the CLI.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-108]** `devs submit` with `--project` absent and the current working directory
- **Type:** UX
- **Description:** `devs submit` with `--project` absent and the current working directory
resolving to zero or more than one registered project MUST exit with code 4 and print
`invalid_argument: --project required; cwd matches N projects`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-109]** The auto-generated slug format is `<workflow-name>-<YYYYMMDD>-<4 random
- **Type:** Functional
- **Description:** The auto-generated slug format is `<workflow-name>-<YYYYMMDD>-<4 random
lowercase alphanum>`, maximum 128 characters, matching `[a-z0-9-]+`. If the workflow name portion
would cause the slug to exceed 128 characters, the workflow name is truncated from the right to fit.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-110]** Input values on the CLI are provided as `key=value` strings
- **Type:** Functional
- **Description:** Input values on the CLI are provided as `key=value` strings. The `=` character
splits on the first occurrence; a value containing `=` is permitted (e.g., `--input expr=a=b`
sets `expr` to `"a=b"`).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-010]** GIVEN a valid workflow with one required input, WHEN `devs submit` is called
- **Type:** UX
- **Description:** GIVEN a valid workflow with one required input, WHEN `devs submit` is called
  without that input, THEN the CLI exits with code 4 and stderr contains
  `invalid_argument: input '<name>' is required`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-011]** GIVEN a successful `devs submit`, WHEN `devs status <slug>` is called
- **Type:** Functional
- **Description:** GIVEN a successful `devs submit`, WHEN `devs status <slug>` is called
  immediately after, THEN the run status is `pending` or `running` and the `run_id` matches the
  submission response.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-012]** GIVEN `devs submit --format json` is called, WHEN validation fails, THEN
- **Type:** Functional
- **Description:** GIVEN `devs submit --format json` is called, WHEN validation fails, THEN
  stdout contains a JSON object with `"error"` and `"code"` fields, and stderr is empty.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-008]** An observing/controlling AI agent submits a workflow run via MCP
- **Type:** Technical
- **Description:** An observing/controlling AI agent submits a workflow run via MCP.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-111]** Input type coercion runs during validation step 4 (before duplicate name check
- **Type:** Functional
- **Description:** Input type coercion runs during validation step 4 (before duplicate name check
in step 5). All coercion errors are collected and returned together with other validation errors.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-112]** `path`-typed inputs are stored as-is (not resolved to absolute paths at
- **Type:** Functional
- **Description:** `path`-typed inputs are stored as-is (not resolved to absolute paths at
submission time). Resolution is deferred to execution time when the prompt template is expanded.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-013]** GIVEN two concurrent `submit_run` calls with the same `run_name` for the
- **Type:** Functional
- **Description:** GIVEN two concurrent `submit_run` calls with the same `run_name` for the
  same project, WHEN both complete, THEN exactly one returns a `run_id` and the other returns
  `already_exists`; `list_runs` shows exactly one run with that name.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-014]** GIVEN `inputs` with `"flag": "true"` for a `boolean`-typed input, WHEN
- **Type:** Functional
- **Description:** GIVEN `inputs` with `"flag": "true"` for a `boolean`-typed input, WHEN
  `submit_run` is called, THEN the input is coerced to `true` and the run is created successfully.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-015]** GIVEN `inputs` with `"flag": "yes"` for a `boolean`-typed input, WHEN
- **Type:** Functional
- **Description:** GIVEN `inputs` with `"flag": "yes"` for a `boolean`-typed input, WHEN
  `submit_run` is called, THEN the response contains `"error"` with `invalid_argument` and no run
  is created.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-009]** A developer opens the TUI to monitor an active workflow run
- **Type:** UX
- **Description:** A developer opens the TUI to monitor an active workflow run.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-113]** The TUI MUST re-render within 50 milliseconds of receiving any gRPC `RunEvent`
- **Type:** UX
- **Description:** The TUI MUST re-render within 50 milliseconds of receiving any gRPC `RunEvent`
push. Rendering is event-driven; no polling timer is used for the normal update path.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-114]** The TUI log buffer holds a maximum of 10,000 lines per stage
- **Type:** UX
- **Description:** The TUI log buffer holds a maximum of 10,000 lines per stage. Lines beyond this
limit cause the oldest lines to be evicted from the in-memory buffer. The full log is always
available on disk via `get_stage_output`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-115]** The TUI MUST operate correctly in any terminal at minimum 80 columns × 24 rows
- **Type:** UX
- **Description:** The TUI MUST operate correctly in any terminal at minimum 80 columns × 24 rows.
All stage boxes and DAG connectors use ASCII characters only (`-`, `|`, `>`, `[`, `]`). No
Unicode box-drawing characters (`│`, `┌`, `─`) are used in the DAG renderer.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-116]** TUI auto-reconnect uses exponential backoff: 1→2→4→8→16→30 seconds
- **Type:** UX
- **Description:** TUI auto-reconnect uses exponential backoff: 1→2→4→8→16→30 seconds. After the
total reconnect time reaches 30 seconds, the TUI waits an additional 5 seconds, then exits with
code 1 and prints `ERROR: lost connection to server; could not reconnect within 35s`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-016]** GIVEN a running server with an active run, WHEN the TUI is launched and
- **Type:** UX
- **Description:** GIVEN a running server with an active run, WHEN the TUI is launched and
  `StreamRunEvents` delivers a stage status change, THEN the TUI re-renders within 50ms and the
  stage box shows the updated `STATUS` abbreviation.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-017]** GIVEN the TUI connected to a server, WHEN the server process is killed,
- **Type:** UX
- **Description:** GIVEN the TUI connected to a server, WHEN the server process is killed,
  THEN the TUI displays a reconnect notice and exits with code 1 after failing to reconnect within
  35 seconds total.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-018]** GIVEN a workflow with 5 stages in a `plan→[impl-api, impl-ui]→review→merge`
- **Type:** UX
- **Description:** GIVEN a workflow with 5 stages in a `plan→[impl-api, impl-ui]→review→merge`
  DAG, WHEN the TUI Dashboard renders the run, THEN `impl-api` and `impl-ui` appear on the same
  column tier in the ASCII DAG, connected by arrows from `plan` and to `review`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-010]** A developer follows live log output for a running stage
- **Type:** Functional
- **Description:** A developer follows live log output for a running stage.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-117]** Sequence numbers in `stream_logs` MUST start at 1 and MUST be monotonically
- **Type:** Functional
- **Description:** Sequence numbers in `stream_logs` MUST start at 1 and MUST be monotonically
increasing with no gaps. A client receiving a gap (e.g., sequence jumps from 5 to 7) MUST treat
this as an internal error.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-118]** `stream_logs` with `follow: true` on a stage in `Pending`, `Waiting`, or
- **Type:** UX
- **Description:** `stream_logs` with `follow: true` on a stage in `Pending`, `Waiting`, or
`Eligible` state MUST hold the HTTP connection open until the stage starts executing. If the stage
transitions to `Cancelled` without ever running, the server sends the terminal chunk with
`total_lines: 0`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-119]** `devs logs --follow` exits with code 0 when the run reaches `Completed` and
- **Type:** UX
- **Description:** `devs logs --follow` exits with code 0 when the run reaches `Completed` and
with code 1 when the run reaches `Failed` or `Cancelled`. The exit code reflects the run's terminal
state, not the individual stage's state (if a stage name was specified).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-019]** GIVEN `devs logs <run> --follow` and the run reaches `Completed`, WHEN the
- **Type:** UX
- **Description:** GIVEN `devs logs <run> --follow` and the run reaches `Completed`, WHEN the
  final terminal chunk is delivered, THEN the CLI exits with code 0.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-020]** GIVEN `devs logs <run> --follow` and the run reaches `Failed`, WHEN the
- **Type:** UX
- **Description:** GIVEN `devs logs <run> --follow` and the run reaches `Failed`, WHEN the
  final terminal chunk is delivered, THEN the CLI exits with code 1.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-021]** GIVEN `stream_logs` with `follow: true` on a stage in `Eligible` state,
- **Type:** Functional
- **Description:** GIVEN `stream_logs` with `follow: true` on a stage in `Eligible` state,
  WHEN the stage is later cancelled without running, THEN the server delivers
  `{"done":true,"truncated":false,"total_lines":0}` and closes the stream.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-011]** A developer cancels a running workflow
- **Type:** Functional
- **Description:** A developer cancels a running workflow.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-120]** `cancel_run` on a run already in a terminal state (`Completed`, `Failed`,
- **Type:** UX
- **Description:** `cancel_run` on a run already in a terminal state (`Completed`, `Failed`,
`Cancelled`) MUST return `failed_precondition: run '<id>' is already <status>` and MUST NOT
modify any state or write any checkpoint.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-121]** `cancel_stage` cancels one stage without cancelling the run
- **Type:** Functional
- **Description:** `cancel_stage` cancels one stage without cancelling the run. The run continues;
downstream stages that `depends_on` the cancelled stage are immediately transitioned to `Cancelled`
(because the cancelled stage will never complete).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-122]** When a fan-out stage is cancelled via `cancel_stage`, all active sub-agent
- **Type:** Functional
- **Description:** When a fan-out stage is cancelled via `cancel_stage`, all active sub-agent
processes receive `devs:cancel\n`. All sub-runs transition to `Cancelled`. The parent stage
transitions to `Cancelled`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-022]** GIVEN a run with 3 stages (one `Running`, one `Eligible`, one `Waiting`),
- **Type:** Functional
- **Description:** GIVEN a run with 3 stages (one `Running`, one `Eligible`, one `Waiting`),
  WHEN `cancel_run` is called, THEN a single subsequent `get_run` shows all three stages as
  `cancelled` and the run as `cancelled`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-023]** GIVEN `cancel_run` on a `Completed` run, WHEN the MCP tool returns, THEN
- **Type:** Technical
- **Description:** GIVEN `cancel_run` on a `Completed` run, WHEN the MCP tool returns, THEN
  the response contains `"error": "failed_precondition: run '<id>' is already completed"` and
  `get_run` still shows status `completed`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-024]** GIVEN a running agent that ignores `devs:cancel\n`, WHEN the 10-second
- **Type:** Functional
- **Description:** GIVEN a running agent that ignores `devs:cancel\n`, WHEN the 10-second
  grace period expires, THEN the agent process is killed and `get_stage_output` shows a non-zero
  `exit_code`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-012]** A developer pauses a run to inspect state, then resumes it
- **Type:** Functional
- **Description:** A developer pauses a run to inspect state, then resumes it.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-123]** `pause_run` on a run not in `Running` state MUST return
- **Type:** Functional
- **Description:** `pause_run` on a run not in `Running` state MUST return
`failed_precondition: run '<id>' is not running (current state: <state>)`. No state change occurs.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-124]** `resume_run` on a run not in `Paused` state MUST return
- **Type:** Functional
- **Description:** `resume_run` on a run not in `Paused` state MUST return
`failed_precondition: run '<id>' is not paused (current state: <state>)`. No state change occurs.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-125]** When a run is paused at the run level, the DAG Scheduler MUST NOT dispatch
- **Type:** Functional
- **Description:** When a run is paused at the run level, the DAG Scheduler MUST NOT dispatch
any new stages until `resume_run` is called. Stages that become `Eligible` during the pause
(because a dependency completes) transition to `Eligible` but are not dispatched; they are
dispatched immediately upon `resume_run`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-126]** `cancel_run` on a `Paused` run MUST succeed
- **Type:** UX
- **Description:** `cancel_run` on a `Paused` run MUST succeed. The cancel signal is sent to any
agents that are still running (in `Paused` sub-state). All non-terminal stages transition to
`Cancelled` atomically.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-025]** GIVEN a running run with two stages (`Running` and `Eligible`), WHEN
- **Type:** Functional
- **Description:** GIVEN a running run with two stages (`Running` and `Eligible`), WHEN
  `pause_run` is called, THEN `get_run` shows the run as `paused` and the `Eligible` stage
  remains `eligible` (not dispatched).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-026]** GIVEN a paused run with an `Eligible` stage, WHEN `resume_run` is called,
- **Type:** Functional
- **Description:** GIVEN a paused run with an `Eligible` stage, WHEN `resume_run` is called,
  THEN the `Eligible` stage is dispatched within 100ms and `get_run` shows the run as `running`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-027]** GIVEN `pause_run` on a run in `Completed` state, WHEN the CLI returns,
- **Type:** Functional
- **Description:** GIVEN `pause_run` on a run in `Completed` state, WHEN the CLI returns,
  THEN the exit code is 1 and the error contains `failed_precondition`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-013]** An AI agent spawned as a workflow stage signals completion via MCP
- **Type:** Technical
- **Description:** An AI agent spawned as a workflow stage signals completion via MCP.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-127]** `
- **Type:** Functional
- **Description:** `.devs_context.json` write failure (e.g., disk full) causes the stage to
transition to `Failed` immediately without spawning the agent process. The error is logged at
`ERROR` level and recorded in the stage's `stderr` field.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-128]** `signal_completion` is idempotent only for the first call
- **Type:** UX
- **Description:** `signal_completion` is idempotent only for the first call. A second call on a
stage in a terminal state returns `failed_precondition: stage already in terminal state` and
MUST NOT modify any state.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-129]** An Orchestrated Agent that exits without calling `signal_completion` when
- **Type:** Technical
- **Description:** An Orchestrated Agent that exits without calling `signal_completion` when
`completion = "mcp_tool_call"` causes the server to fall back to exit code evaluation: exit
code 0 → `Completed`, non-zero → `Failed`. This fallback is not an error; it is a defined behavior.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-130]** The working directory is cleaned up after every stage completion regardless of
- **Type:** Functional
- **Description:** The working directory is cleaned up after every stage completion regardless of
outcome (success, failure, timeout, cancellation). Cleanup failures are logged at `WARN` level
and do not affect stage outcome.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-028]** GIVEN a stage with `completion="structured_output"` and `
- **Type:** Functional
- **Description:** GIVEN a stage with `completion="structured_output"` and `.devs_output.json`
  containing `{"success": true}`, WHEN the agent exits, THEN `get_stage_output` shows
  `structured.success = true` and the stage status is `completed`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-029]** GIVEN a stage with `completion="structured_output"` and `
- **Type:** Functional
- **Description:** GIVEN a stage with `completion="structured_output"` and `.devs_output.json`
  containing `{"success": "true"}` (string), WHEN the agent exits, THEN the stage transitions to
  `failed`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-030]** GIVEN an agent calling `signal_completion` twice for the same stage, WHEN
- **Type:** UX
- **Description:** GIVEN an agent calling `signal_completion` twice for the same stage, WHEN
  the second call is made, THEN the response contains `"error": "failed_precondition: stage already
  in terminal state"` and `get_run` shows the stage status unchanged from after the first call.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-031]** GIVEN a stage with `completion="exit_code"`, WHEN the agent exits with code
- **Type:** Functional
- **Description:** GIVEN a stage with `completion="exit_code"`, WHEN the agent exits with code
  0, THEN the stage transitions to `completed` and `StageRun.exit_code = 0`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-014]** A developer (or AI agent) runs the development presubmit workflow
- **Type:** Functional
- **Description:** A developer (or AI agent) runs the development presubmit workflow.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-A-Z]** Requirements are discovered by scanning `docs/plan/specs/` for `\[([0-9A-Z_a-z]+-[4_USER_FEATURES-A-...
- **Type:** UX
- **Description:** Requirements are discovered by scanning `docs/plan/specs/` for `\[([0-9A-Z_a-z]+-[4_USER_FEATURES-A-Z]+-[4_USER_FEATURES-0-9]+)\]`
patterns. Covering tests are discovered by scanning `tests/` and `crates/*/tests/` for
`// Covers: <id>` comments.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-0-9]** Requirements are discovered by scanning `docs/plan/specs/` for `\[([0-9A-Z_a-z]+-[4_USER_FEATURES-A-...
- **Type:** UX
- **Description:** Requirements are discovered by scanning `docs/plan/specs/` for `\[([0-9A-Z_a-z]+-[4_USER_FEATURES-A-Z]+-[4_USER_FEATURES-0-9]+)\]`
patterns. Covering tests are discovered by scanning `tests/` and `crates/*/tests/` for
`// Covers: <id>` comments.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-131]** The 15-minute timeout in `
- **Type:** Technical
- **Description:** The 15-minute timeout in `./do presubmit` is measured from the moment the
first step (setup) begins, not from when the script is invoked. The timer runs in the background
as a separate process or timer construct in POSIX sh.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-132]** `
- **Type:** UX
- **Description:** `./do setup` is idempotent. Running it N times produces the same result as
running it once. Tools already at the required version are NOT reinstalled or downgraded.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-133]** `
- **Type:** Functional
- **Description:** `./do lint` includes a dependency audit step that verifies all crates in the
Cargo workspace match the authoritative version table in `2_TAS.md` §2.2. Any workspace crate
with a dependency version not matching the table causes `./do lint` to exit non-zero.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-134]** `
- **Type:** Functional
- **Description:** `./do test` exits non-zero if `traceability.json` `overall_passed` is `false`,
even when all `cargo test` tests pass individually. Traceability failures are test failures.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-032]** GIVEN a test file with `// Covers: AC-FEAT-2-999` where `AC-FEAT-2-999`
- **Type:** Functional
- **Description:** GIVEN a test file with `// Covers: AC-FEAT-2-999` where `AC-FEAT-2-999`
  does not exist in any spec, WHEN `./do test` runs, THEN `target/traceability.json` contains
  `AC-FEAT-2-999` in `stale_annotations` and the process exits non-zero.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-033]** GIVEN `
- **Type:** Functional
- **Description:** GIVEN `./do presubmit` that runs for 16 minutes, WHEN the timeout fires
  at 15 minutes, THEN all child processes are killed and the process exits non-zero within 5
  seconds of the timeout firing.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-034]** GIVEN `
- **Type:** Functional
- **Description:** GIVEN `./do coverage` with all 5 quality gates passing, WHEN the command
  completes, THEN `target/coverage/report.json` exists with `overall_passed: true` and exactly
  5 entries in `gates` (QG-001 through QG-005).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-035]** GIVEN `
- **Type:** Functional
- **Description:** GIVEN `./do setup` run twice in sequence, WHEN the second invocation
  completes, THEN it exits with code 0 and does not reinstall already-present tools.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-015]** An observing/controlling AI agent implements a requirement using TDD
- **Type:** UX
- **Description:** An observing/controlling AI agent implements a requirement using TDD.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-135]** An agent MUST NOT make code changes before verifying that the test fails
- **Type:** Functional
- **Description:** An agent MUST NOT make code changes before verifying that the test fails
(Red phase). Implementing first and testing second invalidates the TDD discipline and may produce
false-positive tests.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-136]** An agent MUST check `list_runs` for active `presubmit-check` runs before
- **Type:** Functional
- **Description:** An agent MUST check `list_runs` for active `presubmit-check` runs before
submitting a new one. If an active `presubmit-check` run exists, the agent MUST monitor it via
`stream_logs` rather than submitting a duplicate.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-137]** An agent MUST write `task_state
- **Type:** UX
- **Description:** An agent MUST write `task_state.json` before calling `submit_run` and again
after each run reaches a terminal state. This enables crash recovery without losing progress.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-138]** An agent MUST NOT restart the `devs` server while any run is in `Running` or
- **Type:** UX
- **Description:** An agent MUST NOT restart the `devs` server while any run is in `Running` or
`Paused` state. Restart is only permitted after all runs reach terminal state or are cancelled.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-036]** GIVEN an agent submitting `tdd-red` for a test that does not yet have
- **Type:** Functional
- **Description:** GIVEN an agent submitting `tdd-red` for a test that does not yet have
  implementation, WHEN `assert_stage_output` checks `exit_code ne 0`, THEN the assertion passes
  (confirming the test fails).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-037]** GIVEN an agent with an active `presubmit-check` run already running, WHEN
- **Type:** Functional
- **Description:** GIVEN an agent with an active `presubmit-check` run already running, WHEN
  the agent calls `list_runs {workflow_name:"presubmit-check", status:"running"}`, THEN the
  response contains the active run and the agent MUST NOT submit a duplicate.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-038]** GIVEN `task_state
- **Type:** Functional
- **Description:** GIVEN `task_state.json` with `last_run_id` set to a run in `Failed` state,
  WHEN the agent restarts and reads this file, THEN the agent calls `get_run(last_run_id)` and
  processes the failure before attempting any new implementation.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-016]** An AI agent diagnoses and resolves a failed presubmit stage
- **Type:** Functional
- **Description:** An AI agent diagnoses and resolves a failed presubmit stage.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-139]** An agent MUST NOT transition from diagnosing to editing until `get_stage_output`
- **Type:** Functional
- **Description:** An agent MUST NOT transition from diagnosing to editing until `get_stage_output`
returns `"error": null`. If `get_stage_output` returns an error (e.g., stage output not yet
persisted), the agent MUST retry once before treating it as an internal error.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-140]** An agent MUST NOT make speculative code changes without first reading the
- **Type:** Technical
- **Description:** An agent MUST NOT make speculative code changes without first reading the
specific stderr/stdout output that identifies the failure. Reading only the run status (`failed`)
and immediately editing files is a protocol violation.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-141]** For coverage gate failures, the agent MUST read `target/coverage/report
- **Type:** Functional
- **Description:** For coverage gate failures, the agent MUST read `target/coverage/report.json`
to identify the specific gate (QG-001 through QG-005) and the specific lines that lack coverage.
Adding tests that do not target the uncovered lines does not satisfy the gate.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-142]** For traceability failures, the agent MUST NOT add `// Covers: <id>` annotations
- **Type:** UX
- **Description:** For traceability failures, the agent MUST NOT add `// Covers: <id>` annotations
to tests that do not actually test the specified requirement. Annotation must correspond to genuine
behavioral coverage.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-039]** GIVEN a failed stage with `stderr` containing `error[E0308]`, WHEN the
- **Type:** Functional
- **Description:** GIVEN a failed stage with `stderr` containing `error[E0308]`, WHEN the
  agent calls `get_stage_output`, THEN `stderr` is non-null and the agent MUST call
  `search_content` on the indicated source file before making any edit.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-040]** GIVEN `presubmit-check` where coverage gate QG-003 (CLI E2E) fails at
- **Type:** Technical
- **Description:** GIVEN `presubmit-check` where coverage gate QG-003 (CLI E2E) fails at
  45%, WHEN the agent reads `target/coverage/report.json`, THEN it identifies QG-003 as the
  failing gate and adds tests that exercise CLI commands through the `devs-cli` binary, not
  through internal Rust functions.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-041]** GIVEN a `TimedOut` stage, WHEN `get_stage_output` is called, THEN
- **Type:** Functional
- **Description:** GIVEN a `TimedOut` stage, WHEN `get_stage_output` is called, THEN
  `stage.exit_code` is null (process killed before clean exit) and `stage.status` is
  `"timed_out"`, not `"failed"`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-2-042]** GIVEN `assert_stage_output` called with a `matches` operator and an
- **Type:** Technical
- **Description:** GIVEN `assert_stage_output` called with a `matches` operator and an
  invalid Rust regex `"[unclosed"`, WHEN the MCP tool responds, THEN `"error"` is non-null with
  `invalid_argument` prefix and no assertions are evaluated.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-017]** Every CLI command supports `--format json` to emit machine-readable output
- **Type:** Functional
- **Description:** Every CLI command supports `--format json` to emit machine-readable output. When `--format json` is used, all output (including errors) is written to stdout as JSON. Nothing is written to stderr when `--format json` is active.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-018]** Every CLI command supports `--server <host:port>` to override server auto-discovery
- **Type:** Functional
- **Description:** Every CLI command supports `--server <host:port>` to override server auto-discovery. Explicit `--server` takes precedence over the discovery file. The format is `<hostname-or-ip>:<port>` (no scheme prefix).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-019]** CLI run identifier resolution: if the identifier string matches UUID4 format (`[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[...
- **Type:** UX
- **Description:** CLI run identifier resolution: if the identifier string matches UUID4 format (`[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}`), it is treated as a `run_id` and looked up by UUID. Otherwise it is treated as a `slug`. When the same value is both a valid UUID and a valid slug (a theoretical collision), the UUID lookup takes precedence.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-020]** `devs submit` requires `--project <name-or-id>` when the current working directory does not resolve to exactly one re...
- **Type:** UX
- **Description:** `devs submit` requires `--project <name-or-id>` when the current working directory does not resolve to exactly one registered project. If the CWD resolves to zero or two-or-more projects, the CLI exits with code 4 and lists the ambiguous or missing candidates.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-021]** `devs list` output includes active and historical runs
- **Type:** Functional
- **Description:** `devs list` output includes active and historical runs. Runs are sorted by `created_at` descending. The command does not embed per-stage detail. Default limit is 100. `--limit <n>` overrides. `--status <status>` filters by run status.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-022]** `devs status <run>` shows the current `WorkflowRun` status including all `StageRun` records with their current status...
- **Type:** Functional
- **Description:** `devs status <run>` shows the current `WorkflowRun` status including all `StageRun` records with their current statuses and elapsed times.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-023]** `devs logs <run> [stage] --follow` streams log lines to stdout until the run (or selected stage) reaches a terminal s...
- **Type:** UX
- **Description:** `devs logs <run> [stage] --follow` streams log lines to stdout until the run (or selected stage) reaches a terminal state. Exit code 0 on `Completed`, exit code 1 on `Failed` or `Cancelled`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-024]** All CLI commands produce one of the following exit codes:
- **Type:** Functional
- **Description:** All CLI commands produce one of the following exit codes:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-CLI-BR-001]** `--format json` and `--format text` are mutually exclusive flags
- **Type:** UX
- **Description:** `--format json` and `--format text` are mutually exclusive flags. Specifying both causes exit code 4.
- **[4_USER_FEATURES-CLI-BR-002]** All timestamps in `--format json` output use RFC 3339 with millisecond precision and `Z` suffix.
- **[4_USER_FEATURES-CLI-BR-003]** All status enum values in JSON output are lowercase underscore-separated strings (`"timed_out"`, not `"TimedOut"`).
- **[4_USER_FEATURES-CLI-BR-004]** All UUID values in JSON output are lowercase hyphenated strings.
- **[4_USER_FEATURES-CLI-BR-005]** JSON error output format is always `{"error": "<string>", "code": <int>}` — never an array or nested object at the top level.
- **[4_USER_FEATURES-CLI-BR-006]** When a run identifier resolves to both a UUID and a slug (theoretical collision), UUID lookup MUST take precedence without error.
- **[4_USER_FEATURES-CLI-BR-007]** `devs logs` without `--follow` MUST exit 0 regardless of run status.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-CLI-BR-002]** All timestamps in `--format json` output use RFC 3339 with millisecond precision and `Z` suffix
- **Type:** UX
- **Description:** All timestamps in `--format json` output use RFC 3339 with millisecond precision and `Z` suffix.
- **[4_USER_FEATURES-CLI-BR-003]** All status enum values in JSON output are lowercase underscore-separated strings (`"timed_out"`, not `"TimedOut"`).
- **[4_USER_FEATURES-CLI-BR-004]** All UUID values in JSON output are lowercase hyphenated strings.
- **[4_USER_FEATURES-CLI-BR-005]** JSON error output format is always `{"error": "<string>", "code": <int>}` — never an array or nested object at the top level.
- **[4_USER_FEATURES-CLI-BR-006]** When a run identifier resolves to both a UUID and a slug (theoretical collision), UUID lookup MUST take precedence without error.
- **[4_USER_FEATURES-CLI-BR-007]** `devs logs` without `--follow` MUST exit 0 regardless of run status.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-CLI-BR-003]** All status enum values in JSON output are lowercase underscore-separated strings (`"timed_out"`, not `"TimedOut"`)
- **Type:** UX
- **Description:** All status enum values in JSON output are lowercase underscore-separated strings (`"timed_out"`, not `"TimedOut"`).
- **[4_USER_FEATURES-CLI-BR-004]** All UUID values in JSON output are lowercase hyphenated strings.
- **[4_USER_FEATURES-CLI-BR-005]** JSON error output format is always `{"error": "<string>", "code": <int>}` — never an array or nested object at the top level.
- **[4_USER_FEATURES-CLI-BR-006]** When a run identifier resolves to both a UUID and a slug (theoretical collision), UUID lookup MUST take precedence without error.
- **[4_USER_FEATURES-CLI-BR-007]** `devs logs` without `--follow` MUST exit 0 regardless of run status.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-CLI-BR-004]** All UUID values in JSON output are lowercase hyphenated strings
- **Type:** UX
- **Description:** All UUID values in JSON output are lowercase hyphenated strings.
- **[4_USER_FEATURES-CLI-BR-005]** JSON error output format is always `{"error": "<string>", "code": <int>}` — never an array or nested object at the top level.
- **[4_USER_FEATURES-CLI-BR-006]** When a run identifier resolves to both a UUID and a slug (theoretical collision), UUID lookup MUST take precedence without error.
- **[4_USER_FEATURES-CLI-BR-007]** `devs logs` without `--follow` MUST exit 0 regardless of run status.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-CLI-BR-005]** JSON error output format is always `{"error": "<string>", "code": <int>}` — never an array or nested object at the to...
- **Type:** UX
- **Description:** JSON error output format is always `{"error": "<string>", "code": <int>}` — never an array or nested object at the top level.
- **[4_USER_FEATURES-CLI-BR-006]** When a run identifier resolves to both a UUID and a slug (theoretical collision), UUID lookup MUST take precedence without error.
- **[4_USER_FEATURES-CLI-BR-007]** `devs logs` without `--follow` MUST exit 0 regardless of run status.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-CLI-BR-006]** When a run identifier resolves to both a UUID and a slug (theoretical collision), UUID lookup MUST take precedence wi...
- **Type:** UX
- **Description:** When a run identifier resolves to both a UUID and a slug (theoretical collision), UUID lookup MUST take precedence without error.
- **[4_USER_FEATURES-CLI-BR-007]** `devs logs` without `--follow` MUST exit 0 regardless of run status.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-CLI-BR-007]** `devs logs` without `--follow` MUST exit 0 regardless of run status
- **Type:** Functional
- **Description:** `devs logs` without `--follow` MUST exit 0 regardless of run status.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-025]** The TUI displays four tabs navigable by keyboard: **Dashboard**, **Logs**, **Debug**, and **Pools**
- **Type:** UX
- **Description:** The TUI displays four tabs navigable by keyboard: **Dashboard**, **Logs**, **Debug**, and **Pools**. Tab switching is available via the number keys `1`–`4` or left/right arrow keys. The active tab is visually highlighted in the tab bar.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-026]** The Dashboard tab is split into two panes: a project/run list on the left, and the selected run detail on the right
- **Type:** Functional
- **Description:** The Dashboard tab is split into two panes: a project/run list on the left, and the selected run detail on the right. The right pane shows the ASCII DAG with stage boxes, a per-stage status indicator, elapsed time, and a live log tail.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-027]** Stage boxes in the ASCII DAG render as: `[ stage-name | STATUS | M:SS ]`
- **Type:** Functional
- **Description:** Stage boxes in the ASCII DAG render as: `[ stage-name | STATUS | M:SS ]`
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-028]** The TUI re-renders within 50 ms of receiving a `StreamRunEvents` gRPC push event
- **Type:** UX
- **Description:** The TUI re-renders within 50 ms of receiving a `StreamRunEvents` gRPC push event. The screen is not updated on a fixed timer; updates are event-driven. The TUI MUST NOT poll the server for state; all state updates come via the `StreamRunEvents` streaming RPC.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-029]** The Logs tab displays up to 10,000 log lines in memory per stage
- **Type:** Functional
- **Description:** The Logs tab displays up to 10,000 log lines in memory per stage. When the buffer reaches 10,000 lines, the oldest lines are evicted (FIFO). A status line at the top of the Logs pane reads `"Lines: <n>/10000 [TRUNCATED]"` when the buffer is at capacity.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-030]** The Debug tab shows the selected agent's live progress, a diff of its working directory, and keyboard controls to sen...
- **Type:** Technical
- **Description:** The Debug tab shows the selected agent's live progress, a diff of its working directory, and keyboard controls to send cancel, pause, or resume signals. The working-directory diff is fetched on demand via a gRPC call when the user selects a running stage; it is not streamed continuously.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-031]** The Pools tab shows real-time pool utilization: pool name, `max_concurrent`, active count, queued count, per-agent av...
- **Type:** Functional
- **Description:** The Pools tab shows real-time pool utilization: pool name, `max_concurrent`, active count, queued count, per-agent availability, and recent fallback events.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-032]** When the TUI loses server connectivity, it displays a reconnection notice and attempts reconnect with exponential bac...
- **Type:** UX
- **Description:** When the TUI loses server connectivity, it displays a reconnection notice and attempts reconnect with exponential backoff.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-TUI-BR-001]** TUI tests MUST use `ratatui::backend::TestBackend` with a 200×50 virtual terminal and `insta` text snapshots stored i...
- **Type:** UX
- **Description:** TUI tests MUST use `ratatui::backend::TestBackend` with a 200×50 virtual terminal and `insta` text snapshots stored in `crates/devs-tui/tests/snapshots/*.txt`.
- **[4_USER_FEATURES-TUI-BR-002]** Pixel-based screenshot comparison is prohibited in tests.
- **[4_USER_FEATURES-TUI-BR-003]** TUI MUST NOT use `println!` or `eprintln!` for any output; all rendering goes through Ratatui's render pipeline.
- **[4_USER_FEATURES-TUI-BR-004]** The TUI MUST re-render in ≤50 ms after any `StreamRunEvents` message is received, measurable in tests by asserting the terminal buffer state after event injection.
- **[4_USER_FEATURES-TUI-BR-005]** Stage status abbreviations MUST exactly match the table in §3.2.2. No alternative spellings or truncations.
- **[4_USER_FEATURES-TUI-BR-006]** Keyboard controls in the Debug tab MUST function regardless of which pane has visual focus.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-TUI-BR-002]** Pixel-based screenshot comparison is prohibited in tests
- **Type:** UX
- **Description:** Pixel-based screenshot comparison is prohibited in tests.
- **[4_USER_FEATURES-TUI-BR-003]** TUI MUST NOT use `println!` or `eprintln!` for any output; all rendering goes through Ratatui's render pipeline.
- **[4_USER_FEATURES-TUI-BR-004]** The TUI MUST re-render in ≤50 ms after any `StreamRunEvents` message is received, measurable in tests by asserting the terminal buffer state after event injection.
- **[4_USER_FEATURES-TUI-BR-005]** Stage status abbreviations MUST exactly match the table in §3.2.2. No alternative spellings or truncations.
- **[4_USER_FEATURES-TUI-BR-006]** Keyboard controls in the Debug tab MUST function regardless of which pane has visual focus.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-TUI-BR-003]** TUI MUST NOT use `println!` or `eprintln!` for any output; all rendering goes through Ratatui's render pipeline
- **Type:** UX
- **Description:** TUI MUST NOT use `println!` or `eprintln!` for any output; all rendering goes through Ratatui's render pipeline.
- **[4_USER_FEATURES-TUI-BR-004]** The TUI MUST re-render in ≤50 ms after any `StreamRunEvents` message is received, measurable in tests by asserting the terminal buffer state after event injection.
- **[4_USER_FEATURES-TUI-BR-005]** Stage status abbreviations MUST exactly match the table in §3.2.2. No alternative spellings or truncations.
- **[4_USER_FEATURES-TUI-BR-006]** Keyboard controls in the Debug tab MUST function regardless of which pane has visual focus.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-TUI-BR-004]** The TUI MUST re-render in ≤50 ms after any `StreamRunEvents` message is received, measurable in tests by asserting th...
- **Type:** UX
- **Description:** The TUI MUST re-render in ≤50 ms after any `StreamRunEvents` message is received, measurable in tests by asserting the terminal buffer state after event injection.
- **[4_USER_FEATURES-TUI-BR-005]** Stage status abbreviations MUST exactly match the table in §3.2.2. No alternative spellings or truncations.
- **[4_USER_FEATURES-TUI-BR-006]** Keyboard controls in the Debug tab MUST function regardless of which pane has visual focus.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-TUI-BR-005]** Stage status abbreviations MUST exactly match the table in §3
- **Type:** UX
- **Description:** Stage status abbreviations MUST exactly match the table in §3.2.2. No alternative spellings or truncations.
- **[4_USER_FEATURES-TUI-BR-006]** Keyboard controls in the Debug tab MUST function regardless of which pane has visual focus.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-TUI-BR-006]** Keyboard controls in the Debug tab MUST function regardless of which pane has visual focus
- **Type:** Functional
- **Description:** Keyboard controls in the Debug tab MUST function regardless of which pane has visual focus.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-034]** Observation tools acquire read locks only and execute fully in parallel with each other and with other observation calls
- **Type:** UX
- **Description:** Observation tools acquire read locks only and execute fully in parallel with each other and with other observation calls.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-036]** Returns runs sorted by `created_at` descending, without embedding `stage_runs`
- **Type:** Functional
- **Description:** Returns runs sorted by `created_at` descending, without embedding `stage_runs`. Default limit 100.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-037]** Returns the full `WorkflowRun` including all `StageRun` records
- **Type:** Functional
- **Description:** Returns the full `WorkflowRun` including all `StageRun` records. Every field is present; unpopulated optional fields are JSON `null`, never absent.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-038]** Returns `stdout` and `stderr` as UTF-8 strings
- **Type:** Functional
- **Description:** Returns `stdout` and `stderr` as UTF-8 strings. Invalid bytes replaced with U+FFFD (`\uFFFD`). Each capped at 1 MiB, truncated from the beginning.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-039]** With `follow: true`, holds the HTTP connection open using chunked transfer encoding
- **Type:** Functional
- **Description:** With `follow: true`, holds the HTTP connection open using chunked transfer encoding. Newline-delimited JSON chunks. Each chunk has a monotonically increasing `sequence` starting at 1 with no gaps. Each chunk is ≤32 KiB.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-040]** `stream_logs` with `follow: true` on a stage in `Pending`, `Waiting`, or `Eligible` status holds the connection until...
- **Type:** UX
- **Description:** `stream_logs` with `follow: true` on a stage in `Pending`, `Waiting`, or `Eligible` status holds the connection until the stage runs. If the stage is cancelled before running, the terminal chunk is `{"done": true, "truncated": false, "total_lines": 0}`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-041]** `stream_logs` with `follow: false` returns all buffered lines and closes immediately
- **Type:** UX
- **Description:** `stream_logs` with `follow: false` returns all buffered lines and closes immediately. The response is not chunked; it is a standard HTTP response with `Content-Type: application/json` and a single terminal chunk at the end.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-035]** Control tools acquire write locks and execute serially with respect to other control tools
- **Type:** UX
- **Description:** Control tools acquire write locks and execute serially with respect to other control tools. Multiple concurrent control calls are serialized by the `SchedulerState` write lock, with a maximum wait of 5 seconds before returning `"error": "resource_exhausted: lock acquisition timed out after 5s"`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-042]** Validates all inputs atomically under per-project lock before creating any run
- **Type:** Functional
- **Description:** Validates all inputs atomically under per-project lock before creating any run. If any validation step fails, the entire call fails with no state change.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-048]** Transitions all non-terminal `StageRun` records to `Cancelled` in a single atomic checkpoint write, then transitions ...
- **Type:** UX
- **Description:** Transitions all non-terminal `StageRun` records to `Cancelled` in a single atomic checkpoint write, then transitions the `WorkflowRun` to `Cancelled`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-049]** `pause_run` sends `devs:pause\n` to all active agent processes and holds all `Eligible` and `Waiting` stages from bei...
- **Type:** Functional
- **Description:** `pause_run` sends `devs:pause\n` to all active agent processes and holds all `Eligible` and `Waiting` stages from being dispatched. `resume_run` lifts the hold and sends `devs:resume\n` to paused agent processes.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-043]** Does not affect in-flight runs
- **Type:** Functional
- **Description:** Does not affect in-flight runs. Active runs continue using their immutable definition snapshot. The new definition is used only for subsequent `submit_run` calls.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-045]** Only accepted for stages in `Waiting` or `Eligible` status
- **Type:** Functional
- **Description:** Only accepted for stages in `Waiting` or `Eligible` status. Injects synthetic output as if a prior stage produced it, making template variables available. The injected checkpoint is committed immediately.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-046]** Evaluates all assertions in a single request (no short-circuit)
- **Type:** UX
- **Description:** Evaluates all assertions in a single request (no short-circuit). All assertion results are returned together. An invalid regex pattern causes the entire request to fail before any assertion is evaluated.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-044]** Idempotent only on the first call
- **Type:** UX
- **Description:** Idempotent only on the first call. Subsequent calls on a terminal stage return `"error": "failed_precondition: stage already completed"` with no state change.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-047]** Triggers pool fallback
- **Type:** Functional
- **Description:** Triggers pool fallback. If a fallback agent is available, the stage is requeued without incrementing `attempt`. If no fallback is available, the stage is marked `Failed` and the `pool.exhausted` webhook fires.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-033]** Every MCP tool response is a JSON object with exactly two top-level fields: `"result"` (non-null on success) and `"er...
- **Type:** Technical
- **Description:** Every MCP tool response is a JSON object with exactly two top-level fields: `"result"` (non-null on success) and `"error"` (non-null on failure). They are mutually exclusive.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-MCP-BR-T001]** Every field in every MCP response entity MUST be present
- **Type:** Technical
- **Description:** Every field in every MCP response entity MUST be present. Unpopulated optional fields MUST be JSON `null`, never absent.
- **[4_USER_FEATURES-MCP-BR-T002]** `"error"` and `"result"` are mutually exclusive. Both being non-null or both being null is an invariant violation.
- **[4_USER_FEATURES-MCP-BR-T003]** All control tool calls MUST pass through `StateMachine::transition()`; illegal transitions return `"error": "failed_precondition: ..."`.
- **[4_USER_FEATURES-MCP-BR-T004]** MCP server MUST handle ≥64 concurrent connections without error.
- **[4_USER_FEATURES-MCP-BR-T005]** Observation tool responses MUST be received within 2 seconds under normal load. Exceeding 2 seconds is logged at `WARN`.
- **[4_USER_FEATURES-MCP-BR-T006]** `stream_logs` sequence numbers start at 1 and have no gaps. If `from_sequence: N` is provided, only chunks with `sequence ≥ N` are returned.
- **[4_USER_FEATURES-MCP-BR-T007]** The MCP stdio bridge (`devs-mcp-bridge`) forwards exactly one request per stdin line and writes exactly one response per stdout line. No buffering of multiple requests before responding.
- **[4_USER_FEATURES-MCP-BR-T008]** On MCP server connection loss, `devs-mcp-bridge` makes exactly one reconnect attempt after 1 second, then exits with code 1 and writes `{"result":null,"error":"internal: server connection lost","fatal":true}` to stdout.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-MCP-BR-T002]** `"error"` and `"result"` are mutually exclusive
- **Type:** Technical
- **Description:** `"error"` and `"result"` are mutually exclusive. Both being non-null or both being null is an invariant violation.
- **[4_USER_FEATURES-MCP-BR-T003]** All control tool calls MUST pass through `StateMachine::transition()`; illegal transitions return `"error": "failed_precondition: ..."`.
- **[4_USER_FEATURES-MCP-BR-T004]** MCP server MUST handle ≥64 concurrent connections without error.
- **[4_USER_FEATURES-MCP-BR-T005]** Observation tool responses MUST be received within 2 seconds under normal load. Exceeding 2 seconds is logged at `WARN`.
- **[4_USER_FEATURES-MCP-BR-T006]** `stream_logs` sequence numbers start at 1 and have no gaps. If `from_sequence: N` is provided, only chunks with `sequence ≥ N` are returned.
- **[4_USER_FEATURES-MCP-BR-T007]** The MCP stdio bridge (`devs-mcp-bridge`) forwards exactly one request per stdin line and writes exactly one response per stdout line. No buffering of multiple requests before responding.
- **[4_USER_FEATURES-MCP-BR-T008]** On MCP server connection loss, `devs-mcp-bridge` makes exactly one reconnect attempt after 1 second, then exits with code 1 and writes `{"result":null,"error":"internal: server connection lost","fatal":true}` to stdout.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-MCP-BR-T003]** All control tool calls MUST pass through `StateMachine::transition()`; illegal transitions return `"error": "failed_p...
- **Type:** Technical
- **Description:** All control tool calls MUST pass through `StateMachine::transition()`; illegal transitions return `"error": "failed_precondition: ..."`.
- **[4_USER_FEATURES-MCP-BR-T004]** MCP server MUST handle ≥64 concurrent connections without error.
- **[4_USER_FEATURES-MCP-BR-T005]** Observation tool responses MUST be received within 2 seconds under normal load. Exceeding 2 seconds is logged at `WARN`.
- **[4_USER_FEATURES-MCP-BR-T006]** `stream_logs` sequence numbers start at 1 and have no gaps. If `from_sequence: N` is provided, only chunks with `sequence ≥ N` are returned.
- **[4_USER_FEATURES-MCP-BR-T007]** The MCP stdio bridge (`devs-mcp-bridge`) forwards exactly one request per stdin line and writes exactly one response per stdout line. No buffering of multiple requests before responding.
- **[4_USER_FEATURES-MCP-BR-T008]** On MCP server connection loss, `devs-mcp-bridge` makes exactly one reconnect attempt after 1 second, then exits with code 1 and writes `{"result":null,"error":"internal: server connection lost","fatal":true}` to stdout.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-MCP-BR-T004]** MCP server MUST handle ≥64 concurrent connections without error
- **Type:** Technical
- **Description:** MCP server MUST handle ≥64 concurrent connections without error.
- **[4_USER_FEATURES-MCP-BR-T005]** Observation tool responses MUST be received within 2 seconds under normal load. Exceeding 2 seconds is logged at `WARN`.
- **[4_USER_FEATURES-MCP-BR-T006]** `stream_logs` sequence numbers start at 1 and have no gaps. If `from_sequence: N` is provided, only chunks with `sequence ≥ N` are returned.
- **[4_USER_FEATURES-MCP-BR-T007]** The MCP stdio bridge (`devs-mcp-bridge`) forwards exactly one request per stdin line and writes exactly one response per stdout line. No buffering of multiple requests before responding.
- **[4_USER_FEATURES-MCP-BR-T008]** On MCP server connection loss, `devs-mcp-bridge` makes exactly one reconnect attempt after 1 second, then exits with code 1 and writes `{"result":null,"error":"internal: server connection lost","fatal":true}` to stdout.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-MCP-BR-T005]** Observation tool responses MUST be received within 2 seconds under normal load
- **Type:** Technical
- **Description:** Observation tool responses MUST be received within 2 seconds under normal load. Exceeding 2 seconds is logged at `WARN`.
- **[4_USER_FEATURES-MCP-BR-T006]** `stream_logs` sequence numbers start at 1 and have no gaps. If `from_sequence: N` is provided, only chunks with `sequence ≥ N` are returned.
- **[4_USER_FEATURES-MCP-BR-T007]** The MCP stdio bridge (`devs-mcp-bridge`) forwards exactly one request per stdin line and writes exactly one response per stdout line. No buffering of multiple requests before responding.
- **[4_USER_FEATURES-MCP-BR-T008]** On MCP server connection loss, `devs-mcp-bridge` makes exactly one reconnect attempt after 1 second, then exits with code 1 and writes `{"result":null,"error":"internal: server connection lost","fatal":true}` to stdout.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-MCP-BR-T006]** `stream_logs` sequence numbers start at 1 and have no gaps
- **Type:** Technical
- **Description:** `stream_logs` sequence numbers start at 1 and have no gaps. If `from_sequence: N` is provided, only chunks with `sequence ≥ N` are returned.
- **[4_USER_FEATURES-MCP-BR-T007]** The MCP stdio bridge (`devs-mcp-bridge`) forwards exactly one request per stdin line and writes exactly one response per stdout line. No buffering of multiple requests before responding.
- **[4_USER_FEATURES-MCP-BR-T008]** On MCP server connection loss, `devs-mcp-bridge` makes exactly one reconnect attempt after 1 second, then exits with code 1 and writes `{"result":null,"error":"internal: server connection lost","fatal":true}` to stdout.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-MCP-BR-T007]** The MCP stdio bridge (`devs-mcp-bridge`) forwards exactly one request per stdin line and writes exactly one response ...
- **Type:** Technical
- **Description:** The MCP stdio bridge (`devs-mcp-bridge`) forwards exactly one request per stdin line and writes exactly one response per stdout line. No buffering of multiple requests before responding.
- **[4_USER_FEATURES-MCP-BR-T008]** On MCP server connection loss, `devs-mcp-bridge` makes exactly one reconnect attempt after 1 second, then exits with code 1 and writes `{"result":null,"error":"internal: server connection lost","fatal":true}` to stdout.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-MCP-BR-T008]** On MCP server connection loss, `devs-mcp-bridge` makes exactly one reconnect attempt after 1 second, then exits with ...
- **Type:** Technical
- **Description:** On MCP server connection loss, `devs-mcp-bridge` makes exactly one reconnect attempt after 1 second, then exits with code 1 and writes `{"result":null,"error":"internal: server connection lost","fatal":true}` to stdout.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-050]** When a stage's `depends_on` dependency reaches a terminal `Failed`, `TimedOut`, or `Cancelled` status with no retry c...
- **Type:** UX
- **Description:** When a stage's `depends_on` dependency reaches a terminal `Failed`, `TimedOut`, or `Cancelled` status with no retry configured, all downstream stages transition to `Cancelled` immediately. If the downstream stage is already dispatched (Running), a cancel signal is sent to the agent.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-052]** A template variable reference (`{{stage
- **Type:** Functional
- **Description:** A template variable reference (`{{stage.<name>.*}}`) is only valid if `<name>` is in the transitive `depends_on` closure of the referencing stage. An invalid reference causes the stage to fail before the agent is spawned, with error: `"template error: stage '<name>' is not in the transitive depends_on closure"`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-053]** A missing template variable value causes the stage to fail immediately before agent spawn
- **Type:** Functional
- **Description:** A missing template variable value causes the stage to fail immediately before agent spawn. Variables are never silently substituted with an empty string. Error format: `"template error: variable '{{<var>}}' could not be resolved"`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-054]** A missing `prompt_file` at execution time causes the stage to fail before the agent is spawned
- **Type:** Functional
- **Description:** A missing `prompt_file` at execution time causes the stage to fail before the agent is spawned. The error is: `"prompt_file not found: <path>"`. The file path is resolved at execution time, not at workflow validation time.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-055]** A `structured_output` stage with `"success": "true"` (string, not boolean) in `
- **Type:** Functional
- **Description:** A `structured_output` stage with `"success": "true"` (string, not boolean) in `.devs_output.json` is treated as `Failed`. The `success` field must be a JSON boolean. String `"true"` and string `"false"` are both parse failures.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-056]** When `completion="mcp_tool_call"` and the agent process exits without calling `signal_completion`, the stage completi...
- **Type:** Technical
- **Description:** When `completion="mcp_tool_call"` and the agent process exits without calling `signal_completion`, the stage completion falls back to the `exit_code` mechanism using the process exit code.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-058]** After `max_attempts` is exhausted, the stage is marked `Failed` and branch conditions are evaluated
- **Type:** Functional
- **Description:** After `max_attempts` is exhausted, the stage is marked `Failed` and branch conditions are evaluated. The workflow graph determines next steps; the run does not halt automatically.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-057]** Rate-limit events do NOT increment the stage `attempt` counter
- **Type:** UX
- **Description:** Rate-limit events do NOT increment the stage `attempt` counter. Only genuine failures (non-rate-limit process failures) increment the counter toward `max_attempts`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-051]** When a fan-out stage has any sub-agent fail and no custom merge handler is configured, the entire fan-out stage is ma...
- **Type:** Functional
- **Description:** When a fan-out stage has any sub-agent fail and no custom merge handler is configured, the entire fan-out stage is marked `Failed`. The failure response includes `{"failed_indices": [0, 2, ...]}`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-059]** When `submit_run` is called during server shutdown, the server returns `FAILED_PRECONDITION "server is shutting down"...
- **Type:** Functional
- **Description:** When `submit_run` is called during server shutdown, the server returns `FAILED_PRECONDITION "server is shutting down"` and does not create a run.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-060]** When a pool has no agents satisfying required capability tags, the stage fails immediately with `PoolError::Unsatisfi...
- **Type:** UX
- **Description:** When a pool has no agents satisfying required capability tags, the stage fails immediately with `PoolError::UnsatisfiedCapability`. The stage is not queued. Error: `"pool '<name>' has no agents satisfying capabilities: [<cap1>, <cap2>]"`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-061]** When `max_concurrent` agents are all occupied, new stage dispatches queue in FIFO order on the pool semaphore
- **Type:** Functional
- **Description:** When `max_concurrent` agents are all occupied, new stage dispatches queue in FIFO order on the pool semaphore. The stage status remains `Eligible` while queued. There is no timeout on the semaphore wait; stages wait until a slot is available or the run is cancelled.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-062]** `devs project remove` on a project with active runs allows active runs to complete
- **Type:** UX
- **Description:** `devs project remove` on a project with active runs allows active runs to complete. The project status transitions to `removing`. No new submissions are accepted. When all active runs reach terminal state, the project is fully removed from the registry.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-063]** `
- **Type:** Functional
- **Description:** `./do presubmit` kills all child processes and exits non-zero if the wall-clock time exceeds 15 minutes. The timeout is enforced by a background timer process that sends SIGTERM to the presubmit process group. The exit code is 1.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-064]** `
- **Type:** UX
- **Description:** `./do setup` is idempotent. Running it multiple times produces the same result with no errors. Tools already at the required version are skipped without reinstall. The command exits 0 if all dependencies are satisfied.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-065]** An unknown subcommand to `
- **Type:** UX
- **Description:** An unknown subcommand to `./do` prints the list of valid subcommands to stderr and exits non-zero (exit code 1). Output format: `"Usage: ./do <command>\nCommands: setup build test lint format coverage presubmit ci"`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-066]** `
- **Type:** UX
- **Description:** `./do test` generates `target/traceability.json` and exits non-zero if:
- Any requirement ID referenced in `docs/plan/specs/*.md` has zero covering tests, OR
- Any test annotation (`// Covers: <ID>`) references a non-existent requirement ID.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-067]** `
- **Type:** Functional
- **Description:** `./do coverage` generates `target/coverage/report.json` containing exactly five quality gates (QG-001 through QG-005) and exits non-zero if `overall_passed` is `false`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-DO-BR-001]** `
- **Type:** UX
- **Description:** `./do` MUST be a POSIX `sh` script with no bash-specific syntax. It MUST execute correctly under `/bin/sh` on Linux, macOS, and Windows (Git Bash).
- **[4_USER_FEATURES-DO-BR-002]** `./do presubmit` executes steps in this order: `setup → format → lint → test → coverage → ci`. Each step's exit code is checked; on failure, subsequent steps are skipped and `presubmit` exits non-zero.
- **[4_USER_FEATURES-DO-BR-003]** `./do ci` pushes a temporary branch, triggers a GitLab pipeline, polls for up to 30 minutes, then deletes the branch. It exits 0 only if all three CI jobs pass.
- **[4_USER_FEATURES-DO-BR-004]** All `./do` commands produce identical exit codes on Linux, macOS, and Windows (Git Bash).
- **[4_USER_FEATURES-DO-BR-005]** `./do format` MUST modify files in-place and exit 0 even if no files needed formatting.
- **[4_USER_FEATURES-DO-BR-006]** `./do build` MUST build all workspace crates in release mode. Exit non-zero if any crate fails to compile.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-DO-BR-002]** `
- **Type:** UX
- **Description:** `./do presubmit` executes steps in this order: `setup → format → lint → test → coverage → ci`. Each step's exit code is checked; on failure, subsequent steps are skipped and `presubmit` exits non-zero.
- **[4_USER_FEATURES-DO-BR-003]** `./do ci` pushes a temporary branch, triggers a GitLab pipeline, polls for up to 30 minutes, then deletes the branch. It exits 0 only if all three CI jobs pass.
- **[4_USER_FEATURES-DO-BR-004]** All `./do` commands produce identical exit codes on Linux, macOS, and Windows (Git Bash).
- **[4_USER_FEATURES-DO-BR-005]** `./do format` MUST modify files in-place and exit 0 even if no files needed formatting.
- **[4_USER_FEATURES-DO-BR-006]** `./do build` MUST build all workspace crates in release mode. Exit non-zero if any crate fails to compile.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-DO-BR-003]** `
- **Type:** UX
- **Description:** `./do ci` pushes a temporary branch, triggers a GitLab pipeline, polls for up to 30 minutes, then deletes the branch. It exits 0 only if all three CI jobs pass.
- **[4_USER_FEATURES-DO-BR-004]** All `./do` commands produce identical exit codes on Linux, macOS, and Windows (Git Bash).
- **[4_USER_FEATURES-DO-BR-005]** `./do format` MUST modify files in-place and exit 0 even if no files needed formatting.
- **[4_USER_FEATURES-DO-BR-006]** `./do build` MUST build all workspace crates in release mode. Exit non-zero if any crate fails to compile.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-DO-BR-004]** All `
- **Type:** UX
- **Description:** All `./do` commands produce identical exit codes on Linux, macOS, and Windows (Git Bash).
- **[4_USER_FEATURES-DO-BR-005]** `./do format` MUST modify files in-place and exit 0 even if no files needed formatting.
- **[4_USER_FEATURES-DO-BR-006]** `./do build` MUST build all workspace crates in release mode. Exit non-zero if any crate fails to compile.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-DO-BR-005]** `
- **Type:** UX
- **Description:** `./do format` MUST modify files in-place and exit 0 even if no files needed formatting.
- **[4_USER_FEATURES-DO-BR-006]** `./do build` MUST build all workspace crates in release mode. Exit non-zero if any crate fails to compile.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-DO-BR-006]** `
- **Type:** UX
- **Description:** `./do build` MUST build all workspace crates in release mode. Exit non-zero if any crate fails to compile.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-CLI-001]** GIVEN `devs status <valid-run-id> --format json`, WHEN the run exists, THEN the response is valid JSON with `run_id`,...
- **Type:** UX
- **Description:** GIVEN `devs status <valid-run-id> --format json`, WHEN the run exists, THEN the response is valid JSON with `run_id`, `status`, `stage_runs` array, and all timestamp fields present (null or string, never absent).
- **[4_USER_FEATURES-AC-3-CLI-002]** GIVEN `devs status <nonexistent-id>`, WHEN the command runs, THEN exit code is 2 and `--format json` output is `{"error": "not_found: ...", "code": 2}`.
- **[4_USER_FEATURES-AC-3-CLI-003]** GIVEN the server is not running and no `--server` flag, WHEN any CLI command runs, THEN exit code is 3.
- **[4_USER_FEATURES-AC-3-CLI-004]** GIVEN `devs submit <workflow> --input required_field=value` where `required_field` type is `boolean` and value is `"1"`, WHEN the command runs, THEN exit code is 4 and the error message references `required_field`.
- **[4_USER_FEATURES-AC-3-CLI-005]** GIVEN `devs logs <run> --follow` where the run completes successfully, WHEN the run reaches `Completed`, THEN the command exits with code 0.
- **[4_USER_FEATURES-AC-3-CLI-006]** GIVEN `devs logs <run> --follow` where the run fails, WHEN the run reaches `Failed`, THEN the command exits with code 1.
- **[4_USER_FEATURES-AC-3-CLI-007]** GIVEN `devs submit` from a CWD that matches two registered projects with no `--project` flag, WHEN the command runs, THEN exit code is 4 and the error message lists both project names.
- **[4_USER_FEATURES-AC-3-CLI-008]** GIVEN `./do unknown-command`, WHEN the script runs, THEN exit code is non-zero and stderr contains the list of valid commands.
- **[4_USER_FEATURES-AC-3-CLI-009]** GIVEN `devs list --format json`, WHEN zero runs exist, THEN the response is `{"runs": [], "total": 0, "limit": 100, "offset": 0}` (not an error).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-CLI-002]** GIVEN `devs status <nonexistent-id>`, WHEN the command runs, THEN exit code is 2 and `--format json` output is `{"err...
- **Type:** UX
- **Description:** GIVEN `devs status <nonexistent-id>`, WHEN the command runs, THEN exit code is 2 and `--format json` output is `{"error": "not_found: ...", "code": 2}`.
- **[4_USER_FEATURES-AC-3-CLI-003]** GIVEN the server is not running and no `--server` flag, WHEN any CLI command runs, THEN exit code is 3.
- **[4_USER_FEATURES-AC-3-CLI-004]** GIVEN `devs submit <workflow> --input required_field=value` where `required_field` type is `boolean` and value is `"1"`, WHEN the command runs, THEN exit code is 4 and the error message references `required_field`.
- **[4_USER_FEATURES-AC-3-CLI-005]** GIVEN `devs logs <run> --follow` where the run completes successfully, WHEN the run reaches `Completed`, THEN the command exits with code 0.
- **[4_USER_FEATURES-AC-3-CLI-006]** GIVEN `devs logs <run> --follow` where the run fails, WHEN the run reaches `Failed`, THEN the command exits with code 1.
- **[4_USER_FEATURES-AC-3-CLI-007]** GIVEN `devs submit` from a CWD that matches two registered projects with no `--project` flag, WHEN the command runs, THEN exit code is 4 and the error message lists both project names.
- **[4_USER_FEATURES-AC-3-CLI-008]** GIVEN `./do unknown-command`, WHEN the script runs, THEN exit code is non-zero and stderr contains the list of valid commands.
- **[4_USER_FEATURES-AC-3-CLI-009]** GIVEN `devs list --format json`, WHEN zero runs exist, THEN the response is `{"runs": [], "total": 0, "limit": 100, "offset": 0}` (not an error).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-CLI-003]** GIVEN the server is not running and no `--server` flag, WHEN any CLI command runs, THEN exit code is 3
- **Type:** UX
- **Description:** GIVEN the server is not running and no `--server` flag, WHEN any CLI command runs, THEN exit code is 3.
- **[4_USER_FEATURES-AC-3-CLI-004]** GIVEN `devs submit <workflow> --input required_field=value` where `required_field` type is `boolean` and value is `"1"`, WHEN the command runs, THEN exit code is 4 and the error message references `required_field`.
- **[4_USER_FEATURES-AC-3-CLI-005]** GIVEN `devs logs <run> --follow` where the run completes successfully, WHEN the run reaches `Completed`, THEN the command exits with code 0.
- **[4_USER_FEATURES-AC-3-CLI-006]** GIVEN `devs logs <run> --follow` where the run fails, WHEN the run reaches `Failed`, THEN the command exits with code 1.
- **[4_USER_FEATURES-AC-3-CLI-007]** GIVEN `devs submit` from a CWD that matches two registered projects with no `--project` flag, WHEN the command runs, THEN exit code is 4 and the error message lists both project names.
- **[4_USER_FEATURES-AC-3-CLI-008]** GIVEN `./do unknown-command`, WHEN the script runs, THEN exit code is non-zero and stderr contains the list of valid commands.
- **[4_USER_FEATURES-AC-3-CLI-009]** GIVEN `devs list --format json`, WHEN zero runs exist, THEN the response is `{"runs": [], "total": 0, "limit": 100, "offset": 0}` (not an error).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-CLI-004]** GIVEN `devs submit <workflow> --input required_field=value` where `required_field` type is `boolean` and value is `"1...
- **Type:** UX
- **Description:** GIVEN `devs submit <workflow> --input required_field=value` where `required_field` type is `boolean` and value is `"1"`, WHEN the command runs, THEN exit code is 4 and the error message references `required_field`.
- **[4_USER_FEATURES-AC-3-CLI-005]** GIVEN `devs logs <run> --follow` where the run completes successfully, WHEN the run reaches `Completed`, THEN the command exits with code 0.
- **[4_USER_FEATURES-AC-3-CLI-006]** GIVEN `devs logs <run> --follow` where the run fails, WHEN the run reaches `Failed`, THEN the command exits with code 1.
- **[4_USER_FEATURES-AC-3-CLI-007]** GIVEN `devs submit` from a CWD that matches two registered projects with no `--project` flag, WHEN the command runs, THEN exit code is 4 and the error message lists both project names.
- **[4_USER_FEATURES-AC-3-CLI-008]** GIVEN `./do unknown-command`, WHEN the script runs, THEN exit code is non-zero and stderr contains the list of valid commands.
- **[4_USER_FEATURES-AC-3-CLI-009]** GIVEN `devs list --format json`, WHEN zero runs exist, THEN the response is `{"runs": [], "total": 0, "limit": 100, "offset": 0}` (not an error).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-CLI-005]** GIVEN `devs logs <run> --follow` where the run completes successfully, WHEN the run reaches `Completed`, THEN the com...
- **Type:** Technical
- **Description:** GIVEN `devs logs <run> --follow` where the run completes successfully, WHEN the run reaches `Completed`, THEN the command exits with code 0.
- **[4_USER_FEATURES-AC-3-CLI-006]** GIVEN `devs logs <run> --follow` where the run fails, WHEN the run reaches `Failed`, THEN the command exits with code 1.
- **[4_USER_FEATURES-AC-3-CLI-007]** GIVEN `devs submit` from a CWD that matches two registered projects with no `--project` flag, WHEN the command runs, THEN exit code is 4 and the error message lists both project names.
- **[4_USER_FEATURES-AC-3-CLI-008]** GIVEN `./do unknown-command`, WHEN the script runs, THEN exit code is non-zero and stderr contains the list of valid commands.
- **[4_USER_FEATURES-AC-3-CLI-009]** GIVEN `devs list --format json`, WHEN zero runs exist, THEN the response is `{"runs": [], "total": 0, "limit": 100, "offset": 0}` (not an error).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-CLI-006]** GIVEN `devs logs <run> --follow` where the run fails, WHEN the run reaches `Failed`, THEN the command exits with code 1
- **Type:** Technical
- **Description:** GIVEN `devs logs <run> --follow` where the run fails, WHEN the run reaches `Failed`, THEN the command exits with code 1.
- **[4_USER_FEATURES-AC-3-CLI-007]** GIVEN `devs submit` from a CWD that matches two registered projects with no `--project` flag, WHEN the command runs, THEN exit code is 4 and the error message lists both project names.
- **[4_USER_FEATURES-AC-3-CLI-008]** GIVEN `./do unknown-command`, WHEN the script runs, THEN exit code is non-zero and stderr contains the list of valid commands.
- **[4_USER_FEATURES-AC-3-CLI-009]** GIVEN `devs list --format json`, WHEN zero runs exist, THEN the response is `{"runs": [], "total": 0, "limit": 100, "offset": 0}` (not an error).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-CLI-007]** GIVEN `devs submit` from a CWD that matches two registered projects with no `--project` flag, WHEN the command runs, ...
- **Type:** Technical
- **Description:** GIVEN `devs submit` from a CWD that matches two registered projects with no `--project` flag, WHEN the command runs, THEN exit code is 4 and the error message lists both project names.
- **[4_USER_FEATURES-AC-3-CLI-008]** GIVEN `./do unknown-command`, WHEN the script runs, THEN exit code is non-zero and stderr contains the list of valid commands.
- **[4_USER_FEATURES-AC-3-CLI-009]** GIVEN `devs list --format json`, WHEN zero runs exist, THEN the response is `{"runs": [], "total": 0, "limit": 100, "offset": 0}` (not an error).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-CLI-008]** GIVEN `
- **Type:** Technical
- **Description:** GIVEN `./do unknown-command`, WHEN the script runs, THEN exit code is non-zero and stderr contains the list of valid commands.
- **[4_USER_FEATURES-AC-3-CLI-009]** GIVEN `devs list --format json`, WHEN zero runs exist, THEN the response is `{"runs": [], "total": 0, "limit": 100, "offset": 0}` (not an error).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-CLI-009]** GIVEN `devs list --format json`, WHEN zero runs exist, THEN the response is `{"runs": [], "total": 0, "limit": 100, "...
- **Type:** Functional
- **Description:** GIVEN `devs list --format json`, WHEN zero runs exist, THEN the response is `{"runs": [], "total": 0, "limit": 100, "offset": 0}` (not an error).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-TUI-001]** GIVEN a TUI test with `TestBackend(200×50)` and a run with two stages in `RUN` status, WHEN the backend is rendered, ...
- **Type:** UX
- **Description:** GIVEN a TUI test with `TestBackend(200×50)` and a run with two stages in `RUN` status, WHEN the backend is rendered, THEN the snapshot contains `[ stage-name | RUN |` text for both stages.
- **[4_USER_FEATURES-AC-3-TUI-002]** GIVEN a TUI test where a `StreamRunEvents` event is injected with a stage transitioning to `DONE`, WHEN 50 ms elapses, THEN the rendered buffer shows `DONE` for that stage.
- **[4_USER_FEATURES-AC-3-TUI-003]** GIVEN a TUI with terminal width 79 columns, WHEN the TUI renders, THEN the buffer contains `"Terminal too small"` and no interactive content.
- **[4_USER_FEATURES-AC-3-TUI-004]** GIVEN a TUI that loses its gRPC connection, WHEN 30 seconds elapse and 5 additional seconds pass, THEN the TUI process exits with code 1.
- **[4_USER_FEATURES-AC-3-TUI-005]** GIVEN the Logs tab is active and a stage has 10,001 log lines, WHEN the buffer is inspected, THEN it contains exactly 10,000 lines and the status bar shows `[TRUNCATED]`.
- **[4_USER_FEATURES-AC-3-TUI-006]** GIVEN no runs exist, WHEN the Dashboard tab is rendered, THEN the left pane shows `"No runs found."` and the TUI does not exit or error.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-TUI-002]** GIVEN a TUI test where a `StreamRunEvents` event is injected with a stage transitioning to `DONE`, WHEN 50 ms elapses...
- **Type:** UX
- **Description:** GIVEN a TUI test where a `StreamRunEvents` event is injected with a stage transitioning to `DONE`, WHEN 50 ms elapses, THEN the rendered buffer shows `DONE` for that stage.
- **[4_USER_FEATURES-AC-3-TUI-003]** GIVEN a TUI with terminal width 79 columns, WHEN the TUI renders, THEN the buffer contains `"Terminal too small"` and no interactive content.
- **[4_USER_FEATURES-AC-3-TUI-004]** GIVEN a TUI that loses its gRPC connection, WHEN 30 seconds elapse and 5 additional seconds pass, THEN the TUI process exits with code 1.
- **[4_USER_FEATURES-AC-3-TUI-005]** GIVEN the Logs tab is active and a stage has 10,001 log lines, WHEN the buffer is inspected, THEN it contains exactly 10,000 lines and the status bar shows `[TRUNCATED]`.
- **[4_USER_FEATURES-AC-3-TUI-006]** GIVEN no runs exist, WHEN the Dashboard tab is rendered, THEN the left pane shows `"No runs found."` and the TUI does not exit or error.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-TUI-003]** GIVEN a TUI with terminal width 79 columns, WHEN the TUI renders, THEN the buffer contains `"Terminal too small"` and...
- **Type:** UX
- **Description:** GIVEN a TUI with terminal width 79 columns, WHEN the TUI renders, THEN the buffer contains `"Terminal too small"` and no interactive content.
- **[4_USER_FEATURES-AC-3-TUI-004]** GIVEN a TUI that loses its gRPC connection, WHEN 30 seconds elapse and 5 additional seconds pass, THEN the TUI process exits with code 1.
- **[4_USER_FEATURES-AC-3-TUI-005]** GIVEN the Logs tab is active and a stage has 10,001 log lines, WHEN the buffer is inspected, THEN it contains exactly 10,000 lines and the status bar shows `[TRUNCATED]`.
- **[4_USER_FEATURES-AC-3-TUI-006]** GIVEN no runs exist, WHEN the Dashboard tab is rendered, THEN the left pane shows `"No runs found."` and the TUI does not exit or error.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-TUI-004]** GIVEN a TUI that loses its gRPC connection, WHEN 30 seconds elapse and 5 additional seconds pass, THEN the TUI proces...
- **Type:** UX
- **Description:** GIVEN a TUI that loses its gRPC connection, WHEN 30 seconds elapse and 5 additional seconds pass, THEN the TUI process exits with code 1.
- **[4_USER_FEATURES-AC-3-TUI-005]** GIVEN the Logs tab is active and a stage has 10,001 log lines, WHEN the buffer is inspected, THEN it contains exactly 10,000 lines and the status bar shows `[TRUNCATED]`.
- **[4_USER_FEATURES-AC-3-TUI-006]** GIVEN no runs exist, WHEN the Dashboard tab is rendered, THEN the left pane shows `"No runs found."` and the TUI does not exit or error.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-TUI-005]** GIVEN the Logs tab is active and a stage has 10,001 log lines, WHEN the buffer is inspected, THEN it contains exactly...
- **Type:** UX
- **Description:** GIVEN the Logs tab is active and a stage has 10,001 log lines, WHEN the buffer is inspected, THEN it contains exactly 10,000 lines and the status bar shows `[TRUNCATED]`.
- **[4_USER_FEATURES-AC-3-TUI-006]** GIVEN no runs exist, WHEN the Dashboard tab is rendered, THEN the left pane shows `"No runs found."` and the TUI does not exit or error.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-TUI-006]** GIVEN no runs exist, WHEN the Dashboard tab is rendered, THEN the left pane shows `"No runs found
- **Type:** UX
- **Description:** GIVEN no runs exist, WHEN the Dashboard tab is rendered, THEN the left pane shows `"No runs found."` and the TUI does not exit or error.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-MCP-001]** GIVEN a `GET /mcp/v1/call` request (wrong method), WHEN the server responds, THEN HTTP status is 405
- **Type:** UX
- **Description:** GIVEN a `GET /mcp/v1/call` request (wrong method), WHEN the server responds, THEN HTTP status is 405.
- **[4_USER_FEATURES-AC-3-MCP-002]** GIVEN `submit_run` with a duplicate non-cancelled `run_name` for the same project, WHEN two concurrent calls are made, THEN exactly one returns `"error": null` and one returns `"error": "already_exists: ..."`.
- **[4_USER_FEATURES-AC-3-MCP-003]** GIVEN `get_run` on any valid run, WHEN the response is received, THEN every field in the `WorkflowRun` schema is present (including optional fields as `null`).
- **[4_USER_FEATURES-AC-3-MCP-004]** GIVEN `stream_logs(follow:false)` on a completed stage, WHEN the response arrives, THEN HTTP status is 200, the final line is `{"done":true,...}`, and the connection is closed.
- **[4_USER_FEATURES-AC-3-MCP-005]** GIVEN `signal_completion` called twice on the same terminal stage, WHEN the second call is made, THEN `"error"` is non-null with `"failed_precondition"` prefix and no state change occurs.
- **[4_USER_FEATURES-AC-3-MCP-006]** GIVEN `assert_stage_output` with a `matches` operator and invalid regex `"[unclosed"`, WHEN the call is made, THEN `"error"` is non-null with `"invalid_argument"` prefix and no assertions are evaluated.
- **[4_USER_FEATURES-AC-3-MCP-007]** GIVEN `inject_stage_input` on a `Running` stage, WHEN the call is made, THEN `"error"` is non-null with `"failed_precondition"` prefix.
- **[4_USER_FEATURES-AC-3-MCP-008]** GIVEN a request body exceeding 1 MiB, WHEN the server receives it, THEN HTTP status is 413.
- **[4_USER_FEATURES-AC-3-MCP-009]** GIVEN `cancel_run` on a run with three running stages, WHEN the call completes, THEN `checkpoint.json` contains all three stages in `Cancelled` status in a single commit.
- **[4_USER_FEATURES-AC-3-MCP-010]** GIVEN 64 concurrent observation tool calls, WHEN all are issued simultaneously, THEN all complete without error (no lock contention failures).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-MCP-002]** GIVEN `submit_run` with a duplicate non-cancelled `run_name` for the same project, WHEN two concurrent calls are made...
- **Type:** UX
- **Description:** GIVEN `submit_run` with a duplicate non-cancelled `run_name` for the same project, WHEN two concurrent calls are made, THEN exactly one returns `"error": null` and one returns `"error": "already_exists: ..."`.
- **[4_USER_FEATURES-AC-3-MCP-003]** GIVEN `get_run` on any valid run, WHEN the response is received, THEN every field in the `WorkflowRun` schema is present (including optional fields as `null`).
- **[4_USER_FEATURES-AC-3-MCP-004]** GIVEN `stream_logs(follow:false)` on a completed stage, WHEN the response arrives, THEN HTTP status is 200, the final line is `{"done":true,...}`, and the connection is closed.
- **[4_USER_FEATURES-AC-3-MCP-005]** GIVEN `signal_completion` called twice on the same terminal stage, WHEN the second call is made, THEN `"error"` is non-null with `"failed_precondition"` prefix and no state change occurs.
- **[4_USER_FEATURES-AC-3-MCP-006]** GIVEN `assert_stage_output` with a `matches` operator and invalid regex `"[unclosed"`, WHEN the call is made, THEN `"error"` is non-null with `"invalid_argument"` prefix and no assertions are evaluated.
- **[4_USER_FEATURES-AC-3-MCP-007]** GIVEN `inject_stage_input` on a `Running` stage, WHEN the call is made, THEN `"error"` is non-null with `"failed_precondition"` prefix.
- **[4_USER_FEATURES-AC-3-MCP-008]** GIVEN a request body exceeding 1 MiB, WHEN the server receives it, THEN HTTP status is 413.
- **[4_USER_FEATURES-AC-3-MCP-009]** GIVEN `cancel_run` on a run with three running stages, WHEN the call completes, THEN `checkpoint.json` contains all three stages in `Cancelled` status in a single commit.
- **[4_USER_FEATURES-AC-3-MCP-010]** GIVEN 64 concurrent observation tool calls, WHEN all are issued simultaneously, THEN all complete without error (no lock contention failures).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-MCP-003]** GIVEN `get_run` on any valid run, WHEN the response is received, THEN every field in the `WorkflowRun` schema is pres...
- **Type:** UX
- **Description:** GIVEN `get_run` on any valid run, WHEN the response is received, THEN every field in the `WorkflowRun` schema is present (including optional fields as `null`).
- **[4_USER_FEATURES-AC-3-MCP-004]** GIVEN `stream_logs(follow:false)` on a completed stage, WHEN the response arrives, THEN HTTP status is 200, the final line is `{"done":true,...}`, and the connection is closed.
- **[4_USER_FEATURES-AC-3-MCP-005]** GIVEN `signal_completion` called twice on the same terminal stage, WHEN the second call is made, THEN `"error"` is non-null with `"failed_precondition"` prefix and no state change occurs.
- **[4_USER_FEATURES-AC-3-MCP-006]** GIVEN `assert_stage_output` with a `matches` operator and invalid regex `"[unclosed"`, WHEN the call is made, THEN `"error"` is non-null with `"invalid_argument"` prefix and no assertions are evaluated.
- **[4_USER_FEATURES-AC-3-MCP-007]** GIVEN `inject_stage_input` on a `Running` stage, WHEN the call is made, THEN `"error"` is non-null with `"failed_precondition"` prefix.
- **[4_USER_FEATURES-AC-3-MCP-008]** GIVEN a request body exceeding 1 MiB, WHEN the server receives it, THEN HTTP status is 413.
- **[4_USER_FEATURES-AC-3-MCP-009]** GIVEN `cancel_run` on a run with three running stages, WHEN the call completes, THEN `checkpoint.json` contains all three stages in `Cancelled` status in a single commit.
- **[4_USER_FEATURES-AC-3-MCP-010]** GIVEN 64 concurrent observation tool calls, WHEN all are issued simultaneously, THEN all complete without error (no lock contention failures).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-MCP-004]** GIVEN `stream_logs(follow:false)` on a completed stage, WHEN the response arrives, THEN HTTP status is 200, the final...
- **Type:** UX
- **Description:** GIVEN `stream_logs(follow:false)` on a completed stage, WHEN the response arrives, THEN HTTP status is 200, the final line is `{"done":true,...}`, and the connection is closed.
- **[4_USER_FEATURES-AC-3-MCP-005]** GIVEN `signal_completion` called twice on the same terminal stage, WHEN the second call is made, THEN `"error"` is non-null with `"failed_precondition"` prefix and no state change occurs.
- **[4_USER_FEATURES-AC-3-MCP-006]** GIVEN `assert_stage_output` with a `matches` operator and invalid regex `"[unclosed"`, WHEN the call is made, THEN `"error"` is non-null with `"invalid_argument"` prefix and no assertions are evaluated.
- **[4_USER_FEATURES-AC-3-MCP-007]** GIVEN `inject_stage_input` on a `Running` stage, WHEN the call is made, THEN `"error"` is non-null with `"failed_precondition"` prefix.
- **[4_USER_FEATURES-AC-3-MCP-008]** GIVEN a request body exceeding 1 MiB, WHEN the server receives it, THEN HTTP status is 413.
- **[4_USER_FEATURES-AC-3-MCP-009]** GIVEN `cancel_run` on a run with three running stages, WHEN the call completes, THEN `checkpoint.json` contains all three stages in `Cancelled` status in a single commit.
- **[4_USER_FEATURES-AC-3-MCP-010]** GIVEN 64 concurrent observation tool calls, WHEN all are issued simultaneously, THEN all complete without error (no lock contention failures).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-MCP-005]** GIVEN `signal_completion` called twice on the same terminal stage, WHEN the second call is made, THEN `"error"` is no...
- **Type:** UX
- **Description:** GIVEN `signal_completion` called twice on the same terminal stage, WHEN the second call is made, THEN `"error"` is non-null with `"failed_precondition"` prefix and no state change occurs.
- **[4_USER_FEATURES-AC-3-MCP-006]** GIVEN `assert_stage_output` with a `matches` operator and invalid regex `"[unclosed"`, WHEN the call is made, THEN `"error"` is non-null with `"invalid_argument"` prefix and no assertions are evaluated.
- **[4_USER_FEATURES-AC-3-MCP-007]** GIVEN `inject_stage_input` on a `Running` stage, WHEN the call is made, THEN `"error"` is non-null with `"failed_precondition"` prefix.
- **[4_USER_FEATURES-AC-3-MCP-008]** GIVEN a request body exceeding 1 MiB, WHEN the server receives it, THEN HTTP status is 413.
- **[4_USER_FEATURES-AC-3-MCP-009]** GIVEN `cancel_run` on a run with three running stages, WHEN the call completes, THEN `checkpoint.json` contains all three stages in `Cancelled` status in a single commit.
- **[4_USER_FEATURES-AC-3-MCP-010]** GIVEN 64 concurrent observation tool calls, WHEN all are issued simultaneously, THEN all complete without error (no lock contention failures).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-MCP-006]** GIVEN `assert_stage_output` with a `matches` operator and invalid regex `"[unclosed"`, WHEN the call is made, THEN `"...
- **Type:** Technical
- **Description:** GIVEN `assert_stage_output` with a `matches` operator and invalid regex `"[unclosed"`, WHEN the call is made, THEN `"error"` is non-null with `"invalid_argument"` prefix and no assertions are evaluated.
- **[4_USER_FEATURES-AC-3-MCP-007]** GIVEN `inject_stage_input` on a `Running` stage, WHEN the call is made, THEN `"error"` is non-null with `"failed_precondition"` prefix.
- **[4_USER_FEATURES-AC-3-MCP-008]** GIVEN a request body exceeding 1 MiB, WHEN the server receives it, THEN HTTP status is 413.
- **[4_USER_FEATURES-AC-3-MCP-009]** GIVEN `cancel_run` on a run with three running stages, WHEN the call completes, THEN `checkpoint.json` contains all three stages in `Cancelled` status in a single commit.
- **[4_USER_FEATURES-AC-3-MCP-010]** GIVEN 64 concurrent observation tool calls, WHEN all are issued simultaneously, THEN all complete without error (no lock contention failures).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-MCP-007]** GIVEN `inject_stage_input` on a `Running` stage, WHEN the call is made, THEN `"error"` is non-null with `"failed_prec...
- **Type:** Technical
- **Description:** GIVEN `inject_stage_input` on a `Running` stage, WHEN the call is made, THEN `"error"` is non-null with `"failed_precondition"` prefix.
- **[4_USER_FEATURES-AC-3-MCP-008]** GIVEN a request body exceeding 1 MiB, WHEN the server receives it, THEN HTTP status is 413.
- **[4_USER_FEATURES-AC-3-MCP-009]** GIVEN `cancel_run` on a run with three running stages, WHEN the call completes, THEN `checkpoint.json` contains all three stages in `Cancelled` status in a single commit.
- **[4_USER_FEATURES-AC-3-MCP-010]** GIVEN 64 concurrent observation tool calls, WHEN all are issued simultaneously, THEN all complete without error (no lock contention failures).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-MCP-008]** GIVEN a request body exceeding 1 MiB, WHEN the server receives it, THEN HTTP status is 413
- **Type:** Technical
- **Description:** GIVEN a request body exceeding 1 MiB, WHEN the server receives it, THEN HTTP status is 413.
- **[4_USER_FEATURES-AC-3-MCP-009]** GIVEN `cancel_run` on a run with three running stages, WHEN the call completes, THEN `checkpoint.json` contains all three stages in `Cancelled` status in a single commit.
- **[4_USER_FEATURES-AC-3-MCP-010]** GIVEN 64 concurrent observation tool calls, WHEN all are issued simultaneously, THEN all complete without error (no lock contention failures).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-MCP-009]** GIVEN `cancel_run` on a run with three running stages, WHEN the call completes, THEN `checkpoint
- **Type:** Technical
- **Description:** GIVEN `cancel_run` on a run with three running stages, WHEN the call completes, THEN `checkpoint.json` contains all three stages in `Cancelled` status in a single commit.
- **[4_USER_FEATURES-AC-3-MCP-010]** GIVEN 64 concurrent observation tool calls, WHEN all are issued simultaneously, THEN all complete without error (no lock contention failures).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-MCP-010]** GIVEN 64 concurrent observation tool calls, WHEN all are issued simultaneously, THEN all complete without error (no l...
- **Type:** Functional
- **Description:** GIVEN 64 concurrent observation tool calls, WHEN all are issued simultaneously, THEN all complete without error (no lock contention failures).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-WF-001]** GIVEN a stage with `{{stage
- **Type:** Functional
- **Description:** GIVEN a stage with `{{stage.x.output.field}}` where stage `x` is not in the transitive `depends_on` closure, WHEN the stage attempts to run, THEN the stage fails before agent spawn with a template error message.
- **[4_USER_FEATURES-AC-3-WF-002]** GIVEN a `structured_output` stage whose `.devs_output.json` contains `"success": "true"` (string), WHEN the stage completes, THEN stage status is `Failed`.
- **[4_USER_FEATURES-AC-3-WF-003]** GIVEN a stage with `max_attempts: 3` that fails due to rate-limit on attempt 1, WHEN the stage is retried, THEN `attempt` counter remains at 1 after the rate-limit event.
- **[4_USER_FEATURES-AC-3-WF-004]** GIVEN two stages with no shared dependencies submitted simultaneously, WHEN both become `Eligible`, THEN both are dispatched within 100 ms of each other.
- **[4_USER_FEATURES-AC-3-WF-005]** GIVEN a fan-out stage with `count: 3` where sub-agent at index 1 fails and no merge handler is configured, WHEN all sub-agents complete, THEN the fan-out stage status is `Failed` and `"failed_indices": [1]` is in the error output.
- **[4_USER_FEATURES-AC-3-WF-006]** GIVEN a stage timeout of 10 seconds elapses, WHEN enforcement runs, THEN the sequence is: stdin `devs:cancel\n` → SIGTERM at T+5s → SIGKILL at T+10s → stage marked `TimedOut`.
- **[4_USER_FEATURES-AC-3-WF-007]** GIVEN a server crash with a stage in `Running` state, WHEN the server restarts and loads checkpoints, THEN the stage status is `Eligible` (not `Running`).
- **[4_USER_FEATURES-AC-3-WF-008]** GIVEN `cancel_run` called while stage A is Running and stage B is Waiting, WHEN cancellation completes, THEN both stages are `Cancelled` in the same checkpoint write.
- **[4_USER_FEATURES-AC-3-WF-009]** GIVEN a pool with `max_concurrent: 4` and 10 stages all becoming `Eligible` simultaneously, WHEN dispatching occurs, THEN exactly 4 stages transition to `Running` and 6 remain `Eligible`.
- **[4_USER_FEATURES-AC-3-WF-010]** GIVEN `devs project remove` called while a run is active, WHEN the command completes, THEN the project status is `removing`, the active run continues, and a subsequent `submit_run` for that project returns an error.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-WF-002]** GIVEN a `structured_output` stage whose `
- **Type:** Functional
- **Description:** GIVEN a `structured_output` stage whose `.devs_output.json` contains `"success": "true"` (string), WHEN the stage completes, THEN stage status is `Failed`.
- **[4_USER_FEATURES-AC-3-WF-003]** GIVEN a stage with `max_attempts: 3` that fails due to rate-limit on attempt 1, WHEN the stage is retried, THEN `attempt` counter remains at 1 after the rate-limit event.
- **[4_USER_FEATURES-AC-3-WF-004]** GIVEN two stages with no shared dependencies submitted simultaneously, WHEN both become `Eligible`, THEN both are dispatched within 100 ms of each other.
- **[4_USER_FEATURES-AC-3-WF-005]** GIVEN a fan-out stage with `count: 3` where sub-agent at index 1 fails and no merge handler is configured, WHEN all sub-agents complete, THEN the fan-out stage status is `Failed` and `"failed_indices": [1]` is in the error output.
- **[4_USER_FEATURES-AC-3-WF-006]** GIVEN a stage timeout of 10 seconds elapses, WHEN enforcement runs, THEN the sequence is: stdin `devs:cancel\n` → SIGTERM at T+5s → SIGKILL at T+10s → stage marked `TimedOut`.
- **[4_USER_FEATURES-AC-3-WF-007]** GIVEN a server crash with a stage in `Running` state, WHEN the server restarts and loads checkpoints, THEN the stage status is `Eligible` (not `Running`).
- **[4_USER_FEATURES-AC-3-WF-008]** GIVEN `cancel_run` called while stage A is Running and stage B is Waiting, WHEN cancellation completes, THEN both stages are `Cancelled` in the same checkpoint write.
- **[4_USER_FEATURES-AC-3-WF-009]** GIVEN a pool with `max_concurrent: 4` and 10 stages all becoming `Eligible` simultaneously, WHEN dispatching occurs, THEN exactly 4 stages transition to `Running` and 6 remain `Eligible`.
- **[4_USER_FEATURES-AC-3-WF-010]** GIVEN `devs project remove` called while a run is active, WHEN the command completes, THEN the project status is `removing`, the active run continues, and a subsequent `submit_run` for that project returns an error.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-WF-003]** GIVEN a stage with `max_attempts: 3` that fails due to rate-limit on attempt 1, WHEN the stage is retried, THEN `atte...
- **Type:** Functional
- **Description:** GIVEN a stage with `max_attempts: 3` that fails due to rate-limit on attempt 1, WHEN the stage is retried, THEN `attempt` counter remains at 1 after the rate-limit event.
- **[4_USER_FEATURES-AC-3-WF-004]** GIVEN two stages with no shared dependencies submitted simultaneously, WHEN both become `Eligible`, THEN both are dispatched within 100 ms of each other.
- **[4_USER_FEATURES-AC-3-WF-005]** GIVEN a fan-out stage with `count: 3` where sub-agent at index 1 fails and no merge handler is configured, WHEN all sub-agents complete, THEN the fan-out stage status is `Failed` and `"failed_indices": [1]` is in the error output.
- **[4_USER_FEATURES-AC-3-WF-006]** GIVEN a stage timeout of 10 seconds elapses, WHEN enforcement runs, THEN the sequence is: stdin `devs:cancel\n` → SIGTERM at T+5s → SIGKILL at T+10s → stage marked `TimedOut`.
- **[4_USER_FEATURES-AC-3-WF-007]** GIVEN a server crash with a stage in `Running` state, WHEN the server restarts and loads checkpoints, THEN the stage status is `Eligible` (not `Running`).
- **[4_USER_FEATURES-AC-3-WF-008]** GIVEN `cancel_run` called while stage A is Running and stage B is Waiting, WHEN cancellation completes, THEN both stages are `Cancelled` in the same checkpoint write.
- **[4_USER_FEATURES-AC-3-WF-009]** GIVEN a pool with `max_concurrent: 4` and 10 stages all becoming `Eligible` simultaneously, WHEN dispatching occurs, THEN exactly 4 stages transition to `Running` and 6 remain `Eligible`.
- **[4_USER_FEATURES-AC-3-WF-010]** GIVEN `devs project remove` called while a run is active, WHEN the command completes, THEN the project status is `removing`, the active run continues, and a subsequent `submit_run` for that project returns an error.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-WF-004]** GIVEN two stages with no shared dependencies submitted simultaneously, WHEN both become `Eligible`, THEN both are dis...
- **Type:** Functional
- **Description:** GIVEN two stages with no shared dependencies submitted simultaneously, WHEN both become `Eligible`, THEN both are dispatched within 100 ms of each other.
- **[4_USER_FEATURES-AC-3-WF-005]** GIVEN a fan-out stage with `count: 3` where sub-agent at index 1 fails and no merge handler is configured, WHEN all sub-agents complete, THEN the fan-out stage status is `Failed` and `"failed_indices": [1]` is in the error output.
- **[4_USER_FEATURES-AC-3-WF-006]** GIVEN a stage timeout of 10 seconds elapses, WHEN enforcement runs, THEN the sequence is: stdin `devs:cancel\n` → SIGTERM at T+5s → SIGKILL at T+10s → stage marked `TimedOut`.
- **[4_USER_FEATURES-AC-3-WF-007]** GIVEN a server crash with a stage in `Running` state, WHEN the server restarts and loads checkpoints, THEN the stage status is `Eligible` (not `Running`).
- **[4_USER_FEATURES-AC-3-WF-008]** GIVEN `cancel_run` called while stage A is Running and stage B is Waiting, WHEN cancellation completes, THEN both stages are `Cancelled` in the same checkpoint write.
- **[4_USER_FEATURES-AC-3-WF-009]** GIVEN a pool with `max_concurrent: 4` and 10 stages all becoming `Eligible` simultaneously, WHEN dispatching occurs, THEN exactly 4 stages transition to `Running` and 6 remain `Eligible`.
- **[4_USER_FEATURES-AC-3-WF-010]** GIVEN `devs project remove` called while a run is active, WHEN the command completes, THEN the project status is `removing`, the active run continues, and a subsequent `submit_run` for that project returns an error.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-WF-005]** GIVEN a fan-out stage with `count: 3` where sub-agent at index 1 fails and no merge handler is configured, WHEN all s...
- **Type:** Functional
- **Description:** GIVEN a fan-out stage with `count: 3` where sub-agent at index 1 fails and no merge handler is configured, WHEN all sub-agents complete, THEN the fan-out stage status is `Failed` and `"failed_indices": [1]` is in the error output.
- **[4_USER_FEATURES-AC-3-WF-006]** GIVEN a stage timeout of 10 seconds elapses, WHEN enforcement runs, THEN the sequence is: stdin `devs:cancel\n` → SIGTERM at T+5s → SIGKILL at T+10s → stage marked `TimedOut`.
- **[4_USER_FEATURES-AC-3-WF-007]** GIVEN a server crash with a stage in `Running` state, WHEN the server restarts and loads checkpoints, THEN the stage status is `Eligible` (not `Running`).
- **[4_USER_FEATURES-AC-3-WF-008]** GIVEN `cancel_run` called while stage A is Running and stage B is Waiting, WHEN cancellation completes, THEN both stages are `Cancelled` in the same checkpoint write.
- **[4_USER_FEATURES-AC-3-WF-009]** GIVEN a pool with `max_concurrent: 4` and 10 stages all becoming `Eligible` simultaneously, WHEN dispatching occurs, THEN exactly 4 stages transition to `Running` and 6 remain `Eligible`.
- **[4_USER_FEATURES-AC-3-WF-010]** GIVEN `devs project remove` called while a run is active, WHEN the command completes, THEN the project status is `removing`, the active run continues, and a subsequent `submit_run` for that project returns an error.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-WF-006]** GIVEN a stage timeout of 10 seconds elapses, WHEN enforcement runs, THEN the sequence is: stdin `devs:cancel\n` → SIG...
- **Type:** Functional
- **Description:** GIVEN a stage timeout of 10 seconds elapses, WHEN enforcement runs, THEN the sequence is: stdin `devs:cancel\n` → SIGTERM at T+5s → SIGKILL at T+10s → stage marked `TimedOut`.
- **[4_USER_FEATURES-AC-3-WF-007]** GIVEN a server crash with a stage in `Running` state, WHEN the server restarts and loads checkpoints, THEN the stage status is `Eligible` (not `Running`).
- **[4_USER_FEATURES-AC-3-WF-008]** GIVEN `cancel_run` called while stage A is Running and stage B is Waiting, WHEN cancellation completes, THEN both stages are `Cancelled` in the same checkpoint write.
- **[4_USER_FEATURES-AC-3-WF-009]** GIVEN a pool with `max_concurrent: 4` and 10 stages all becoming `Eligible` simultaneously, WHEN dispatching occurs, THEN exactly 4 stages transition to `Running` and 6 remain `Eligible`.
- **[4_USER_FEATURES-AC-3-WF-010]** GIVEN `devs project remove` called while a run is active, WHEN the command completes, THEN the project status is `removing`, the active run continues, and a subsequent `submit_run` for that project returns an error.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-WF-007]** GIVEN a server crash with a stage in `Running` state, WHEN the server restarts and loads checkpoints, THEN the stage ...
- **Type:** Functional
- **Description:** GIVEN a server crash with a stage in `Running` state, WHEN the server restarts and loads checkpoints, THEN the stage status is `Eligible` (not `Running`).
- **[4_USER_FEATURES-AC-3-WF-008]** GIVEN `cancel_run` called while stage A is Running and stage B is Waiting, WHEN cancellation completes, THEN both stages are `Cancelled` in the same checkpoint write.
- **[4_USER_FEATURES-AC-3-WF-009]** GIVEN a pool with `max_concurrent: 4` and 10 stages all becoming `Eligible` simultaneously, WHEN dispatching occurs, THEN exactly 4 stages transition to `Running` and 6 remain `Eligible`.
- **[4_USER_FEATURES-AC-3-WF-010]** GIVEN `devs project remove` called while a run is active, WHEN the command completes, THEN the project status is `removing`, the active run continues, and a subsequent `submit_run` for that project returns an error.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-WF-008]** GIVEN `cancel_run` called while stage A is Running and stage B is Waiting, WHEN cancellation completes, THEN both sta...
- **Type:** Functional
- **Description:** GIVEN `cancel_run` called while stage A is Running and stage B is Waiting, WHEN cancellation completes, THEN both stages are `Cancelled` in the same checkpoint write.
- **[4_USER_FEATURES-AC-3-WF-009]** GIVEN a pool with `max_concurrent: 4` and 10 stages all becoming `Eligible` simultaneously, WHEN dispatching occurs, THEN exactly 4 stages transition to `Running` and 6 remain `Eligible`.
- **[4_USER_FEATURES-AC-3-WF-010]** GIVEN `devs project remove` called while a run is active, WHEN the command completes, THEN the project status is `removing`, the active run continues, and a subsequent `submit_run` for that project returns an error.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-WF-009]** GIVEN a pool with `max_concurrent: 4` and 10 stages all becoming `Eligible` simultaneously, WHEN dispatching occurs, ...
- **Type:** Functional
- **Description:** GIVEN a pool with `max_concurrent: 4` and 10 stages all becoming `Eligible` simultaneously, WHEN dispatching occurs, THEN exactly 4 stages transition to `Running` and 6 remain `Eligible`.
- **[4_USER_FEATURES-AC-3-WF-010]** GIVEN `devs project remove` called while a run is active, WHEN the command completes, THEN the project status is `removing`, the active run continues, and a subsequent `submit_run` for that project returns an error.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-WF-010]** GIVEN `devs project remove` called while a run is active, WHEN the command completes, THEN the project status is `rem...
- **Type:** Functional
- **Description:** GIVEN `devs project remove` called while a run is active, WHEN the command completes, THEN the project status is `removing`, the active run continues, and a subsequent `submit_run` for that project returns an error.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-DO-001]** GIVEN `
- **Type:** UX
- **Description:** GIVEN `./do presubmit` running for 16 minutes, WHEN the 15-minute wall-clock deadline passes, THEN all child processes are killed and `./do presubmit` exits non-zero.
- **[4_USER_FEATURES-AC-3-DO-002]** GIVEN `./do setup` run twice, WHEN the second run completes, THEN exit code is 0 and no duplicate installations occur.
- **[4_USER_FEATURES-AC-3-DO-003]** GIVEN `./do test` where one test has annotation `// Covers: NONEXISTENT-999` referencing a non-existent requirement, WHEN the command runs, THEN exit code is non-zero and `target/traceability.json` contains the stale annotation in `stale_annotations`.
- **[4_USER_FEATURES-AC-3-DO-004]** GIVEN `./do coverage` where QG-002 (E2E aggregate) is below 80%, WHEN the command runs, THEN exit code is non-zero and `target/coverage/report.json` contains `"overall_passed": false`.
- **[4_USER_FEATURES-AC-3-DO-005]** GIVEN `./do coverage` completes successfully, WHEN `target/coverage/report.json` is inspected, THEN it contains exactly 5 gate objects with `gate_id` values `QG-001` through `QG-005`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-DO-002]** GIVEN `
- **Type:** UX
- **Description:** GIVEN `./do setup` run twice, WHEN the second run completes, THEN exit code is 0 and no duplicate installations occur.
- **[4_USER_FEATURES-AC-3-DO-003]** GIVEN `./do test` where one test has annotation `// Covers: NONEXISTENT-999` referencing a non-existent requirement, WHEN the command runs, THEN exit code is non-zero and `target/traceability.json` contains the stale annotation in `stale_annotations`.
- **[4_USER_FEATURES-AC-3-DO-004]** GIVEN `./do coverage` where QG-002 (E2E aggregate) is below 80%, WHEN the command runs, THEN exit code is non-zero and `target/coverage/report.json` contains `"overall_passed": false`.
- **[4_USER_FEATURES-AC-3-DO-005]** GIVEN `./do coverage` completes successfully, WHEN `target/coverage/report.json` is inspected, THEN it contains exactly 5 gate objects with `gate_id` values `QG-001` through `QG-005`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-DO-003]** GIVEN `
- **Type:** UX
- **Description:** GIVEN `./do test` where one test has annotation `// Covers: NONEXISTENT-999` referencing a non-existent requirement, WHEN the command runs, THEN exit code is non-zero and `target/traceability.json` contains the stale annotation in `stale_annotations`.
- **[4_USER_FEATURES-AC-3-DO-004]** GIVEN `./do coverage` where QG-002 (E2E aggregate) is below 80%, WHEN the command runs, THEN exit code is non-zero and `target/coverage/report.json` contains `"overall_passed": false`.
- **[4_USER_FEATURES-AC-3-DO-005]** GIVEN `./do coverage` completes successfully, WHEN `target/coverage/report.json` is inspected, THEN it contains exactly 5 gate objects with `gate_id` values `QG-001` through `QG-005`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-DO-004]** GIVEN `
- **Type:** Functional
- **Description:** GIVEN `./do coverage` where QG-002 (E2E aggregate) is below 80%, WHEN the command runs, THEN exit code is non-zero and `target/coverage/report.json` contains `"overall_passed": false`.
- **[4_USER_FEATURES-AC-3-DO-005]** GIVEN `./do coverage` completes successfully, WHEN `target/coverage/report.json` is inspected, THEN it contains exactly 5 gate objects with `gate_id` values `QG-001` through `QG-005`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-3-DO-005]** GIVEN `
- **Type:** Functional
- **Description:** GIVEN `./do coverage` completes successfully, WHEN `target/coverage/report.json` is inspected, THEN it contains exactly 5 gate objects with `gate_id` values `QG-001` through `QG-005`.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-068]** All TUI output uses only standard ASCII characters (codepoints U+0020–U+007E) for structural elements including box b...
- **Type:** UX
- **Description:** All TUI output uses only standard ASCII characters (codepoints U+0020–U+007E) for structural elements including box borders, DAG edges, status labels, and separator lines. No Unicode box-drawing characters (U+2500–U+257F), block elements, or emoji are used in any interface element. This ensures compatibility with the broadest range of terminal emulators including those on headless Linux servers that may not have full UTF-8 locale support.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-069]** Stage status labels in the TUI are exactly four uppercase ASCII characters
- **Type:** UX
- **Description:** Stage status labels in the TUI are exactly four uppercase ASCII characters. The complete mapping from `StageStatus` enum value to TUI abbreviation is:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-070]** Color is a secondary (non-exclusive) channel for conveying state
- **Type:** UX
- **Description:** Color is a secondary (non-exclusive) channel for conveying state. The following color scheme is used when terminal color is detected, but the TUI remains fully usable with color disabled:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-071]** All TUI controls are operable via keyboard without a mouse
- **Type:** UX
- **Description:** All TUI controls are operable via keyboard without a mouse. The complete keyboard binding table for the TUI is:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-072]** The TUI requires a minimum terminal size of 80 columns × 24 rows
- **Type:** UX
- **Description:** The TUI requires a minimum terminal size of 80 columns × 24 rows. At or above this size, all interactive elements, stage boxes, status labels, and the log tail are fully visible without truncation of critical information.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-073]** Log output from `devs logs` (in default text mode) is plain UTF-8 text, one log line per output line
- **Type:** Functional
- **Description:** Log output from `devs logs` (in default text mode) is plain UTF-8 text, one log line per output line. Lines from `stdout` and `stderr` are interleaved in chronological order with a stream prefix:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-074]** All CLI commands support `--format json` as a machine-readable output mode
- **Type:** Functional
- **Description:** All CLI commands support `--format json` as a machine-readable output mode. When `--format json` is active:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-075]** JSON error responses from the CLI use the following schema:
- **Type:** Functional
- **Description:** JSON error responses from the CLI use the following schema:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-076]** All MCP responses use the following envelope structure
- **Type:** Technical
- **Description:** All MCP responses use the following envelope structure. `result` and `error` are mutually exclusive: exactly one is non-null.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-077]** All timestamps in any JSON output (CLI `--format json`, MCP responses, checkpoint files, webhook payloads) use RFC 33...
- **Type:** Technical
- **Description:** All timestamps in any JSON output (CLI `--format json`, MCP responses, checkpoint files, webhook payloads) use RFC 3339 format with millisecond precision and a `Z` timezone suffix.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-078]** All status enum values in any JSON output use lowercase strings with underscore word-separators
- **Type:** Functional
- **Description:** All status enum values in any JSON output use lowercase strings with underscore word-separators.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-079]** All UUIDs in any JSON output use lowercase hyphenated format (8-4-4-4-12 hex groups)
- **Type:** UX
- **Description:** All UUIDs in any JSON output use lowercase hyphenated format (8-4-4-4-12 hex groups).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-080]** All user-facing text in `devs` — including CLI output, TUI labels, TUI help overlays, error messages, log prefixes, a...
- **Type:** UX
- **Description:** All user-facing text in `devs` — including CLI output, TUI labels, TUI help overlays, error messages, log prefixes, and server startup messages — is English only at MVP. No internationalization (i18n) framework, locale-detection logic, or message catalogue is introduced into any crate at MVP.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-081]** Error messages in MCP responses, gRPC error details, and CLI JSON error output begin with a machine-stable prefix tok...
- **Type:** Technical
- **Description:** Error messages in MCP responses, gRPC error details, and CLI JSON error output begin with a machine-stable prefix token followed by a colon and space. The prefix token is invariant across releases; the human-readable detail that follows may change.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-082]** Time and date values in user-visible output use locale-neutral formats with no dependence on the hos
- **Type:** Functional
- **Description:** Time and date values in user-visible output use locale-neutral formats with no dependence on the host locale settings:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-083]** All `
- **Type:** UX
- **Description:** All `./do` script commands produce identical exit codes on Linux, macOS, and Windows (Git Bash). Behavior — including output, exit codes, and file creation — MUST NOT diverge across platforms. The `./do` script is POSIX `sh` with no bash-specific syntax.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-084]** File paths in `devs
- **Type:** Functional
- **Description:** File paths in `devs.toml`, the project registry (`~/.config/devs/projects.toml`), and all API-level path fields use forward-slash (`/`) as the path separator in stored form. The platform-native separator (`\` on Windows) is accepted on input and normalized to `/` before validation, storage, or comparison.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-085]** The TUI renders correctly in standard terminal emulators on all three supported platforms
- **Type:** UX
- **Description:** The TUI renders correctly in standard terminal emulators on all three supported platforms. The following terminals are the reference targets:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-TUI-001]** GIVEN a TUI rendered to a `TestBackend`, WHEN any stage is in `Completed` status, THEN the text `DONE` appears in the...
- **Type:** UX
- **Description:** GIVEN a TUI rendered to a `TestBackend`, WHEN any stage is in `Completed` status, THEN the text `DONE` appears in the rendered buffer. No test asserts on color codes.
- **[4_USER_FEATURES-AC-4-TUI-002]** GIVEN a TUI rendered to a `TestBackend`, WHEN any stage is in `TimedOut` status, THEN the text `TIME` appears in the rendered buffer.
- **[4_USER_FEATURES-AC-4-TUI-003]** GIVEN a TUI rendered to a `TestBackend` with dimensions 80×24, WHEN a run with 3 stages is displayed, THEN no stage box is truncated and all stage names are visible.
- **[4_USER_FEATURES-AC-4-TUI-004]** GIVEN a TUI rendered to a `TestBackend` with dimensions 79×24, WHEN rendered, THEN the buffer contains the text `"Terminal too small"`.
- **[4_USER_FEATURES-AC-4-TUI-005]** GIVEN any TUI snapshot in `crates/devs-tui/tests/snapshots/`, WHEN scanned for bytes outside the range U+0020–U+007E and standard C0 control codes (newline, carriage return), THEN no such bytes are found except within actual log content lines.
- **[4_USER_FEATURES-AC-4-TUI-006]** GIVEN `NO_COLOR=1` is set in the environment, WHEN the TUI is rendered, THEN no ANSI SGR escape sequences appear in the output.
- **[4_USER_FEATURES-AC-4-TUI-007]** GIVEN a stage with a 25-character name, WHEN rendered in a stage box, THEN the name is truncated to 19 characters followed by `~`.
- **[4_USER_FEATURES-AC-4-TUI-008]** GIVEN the TUI help overlay is triggered by pressing `?`, WHEN rendered, THEN the text `"q"` and `"Quit"` appear in the buffer.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-TUI-002]** GIVEN a TUI rendered to a `TestBackend`, WHEN any stage is in `TimedOut` status, THEN the text `TIME` appears in the ...
- **Type:** UX
- **Description:** GIVEN a TUI rendered to a `TestBackend`, WHEN any stage is in `TimedOut` status, THEN the text `TIME` appears in the rendered buffer.
- **[4_USER_FEATURES-AC-4-TUI-003]** GIVEN a TUI rendered to a `TestBackend` with dimensions 80×24, WHEN a run with 3 stages is displayed, THEN no stage box is truncated and all stage names are visible.
- **[4_USER_FEATURES-AC-4-TUI-004]** GIVEN a TUI rendered to a `TestBackend` with dimensions 79×24, WHEN rendered, THEN the buffer contains the text `"Terminal too small"`.
- **[4_USER_FEATURES-AC-4-TUI-005]** GIVEN any TUI snapshot in `crates/devs-tui/tests/snapshots/`, WHEN scanned for bytes outside the range U+0020–U+007E and standard C0 control codes (newline, carriage return), THEN no such bytes are found except within actual log content lines.
- **[4_USER_FEATURES-AC-4-TUI-006]** GIVEN `NO_COLOR=1` is set in the environment, WHEN the TUI is rendered, THEN no ANSI SGR escape sequences appear in the output.
- **[4_USER_FEATURES-AC-4-TUI-007]** GIVEN a stage with a 25-character name, WHEN rendered in a stage box, THEN the name is truncated to 19 characters followed by `~`.
- **[4_USER_FEATURES-AC-4-TUI-008]** GIVEN the TUI help overlay is triggered by pressing `?`, WHEN rendered, THEN the text `"q"` and `"Quit"` appear in the buffer.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-TUI-003]** GIVEN a TUI rendered to a `TestBackend` with dimensions 80×24, WHEN a run with 3 stages is displayed, THEN no stage b...
- **Type:** UX
- **Description:** GIVEN a TUI rendered to a `TestBackend` with dimensions 80×24, WHEN a run with 3 stages is displayed, THEN no stage box is truncated and all stage names are visible.
- **[4_USER_FEATURES-AC-4-TUI-004]** GIVEN a TUI rendered to a `TestBackend` with dimensions 79×24, WHEN rendered, THEN the buffer contains the text `"Terminal too small"`.
- **[4_USER_FEATURES-AC-4-TUI-005]** GIVEN any TUI snapshot in `crates/devs-tui/tests/snapshots/`, WHEN scanned for bytes outside the range U+0020–U+007E and standard C0 control codes (newline, carriage return), THEN no such bytes are found except within actual log content lines.
- **[4_USER_FEATURES-AC-4-TUI-006]** GIVEN `NO_COLOR=1` is set in the environment, WHEN the TUI is rendered, THEN no ANSI SGR escape sequences appear in the output.
- **[4_USER_FEATURES-AC-4-TUI-007]** GIVEN a stage with a 25-character name, WHEN rendered in a stage box, THEN the name is truncated to 19 characters followed by `~`.
- **[4_USER_FEATURES-AC-4-TUI-008]** GIVEN the TUI help overlay is triggered by pressing `?`, WHEN rendered, THEN the text `"q"` and `"Quit"` appear in the buffer.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-TUI-004]** GIVEN a TUI rendered to a `TestBackend` with dimensions 79×24, WHEN rendered, THEN the buffer contains the text `"Ter...
- **Type:** UX
- **Description:** GIVEN a TUI rendered to a `TestBackend` with dimensions 79×24, WHEN rendered, THEN the buffer contains the text `"Terminal too small"`.
- **[4_USER_FEATURES-AC-4-TUI-005]** GIVEN any TUI snapshot in `crates/devs-tui/tests/snapshots/`, WHEN scanned for bytes outside the range U+0020–U+007E and standard C0 control codes (newline, carriage return), THEN no such bytes are found except within actual log content lines.
- **[4_USER_FEATURES-AC-4-TUI-006]** GIVEN `NO_COLOR=1` is set in the environment, WHEN the TUI is rendered, THEN no ANSI SGR escape sequences appear in the output.
- **[4_USER_FEATURES-AC-4-TUI-007]** GIVEN a stage with a 25-character name, WHEN rendered in a stage box, THEN the name is truncated to 19 characters followed by `~`.
- **[4_USER_FEATURES-AC-4-TUI-008]** GIVEN the TUI help overlay is triggered by pressing `?`, WHEN rendered, THEN the text `"q"` and `"Quit"` appear in the buffer.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-TUI-005]** GIVEN any TUI snapshot in `crates/devs-tui/tests/snapshots/`, WHEN scanned for bytes outside the range U+0020–U+007E ...
- **Type:** UX
- **Description:** GIVEN any TUI snapshot in `crates/devs-tui/tests/snapshots/`, WHEN scanned for bytes outside the range U+0020–U+007E and standard C0 control codes (newline, carriage return), THEN no such bytes are found except within actual log content lines.
- **[4_USER_FEATURES-AC-4-TUI-006]** GIVEN `NO_COLOR=1` is set in the environment, WHEN the TUI is rendered, THEN no ANSI SGR escape sequences appear in the output.
- **[4_USER_FEATURES-AC-4-TUI-007]** GIVEN a stage with a 25-character name, WHEN rendered in a stage box, THEN the name is truncated to 19 characters followed by `~`.
- **[4_USER_FEATURES-AC-4-TUI-008]** GIVEN the TUI help overlay is triggered by pressing `?`, WHEN rendered, THEN the text `"q"` and `"Quit"` appear in the buffer.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-TUI-006]** GIVEN `NO_COLOR=1` is set in the environment, WHEN the TUI is rendered, THEN no ANSI SGR escape sequences appear in t...
- **Type:** UX
- **Description:** GIVEN `NO_COLOR=1` is set in the environment, WHEN the TUI is rendered, THEN no ANSI SGR escape sequences appear in the output.
- **[4_USER_FEATURES-AC-4-TUI-007]** GIVEN a stage with a 25-character name, WHEN rendered in a stage box, THEN the name is truncated to 19 characters followed by `~`.
- **[4_USER_FEATURES-AC-4-TUI-008]** GIVEN the TUI help overlay is triggered by pressing `?`, WHEN rendered, THEN the text `"q"` and `"Quit"` appear in the buffer.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-TUI-007]** GIVEN a stage with a 25-character name, WHEN rendered in a stage box, THEN the name is truncated to 19 characters fol...
- **Type:** UX
- **Description:** GIVEN a stage with a 25-character name, WHEN rendered in a stage box, THEN the name is truncated to 19 characters followed by `~`.
- **[4_USER_FEATURES-AC-4-TUI-008]** GIVEN the TUI help overlay is triggered by pressing `?`, WHEN rendered, THEN the text `"q"` and `"Quit"` appear in the buffer.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-TUI-008]** GIVEN the TUI help overlay is triggered by pressing `?`, WHEN rendered, THEN the text `"q"` and `"Quit"` appear in th...
- **Type:** UX
- **Description:** GIVEN the TUI help overlay is triggered by pressing `?`, WHEN rendered, THEN the text `"q"` and `"Quit"` appear in the buffer.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-JSON-001]** GIVEN `devs submit --format json` succeeds, WHEN the output is parsed as JSON, THEN it contains fields `run_id`, `slu...
- **Type:** Technical
- **Description:** GIVEN `devs submit --format json` succeeds, WHEN the output is parsed as JSON, THEN it contains fields `run_id`, `slug`, `workflow_name`, `project_id`, and `status` all with non-null values.
- **[4_USER_FEATURES-AC-4-JSON-002]** GIVEN `devs status <run-id> --format json` is called on a run that has not yet started, WHEN parsed, THEN `started_at` is present in the JSON with value `null`.
- **[4_USER_FEATURES-AC-4-JSON-003]** GIVEN `devs list --format json` with no runs, WHEN parsed, THEN `runs` is an empty JSON array `[]` and `total` is `0`.
- **[4_USER_FEATURES-AC-4-JSON-004]** GIVEN `devs submit --format json` is called with an invalid workflow name, WHEN the output is parsed, THEN `error` begins with `"invalid_argument:"` and `code` is `4`.
- **[4_USER_FEATURES-AC-4-JSON-005]** GIVEN `devs status --format json` is called with a run ID that does not exist, WHEN the output is parsed, THEN `error` begins with `"not_found:"` and `code` is `2`.
- **[4_USER_FEATURES-AC-4-JSON-006]** GIVEN `devs logs --format json --follow` is active and the run completes, WHEN all output lines are collected, THEN the final line is `{"done": true, "total_lines": <n>, "truncated": false}`.
- **[4_USER_FEATURES-AC-4-JSON-007]** GIVEN `devs logs --format json` is active with sequence-numbered chunks, WHEN all chunks are collected, THEN the `sequence` values form a contiguous series starting at 1 with no gaps.
- **[4_USER_FEATURES-AC-4-JSON-008]** GIVEN a MCP `get_run` response for a running stage, WHEN parsed, THEN `completed_at` is present as a JSON key with value `null` (not absent from the object).
- **[4_USER_FEATURES-AC-4-JSON-009]** GIVEN a MCP `get_run` response, WHEN parsed, THEN `status` is a lowercase string (e.g., `"running"`, not `"Running"`).
- **[4_USER_FEATURES-AC-4-JSON-010]** GIVEN a MCP `get_stage_output` response, WHEN parsed, THEN `stdout` is a non-null string (empty string `""` if no output, never `null`).
- **[4_USER_FEATURES-AC-4-JSON-011]** GIVEN a MCP tool returns an error, WHEN parsed, THEN `result` is `null` and `error` is a non-null string beginning with a registered prefix token.
- **[4_USER_FEATURES-AC-4-JSON-012]** GIVEN a MCP tool returns success, WHEN parsed, THEN `error` is `null` and `result` is a non-null object.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-JSON-002]** GIVEN `devs status <run-id> --format json` is called on a run that has not yet started, WHEN parsed, THEN `started_at...
- **Type:** Technical
- **Description:** GIVEN `devs status <run-id> --format json` is called on a run that has not yet started, WHEN parsed, THEN `started_at` is present in the JSON with value `null`.
- **[4_USER_FEATURES-AC-4-JSON-003]** GIVEN `devs list --format json` with no runs, WHEN parsed, THEN `runs` is an empty JSON array `[]` and `total` is `0`.
- **[4_USER_FEATURES-AC-4-JSON-004]** GIVEN `devs submit --format json` is called with an invalid workflow name, WHEN the output is parsed, THEN `error` begins with `"invalid_argument:"` and `code` is `4`.
- **[4_USER_FEATURES-AC-4-JSON-005]** GIVEN `devs status --format json` is called with a run ID that does not exist, WHEN the output is parsed, THEN `error` begins with `"not_found:"` and `code` is `2`.
- **[4_USER_FEATURES-AC-4-JSON-006]** GIVEN `devs logs --format json --follow` is active and the run completes, WHEN all output lines are collected, THEN the final line is `{"done": true, "total_lines": <n>, "truncated": false}`.
- **[4_USER_FEATURES-AC-4-JSON-007]** GIVEN `devs logs --format json` is active with sequence-numbered chunks, WHEN all chunks are collected, THEN the `sequence` values form a contiguous series starting at 1 with no gaps.
- **[4_USER_FEATURES-AC-4-JSON-008]** GIVEN a MCP `get_run` response for a running stage, WHEN parsed, THEN `completed_at` is present as a JSON key with value `null` (not absent from the object).
- **[4_USER_FEATURES-AC-4-JSON-009]** GIVEN a MCP `get_run` response, WHEN parsed, THEN `status` is a lowercase string (e.g., `"running"`, not `"Running"`).
- **[4_USER_FEATURES-AC-4-JSON-010]** GIVEN a MCP `get_stage_output` response, WHEN parsed, THEN `stdout` is a non-null string (empty string `""` if no output, never `null`).
- **[4_USER_FEATURES-AC-4-JSON-011]** GIVEN a MCP tool returns an error, WHEN parsed, THEN `result` is `null` and `error` is a non-null string beginning with a registered prefix token.
- **[4_USER_FEATURES-AC-4-JSON-012]** GIVEN a MCP tool returns success, WHEN parsed, THEN `error` is `null` and `result` is a non-null object.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-JSON-003]** GIVEN `devs list --format json` with no runs, WHEN parsed, THEN `runs` is an empty JSON array `[]` and `total` is `0`
- **Type:** Technical
- **Description:** GIVEN `devs list --format json` with no runs, WHEN parsed, THEN `runs` is an empty JSON array `[]` and `total` is `0`.
- **[4_USER_FEATURES-AC-4-JSON-004]** GIVEN `devs submit --format json` is called with an invalid workflow name, WHEN the output is parsed, THEN `error` begins with `"invalid_argument:"` and `code` is `4`.
- **[4_USER_FEATURES-AC-4-JSON-005]** GIVEN `devs status --format json` is called with a run ID that does not exist, WHEN the output is parsed, THEN `error` begins with `"not_found:"` and `code` is `2`.
- **[4_USER_FEATURES-AC-4-JSON-006]** GIVEN `devs logs --format json --follow` is active and the run completes, WHEN all output lines are collected, THEN the final line is `{"done": true, "total_lines": <n>, "truncated": false}`.
- **[4_USER_FEATURES-AC-4-JSON-007]** GIVEN `devs logs --format json` is active with sequence-numbered chunks, WHEN all chunks are collected, THEN the `sequence` values form a contiguous series starting at 1 with no gaps.
- **[4_USER_FEATURES-AC-4-JSON-008]** GIVEN a MCP `get_run` response for a running stage, WHEN parsed, THEN `completed_at` is present as a JSON key with value `null` (not absent from the object).
- **[4_USER_FEATURES-AC-4-JSON-009]** GIVEN a MCP `get_run` response, WHEN parsed, THEN `status` is a lowercase string (e.g., `"running"`, not `"Running"`).
- **[4_USER_FEATURES-AC-4-JSON-010]** GIVEN a MCP `get_stage_output` response, WHEN parsed, THEN `stdout` is a non-null string (empty string `""` if no output, never `null`).
- **[4_USER_FEATURES-AC-4-JSON-011]** GIVEN a MCP tool returns an error, WHEN parsed, THEN `result` is `null` and `error` is a non-null string beginning with a registered prefix token.
- **[4_USER_FEATURES-AC-4-JSON-012]** GIVEN a MCP tool returns success, WHEN parsed, THEN `error` is `null` and `result` is a non-null object.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-JSON-004]** GIVEN `devs submit --format json` is called with an invalid workflow name, WHEN the output is parsed, THEN `error` be...
- **Type:** Technical
- **Description:** GIVEN `devs submit --format json` is called with an invalid workflow name, WHEN the output is parsed, THEN `error` begins with `"invalid_argument:"` and `code` is `4`.
- **[4_USER_FEATURES-AC-4-JSON-005]** GIVEN `devs status --format json` is called with a run ID that does not exist, WHEN the output is parsed, THEN `error` begins with `"not_found:"` and `code` is `2`.
- **[4_USER_FEATURES-AC-4-JSON-006]** GIVEN `devs logs --format json --follow` is active and the run completes, WHEN all output lines are collected, THEN the final line is `{"done": true, "total_lines": <n>, "truncated": false}`.
- **[4_USER_FEATURES-AC-4-JSON-007]** GIVEN `devs logs --format json` is active with sequence-numbered chunks, WHEN all chunks are collected, THEN the `sequence` values form a contiguous series starting at 1 with no gaps.
- **[4_USER_FEATURES-AC-4-JSON-008]** GIVEN a MCP `get_run` response for a running stage, WHEN parsed, THEN `completed_at` is present as a JSON key with value `null` (not absent from the object).
- **[4_USER_FEATURES-AC-4-JSON-009]** GIVEN a MCP `get_run` response, WHEN parsed, THEN `status` is a lowercase string (e.g., `"running"`, not `"Running"`).
- **[4_USER_FEATURES-AC-4-JSON-010]** GIVEN a MCP `get_stage_output` response, WHEN parsed, THEN `stdout` is a non-null string (empty string `""` if no output, never `null`).
- **[4_USER_FEATURES-AC-4-JSON-011]** GIVEN a MCP tool returns an error, WHEN parsed, THEN `result` is `null` and `error` is a non-null string beginning with a registered prefix token.
- **[4_USER_FEATURES-AC-4-JSON-012]** GIVEN a MCP tool returns success, WHEN parsed, THEN `error` is `null` and `result` is a non-null object.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-JSON-005]** GIVEN `devs status --format json` is called with a run ID that does not exist, WHEN the output is parsed, THEN `error...
- **Type:** Technical
- **Description:** GIVEN `devs status --format json` is called with a run ID that does not exist, WHEN the output is parsed, THEN `error` begins with `"not_found:"` and `code` is `2`.
- **[4_USER_FEATURES-AC-4-JSON-006]** GIVEN `devs logs --format json --follow` is active and the run completes, WHEN all output lines are collected, THEN the final line is `{"done": true, "total_lines": <n>, "truncated": false}`.
- **[4_USER_FEATURES-AC-4-JSON-007]** GIVEN `devs logs --format json` is active with sequence-numbered chunks, WHEN all chunks are collected, THEN the `sequence` values form a contiguous series starting at 1 with no gaps.
- **[4_USER_FEATURES-AC-4-JSON-008]** GIVEN a MCP `get_run` response for a running stage, WHEN parsed, THEN `completed_at` is present as a JSON key with value `null` (not absent from the object).
- **[4_USER_FEATURES-AC-4-JSON-009]** GIVEN a MCP `get_run` response, WHEN parsed, THEN `status` is a lowercase string (e.g., `"running"`, not `"Running"`).
- **[4_USER_FEATURES-AC-4-JSON-010]** GIVEN a MCP `get_stage_output` response, WHEN parsed, THEN `stdout` is a non-null string (empty string `""` if no output, never `null`).
- **[4_USER_FEATURES-AC-4-JSON-011]** GIVEN a MCP tool returns an error, WHEN parsed, THEN `result` is `null` and `error` is a non-null string beginning with a registered prefix token.
- **[4_USER_FEATURES-AC-4-JSON-012]** GIVEN a MCP tool returns success, WHEN parsed, THEN `error` is `null` and `result` is a non-null object.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-JSON-006]** GIVEN `devs logs --format json --follow` is active and the run completes, WHEN all output lines are collected, THEN t...
- **Type:** Technical
- **Description:** GIVEN `devs logs --format json --follow` is active and the run completes, WHEN all output lines are collected, THEN the final line is `{"done": true, "total_lines": <n>, "truncated": false}`.
- **[4_USER_FEATURES-AC-4-JSON-007]** GIVEN `devs logs --format json` is active with sequence-numbered chunks, WHEN all chunks are collected, THEN the `sequence` values form a contiguous series starting at 1 with no gaps.
- **[4_USER_FEATURES-AC-4-JSON-008]** GIVEN a MCP `get_run` response for a running stage, WHEN parsed, THEN `completed_at` is present as a JSON key with value `null` (not absent from the object).
- **[4_USER_FEATURES-AC-4-JSON-009]** GIVEN a MCP `get_run` response, WHEN parsed, THEN `status` is a lowercase string (e.g., `"running"`, not `"Running"`).
- **[4_USER_FEATURES-AC-4-JSON-010]** GIVEN a MCP `get_stage_output` response, WHEN parsed, THEN `stdout` is a non-null string (empty string `""` if no output, never `null`).
- **[4_USER_FEATURES-AC-4-JSON-011]** GIVEN a MCP tool returns an error, WHEN parsed, THEN `result` is `null` and `error` is a non-null string beginning with a registered prefix token.
- **[4_USER_FEATURES-AC-4-JSON-012]** GIVEN a MCP tool returns success, WHEN parsed, THEN `error` is `null` and `result` is a non-null object.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-JSON-007]** GIVEN `devs logs --format json` is active with sequence-numbered chunks, WHEN all chunks are collected, THEN the `seq...
- **Type:** Technical
- **Description:** GIVEN `devs logs --format json` is active with sequence-numbered chunks, WHEN all chunks are collected, THEN the `sequence` values form a contiguous series starting at 1 with no gaps.
- **[4_USER_FEATURES-AC-4-JSON-008]** GIVEN a MCP `get_run` response for a running stage, WHEN parsed, THEN `completed_at` is present as a JSON key with value `null` (not absent from the object).
- **[4_USER_FEATURES-AC-4-JSON-009]** GIVEN a MCP `get_run` response, WHEN parsed, THEN `status` is a lowercase string (e.g., `"running"`, not `"Running"`).
- **[4_USER_FEATURES-AC-4-JSON-010]** GIVEN a MCP `get_stage_output` response, WHEN parsed, THEN `stdout` is a non-null string (empty string `""` if no output, never `null`).
- **[4_USER_FEATURES-AC-4-JSON-011]** GIVEN a MCP tool returns an error, WHEN parsed, THEN `result` is `null` and `error` is a non-null string beginning with a registered prefix token.
- **[4_USER_FEATURES-AC-4-JSON-012]** GIVEN a MCP tool returns success, WHEN parsed, THEN `error` is `null` and `result` is a non-null object.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-JSON-008]** GIVEN a MCP `get_run` response for a running stage, WHEN parsed, THEN `completed_at` is present as a JSON key with va...
- **Type:** Technical
- **Description:** GIVEN a MCP `get_run` response for a running stage, WHEN parsed, THEN `completed_at` is present as a JSON key with value `null` (not absent from the object).
- **[4_USER_FEATURES-AC-4-JSON-009]** GIVEN a MCP `get_run` response, WHEN parsed, THEN `status` is a lowercase string (e.g., `"running"`, not `"Running"`).
- **[4_USER_FEATURES-AC-4-JSON-010]** GIVEN a MCP `get_stage_output` response, WHEN parsed, THEN `stdout` is a non-null string (empty string `""` if no output, never `null`).
- **[4_USER_FEATURES-AC-4-JSON-011]** GIVEN a MCP tool returns an error, WHEN parsed, THEN `result` is `null` and `error` is a non-null string beginning with a registered prefix token.
- **[4_USER_FEATURES-AC-4-JSON-012]** GIVEN a MCP tool returns success, WHEN parsed, THEN `error` is `null` and `result` is a non-null object.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-JSON-009]** GIVEN a MCP `get_run` response, WHEN parsed, THEN `status` is a lowercase string (e
- **Type:** Technical
- **Description:** GIVEN a MCP `get_run` response, WHEN parsed, THEN `status` is a lowercase string (e.g., `"running"`, not `"Running"`).
- **[4_USER_FEATURES-AC-4-JSON-010]** GIVEN a MCP `get_stage_output` response, WHEN parsed, THEN `stdout` is a non-null string (empty string `""` if no output, never `null`).
- **[4_USER_FEATURES-AC-4-JSON-011]** GIVEN a MCP tool returns an error, WHEN parsed, THEN `result` is `null` and `error` is a non-null string beginning with a registered prefix token.
- **[4_USER_FEATURES-AC-4-JSON-012]** GIVEN a MCP tool returns success, WHEN parsed, THEN `error` is `null` and `result` is a non-null object.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-JSON-010]** GIVEN a MCP `get_stage_output` response, WHEN parsed, THEN `stdout` is a non-null string (empty string `""` if no out...
- **Type:** Technical
- **Description:** GIVEN a MCP `get_stage_output` response, WHEN parsed, THEN `stdout` is a non-null string (empty string `""` if no output, never `null`).
- **[4_USER_FEATURES-AC-4-JSON-011]** GIVEN a MCP tool returns an error, WHEN parsed, THEN `result` is `null` and `error` is a non-null string beginning with a registered prefix token.
- **[4_USER_FEATURES-AC-4-JSON-012]** GIVEN a MCP tool returns success, WHEN parsed, THEN `error` is `null` and `result` is a non-null object.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-JSON-011]** GIVEN a MCP tool returns an error, WHEN parsed, THEN `result` is `null` and `error` is a non-null string beginning wi...
- **Type:** Technical
- **Description:** GIVEN a MCP tool returns an error, WHEN parsed, THEN `result` is `null` and `error` is a non-null string beginning with a registered prefix token.
- **[4_USER_FEATURES-AC-4-JSON-012]** GIVEN a MCP tool returns success, WHEN parsed, THEN `error` is `null` and `result` is a non-null object.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-JSON-012]** GIVEN a MCP tool returns success, WHEN parsed, THEN `error` is `null` and `result` is a non-null object
- **Type:** Technical
- **Description:** GIVEN a MCP tool returns success, WHEN parsed, THEN `error` is `null` and `result` is a non-null object.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-L10N-001]** GIVEN any MCP error response, WHEN the `error` field is parsed, THEN it begins with one of the tokens defined in the ...
- **Type:** UX
- **Description:** GIVEN any MCP error response, WHEN the `error` field is parsed, THEN it begins with one of the tokens defined in the machine-stable error prefix registry (§4.3.2).
- **[4_USER_FEATURES-AC-4-L10N-002]** GIVEN `devs status <run> --format json` on a completed stage, WHEN the `completed_at` field is parsed, THEN it is a valid RFC 3339 timestamp ending with `Z` and containing millisecond precision.
- **[4_USER_FEATURES-AC-4-L10N-003]** GIVEN a TUI with a running stage of 65 seconds elapsed, WHEN rendered, THEN the elapsed display shows `1:05`.
- **[4_USER_FEATURES-AC-4-L10N-004]** GIVEN a TUI with a running stage of 3723 seconds elapsed, WHEN rendered, THEN the elapsed display shows `1:02:03`.
- **[4_USER_FEATURES-AC-4-L10N-005]** GIVEN `target/coverage/report.json` after a coverage run, WHEN parsed, THEN `actual_pct` is a floating-point number with exactly 2 decimal places.
- **[4_USER_FEATURES-AC-4-L10N-006]** GIVEN a gRPC `INVALID_ARGUMENT` error for a multi-field validation failure, WHEN the error message is parsed, THEN it begins with `"invalid_argument:"` and contains a JSON array of field violation objects.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-L10N-002]** GIVEN `devs status <run> --format json` on a completed stage, WHEN the `completed_at` field is parsed, THEN it is a v...
- **Type:** UX
- **Description:** GIVEN `devs status <run> --format json` on a completed stage, WHEN the `completed_at` field is parsed, THEN it is a valid RFC 3339 timestamp ending with `Z` and containing millisecond precision.
- **[4_USER_FEATURES-AC-4-L10N-003]** GIVEN a TUI with a running stage of 65 seconds elapsed, WHEN rendered, THEN the elapsed display shows `1:05`.
- **[4_USER_FEATURES-AC-4-L10N-004]** GIVEN a TUI with a running stage of 3723 seconds elapsed, WHEN rendered, THEN the elapsed display shows `1:02:03`.
- **[4_USER_FEATURES-AC-4-L10N-005]** GIVEN `target/coverage/report.json` after a coverage run, WHEN parsed, THEN `actual_pct` is a floating-point number with exactly 2 decimal places.
- **[4_USER_FEATURES-AC-4-L10N-006]** GIVEN a gRPC `INVALID_ARGUMENT` error for a multi-field validation failure, WHEN the error message is parsed, THEN it begins with `"invalid_argument:"` and contains a JSON array of field violation objects.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-L10N-003]** GIVEN a TUI with a running stage of 65 seconds elapsed, WHEN rendered, THEN the elapsed display shows `1:05`
- **Type:** UX
- **Description:** GIVEN a TUI with a running stage of 65 seconds elapsed, WHEN rendered, THEN the elapsed display shows `1:05`.
- **[4_USER_FEATURES-AC-4-L10N-004]** GIVEN a TUI with a running stage of 3723 seconds elapsed, WHEN rendered, THEN the elapsed display shows `1:02:03`.
- **[4_USER_FEATURES-AC-4-L10N-005]** GIVEN `target/coverage/report.json` after a coverage run, WHEN parsed, THEN `actual_pct` is a floating-point number with exactly 2 decimal places.
- **[4_USER_FEATURES-AC-4-L10N-006]** GIVEN a gRPC `INVALID_ARGUMENT` error for a multi-field validation failure, WHEN the error message is parsed, THEN it begins with `"invalid_argument:"` and contains a JSON array of field violation objects.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-L10N-004]** GIVEN a TUI with a running stage of 3723 seconds elapsed, WHEN rendered, THEN the elapsed display shows `1:02:03`
- **Type:** UX
- **Description:** GIVEN a TUI with a running stage of 3723 seconds elapsed, WHEN rendered, THEN the elapsed display shows `1:02:03`.
- **[4_USER_FEATURES-AC-4-L10N-005]** GIVEN `target/coverage/report.json` after a coverage run, WHEN parsed, THEN `actual_pct` is a floating-point number with exactly 2 decimal places.
- **[4_USER_FEATURES-AC-4-L10N-006]** GIVEN a gRPC `INVALID_ARGUMENT` error for a multi-field validation failure, WHEN the error message is parsed, THEN it begins with `"invalid_argument:"` and contains a JSON array of field violation objects.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-L10N-005]** GIVEN `target/coverage/report
- **Type:** Technical
- **Description:** GIVEN `target/coverage/report.json` after a coverage run, WHEN parsed, THEN `actual_pct` is a floating-point number with exactly 2 decimal places.
- **[4_USER_FEATURES-AC-4-L10N-006]** GIVEN a gRPC `INVALID_ARGUMENT` error for a multi-field validation failure, WHEN the error message is parsed, THEN it begins with `"invalid_argument:"` and contains a JSON array of field violation objects.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-L10N-006]** GIVEN a gRPC `INVALID_ARGUMENT` error for a multi-field validation failure, WHEN the error message is parsed, THEN it...
- **Type:** Technical
- **Description:** GIVEN a gRPC `INVALID_ARGUMENT` error for a multi-field validation failure, WHEN the error message is parsed, THEN it begins with `"invalid_argument:"` and contains a JSON array of field violation objects.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-XPLAT-001]** GIVEN `
- **Type:** UX
- **Description:** GIVEN `./do build` is run on Linux, macOS, and Windows CI runners, THEN all three exit with code 0 and the `devs-server` binary is present in `target/release/`.
- **[4_USER_FEATURES-AC-4-XPLAT-002]** GIVEN `./do test` is run on all three platforms, THEN exit codes are identical (0 on success, non-zero on failure).
- **[4_USER_FEATURES-AC-4-XPLAT-003]** GIVEN a project registered with a Windows-style path (`C:\Users\user\project`), WHEN retrieved via `devs project list --format json`, THEN the `repo_path` field uses forward slashes (`C:/Users/user/project`).
- **[4_USER_FEATURES-AC-4-XPLAT-004]** GIVEN `devs-cli` is invoked with stdout redirected to a file (not a TTY), WHEN it produces text output, THEN no ANSI escape codes appear in the file.
- **[4_USER_FEATURES-AC-4-XPLAT-005]** GIVEN `DEVS_DISCOVERY_FILE=/tmp/test-1234.addr` is set, WHEN the server starts, THEN it writes the gRPC address to that exact path (not the default `~/.config/devs/server.addr`).
- **[4_USER_FEATURES-AC-4-XPLAT-006]** GIVEN `./do presubmit` is run and exceeds 15 minutes of wall-clock time, THEN the script exits non-zero and all child processes are terminated.
- **[4_USER_FEATURES-AC-4-XPLAT-007]** GIVEN two server instances started with distinct `DEVS_DISCOVERY_FILE` values, WHEN both are running, THEN neither overwrites the other's discovery file.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-XPLAT-002]** GIVEN `
- **Type:** Technical
- **Description:** GIVEN `./do test` is run on all three platforms, THEN exit codes are identical (0 on success, non-zero on failure).
- **[4_USER_FEATURES-AC-4-XPLAT-003]** GIVEN a project registered with a Windows-style path (`C:\Users\user\project`), WHEN retrieved via `devs project list --format json`, THEN the `repo_path` field uses forward slashes (`C:/Users/user/project`).
- **[4_USER_FEATURES-AC-4-XPLAT-004]** GIVEN `devs-cli` is invoked with stdout redirected to a file (not a TTY), WHEN it produces text output, THEN no ANSI escape codes appear in the file.
- **[4_USER_FEATURES-AC-4-XPLAT-005]** GIVEN `DEVS_DISCOVERY_FILE=/tmp/test-1234.addr` is set, WHEN the server starts, THEN it writes the gRPC address to that exact path (not the default `~/.config/devs/server.addr`).
- **[4_USER_FEATURES-AC-4-XPLAT-006]** GIVEN `./do presubmit` is run and exceeds 15 minutes of wall-clock time, THEN the script exits non-zero and all child processes are terminated.
- **[4_USER_FEATURES-AC-4-XPLAT-007]** GIVEN two server instances started with distinct `DEVS_DISCOVERY_FILE` values, WHEN both are running, THEN neither overwrites the other's discovery file.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-XPLAT-003]** GIVEN a project registered with a Windows-style path (`C:\Users\user\project`), WHEN retrieved via `devs project list...
- **Type:** Technical
- **Description:** GIVEN a project registered with a Windows-style path (`C:\Users\user\project`), WHEN retrieved via `devs project list --format json`, THEN the `repo_path` field uses forward slashes (`C:/Users/user/project`).
- **[4_USER_FEATURES-AC-4-XPLAT-004]** GIVEN `devs-cli` is invoked with stdout redirected to a file (not a TTY), WHEN it produces text output, THEN no ANSI escape codes appear in the file.
- **[4_USER_FEATURES-AC-4-XPLAT-005]** GIVEN `DEVS_DISCOVERY_FILE=/tmp/test-1234.addr` is set, WHEN the server starts, THEN it writes the gRPC address to that exact path (not the default `~/.config/devs/server.addr`).
- **[4_USER_FEATURES-AC-4-XPLAT-006]** GIVEN `./do presubmit` is run and exceeds 15 minutes of wall-clock time, THEN the script exits non-zero and all child processes are terminated.
- **[4_USER_FEATURES-AC-4-XPLAT-007]** GIVEN two server instances started with distinct `DEVS_DISCOVERY_FILE` values, WHEN both are running, THEN neither overwrites the other's discovery file.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-XPLAT-004]** GIVEN `devs-cli` is invoked with stdout redirected to a file (not a TTY), WHEN it produces text output, THEN no ANSI ...
- **Type:** Technical
- **Description:** GIVEN `devs-cli` is invoked with stdout redirected to a file (not a TTY), WHEN it produces text output, THEN no ANSI escape codes appear in the file.
- **[4_USER_FEATURES-AC-4-XPLAT-005]** GIVEN `DEVS_DISCOVERY_FILE=/tmp/test-1234.addr` is set, WHEN the server starts, THEN it writes the gRPC address to that exact path (not the default `~/.config/devs/server.addr`).
- **[4_USER_FEATURES-AC-4-XPLAT-006]** GIVEN `./do presubmit` is run and exceeds 15 minutes of wall-clock time, THEN the script exits non-zero and all child processes are terminated.
- **[4_USER_FEATURES-AC-4-XPLAT-007]** GIVEN two server instances started with distinct `DEVS_DISCOVERY_FILE` values, WHEN both are running, THEN neither overwrites the other's discovery file.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-XPLAT-005]** GIVEN `DEVS_DISCOVERY_FILE=/tmp/test-1234
- **Type:** Technical
- **Description:** GIVEN `DEVS_DISCOVERY_FILE=/tmp/test-1234.addr` is set, WHEN the server starts, THEN it writes the gRPC address to that exact path (not the default `~/.config/devs/server.addr`).
- **[4_USER_FEATURES-AC-4-XPLAT-006]** GIVEN `./do presubmit` is run and exceeds 15 minutes of wall-clock time, THEN the script exits non-zero and all child processes are terminated.
- **[4_USER_FEATURES-AC-4-XPLAT-007]** GIVEN two server instances started with distinct `DEVS_DISCOVERY_FILE` values, WHEN both are running, THEN neither overwrites the other's discovery file.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-XPLAT-006]** GIVEN `
- **Type:** Technical
- **Description:** GIVEN `./do presubmit` is run and exceeds 15 minutes of wall-clock time, THEN the script exits non-zero and all child processes are terminated.
- **[4_USER_FEATURES-AC-4-XPLAT-007]** GIVEN two server instances started with distinct `DEVS_DISCOVERY_FILE` values, WHEN both are running, THEN neither overwrites the other's discovery file.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-4-XPLAT-007]** GIVEN two server instances started with distinct `DEVS_DISCOVERY_FILE` values, WHEN both are running, THEN neither ov...
- **Type:** Functional
- **Description:** GIVEN two server instances started with distinct `DEVS_DISCOVERY_FILE` values, WHEN both are running, THEN neither overwrites the other's discovery file.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-086]** When `--format text` (default), CLI errors are printed to **stderr** as human-readable messages
- **Type:** Functional
- **Description:** When `--format text` (default), CLI errors are printed to **stderr** as human-readable messages. Nothing is written to stdout on error. The process exits with the appropriate exit code from the table below.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-087]** When `--format json`, CLI errors are printed to **stdout** as a JSON object
- **Type:** Functional
- **Description:** When `--format json`, CLI errors are printed to **stdout** as a JSON object. Nothing is written to stderr. The process exits with code `<n>` matching the `code` field.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-088]** Validation errors from `devs submit` include **all** validation failures collected in a single pass, not just the fir...
- **Type:** Functional
- **Description:** Validation errors from `devs submit` include **all** validation failures collected in a single pass, not just the first error found. The validation order is fixed (schema → uniqueness → dependency resolution → cycle detection → pool existence → handler existence → type coercion → exclusivity constraints). All errors from all steps are collected before the response is returned.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-089]** The CLI distinguishes between a server that is unreachable (exit code 3) and a server that returned a valid gRPC erro...
- **Type:** UX
- **Description:** The CLI distinguishes between a server that is unreachable (exit code 3) and a server that returned a valid gRPC error response (exit codes 1, 2, or 4).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-064-EXT]** `devs logs --follow` streams log lines until the run reaches a terminal state, then exits:
- **Type:** UX
- **Description:** `devs logs --follow` streams log lines until the run reaches a terminal state, then exits:
- Exit code `0` when run transitions to `Completed`
- Exit code `1` when run transitions to `Failed`, `Cancelled`, or `TimedOut`
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-090]** When the TUI cannot connect to the server on startup, it displays a full-screen error panel (not a modal overlay) with:
- **Type:** UX
- **Description:** When the TUI cannot connect to the server on startup, it displays a full-screen error panel (not a modal overlay) with:
- The attempted server address
- The reason for failure (e.g., "connection refused", "address not found in discovery file")
- A suggestion for the user (e.g., "run `devs server start` to start the server")
- The key binding to quit (`q` or `Ctrl+C`)
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-091]** When the TUI loses its gRPC connection after a successful initial connection, it enters automatic reconnection mode
- **Type:** UX
- **Description:** When the TUI loses its gRPC connection after a successful initial connection, it enters automatic reconnection mode. The reconnection backoff schedule is:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-092]** When the TUI exits due to sustained reconnection failure, it clears the alternate screen buffer, restores the termina...
- **Type:** UX
- **Description:** When the TUI exits due to sustained reconnection failure, it clears the alternate screen buffer, restores the terminal to its prior state, and prints to the restored terminal:
```
devs-tui: disconnected from server at <addr>; could not reconnect after 35s. Exit 1.
```
The process then exits with code 1. No raw terminal state is left behind.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-093]** TUI keyboard actions that are invalid for the current state display a brief inline status message in the status bar f...
- **Type:** UX
- **Description:** TUI keyboard actions that are invalid for the current state display a brief inline status message in the status bar for 3 seconds, then auto-clear. The TUI NEVER silently ignores a user action.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-094]** MCP error strings are prefixed with a machine-stable category token
- **Type:** Technical
- **Description:** MCP error strings are prefixed with a machine-stable category token. The prefix is always a lowercase identifier followed by `: `. The detail after `: ` is a human-readable string that may vary across server versions. Agents MUST match on the prefix only, never on the full string.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-095]** When the MCP server cannot acquire `SchedulerState` write lock within 5 seconds, it returns:
- **Type:** UX
- **Description:** When the MCP server cannot acquire `SchedulerState` write lock within 5 seconds, it returns:
```json
{
  "result": null,
  "error": "resource_exhausted: lock acquisition timed out after 5s"
}
```
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-096]** When `stream_logs` returns a terminal chunk with `"truncated": true`, the total output exceeded the 10,000-line in-me...
- **Type:** UX
- **Description:** When `stream_logs` returns a terminal chunk with `"truncated": true`, the total output exceeded the 10,000-line in-memory buffer. Truncation is from the **beginning** of the log — the most recent lines are always retained.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-097]** When `get_stage_output` is called on a stage with status `running`, the response returns whatever pa
- **Type:** Functional
- **Description:** When `get_stage_output` is called on a stage with status `running`, the response returns whatever partial output has been captured so far:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-MCP-DBG-BR-017]** `exit_code: null` when the process has not yet exited is a defined valid value, not an error. Agents...
- **Type:** Technical
- **Description:** `exit_code: null` when the process has not yet exited is a defined valid value, not an error. Agents MUST NOT treat `exit_code: null` as a failure condition when `status` is `"running"`. **[4_USER_FEATURES-MCP-DBG-BR-017]** is the authoritative reference.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-098]** All `devs
- **Type:** Functional
- **Description:** All `devs.toml` configuration errors are collected in a single validation pass and reported to stderr before any port is bound. The format is:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-5-CFG-BR-001]** When `--config` points to a file that does not exist, the error is:
- **Type:** Functional
- **Description:** When `--config` points to a file that does not exist, the error is:
```
devs: --config file not found: /path/to/missing.toml
devs: startup aborted
```
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-5-CFG-BR-002]** When `devs
- **Type:** UX
- **Description:** When `devs.toml` is absent and no `--config` flag is given, the server starts with built-in defaults and logs `WARN: no devs.toml found; using built-in defaults`. This is not a fatal condition.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-5-CFG-BR-003]** If `devs
- **Type:** Functional
- **Description:** If `devs.toml` contains a `[triggers]` section (reserved for post-MVP), the server logs:
```
WARN: [triggers] section found in devs.toml; automated triggers are not supported in this version and will be ignored
```
This is a warning, not a fatal error. The server starts normally.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-099]** During crash recovery at startup, checkpoint loading failures are classified and handled per the fol
- **Type:** Functional
- **Description:** During crash recovery at startup, checkpoint loading failures are classified and handled per the following table:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-5-CHKPT-BR-001]** Per-project checkpoint recovery failures are non-fatal
- **Type:** Functional
- **Description:** Per-project checkpoint recovery failures are non-fatal. A project with corrupt state does not prevent other projects from recovering normally.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-100]** When a checkpoint write fails due to disk full or any I/O error:
- **Type:** Functional
- **Description:** When a checkpoint write fails due to disk full or any I/O error:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-5-DISK-BR-001]** The server maintains an in-memory retry queue for failed checkpoint writes
- **Type:** Functional
- **Description:** The server maintains an in-memory retry queue for failed checkpoint writes. When a subsequent state transition occurs for the same run, the server attempts to write the latest state (not the failed state). Intermediate states that were missed due to disk full are not separately replayed.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-101]** Webhook delivery failures follow this handling policy:
- **Type:** Functional
- **Description:** Webhook delivery failures follow this handling policy:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-3_PRD-BR-047]** Webhook delivery is always fire-and-forget from the workflow engine's perspective. No stage waits fo...
- **Type:** Functional
- **Description:** Webhook delivery is always fire-and-forget from the workflow engine's perspective. No stage waits for ACK. No run waits for webhook completion. **[4_USER_FEATURES-3_PRD-BR-047]** is the authoritative reference.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-102]** When the agent binary is not found on `PATH` at stage dispatch:
- **Type:** Technical
- **Description:** When the agent binary is not found on `PATH` at stage dispatch:
- Stage transitions to `Failed` immediately
- No retry is triggered (not a rate-limit or transient condition)
- `StageOutput.stderr` contains: `devs: agent binary not found: <tool-name>. Ensure '<tool-name>' is installed and on PATH.`
- `StageOutput.exit_code` is recorded as `-1` (synthetic; no process was spawned)
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-103]** When PTY allocation fails for an agent with `pty: true`:
- **Type:** Functional
- **Description:** When PTY allocation fails for an agent with `pty: true`:
- Stage transitions to `Failed` immediately
- No fallback to non-PTY mode occurs (the `pty` flag is not advisory)
- `StageOutput.stderr` contains: `devs: PTY allocation failed: <OS error message>`
- `StageOutput.exit_code` is `-1`
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-104]** When `
- **Type:** Functional
- **Description:** When `.devs_context.json` cannot be written before agent spawn:
- Stage transitions to `Failed` immediately without spawning the agent process
- `StageOutput.stderr` contains: `devs: failed to write context file: <OS error message>`
- The failure is logged at `ERROR` level
- No retry is triggered
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-105]** When `prompt_file` does not exist at stage execution time:
- **Type:** Functional
- **Description:** When `prompt_file` does not exist at stage execution time:
- Stage transitions to `Failed` immediately without spawning the agent process
- `StageOutput.stderr` contains: `devs: prompt_file not found: <absolute-resolved-path>`
- The missing path in the error message is the path after template variable resolution
- No retry is triggered
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-106]** An orchestrated agent that calls `signal_completion` on a stage already in a terminal state receives:
- **Type:** UX
- **Description:** An orchestrated agent that calls `signal_completion` on a stage already in a terminal state receives:
```json
{
  "result": null,
  "error": "failed_precondition: stage already in terminal state: completed"
}
```
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-107]** When a running agent is cancelled (via `cancel_run`, `cancel_stage`, workflow timeout, or server shu
- **Type:** Functional
- **Description:** When a running agent is cancelled (via `cancel_run`, `cancel_stage`, workflow timeout, or server shutdown), `devs` executes the following sequence:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-108]** When the server begins SIGTERM shutdown, any MCP tool call received after shutdown is initiated returns:
- **Type:** Technical
- **Description:** When the server begins SIGTERM shutdown, any MCP tool call received after shutdown is initiated returns:
```json
{
  "result": null,
  "error": "failed_precondition: server is shutting down"
}
```
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-109]** The `devs-mcp-bridge` stdio proxy follows this error protocol:
- **Type:** Technical
- **Description:** The `devs-mcp-bridge` stdio proxy follows this error protocol:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-110]** `
- **Type:** Functional
- **Description:** `./do coverage` writes `target/coverage/report.json` after every run — including runs where some gates fail — so that an AI agent always has a complete, parseable gate report to work from.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-5-COV-BR-001]** Unit test coverage (QG-001) MUST NOT be counted toward QG-003, QG-004, or QG-005
- **Type:** Technical
- **Description:** Unit test coverage (QG-001) MUST NOT be counted toward QG-003, QG-004, or QG-005. E2E and unit coverage are measured independently. Coverage from calling internal Rust functions directly in tests does not satisfy QG-003/004/005.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-5-COV-BR-002]** `delta_pct` in each gate record is the difference between `actual_pct` and `threshold_pct`: positive means above thre...
- **Type:** Functional
- **Description:** `delta_pct` in each gate record is the difference between `actual_pct` and `threshold_pct`: positive means above threshold, negative means below. This allows an agent to prioritize which gate is furthest from passing.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-111]** `
- **Type:** UX
- **Description:** `./do test` writes `target/traceability.json` after every test run — including partial failures — so that the requirement-coverage state is always available.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-5-TRACE-BR-001]** `
- **Type:** Functional
- **Description:** `./do test` exits non-zero when `overall_passed: false` even if all `cargo test` assertions pass. The traceability check is a separate gate, not optional.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-5-TRACE-BR-002]** A test file with `// Covers: NONEXISTENT-REQ-999` causes `overall_passed: false`
- **Type:** Functional
- **Description:** A test file with `// Covers: NONEXISTENT-REQ-999` causes `overall_passed: false`. Stale annotations are listed in `stale_annotations[]` with the annotation text and source file location.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-112]** When `
- **Type:** Functional
- **Description:** When `./do lint` fails, each error is printed in the format:
```
<file>:<line>:<col>: error: <message>
```
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-5-LINT-BR-001]** `
- **Type:** Functional
- **Description:** `./do lint` also performs a dependency audit: it reads `Cargo.lock` and compares all transitive dependencies against the authoritative version table in §2.2 of the TAS. Any undocumented crate (not in the table) causes lint to fail with:
```
lint: undocumented dependency: <crate-name> <version>. Add to §2.2 of 2_TAS.md.
```
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-113]** When `
- **Type:** Functional
- **Description:** When `./do presubmit` is killed by the 15-minute hard wall-clock timeout:
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-5-GRPC-BR-001]** The `INVALID_ARGUMENT` gRPC response for validation failures includes all errors as a JSON array in the status message:
- **Type:** Technical
- **Description:** The `INVALID_ARGUMENT` gRPC response for validation failures includes all errors as a JSON array in the status message:
```
invalid_argument: validation failed: [{"field":"...","message":"..."},...]
```
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-001]** GIVEN `devs status <valid-uuid>` where the run does not exist, WHEN `--format text`, THEN stderr contains `error: run...
- **Type:** UX
- **Description:** GIVEN `devs status <valid-uuid>` where the run does not exist, WHEN `--format text`, THEN stderr contains `error: run not found: <uuid>` and exit code is 2. // Covers: FEAT-086, FEAT-089
- **[4_USER_FEATURES-AC-5-002]** GIVEN `devs status <valid-uuid>` where the run does not exist, WHEN `--format json`, THEN stdout is `{"error": "run not found: <uuid>", "code": 2}`, stderr is empty, and exit code is 2. // Covers: FEAT-087
- **[4_USER_FEATURES-AC-5-003]** GIVEN `devs submit` with three validation errors in the workflow definition, WHEN submitted, THEN the response (text or JSON) contains all three error messages and exit code is 4. // Covers: FEAT-088
- **[4_USER_FEATURES-AC-5-004]** GIVEN the discovery file does not exist, WHEN any CLI command is run, THEN exit code is 3 and the error message references the discovery file path. // Covers: FEAT-089
- **[4_USER_FEATURES-AC-5-005]** GIVEN `devs logs --follow` is streaming and the run transitions to `Completed`, THEN the CLI exits with code 0. // Covers: FEAT-064-EXT
- **[4_USER_FEATURES-AC-5-006]** GIVEN `devs logs --follow` is streaming and the run transitions to `Failed`, THEN the CLI exits with code 1. // Covers: FEAT-064-EXT
- **[4_USER_FEATURES-AC-5-007]** GIVEN two simultaneous `devs submit` calls with the same `--name`, THEN exactly one exits 0 and one exits 4 with `already_exists` in the error. // Covers: FEAT-088
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-002]** GIVEN `devs status <valid-uuid>` where the run does not exist, WHEN `--format json`, THEN stdout is `{"error": "run n...
- **Type:** UX
- **Description:** GIVEN `devs status <valid-uuid>` where the run does not exist, WHEN `--format json`, THEN stdout is `{"error": "run not found: <uuid>", "code": 2}`, stderr is empty, and exit code is 2. // Covers: FEAT-087
- **[4_USER_FEATURES-AC-5-003]** GIVEN `devs submit` with three validation errors in the workflow definition, WHEN submitted, THEN the response (text or JSON) contains all three error messages and exit code is 4. // Covers: FEAT-088
- **[4_USER_FEATURES-AC-5-004]** GIVEN the discovery file does not exist, WHEN any CLI command is run, THEN exit code is 3 and the error message references the discovery file path. // Covers: FEAT-089
- **[4_USER_FEATURES-AC-5-005]** GIVEN `devs logs --follow` is streaming and the run transitions to `Completed`, THEN the CLI exits with code 0. // Covers: FEAT-064-EXT
- **[4_USER_FEATURES-AC-5-006]** GIVEN `devs logs --follow` is streaming and the run transitions to `Failed`, THEN the CLI exits with code 1. // Covers: FEAT-064-EXT
- **[4_USER_FEATURES-AC-5-007]** GIVEN two simultaneous `devs submit` calls with the same `--name`, THEN exactly one exits 0 and one exits 4 with `already_exists` in the error. // Covers: FEAT-088
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-003]** GIVEN `devs submit` with three validation errors in the workflow definition, WHEN submitted, THEN the response (text ...
- **Type:** Functional
- **Description:** GIVEN `devs submit` with three validation errors in the workflow definition, WHEN submitted, THEN the response (text or JSON) contains all three error messages and exit code is 4. // Covers: FEAT-088
- **[4_USER_FEATURES-AC-5-004]** GIVEN the discovery file does not exist, WHEN any CLI command is run, THEN exit code is 3 and the error message references the discovery file path. // Covers: FEAT-089
- **[4_USER_FEATURES-AC-5-005]** GIVEN `devs logs --follow` is streaming and the run transitions to `Completed`, THEN the CLI exits with code 0. // Covers: FEAT-064-EXT
- **[4_USER_FEATURES-AC-5-006]** GIVEN `devs logs --follow` is streaming and the run transitions to `Failed`, THEN the CLI exits with code 1. // Covers: FEAT-064-EXT
- **[4_USER_FEATURES-AC-5-007]** GIVEN two simultaneous `devs submit` calls with the same `--name`, THEN exactly one exits 0 and one exits 4 with `already_exists` in the error. // Covers: FEAT-088
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-004]** GIVEN the discovery file does not exist, WHEN any CLI command is run, THEN exit code is 3 and the error message refer...
- **Type:** Functional
- **Description:** GIVEN the discovery file does not exist, WHEN any CLI command is run, THEN exit code is 3 and the error message references the discovery file path. // Covers: FEAT-089
- **[4_USER_FEATURES-AC-5-005]** GIVEN `devs logs --follow` is streaming and the run transitions to `Completed`, THEN the CLI exits with code 0. // Covers: FEAT-064-EXT
- **[4_USER_FEATURES-AC-5-006]** GIVEN `devs logs --follow` is streaming and the run transitions to `Failed`, THEN the CLI exits with code 1. // Covers: FEAT-064-EXT
- **[4_USER_FEATURES-AC-5-007]** GIVEN two simultaneous `devs submit` calls with the same `--name`, THEN exactly one exits 0 and one exits 4 with `already_exists` in the error. // Covers: FEAT-088
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-005]** GIVEN `devs logs --follow` is streaming and the run transitions to `Completed`, THEN the CLI exits with code 0
- **Type:** Functional
- **Description:** GIVEN `devs logs --follow` is streaming and the run transitions to `Completed`, THEN the CLI exits with code 0. // Covers: FEAT-064-EXT
- **[4_USER_FEATURES-AC-5-006]** GIVEN `devs logs --follow` is streaming and the run transitions to `Failed`, THEN the CLI exits with code 1. // Covers: FEAT-064-EXT
- **[4_USER_FEATURES-AC-5-007]** GIVEN two simultaneous `devs submit` calls with the same `--name`, THEN exactly one exits 0 and one exits 4 with `already_exists` in the error. // Covers: FEAT-088
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-006]** GIVEN `devs logs --follow` is streaming and the run transitions to `Failed`, THEN the CLI exits with code 1
- **Type:** Functional
- **Description:** GIVEN `devs logs --follow` is streaming and the run transitions to `Failed`, THEN the CLI exits with code 1. // Covers: FEAT-064-EXT
- **[4_USER_FEATURES-AC-5-007]** GIVEN two simultaneous `devs submit` calls with the same `--name`, THEN exactly one exits 0 and one exits 4 with `already_exists` in the error. // Covers: FEAT-088
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-007]** GIVEN two simultaneous `devs submit` calls with the same `--name`, THEN exactly one exits 0 and one exits 4 with `alr...
- **Type:** Functional
- **Description:** GIVEN two simultaneous `devs submit` calls with the same `--name`, THEN exactly one exits 0 and one exits 4 with `already_exists` in the error. // Covers: FEAT-088
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-008]** GIVEN the TUI is started with an invalid server address, THEN the TUI renders a full-screen error panel containing th...
- **Type:** UX
- **Description:** GIVEN the TUI is started with an invalid server address, THEN the TUI renders a full-screen error panel containing the attempted address and does not crash. // Covers: FEAT-090
- **[4_USER_FEATURES-AC-5-009]** GIVEN the TUI is connected and the server process is killed, THEN the TUI enters reconnection mode and displays a countdown without clearing the frozen dashboard view. // Covers: FEAT-091
- **[4_USER_FEATURES-AC-5-010]** GIVEN the TUI has been in reconnection mode for 35 s without success, THEN the TUI exits with code 1 and prints the disconnection message to the restored terminal. // Covers: FEAT-092
- **[4_USER_FEATURES-AC-5-011]** GIVEN the TUI is focused on a `Completed` run and the user presses `c` (cancel), THEN the status bar displays `[!] Cannot cancel: run is already in terminal state` for 3 s. // Covers: FEAT-093
- **[4_USER_FEATURES-AC-5-012]** GIVEN the TUI is started against a server with a different major version, THEN a full-screen version mismatch error is displayed and the TUI exits. // Covers: FEAT-5-GRPC-BR-001
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-009]** GIVEN the TUI is connected and the server process is killed, THEN the TUI enters reconnection mode and displays a cou...
- **Type:** UX
- **Description:** GIVEN the TUI is connected and the server process is killed, THEN the TUI enters reconnection mode and displays a countdown without clearing the frozen dashboard view. // Covers: FEAT-091
- **[4_USER_FEATURES-AC-5-010]** GIVEN the TUI has been in reconnection mode for 35 s without success, THEN the TUI exits with code 1 and prints the disconnection message to the restored terminal. // Covers: FEAT-092
- **[4_USER_FEATURES-AC-5-011]** GIVEN the TUI is focused on a `Completed` run and the user presses `c` (cancel), THEN the status bar displays `[!] Cannot cancel: run is already in terminal state` for 3 s. // Covers: FEAT-093
- **[4_USER_FEATURES-AC-5-012]** GIVEN the TUI is started against a server with a different major version, THEN a full-screen version mismatch error is displayed and the TUI exits. // Covers: FEAT-5-GRPC-BR-001
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-010]** GIVEN the TUI has been in reconnection mode for 35 s without success, THEN the TUI exits with code 1 and prints the d...
- **Type:** UX
- **Description:** GIVEN the TUI has been in reconnection mode for 35 s without success, THEN the TUI exits with code 1 and prints the disconnection message to the restored terminal. // Covers: FEAT-092
- **[4_USER_FEATURES-AC-5-011]** GIVEN the TUI is focused on a `Completed` run and the user presses `c` (cancel), THEN the status bar displays `[!] Cannot cancel: run is already in terminal state` for 3 s. // Covers: FEAT-093
- **[4_USER_FEATURES-AC-5-012]** GIVEN the TUI is started against a server with a different major version, THEN a full-screen version mismatch error is displayed and the TUI exits. // Covers: FEAT-5-GRPC-BR-001
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-011]** GIVEN the TUI is focused on a `Completed` run and the user presses `c` (cancel), THEN the status bar displays `[!] Ca...
- **Type:** UX
- **Description:** GIVEN the TUI is focused on a `Completed` run and the user presses `c` (cancel), THEN the status bar displays `[!] Cannot cancel: run is already in terminal state` for 3 s. // Covers: FEAT-093
- **[4_USER_FEATURES-AC-5-012]** GIVEN the TUI is started against a server with a different major version, THEN a full-screen version mismatch error is displayed and the TUI exits. // Covers: FEAT-5-GRPC-BR-001
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-012]** GIVEN the TUI is started against a server with a different major version, THEN a full-screen version mismatch error i...
- **Type:** UX
- **Description:** GIVEN the TUI is started against a server with a different major version, THEN a full-screen version mismatch error is displayed and the TUI exits. // Covers: FEAT-5-GRPC-BR-001
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-013]** GIVEN `get_run` is called with a UUID that does not exist, THEN the response is `{"result": null, "error": "not_found...
- **Type:** UX
- **Description:** GIVEN `get_run` is called with a UUID that does not exist, THEN the response is `{"result": null, "error": "not_found: run '<uuid>' does not exist"}`. // Covers: FEAT-094
- **[4_USER_FEATURES-AC-5-014]** GIVEN `submit_run` is called with two validation errors, THEN the `error` string contains a JSON array with both error objects. // Covers: FEAT-094
- **[4_USER_FEATURES-AC-5-015]** GIVEN `get_stage_output` is called on a stage with status `running`, THEN `result.exit_code` is `null` and `error` is `null`. // Covers: FEAT-097
- **[4_USER_FEATURES-AC-5-016]** GIVEN `stream_logs` is called with `follow: true` on a stage that is in `waiting` status and the stage is later cancelled without running, THEN the stream eventually delivers `{"done": true, "truncated": false, "total_lines": 0}`. // Covers: FEAT-096
- **[4_USER_FEATURES-AC-5-017]** GIVEN `assert_stage_output` is called with an invalid regex pattern, THEN `error` is non-null and begins with `invalid_argument:` and no assertions are evaluated. // Covers: FEAT-094
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-014]** GIVEN `submit_run` is called with two validation errors, THEN the `error` string contains a JSON array with both erro...
- **Type:** Functional
- **Description:** GIVEN `submit_run` is called with two validation errors, THEN the `error` string contains a JSON array with both error objects. // Covers: FEAT-094
- **[4_USER_FEATURES-AC-5-015]** GIVEN `get_stage_output` is called on a stage with status `running`, THEN `result.exit_code` is `null` and `error` is `null`. // Covers: FEAT-097
- **[4_USER_FEATURES-AC-5-016]** GIVEN `stream_logs` is called with `follow: true` on a stage that is in `waiting` status and the stage is later cancelled without running, THEN the stream eventually delivers `{"done": true, "truncated": false, "total_lines": 0}`. // Covers: FEAT-096
- **[4_USER_FEATURES-AC-5-017]** GIVEN `assert_stage_output` is called with an invalid regex pattern, THEN `error` is non-null and begins with `invalid_argument:` and no assertions are evaluated. // Covers: FEAT-094
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-015]** GIVEN `get_stage_output` is called on a stage with status `running`, THEN `result
- **Type:** Functional
- **Description:** GIVEN `get_stage_output` is called on a stage with status `running`, THEN `result.exit_code` is `null` and `error` is `null`. // Covers: FEAT-097
- **[4_USER_FEATURES-AC-5-016]** GIVEN `stream_logs` is called with `follow: true` on a stage that is in `waiting` status and the stage is later cancelled without running, THEN the stream eventually delivers `{"done": true, "truncated": false, "total_lines": 0}`. // Covers: FEAT-096
- **[4_USER_FEATURES-AC-5-017]** GIVEN `assert_stage_output` is called with an invalid regex pattern, THEN `error` is non-null and begins with `invalid_argument:` and no assertions are evaluated. // Covers: FEAT-094
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-016]** GIVEN `stream_logs` is called with `follow: true` on a stage that is in `waiting` status and the stage is later cance...
- **Type:** Functional
- **Description:** GIVEN `stream_logs` is called with `follow: true` on a stage that is in `waiting` status and the stage is later cancelled without running, THEN the stream eventually delivers `{"done": true, "truncated": false, "total_lines": 0}`. // Covers: FEAT-096
- **[4_USER_FEATURES-AC-5-017]** GIVEN `assert_stage_output` is called with an invalid regex pattern, THEN `error` is non-null and begins with `invalid_argument:` and no assertions are evaluated. // Covers: FEAT-094
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-017]** GIVEN `assert_stage_output` is called with an invalid regex pattern, THEN `error` is non-null and begins with `invali...
- **Type:** Functional
- **Description:** GIVEN `assert_stage_output` is called with an invalid regex pattern, THEN `error` is non-null and begins with `invalid_argument:` and no assertions are evaluated. // Covers: FEAT-094
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-018]** GIVEN `devs
- **Type:** Technical
- **Description:** GIVEN `devs.toml` has two configuration errors, WHEN the server is started, THEN both errors are printed to stderr, zero ports are bound, and the process exits non-zero. // Covers: FEAT-098
- **[4_USER_FEATURES-AC-5-019]** GIVEN a corrupt `checkpoint.json` exists for one project and valid checkpoints for another, WHEN the server starts, THEN the corrupt run is marked `Unrecoverable`, the valid project recovers normally, and the server accepts connections. // Covers: FEAT-099
- **[4_USER_FEATURES-AC-5-020]** GIVEN a checkpoint write fails due to a simulated disk-full error, THEN the server logs `ERROR` with the run ID, does not crash, and the next state transition triggers another write attempt. // Covers: FEAT-100
- **[4_USER_FEATURES-AC-5-021]** GIVEN a webhook target URL is unreachable and `max_retries = 3`, WHEN a `stage.completed` event fires, THEN the server logs `ERROR` after 4 total attempts and the stage status is unaffected. // Covers: FEAT-101
- **[4_USER_FEATURES-AC-5-022]** GIVEN a stage references an agent binary that does not exist on PATH, WHEN the stage is dispatched, THEN it transitions to `Failed` with `exit_code: -1` and `stderr` containing `devs: agent binary not found: <tool-name>`. // Covers: FEAT-102
- **[4_USER_FEATURES-AC-5-023]** GIVEN a stage has `pty: true` and PTY allocation fails (simulated), THEN the stage transitions to `Failed` immediately with no fallback. // Covers: FEAT-103
- **[4_USER_FEATURES-AC-5-024]** GIVEN `prompt_file` references a path that does not exist at execution time, THEN the stage transitions to `Failed` with `stderr` containing `devs: prompt_file not found: <path>`. // Covers: FEAT-105
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-019]** GIVEN a corrupt `checkpoint
- **Type:** Technical
- **Description:** GIVEN a corrupt `checkpoint.json` exists for one project and valid checkpoints for another, WHEN the server starts, THEN the corrupt run is marked `Unrecoverable`, the valid project recovers normally, and the server accepts connections. // Covers: FEAT-099
- **[4_USER_FEATURES-AC-5-020]** GIVEN a checkpoint write fails due to a simulated disk-full error, THEN the server logs `ERROR` with the run ID, does not crash, and the next state transition triggers another write attempt. // Covers: FEAT-100
- **[4_USER_FEATURES-AC-5-021]** GIVEN a webhook target URL is unreachable and `max_retries = 3`, WHEN a `stage.completed` event fires, THEN the server logs `ERROR` after 4 total attempts and the stage status is unaffected. // Covers: FEAT-101
- **[4_USER_FEATURES-AC-5-022]** GIVEN a stage references an agent binary that does not exist on PATH, WHEN the stage is dispatched, THEN it transitions to `Failed` with `exit_code: -1` and `stderr` containing `devs: agent binary not found: <tool-name>`. // Covers: FEAT-102
- **[4_USER_FEATURES-AC-5-023]** GIVEN a stage has `pty: true` and PTY allocation fails (simulated), THEN the stage transitions to `Failed` immediately with no fallback. // Covers: FEAT-103
- **[4_USER_FEATURES-AC-5-024]** GIVEN `prompt_file` references a path that does not exist at execution time, THEN the stage transitions to `Failed` with `stderr` containing `devs: prompt_file not found: <path>`. // Covers: FEAT-105
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-020]** GIVEN a checkpoint write fails due to a simulated disk-full error, THEN the server logs `ERROR` with the run ID, does...
- **Type:** Technical
- **Description:** GIVEN a checkpoint write fails due to a simulated disk-full error, THEN the server logs `ERROR` with the run ID, does not crash, and the next state transition triggers another write attempt. // Covers: FEAT-100
- **[4_USER_FEATURES-AC-5-021]** GIVEN a webhook target URL is unreachable and `max_retries = 3`, WHEN a `stage.completed` event fires, THEN the server logs `ERROR` after 4 total attempts and the stage status is unaffected. // Covers: FEAT-101
- **[4_USER_FEATURES-AC-5-022]** GIVEN a stage references an agent binary that does not exist on PATH, WHEN the stage is dispatched, THEN it transitions to `Failed` with `exit_code: -1` and `stderr` containing `devs: agent binary not found: <tool-name>`. // Covers: FEAT-102
- **[4_USER_FEATURES-AC-5-023]** GIVEN a stage has `pty: true` and PTY allocation fails (simulated), THEN the stage transitions to `Failed` immediately with no fallback. // Covers: FEAT-103
- **[4_USER_FEATURES-AC-5-024]** GIVEN `prompt_file` references a path that does not exist at execution time, THEN the stage transitions to `Failed` with `stderr` containing `devs: prompt_file not found: <path>`. // Covers: FEAT-105
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-021]** GIVEN a webhook target URL is unreachable and `max_retries = 3`, WHEN a `stage
- **Type:** Technical
- **Description:** GIVEN a webhook target URL is unreachable and `max_retries = 3`, WHEN a `stage.completed` event fires, THEN the server logs `ERROR` after 4 total attempts and the stage status is unaffected. // Covers: FEAT-101
- **[4_USER_FEATURES-AC-5-022]** GIVEN a stage references an agent binary that does not exist on PATH, WHEN the stage is dispatched, THEN it transitions to `Failed` with `exit_code: -1` and `stderr` containing `devs: agent binary not found: <tool-name>`. // Covers: FEAT-102
- **[4_USER_FEATURES-AC-5-023]** GIVEN a stage has `pty: true` and PTY allocation fails (simulated), THEN the stage transitions to `Failed` immediately with no fallback. // Covers: FEAT-103
- **[4_USER_FEATURES-AC-5-024]** GIVEN `prompt_file` references a path that does not exist at execution time, THEN the stage transitions to `Failed` with `stderr` containing `devs: prompt_file not found: <path>`. // Covers: FEAT-105
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-022]** GIVEN a stage references an agent binary that does not exist on PATH, WHEN the stage is dispatched, THEN it transitio...
- **Type:** Technical
- **Description:** GIVEN a stage references an agent binary that does not exist on PATH, WHEN the stage is dispatched, THEN it transitions to `Failed` with `exit_code: -1` and `stderr` containing `devs: agent binary not found: <tool-name>`. // Covers: FEAT-102
- **[4_USER_FEATURES-AC-5-023]** GIVEN a stage has `pty: true` and PTY allocation fails (simulated), THEN the stage transitions to `Failed` immediately with no fallback. // Covers: FEAT-103
- **[4_USER_FEATURES-AC-5-024]** GIVEN `prompt_file` references a path that does not exist at execution time, THEN the stage transitions to `Failed` with `stderr` containing `devs: prompt_file not found: <path>`. // Covers: FEAT-105
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-023]** GIVEN a stage has `pty: true` and PTY allocation fails (simulated), THEN the stage transitions to `Failed` immediatel...
- **Type:** Functional
- **Description:** GIVEN a stage has `pty: true` and PTY allocation fails (simulated), THEN the stage transitions to `Failed` immediately with no fallback. // Covers: FEAT-103
- **[4_USER_FEATURES-AC-5-024]** GIVEN `prompt_file` references a path that does not exist at execution time, THEN the stage transitions to `Failed` with `stderr` containing `devs: prompt_file not found: <path>`. // Covers: FEAT-105
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-024]** GIVEN `prompt_file` references a path that does not exist at execution time, THEN the stage transitions to `Failed` w...
- **Type:** Functional
- **Description:** GIVEN `prompt_file` references a path that does not exist at execution time, THEN the stage transitions to `Failed` with `stderr` containing `devs: prompt_file not found: <path>`. // Covers: FEAT-105
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-025]** GIVEN `signal_completion` is called twice on the same stage, THEN the first call returns `error: null` and the second...
- **Type:** UX
- **Description:** GIVEN `signal_completion` is called twice on the same stage, THEN the first call returns `error: null` and the second returns `error: "failed_precondition: stage already in terminal state: ..."`. // Covers: FEAT-106
- **[4_USER_FEATURES-AC-5-026]** GIVEN a running agent receives `devs:cancel\n` on stdin and does not exit, THEN SIGTERM is sent after 5 s, SIGKILL after 10 s total, and the stage transitions to `Cancelled`. // Covers: FEAT-107
- **[4_USER_FEATURES-AC-5-027]** GIVEN the server begins shutdown and an MCP tool call arrives, THEN the response is `{"result": null, "error": "failed_precondition: server is shutting down"}`. // Covers: FEAT-108
- **[4_USER_FEATURES-AC-5-028]** GIVEN `devs-mcp-bridge` is running and the server process is killed, THEN within 2 s the bridge writes `{"result": null, "error": "internal: server connection lost", "fatal": true}` to stdout and exits with code 1. // Covers: FEAT-109
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-026]** GIVEN a running agent receives `devs:cancel\n` on stdin and does not exit, THEN SIGTERM is sent after 5 s, SIGKILL af...
- **Type:** Technical
- **Description:** GIVEN a running agent receives `devs:cancel\n` on stdin and does not exit, THEN SIGTERM is sent after 5 s, SIGKILL after 10 s total, and the stage transitions to `Cancelled`. // Covers: FEAT-107
- **[4_USER_FEATURES-AC-5-027]** GIVEN the server begins shutdown and an MCP tool call arrives, THEN the response is `{"result": null, "error": "failed_precondition: server is shutting down"}`. // Covers: FEAT-108
- **[4_USER_FEATURES-AC-5-028]** GIVEN `devs-mcp-bridge` is running and the server process is killed, THEN within 2 s the bridge writes `{"result": null, "error": "internal: server connection lost", "fatal": true}` to stdout and exits with code 1. // Covers: FEAT-109
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-027]** GIVEN the server begins shutdown and an MCP tool call arrives, THEN the response is `{"result": null, "error": "faile...
- **Type:** Technical
- **Description:** GIVEN the server begins shutdown and an MCP tool call arrives, THEN the response is `{"result": null, "error": "failed_precondition: server is shutting down"}`. // Covers: FEAT-108
- **[4_USER_FEATURES-AC-5-028]** GIVEN `devs-mcp-bridge` is running and the server process is killed, THEN within 2 s the bridge writes `{"result": null, "error": "internal: server connection lost", "fatal": true}` to stdout and exits with code 1. // Covers: FEAT-109
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-028]** GIVEN `devs-mcp-bridge` is running and the server process is killed, THEN within 2 s the bridge writes `{"result": nu...
- **Type:** Technical
- **Description:** GIVEN `devs-mcp-bridge` is running and the server process is killed, THEN within 2 s the bridge writes `{"result": null, "error": "internal: server connection lost", "fatal": true}` to stdout and exits with code 1. // Covers: FEAT-109
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-029]** GIVEN `
- **Type:** UX
- **Description:** GIVEN `./do coverage` is run and QG-002 fails, THEN `target/coverage/report.json` exists, `overall_passed` is `false`, and the QG-002 gate entry has `passed: false`. // Covers: FEAT-110
- **[4_USER_FEATURES-AC-5-030]** GIVEN `./do test` is run with one requirement that has no covering test, THEN `target/traceability.json` has `overall_passed: false`, the uncovered requirement has `covered: false`, and `./do test` exits non-zero. // Covers: FEAT-111
- **[4_USER_FEATURES-AC-5-031]** GIVEN `./do lint` fails due to a `cargo clippy` denial, THEN the output includes the file path and line number in `file:line:col: error: message` format. // Covers: FEAT-112
- **[4_USER_FEATURES-AC-5-032]** GIVEN `./do presubmit` runs for more than 900 s, THEN the script exits non-zero, stderr contains `presubmit: TIMEOUT after 900s; step=<name>`, and `target/presubmit_timings.jsonl` contains an entry with `"status": "killed"`. // Covers: FEAT-113
- **[4_USER_FEATURES-AC-5-033]** GIVEN `./do test` is run with a `// Covers: STALE-REQ-999` annotation in a test file that references a non-existent requirement ID, THEN `stale_annotations` in `target/traceability.json` is non-empty and `overall_passed` is `false`. // Covers: FEAT-5-TRACE-BR-002
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-030]** GIVEN `
- **Type:** UX
- **Description:** GIVEN `./do test` is run with one requirement that has no covering test, THEN `target/traceability.json` has `overall_passed: false`, the uncovered requirement has `covered: false`, and `./do test` exits non-zero. // Covers: FEAT-111
- **[4_USER_FEATURES-AC-5-031]** GIVEN `./do lint` fails due to a `cargo clippy` denial, THEN the output includes the file path and line number in `file:line:col: error: message` format. // Covers: FEAT-112
- **[4_USER_FEATURES-AC-5-032]** GIVEN `./do presubmit` runs for more than 900 s, THEN the script exits non-zero, stderr contains `presubmit: TIMEOUT after 900s; step=<name>`, and `target/presubmit_timings.jsonl` contains an entry with `"status": "killed"`. // Covers: FEAT-113
- **[4_USER_FEATURES-AC-5-033]** GIVEN `./do test` is run with a `// Covers: STALE-REQ-999` annotation in a test file that references a non-existent requirement ID, THEN `stale_annotations` in `target/traceability.json` is non-empty and `overall_passed` is `false`. // Covers: FEAT-5-TRACE-BR-002
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-031]** GIVEN `
- **Type:** UX
- **Description:** GIVEN `./do lint` fails due to a `cargo clippy` denial, THEN the output includes the file path and line number in `file:line:col: error: message` format. // Covers: FEAT-112
- **[4_USER_FEATURES-AC-5-032]** GIVEN `./do presubmit` runs for more than 900 s, THEN the script exits non-zero, stderr contains `presubmit: TIMEOUT after 900s; step=<name>`, and `target/presubmit_timings.jsonl` contains an entry with `"status": "killed"`. // Covers: FEAT-113
- **[4_USER_FEATURES-AC-5-033]** GIVEN `./do test` is run with a `// Covers: STALE-REQ-999` annotation in a test file that references a non-existent requirement ID, THEN `stale_annotations` in `target/traceability.json` is non-empty and `overall_passed` is `false`. // Covers: FEAT-5-TRACE-BR-002
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-032]** GIVEN `
- **Type:** UX
- **Description:** GIVEN `./do presubmit` runs for more than 900 s, THEN the script exits non-zero, stderr contains `presubmit: TIMEOUT after 900s; step=<name>`, and `target/presubmit_timings.jsonl` contains an entry with `"status": "killed"`. // Covers: FEAT-113
- **[4_USER_FEATURES-AC-5-033]** GIVEN `./do test` is run with a `// Covers: STALE-REQ-999` annotation in a test file that references a non-existent requirement ID, THEN `stale_annotations` in `target/traceability.json` is non-empty and `overall_passed` is `false`. // Covers: FEAT-5-TRACE-BR-002
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-5-033]** GIVEN `
- **Type:** UX
- **Description:** GIVEN `./do test` is run with a `// Covers: STALE-REQ-999` annotation in a test file that references a non-existent requirement ID, THEN `stale_annotations` in `target/traceability.json` is non-empty and `overall_passed` is `false`. // Covers: FEAT-5-TRACE-BR-002
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-A-Z_]** | `env` | `map<EnvKey, string>` | 0–256 entries; keys match `[4_USER_FEATURES-A-Z_][4_USER_FEATURES-...
- **Type:** UX
- **Description:** | `env` | `map<EnvKey, string>` | 0–256 entries; keys match `[4_USER_FEATURES-A-Z_][4_USER_FEATURES-A-Z0-9_]{0,127}` | Per-stage environment variables; override `default_env` |
| `execution_env` | `ExecutionEnv?` | Optional; inherits workflow default if absent | Filesystem and process environment configuration |
| `retry` | `RetryConfig?` | Optional | Retry policy for genuine failures |
| `timeout_secs` | `u64?` | Must not exceed `workflow.timeout_secs` if both set | Per-stage wall-clock timeout |
| `fan_out` | `FanOutConfig?` | Mutually exclusive with `branch` | Parallel sub-agent fan-out configuration |
| `branch` | `BranchConfig?` | Mutually exclusive with `fan_out` | Conditional routing configuration |
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-A-Z0-9_]** | `env` | `map<EnvKey, string>` | 0–256 entries; keys match `[4_USER_FEATURES-A-Z_][4_USER_FEATURES-...
- **Type:** UX
- **Description:** | `env` | `map<EnvKey, string>` | 0–256 entries; keys match `[4_USER_FEATURES-A-Z_][4_USER_FEATURES-A-Z0-9_]{0,127}` | Per-stage environment variables; override `default_env` |
| `execution_env` | `ExecutionEnv?` | Optional; inherits workflow default if absent | Filesystem and process environment configuration |
| `retry` | `RetryConfig?` | Optional | Retry policy for genuine failures |
| `timeout_secs` | `u64?` | Must not exceed `workflow.timeout_secs` if both set | Per-stage wall-clock timeout |
| `fan_out` | `FanOutConfig?` | Mutually exclusive with `branch` | Parallel sub-agent fan-out configuration |
| `branch` | `BranchConfig?` | Mutually exclusive with `fan_out` | Conditional routing configuration |
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-FEAT-BR-010]** Two `WorkflowRun` records within the same project MUST NOT share the same `slug` unless one of them is in `Cancelled`...
- **Type:** Functional
- **Description:** Two `WorkflowRun` records within the same project MUST NOT share the same `slug` unless one of them is in `Cancelled` status. This uniqueness check is enforced atomically under a per-project mutex.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-001]** GIVEN a `devs
- **Type:** Technical
- **Description:** GIVEN a `devs.toml` with any invalid field WHEN the server starts THEN all configuration errors are printed to stderr, no ports are bound, and the process exits non-zero.
- **[4_USER_FEATURES-AC-FEAT-002]** GIVEN a valid `devs.toml` WHEN the server starts THEN the gRPC port is bound before the MCP port; if the MCP port fails, the gRPC port is released and the process exits non-zero.
- **[4_USER_FEATURES-AC-FEAT-003]** GIVEN a running server WHEN startup completes THEN the discovery file at `$DEVS_DISCOVERY_FILE` (or `~/.config/devs/server.addr`) contains exactly `<host>:<grpc-port>` as plain UTF-8.
- **[4_USER_FEATURES-AC-FEAT-004]** GIVEN a running server receiving SIGTERM WHEN shutdown completes THEN the discovery file is deleted and the process exits 0.
- **[4_USER_FEATURES-AC-FEAT-005]** GIVEN a stale discovery file pointing to a stopped server WHEN a CLI client runs any command THEN the command exits with code 3.
- **[4_USER_FEATURES-AC-FEAT-006]** GIVEN `DEVS_DISCOVERY_FILE` set in the environment WHEN a client starts THEN it reads only that path for server discovery and ignores `~/.config/devs/server.addr`.
- **[4_USER_FEATURES-AC-FEAT-007]** GIVEN `--server <addr>` passed to any CLI command WHEN the command runs THEN the explicit address is used without reading the discovery file.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-002]** GIVEN a valid `devs
- **Type:** Technical
- **Description:** GIVEN a valid `devs.toml` WHEN the server starts THEN the gRPC port is bound before the MCP port; if the MCP port fails, the gRPC port is released and the process exits non-zero.
- **[4_USER_FEATURES-AC-FEAT-003]** GIVEN a running server WHEN startup completes THEN the discovery file at `$DEVS_DISCOVERY_FILE` (or `~/.config/devs/server.addr`) contains exactly `<host>:<grpc-port>` as plain UTF-8.
- **[4_USER_FEATURES-AC-FEAT-004]** GIVEN a running server receiving SIGTERM WHEN shutdown completes THEN the discovery file is deleted and the process exits 0.
- **[4_USER_FEATURES-AC-FEAT-005]** GIVEN a stale discovery file pointing to a stopped server WHEN a CLI client runs any command THEN the command exits with code 3.
- **[4_USER_FEATURES-AC-FEAT-006]** GIVEN `DEVS_DISCOVERY_FILE` set in the environment WHEN a client starts THEN it reads only that path for server discovery and ignores `~/.config/devs/server.addr`.
- **[4_USER_FEATURES-AC-FEAT-007]** GIVEN `--server <addr>` passed to any CLI command WHEN the command runs THEN the explicit address is used without reading the discovery file.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-003]** GIVEN a running server WHEN startup completes THEN the discovery file at `$DEVS_DISCOVERY_FILE` (or `~/
- **Type:** Technical
- **Description:** GIVEN a running server WHEN startup completes THEN the discovery file at `$DEVS_DISCOVERY_FILE` (or `~/.config/devs/server.addr`) contains exactly `<host>:<grpc-port>` as plain UTF-8.
- **[4_USER_FEATURES-AC-FEAT-004]** GIVEN a running server receiving SIGTERM WHEN shutdown completes THEN the discovery file is deleted and the process exits 0.
- **[4_USER_FEATURES-AC-FEAT-005]** GIVEN a stale discovery file pointing to a stopped server WHEN a CLI client runs any command THEN the command exits with code 3.
- **[4_USER_FEATURES-AC-FEAT-006]** GIVEN `DEVS_DISCOVERY_FILE` set in the environment WHEN a client starts THEN it reads only that path for server discovery and ignores `~/.config/devs/server.addr`.
- **[4_USER_FEATURES-AC-FEAT-007]** GIVEN `--server <addr>` passed to any CLI command WHEN the command runs THEN the explicit address is used without reading the discovery file.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-004]** GIVEN a running server receiving SIGTERM WHEN shutdown completes THEN the discovery file is deleted and the process e...
- **Type:** Functional
- **Description:** GIVEN a running server receiving SIGTERM WHEN shutdown completes THEN the discovery file is deleted and the process exits 0.
- **[4_USER_FEATURES-AC-FEAT-005]** GIVEN a stale discovery file pointing to a stopped server WHEN a CLI client runs any command THEN the command exits with code 3.
- **[4_USER_FEATURES-AC-FEAT-006]** GIVEN `DEVS_DISCOVERY_FILE` set in the environment WHEN a client starts THEN it reads only that path for server discovery and ignores `~/.config/devs/server.addr`.
- **[4_USER_FEATURES-AC-FEAT-007]** GIVEN `--server <addr>` passed to any CLI command WHEN the command runs THEN the explicit address is used without reading the discovery file.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-005]** GIVEN a stale discovery file pointing to a stopped server WHEN a CLI client runs any command THEN the command exits w...
- **Type:** Functional
- **Description:** GIVEN a stale discovery file pointing to a stopped server WHEN a CLI client runs any command THEN the command exits with code 3.
- **[4_USER_FEATURES-AC-FEAT-006]** GIVEN `DEVS_DISCOVERY_FILE` set in the environment WHEN a client starts THEN it reads only that path for server discovery and ignores `~/.config/devs/server.addr`.
- **[4_USER_FEATURES-AC-FEAT-007]** GIVEN `--server <addr>` passed to any CLI command WHEN the command runs THEN the explicit address is used without reading the discovery file.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-006]** GIVEN `DEVS_DISCOVERY_FILE` set in the environment WHEN a client starts THEN it reads only that path for server disco...
- **Type:** Functional
- **Description:** GIVEN `DEVS_DISCOVERY_FILE` set in the environment WHEN a client starts THEN it reads only that path for server discovery and ignores `~/.config/devs/server.addr`.
- **[4_USER_FEATURES-AC-FEAT-007]** GIVEN `--server <addr>` passed to any CLI command WHEN the command runs THEN the explicit address is used without reading the discovery file.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-007]** GIVEN `--server <addr>` passed to any CLI command WHEN the command runs THEN the explicit address is used without rea...
- **Type:** Functional
- **Description:** GIVEN `--server <addr>` passed to any CLI command WHEN the command runs THEN the explicit address is used without reading the discovery file.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-010]** GIVEN a workflow with a dependency cycle `A → B → A` WHEN `submit_run` is called THEN the response is `INVALID_ARGUME...
- **Type:** UX
- **Description:** GIVEN a workflow with a dependency cycle `A → B → A` WHEN `submit_run` is called THEN the response is `INVALID_ARGUMENT` containing `"cycle detected"` and the array `["A", "B", "A"]`.
- **[4_USER_FEATURES-AC-FEAT-011]** GIVEN a workflow with zero stages WHEN `submit_run` is called THEN the response is `INVALID_ARGUMENT`.
- **[4_USER_FEATURES-AC-FEAT-012]** GIVEN a workflow stage referencing a non-existent pool WHEN `submit_run` is called THEN the response is `INVALID_ARGUMENT` identifying the unknown pool name.
- **[4_USER_FEATURES-AC-FEAT-013]** GIVEN a workflow with duplicate stage names WHEN `submit_run` is called THEN all duplicate names are listed in a single `INVALID_ARGUMENT` response.
- **[4_USER_FEATURES-AC-FEAT-014]** GIVEN a workflow with multiple validation errors WHEN `submit_run` is called THEN all errors are returned in a single response (not just the first error).
- **[4_USER_FEATURES-AC-FEAT-015]** GIVEN `submit_run` succeeds WHEN the run transitions `Pending → Running` THEN the `definition_snapshot` is written and committed to git before the first stage transitions `Waiting → Eligible`.
- **[4_USER_FEATURES-AC-FEAT-016]** GIVEN two concurrent `submit_run` calls with the same `run_name` for the same project WHEN both complete THEN exactly one succeeds and exactly one returns `ALREADY_EXISTS`.
- **[4_USER_FEATURES-AC-FEAT-017]** GIVEN a `Boolean`-typed workflow input WHEN submitted with value `"1"` THEN the submission is rejected with `INVALID_ARGUMENT`.
- **[4_USER_FEATURES-AC-FEAT-018]** GIVEN a workflow input with `required: true` omitted from submission WHEN `submit_run` is called THEN the response is `INVALID_ARGUMENT` identifying the missing input.
- **[4_USER_FEATURES-AC-FEAT-019]** GIVEN `write_workflow_definition` is called while a run of that workflow is active WHEN the run's stages complete THEN the run uses the snapshot captured at start time, not the newly written definition.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-011]** GIVEN a workflow with zero stages WHEN `submit_run` is called THEN the response is `INVALID_ARGUMENT`
- **Type:** UX
- **Description:** GIVEN a workflow with zero stages WHEN `submit_run` is called THEN the response is `INVALID_ARGUMENT`.
- **[4_USER_FEATURES-AC-FEAT-012]** GIVEN a workflow stage referencing a non-existent pool WHEN `submit_run` is called THEN the response is `INVALID_ARGUMENT` identifying the unknown pool name.
- **[4_USER_FEATURES-AC-FEAT-013]** GIVEN a workflow with duplicate stage names WHEN `submit_run` is called THEN all duplicate names are listed in a single `INVALID_ARGUMENT` response.
- **[4_USER_FEATURES-AC-FEAT-014]** GIVEN a workflow with multiple validation errors WHEN `submit_run` is called THEN all errors are returned in a single response (not just the first error).
- **[4_USER_FEATURES-AC-FEAT-015]** GIVEN `submit_run` succeeds WHEN the run transitions `Pending → Running` THEN the `definition_snapshot` is written and committed to git before the first stage transitions `Waiting → Eligible`.
- **[4_USER_FEATURES-AC-FEAT-016]** GIVEN two concurrent `submit_run` calls with the same `run_name` for the same project WHEN both complete THEN exactly one succeeds and exactly one returns `ALREADY_EXISTS`.
- **[4_USER_FEATURES-AC-FEAT-017]** GIVEN a `Boolean`-typed workflow input WHEN submitted with value `"1"` THEN the submission is rejected with `INVALID_ARGUMENT`.
- **[4_USER_FEATURES-AC-FEAT-018]** GIVEN a workflow input with `required: true` omitted from submission WHEN `submit_run` is called THEN the response is `INVALID_ARGUMENT` identifying the missing input.
- **[4_USER_FEATURES-AC-FEAT-019]** GIVEN `write_workflow_definition` is called while a run of that workflow is active WHEN the run's stages complete THEN the run uses the snapshot captured at start time, not the newly written definition.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-012]** GIVEN a workflow stage referencing a non-existent pool WHEN `submit_run` is called THEN the response is `INVALID_ARGU...
- **Type:** UX
- **Description:** GIVEN a workflow stage referencing a non-existent pool WHEN `submit_run` is called THEN the response is `INVALID_ARGUMENT` identifying the unknown pool name.
- **[4_USER_FEATURES-AC-FEAT-013]** GIVEN a workflow with duplicate stage names WHEN `submit_run` is called THEN all duplicate names are listed in a single `INVALID_ARGUMENT` response.
- **[4_USER_FEATURES-AC-FEAT-014]** GIVEN a workflow with multiple validation errors WHEN `submit_run` is called THEN all errors are returned in a single response (not just the first error).
- **[4_USER_FEATURES-AC-FEAT-015]** GIVEN `submit_run` succeeds WHEN the run transitions `Pending → Running` THEN the `definition_snapshot` is written and committed to git before the first stage transitions `Waiting → Eligible`.
- **[4_USER_FEATURES-AC-FEAT-016]** GIVEN two concurrent `submit_run` calls with the same `run_name` for the same project WHEN both complete THEN exactly one succeeds and exactly one returns `ALREADY_EXISTS`.
- **[4_USER_FEATURES-AC-FEAT-017]** GIVEN a `Boolean`-typed workflow input WHEN submitted with value `"1"` THEN the submission is rejected with `INVALID_ARGUMENT`.
- **[4_USER_FEATURES-AC-FEAT-018]** GIVEN a workflow input with `required: true` omitted from submission WHEN `submit_run` is called THEN the response is `INVALID_ARGUMENT` identifying the missing input.
- **[4_USER_FEATURES-AC-FEAT-019]** GIVEN `write_workflow_definition` is called while a run of that workflow is active WHEN the run's stages complete THEN the run uses the snapshot captured at start time, not the newly written definition.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-013]** GIVEN a workflow with duplicate stage names WHEN `submit_run` is called THEN all duplicate names are listed in a sing...
- **Type:** UX
- **Description:** GIVEN a workflow with duplicate stage names WHEN `submit_run` is called THEN all duplicate names are listed in a single `INVALID_ARGUMENT` response.
- **[4_USER_FEATURES-AC-FEAT-014]** GIVEN a workflow with multiple validation errors WHEN `submit_run` is called THEN all errors are returned in a single response (not just the first error).
- **[4_USER_FEATURES-AC-FEAT-015]** GIVEN `submit_run` succeeds WHEN the run transitions `Pending → Running` THEN the `definition_snapshot` is written and committed to git before the first stage transitions `Waiting → Eligible`.
- **[4_USER_FEATURES-AC-FEAT-016]** GIVEN two concurrent `submit_run` calls with the same `run_name` for the same project WHEN both complete THEN exactly one succeeds and exactly one returns `ALREADY_EXISTS`.
- **[4_USER_FEATURES-AC-FEAT-017]** GIVEN a `Boolean`-typed workflow input WHEN submitted with value `"1"` THEN the submission is rejected with `INVALID_ARGUMENT`.
- **[4_USER_FEATURES-AC-FEAT-018]** GIVEN a workflow input with `required: true` omitted from submission WHEN `submit_run` is called THEN the response is `INVALID_ARGUMENT` identifying the missing input.
- **[4_USER_FEATURES-AC-FEAT-019]** GIVEN `write_workflow_definition` is called while a run of that workflow is active WHEN the run's stages complete THEN the run uses the snapshot captured at start time, not the newly written definition.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-014]** GIVEN a workflow with multiple validation errors WHEN `submit_run` is called THEN all errors are returned in a single...
- **Type:** UX
- **Description:** GIVEN a workflow with multiple validation errors WHEN `submit_run` is called THEN all errors are returned in a single response (not just the first error).
- **[4_USER_FEATURES-AC-FEAT-015]** GIVEN `submit_run` succeeds WHEN the run transitions `Pending → Running` THEN the `definition_snapshot` is written and committed to git before the first stage transitions `Waiting → Eligible`.
- **[4_USER_FEATURES-AC-FEAT-016]** GIVEN two concurrent `submit_run` calls with the same `run_name` for the same project WHEN both complete THEN exactly one succeeds and exactly one returns `ALREADY_EXISTS`.
- **[4_USER_FEATURES-AC-FEAT-017]** GIVEN a `Boolean`-typed workflow input WHEN submitted with value `"1"` THEN the submission is rejected with `INVALID_ARGUMENT`.
- **[4_USER_FEATURES-AC-FEAT-018]** GIVEN a workflow input with `required: true` omitted from submission WHEN `submit_run` is called THEN the response is `INVALID_ARGUMENT` identifying the missing input.
- **[4_USER_FEATURES-AC-FEAT-019]** GIVEN `write_workflow_definition` is called while a run of that workflow is active WHEN the run's stages complete THEN the run uses the snapshot captured at start time, not the newly written definition.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-015]** GIVEN `submit_run` succeeds WHEN the run transitions `Pending → Running` THEN the `definition_snapshot` is written an...
- **Type:** UX
- **Description:** GIVEN `submit_run` succeeds WHEN the run transitions `Pending → Running` THEN the `definition_snapshot` is written and committed to git before the first stage transitions `Waiting → Eligible`.
- **[4_USER_FEATURES-AC-FEAT-016]** GIVEN two concurrent `submit_run` calls with the same `run_name` for the same project WHEN both complete THEN exactly one succeeds and exactly one returns `ALREADY_EXISTS`.
- **[4_USER_FEATURES-AC-FEAT-017]** GIVEN a `Boolean`-typed workflow input WHEN submitted with value `"1"` THEN the submission is rejected with `INVALID_ARGUMENT`.
- **[4_USER_FEATURES-AC-FEAT-018]** GIVEN a workflow input with `required: true` omitted from submission WHEN `submit_run` is called THEN the response is `INVALID_ARGUMENT` identifying the missing input.
- **[4_USER_FEATURES-AC-FEAT-019]** GIVEN `write_workflow_definition` is called while a run of that workflow is active WHEN the run's stages complete THEN the run uses the snapshot captured at start time, not the newly written definition.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-016]** GIVEN two concurrent `submit_run` calls with the same `run_name` for the same project WHEN both complete THEN exactly...
- **Type:** UX
- **Description:** GIVEN two concurrent `submit_run` calls with the same `run_name` for the same project WHEN both complete THEN exactly one succeeds and exactly one returns `ALREADY_EXISTS`.
- **[4_USER_FEATURES-AC-FEAT-017]** GIVEN a `Boolean`-typed workflow input WHEN submitted with value `"1"` THEN the submission is rejected with `INVALID_ARGUMENT`.
- **[4_USER_FEATURES-AC-FEAT-018]** GIVEN a workflow input with `required: true` omitted from submission WHEN `submit_run` is called THEN the response is `INVALID_ARGUMENT` identifying the missing input.
- **[4_USER_FEATURES-AC-FEAT-019]** GIVEN `write_workflow_definition` is called while a run of that workflow is active WHEN the run's stages complete THEN the run uses the snapshot captured at start time, not the newly written definition.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-017]** GIVEN a `Boolean`-typed workflow input WHEN submitted with value `"1"` THEN the submission is rejected with `INVALID_...
- **Type:** UX
- **Description:** GIVEN a `Boolean`-typed workflow input WHEN submitted with value `"1"` THEN the submission is rejected with `INVALID_ARGUMENT`.
- **[4_USER_FEATURES-AC-FEAT-018]** GIVEN a workflow input with `required: true` omitted from submission WHEN `submit_run` is called THEN the response is `INVALID_ARGUMENT` identifying the missing input.
- **[4_USER_FEATURES-AC-FEAT-019]** GIVEN `write_workflow_definition` is called while a run of that workflow is active WHEN the run's stages complete THEN the run uses the snapshot captured at start time, not the newly written definition.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-018]** GIVEN a workflow input with `required: true` omitted from submission WHEN `submit_run` is called THEN the response is...
- **Type:** UX
- **Description:** GIVEN a workflow input with `required: true` omitted from submission WHEN `submit_run` is called THEN the response is `INVALID_ARGUMENT` identifying the missing input.
- **[4_USER_FEATURES-AC-FEAT-019]** GIVEN `write_workflow_definition` is called while a run of that workflow is active WHEN the run's stages complete THEN the run uses the snapshot captured at start time, not the newly written definition.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-019]** GIVEN `write_workflow_definition` is called while a run of that workflow is active WHEN the run's stages complete THE...
- **Type:** Functional
- **Description:** GIVEN `write_workflow_definition` is called while a run of that workflow is active WHEN the run's stages complete THEN the run uses the snapshot captured at start time, not the newly written definition.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-020]** GIVEN two stages with no shared dependencies WHEN the shared dependency completes THEN both stages are dispatched wit...
- **Type:** Technical
- **Description:** GIVEN two stages with no shared dependencies WHEN the shared dependency completes THEN both stages are dispatched within 100ms of each other.
- **[4_USER_FEATURES-AC-FEAT-021]** GIVEN a stage with `completion: StructuredOutput` WHEN `.devs_output.json` contains `"success": "true"` (string) THEN the stage transitions to `Failed`.
- **[4_USER_FEATURES-AC-FEAT-022]** GIVEN a stage with `completion: McpToolCall` WHEN the agent exits without calling `signal_completion` THEN the stage is evaluated using the process exit code as if `completion: ExitCode`.
- **[4_USER_FEATURES-AC-FEAT-023]** GIVEN a stage where `prompt_file` points to a non-existent file at execution time WHEN the stage is dispatched THEN the stage fails before the agent is spawned, with the missing path in the failure reason.
- **[4_USER_FEATURES-AC-FEAT-024]** GIVEN a template variable `{{stage.X.output.field}}` where stage X uses `completion: ExitCode` WHEN the stage referencing it is dispatched THEN it fails before agent spawn with `TemplateError::NoStructuredOutput`.
- **[4_USER_FEATURES-AC-FEAT-025]** GIVEN a template variable referencing a stage not in the transitive `depends_on` closure WHEN the stage is dispatched THEN it fails before agent spawn.
- **[4_USER_FEATURES-AC-FEAT-026]** GIVEN a missing template variable that has no value WHEN the stage is dispatched THEN it fails before agent spawn with the variable name identified; no empty-string substitution occurs.
- **[4_USER_FEATURES-AC-FEAT-027]** GIVEN `.devs_context.json` cannot be written (simulated disk full) WHEN a stage is dispatched THEN the stage fails without spawning the agent.
- **[4_USER_FEATURES-AC-FEAT-028]** GIVEN a stage timeout of N seconds WHEN the agent has not exited after N seconds THEN the server writes `devs:cancel\n`, waits 5s, sends SIGTERM, waits 5s, sends SIGKILL, then records `TimedOut`.
- **[4_USER_FEATURES-AC-FEAT-029]** GIVEN a running agent WHEN the agent binary is not found on PATH THEN the stage fails immediately with an error identifying the missing binary; no retry is attempted.
- **[4_USER_FEATURES-AC-FEAT-030]** GIVEN a PTY-mode agent WHEN PTY allocation fails THEN the stage fails immediately; no fallback to non-PTY mode occurs.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-021]** GIVEN a stage with `completion: StructuredOutput` WHEN `
- **Type:** Technical
- **Description:** GIVEN a stage with `completion: StructuredOutput` WHEN `.devs_output.json` contains `"success": "true"` (string) THEN the stage transitions to `Failed`.
- **[4_USER_FEATURES-AC-FEAT-022]** GIVEN a stage with `completion: McpToolCall` WHEN the agent exits without calling `signal_completion` THEN the stage is evaluated using the process exit code as if `completion: ExitCode`.
- **[4_USER_FEATURES-AC-FEAT-023]** GIVEN a stage where `prompt_file` points to a non-existent file at execution time WHEN the stage is dispatched THEN the stage fails before the agent is spawned, with the missing path in the failure reason.
- **[4_USER_FEATURES-AC-FEAT-024]** GIVEN a template variable `{{stage.X.output.field}}` where stage X uses `completion: ExitCode` WHEN the stage referencing it is dispatched THEN it fails before agent spawn with `TemplateError::NoStructuredOutput`.
- **[4_USER_FEATURES-AC-FEAT-025]** GIVEN a template variable referencing a stage not in the transitive `depends_on` closure WHEN the stage is dispatched THEN it fails before agent spawn.
- **[4_USER_FEATURES-AC-FEAT-026]** GIVEN a missing template variable that has no value WHEN the stage is dispatched THEN it fails before agent spawn with the variable name identified; no empty-string substitution occurs.
- **[4_USER_FEATURES-AC-FEAT-027]** GIVEN `.devs_context.json` cannot be written (simulated disk full) WHEN a stage is dispatched THEN the stage fails without spawning the agent.
- **[4_USER_FEATURES-AC-FEAT-028]** GIVEN a stage timeout of N seconds WHEN the agent has not exited after N seconds THEN the server writes `devs:cancel\n`, waits 5s, sends SIGTERM, waits 5s, sends SIGKILL, then records `TimedOut`.
- **[4_USER_FEATURES-AC-FEAT-029]** GIVEN a running agent WHEN the agent binary is not found on PATH THEN the stage fails immediately with an error identifying the missing binary; no retry is attempted.
- **[4_USER_FEATURES-AC-FEAT-030]** GIVEN a PTY-mode agent WHEN PTY allocation fails THEN the stage fails immediately; no fallback to non-PTY mode occurs.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-022]** GIVEN a stage with `completion: McpToolCall` WHEN the agent exits without calling `signal_completion` THEN the stage ...
- **Type:** Technical
- **Description:** GIVEN a stage with `completion: McpToolCall` WHEN the agent exits without calling `signal_completion` THEN the stage is evaluated using the process exit code as if `completion: ExitCode`.
- **[4_USER_FEATURES-AC-FEAT-023]** GIVEN a stage where `prompt_file` points to a non-existent file at execution time WHEN the stage is dispatched THEN the stage fails before the agent is spawned, with the missing path in the failure reason.
- **[4_USER_FEATURES-AC-FEAT-024]** GIVEN a template variable `{{stage.X.output.field}}` where stage X uses `completion: ExitCode` WHEN the stage referencing it is dispatched THEN it fails before agent spawn with `TemplateError::NoStructuredOutput`.
- **[4_USER_FEATURES-AC-FEAT-025]** GIVEN a template variable referencing a stage not in the transitive `depends_on` closure WHEN the stage is dispatched THEN it fails before agent spawn.
- **[4_USER_FEATURES-AC-FEAT-026]** GIVEN a missing template variable that has no value WHEN the stage is dispatched THEN it fails before agent spawn with the variable name identified; no empty-string substitution occurs.
- **[4_USER_FEATURES-AC-FEAT-027]** GIVEN `.devs_context.json` cannot be written (simulated disk full) WHEN a stage is dispatched THEN the stage fails without spawning the agent.
- **[4_USER_FEATURES-AC-FEAT-028]** GIVEN a stage timeout of N seconds WHEN the agent has not exited after N seconds THEN the server writes `devs:cancel\n`, waits 5s, sends SIGTERM, waits 5s, sends SIGKILL, then records `TimedOut`.
- **[4_USER_FEATURES-AC-FEAT-029]** GIVEN a running agent WHEN the agent binary is not found on PATH THEN the stage fails immediately with an error identifying the missing binary; no retry is attempted.
- **[4_USER_FEATURES-AC-FEAT-030]** GIVEN a PTY-mode agent WHEN PTY allocation fails THEN the stage fails immediately; no fallback to non-PTY mode occurs.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-023]** GIVEN a stage where `prompt_file` points to a non-existent file at execution time WHEN the stage is dispatched THEN t...
- **Type:** Technical
- **Description:** GIVEN a stage where `prompt_file` points to a non-existent file at execution time WHEN the stage is dispatched THEN the stage fails before the agent is spawned, with the missing path in the failure reason.
- **[4_USER_FEATURES-AC-FEAT-024]** GIVEN a template variable `{{stage.X.output.field}}` where stage X uses `completion: ExitCode` WHEN the stage referencing it is dispatched THEN it fails before agent spawn with `TemplateError::NoStructuredOutput`.
- **[4_USER_FEATURES-AC-FEAT-025]** GIVEN a template variable referencing a stage not in the transitive `depends_on` closure WHEN the stage is dispatched THEN it fails before agent spawn.
- **[4_USER_FEATURES-AC-FEAT-026]** GIVEN a missing template variable that has no value WHEN the stage is dispatched THEN it fails before agent spawn with the variable name identified; no empty-string substitution occurs.
- **[4_USER_FEATURES-AC-FEAT-027]** GIVEN `.devs_context.json` cannot be written (simulated disk full) WHEN a stage is dispatched THEN the stage fails without spawning the agent.
- **[4_USER_FEATURES-AC-FEAT-028]** GIVEN a stage timeout of N seconds WHEN the agent has not exited after N seconds THEN the server writes `devs:cancel\n`, waits 5s, sends SIGTERM, waits 5s, sends SIGKILL, then records `TimedOut`.
- **[4_USER_FEATURES-AC-FEAT-029]** GIVEN a running agent WHEN the agent binary is not found on PATH THEN the stage fails immediately with an error identifying the missing binary; no retry is attempted.
- **[4_USER_FEATURES-AC-FEAT-030]** GIVEN a PTY-mode agent WHEN PTY allocation fails THEN the stage fails immediately; no fallback to non-PTY mode occurs.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-024]** GIVEN a template variable `{{stage
- **Type:** Technical
- **Description:** GIVEN a template variable `{{stage.X.output.field}}` where stage X uses `completion: ExitCode` WHEN the stage referencing it is dispatched THEN it fails before agent spawn with `TemplateError::NoStructuredOutput`.
- **[4_USER_FEATURES-AC-FEAT-025]** GIVEN a template variable referencing a stage not in the transitive `depends_on` closure WHEN the stage is dispatched THEN it fails before agent spawn.
- **[4_USER_FEATURES-AC-FEAT-026]** GIVEN a missing template variable that has no value WHEN the stage is dispatched THEN it fails before agent spawn with the variable name identified; no empty-string substitution occurs.
- **[4_USER_FEATURES-AC-FEAT-027]** GIVEN `.devs_context.json` cannot be written (simulated disk full) WHEN a stage is dispatched THEN the stage fails without spawning the agent.
- **[4_USER_FEATURES-AC-FEAT-028]** GIVEN a stage timeout of N seconds WHEN the agent has not exited after N seconds THEN the server writes `devs:cancel\n`, waits 5s, sends SIGTERM, waits 5s, sends SIGKILL, then records `TimedOut`.
- **[4_USER_FEATURES-AC-FEAT-029]** GIVEN a running agent WHEN the agent binary is not found on PATH THEN the stage fails immediately with an error identifying the missing binary; no retry is attempted.
- **[4_USER_FEATURES-AC-FEAT-030]** GIVEN a PTY-mode agent WHEN PTY allocation fails THEN the stage fails immediately; no fallback to non-PTY mode occurs.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-025]** GIVEN a template variable referencing a stage not in the transitive `depends_on` closure WHEN the stage is dispatched...
- **Type:** Technical
- **Description:** GIVEN a template variable referencing a stage not in the transitive `depends_on` closure WHEN the stage is dispatched THEN it fails before agent spawn.
- **[4_USER_FEATURES-AC-FEAT-026]** GIVEN a missing template variable that has no value WHEN the stage is dispatched THEN it fails before agent spawn with the variable name identified; no empty-string substitution occurs.
- **[4_USER_FEATURES-AC-FEAT-027]** GIVEN `.devs_context.json` cannot be written (simulated disk full) WHEN a stage is dispatched THEN the stage fails without spawning the agent.
- **[4_USER_FEATURES-AC-FEAT-028]** GIVEN a stage timeout of N seconds WHEN the agent has not exited after N seconds THEN the server writes `devs:cancel\n`, waits 5s, sends SIGTERM, waits 5s, sends SIGKILL, then records `TimedOut`.
- **[4_USER_FEATURES-AC-FEAT-029]** GIVEN a running agent WHEN the agent binary is not found on PATH THEN the stage fails immediately with an error identifying the missing binary; no retry is attempted.
- **[4_USER_FEATURES-AC-FEAT-030]** GIVEN a PTY-mode agent WHEN PTY allocation fails THEN the stage fails immediately; no fallback to non-PTY mode occurs.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-026]** GIVEN a missing template variable that has no value WHEN the stage is dispatched THEN it fails before agent spawn wit...
- **Type:** Technical
- **Description:** GIVEN a missing template variable that has no value WHEN the stage is dispatched THEN it fails before agent spawn with the variable name identified; no empty-string substitution occurs.
- **[4_USER_FEATURES-AC-FEAT-027]** GIVEN `.devs_context.json` cannot be written (simulated disk full) WHEN a stage is dispatched THEN the stage fails without spawning the agent.
- **[4_USER_FEATURES-AC-FEAT-028]** GIVEN a stage timeout of N seconds WHEN the agent has not exited after N seconds THEN the server writes `devs:cancel\n`, waits 5s, sends SIGTERM, waits 5s, sends SIGKILL, then records `TimedOut`.
- **[4_USER_FEATURES-AC-FEAT-029]** GIVEN a running agent WHEN the agent binary is not found on PATH THEN the stage fails immediately with an error identifying the missing binary; no retry is attempted.
- **[4_USER_FEATURES-AC-FEAT-030]** GIVEN a PTY-mode agent WHEN PTY allocation fails THEN the stage fails immediately; no fallback to non-PTY mode occurs.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-027]** GIVEN `
- **Type:** Technical
- **Description:** GIVEN `.devs_context.json` cannot be written (simulated disk full) WHEN a stage is dispatched THEN the stage fails without spawning the agent.
- **[4_USER_FEATURES-AC-FEAT-028]** GIVEN a stage timeout of N seconds WHEN the agent has not exited after N seconds THEN the server writes `devs:cancel\n`, waits 5s, sends SIGTERM, waits 5s, sends SIGKILL, then records `TimedOut`.
- **[4_USER_FEATURES-AC-FEAT-029]** GIVEN a running agent WHEN the agent binary is not found on PATH THEN the stage fails immediately with an error identifying the missing binary; no retry is attempted.
- **[4_USER_FEATURES-AC-FEAT-030]** GIVEN a PTY-mode agent WHEN PTY allocation fails THEN the stage fails immediately; no fallback to non-PTY mode occurs.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-028]** GIVEN a stage timeout of N seconds WHEN the agent has not exited after N seconds THEN the server writes `devs:cancel\...
- **Type:** Technical
- **Description:** GIVEN a stage timeout of N seconds WHEN the agent has not exited after N seconds THEN the server writes `devs:cancel\n`, waits 5s, sends SIGTERM, waits 5s, sends SIGKILL, then records `TimedOut`.
- **[4_USER_FEATURES-AC-FEAT-029]** GIVEN a running agent WHEN the agent binary is not found on PATH THEN the stage fails immediately with an error identifying the missing binary; no retry is attempted.
- **[4_USER_FEATURES-AC-FEAT-030]** GIVEN a PTY-mode agent WHEN PTY allocation fails THEN the stage fails immediately; no fallback to non-PTY mode occurs.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-029]** GIVEN a running agent WHEN the agent binary is not found on PATH THEN the stage fails immediately with an error ident...
- **Type:** Technical
- **Description:** GIVEN a running agent WHEN the agent binary is not found on PATH THEN the stage fails immediately with an error identifying the missing binary; no retry is attempted.
- **[4_USER_FEATURES-AC-FEAT-030]** GIVEN a PTY-mode agent WHEN PTY allocation fails THEN the stage fails immediately; no fallback to non-PTY mode occurs.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-030]** GIVEN a PTY-mode agent WHEN PTY allocation fails THEN the stage fails immediately; no fallback to non-PTY mode occurs
- **Type:** Functional
- **Description:** GIVEN a PTY-mode agent WHEN PTY allocation fails THEN the stage fails immediately; no fallback to non-PTY mode occurs.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-031]** GIVEN a stage requires capability `["review"]` WHEN no agent in the pool has `review` capability THEN the stage immed...
- **Type:** UX
- **Description:** GIVEN a stage requires capability `["review"]` WHEN no agent in the pool has `review` capability THEN the stage immediately fails with `UnsatisfiedCapability`; it is never queued.
- **[4_USER_FEATURES-AC-FEAT-032]** GIVEN `max_concurrent = 4` and 10 stages dispatched simultaneously WHEN the pool processes them THEN exactly 4 run concurrently and the remaining 6 queue in FIFO order on the semaphore.
- **[4_USER_FEATURES-AC-FEAT-033]** GIVEN an agent reports a rate-limit event WHEN a fallback agent is available THEN the stage is requeued without incrementing `StageRun.attempt`.
- **[4_USER_FEATURES-AC-FEAT-034]** GIVEN an agent reports a rate-limit event WHEN no fallback agent is available THEN the stage transitions to `Failed` and the `pool.exhausted` webhook fires exactly once for this exhaustion episode.
- **[4_USER_FEATURES-AC-FEAT-035]** GIVEN all agents in a pool are rate-limited simultaneously WHEN any agent becomes available again THEN the `pool.exhausted` episode ends and the next `pool.exhausted` fires only on the next new episode.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-032]** GIVEN `max_concurrent = 4` and 10 stages dispatched simultaneously WHEN the pool processes them THEN exactly 4 run co...
- **Type:** Functional
- **Description:** GIVEN `max_concurrent = 4` and 10 stages dispatched simultaneously WHEN the pool processes them THEN exactly 4 run concurrently and the remaining 6 queue in FIFO order on the semaphore.
- **[4_USER_FEATURES-AC-FEAT-033]** GIVEN an agent reports a rate-limit event WHEN a fallback agent is available THEN the stage is requeued without incrementing `StageRun.attempt`.
- **[4_USER_FEATURES-AC-FEAT-034]** GIVEN an agent reports a rate-limit event WHEN no fallback agent is available THEN the stage transitions to `Failed` and the `pool.exhausted` webhook fires exactly once for this exhaustion episode.
- **[4_USER_FEATURES-AC-FEAT-035]** GIVEN all agents in a pool are rate-limited simultaneously WHEN any agent becomes available again THEN the `pool.exhausted` episode ends and the next `pool.exhausted` fires only on the next new episode.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-033]** GIVEN an agent reports a rate-limit event WHEN a fallback agent is available THEN the stage is requeued without incre...
- **Type:** Functional
- **Description:** GIVEN an agent reports a rate-limit event WHEN a fallback agent is available THEN the stage is requeued without incrementing `StageRun.attempt`.
- **[4_USER_FEATURES-AC-FEAT-034]** GIVEN an agent reports a rate-limit event WHEN no fallback agent is available THEN the stage transitions to `Failed` and the `pool.exhausted` webhook fires exactly once for this exhaustion episode.
- **[4_USER_FEATURES-AC-FEAT-035]** GIVEN all agents in a pool are rate-limited simultaneously WHEN any agent becomes available again THEN the `pool.exhausted` episode ends and the next `pool.exhausted` fires only on the next new episode.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-034]** GIVEN an agent reports a rate-limit event WHEN no fallback agent is available THEN the stage transitions to `Failed` ...
- **Type:** Functional
- **Description:** GIVEN an agent reports a rate-limit event WHEN no fallback agent is available THEN the stage transitions to `Failed` and the `pool.exhausted` webhook fires exactly once for this exhaustion episode.
- **[4_USER_FEATURES-AC-FEAT-035]** GIVEN all agents in a pool are rate-limited simultaneously WHEN any agent becomes available again THEN the `pool.exhausted` episode ends and the next `pool.exhausted` fires only on the next new episode.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-035]** GIVEN all agents in a pool are rate-limited simultaneously WHEN any agent becomes available again THEN the `pool
- **Type:** Functional
- **Description:** GIVEN all agents in a pool are rate-limited simultaneously WHEN any agent becomes available again THEN the `pool.exhausted` episode ends and the next `pool.exhausted` fires only on the next new episode.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-036]** GIVEN a server crash with stages in `Running` status WHEN the server restarts and loads checkpoints THEN those stages...
- **Type:** Functional
- **Description:** GIVEN a server crash with stages in `Running` status WHEN the server restarts and loads checkpoints THEN those stages are reset to `Eligible` and re-dispatched.
- **[4_USER_FEATURES-AC-FEAT-037]** GIVEN a corrupt `checkpoint.json` file WHEN the server restarts THEN the affected run is marked `Unrecoverable` and skipped; the server continues loading other runs without crashing.
- **[4_USER_FEATURES-AC-FEAT-038]** GIVEN a disk-full condition during checkpoint write WHEN the write fails THEN the server logs `ERROR`, deletes the `.tmp` file, and continues running; the write is retried on the next state transition.
- **[4_USER_FEATURES-AC-FEAT-039]** GIVEN a checkpoint branch does not exist WHEN the first checkpoint is written THEN the branch is created as an orphan branch.
- **[4_USER_FEATURES-AC-FEAT-040]** GIVEN `auto_collect` artifact collection WHEN a stage completes THEN `devs` diffs the working dir, commits any changes with message `devs: auto-collect stage <name> run <id>`, and pushes to the checkpoint branch only (not the main branch).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-037]** GIVEN a corrupt `checkpoint
- **Type:** Functional
- **Description:** GIVEN a corrupt `checkpoint.json` file WHEN the server restarts THEN the affected run is marked `Unrecoverable` and skipped; the server continues loading other runs without crashing.
- **[4_USER_FEATURES-AC-FEAT-038]** GIVEN a disk-full condition during checkpoint write WHEN the write fails THEN the server logs `ERROR`, deletes the `.tmp` file, and continues running; the write is retried on the next state transition.
- **[4_USER_FEATURES-AC-FEAT-039]** GIVEN a checkpoint branch does not exist WHEN the first checkpoint is written THEN the branch is created as an orphan branch.
- **[4_USER_FEATURES-AC-FEAT-040]** GIVEN `auto_collect` artifact collection WHEN a stage completes THEN `devs` diffs the working dir, commits any changes with message `devs: auto-collect stage <name> run <id>`, and pushes to the checkpoint branch only (not the main branch).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-038]** GIVEN a disk-full condition during checkpoint write WHEN the write fails THEN the server logs `ERROR`, deletes the `
- **Type:** Functional
- **Description:** GIVEN a disk-full condition during checkpoint write WHEN the write fails THEN the server logs `ERROR`, deletes the `.tmp` file, and continues running; the write is retried on the next state transition.
- **[4_USER_FEATURES-AC-FEAT-039]** GIVEN a checkpoint branch does not exist WHEN the first checkpoint is written THEN the branch is created as an orphan branch.
- **[4_USER_FEATURES-AC-FEAT-040]** GIVEN `auto_collect` artifact collection WHEN a stage completes THEN `devs` diffs the working dir, commits any changes with message `devs: auto-collect stage <name> run <id>`, and pushes to the checkpoint branch only (not the main branch).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-039]** GIVEN a checkpoint branch does not exist WHEN the first checkpoint is written THEN the branch is created as an orphan...
- **Type:** Functional
- **Description:** GIVEN a checkpoint branch does not exist WHEN the first checkpoint is written THEN the branch is created as an orphan branch.
- **[4_USER_FEATURES-AC-FEAT-040]** GIVEN `auto_collect` artifact collection WHEN a stage completes THEN `devs` diffs the working dir, commits any changes with message `devs: auto-collect stage <name> run <id>`, and pushes to the checkpoint branch only (not the main branch).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-040]** GIVEN `auto_collect` artifact collection WHEN a stage completes THEN `devs` diffs the working dir, commits any change...
- **Type:** Functional
- **Description:** GIVEN `auto_collect` artifact collection WHEN a stage completes THEN `devs` diffs the working dir, commits any changes with message `devs: auto-collect stage <name> run <id>`, and pushes to the checkpoint branch only (not the main branch).
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-041]** GIVEN any CLI command with `--format json` WHEN an error occurs THEN the error is written to stdout as `{"error": "
- **Type:** UX
- **Description:** GIVEN any CLI command with `--format json` WHEN an error occurs THEN the error is written to stdout as `{"error": "...", "code": <n>}` and nothing is written to stderr.
- **[4_USER_FEATURES-AC-FEAT-042]** GIVEN `devs logs <run> --follow` WHEN the run reaches `Completed` THEN the command exits with code 0.
- **[4_USER_FEATURES-AC-FEAT-043]** GIVEN `devs logs <run> --follow` WHEN the run reaches `Failed` or `Cancelled` THEN the command exits with code 1.
- **[4_USER_FEATURES-AC-FEAT-044]** GIVEN a run identifier in UUID4 format AND the same value matching a slug WHEN any CLI command uses it THEN it is resolved as a `run_id` (UUID takes precedence).
- **[4_USER_FEATURES-AC-FEAT-045]** GIVEN `devs submit` is called from a directory matching multiple registered projects WHEN `--project` is not specified THEN the command exits with code 4 indicating the ambiguity.
- **[4_USER_FEATURES-AC-FEAT-046]** GIVEN a server returning `NOT_FOUND` for a run WHEN a CLI command targets it THEN the exit code is 2.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-042]** GIVEN `devs logs <run> --follow` WHEN the run reaches `Completed` THEN the command exits with code 0
- **Type:** UX
- **Description:** GIVEN `devs logs <run> --follow` WHEN the run reaches `Completed` THEN the command exits with code 0.
- **[4_USER_FEATURES-AC-FEAT-043]** GIVEN `devs logs <run> --follow` WHEN the run reaches `Failed` or `Cancelled` THEN the command exits with code 1.
- **[4_USER_FEATURES-AC-FEAT-044]** GIVEN a run identifier in UUID4 format AND the same value matching a slug WHEN any CLI command uses it THEN it is resolved as a `run_id` (UUID takes precedence).
- **[4_USER_FEATURES-AC-FEAT-045]** GIVEN `devs submit` is called from a directory matching multiple registered projects WHEN `--project` is not specified THEN the command exits with code 4 indicating the ambiguity.
- **[4_USER_FEATURES-AC-FEAT-046]** GIVEN a server returning `NOT_FOUND` for a run WHEN a CLI command targets it THEN the exit code is 2.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-043]** GIVEN `devs logs <run> --follow` WHEN the run reaches `Failed` or `Cancelled` THEN the command exits with code 1
- **Type:** UX
- **Description:** GIVEN `devs logs <run> --follow` WHEN the run reaches `Failed` or `Cancelled` THEN the command exits with code 1.
- **[4_USER_FEATURES-AC-FEAT-044]** GIVEN a run identifier in UUID4 format AND the same value matching a slug WHEN any CLI command uses it THEN it is resolved as a `run_id` (UUID takes precedence).
- **[4_USER_FEATURES-AC-FEAT-045]** GIVEN `devs submit` is called from a directory matching multiple registered projects WHEN `--project` is not specified THEN the command exits with code 4 indicating the ambiguity.
- **[4_USER_FEATURES-AC-FEAT-046]** GIVEN a server returning `NOT_FOUND` for a run WHEN a CLI command targets it THEN the exit code is 2.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-044]** GIVEN a run identifier in UUID4 format AND the same value matching a slug WHEN any CLI command uses it THEN it is res...
- **Type:** UX
- **Description:** GIVEN a run identifier in UUID4 format AND the same value matching a slug WHEN any CLI command uses it THEN it is resolved as a `run_id` (UUID takes precedence).
- **[4_USER_FEATURES-AC-FEAT-045]** GIVEN `devs submit` is called from a directory matching multiple registered projects WHEN `--project` is not specified THEN the command exits with code 4 indicating the ambiguity.
- **[4_USER_FEATURES-AC-FEAT-046]** GIVEN a server returning `NOT_FOUND` for a run WHEN a CLI command targets it THEN the exit code is 2.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-045]** GIVEN `devs submit` is called from a directory matching multiple registered projects WHEN `--project` is not specifie...
- **Type:** UX
- **Description:** GIVEN `devs submit` is called from a directory matching multiple registered projects WHEN `--project` is not specified THEN the command exits with code 4 indicating the ambiguity.
- **[4_USER_FEATURES-AC-FEAT-046]** GIVEN a server returning `NOT_FOUND` for a run WHEN a CLI command targets it THEN the exit code is 2.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-046]** GIVEN a server returning `NOT_FOUND` for a run WHEN a CLI command targets it THEN the exit code is 2
- **Type:** Functional
- **Description:** GIVEN a server returning `NOT_FOUND` for a run WHEN a CLI command targets it THEN the exit code is 2.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-047]** GIVEN the TUI is connected to a running server WHEN a `StreamRunEvents` event arrives THEN the screen is re-rendered ...
- **Type:** UX
- **Description:** GIVEN the TUI is connected to a running server WHEN a `StreamRunEvents` event arrives THEN the screen is re-rendered within 50ms.
- **[4_USER_FEATURES-AC-FEAT-048]** GIVEN the TUI is connected WHEN the server connection drops THEN the TUI displays a reconnection notice and begins exponential backoff (1s→2s→4s→8s→16s→30s).
- **[4_USER_FEATURES-AC-FEAT-049]** GIVEN the TUI has been disconnected for more than 30s total (plus 5s additional) WHEN no reconnection succeeds THEN the TUI prints a final disconnection message and exits with code 1.
- **[4_USER_FEATURES-AC-FEAT-050]** GIVEN stage statuses displayed in the TUI WHEN any status changes THEN the four-letter abbreviation and elapsed time in the stage box are updated without requiring color to distinguish states.
- **[4_USER_FEATURES-AC-FEAT-051]** GIVEN the TUI renders on an 80-column terminal WHEN stage names and statuses are displayed THEN no critical information is clipped or absent.
- **[4_USER_FEATURES-AC-FEAT-052]** GIVEN TUI tests run in CI WHEN snapshots are compared THEN comparison uses text file fixtures (not pixel screenshots); mismatches generate `.txt.new` files that must be reviewed before approval.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-048]** GIVEN the TUI is connected WHEN the server connection drops THEN the TUI displays a reconnection notice and begins ex...
- **Type:** UX
- **Description:** GIVEN the TUI is connected WHEN the server connection drops THEN the TUI displays a reconnection notice and begins exponential backoff (1s→2s→4s→8s→16s→30s).
- **[4_USER_FEATURES-AC-FEAT-049]** GIVEN the TUI has been disconnected for more than 30s total (plus 5s additional) WHEN no reconnection succeeds THEN the TUI prints a final disconnection message and exits with code 1.
- **[4_USER_FEATURES-AC-FEAT-050]** GIVEN stage statuses displayed in the TUI WHEN any status changes THEN the four-letter abbreviation and elapsed time in the stage box are updated without requiring color to distinguish states.
- **[4_USER_FEATURES-AC-FEAT-051]** GIVEN the TUI renders on an 80-column terminal WHEN stage names and statuses are displayed THEN no critical information is clipped or absent.
- **[4_USER_FEATURES-AC-FEAT-052]** GIVEN TUI tests run in CI WHEN snapshots are compared THEN comparison uses text file fixtures (not pixel screenshots); mismatches generate `.txt.new` files that must be reviewed before approval.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-049]** GIVEN the TUI has been disconnected for more than 30s total (plus 5s additional) WHEN no reconnection succeeds THEN t...
- **Type:** UX
- **Description:** GIVEN the TUI has been disconnected for more than 30s total (plus 5s additional) WHEN no reconnection succeeds THEN the TUI prints a final disconnection message and exits with code 1.
- **[4_USER_FEATURES-AC-FEAT-050]** GIVEN stage statuses displayed in the TUI WHEN any status changes THEN the four-letter abbreviation and elapsed time in the stage box are updated without requiring color to distinguish states.
- **[4_USER_FEATURES-AC-FEAT-051]** GIVEN the TUI renders on an 80-column terminal WHEN stage names and statuses are displayed THEN no critical information is clipped or absent.
- **[4_USER_FEATURES-AC-FEAT-052]** GIVEN TUI tests run in CI WHEN snapshots are compared THEN comparison uses text file fixtures (not pixel screenshots); mismatches generate `.txt.new` files that must be reviewed before approval.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-050]** GIVEN stage statuses displayed in the TUI WHEN any status changes THEN the four-letter abbreviation and elapsed time ...
- **Type:** UX
- **Description:** GIVEN stage statuses displayed in the TUI WHEN any status changes THEN the four-letter abbreviation and elapsed time in the stage box are updated without requiring color to distinguish states.
- **[4_USER_FEATURES-AC-FEAT-051]** GIVEN the TUI renders on an 80-column terminal WHEN stage names and statuses are displayed THEN no critical information is clipped or absent.
- **[4_USER_FEATURES-AC-FEAT-052]** GIVEN TUI tests run in CI WHEN snapshots are compared THEN comparison uses text file fixtures (not pixel screenshots); mismatches generate `.txt.new` files that must be reviewed before approval.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-051]** GIVEN the TUI renders on an 80-column terminal WHEN stage names and statuses are displayed THEN no critical informati...
- **Type:** UX
- **Description:** GIVEN the TUI renders on an 80-column terminal WHEN stage names and statuses are displayed THEN no critical information is clipped or absent.
- **[4_USER_FEATURES-AC-FEAT-052]** GIVEN TUI tests run in CI WHEN snapshots are compared THEN comparison uses text file fixtures (not pixel screenshots); mismatches generate `.txt.new` files that must be reviewed before approval.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-052]** GIVEN TUI tests run in CI WHEN snapshots are compared THEN comparison uses text file fixtures (not pixel screenshots)...
- **Type:** UX
- **Description:** GIVEN TUI tests run in CI WHEN snapshots are compared THEN comparison uses text file fixtures (not pixel screenshots); mismatches generate `.txt.new` files that must be reviewed before approval.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-053]** GIVEN any MCP tool call WHEN the tool succeeds THEN the response contains `"result": <non-null>` and `"error": null`;...
- **Type:** UX
- **Description:** GIVEN any MCP tool call WHEN the tool succeeds THEN the response contains `"result": <non-null>` and `"error": null`; these fields are mutually exclusive.
- **[4_USER_FEATURES-AC-FEAT-054]** GIVEN any MCP tool call WHEN the tool fails THEN the response contains `"result": null` and `"error": "<prefix>: <detail>"` where `<prefix>` is one of the stable category tokens.
- **[4_USER_FEATURES-AC-FEAT-055]** GIVEN `get_run` on any run WHEN the response is returned THEN every field defined in §6.8 is present; no optional field is absent (absent vs null is a protocol violation).
- **[4_USER_FEATURES-AC-FEAT-056]** GIVEN `signal_completion` is called on a stage already in a terminal state WHEN the call is made THEN the response is `"error": "failed_precondition: ..."` and no state change occurs.
- **[4_USER_FEATURES-AC-FEAT-057]** GIVEN `inject_stage_input` is called on a `Running` stage WHEN the call is made THEN the response is `"error": "failed_precondition: ..."`.
- **[4_USER_FEATURES-AC-FEAT-058]** GIVEN `assert_stage_output` is called with an invalid regex pattern WHEN the call is made THEN the entire request fails with an error before any assertion is evaluated.
- **[4_USER_FEATURES-AC-FEAT-059]** GIVEN a request body exceeding 1 MiB WHEN it is POSTed to `/mcp/v1/call` THEN the server responds with HTTP 413.
- **[4_USER_FEATURES-AC-FEAT-060]** GIVEN 64 concurrent MCP connections WHEN all issue simultaneous observation tool calls THEN all receive responses; the server does not deadlock or reject connections.
- **[4_USER_FEATURES-AC-FEAT-061]** GIVEN `stream_logs(follow:true)` on a stage that is `Pending` WHEN the stage is subsequently cancelled without running THEN the final chunk is `{"done":true,"truncated":false,"total_lines":0}`.
- **[4_USER_FEATURES-AC-FEAT-062]** GIVEN MCP and gRPC both serve a `cancel_run` call targeting the same run WHEN the cancel is processed THEN both interfaces observe consistent state (shared `Arc<RwLock<ServerState>>`); no sleep or polling is required to observe the change.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-054]** GIVEN any MCP tool call WHEN the tool fails THEN the response contains `"result": null` and `"error": "<prefix>: <det...
- **Type:** UX
- **Description:** GIVEN any MCP tool call WHEN the tool fails THEN the response contains `"result": null` and `"error": "<prefix>: <detail>"` where `<prefix>` is one of the stable category tokens.
- **[4_USER_FEATURES-AC-FEAT-055]** GIVEN `get_run` on any run WHEN the response is returned THEN every field defined in §6.8 is present; no optional field is absent (absent vs null is a protocol violation).
- **[4_USER_FEATURES-AC-FEAT-056]** GIVEN `signal_completion` is called on a stage already in a terminal state WHEN the call is made THEN the response is `"error": "failed_precondition: ..."` and no state change occurs.
- **[4_USER_FEATURES-AC-FEAT-057]** GIVEN `inject_stage_input` is called on a `Running` stage WHEN the call is made THEN the response is `"error": "failed_precondition: ..."`.
- **[4_USER_FEATURES-AC-FEAT-058]** GIVEN `assert_stage_output` is called with an invalid regex pattern WHEN the call is made THEN the entire request fails with an error before any assertion is evaluated.
- **[4_USER_FEATURES-AC-FEAT-059]** GIVEN a request body exceeding 1 MiB WHEN it is POSTed to `/mcp/v1/call` THEN the server responds with HTTP 413.
- **[4_USER_FEATURES-AC-FEAT-060]** GIVEN 64 concurrent MCP connections WHEN all issue simultaneous observation tool calls THEN all receive responses; the server does not deadlock or reject connections.
- **[4_USER_FEATURES-AC-FEAT-061]** GIVEN `stream_logs(follow:true)` on a stage that is `Pending` WHEN the stage is subsequently cancelled without running THEN the final chunk is `{"done":true,"truncated":false,"total_lines":0}`.
- **[4_USER_FEATURES-AC-FEAT-062]** GIVEN MCP and gRPC both serve a `cancel_run` call targeting the same run WHEN the cancel is processed THEN both interfaces observe consistent state (shared `Arc<RwLock<ServerState>>`); no sleep or polling is required to observe the change.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-055]** GIVEN `get_run` on any run WHEN the response is returned THEN every field defined in §6
- **Type:** UX
- **Description:** GIVEN `get_run` on any run WHEN the response is returned THEN every field defined in §6.8 is present; no optional field is absent (absent vs null is a protocol violation).
- **[4_USER_FEATURES-AC-FEAT-056]** GIVEN `signal_completion` is called on a stage already in a terminal state WHEN the call is made THEN the response is `"error": "failed_precondition: ..."` and no state change occurs.
- **[4_USER_FEATURES-AC-FEAT-057]** GIVEN `inject_stage_input` is called on a `Running` stage WHEN the call is made THEN the response is `"error": "failed_precondition: ..."`.
- **[4_USER_FEATURES-AC-FEAT-058]** GIVEN `assert_stage_output` is called with an invalid regex pattern WHEN the call is made THEN the entire request fails with an error before any assertion is evaluated.
- **[4_USER_FEATURES-AC-FEAT-059]** GIVEN a request body exceeding 1 MiB WHEN it is POSTed to `/mcp/v1/call` THEN the server responds with HTTP 413.
- **[4_USER_FEATURES-AC-FEAT-060]** GIVEN 64 concurrent MCP connections WHEN all issue simultaneous observation tool calls THEN all receive responses; the server does not deadlock or reject connections.
- **[4_USER_FEATURES-AC-FEAT-061]** GIVEN `stream_logs(follow:true)` on a stage that is `Pending` WHEN the stage is subsequently cancelled without running THEN the final chunk is `{"done":true,"truncated":false,"total_lines":0}`.
- **[4_USER_FEATURES-AC-FEAT-062]** GIVEN MCP and gRPC both serve a `cancel_run` call targeting the same run WHEN the cancel is processed THEN both interfaces observe consistent state (shared `Arc<RwLock<ServerState>>`); no sleep or polling is required to observe the change.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-056]** GIVEN `signal_completion` is called on a stage already in a terminal state WHEN the call is made THEN the response is...
- **Type:** UX
- **Description:** GIVEN `signal_completion` is called on a stage already in a terminal state WHEN the call is made THEN the response is `"error": "failed_precondition: ..."` and no state change occurs.
- **[4_USER_FEATURES-AC-FEAT-057]** GIVEN `inject_stage_input` is called on a `Running` stage WHEN the call is made THEN the response is `"error": "failed_precondition: ..."`.
- **[4_USER_FEATURES-AC-FEAT-058]** GIVEN `assert_stage_output` is called with an invalid regex pattern WHEN the call is made THEN the entire request fails with an error before any assertion is evaluated.
- **[4_USER_FEATURES-AC-FEAT-059]** GIVEN a request body exceeding 1 MiB WHEN it is POSTed to `/mcp/v1/call` THEN the server responds with HTTP 413.
- **[4_USER_FEATURES-AC-FEAT-060]** GIVEN 64 concurrent MCP connections WHEN all issue simultaneous observation tool calls THEN all receive responses; the server does not deadlock or reject connections.
- **[4_USER_FEATURES-AC-FEAT-061]** GIVEN `stream_logs(follow:true)` on a stage that is `Pending` WHEN the stage is subsequently cancelled without running THEN the final chunk is `{"done":true,"truncated":false,"total_lines":0}`.
- **[4_USER_FEATURES-AC-FEAT-062]** GIVEN MCP and gRPC both serve a `cancel_run` call targeting the same run WHEN the cancel is processed THEN both interfaces observe consistent state (shared `Arc<RwLock<ServerState>>`); no sleep or polling is required to observe the change.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-057]** GIVEN `inject_stage_input` is called on a `Running` stage WHEN the call is made THEN the response is `"error": "faile...
- **Type:** UX
- **Description:** GIVEN `inject_stage_input` is called on a `Running` stage WHEN the call is made THEN the response is `"error": "failed_precondition: ..."`.
- **[4_USER_FEATURES-AC-FEAT-058]** GIVEN `assert_stage_output` is called with an invalid regex pattern WHEN the call is made THEN the entire request fails with an error before any assertion is evaluated.
- **[4_USER_FEATURES-AC-FEAT-059]** GIVEN a request body exceeding 1 MiB WHEN it is POSTed to `/mcp/v1/call` THEN the server responds with HTTP 413.
- **[4_USER_FEATURES-AC-FEAT-060]** GIVEN 64 concurrent MCP connections WHEN all issue simultaneous observation tool calls THEN all receive responses; the server does not deadlock or reject connections.
- **[4_USER_FEATURES-AC-FEAT-061]** GIVEN `stream_logs(follow:true)` on a stage that is `Pending` WHEN the stage is subsequently cancelled without running THEN the final chunk is `{"done":true,"truncated":false,"total_lines":0}`.
- **[4_USER_FEATURES-AC-FEAT-062]** GIVEN MCP and gRPC both serve a `cancel_run` call targeting the same run WHEN the cancel is processed THEN both interfaces observe consistent state (shared `Arc<RwLock<ServerState>>`); no sleep or polling is required to observe the change.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-058]** GIVEN `assert_stage_output` is called with an invalid regex pattern WHEN the call is made THEN the entire request fai...
- **Type:** UX
- **Description:** GIVEN `assert_stage_output` is called with an invalid regex pattern WHEN the call is made THEN the entire request fails with an error before any assertion is evaluated.
- **[4_USER_FEATURES-AC-FEAT-059]** GIVEN a request body exceeding 1 MiB WHEN it is POSTed to `/mcp/v1/call` THEN the server responds with HTTP 413.
- **[4_USER_FEATURES-AC-FEAT-060]** GIVEN 64 concurrent MCP connections WHEN all issue simultaneous observation tool calls THEN all receive responses; the server does not deadlock or reject connections.
- **[4_USER_FEATURES-AC-FEAT-061]** GIVEN `stream_logs(follow:true)` on a stage that is `Pending` WHEN the stage is subsequently cancelled without running THEN the final chunk is `{"done":true,"truncated":false,"total_lines":0}`.
- **[4_USER_FEATURES-AC-FEAT-062]** GIVEN MCP and gRPC both serve a `cancel_run` call targeting the same run WHEN the cancel is processed THEN both interfaces observe consistent state (shared `Arc<RwLock<ServerState>>`); no sleep or polling is required to observe the change.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-059]** GIVEN a request body exceeding 1 MiB WHEN it is POSTed to `/mcp/v1/call` THEN the server responds with HTTP 413
- **Type:** UX
- **Description:** GIVEN a request body exceeding 1 MiB WHEN it is POSTed to `/mcp/v1/call` THEN the server responds with HTTP 413.
- **[4_USER_FEATURES-AC-FEAT-060]** GIVEN 64 concurrent MCP connections WHEN all issue simultaneous observation tool calls THEN all receive responses; the server does not deadlock or reject connections.
- **[4_USER_FEATURES-AC-FEAT-061]** GIVEN `stream_logs(follow:true)` on a stage that is `Pending` WHEN the stage is subsequently cancelled without running THEN the final chunk is `{"done":true,"truncated":false,"total_lines":0}`.
- **[4_USER_FEATURES-AC-FEAT-062]** GIVEN MCP and gRPC both serve a `cancel_run` call targeting the same run WHEN the cancel is processed THEN both interfaces observe consistent state (shared `Arc<RwLock<ServerState>>`); no sleep or polling is required to observe the change.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-060]** GIVEN 64 concurrent MCP connections WHEN all issue simultaneous observation tool calls THEN all receive responses; th...
- **Type:** UX
- **Description:** GIVEN 64 concurrent MCP connections WHEN all issue simultaneous observation tool calls THEN all receive responses; the server does not deadlock or reject connections.
- **[4_USER_FEATURES-AC-FEAT-061]** GIVEN `stream_logs(follow:true)` on a stage that is `Pending` WHEN the stage is subsequently cancelled without running THEN the final chunk is `{"done":true,"truncated":false,"total_lines":0}`.
- **[4_USER_FEATURES-AC-FEAT-062]** GIVEN MCP and gRPC both serve a `cancel_run` call targeting the same run WHEN the cancel is processed THEN both interfaces observe consistent state (shared `Arc<RwLock<ServerState>>`); no sleep or polling is required to observe the change.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-061]** GIVEN `stream_logs(follow:true)` on a stage that is `Pending` WHEN the stage is subsequently cancelled without runnin...
- **Type:** UX
- **Description:** GIVEN `stream_logs(follow:true)` on a stage that is `Pending` WHEN the stage is subsequently cancelled without running THEN the final chunk is `{"done":true,"truncated":false,"total_lines":0}`.
- **[4_USER_FEATURES-AC-FEAT-062]** GIVEN MCP and gRPC both serve a `cancel_run` call targeting the same run WHEN the cancel is processed THEN both interfaces observe consistent state (shared `Arc<RwLock<ServerState>>`); no sleep or polling is required to observe the change.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-062]** GIVEN MCP and gRPC both serve a `cancel_run` call targeting the same run WHEN the cancel is processed THEN both inter...
- **Type:** UX
- **Description:** GIVEN MCP and gRPC both serve a `cancel_run` call targeting the same run WHEN the cancel is processed THEN both interfaces observe consistent state (shared `Arc<RwLock<ServerState>>`); no sleep or polling is required to observe the change.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-063]** GIVEN `
- **Type:** UX
- **Description:** GIVEN `./do presubmit` runs for more than 15 minutes WHEN the timeout fires THEN all child processes are killed and the script exits non-zero with `presubmit: TIMEOUT after 900s` on stderr.
- **[4_USER_FEATURES-AC-FEAT-064]** GIVEN `./do setup` is run twice in sequence WHEN the second run completes THEN it exits 0 and produces no errors (idempotency).
- **[4_USER_FEATURES-AC-FEAT-065]** GIVEN `./do <unknown>` is called WHEN the script runs THEN the valid subcommands are printed to stderr and the script exits non-zero.
- **[4_USER_FEATURES-AC-FEAT-066]** GIVEN `./do test` runs WHEN `target/traceability.json` is generated THEN `overall_passed` is `false` if any requirement ID in `docs/plan/specs/*.md` has zero covering tests; the process exits non-zero.
- **[4_USER_FEATURES-AC-FEAT-067]** GIVEN `./do test` runs WHEN a test annotation references a non-existent requirement ID THEN `stale_annotations` in `target/traceability.json` is non-empty and the process exits non-zero.
- **[4_USER_FEATURES-AC-FEAT-068]** GIVEN `./do coverage` runs WHEN `target/coverage/report.json` is generated THEN it contains exactly five gates with IDs `QG-001` through `QG-005`; `overall_passed` is `false` if any gate's `actual_pct` is below `threshold_pct`.
- **[4_USER_FEATURES-AC-FEAT-069]** GIVEN any `./do` command WHEN run on Linux, macOS, and Windows Git Bash THEN the exit code is identical across all three platforms for the same logical outcome.
- **[4_USER_FEATURES-AC-FEAT-070]** GIVEN `./do lint` runs WHEN a lint error occurs THEN the error message includes a file path and line number in `file:line: error: message` format that an AI agent can navigate to directly.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-064]** GIVEN `
- **Type:** UX
- **Description:** GIVEN `./do setup` is run twice in sequence WHEN the second run completes THEN it exits 0 and produces no errors (idempotency).
- **[4_USER_FEATURES-AC-FEAT-065]** GIVEN `./do <unknown>` is called WHEN the script runs THEN the valid subcommands are printed to stderr and the script exits non-zero.
- **[4_USER_FEATURES-AC-FEAT-066]** GIVEN `./do test` runs WHEN `target/traceability.json` is generated THEN `overall_passed` is `false` if any requirement ID in `docs/plan/specs/*.md` has zero covering tests; the process exits non-zero.
- **[4_USER_FEATURES-AC-FEAT-067]** GIVEN `./do test` runs WHEN a test annotation references a non-existent requirement ID THEN `stale_annotations` in `target/traceability.json` is non-empty and the process exits non-zero.
- **[4_USER_FEATURES-AC-FEAT-068]** GIVEN `./do coverage` runs WHEN `target/coverage/report.json` is generated THEN it contains exactly five gates with IDs `QG-001` through `QG-005`; `overall_passed` is `false` if any gate's `actual_pct` is below `threshold_pct`.
- **[4_USER_FEATURES-AC-FEAT-069]** GIVEN any `./do` command WHEN run on Linux, macOS, and Windows Git Bash THEN the exit code is identical across all three platforms for the same logical outcome.
- **[4_USER_FEATURES-AC-FEAT-070]** GIVEN `./do lint` runs WHEN a lint error occurs THEN the error message includes a file path and line number in `file:line: error: message` format that an AI agent can navigate to directly.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-065]** GIVEN `
- **Type:** UX
- **Description:** GIVEN `./do <unknown>` is called WHEN the script runs THEN the valid subcommands are printed to stderr and the script exits non-zero.
- **[4_USER_FEATURES-AC-FEAT-066]** GIVEN `./do test` runs WHEN `target/traceability.json` is generated THEN `overall_passed` is `false` if any requirement ID in `docs/plan/specs/*.md` has zero covering tests; the process exits non-zero.
- **[4_USER_FEATURES-AC-FEAT-067]** GIVEN `./do test` runs WHEN a test annotation references a non-existent requirement ID THEN `stale_annotations` in `target/traceability.json` is non-empty and the process exits non-zero.
- **[4_USER_FEATURES-AC-FEAT-068]** GIVEN `./do coverage` runs WHEN `target/coverage/report.json` is generated THEN it contains exactly five gates with IDs `QG-001` through `QG-005`; `overall_passed` is `false` if any gate's `actual_pct` is below `threshold_pct`.
- **[4_USER_FEATURES-AC-FEAT-069]** GIVEN any `./do` command WHEN run on Linux, macOS, and Windows Git Bash THEN the exit code is identical across all three platforms for the same logical outcome.
- **[4_USER_FEATURES-AC-FEAT-070]** GIVEN `./do lint` runs WHEN a lint error occurs THEN the error message includes a file path and line number in `file:line: error: message` format that an AI agent can navigate to directly.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-066]** GIVEN `
- **Type:** UX
- **Description:** GIVEN `./do test` runs WHEN `target/traceability.json` is generated THEN `overall_passed` is `false` if any requirement ID in `docs/plan/specs/*.md` has zero covering tests; the process exits non-zero.
- **[4_USER_FEATURES-AC-FEAT-067]** GIVEN `./do test` runs WHEN a test annotation references a non-existent requirement ID THEN `stale_annotations` in `target/traceability.json` is non-empty and the process exits non-zero.
- **[4_USER_FEATURES-AC-FEAT-068]** GIVEN `./do coverage` runs WHEN `target/coverage/report.json` is generated THEN it contains exactly five gates with IDs `QG-001` through `QG-005`; `overall_passed` is `false` if any gate's `actual_pct` is below `threshold_pct`.
- **[4_USER_FEATURES-AC-FEAT-069]** GIVEN any `./do` command WHEN run on Linux, macOS, and Windows Git Bash THEN the exit code is identical across all three platforms for the same logical outcome.
- **[4_USER_FEATURES-AC-FEAT-070]** GIVEN `./do lint` runs WHEN a lint error occurs THEN the error message includes a file path and line number in `file:line: error: message` format that an AI agent can navigate to directly.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-067]** GIVEN `
- **Type:** UX
- **Description:** GIVEN `./do test` runs WHEN a test annotation references a non-existent requirement ID THEN `stale_annotations` in `target/traceability.json` is non-empty and the process exits non-zero.
- **[4_USER_FEATURES-AC-FEAT-068]** GIVEN `./do coverage` runs WHEN `target/coverage/report.json` is generated THEN it contains exactly five gates with IDs `QG-001` through `QG-005`; `overall_passed` is `false` if any gate's `actual_pct` is below `threshold_pct`.
- **[4_USER_FEATURES-AC-FEAT-069]** GIVEN any `./do` command WHEN run on Linux, macOS, and Windows Git Bash THEN the exit code is identical across all three platforms for the same logical outcome.
- **[4_USER_FEATURES-AC-FEAT-070]** GIVEN `./do lint` runs WHEN a lint error occurs THEN the error message includes a file path and line number in `file:line: error: message` format that an AI agent can navigate to directly.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-068]** GIVEN `
- **Type:** UX
- **Description:** GIVEN `./do coverage` runs WHEN `target/coverage/report.json` is generated THEN it contains exactly five gates with IDs `QG-001` through `QG-005`; `overall_passed` is `false` if any gate's `actual_pct` is below `threshold_pct`.
- **[4_USER_FEATURES-AC-FEAT-069]** GIVEN any `./do` command WHEN run on Linux, macOS, and Windows Git Bash THEN the exit code is identical across all three platforms for the same logical outcome.
- **[4_USER_FEATURES-AC-FEAT-070]** GIVEN `./do lint` runs WHEN a lint error occurs THEN the error message includes a file path and line number in `file:line: error: message` format that an AI agent can navigate to directly.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-069]** GIVEN any `
- **Type:** UX
- **Description:** GIVEN any `./do` command WHEN run on Linux, macOS, and Windows Git Bash THEN the exit code is identical across all three platforms for the same logical outcome.
- **[4_USER_FEATURES-AC-FEAT-070]** GIVEN `./do lint` runs WHEN a lint error occurs THEN the error message includes a file path and line number in `file:line: error: message` format that an AI agent can navigate to directly.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-070]** GIVEN `
- **Type:** Functional
- **Description:** GIVEN `./do lint` runs WHEN a lint error occurs THEN the error message includes a file path and line number in `file:line: error: message` format that an AI agent can navigate to directly.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-071]** GIVEN an observing/controlling agent submitting a second run for the same workflow WHEN a non-terminal run already ex...
- **Type:** UX
- **Description:** GIVEN an observing/controlling agent submitting a second run for the same workflow WHEN a non-terminal run already exists THEN the agent cancels the existing run before submitting.
- **[4_USER_FEATURES-AC-FEAT-072]** GIVEN an orchestrated agent receiving `devs:cancel\n` on stdin WHEN the agent exits within 10s THEN no SIGTERM is sent.
- **[4_USER_FEATURES-AC-FEAT-073]** GIVEN an orchestrated agent receiving `devs:cancel\n` on stdin WHEN the agent does NOT exit within 10s + 5s THEN SIGTERM is sent; if still running after 5 more seconds, SIGKILL is sent.
- **[4_USER_FEATURES-AC-FEAT-074]** GIVEN an observing agent receiving `"failed_precondition: server is shutting down"` from any MCP tool WHEN the agent handles this response THEN `task_state.json` is written atomically to `.devs/agent-state/<session-id>/task_state.json` before the agent terminates.
- **[4_USER_FEATURES-AC-FEAT-075]** GIVEN the `devs-mcp-bridge` process WHEN the MCP server connection is lost THEN it writes `{"result":null,"error":"internal: server connection lost","fatal":true}` to stdout and exits with code 1 after one reconnection attempt after 1s.
- **[4_USER_FEATURES-AC-FEAT-076]** GIVEN an E2E test for any MCP tool WHEN the test exercises the tool THEN it calls the tool via `POST /mcp/v1/call` using `DEVS_MCP_ADDR`; calling the Rust function directly does not satisfy E2E coverage requirements.
- **[4_USER_FEATURES-AC-FEAT-077]** GIVEN nested E2E test runs (a workflow stage that itself runs `devs`) WHEN the inner server starts THEN it uses a distinct `DEVS_DISCOVERY_FILE` path; it does NOT use the outer development server instance.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-072]** GIVEN an orchestrated agent receiving `devs:cancel\n` on stdin WHEN the agent exits within 10s THEN no SIGTERM is sent
- **Type:** UX
- **Description:** GIVEN an orchestrated agent receiving `devs:cancel\n` on stdin WHEN the agent exits within 10s THEN no SIGTERM is sent.
- **[4_USER_FEATURES-AC-FEAT-073]** GIVEN an orchestrated agent receiving `devs:cancel\n` on stdin WHEN the agent does NOT exit within 10s + 5s THEN SIGTERM is sent; if still running after 5 more seconds, SIGKILL is sent.
- **[4_USER_FEATURES-AC-FEAT-074]** GIVEN an observing agent receiving `"failed_precondition: server is shutting down"` from any MCP tool WHEN the agent handles this response THEN `task_state.json` is written atomically to `.devs/agent-state/<session-id>/task_state.json` before the agent terminates.
- **[4_USER_FEATURES-AC-FEAT-075]** GIVEN the `devs-mcp-bridge` process WHEN the MCP server connection is lost THEN it writes `{"result":null,"error":"internal: server connection lost","fatal":true}` to stdout and exits with code 1 after one reconnection attempt after 1s.
- **[4_USER_FEATURES-AC-FEAT-076]** GIVEN an E2E test for any MCP tool WHEN the test exercises the tool THEN it calls the tool via `POST /mcp/v1/call` using `DEVS_MCP_ADDR`; calling the Rust function directly does not satisfy E2E coverage requirements.
- **[4_USER_FEATURES-AC-FEAT-077]** GIVEN nested E2E test runs (a workflow stage that itself runs `devs`) WHEN the inner server starts THEN it uses a distinct `DEVS_DISCOVERY_FILE` path; it does NOT use the outer development server instance.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-073]** GIVEN an orchestrated agent receiving `devs:cancel\n` on stdin WHEN the agent does NOT exit within 10s + 5s THEN SIGT...
- **Type:** UX
- **Description:** GIVEN an orchestrated agent receiving `devs:cancel\n` on stdin WHEN the agent does NOT exit within 10s + 5s THEN SIGTERM is sent; if still running after 5 more seconds, SIGKILL is sent.
- **[4_USER_FEATURES-AC-FEAT-074]** GIVEN an observing agent receiving `"failed_precondition: server is shutting down"` from any MCP tool WHEN the agent handles this response THEN `task_state.json` is written atomically to `.devs/agent-state/<session-id>/task_state.json` before the agent terminates.
- **[4_USER_FEATURES-AC-FEAT-075]** GIVEN the `devs-mcp-bridge` process WHEN the MCP server connection is lost THEN it writes `{"result":null,"error":"internal: server connection lost","fatal":true}` to stdout and exits with code 1 after one reconnection attempt after 1s.
- **[4_USER_FEATURES-AC-FEAT-076]** GIVEN an E2E test for any MCP tool WHEN the test exercises the tool THEN it calls the tool via `POST /mcp/v1/call` using `DEVS_MCP_ADDR`; calling the Rust function directly does not satisfy E2E coverage requirements.
- **[4_USER_FEATURES-AC-FEAT-077]** GIVEN nested E2E test runs (a workflow stage that itself runs `devs`) WHEN the inner server starts THEN it uses a distinct `DEVS_DISCOVERY_FILE` path; it does NOT use the outer development server instance.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-074]** GIVEN an observing agent receiving `"failed_precondition: server is shutting down"` from any MCP tool WHEN the agent ...
- **Type:** UX
- **Description:** GIVEN an observing agent receiving `"failed_precondition: server is shutting down"` from any MCP tool WHEN the agent handles this response THEN `task_state.json` is written atomically to `.devs/agent-state/<session-id>/task_state.json` before the agent terminates.
- **[4_USER_FEATURES-AC-FEAT-075]** GIVEN the `devs-mcp-bridge` process WHEN the MCP server connection is lost THEN it writes `{"result":null,"error":"internal: server connection lost","fatal":true}` to stdout and exits with code 1 after one reconnection attempt after 1s.
- **[4_USER_FEATURES-AC-FEAT-076]** GIVEN an E2E test for any MCP tool WHEN the test exercises the tool THEN it calls the tool via `POST /mcp/v1/call` using `DEVS_MCP_ADDR`; calling the Rust function directly does not satisfy E2E coverage requirements.
- **[4_USER_FEATURES-AC-FEAT-077]** GIVEN nested E2E test runs (a workflow stage that itself runs `devs`) WHEN the inner server starts THEN it uses a distinct `DEVS_DISCOVERY_FILE` path; it does NOT use the outer development server instance.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-075]** GIVEN the `devs-mcp-bridge` process WHEN the MCP server connection is lost THEN it writes `{"result":null,"error":"in...
- **Type:** UX
- **Description:** GIVEN the `devs-mcp-bridge` process WHEN the MCP server connection is lost THEN it writes `{"result":null,"error":"internal: server connection lost","fatal":true}` to stdout and exits with code 1 after one reconnection attempt after 1s.
- **[4_USER_FEATURES-AC-FEAT-076]** GIVEN an E2E test for any MCP tool WHEN the test exercises the tool THEN it calls the tool via `POST /mcp/v1/call` using `DEVS_MCP_ADDR`; calling the Rust function directly does not satisfy E2E coverage requirements.
- **[4_USER_FEATURES-AC-FEAT-077]** GIVEN nested E2E test runs (a workflow stage that itself runs `devs`) WHEN the inner server starts THEN it uses a distinct `DEVS_DISCOVERY_FILE` path; it does NOT use the outer development server instance.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-076]** GIVEN an E2E test for any MCP tool WHEN the test exercises the tool THEN it calls the tool via `POST /mcp/v1/call` us...
- **Type:** UX
- **Description:** GIVEN an E2E test for any MCP tool WHEN the test exercises the tool THEN it calls the tool via `POST /mcp/v1/call` using `DEVS_MCP_ADDR`; calling the Rust function directly does not satisfy E2E coverage requirements.
- **[4_USER_FEATURES-AC-FEAT-077]** GIVEN nested E2E test runs (a workflow stage that itself runs `devs`) WHEN the inner server starts THEN it uses a distinct `DEVS_DISCOVERY_FILE` path; it does NOT use the outer development server instance.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-AC-FEAT-077]** GIVEN nested E2E test runs (a workflow stage that itself runs `devs`) WHEN the inner server starts THEN it uses a dis...
- **Type:** Functional
- **Description:** GIVEN nested E2E test runs (a workflow stage that itself runs `devs`) WHEN the inner server starts THEN it uses a distinct `DEVS_DISCOVERY_FILE` path; it does NOT use the outer development server instance.
- **Source:** User Features (docs/plan/specs/4_user_features.md)
- **Dependencies:** None

