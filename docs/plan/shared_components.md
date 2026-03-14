# Shared Components Manifest

## devs-proto (Protobuf Definitions & Generated Types)
- **Owner:** Phase 0 / Sub-Epic: devs-proto Crate
- **Consumers:** Phase 1 / Sub-Epic: devs-checkpoint (checkpoint serialization), Phase 2 / Sub-Epic: devs-scheduler (workflow/stage state types), Phase 3 / Sub-Epic: devs-grpc (tonic service implementations), Phase 3 / Sub-Epic: devs-mcp (MCP tool request/response mapping), Phase 3 / Sub-Epic: devs-cli (response deserialization), Phase 3 / Sub-Epic: devs-tui (state rendering)
- **Description:** Central protobuf schema crate defining all wire types under the `devs.v1` package. Generated Rust types are committed to `src/gen/`. All gRPC service definitions, message types, and enums originate here.
- **Key Interfaces:**
  - `ServerService` with `GetInfo` RPC (Phase 0 baseline; extended with 5 more services in Phase 3)
  - `WorkflowRun`, `StageRun`, `PoolState` message types used by scheduler, gRPC, MCP, and clients
  - Wire types must NOT appear in `devs-core`, `devs-scheduler`, `devs-executor`, or `devs-pool` public APIs (2_TAS-REQ-001G) — conversion traits required at crate boundaries
- **Requirements:** [2_TAS-REQ-008], [2_TAS-REQ-008A], [2_TAS-REQ-008B], [2_TAS-REQ-008C], [2_TAS-REQ-008D], [2_TAS-REQ-009], [2_TAS-REQ-009A], [2_TAS-REQ-009B], [ROAD-009]

## devs-core (Domain Types & Invariants)
- **Owner:** Phase 0 / Sub-Epic: devs-core Crate
- **Consumers:** Phase 1 / Sub-Epic: devs-config, Phase 1 / Sub-Epic: devs-checkpoint, Phase 1 / Sub-Epic: devs-adapters, Phase 1 / Sub-Epic: devs-pool, Phase 1 / Sub-Epic: devs-executor, Phase 2 / Sub-Epic: devs-scheduler, Phase 2 / Sub-Epic: devs-webhook, Phase 3 / Sub-Epic: devs-grpc, Phase 3 / Sub-Epic: devs-mcp, Phase 3 / Sub-Epic: devs-server
- **Description:** Pure domain types crate with zero runtime dependencies (no tokio, git2, reqwest, tonic). Contains `BoundedString`, state machines (workflow run, stage run, phase transition), `TemplateResolver`, `PhaseTransitionCheckpoint` schema, and core error types. This is the foundation every other crate depends on.
- **Key Interfaces:**
  - `BoundedString<MIN, MAX>` — validated string type used across config, scheduler, and adapters
  - `WorkflowRunState` / `StageRunState` enums and their state machine transition methods
  - `TemplateResolver` — `resolve(template: &str, context: &TemplateContext) -> Result<String>` for `{{stage.<name>.<field>}}` interpolation
  - `PhaseTransitionCheckpoint` — JSON schema struct with programmatic validation
  - Error types: domain-specific error enums consumed by all downstream crates
- **Requirements:** [2_TAS-REQ-001E], [2_TAS-REQ-001G], [2_TAS-REQ-002O], [ROAD-010]

## devs-config (Configuration & Project Registry)
- **Owner:** Phase 1 / Sub-Epic: devs-config Crate
- **Consumers:** Phase 1 / Sub-Epic: devs-pool (pool definitions), Phase 1 / Sub-Epic: devs-executor (execution environment config), Phase 2 / Sub-Epic: devs-scheduler (workflow definitions, project registry), Phase 2 / Sub-Epic: devs-webhook (webhook targets), Phase 3 / Sub-Epic: devs-server (server config), Phase 3 / Sub-Epic: devs-cli (client config), Phase 4 / Sub-Epic: Standard Workflow TOML Files
- **Description:** Parses `devs.toml` server configuration and project registry. Handles the full override chain (TOML → env vars → CLI flags). Provides typed configuration structs for all server subsystems.
- **Key Interfaces:**
  - `ServerConfig` — top-level config struct with `listen_addr`, `mcp_port`, `default_pool`, `scheduling_policy`
  - `PoolConfig` — pool name, agents list, `max_concurrent`, capability tags, fallback flags
  - `ProjectEntry` — repo path, priority/weight, checkpoint branch, workflow search paths
  - `WorkflowDefinition` — parsed declarative workflow (stages, branches, fan-out, inputs)
  - `validate(&self) -> Result<(), Vec<ConfigError>>` — single-pass validation collecting all errors
