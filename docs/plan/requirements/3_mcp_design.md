### **[3_MCP_DESIGN-REQ-001]** The MCP interface MUST expose every entity in the devs data model
- **Type:** Functional
- **Description:** The MCP interface MUST expose every entity in the `devs` data model. No internal field may be withheld from `get_run`, `get_stage_output`, or `get_pool_state` responses. Unpopulated optional fields are returned as JSON `null`; they are never absent from the response envelope.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-002]** The MCP interface MUST remain operational during any workflow run
- **Type:** Functional
- **Description:** The MCP interface MUST remain operational during any workflow run. An agent observing a run via MCP MUST be able to receive live log streams and state transitions without polling delays greater than 500 ms.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-003]** The MCP interface MUST NOT require authentication at MVP
- **Type:** Functional
- **Description:** The MCP interface MUST NOT require authentication at MVP. It is designed for trusted-network and local-machine use by development agents only.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-004]** All MCP tool responses MUST include an "error": null
- **Type:** Functional
- **Description:** All MCP tool responses MUST include an `"error": null
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-005]** No MCP tool call may mutate state and return "error": null simultaneously if the mutation was not applied
- **Type:** Functional
- **Description:** No MCP tool call may mutate state and return `"error": null` simultaneously if the mutation was not applied. Partial mutations are not allowed; each tool call is atomic with respect to the state it modifies.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-006]** An orchestrating agent MUST connect to both MCP servers
- **Type:** Functional
- **Description:** An orchestrating agent MUST connect to both MCP servers. Filesystem access is required to write code; Glass-Box access is required to verify correctness.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-007]** The devs-mcp-bridge binary MUST be used when the agent's MCP client supports only stdio transport
- **Type:** Functional
- **Description:** The `devs-mcp-bridge` binary MUST be used when the agent's MCP client supports only stdio transport. The bridge forwards JSON-RPC lines from stdin to the HTTP MCP port and writes responses to stdout. On connection loss, it MUST write a structured error object to stdout and exit with code 1.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-008]** list_runs — Returns all workflow runs for a project (or all projects)
- **Type:** Functional
- **Description:** `list_runs` — Returns all workflow runs for a project (or all projects). Supports filtering by `status`, `workflow_name`, and `project_id`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-009]** get_run — Returns the full WorkflowRun record including all StageRun records with their current statuses, elapsed times, and outputs.
- **Type:** Functional
- **Description:** `get_run` — Returns the full `WorkflowRun` record including all `StageRun` records with their current statuses, elapsed times, and outputs.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-010]** get_stage_output — Returns the complete StageOutput for a specific stage attempt: stdout (UTF-8, ≤1 MiB), stderr (UTF-8, ≤1 MiB), structured (parsed JSON or null), exit_code, log_path, truncated.
- **Type:** Functional
- **Description:** `get_stage_output` — Returns the complete `StageOutput` for a specific stage attempt: `stdout` (UTF-8, ≤1 MiB), `stderr` (UTF-8, ≤1 MiB), `structured` (parsed JSON or null), `exit_code`, `log_path`, `truncated`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-011]** stream_logs — Returns log lines for a stage
- **Type:** Functional
- **Description:** `stream_logs` — Returns log lines for a stage. When `follow: true`, uses HTTP chunked transfer; each chunk is newline-delimited JSON with a `sequence` field; the final chunk is `{"done": true}`. An agent MUST consume this stream to obtain real-time build/test output.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-012]** get_pool_state — Returns current pool utilisation: number of active agents per pool, rate-limited agents, queued stages, and semaphore availability.
- **Type:** Functional
- **Description:** `get_pool_state` — Returns current pool utilisation: number of active agents per pool, rate-limited agents, queued stages, and semaphore availability.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-013]** get_workflow_definition — Returns the parsed workflow definition for a named workflow in a project
- **Type:** Functional
- **Description:** `get_workflow_definition` — Returns the parsed workflow definition for a named workflow in a project. Agents use this to verify that a definition was parsed correctly before submitting a run.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-014]** list_checkpoints — Returns the list of checkpoint commits in the git state branch for a project run
- **Type:** Functional
- **Description:** `list_checkpoints` — Returns the list of checkpoint commits in the git state branch for a project run. Agents use this to inspect historical state or recover artefacts from past attempts.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-015]** submit_run — Submits a workflow for execution
- **Type:** Functional
- **Description:** `submit_run` — Submits a workflow for execution. Validates all inputs before creating the run. Returns the new `run_id` and `slug`. An agent MUST use this (not the CLI) when programmatic submission is required within another workflow.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-016]** cancel_run / cancel_stage — Cancels a run or individual stage
- **Type:** Functional
- **Description:** `cancel_run` / `cancel_stage` — Cancels a run or individual stage. The agent MUST call this when a run is no longer useful (e.g., a code change supersedes an in-flight build). Wasted pool slots impede other work.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-017]** pause_run / pause_stage — Pauses execution
- **Type:** Functional
- **Description:** `pause_run` / `pause_stage` — Pauses execution. Used by debugging agents to freeze state before inspecting it.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-018]** resume_run / resume_stage — Resumes a paused run or stage.
- **Type:** Functional
- **Description:** `resume_run` / `resume_stage` — Resumes a paused run or stage.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-019]** write_workflow_definition — Writes or updates a workflow definition file at runtime
- **Type:** Functional
- **Description:** `write_workflow_definition` — Writes or updates a workflow definition file at runtime. An agent MAY use this to modify the workflow used to build itself (self-modification of the development pipeline).
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-020]** inject_stage_input — Injects a synthetic StageOutput for a stage that has not yet run (status must be Waiting or Eligible)
- **Type:** Functional
- **Description:** `inject_stage_input` — Injects a synthetic `StageOutput` for a stage that has not yet run (status must be `Waiting` or `Eligible`). Used to test downstream stages in isolation without running their dependencies. MUST be rejected if the stage is `Running`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-021]** assert_stage_output — Asserts that a completed stage's output matches a provided predicate
- **Type:** Functional
- **Description:** `assert_stage_output` — Asserts that a completed stage's output matches a provided predicate. Returns `{"passed": bool, "failures": [...]}`. An agent MUST call this after each stage of an automated test run to confirm correctness programmatically.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-022]** report_progress — Called by a running stage agent to report an intermediate progress update
- **Type:** Functional
- **Description:** `report_progress` — Called by a running stage agent to report an intermediate progress update. The update appears in `stream_logs` output and in the TUI Debug tab. Does not affect stage status.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-023]** signal_completion — Called by a stage agent to signal completion when completion = "mcp_tool_call"
- **Type:** Functional
- **Description:** `signal_completion` — Called by a stage agent to signal completion when `completion = "mcp_tool_call"`. Accepts optional `output` data. MUST be idempotent: first call drives the outcome; subsequent calls on a terminal stage return an error without changing state.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-024]** report_rate_limit — Called by a stage agent to proactively signal a rate-limit condition
- **Type:** Functional
- **Description:** `report_rate_limit` — Called by a stage agent to proactively signal a rate-limit condition. Triggers immediate pool fallback without incrementing the retry counter.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-025]** The filesystem MCP server MUST support at minimum: read_file, write_file, list_directory, create_directory, delete_file, move_file, search_files (glob pattern), search_content (regex in files).
- **Type:** Functional
- **Description:** The filesystem MCP server MUST support at minimum: `read_file`, `write_file`, `list_directory`, `create_directory`, `delete_file`, `move_file`, `search_files` (glob pattern), `search_content` (regex in files).
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-026]** The filesystem MCP server MUST be scoped to the devs workspace root
- **Type:** Functional
- **Description:** The filesystem MCP server MUST be scoped to the `devs` workspace root. Access outside the workspace root MUST be denied. The agent MUST NOT have write access to the `target/` directory via this MCP server; build artefacts are produced by the toolchain.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-027]** An agent MUST use the filesystem MCP server (not shell execution) to read source files, write edits, and verify file existence
- **Type:** Functional
- **Description:** An agent MUST use the filesystem MCP server (not shell execution) to read source files, write edits, and verify file existence. Shell execution is reserved for `./do` commands submitted as workflow stages.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-028]** Every test MUST be annotated // Covers: <REQ-ID> before the Red stage
- **Type:** Functional
- **Description:** Every test MUST be annotated `// Covers: <REQ-ID>` before the Red stage. An agent MUST NOT proceed to the Green stage if `./do test` produces a traceability failure for the target requirement.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-029]** An agent MUST verify the test is genuinely failing (exit code 1 from cargo test) before writing implementation
- **Type:** Functional
- **Description:** An agent MUST verify the test is genuinely failing (exit code 1 from `cargo test`) before writing implementation. A test that passes without implementation is a defective test; the agent MUST fix it before proceeding.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-030]** An agent MUST run the full presubmit check (submit_run: presubmit-check) after every Green stage
- **Type:** Functional
- **Description:** An agent MUST run the full presubmit check (`submit_run: presubmit-check`) after every Green stage. Partial passes are not acceptable.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-031]** An agent MUST submit presubmit-check and wait for all stages to reach a terminal status before declaring a task complete
- **Type:** Functional
- **Description:** An agent MUST submit `presubmit-check` and wait for all stages to reach a terminal status before declaring a task complete. The agent MUST call `assert_stage_output` on each stage to confirm correctness, not merely check that the run reached `Completed` status.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-032]** When submitting parallel implementation tasks, each MUST be submitted as a separate devs workflow run targeting an isolated git worktree or branch
- **Type:** Functional
- **Description:** When submitting parallel implementation tasks, each MUST be submitted as a separate `devs` workflow run targeting an isolated git worktree or branch. The `devs` server itself provides scheduling and pool management; the development agent MUST NOT attempt to manage parallelism manually.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-033]** The development agent MUST monitor all in-flight runs via list_runs and get_pool_state
- **Type:** Functional
- **Description:** The development agent MUST monitor all in-flight runs via `list_runs` and `get_pool_state`. If pool exhaustion is detected (`get_pool_state` shows all agents rate-limited or unavailable), the agent MUST wait for `report_rate_limit` events to clear rather than submitting additional runs.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-034]** On any stage failure, the agent MUST execute the following sequence before attempting a fix:
- **Type:** Functional
- **Description:** On any stage failure, the agent MUST execute the following sequence before attempting a fix:
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-035]** An agent MUST NOT make speculative code changes based on partial failure information
- **Type:** Functional
- **Description:** An agent MUST NOT make speculative code changes based on partial failure information. It MUST read the full `stderr` and `stdout` before writing any edit.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-036]** An agent MUST use stream_logs with follow: true rather than polling get_stage_output for active stages
- **Type:** Functional
- **Description:** An agent MUST use `stream_logs` with `follow: true` rather than polling `get_stage_output` for active stages. Polling wastes context window and pool bandwidth; streaming delivers updates as the toolchain produces them.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-037]** The agent MUST record the sequence number of the first error line during streaming
- **Type:** Functional
- **Description:** The agent MUST record the sequence number of the first error line during streaming. When calling `get_stage_output` after the run, the agent uses the sequence number to locate the error in the buffered output without re-scanning from the start.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-038]** When diagnosing a runtime logic failure (not a build failure), the development agent MUST use the following Glass-Box inspection sequence:
- **Type:** Functional
- **Description:** When diagnosing a runtime logic failure (not a build failure), the development agent MUST use the following Glass-Box inspection sequence:
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-039]** For failures involving the devs-scheduler or devs-pool crates, the agent MUST call get_pool_state to inspect semaphore availability, rate-limit cooldowns, and queued stage counts
- **Type:** Functional
- **Description:** For failures involving the `devs-scheduler` or `devs-pool` crates, the agent MUST call `get_pool_state` to inspect semaphore availability, rate-limit cooldowns, and queued stage counts. Pool state changes may explain unexpected stage ordering or delays.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-040]** Each E2E test sets DEVS_DISCOVERY_FILE to a unique temporary path to ensure process isolation
- **Type:** Functional
- **Description:** Each E2E test sets `DEVS_DISCOVERY_FILE` to a unique temporary path to ensure process isolation. A test that fails to write this file indicates a server startup failure; the agent MUST check `stderr` for config validation errors using `get_stage_output`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-041]** E2E test failures that involve unexpected state transitions MUST be diagnosed by reading the checkpoint files committed to the test's state branch
- **Type:** Functional
- **Description:** E2E test failures that involve unexpected state transitions MUST be diagnosed by reading the checkpoint files committed to the test's state branch. The agent reads `.devs/runs/<run-id>/checkpoint.json` via the filesystem MCP to inspect the exact `WorkflowRun` + `StageRun` records at the point of failure.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-042]** TUI E2E failures produce insta snapshot diffs
- **Type:** Functional
- **Description:** TUI E2E failures produce `insta` snapshot diffs. The agent MUST read the failed snapshot file at `crates/devs-tui/tests/snapshots/<test_name>.txt.new` and compare it to the accepted snapshot at `<test_name>.txt` using the filesystem MCP. The agent MUST NOT approve a snapshot update without first verifying that the TUI text output change is intentional.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-043]** When a coverage gate fails, the development agent MUST execute the following analysis before writing new tests:
- **Type:** Functional
- **Description:** When a coverage gate fails, the development agent MUST execute the following analysis before writing new tests:
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-044]** An agent MUST NOT add tests that cover code through private helper functions or internal paths not reachable from the declared external interfaces (CLI, TUI, MCP)
- **Type:** Functional
- **Description:** An agent MUST NOT add tests that cover code through private helper functions or internal paths not reachable from the declared external interfaces (CLI, TUI, MCP). E2E coverage gates require code to be exercised through the actual client interface boundaries.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-045]** All devs MCP tool calls that return "error": "<string>" produce structured errors with a machine-stable prefix
- **Type:** Functional
- **Description:** All `devs` MCP tool calls that return `"error": "<string>"` produce structured errors with a machine-stable prefix. An agent MUST parse this prefix to determine automated response, rather than pattern-matching against the full error string.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-046]** An agent MUST NOT load entire crate source files into context when a targeted search suffices
- **Type:** Functional
- **Description:** An agent MUST NOT load entire crate source files into context when a targeted search suffices. Before reading any file, the agent MUST use `search_files` (glob) or `search_content` (regex) via the filesystem MCP to locate the specific function, type, or test that requires modification.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-047]** An agent MUST truncate stage output consumed from get_stage_output to the minimum necessary for diagnosis
- **Type:** Functional
- **Description:** An agent MUST truncate stage output consumed from `get_stage_output` to the minimum necessary for diagnosis. For compilation errors, only the first 50 diagnostic lines are typically required. The full output is available in the checkpoint store for archival; the agent need not hold it in context.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-048]** When operating across multiple workflow runs (e.g., a parallel implementation session), an agent MUST maintain a local summary of each run's status rather than re-fetching get_run for all runs at each iteration
- **Type:** Functional
- **Description:** When operating across multiple workflow runs (e.g., a parallel implementation session), an agent MUST maintain a local summary of each run's status rather than re-fetching `get_run` for all runs at each iteration. `list_runs` with status filtering provides efficient bulk status.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-049]** If an agent's context is cleared mid-task (e.g., session restart), it MUST reconstruct task state from durable sources in the following priority order:
- **Type:** Functional
- **Description:** If an agent's context is cleared mid-task (e.g., session restart), it MUST reconstruct task state from durable sources in the following priority order:
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-050]** An agent MUST NOT re-attempt a task from scratch if in-flight runs exist
- **Type:** Functional
- **Description:** An agent MUST NOT re-attempt a task from scratch if in-flight runs exist. It MUST first call `cancel_run` for any run that it cannot safely resume, then inspect the last committed state before beginning new work.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-051]** When debugging a workflow run, the agent MUST read the workflow_snapshot.json committed at run start rather than the current live workflow definition
- **Type:** Functional
- **Description:** When debugging a workflow run, the agent MUST read the `workflow_snapshot.json` committed at run start rather than the current live workflow definition. The snapshot is immutable after `Pending → Running`; the live definition may have changed. Reading the wrong version produces incorrect assumptions about stage behaviour.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-052]** A development agent MUST write a task_state.json file to .devs/agent-state/<session-id>/ at the end of each session (and after any significant state change, such as completing a requirement)
- **Type:** Functional
- **Description:** A development agent MUST write a `task_state.json` file to `.devs/agent-state/<session-id>/` at the end of each session (and after any significant state change, such as completing a requirement). The write MUST be atomic (write-to-tmp then rename). The file MUST contain all fields defined in §5.4.1.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-053]** At the start of a new session, a development agent MUST read all files under .devs/agent-state/ and merge their completed_requirements lists with the target/traceability.json output to determine which requirements remain unimplemented
- **Type:** Functional
- **Description:** At the start of a new session, a development agent MUST read all files under `.devs/agent-state/` and merge their `completed_requirements` lists with the `target/traceability.json` output to determine which requirements remain unimplemented. The agent MUST NOT rely solely on traceability output, as a passing traceability check indicates test coverage but does not guarantee a correct implementation. The agent MUST NOT rely solely on session files, as a session file may be stale.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-054]** The .devs_context.json file written before each orchestrated agent spawn contains the outputs of all completed dependency stages
- **Type:** Functional
- **Description:** The `.devs_context.json` file written before each orchestrated agent spawn contains the outputs of all completed dependency stages. Orchestrated agents (spawned as workflow stages) MUST read this file at startup to obtain prior stage outputs rather than re-querying the MCP server, as the MCP server address (`DEVS_MCP_ADDR`) may not always be reachable from within sandboxed execution environments.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-055]** The target/traceability.json file produced by ./do test is the authoritative record of which requirements have passing test coverage
- **Type:** Functional
- **Description:** The `target/traceability.json` file produced by `./do test` is the authoritative record of which requirements have passing test coverage. A development agent MUST treat this file as the canonical task completion checklist. Any requirement with `"covered": false` in this file is incomplete regardless of subjective assessment.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-056]** A development agent MUST fail any task completion assertion if traceability_pct < 100.0 in target/traceability.json
- **Type:** Functional
- **Description:** A development agent MUST fail any task completion assertion if `traceability_pct < 100.0` in `target/traceability.json`. Partial requirement coverage is not acceptable for any commit that is intended to be merged.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-057]** When the devs-mcp-bridge binary detects a connection loss to the MCP HTTP port, it MUST attempt one reconnection after 1 second
- **Type:** Functional
- **Description:** When the `devs-mcp-bridge` binary detects a connection loss to the MCP HTTP port, it MUST attempt one reconnection after 1 second. If that reconnection fails, it MUST write `{"result": null, "error": "internal: server connection lost", "fatal": true}` to stdout and exit with code 1. It MUST NOT silently drop any in-flight request or response data.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-058]** An observing agent that receives "error": "failed_precondition: server is shutting down" from any MCP tool call MUST write its current task_state.json to .devs/agent-state/<session-id>/task_state.json using the filesystem MCP before allowing the session to terminate
- **Type:** Functional
- **Description:** An observing agent that receives `"error": "failed_precondition: server is shutting down"` from any MCP tool call MUST write its current `task_state.json` to `.devs/agent-state/<session-id>/task_state.json` using the filesystem MCP before allowing the session to terminate. Incomplete state is better than lost state.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-059]** The MCP server MUST respond to all observation tool calls (list_runs, get_run, get_stage_output, get_pool_state, get_workflow_definition, list_checkpoints) within 2 seconds under normal load
- **Type:** Functional
- **Description:** The MCP server MUST respond to all observation tool calls (`list_runs`, `get_run`, `get_stage_output`, `get_pool_state`, `get_workflow_definition`, `list_checkpoints`) within 2 seconds under normal load. Response latency above 2 seconds MUST be logged at `WARN` level. This threshold does not apply to streaming tools (`stream_logs`).
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-060]** A response with "error": null MUST have "result" as a non-null object
- **Type:** Functional
- **Description:** A response with `"error": null` MUST have `"result"` as a non-null object. A response with `"error": "<string>"` MUST have `"result": null`. These two fields are mutually exclusive in their non-null state.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-061]** HTTP status codes used by the MCP server:
- **Type:** Functional
- **Description:** HTTP status codes used by the MCP server:
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-062]** Sequence numbers MUST be monotonically increasing integers starting at 1 with no gaps
- **Type:** Functional
- **Description:** Sequence numbers MUST be monotonically increasing integers starting at 1 with no gaps. Each chunk is a self-contained JSON object terminated by a single `\n`. Clients MUST NOT treat HTTP chunk boundaries as line boundaries.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-063]** The follow: false mode returns the complete log in a single non-chunked JSON response body with "lines" as an array (see §2.5.3).
- **Type:** Functional
- **Description:** The `follow: false` mode returns the complete log in a single non-chunked JSON response body with `"lines"` as an array (see §2.5.3).
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-064]** Stdin lines MUST be complete JSON objects terminated by \n
- **Type:** Functional
- **Description:** Stdin lines MUST be complete JSON objects terminated by `\n`. The bridge buffers partial lines until `\n` arrives before forwarding. Maximum line length: 1 MiB. Lines exceeding this limit are rejected with `{"jsonrpc":"2.0","id":null,"result":null,"error":"invalid_argument: request line exceeds 1 MiB"}` written to stdout; the bridge continues processing subsequent lines.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-065]** For stream_logs with follow: true through the bridge: the bridge accumulates chunked HTTP response data and emits one JSON object per line to stdout as each chunk arrives
- **Type:** Functional
- **Description:** For `stream_logs` with `follow: true` through the bridge: the bridge accumulates chunked HTTP response data and emits one JSON object per line to stdout as each chunk arrives. The final `{"done": true}` chunk is forwarded and the bridge returns to listening for the next stdin request.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-066]** If stage_name references a stage not present in the run's workflow definition, stream_logs returns {"result": null, "error": "not_found: stage '<name>' not in run '<run_id>'"}.
- **Type:** Functional
- **Description:** If `stage_name` references a stage not present in the run's workflow definition, `stream_logs` returns `{"result": null, "error": "not_found: stage '<name>' not in run '<run_id>'"}`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-067]** cancel_run cancels all non-terminal stages atomically in a single checkpoint write
- **Type:** Functional
- **Description:** `cancel_run` cancels all non-terminal stages atomically in a single checkpoint write. The HTTP response is returned only after `checkpoint.json` reflects `"cancelled"` status for the run and all affected stages.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-068]** cancel_stage on a stage in Waiting or Eligible status transitions it directly to Cancelled without spawning an agent process
- **Type:** Functional
- **Description:** `cancel_stage` on a stage in `Waiting` or `Eligible` status transitions it directly to `Cancelled` without spawning an agent process. On a `Running` stage, `devs:cancel\n` is written to the agent's stdin; the stage transitions to `Cancelled` after the agent process exits.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-069]** pause_run pauses all Running stages by writing devs:pause\n to each active agent's stdin
- **Type:** Functional
- **Description:** `pause_run` pauses all `Running` stages by writing `devs:pause\n` to each active agent's stdin. Stages in `Eligible` or `Waiting` status are not dispatched until the run is resumed. `pause_run` on an already-`Paused` run returns `"error": "failed_precondition: run is already paused"`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-070]** resume_run transitions the run from Paused to Running and sends devs:resume\n to all paused agent processes
- **Type:** Functional
- **Description:** `resume_run` transitions the run from `Paused` to `Running` and sends `devs:resume\n` to all paused agent processes. Previously-`Eligible` stages are re-queued for dispatch.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-071]** write_workflow_definition validates the definition content before writing to disk
- **Type:** Functional
- **Description:** `write_workflow_definition` validates the definition content before writing to disk. If validation fails, the existing file is unchanged and the error field contains the full validation error list serialised as a JSON array string. The write is atomic: new content is written to a `.tmp` path and renamed on success.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-072]** write_workflow_definition for format: "rust" is not supported at runtime (Rust builder workflows require compilation)
- **Type:** Functional
- **Description:** `write_workflow_definition` for `format: "rust"` is not supported at runtime (Rust builder workflows require compilation). Returns `"error": "invalid_argument: rust format workflows cannot be written at runtime"`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-073]** percent_complete is an optional integer 0–100
- **Type:** Functional
- **Description:** `percent_complete` is an optional integer 0–100. When supplied, it is reflected in the TUI Debug tab as a progress bar. It does not affect stage status.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-074]** report_progress called on a stage that is not in Running status returns "error": "failed_precondition: stage '<name>' is not running".
- **Type:** Functional
- **Description:** `report_progress` called on a stage that is not in `Running` status returns `"error": "failed_precondition: stage '<name>' is not running"`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-075]** signal_completion is idempotent only on the first call: it drives the stage to Completed (success: true) or Failed (success: false)
- **Type:** Functional
- **Description:** `signal_completion` is idempotent only on the first call: it drives the stage to `Completed` (`success: true`) or `Failed` (`success: false`). Any subsequent call on a terminal stage returns `{"result": null, "error": "failed_precondition: stage already terminal"}` with no state change.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-076]** The output field is stored as the stage's structured output and becomes available via get_stage_output and template variables {{stage.<name>.output.<field>}} for downstream stages
- **Type:** Functional
- **Description:** The `output` field is stored as the stage's `structured` output and becomes available via `get_stage_output` and template variables `{{stage.<name>.output.<field>}}` for downstream stages. `output` MUST be a JSON object; non-object values return `"error": "invalid_argument: output must be a JSON object"`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-077]** report_rate_limit places the reporting agent into a 60-second cooldown and immediately requeues the stage for dispatch to the next available agent in the pool
- **Type:** Functional
- **Description:** `report_rate_limit` places the reporting agent into a 60-second cooldown and immediately requeues the stage for dispatch to the next available agent in the pool. `StageRun.attempt` is NOT incremented. `fallback_agent` names the next agent that will be tried, or `null` if no fallback is available.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-078]** report_rate_limit when no fallback agent is available: returns {"result": {"cooldown_secs": 60, "fallback_agent": null, "stage_requeued": false}, "error": null}
- **Type:** Functional
- **Description:** `report_rate_limit` when no fallback agent is available: returns `{"result": {"cooldown_secs": 60, "fallback_agent": null, "stage_requeued": false}, "error": null}`. The stage transitions to `Failed` with message `"pool exhausted: all agents rate-limited"`. A `pool.exhausted` webhook event fires.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-079]** Prompt files MUST include a <!-- devs-prompt: <name> --> comment as the first line
- **Type:** Functional
- **Description:** Prompt files MUST include a `<!-- devs-prompt: <name> -->` comment as the first line. Prompt files missing this header cause `./do lint` to emit a `WARN` line to stderr but do not cause lint to exit non-zero.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-080]** An agent MUST record the run_id returned by submit_run before calling stream_logs
- **Type:** Functional
- **Description:** An agent MUST record the `run_id` returned by `submit_run` before calling `stream_logs`. If `stream_logs` is interrupted (connection loss), the agent MUST use the stored `run_id` with `get_run` to recover run status without resubmitting. Each `submit_run` call creates a distinct run record; a second call with the same inputs creates a second run, not an idempotent replay.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-081]** An agent MUST NOT transition from a waiting phase to a verifying phase by polling get_run in a tight loop
- **Type:** Functional
- **Description:** An agent MUST NOT transition from a waiting phase to a verifying phase by polling `get_run` in a tight loop. The agent MUST use `stream_logs` with `follow:true` to block on stage completion. `get_run` polling is only permitted as a fallback after a connection loss, with a minimum 1-second interval between polls and a maximum of 120 consecutive polls before escalating to a timeout failure.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-082]** An agent MUST call assert_stage_output on every stage of presubmit-check individually
- **Type:** Functional
- **Description:** An agent MUST call `assert_stage_output` on every stage of `presubmit-check` individually. A run `status` of `"completed"` is necessary but not sufficient — structured-output stages report `"completed"` when the agent process exits cleanly, regardless of whether individual coverage gates passed. Gate results are only accessible via `assert_stage_output` or `get_stage_output`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-083]** An agent MUST NOT submit a task as parallel if its source_files intersects with any other task's source_files
- **Type:** Functional
- **Description:** An agent MUST NOT submit a task as parallel if its `source_files` intersects with any other task's `source_files`. The check runs over all pairs in the session. The serialisation creates an explicit `depends_on` relationship in the `devs` workflow DAG for the integration stage.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-084]** The number of simultaneously Running tasks in a single parallel session MUST NOT exceed the pool's max_concurrent value
- **Type:** Functional
- **Description:** The number of simultaneously `Running` tasks in a single parallel session MUST NOT exceed the pool's `max_concurrent` value. The agent reads `get_pool_state` before each batch of submissions to verify available slots. If fewer slots are available than tasks to submit, the agent submits only as many tasks as there are free slots and holds the remainder.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-085]** An agent MUST call get_pool_state before submitting the first task in any batch submission
- **Type:** Functional
- **Description:** An agent MUST call `get_pool_state` before submitting the first task in any batch submission. An agent MUST NOT submit a task if all agents in the target pool are rate-limited.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-086]** An agent making changes to any server-binary crate (devs-server, devs-mcp, devs-grpc, devs-scheduler, devs-pool, devs-executor, devs-adapters, devs-checkpoint) MUST complete the full build-only → unit-test-crate → e2e-all → presubmit-check sequence before instructing the operator to restart the server
- **Type:** Functional
- **Description:** An agent making changes to any server-binary crate (`devs-server`, `devs-mcp`, `devs-grpc`, `devs-scheduler`, `devs-pool`, `devs-executor`, `devs-adapters`, `devs-checkpoint`) MUST complete the full `build-only → unit-test-crate → e2e-all → presubmit-check` sequence before instructing the operator to restart the server. An agent MUST NOT instruct a server restart until `presubmit-check` has passed.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-087]** An agent MUST NOT restart the devs server while any workflow run is in {Running, Paused} status
- **Type:** Functional
- **Description:** An agent MUST NOT restart the `devs` server while any workflow run is in `{Running, Paused}` status. The agent calls `list_runs` and waits for all active runs to reach a terminal status, or calls `cancel_run` on non-essential runs, before initiating a restart.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-088]** The E2E test for a new MCP tool MUST call the tool via the HTTP JSON-RPC interface (POST /mcp/v1/call) using DEVS_MCP_ADDR injected into the stage environment
- **Type:** Functional
- **Description:** The E2E test for a new MCP tool MUST call the tool via the HTTP JSON-RPC interface (`POST /mcp/v1/call`) using `DEVS_MCP_ADDR` injected into the stage environment. The test MUST NOT call the tool's internal Rust function directly — that is a unit test, not an E2E test.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-089]** When the E2E test submits a nested devs workflow run (a run that creates another run), the nested run MUST use a distinct DEVS_DISCOVERY_FILE path (set by the outer stage's environment) to avoid port conflicts with the outer server
- **Type:** Functional
- **Description:** When the E2E test submits a nested `devs` workflow run (a run that creates another run), the nested run MUST use a distinct `DEVS_DISCOVERY_FILE` path (set by the outer stage's environment) to avoid port conflicts with the outer server. The test scaffolding MUST start a dedicated `devs` server instance for E2E purposes; it MUST NOT reuse the development server instance.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-090]** An agent adding a new workflow MUST create the corresponding prompt file(s) in .devs/prompts/ before submitting the workflow's first run
- **Type:** Functional
- **Description:** An agent adding a new workflow MUST create the corresponding prompt file(s) in `.devs/prompts/` before submitting the workflow's first run. A missing prompt file causes the stage to transition to `Failed` with error `"prompt_file not found"` without spawning an agent process.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-091]** An orchestrated agent in a multi-stage development workflow MUST read .devs_context.json at startup to retrieve the outputs of completed upstream stages
- **Type:** Functional
- **Description:** An orchestrated agent in a multi-stage development workflow MUST read `.devs_context.json` at startup to retrieve the outputs of completed upstream stages. The agent MUST NOT call back to the `devs` MCP server to retrieve upstream outputs — the context file is the authoritative source for this data within a stage execution.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-092]** path-type inputs are NOT validated for existence at submit_run time
- **Type:** Functional
- **Description:** `path`-type inputs are NOT validated for existence at `submit_run` time. A path that does not exist causes the stage to fail at execution time with error `"prompt_file not found"`, not at submission time. This preserves the invariant that submission validation is synchronous and fast.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-1.01]** Requirement 3_MCP_DESIGN-REQ-AC-1.01
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-1.02]** Requirement 3_MCP_DESIGN-REQ-AC-1.02
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-1.03]** Requirement 3_MCP_DESIGN-REQ-AC-1.03
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-1.04]** Requirement 3_MCP_DESIGN-REQ-AC-1.04
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-1.05]** Requirement 3_MCP_DESIGN-REQ-AC-1.05
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-1.06]** Requirement 3_MCP_DESIGN-REQ-AC-1.06
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-1.07]** Requirement 3_MCP_DESIGN-REQ-AC-1.07
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-1.08]** Requirement 3_MCP_DESIGN-REQ-AC-1.08
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-1.09]** Requirement 3_MCP_DESIGN-REQ-AC-1.09
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-1.10]** Requirement 3_MCP_DESIGN-REQ-AC-1.10
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-1.11]** Requirement 3_MCP_DESIGN-REQ-AC-1.11
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-1.12]** Requirement 3_MCP_DESIGN-REQ-AC-1.12
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-1.13]** Requirement 3_MCP_DESIGN-REQ-AC-1.13
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-1.14]** Requirement 3_MCP_DESIGN-REQ-AC-1.14
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-1.15]** Requirement 3_MCP_DESIGN-REQ-AC-1.15
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-1.16]** Requirement 3_MCP_DESIGN-REQ-AC-1.16
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-1.17]** Requirement 3_MCP_DESIGN-REQ-AC-1.17
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-1.18]** Requirement 3_MCP_DESIGN-REQ-AC-1.18
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-1.19]** [3_MCP_DESIGN-REQ-BR-012]: An agent that recovers from an Interrupted state and reads task_state.json with a non-null active_run_id calls get_run as its first MCP action and does not call submit_run until the existing run's status is determined to be terminal or cancelled.
- **Type:** Functional
- **Description:** `[3_MCP_DESIGN-REQ-BR-012]`: An agent that recovers from an `Interrupted` state and reads `task_state.json` with a non-null `active_run_id` calls `get_run` as its first MCP action and does not call `submit_run` until the existing run's status is determined to be terminal or cancelled.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.01]** Requirement 3_MCP_DESIGN-REQ-AC-2.01
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.02]** Requirement 3_MCP_DESIGN-REQ-AC-2.02
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.03]** Requirement 3_MCP_DESIGN-REQ-AC-2.03
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.04]** Requirement 3_MCP_DESIGN-REQ-AC-2.04
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.05]** Requirement 3_MCP_DESIGN-REQ-AC-2.05
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.06]** Requirement 3_MCP_DESIGN-REQ-AC-2.06
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.07]** Requirement 3_MCP_DESIGN-REQ-AC-2.07
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.08]** Requirement 3_MCP_DESIGN-REQ-AC-2.08
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.09]** Requirement 3_MCP_DESIGN-REQ-AC-2.09
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.10]** Requirement 3_MCP_DESIGN-REQ-AC-2.10
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.11]** Requirement 3_MCP_DESIGN-REQ-AC-2.11
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.12]** Requirement 3_MCP_DESIGN-REQ-AC-2.12
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.13]** Requirement 3_MCP_DESIGN-REQ-AC-2.13
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.14]** Requirement 3_MCP_DESIGN-REQ-AC-2.14
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.15]** Requirement 3_MCP_DESIGN-REQ-AC-2.15
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.16]** Requirement 3_MCP_DESIGN-REQ-AC-2.16
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.17]** Requirement 3_MCP_DESIGN-REQ-AC-2.17
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.18]** Requirement 3_MCP_DESIGN-REQ-AC-2.18
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.19]** Requirement 3_MCP_DESIGN-REQ-AC-2.19
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.20]** Requirement 3_MCP_DESIGN-REQ-AC-2.20
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.21]** Requirement 3_MCP_DESIGN-REQ-AC-2.21
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.22]** Requirement 3_MCP_DESIGN-REQ-AC-2.22
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.23]** Requirement 3_MCP_DESIGN-REQ-AC-2.23
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.24]** Requirement 3_MCP_DESIGN-REQ-AC-2.24
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-2.25]** list_runs with no params returns results sorted by created_at descending; the first entry in "runs" has a created_at timestamp ≥ the second entry's created_at.
- **Type:** Functional
- **Description:** `list_runs` with no params returns results sorted by `created_at` descending; the first entry in `"runs"` has a `created_at` timestamp ≥ the second entry's `created_at`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.01]** Requirement 3_MCP_DESIGN-REQ-AC-3.01
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.02]** Requirement 3_MCP_DESIGN-REQ-AC-3.02
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.03]** Requirement 3_MCP_DESIGN-REQ-AC-3.03
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.04]** Requirement 3_MCP_DESIGN-REQ-AC-3.04
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.05]** Requirement 3_MCP_DESIGN-REQ-AC-3.05
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.06]** Requirement 3_MCP_DESIGN-REQ-AC-3.06
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.07]** Requirement 3_MCP_DESIGN-REQ-AC-3.07
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.08]** Requirement 3_MCP_DESIGN-REQ-AC-3.08
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.09]** Requirement 3_MCP_DESIGN-REQ-AC-3.09
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.10]** Requirement 3_MCP_DESIGN-REQ-AC-3.10
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.11]** Requirement 3_MCP_DESIGN-REQ-AC-3.11
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.12]** Requirement 3_MCP_DESIGN-REQ-AC-3.12
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.13]** Requirement 3_MCP_DESIGN-REQ-AC-3.13
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.14]** Requirement 3_MCP_DESIGN-REQ-AC-3.14
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.15]** Requirement 3_MCP_DESIGN-REQ-AC-3.15
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.16]** Requirement 3_MCP_DESIGN-REQ-AC-3.16
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.17]** Requirement 3_MCP_DESIGN-REQ-AC-3.17
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.18]** Requirement 3_MCP_DESIGN-REQ-AC-3.18
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.19]** Requirement 3_MCP_DESIGN-REQ-AC-3.19
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-3.20]** [3_MCP_DESIGN-REQ-EC-TDD-006]: ./do test generates target/traceability.json with overall_passed: false and the unknown requirement ID listed in uncovered_requirements when a test file contains // Covers: NONEXISTENT-REQ-999.
- **Type:** Functional
- **Description:** `[3_MCP_DESIGN-REQ-EC-TDD-006]`: `./do test` generates `target/traceability.json` with `overall_passed: false` and the unknown requirement ID listed in `uncovered_requirements` when a test file contains `// Covers: NONEXISTENT-REQ-999`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-4.01]** Requirement 3_MCP_DESIGN-REQ-AC-4.01
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-4.02]** Requirement 3_MCP_DESIGN-REQ-AC-4.02
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-4.03]** Requirement 3_MCP_DESIGN-REQ-AC-4.03
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-4.04]** Requirement 3_MCP_DESIGN-REQ-AC-4.04
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-4.05]** Requirement 3_MCP_DESIGN-REQ-AC-4.05
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-4.06]** Requirement 3_MCP_DESIGN-REQ-AC-4.06
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-4.07]** Requirement 3_MCP_DESIGN-REQ-AC-4.07
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-4.08]** Requirement 3_MCP_DESIGN-REQ-AC-4.08
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-4.09]** Requirement 3_MCP_DESIGN-REQ-AC-4.09
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-4.10]** Requirement 3_MCP_DESIGN-REQ-AC-4.10
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-4.11]** Requirement 3_MCP_DESIGN-REQ-AC-4.11
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-4.12]** Requirement 3_MCP_DESIGN-REQ-AC-4.12
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-4.13]** Requirement 3_MCP_DESIGN-REQ-AC-4.13
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-4.14]** Requirement 3_MCP_DESIGN-REQ-AC-4.14
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-4.15]** Requirement 3_MCP_DESIGN-REQ-AC-4.15
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-4.16]** Requirement 3_MCP_DESIGN-REQ-AC-4.16
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-4.17]** §4.9.4 / [3_MCP_DESIGN-REQ-DBG-BR-012]: A list_checkpoints call for a project whose checkpoint branch has never been written returns {"checkpoints": [], "has_more": false, "next_before_sha": null} with "error": null, not an error response.
- **Type:** Functional
- **Description:** `§4.9.4` / `[3_MCP_DESIGN-REQ-DBG-BR-012]`: A `list_checkpoints` call for a project whose checkpoint branch has never been written returns `{"checkpoints": [], "has_more": false, "next_before_sha": null}` with `"error": null`, not an error response.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-5.01]** Requirement 3_MCP_DESIGN-REQ-AC-5.01
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-5.02]** Requirement 3_MCP_DESIGN-REQ-AC-5.02
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-5.03]** Requirement 3_MCP_DESIGN-REQ-AC-5.03
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-5.04]** Requirement 3_MCP_DESIGN-REQ-AC-5.04
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-5.05]** Requirement 3_MCP_DESIGN-REQ-AC-5.05
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-5.06]** Requirement 3_MCP_DESIGN-REQ-AC-5.06
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-5.07]** Requirement 3_MCP_DESIGN-REQ-AC-5.07
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-5.08]** Requirement 3_MCP_DESIGN-REQ-AC-5.08
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-5.09]** Requirement 3_MCP_DESIGN-REQ-AC-5.09
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-5.10]** [3_MCP_DESIGN-REQ-065]: Simulating power-loss after writing task_state.json.tmp but before the rename (by sending SIGKILL to the writing process) leaves the previous task_state.json intact and valid; a subsequent cat task_state.json
- **Type:** Functional
- **Description:** `[3_MCP_DESIGN-REQ-065]`: Simulating power-loss after writing `task_state.json.tmp` but before the rename (by sending SIGKILL to the writing process) leaves the previous `task_state.json` intact and valid; a subsequent `cat task_state.json
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-5.11]** Requirement 3_MCP_DESIGN-REQ-AC-5.11
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-5.12]** Requirement 3_MCP_DESIGN-REQ-AC-5.12
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-5.13]** Requirement 3_MCP_DESIGN-REQ-AC-5.13
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-5.14]** Requirement 3_MCP_DESIGN-REQ-AC-5.14
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-AC-5.15]** [3_MCP_DESIGN-REQ-072]: A development agent started when target/traceability.json has a generated_at more than 1 hour in the past submits a ./do test workflow run and waits for its completion before performing any implementation work; it does not read the stale file to determine task status.
- **Type:** Functional
- **Description:** `[3_MCP_DESIGN-REQ-072]`: A development agent started when `target/traceability.json` has a `generated_at` more than 1 hour in the past submits a `./do test` workflow run and waits for its completion before performing any implementation work; it does not read the stale file to determine task status.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-001]** The Glass-Box interface MUST NOT be gated behind any feature flag
- **Type:** Functional
- **Description:** The Glass-Box interface MUST NOT be gated behind any feature flag. It is a core part of the server binary and is always active when the MCP port is bound. There is no "debug mode" that enables additional MCP tools; all tools are available at all times in all environments.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-002]** The Glass-Box interface exposes the same in-memory ServerState that the gRPC interface uses
- **Type:** Functional
- **Description:** The Glass-Box interface exposes the same in-memory `ServerState` that the gRPC interface uses. There is no separate "MCP view" of the data — MCP and gRPC share `Arc<RwLock<ServerState>>`. A mutation applied via MCP (e.g., `cancel_run`) is immediately visible to the gRPC `GetRun` endpoint and vice versa, without any synchronization delay beyond one lock acquisition.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-003]** An agent MUST use DEVS_DISCOVERY_FILE when set
- **Type:** Functional
- **Description:** An agent MUST use `DEVS_DISCOVERY_FILE` when set. Ignoring this variable and reading the default path causes address conflicts when parallel server instances are running in test isolation environments.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-004]** An agent MUST NOT cache the resolved MCP address across process restarts
- **Type:** Functional
- **Description:** An agent MUST NOT cache the resolved MCP address across process restarts. On each new session start the agent MUST re-execute the discovery protocol. The server address may change if the server is restarted between sessions.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-005]** The devs-mcp-bridge binary executes the discovery protocol once at startup and maintains the resulting HTTP connection for its lifetime
- **Type:** Functional
- **Description:** The `devs-mcp-bridge` binary executes the discovery protocol once at startup and maintains the resulting HTTP connection for its lifetime. It does NOT re-discover on each forwarded request. On connection loss it exits with code 1 as specified in **[3_MCP_DESIGN-REQ-057]**.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-006]** Any field listed in the table above that is absent from a tool response (as opposed to present with a null value) constitutes a Glass-Box invariant violation
- **Type:** Functional
- **Description:** Any field listed in the table above that is absent from a tool response (as opposed to present with a `null` value) constitutes a Glass-Box invariant violation. The E2E MCP test suite MUST assert field presence for every entity type using response schema validation.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-007]** The definition_snapshot field in WorkflowRun returned by get_run MUST equal the snapshot committed to .devs/runs/<run-id>/workflow_snapshot.json at run start
- **Type:** Functional
- **Description:** The `definition_snapshot` field in `WorkflowRun` returned by `get_run` MUST equal the snapshot committed to `.devs/runs/<run-id>/workflow_snapshot.json` at run start. It MUST NOT reflect live edits to the workflow definition made after the run started (see **[2_TAS-BR-013]**).
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-008]** An agent MUST generate a unique session ID (UUIDv4) at startup
- **Type:** Functional
- **Description:** An agent MUST generate a unique session ID (UUIDv4) at startup. This ID is used as the directory name under `.devs/agent-state/<session-id>/` and MUST remain stable across `Interrupted → re-Locating` transitions within the same process lifetime.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-009]** An agent MUST NOT transition from Diagnosing to Editing until get_stage_output has returned with "error": null
- **Type:** Functional
- **Description:** An agent MUST NOT transition from `Diagnosing` to `Editing` until `get_stage_output` has returned with `"error": null`. Editing source code based on incomplete failure information is a protocol violation that risks introducing regressions.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-010]** Before entering Submitting state for a second or subsequent run, the agent MUST call cancel_run for any previously submitted run for the same workflow that is in a non-terminal state (Pending, Running, or Paused)
- **Type:** Functional
- **Description:** Before entering `Submitting` state for a second or subsequent run, the agent MUST call `cancel_run` for any previously submitted run for the same workflow that is in a non-terminal state (`Pending`, `Running`, or `Paused`). At most one active run per workflow per agent session is the expected invariant under normal operation.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-011]** An agent MUST write task_state.json before submitting any run and after each run reaches a terminal state
- **Type:** Functional
- **Description:** An agent MUST write `task_state.json` before submitting any run and after each run reaches a terminal state. This ensures that if the session is interrupted, a recovering agent can resume without re-running already-completed work.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-012]** A recovering agent that reads task_state.json with "completed": false and a non-null active_run_id MUST call get_run with that run_id as the first action
- **Type:** Functional
- **Description:** A recovering agent that reads `task_state.json` with `"completed": false` and a non-null `active_run_id` MUST call `get_run` with that `run_id` as the first action. If the run is still active, the agent resumes monitoring. If the run has completed with `Failed`, the agent enters `Diagnosing`. If the run is `Completed`, the agent proceeds to evaluate whether all acceptance criteria are met.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-013]** All filesystem MCP path parameters are resolved relative to the workspace root
- **Type:** Functional
- **Description:** All filesystem MCP path parameters are resolved relative to the workspace root. Absolute paths are permitted only if they canonicalize to a location within the workspace root boundary; otherwise they are rejected with `access_denied`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-014]** The filesystem MCP server MUST deny all write operations to target/ and its subdirectories
- **Type:** Functional
- **Description:** The filesystem MCP server MUST deny all write operations to `target/` and its subdirectories. A `write_file` call to any path matching `target/**` returns `{"error": "access_denied: target/ is read-only (build artefacts are toolchain-managed)"}` without performing any write.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-015]** Path traversal attempts that resolve outside the workspace root (e.g., ../../etc/passwd, absolute paths outside the workspace) MUST return {"error": "access_denied: path resolves outside workspace root"} without performing any I/O.
- **Type:** Functional
- **Description:** Path traversal attempts that resolve outside the workspace root (e.g., `../../etc/passwd`, absolute paths outside the workspace) MUST return `{"error": "access_denied: path resolves outside workspace root"}` without performing any I/O.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-016]** search_content regex patterns MUST be compiled using the Rust regex crate syntax
- **Type:** Functional
- **Description:** `search_content` regex patterns MUST be compiled using the Rust `regex` crate syntax. PCRE-specific extensions (`(?P<name>...)`, `\K`, lookahead/lookbehind) are not guaranteed to be supported. An invalid pattern returns an error before any file is read.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-017]** The .devs/runs/ and .devs/logs/ directories are managed exclusively by the devs server process
- **Type:** Functional
- **Description:** The `.devs/runs/` and `.devs/logs/` directories are managed exclusively by the `devs` server process. Direct writes by development agents to these directories via filesystem MCP are prohibited and return `access_denied`. The `.devs/workflows/`, `.devs/prompts/`, and `.devs/agent-state/` directories are agent-readable and agent-writable.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-018]** Development agents MUST use workspace-relative paths in all filesystem MCP calls
- **Type:** Functional
- **Description:** Development agents MUST use workspace-relative paths in all filesystem MCP calls. Using absolute paths that happen to fall within the workspace root is permitted but discouraged; canonical path resolution handles both forms consistently.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-019]** MCP control tools MUST NOT bypass the StateMachine::transition() gate defined in devs-core
- **Type:** Functional
- **Description:** MCP control tools MUST NOT bypass the `StateMachine::transition()` gate defined in `devs-core`. An MCP call that would result in an illegal state transition MUST return an error with prefix `"failed_precondition:"`. The state MUST NOT be mutated on error.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-020]** When cancel_run is called, all non-terminal StageRun records are transitioned to Cancelled in the same atomic checkpoint write as the WorkflowRun status transition
- **Type:** Functional
- **Description:** When `cancel_run` is called, all non-terminal `StageRun` records are transitioned to `Cancelled` in the same atomic checkpoint write as the `WorkflowRun` status transition. Partial cancellation (some stages cancelled, others not) is not permitted under any circumstance.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-021]** A pause_stage call on a stage in Eligible status (not yet dispatched) MUST prevent dispatch until resume_stage is called
- **Type:** Functional
- **Description:** A `pause_stage` call on a stage in `Eligible` status (not yet dispatched) MUST prevent dispatch until `resume_stage` is called. The stage MUST NOT transition to `Running` while paused even if a pool slot becomes available. The pool semaphore permit is NOT consumed by a paused-eligible stage.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-022]** list_runs results are sorted by created_at descending (newest first)
- **Type:** Functional
- **Description:** `list_runs` results are sorted by `created_at` descending (newest first). This ordering is not configurable at MVP.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-023]** list_runs with no filter parameters returns all runs across all projects up to the default limit of 100
- **Type:** Functional
- **Description:** `list_runs` with no filter parameters returns all runs across all projects up to the default `limit` of 100. Development agents MUST use `project_id` and `status` filters when monitoring a specific project to avoid processing historical data unnecessarily.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-024]** An offset value beyond total returns {"result": {"runs": [], "total": N, "limit": L, "offset": O}, "error": null}
- **Type:** Functional
- **Description:** An `offset` value beyond `total` returns `{"result": {"runs": [], "total": N, "limit": L, "offset": O}, "error": null}`. An empty `runs` array with `"total": N > 0` indicates the offset is past the end of the result set; this is not an error.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-025]** After successful run creation, submit_run immediately notifies the DAG scheduler via the SchedulerEvent::RunCreated channel
- **Type:** Functional
- **Description:** After successful run creation, `submit_run` immediately notifies the DAG scheduler via the `SchedulerEvent::RunCreated` channel. The scheduler transitions the run to `Running` and dispatches all initially-eligible stages (those with empty `depends_on`) within 100 ms, as required by `GOAL-001`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-026]** If run_name is not provided, the slug is auto-generated as <workflow-name>-<YYYYMMDD>-<4 random lowercase alphanum> (per 2_TAS-REQ-030)
- **Type:** Functional
- **Description:** If `run_name` is not provided, the slug is auto-generated as `<workflow-name>-<YYYYMMDD>-<4 random lowercase alphanum>` (per `2_TAS-REQ-030`). The `run_id` is always a newly generated UUID v4 regardless of `run_name`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-027]** inputs keys that are not declared in the workflow definition MUST be rejected with "invalid_argument: unknown input key '<key>'"
- **Type:** Functional
- **Description:** `inputs` keys that are not declared in the workflow definition MUST be rejected with `"invalid_argument: unknown input key '<key>'"`. Undeclared inputs are never silently ignored; agents must only provide declared keys.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-028]** inject_stage_input requires the target stage to be in Waiting or Eligible status
- **Type:** Functional
- **Description:** `inject_stage_input` requires the target stage to be in `Waiting` or `Eligible` status. All other statuses return a `failed_precondition` error without modifying state:
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-029]** After injection, a checkpoint commit is written immediately with the synthetic StageOutput
- **Type:** Functional
- **Description:** After injection, a checkpoint commit is written immediately with the synthetic `StageOutput`. The DAG scheduler is notified of the `StageRunEvent::Complete` event within one scheduler tick. Downstream stages whose `depends_on` includes this stage are transitioned to `Eligible` by the scheduler if all other dependencies are also `Completed`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-030]** Injected structured output is available via template variable {{stage.<name>.output.<field>}} for downstream stages, exactly as if the stage had written .devs_output.json
- **Type:** Functional
- **Description:** Injected `structured` output is available via template variable `{{stage.<name>.output.<field>}}` for downstream stages, exactly as if the stage had written `.devs_output.json`. The field resolution follows the standard `TemplateResolver` priority order from `devs-core`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-031]** inject_stage_input on a stage with completion = "exit_code" accepts and stores any structured field for traceability, but template references to {{stage.<name>.output.*}} against that stage still return TemplateError::NoStructuredOutput
- **Type:** Functional
- **Description:** `inject_stage_input` on a stage with `completion = "exit_code"` accepts and stores any `structured` field for traceability, but template references to `{{stage.<name>.output.*}}` against that stage still return `TemplateError::NoStructuredOutput`. The `structured` field is not logically populated by `exit_code`-mode stages regardless of how the output was produced.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-032]** assert_stage_output MUST only be called on stages in a terminal status (Completed, Failed, Cancelled, TimedOut)
- **Type:** Functional
- **Description:** `assert_stage_output` MUST only be called on stages in a terminal status (`Completed`, `Failed`, `Cancelled`, `TimedOut`). Calling it on a non-terminal stage returns `{"result": null, "error": "failed_precondition: stage '<name>' is not yet terminal (status: '<status>')"}` with no assertions evaluated.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-033]** All assertions in the assertions array are evaluated regardless of intermediate failures
- **Type:** Functional
- **Description:** All assertions in the `assertions` array are evaluated regardless of intermediate failures. The `failures` array contains one entry for every failing assertion. `passed` is `true` only when `failures` is empty (all assertions pass).
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-034]** An invalid regex pattern in a matches assertion returns {"result": null, "error": "invalid_argument: assertion[N] has invalid regex: <description>"} before any assertions are evaluated
- **Type:** Functional
- **Description:** An invalid regex pattern in a `matches` assertion returns `{"result": null, "error": "invalid_argument: assertion[N] has invalid regex: <description>"}` before any assertions are evaluated. This is a request validation error, not an assertion failure; `passed` is not returned.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-035]** JSONPath expressions are evaluated against the structured field of StageOutput
- **Type:** Functional
- **Description:** JSONPath expressions are evaluated against the `structured` field of `StageOutput`. If `structured` is `null` and a `json_path_*` assertion is requested, the assertion fails with `"reason": "structured output is null; stage used exit_code completion mode"`. This is an assertion failure (not a request error); `passed` returns `false`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-036]** The actual_snippet in failure records is truncated to 256 characters
- **Type:** Functional
- **Description:** The `actual_snippet` in failure records is truncated to 256 characters. The full field value is always available via `get_stage_output`. Development agents MUST call `get_stage_output` for complete failure analysis rather than relying solely on `actual_snippet`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-037]** No MCP handler may acquire a lower-precedence lock while holding a higher-precedence lock in any other order than the sequence above
- **Type:** Functional
- **Description:** No MCP handler may acquire a lower-precedence lock while holding a higher-precedence lock in any other order than the sequence above. The `devs-mcp` crate must be verified for lock ordering correctness before merging any change that adds new lock acquisitions.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-038]** Observation tools (list_runs, get_run, get_stage_output, get_pool_state, get_workflow_definition, list_checkpoints) acquire read locks only
- **Type:** Functional
- **Description:** Observation tools (`list_runs`, `get_run`, `get_stage_output`, `get_pool_state`, `get_workflow_definition`, `list_checkpoints`) acquire read locks only. Multiple concurrent observation calls from different clients execute fully in parallel without blocking each other.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-039]** Control tools (cancel_run, pause_run, resume_run, cancel_stage, pause_stage, resume_stage, write_workflow_definition, submit_run) acquire write locks
- **Type:** Functional
- **Description:** Control tools (`cancel_run`, `pause_run`, `resume_run`, `cancel_stage`, `pause_stage`, `resume_stage`, `write_workflow_definition`, `submit_run`) acquire write locks. A write lock blocks all concurrent read and write operations on the same lock until the mutation is complete and the checkpoint is persisted.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-040]** The maximum tolerated lock wait time for any MCP tool call is 5 seconds
- **Type:** Functional
- **Description:** The maximum tolerated lock wait time for any MCP tool call is 5 seconds. If the `Arc<RwLock<...>>` write lock is not acquired within 5 seconds, the MCP server returns `{"result": null, "error": "resource_exhausted: lock acquisition timed out after 5s"}` without performing any mutation. Clients may retry after a brief backoff; the server does not retry internally.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-041]** stream_logs with follow: true MUST NOT hold any SchedulerState lock for the duration of the stream
- **Type:** Functional
- **Description:** `stream_logs` with `follow: true` MUST NOT hold any `SchedulerState` lock for the duration of the stream. Log delivery is implemented via a `tokio::sync::broadcast::Receiver` that receives log events without blocking the scheduler write path. This ensures long-lived log streams do not prevent concurrent state mutations.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-042]** The MCP HTTP server MUST handle at least 64 concurrent connections
- **Type:** Functional
- **Description:** The MCP HTTP server MUST handle at least 64 concurrent connections. Each connection is served by a Tokio async task on the default multi-thread runtime. No external connection pool or semaphore is applied to the MCP server itself at MVP.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-043]** Fan-out sub-agents completing concurrently each call signal_completion independently
- **Type:** Functional
- **Description:** Fan-out sub-agents completing concurrently each call `signal_completion` independently. The per-run mutex serialises these calls. Each sub-agent's completion is processed atomically. The parent stage's merge handler is invoked only after all `N` sub-agent completions have been recorded (per **[2_TAS-BR-021]**).
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-BR-044]** report_progress does not acquire a SchedulerState write lock
- **Type:** Functional
- **Description:** `report_progress` does not acquire a `SchedulerState` write lock. It appends to a per-stage log buffer using a non-blocking append operation. Concurrent `report_progress` calls from the same stage are serialised by the log buffer's internal mutex, which is separate from the scheduler lock.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-DBG-BR-000]** The failure classification table above is exhaustive for MVP
- **Type:** Functional
- **Description:** The failure classification table above is exhaustive for MVP. Any stage failure that does not match a row in the table MUST be treated as a generic internal error: the agent reads `stderr` in full, calls `get_pool_state` to rule out infrastructure causes, and files a bug report as a comment in the relevant issue tracker file before attempting any code change.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-DBG-BR-001]** Requirement 3_MCP_DESIGN-REQ-DBG-BR-001
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-DBG-BR-002]** Requirement 3_MCP_DESIGN-REQ-DBG-BR-002
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-DBG-BR-003]** Requirement 3_MCP_DESIGN-REQ-DBG-BR-003
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-DBG-BR-004]** Requirement 3_MCP_DESIGN-REQ-DBG-BR-004
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-DBG-BR-005]** Requirement 3_MCP_DESIGN-REQ-DBG-BR-005
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-DBG-BR-006]** Lines longer than 32,768 bytes are split at byte boundary 32,768
- **Type:** Functional
- **Description:** Lines longer than 32,768 bytes are split at byte boundary 32,768. Each split segment is emitted as a separate chunk with its own `sequence` number. A `line` field will therefore never exceed 32,768 bytes in any single chunk.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-DBG-BR-007]** stdout and stderr response fields MUST always be present and MUST NOT be null, even for stages that produced no output
- **Type:** Functional
- **Description:** `stdout` and `stderr` response fields MUST always be present and MUST NOT be `null`, even for stages that produced no output. An empty string `""` indicates no output was captured.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-DBG-BR-008]** When fan_out_index is provided in the request, the top-level stdout, stderr, exit_code, structured, and truncated fields reflect only that sub-agent's output
- **Type:** Functional
- **Description:** When `fan_out_index` is provided in the request, the top-level `stdout`, `stderr`, `exit_code`, `structured`, and `truncated` fields reflect only that sub-agent's output. The `fan_out_results` array is omitted from the response in this case.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-DBG-BR-009]** get_pool_state reads pool state under a short-lived RwLock read guard
- **Type:** Functional
- **Description:** `get_pool_state` reads pool state under a short-lived `RwLock` read guard. The response reflects the instantaneous state at the moment the lock was acquired. A subsequent call may return different `active_count`, `queued_count`, or `rate_limited` values. The tool provides a point-in-time snapshot, not a consistent view across multiple fields.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-DBG-BR-010]** available_slots is always max_concurrent - active_count and is provided as a convenience to avoid client-side arithmetic
- **Type:** Functional
- **Description:** `available_slots` is always `max_concurrent - active_count` and is provided as a convenience to avoid client-side arithmetic. It is not independently tracked; it is computed at serialization time.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-DBG-BR-011]** list_checkpoints executes its git log query inside tokio::task::spawn_blocking to avoid blocking the async runtime
- **Type:** Functional
- **Description:** `list_checkpoints` executes its git log query inside `tokio::task::spawn_blocking` to avoid blocking the async runtime. It MUST NOT hold any write lock during the query. Concurrent checkpoint writes that occur while `list_checkpoints` is executing may or may not appear in the result, depending on timing.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-DBG-BR-012]** When limit is omitted, the server returns at most 100 entries
- **Type:** Functional
- **Description:** When `limit` is omitted, the server returns at most 100 entries. Clients that require complete checkpoint history MUST paginate using `before_sha` / `next_before_sha`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-DBG-BR-013]** ./do coverage MUST exit non-zero when overall_passed is false
- **Type:** Functional
- **Description:** `./do coverage` MUST exit non-zero when `overall_passed` is `false`. The report file is written in both pass and fail cases. An agent diagnosing a coverage failure reads `delta_pct` to determine how many percentage points of coverage must be added, then uses `uncovered_lines` and `total_lines` to estimate how many tests are needed.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-DBG-BR-014]** Gate measurements are collected independently: code exercised by unit tests contributes only to QG-001; code exercised by CLI E2E tests contributes to both QG-002 (aggregate) and QG-003
- **Type:** Functional
- **Description:** Gate measurements are collected independently: code exercised by unit tests contributes only to QG-001; code exercised by CLI E2E tests contributes to both QG-002 (aggregate) and QG-003. A function reachable only through private internal paths that is covered by a unit test does NOT count toward QG-003, QG-004, or QG-005.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-DBG-BR-015]** ./do test MUST exit non-zero when overall_passed is false, even if all Rust test binaries exit 0
- **Type:** Functional
- **Description:** `./do test` MUST exit non-zero when `overall_passed` is `false`, even if all Rust test binaries exit 0. Both conditions — all `cargo test` invocations succeed AND `traceability_pct == 100.0` AND `stale_annotations` is empty — are required for `./do test` to exit 0.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-DBG-BR-016]** Requirement IDs are discovered by scanning spec files for patterns matching \[([0-9A-Z_a-z]+-[A-Z]+-[0-9]+)\] (square-bracket-delimited identifiers)
- **Type:** Functional
- **Description:** Requirement IDs are discovered by scanning spec files for patterns matching `\[([0-9A-Z_a-z]+-[A-Z]+-[0-9]+)\]` (square-bracket-delimited identifiers). Test annotations are discovered by scanning `*.rs` files for `// Covers: <id>` comments. Both scans are performed at the workspace root with recursive descent.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-DBG-BR-017]** For a Running stage, get_stage_output returns a partial snapshot of stdout and stderr captured to date
- **Type:** Functional
- **Description:** For a `Running` stage, `get_stage_output` returns a partial snapshot of stdout and stderr captured to date. The `status` field is `"running"`. The `exit_code` field is `null`. A subsequent call will return updated output. This behaviour is intentional and MUST NOT return an error for running stages.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-DBG-BR-018]** When pool_name is omitted, get_pool_state returns ALL configured pools
- **Type:** Functional
- **Description:** When `pool_name` is omitted, `get_pool_state` returns ALL configured pools. There is no pagination; the maximum number of pools is bounded by the `devs.toml` configuration, which the server validates at startup.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-AGENT-001]** | signal_completion
- **Type:** Technical
- **Description:** Agent calls `signal_completion(success: true)` then process exits with non-zero
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-AGENT-002]** | report_progress
- **Type:** Technical
- **Description:** `percent_complete` is outside [0, 100]
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-AGENT-003]** | report_rate_limit
- **Type:** Technical
- **Description:** Called for a stage whose `completion = "exit_code"` (not `mcp_tool_call`)
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-AGENT-004]** | signal_completion
- **Type:** Technical
- **Description:** `output` field is a JSON array, not an object
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-CTL-001]** | cancel_run
- **Type:** Technical
- **Description:** Run is already `Completed`
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-CTL-002]** | pause_stage
- **Type:** Technical
- **Description:** Stage is in `Waiting` status (dependencies not yet met)
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-CTL-003]** | cancel_stage
- **Type:** Technical
- **Description:** Cancelled stage is the only non-terminal stage in the run
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-CTL-004]** | resume_run
- **Type:** Technical
- **Description:** Run is `Running` (not paused)
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-CTL-005]** | write_workflow_definition
- **Type:** Technical
- **Description:** `workflow_name` in params does not match `name` field in content
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-CTL-006]** | submit_run
- **Type:** Technical
- **Description:** `project_id` references a project in `removing` status
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-CTX-001]** | Agent's context is cleared mid-TDD loop (after writing the test file, before submitting tdd-red)
- **Type:** Technical
- **Description:** Agent restarts, reads `task_state.json`, finds the requirement in `in_progress` with `last_stage: null`. Agent uses `search_content` via filesystem MCP to confirm the test file was written, then submits `tdd-red` without rewriting the test.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-CTX-002]** | list_runs returns multiple Running runs from a previous crashed session
- **Type:** Technical
- **Description:** Agent calls `get_run` for each. Runs with all stages in `Eligible`/`Waiting` are safe to resume (`resume_run`). Runs with stages in `Running` status are cross-checked against `get_pool_state`; if no active pool slot exists for the stage, the run is cancelled and resubmitted.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-CTX-003]** | .devs/agent-state/<session-id>/task_state.json is corrupt (truncated JSON)
- **Type:** Technical
- **Description:** Agent logs `ERROR: corrupt session file at .devs/agent-state/<id>/task_state.json, skipping`. It continues loading other session files. It DOES NOT abort the session or treat all requirements as uncovered.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-CTX-004]** | target/traceability.json does not exist (tests have not been run yet in this session)
- **Type:** Technical
- **Description:** Agent submits a `./do test` workflow run, waits for completion, then reads the generated file before making any implementation decisions.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-CTX-005]** | Two concurrent development sessions write task_state.json for overlapping requirements
- **Type:** Technical
- **Description:** Each session writes to its own `<session-id>` subdirectory; no file conflict occurs. The §5.4.3 merge algorithm takes the union of `completed_requirements` and the most recently timestamped `in_progress` entry for any given requirement.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-CTX-006]** | workflow_snapshot.json is absent for a non-terminal run (storage corruption)
- **Type:** Technical
- **Description:** Agent calls `list_checkpoints`. If zero commits exist for the run, agent calls `cancel_run` and resubmits. The agent DOES NOT reconstruct a snapshot from the current live definition, which may differ from the original.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-CTX-007]** | .devs_context.json total size exceeds 10 MiB due to large prior stage outputs
- **Type:** Technical
- **Description:** The server truncates stdout/stderr proportionally across included stages to fit within 10 MiB, sets `truncated: true` at both stage and top levels. Agent checks `context.truncated` at startup and, if the truncated stage is a critical dependency, fetches full output via `get_stage_output` instead of using the truncated context.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-CTX-008]** | task_state.json references a last_run_id that no longer exists (deleted by retention sweep)
- **Type:** Technical
- **Description:** Agent calls `get_run` for the ID and receives a `NOT_FOUND` error (`error` field non-null). Agent treats the corresponding requirement as `in_progress` with `last_run_id: null` and begins a new run. Session startup is not aborted.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-CTX-009]** | A development agent writes task_state.json but the git push to checkpoint branch fails
- **Type:** Technical
- **Description:** The file is written to the local `.devs/agent-state/` directory. The session continues. On the next successful checkpoint write by the server, all files in `.devs/agent-state/` are staged via `git add -A` and included in the commit to the checkpoint branch. The agent does not retry the push itself.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-CTX-010]** | target/traceability.json has schema_version other than 1
- **Type:** Technical
- **Description:** Agent logs `ERROR: unrecognised traceability schema version <N> in target/traceability.json` and submits `./do test` to regenerate the file. The agent DOES NOT attempt to parse the file with the unknown schema.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-FS-001]** | read_file called on a directory path
- **Type:** Technical
- **Description:** Returns `{"error": "invalid_argument: path is a directory, not a file"}`. No data returned.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-FS-002]** | write_file with a path containing .. that resolves within workspace root
- **Type:** Technical
- **Description:** Write proceeds normally. Path traversal that stays within bounds is permitted; only out-of-bounds traversal is blocked.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-FS-003]** | write_file when disk is full
- **Type:** Technical
- **Description:** Returns `{"error": "internal: disk write failed: no space left on device"}`. No partial file is left on disk (atomic write-to-temp-then-rename).
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-FS-004]** | search_content pattern matches more than max_results results
- **Type:** Technical
- **Description:** Returns first `max_results` matches (default 100) plus `"truncated": true` in the response. Agent must refine the query to get remaining results.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-FS-005]** | list_directory on a path that does not exist
- **Type:** Technical
- **Description:** Returns `{"error": "not_found: directory not found: <path>"}`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-FS-006]** | write_file to a path under .devs/runs/
- **Type:** Technical
- **Description:** Returns `{"error": "access_denied: .devs/runs/ is managed by the devs server"}`. No file is written.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-MCP-001]** | get_run called while run is mid-transition (write lock held by scheduler)
- **Type:** Technical
- **Description:** MCP handler acquires read lock after write lock is released. Response reflects the just-committed state. No partial state is ever returned. Maximum added latency equals one checkpoint write (typically <50 ms).
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-MCP-002]** | stream_logs with follow: true called for a stage that has already completed
- **Type:** Technical
- **Description:** Server returns all buffered log lines (up to 10,000) sequentially with monotonic sequence numbers, then immediately emits `{"done": true}`. No blocking wait.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-MCP-003]** | get_stage_output called for a stage in Waiting status (never run)
- **Type:** Technical
- **Description:** Returns `{"result": {"stdout": null, "stderr": null, "structured": null, "exit_code": null, "log_path": null, "truncated": false}, "error": null}`. All output fields are `null`; the response is not an error.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-MCP-004]** | Two agents concurrently call signal_completion for the same stage
- **Type:** Technical
- **Description:** First call acquires the per-run mutex, drives state transition, persists checkpoint. Second call finds stage already terminal and returns `{"result": null, "error": "failed_precondition: stage already in terminal state"}`. Exactly one transition occurs.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-MCP-005]** | MCP server receives a JSON-RPC request body larger than 1 MiB
- **Type:** Technical
- **Description:** Server returns HTTP 413 with body `{"result": null, "error": "invalid_argument: request body exceeds 1 MiB limit"}` without processing the request.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-MCP-006]** | get_pool_state called when all agents in the pool are rate-limited
- **Type:** Technical
- **Description:** Returns full pool state including each agent's `rate_limited: true` and `cooldown_remaining_secs` fields. Not an error condition. Development agent uses this to determine wait duration.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-MCP-007]** | devs server is restarted while devs-mcp-bridge has an active connection
- **Type:** Technical
- **Description:** Bridge detects TCP reset or `ECONNREFUSED`, writes the structured error to stdout, exits 1. Development agent detects bridge exit, re-reads `DEVS_DISCOVERY_FILE` for new server address, spawns new bridge.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-MCP-008]** | list_runs called with project_id that does not exist in the registry
- **Type:** Technical
- **Description:** Returns `{"result": null, "error": "not_found: project <uuid> not registered"}`. Does not return an empty list.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-MCP-009]** | write_workflow_definition writes TOML with a validation error (e.g., cycle)
- **Type:** Technical
- **Description:** Returns `{"result": null, "error": "invalid_argument: [\"cycle detected: [\\\"a\\\",\\\"b\\\",\\\"a\\\"]\"]"}`. The file on disk is NOT written. The existing definition is unchanged.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-MCP-010]** | Agent calls submit_run during server shutdown (SIGTERM received, shutdown in progress)
- **Type:** Technical
- **Description:** Returns `{"result": null, "error": "failed_precondition: server is shutting down"}`. No run is created. The agent MUST treat this as the `Interrupted` transition and write `task_state.json`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-MCP-011]** | Agent calls stream_logs with a syntactically valid UUID that does not match any run
- **Type:** Technical
- **Description:** Returns `{"result": null, "error": "not_found: run <uuid> not found"}` immediately. No chunked connection is established. The HTTP response is not `200`; it is `404` per the HTTP status mapping in §2.4.2.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-MCP-012]** | Agent calls assert_stage_output on a stage whose status is Running (not yet terminal)
- **Type:** Technical
- **Description:** Returns `{"result": null, "error": "failed_precondition: stage <name> is not in a terminal state"}`. No assertion is evaluated. The agent must wait for terminal state before asserting.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-MCP-013]** | report_progress is called by an orchestrated agent for a stage that has been externally cancelled (e.g., via cancel_run)
- **Type:** Technical
- **Description:** Returns `{"result": null, "error": "failed_precondition: stage <name> is cancelled"}`. The agent also receives `devs:cancel\n` on stdin before or shortly after this response.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-MCP-014]** | Observing agent reads a discovery file where the server has been replaced by a new process on the same port (same address, new server_version with same major)
- **Type:** Technical
- **Description:** `ServerService.GetInfo` succeeds; same-major version is compatible; agent proceeds normally. There is no session identity mechanism; the MCP server does not track client session IDs.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-MCP-015]** | write_workflow_definition is called while a run using that workflow definition is actively executing
- **Type:** Technical
- **Description:** The definition file is updated atomically on disk. The active run continues using its immutable `definition_snapshot` stored at run start. The `get_workflow_definition` response reflects the new definition immediately. The active run's `get_run` response still returns the original snapshot in `definition_snapshot`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-MCP-016]** | Agent calls inject_stage_input on a stage whose status is Running
- **Type:** Technical
- **Description:** Returns `{"result": null, "error": "failed_precondition: cannot inject input into a Running stage"}`. State is unchanged.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-MCP-017]** | get_run is called with a run_id that is valid UUID format but belongs to a different project than the authenticated project context
- **Type:** Technical
- **Description:** Returns the run if the server can find it regardless of project (there is no per-project access control at MVP per [3_MCP_DESIGN-REQ-003]). Returns `not_found` only if the run does not exist at all.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-MCP-018]** | Agent is in Streaming state consuming follow: true log chunks when the stage transitions from Running to Paused
- **Type:** Technical
- **Description:** The server continues holding the chunked HTTP connection open. No `{"done": true}` is sent while the stage is paused. Log lines already buffered are flushed. The stream resumes delivering lines when the stage is resumed.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-OBS-001]** | list_runs
- **Type:** Technical
- **Description:** `status` filter omitted
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-OBS-002]** | get_run
- **Type:** Technical
- **Description:** `run_id` references a run deleted by the retention sweep
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-OBS-003]** | get_stage_output
- **Type:** Technical
- **Description:** Stage has been retried; `attempt` not specified
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-OBS-004]** | stream_logs
- **Type:** Technical
- **Description:** Client disconnects mid-stream (`follow: true`)
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-OBS-005]** | get_pool_state
- **Type:** Technical
- **Description:** Pool has never dispatched a stage
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-OBS-006]** | list_checkpoints
- **Type:** Technical
- **Description:** Run has no checkpoint commits yet (`Pending` status)
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-OBS-DBG-001]** | Agent calls stream_logs with follow: true before the stage has started running
- **Type:** Technical
- **Description:** Server accepts the connection. When the stage starts and produces output, chunks arrive without requiring a reconnect. If the stage never starts (cancelled before dispatch), the server sends `{"done": true, "truncated": false, "total_lines": 0}` when the stage reaches a terminal state.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-OBS-DBG-002]** | Log buffer for a stage exceeds 10,000 lines
- **Type:** Technical
- **Description:** In-memory buffer retains the most recent 10,000 lines. `stream_logs` with `follow: false` returns exactly 10,000 lines with `"truncated": true` in the terminal chunk. The full log remains readable from `.devs/logs/<run-id>/<stage>/attempt_N/stdout.log` via the filesystem MCP.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-OBS-DBG-003]** | get_stage_output called for a fan-out parent stage without fan_out_index
- **Type:** Technical
- **Description:** Returns the merged output produced by the merge handler (or the default merged JSON array). Individual sub-agent outputs are accessible by specifying a `fan_out_index` parameter (0-based) on a subsequent `get_stage_output` call.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-OBS-DBG-004]** | E2E test server starts but never writes the discovery file due to a config validation error
- **Type:** Technical
- **Description:** The test harness polls `DEVS_DISCOVERY_FILE` for up to 5 seconds. If the file never appears, the test fails immediately with the message `"server did not write discovery file within 5 s; check stderr for config errors"`. The test harness then reads the server process stderr directly (not via MCP, since the server is not running) for diagnostics.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-OBS-DBG-005]** | Coverage gate QG-003 (CLI E2E) fails while QG-001 (unit) passes
- **Type:** Technical
- **Description:** `target/coverage/report.json` shows `QG-003.passed = false` with `delta_pct < 0`. Agent reads the per-file coverage data, identifies CLI subcommand handler functions not exercised by E2E tests, and adds targeted E2E tests that invoke the `devs` CLI binary directly via `assert_cmd`. Unit-test-only coverage for these paths does NOT count toward QG-003.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-OBS-DBG-006]** | TUI snapshot test fails because terminal layout changed
- **Type:** Technical
- **Description:** `insta` produces a `<test_name>.txt.new` file alongside the accepted `<test_name>.txt` snapshot. The agent reads both files via the filesystem MCP and diffs them. If the change is a regression (incorrect layout), the agent fixes the TUI rendering code and deletes the `.txt.new` file. If the change is intentional, the agent replaces the `.txt` file with the `.txt.new` content, thereby accepting the new snapshot.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-OBS-DBG-007]** | get_pool_state shows queued_count > 0 for a pool with available_slots > 0
- **Type:** Technical
- **Description:** The queued stages have `required_capabilities` that no current non-rate-limited agent can satisfy (i.e., the capability filter eliminated all eligible agents before the semaphore was consulted). The agent calls `get_run` for the queued stage runs to inspect their `required_capabilities`, then reconciles against the `capabilities` arrays in `get_pool_state` to identify the mismatch.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-OBS-DBG-008]** | stream_logs called with from_sequence greater than the highest buffered sequence number for a completed stage
- **Type:** Technical
- **Description:** The server responds with only the terminal chunk `{"done": true, "truncated": false, "total_lines": N}`. No non-terminal chunks are emitted. This is not an error; the agent's recorded `from_sequence` simply exceeds what was buffered.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-OBS-DBG-009]** | Agent calls get_stage_output for a stage in Waiting or Eligible status
- **Type:** Technical
- **Description:** The MCP server returns `"error": "failed_precondition: stage has not yet started; no output available"`. The agent MUST NOT treat this as a fatal failure; it should either wait (streaming via `stream_logs` with `follow: true`) or poll `get_run` until the stage reaches `Running`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-OBS-DBG-010]** | list_checkpoints is called for a project whose checkpoint branch has never been written
- **Type:** Technical
- **Description:** The checkpoint branch does not yet exist in the bare git repository. The server returns `{"checkpoints": [], "has_more": false, "next_before_sha": null}` rather than an error. The branch is created lazily on the first checkpoint write.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-OBS-DBG-011]** | get_stage_output returns truncated: true and the agent needs the full stderr
- **Type:** Technical
- **Description:** The agent reads `.devs/logs/<run-id>/<stage-name>/attempt_<N>/stderr.log` directly from the checkpoint store using the filesystem MCP. This file always contains the complete unbounded stderr regardless of the 1 MiB field truncation applied to the `stderr` field in the MCP response.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-PAR-001]** | Task A and Task B both modify the same source file
- **Type:** Technical
- **Description:** Development agent detects this during planning via `search_content` on the filesystem MCP. It serialises the tasks (B `depends_on` A in the `devs` workflow) rather than running them in parallel.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-PAR-002]** | Integration stage fails to merge Task A and Task B branches (git conflict)
- **Type:** Technical
- **Description:** Integration stage exits non-zero; `stderr` contains git conflict markers. Development agent reads the conflict via `get_stage_output`, resolves it through targeted filesystem MCP edits, and retries the integration stage (`resume_stage` after fix, or re-`submit_run`).
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-PAR-003]** | Task C is submitted before Tasks A and B complete and later creates a dependency conflict
- **Type:** Technical
- **Description:** Task C runs independently and may succeed or fail. If a conflict is discovered during integration, the agent calls `cancel_run` on any superseded runs, resolves the conflict, and resubmits.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-PAR-004]** | One task in a parallel session exceeds its stage timeout and transitions to TimedOut
- **Type:** Technical
- **Description:** The `ParallelTask.status` is set to `Failed`. The agent does not cancel the other in-flight tasks. The agent calls `get_stage_output` on the timed-out stage to recover partial output, fixes the hanging operation, and resubmits only the failed task on its branch before re-attempting integration.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-PAR-005]** | Pool max_concurrent drops to 0 due to all agents entering rate-limit cooldown simultaneously
- **Type:** Technical
- **Description:** The `get_pool_state` call returns all agents with `cooldown_remaining_secs > 0`. All in-flight tasks continue to run (they already hold pool permits via the semaphore). No new tasks are dispatched. The agent waits for the longest `cooldown_remaining_secs` and then re-checks before submitting held tasks.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-PAR-006]** | The parallel session's integration_branch does not exist when the integration stage runs
- **Type:** Technical
- **Description:** The orchestrated integration agent finds no branch at the expected name `devs-integrate/<session_id>`. This indicates a race condition in branch creation. The development agent verifies branch names via filesystem MCP, re-creates the integration branch from the first task branch, and repeats the merge sequence.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-SELF-001]** | Agent modifies devs-mcp/src/tools.rs while the server is running
- **Type:** Technical
- **Description:** The running server is unaffected; it holds the old compiled binary. New code is only active after the server is restarted. The development agent completes all tests on the new code before instructing the operator to restart.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-SELF-002]** | write_workflow_definition updates presubmit-check while a presubmit-check run is in flight
- **Type:** Technical
- **Description:** The running run uses the immutable snapshot taken at run start. The updated definition applies to the next `submit_run` call only. No conflict or state corruption occurs.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-SELF-003]** | Build stage fails because a Cargo.toml dependency version constraint is incompatible with another crate in the workspace
- **Type:** Technical
- **Description:** Stage exits non-zero; `stderr` contains `error: failed to select a version`. Agent reads `Cargo.toml` via filesystem MCP, identifies the conflicting constraint, updates the version, and resubmits.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-SELF-004]** | E2E test starts a devs server but the port is already in use (another server left from a previous failed test)
- **Type:** Technical
- **Description:** The E2E test runner detects the `EADDRINUSE` error in the server's `stderr` via `get_stage_output`. The stage fails with a clear diagnostic. The agent identifies the stale server process via `get_pool_state` (if it is the current server) or via filesystem MCP process inspection, terminates it, and retries the E2E stage.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-SELF-005]** | presubmit-check passes, operator restarts the server, but the restarted server fails to bind the MCP port
- **Type:** Technical
- **Description:** The development agent reads the server's `stderr` from the restart attempt, identifies the port conflict or config error, fixes `devs.toml` via filesystem MCP, and instructs another restart. The glass-box MCP server MUST bind successfully before the agent declares the self-modification complete.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-SELF-006]** | A new MCP tool added to devs-mcp/src/tools.rs is not registered in the MCP router, so calling it returns "method not found"
- **Type:** Technical
- **Description:** The E2E test for the new tool fails with `error: "method not found"`. Agent reads the router registration code (e.g., `devs-mcp/src/router.rs`) via filesystem MCP, adds the missing registration, rebuilds, and re-runs E2E. Registration is a compile-time requirement — the E2E failure is the detection mechanism.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-TDD-001]** | tdd-red stage exits 0 (test unexpectedly passes before implementation)
- **Type:** Technical
- **Description:** Development agent detects via `assert_stage_output exit_code ne 0` assertion failure. Agent reads `stdout` to determine if test was skipped or is non-deterministic. Agent fixes the test before writing any implementation code.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-TDD-002]** | Pool is exhausted when tdd-green is submitted
- **Type:** Technical
- **Description:** `submit_run` succeeds and returns a `run_id`. The first stage transitions to `Eligible` but waits in the pool queue. Agent monitors via `get_pool_state`; does not re-submit or cancel the waiting run.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-TDD-003]** | Compilation error during tdd-green (implementation has a syntax error)
- **Type:** Technical
- **Description:** Stage exits non-zero; `stderr` contains Rust `error[E...]` diagnostic. Agent calls `get_stage_output`, reads `stderr`, locates the exact file and line via `search_content` on the filesystem MCP, applies a targeted edit, resubmits.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-TDD-004]** | presubmit-check times out (a stage exceeds 900 s workflow timeout)
- **Type:** Technical
- **Description:** Run transitions to `Failed`; timed-out stage shows `"timed_out"` status. Agent calls `get_stage_output` on the timed-out stage, reads the last output to identify the hanging subprocess, fixes it, and resubmits.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-TDD-005]** | Two requirements being implemented concurrently share the same pool slot
- **Type:** Technical
- **Description:** Both runs queue correctly via the pool semaphore. Whichever reaches `Eligible` first dispatches first. The second waits. Agent does not serialise submissions or cancel queued runs.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-TDD-006]** | Test annotation // Covers: <id> references a non-existent requirement ID
- **Type:** Technical
- **Description:** `./do test` exits non-zero with a traceability error listing the unknown ID. Agent reads the spec documents in `docs/plan/specs/` via filesystem MCP to find the correct ID, updates the annotation, and resubmits.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-TDD-007]** | stream_logs connection drops while waiting for tdd-green stage completion
- **Type:** Technical
- **Description:** Agent reads stored `green_run_id`, calls `get_run` to determine current status. If the stage has already reached a terminal status, the agent proceeds to `assert_stage_output`. If still `Running`, the agent resumes `stream_logs` with the same `run_id`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-TDD-008]** | presubmit-check coverage gate QG-002 (E2E aggregate) fails while unit coverage (QG-001) passes
- **Type:** Technical
- **Description:** Agent calls `get_stage_output` on the `coverage` stage and reads the `gates` array to identify which gate failed. Agent adds E2E test coverage for the uncovered code paths rather than modifying unit tests. The gap analysis protocol in §4.5 applies.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-TDD-009]** | An agent attempts the DiagnosingPresubmit → SubmittingPresubmit retry a second time for the same stage failure
- **Type:** Technical
- **Description:** The agent MUST NOT perform a blind second retry. After the first retry fails at the same stage, the agent reads `get_stage_output` for that stage and applies §4 diagnosis before making any additional submission. Repeated identical failures indicate a systematic issue, not a transient one.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-TEST-001]** | inject_stage_input
- **Type:** Technical
- **Description:** Stage is `Running`
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-TEST-002]** | inject_stage_input
- **Type:** Technical
- **Description:** `synthetic_output` is missing `exit_code` field
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-TEST-003]** | assert_stage_output
- **Type:** Technical
- **Description:** Stage has not yet completed
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-TEST-004]** | assert_stage_output
- **Type:** Technical
- **Description:** `op: "json_path_eq"` references a path not present in `structured`
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-EC-TEST-005]** | inject_stage_input
- **Type:** Technical
- **Description:** Stage is already `Completed`
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-001]** The following table enumerates every data model entity that the Glass-Box interface MUST fully expose
- **Type:** Functional
- **Description:** The following table enumerates every data model entity that the Glass-Box interface MUST fully expose. Absence of any listed field from a response (rather than presence as JSON `null`) constitutes an invariant violation detectable by the E2E test suite.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-002]** signal_completion timing constraint: devs MUST acknowledge signal_completion within 500 ms
- **Type:** Functional
- **Description:** **`signal_completion` timing constraint:** `devs` MUST acknowledge `signal_completion` within 500 ms. If no acknowledgement arrives within 500 ms, the agent SHOULD retry once, then exit; `devs` will apply exit-code fallback semantics.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-003]** The following table defines the complete set of filesystem operations required by the development agent
- **Type:** Functional
- **Description:** The following table defines the complete set of filesystem operations required by the development agent. All must be supported by the configured filesystem MCP server implementation. Tools not in this table are not required and MUST NOT be depended upon.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-004]** Clients MUST supply a unique "id" per in-flight request to correlate responses
- **Type:** Functional
- **Description:** Clients MUST supply a unique `"id"` per in-flight request to correlate responses. `"params"` MUST be a JSON object (not an array).
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-005]** Key-value pairs; all required: true workflow inputs MUST be present; extra keys not declared in the workflow are rejected
- **Type:** Functional
- **Description:** Key-value pairs; all `required: true` workflow inputs MUST be present; extra keys not declared in the workflow are rejected
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-006]** An AI agent executing the TDD loop MUST track the following state between MCP calls
- **Type:** Functional
- **Description:** An AI agent executing the TDD loop MUST track the following state between MCP calls. This state lives in the agent's working memory for the duration of a single requirement implementation session; `devs` does not persist it.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-007]** Requirement 3_MCP_DESIGN-REQ-NEW-007
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-008]** Requirement 3_MCP_DESIGN-REQ-NEW-008
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-009]** Requirement 3_MCP_DESIGN-REQ-NEW-009
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-010]** The development agent MUST follow this protocol when monitoring a parallel session to avoid submitting work that will be queued indefinitely or wasting pool capacity.
- **Type:** Functional
- **Description:** The development agent MUST follow this protocol when monitoring a parallel session to avoid submitting work that will be queued indefinitely or wasting pool capacity.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-011]** 3
- **Type:** Functional
- **Description:** 3. **On pool exhaustion**: `get_pool_state` returns all agents with `status == "rate_limited"` and `cooldown_remaining_secs > 0`. The agent MUST NOT submit additional tasks. The agent waits until at least one agent has `cooldown_remaining_secs == 0` before submitting the next held task. Maximum wait is `max(cooldown_remaining_secs)` plus 5 seconds buffer.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-012]** Branch cleanup: After the integration presubmit-check passes, all task branches and the integration branch are deleted
- **Type:** Functional
- **Description:** **Branch cleanup:** After the integration `presubmit-check` passes, all task branches and the integration branch are deleted. Branch deletion is performed by the development agent via the filesystem MCP `run_command` tool (if available) or by the orchestrated agent in a dedicated `cleanup` stage. Task branches MUST NOT be deleted before the integration stage completes successfully.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-013]** All development workflow stages use prompt_file pointing to Markdown files under .devs/prompts/
- **Type:** Functional
- **Description:** All development workflow stages use `prompt_file` pointing to Markdown files under `.devs/prompts/`. Each prompt file MUST begin with a structured comment header:
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-014]** [3_MCP_DESIGN-REQ-NEW-015] Each stage in the presubmit-check workflow uses completion = "structured_output"
- **Type:** Functional
- **Description:** **[3_MCP_DESIGN-REQ-NEW-015]** Each stage in the `presubmit-check` workflow uses `completion = "structured_output"`. The orchestrated agent MUST write `.devs_output.json` in the following format before exiting:
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-015]** Each stage in the presubmit-check workflow uses completion = "structured_output"
- **Type:** Functional
- **Description:** Each stage in the `presubmit-check` workflow uses `completion = "structured_output"`. The orchestrated agent MUST write `.devs_output.json` in the following format before exiting:
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-016]** For the test-and-traceability stage, output MUST include a traceability sub-object:
- **Type:** Functional
- **Description:** For the `test-and-traceability` stage, `output` MUST include a `traceability` sub-object:
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-017]** For the coverage stage, output MUST include all five gate entries:
- **Type:** Functional
- **Description:** For the `coverage` stage, `output` MUST include all five gate entries:
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-018]** All standard development workflows reference prompt files under .devs/prompts/
- **Type:** Functional
- **Description:** All standard development workflows reference prompt files under `.devs/prompts/`. The following files MUST be present in the `devs` project repository. Each file MUST conform to the header convention in §3.5.2.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-019]** Every prompt file MUST contain the following sections in order:
- **Type:** Functional
- **Description:** Every prompt file MUST contain the following sections in order:
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-020]** When a workflow stage fails, the development agent MUST follow a structured investigation protocol before writing any code changes.
- **Type:** Functional
- **Description:** When a workflow stage fails, the development agent MUST follow a structured investigation protocol before writing any code changes.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-021]** The following decision diagram formalises the mandatory investigation protocol as a navigable flow
- **Type:** Functional
- **Description:** The following decision diagram formalises the mandatory investigation protocol as a navigable flow. An agent MUST NOT skip any node:
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-022]** This file is generated by ./do coverage via cargo-llvm-cov
- **Type:** Functional
- **Description:** This file is generated by `./do coverage` via `cargo-llvm-cov`. It MUST be present at `target/coverage/report.json` after every `./do coverage` invocation, regardless of whether gates passed. Its schema is machine-readable for automated diagnosis by development agents.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-023]** The debugging and observability capabilities in §4 depend on the following components
- **Type:** Functional
- **Description:** The debugging and observability capabilities in §4 depend on the following components. An implementing agent MUST ensure all listed dependencies are satisfied before the §4 acceptance criteria can be verified.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-024]** The following hard limits govern what an agent may load into context from any single MCP call
- **Type:** Functional
- **Description:** The following hard limits govern what an agent may load into context from any single MCP call. Server-side limits are enforced by protocol contract (truncation with `truncated: true`). Agent operating limits are behavioural rules that an agent MUST follow even when the server would deliver more data.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-025]** Before reading any source file or large output, a development agent MUST follow this narrowing sequence
- **Type:** Functional
- **Description:** Before reading any source file or large output, a development agent MUST follow this narrowing sequence. The sequence is designed to minimise unnecessary context consumption while ensuring the agent locates the relevant code:
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-026]** When an agent's context is cleared mid-task — due to session restart, token budget exhaustion, or process termination — it MUST reconstruct task state exclusively from durable sources
- **Type:** Functional
- **Description:** When an agent's context is cleared mid-task — due to session restart, token budget exhaustion, or process termination — it MUST reconstruct task state exclusively from durable sources. The `devs` server and git-backed checkpoint store are the authoritative sources; the agent's own memory is not.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-027]** The recovery sequence uses the following MCP tools in order
- **Type:** Functional
- **Description:** The recovery sequence uses the following MCP tools in order. Each call MUST succeed before the next is attempted; if any call returns an error, the agent logs the error and moves to the next run in the list.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-028]** workflow_snapshot.json is a JSON serialization of WorkflowDefinition as defined in devs-core/src/types.rs, augmented with capture metadata
- **Type:** Functional
- **Description:** `workflow_snapshot.json` is a JSON serialization of `WorkflowDefinition` as defined in `devs-core/src/types.rs`, augmented with capture metadata. The schema is reproduced here for agent consumption. All fields MUST be present; optional fields use JSON `null`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-029]** [3_MCP_DESIGN-REQ-NEW-035] [3_MCP_DESIGN-REQ-NEW-036]
- **Type:** Functional
- **Description:** **[3_MCP_DESIGN-REQ-NEW-035]** **[3_MCP_DESIGN-REQ-NEW-036]**
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-030]** Development agents that operate across multiple sessions MUST persist inter-session state in a machine-readable format under .devs/agent-state/
- **Type:** Functional
- **Description:** Development agents that operate across multiple sessions MUST persist inter-session state in a machine-readable format under `.devs/agent-state/`. This directory is committed to the checkpoint branch alongside run state, making it durable across server restarts and accessible to all agents with access to the checkpoint branch.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-031]** The task_state.json file encodes the state of a development agent's progress on implementation tasks
- **Type:** Functional
- **Description:** The `task_state.json` file encodes the state of a development agent's progress on implementation tasks. Every field tagged Required MUST be present; optional fields use JSON `null` when unpopulated.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-032]** 
- **Type:** Functional
- **Description:** 
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-033]** When a new development agent session begins, it MUST merge all readable session files using the following algorithm
- **Type:** Functional
- **Description:** When a new development agent session begins, it MUST merge all readable session files using the following algorithm. The algorithm is deterministic and produces the same result regardless of session file ordering.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-034]** The context file is written to the agent's working directory at <working_dir>/.devs_context.json
- **Type:** Functional
- **Description:** The context file is written to the agent's working directory at `<working_dir>/.devs_context.json`. Its content is a JSON object with the following structure. All fields MUST be present; optional values use JSON `null`.
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-035]** [3_MCP_DESIGN-REQ-NEW-036]
- **Type:** Functional
- **Description:** **[3_MCP_DESIGN-REQ-NEW-036]**
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NEW-036]** 
- **Type:** Functional
- **Description:** 
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-NNN]** Requirement 3_MCP_DESIGN-REQ-NNN
- **Type:** Functional
- **Description:** Requirement description from source
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-OBS-001]** 
- **Type:** Functional
- **Description:** 
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-OBS-002]** 
- **Type:** Functional
- **Description:** 
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-OBS-003]** 
- **Type:** Functional
- **Description:** 
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-OBS-004]** 
- **Type:** Functional
- **Description:** 
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-OBS-005]** 
- **Type:** Functional
- **Description:** 
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-OBS-006]** 
- **Type:** Functional
- **Description:** 
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-OBS-007]** 
- **Type:** Functional
- **Description:** 
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-OBS-008]** 
- **Type:** Functional
- **Description:** 
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-ORK-001]** 
- **Type:** Functional
- **Description:** 
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-ORK-002]** 
- **Type:** Functional
- **Description:** 
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-ORK-003]** 
- **Type:** Functional
- **Description:** 
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-ORK-004]** 
- **Type:** Functional
- **Description:** 
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-ORK-005]** 
- **Type:** Functional
- **Description:** 
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-ORK-006]** 
- **Type:** Functional
- **Description:** 
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-ORK-007]** 
- **Type:** Functional
- **Description:** 
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-SRV-001]** | devs Glass-Box MCP
- **Type:** Functional
- **Description:** HTTP/JSON-RPC on `:7891` (or via `devs-mcp-bridge` stdio)
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP_DESIGN-REQ-SRV-002]** | Filesystem MCP server
- **Type:** Functional
- **Description:** stdio (standard `mcp-filesystem` or equivalent)
- **Source:** MCP and AI Development Design (docs/plan/specs/3_mcp_design.md)
- **Dependencies:** None

### **[2_TAS-BR-016]** Snapshot update prohibition
- **Type:** Technical
- **Description:** The definition_snapshot returned by get_run MUST NOT be updated after the run starts, even if the workflow definition file on disk is modified.
- **Source:** Technical Architecture Specification (docs/plan/specs/2_tas.md)
- **Dependencies:** None