- **Requirements:** [2_TAS-REQ-001H], [2_TAS-REQ-013], [2_TAS-REQ-013A], [ROAD-011]

## devs-checkpoint (Git-Backed State Persistence)
- **Owner:** Phase 1 / Sub-Epic: devs-checkpoint Crate
- **Consumers:** Phase 2 / Sub-Epic: devs-scheduler (checkpoint save/restore of workflow state), Phase 3 / Sub-Epic: devs-server (checkpoint restore on startup, save on shutdown)
- **Description:** Persists workflow execution state and definition snapshots to the project's git repo inside `.devs/`. Supports configurable checkpoint branch (working or dedicated). All git2 operations run on `spawn_blocking`.
- **Key Interfaces:**
  - `save_checkpoint(project: &ProjectRef, run: &WorkflowRun) -> Result<()>` — atomic checkpoint commit
  - `restore_checkpoints(project: &ProjectRef) -> Result<Vec<WorkflowRun>>` — recover in-flight runs
  - `snapshot_definition(project: &ProjectRef, def: &WorkflowDefinition) -> Result<SnapshotId>` — immutable definition snapshot
  - `enforce_retention(project: &ProjectRef, policy: &RetentionPolicy) -> Result<()>` — log cleanup
- **Requirements:** [2_TAS-REQ-014], [2_TAS-REQ-014A], [2_TAS-REQ-014B], [2_TAS-REQ-001K], [2_TAS-REQ-002C], [ROAD-012]

## devs-adapters (Agent CLI Adapter Layer)
- **Owner:** Phase 1 / Sub-Epic: devs-adapters Crate
- **Consumers:** Phase 1 / Sub-Epic: devs-pool (agent selection and spawning), Phase 1 / Sub-Epic: devs-executor (agent invocation in execution environments), Phase 2 / Sub-Epic: devs-scheduler (completion signal processing, rate-limit detection)
- **Description:** Five agent CLI adapters (Claude, Gemini, OpenCode, Qwen, Copilot) with a common trait. Handles prompt passing (flag-based or file-based), PTY mode, rate-limit detection (passive stderr/exit-code, active MCP), and bidirectional mid-run interaction.
- **Key Interfaces:**
  - `trait AgentAdapter: Send + Sync` — `spawn(config: &AgentInvocation) -> Result<AgentProcess>`, `detect_rate_limit(output: &ProcessOutput) -> Option<RateLimitInfo>`
  - `AgentProcess` — handle to running agent with `stdin_writer()`, `wait() -> Result<ProcessOutput>`, `cancel()`
  - `AgentInvocation` — prompt, system prompt, env vars, working dir, PTY mode flag
  - `PTY_AVAILABLE: bool` — static flag for platform-aware PTY degradation
- **Requirements:** [2_TAS-REQ-015], [2_TAS-REQ-015A]-[2_TAS-REQ-015F], [2_TAS-REQ-016]-[2_TAS-REQ-020], [ROAD-013]

## devs-pool (Agent Pool Routing & Concurrency)
- **Owner:** Phase 1 / Sub-Epic: devs-pool Crate
- **Consumers:** Phase 2 / Sub-Epic: devs-scheduler (acquire/release agents for stage dispatch), Phase 2 / Sub-Epic: devs-webhook (PoolExhausted events), Phase 3 / Sub-Epic: devs-grpc (PoolService RPCs), Phase 3 / Sub-Epic: devs-mcp (get_pool_state tool)
- **Description:** Named agent pools with priority fallback, capability-tag routing, and concurrency semaphore. Tracks rate-limit cooldowns with absolute timestamps. Fires PoolExhausted webhook once per episode.
- **Key Interfaces:**
  - `acquire_agent(pool: &str, required_caps: &[&str]) -> Result<AgentLease>` — blocks until agent available or pool exhausted
  - `release_agent(lease: AgentLease)` — returns agent to pool
  - `report_rate_limit(agent_id: &AgentId, cooldown_until: DateTime<Utc>)` — marks agent unavailable
  - `get_pool_state(pool: &str) -> PoolState` — current utilization snapshot
  - `PoolExhausted` event emitted via channel (consumed by webhook dispatcher)
- **Requirements:** [2_TAS-REQ-002N], [ROAD-014]

## devs-executor (Execution Environment Management)
- **Owner:** Phase 1 / Sub-Epic: devs-executor Crate
- **Consumers:** Phase 2 / Sub-Epic: devs-scheduler (stage execution dispatch), Phase 3 / Sub-Epic: devs-mcp (working directory diff inspection)
- **Description:** Manages the three execution targets (tempdir, Docker, remote SSH). Clones repos, writes context files, injects env vars, and collects artifacts after stage completion.
- **Key Interfaces:**
  - `prepare_environment(target: &ExecutionTarget, project: &ProjectRef) -> Result<WorkingEnvironment>` — clone repo, set up env
  - `run_agent(env: &WorkingEnvironment, adapter: &dyn AgentAdapter, invocation: &AgentInvocation) -> Result<ProcessOutput>` — execute agent in environment
  - `collect_artifacts(env: &WorkingEnvironment, mode: ArtifactMode) -> Result<()>` — agent-driven or auto-collect
  - `cleanup(env: WorkingEnvironment) -> Result<()>` — tear down environment
- **Requirements:** [2_TAS-REQ-020A], [2_TAS-REQ-020B], [ROAD-015]

## devs-scheduler (DAG Workflow Engine)
- **Owner:** Phase 2 / Sub-Epic: devs-scheduler Crate
- **Consumers:** Phase 3 / Sub-Epic: devs-grpc (WorkflowService, StageService RPCs), Phase 3 / Sub-Epic: devs-mcp (submit_run, cancel_run, get_run, list_runs, stage tools), Phase 3 / Sub-Epic: devs-server (engine initialization and lifecycle)
- **Description:** The DAG-based workflow scheduling engine. Manages dependency resolution, stage dispatch, fan-out/merge, retry/backoff, timeout enforcement, completion signal processing, multi-project scheduling, and workflow run state machines.
- **Key Interfaces:**
  - `submit_run(project: &ProjectRef, workflow: &str, inputs: HashMap<String, Value>, name: Option<String>) -> Result<RunId>` — 7-step atomic validation
  - `cancel_run(run_id: &RunId) -> Result<()>`
  - `get_run(run_id: &RunId) -> Result<WorkflowRun>`
  - `list_runs(project: Option<&ProjectRef>) -> Vec<WorkflowRunSummary>`
  - `get_stage_output(run_id: &RunId, stage: &str) -> Result<StageOutput>`
  - `signal_completion(run_id: &RunId, stage: &str, result: CompletionResult) -> Result<()>` — MCP completion signal
- **Requirements:** [2_TAS-REQ-021]-[2_TAS-REQ-093], [1_PRD-REQ-001]-[1_PRD-REQ-081], [ROAD-016]

## devs-webhook (Outbound Notifications)
- **Owner:** Phase 2 / Sub-Epic: devs-webhook Crate
- **Consumers:** Phase 3 / Sub-Epic: devs-server (webhook dispatcher startup/shutdown)
- **Description:** Delivers outbound webhook notifications for run lifecycle, stage lifecycle, pool exhaustion, and all-state-changes events. Uses a dedicated bounded `mpsc` channel and at-least-once delivery with fixed-backoff retry.
- **Key Interfaces:**
  - `WebhookDispatcher::new(config: Vec<WebhookTarget>) -> Self` — creates dispatcher with configured targets
  - `send(event: WebhookEvent) -> Result<()>` — non-blocking enqueue to bounded channel
  - `WebhookEvent` enum: `RunStarted`, `RunCompleted`, `RunFailed`, `StageStarted`, `StageCompleted`, `StageFailed`, `PoolExhausted`, `StateChanged`
- **Requirements:** [2_TAS-BR-WH-003], [2_TAS-REQ-600]-[2_TAS-REQ-605], [ROAD-017]

## ./do Entrypoint Script & CI Pipeline
- **Owner:** Phase 0 / Sub-Epic: ./do Entrypoint Script + GitLab CI Pipeline
- **Consumers:** Phase 1 (all sub-epics rely on presubmit), Phase 2 (all sub-epics), Phase 3 (all sub-epics), Phase 4 / Sub-Epic: Bootstrap Validation, Phase 5 / Sub-Epic: MVP Release Gate
- **Description:** POSIX sh-compatible script implementing setup, build, test, lint, format, coverage, presubmit, and ci commands. Enforces 900-second hard timeout, writes incremental timing data, and gates all commits. The CI pipeline runs three parallel jobs (Linux, macOS, Windows).
- **Key Interfaces:**
  - `./do presubmit` — runs format, lint, test, coverage, ci; exits 0 only if all pass within 900s
  - `./do test` — runs all tests, generates `target/traceability.json` with `phase_gates` array
  - `./do lint` — cargo fmt, clippy, cargo doc, dependency audit, PTC validation, BOOTSTRAP-STUB checks, forbidden import enforcement
  - `./do coverage` — runs coverage tools, enforces QG-001 through QG-005 gates
  - `DEVS_DISCOVERY_FILE` env var — unique temp path per test for E2E isolation
- **Requirements:** [2_TAS-REQ-010]-[2_TAS-REQ-012C], [ROAD-008], [ROAD-CONS-003]

## Redacted<T> Security Wrapper
- **Owner:** Phase 1 / Sub-Epic: Security Foundations
- **Consumers:** Phase 1 / Sub-Epic: devs-config (credential parsing), Phase 1 / Sub-Epic: devs-adapters (API key injection), Phase 1 / Sub-Epic: devs-executor (env var handling), Phase 3 / Sub-Epic: devs-server (config display), Phase 3 / Sub-Epic: devs-mcp (get_config tool)
- **Description:** A wrapper type that prevents accidental logging or display of sensitive values (API keys, credentials). Implements `Debug` and `Display` to emit `[REDACTED]` while providing controlled access to the inner value.
- **Key Interfaces:**
  - `Redacted<T>::new(value: T) -> Self` — wrap a sensitive value
  - `Redacted<T>::expose(&self) -> &T` — explicit access to the inner value
  - `Debug` / `Display` impls output `[REDACTED]` — never the inner value
- **Requirements:** [SEC-001], [SEC-002], [5_SECURITY_DESIGN-REQ-001]-[5_SECURITY_DESIGN-REQ-010]

## Server Discovery Protocol
- **Owner:** Phase 0 / Sub-Epic: devs-core Crate (protocol definition), Phase 3 / Sub-Epic: devs-server (writer)
- **Consumers:** Phase 3 / Sub-Epic: devs-cli (reader), Phase 3 / Sub-Epic: devs-tui (reader), Phase 3 / Sub-Epic: devs-mcp-bridge (reader), Phase 4 / Sub-Epic: Bootstrap Validation (COND-001)
- **Description:** Protocol for clients to locate the server. The server writes its address atomically to a well-known file (`~/.config/devs/server.addr`). Clients check `--server` flag first, then fall back to the discovery file. `DEVS_DISCOVERY_FILE` overrides the path for test isolation.
- **Key Interfaces:**
  - Discovery file content: `host:grpc_port` on a single line (2_TAS-REQ-002F, 2_TAS-REQ-002G)
  - Path resolution: `DEVS_DISCOVERY_FILE` env var → `~/.config/devs/server.addr` (2_TAS-REQ-002E)
  - Atomic write via temp-file + rename (2_TAS-REQ-001J)
  - Stale file detection: client connects and verifies health (2_TAS-REQ-002H)
  - Deletion on server exit (2_TAS-REQ-002A)
- **Requirements:** [2_TAS-REQ-001J], [2_TAS-REQ-002A], [2_TAS-REQ-002E]-[2_TAS-REQ-002I]

## Shared State & Concurrency Patterns
- **Owner:** Phase 0 / Sub-Epic: devs-core Crate (pattern definition), Phase 1 / Sub-Epic: devs-pool (semaphore implementation)
- **Consumers:** Phase 2 / Sub-Epic: devs-scheduler (workflow/stage state locks), Phase 2 / Sub-Epic: devs-webhook (bounded channel), Phase 3 / Sub-Epic: devs-server (state initialization)
- **Description:** Consistent concurrency patterns enforced across the codebase: single multi-threaded Tokio runtime, `Arc<RwLock<T>>` for shared mutable state, `tokio::sync::Semaphore` for pool concurrency, consistent lock acquisition order, `spawn_blocking` for git2 operations, dedicated `mpsc` channel for webhook dispatch.
- **Key Interfaces:**
  - Lock acquisition order: project registry → workflow runs → pool state → checkpoint (2_TAS-REQ-002P)
  - `Arc<RwLock<HashMap<RunId, WorkflowRun>>>` — canonical run state container
  - `tokio::sync::Semaphore` — pool concurrency gate with configurable permits
  - `tokio::sync::mpsc::channel(BOUNDED)` — webhook dispatcher queue
- **Requirements:** [2_TAS-REQ-002K]-[2_TAS-REQ-002Q]

## Phase Transition Checkpoint (PTC) Model
- **Owner:** Phase 0 / Sub-Epic: Phase Transition Checkpoint Model
- **Consumers:** Phase 1 (gate), Phase 2 (gate), Phase 3 (gate), Phase 4 (gate + bootstrap ADR), Phase 5 (final gate + MVP release)
- **Description:** Machine-verifiable checkpoint model that gates phase transitions. PTC files are committed as ADRs with a JSON schema validated by `./do lint` and `./do test`. Ensures no phase can proceed without all gate conditions verified.
- **Key Interfaces:**
  - PTC JSON schema: `schema_version`, `phase_id`, `completed_at`, `gate_conditions[]`, `platforms_verified[]`, `bootstrap_stubs_present`
  - File naming: `docs/adr/<NNNN>-phase-<N>-complete.md`
  - `./do lint` validation: no `verified: false`, no duplicate PTCs, BOOTSTRAP-STUB checks after Phase 3
  - `./do test` output: `target/traceability.json` with `phase_gates` array
- **Requirements:** [ROAD-SCHEMA-001]-[ROAD-SCHEMA-016], [ROAD-STATEM-001]-[ROAD-STATEM-005]

## Traceability & Coverage Infrastructure
- **Owner:** Phase 0 / Sub-Epic: ./do Entrypoint Script (framework), Phase 5 / Sub-Epic: 100% Requirement Traceability (completion)
- **Consumers:** Phase 1 (unit coverage gates per crate), Phase 2 (unit coverage gates), Phase 3 (unit coverage gates), Phase 4 (bootstrap validation), Phase 5 / Sub-Epic: E2E Test Suite, Phase 5 / Sub-Epic: MVP Release Gate
- **Description:** Automated infrastructure for tracking test coverage and requirement traceability. `// Covers: REQ-ID` annotations in test code map to requirement IDs. Coverage tools enforce per-crate 90% unit and aggregate 80% E2E gates.
- **Key Interfaces:**
  - `// Covers: REQ-ID` annotation convention in test code
  - `target/traceability.json` — output artifact with `traceability_pct`, `stale_annotations`, `phase_gates`
  - `target/coverage/report.json` — per-crate coverage percentages
  - Five quality gates: QG-001 (90% unit), QG-002 (80% E2E aggregate), QG-003 (50% CLI E2E), QG-004 (50% TUI E2E), QG-005 (50% MCP E2E)
- **Requirements:** [AC-ROAD-P5-001]-[AC-ROAD-P5-007], [ROAD-BR-017]
