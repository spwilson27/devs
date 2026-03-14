# Interface Contracts

## Overview
- Total interfaces defined: 24
- Shared component interfaces: 14
- Cross-phase boundary interfaces: 10

---

## Shared Component Interfaces

### 1. devs-proto: Wire Types & gRPC Service Definitions

- **Owner:** Phase 0 / devs-proto Crate
- **Consumers:** Phase 1 / devs-checkpoint, Phase 2 / devs-scheduler, Phase 3 / devs-grpc, Phase 3 / devs-mcp, Phase 3 / devs-cli, Phase 3 / devs-tui
- **Contract Type:** Data Schema

#### Specification

All types live under the `devs.v1` protobuf package. Wire types must NOT appear in `devs-core`, `devs-scheduler`, `devs-executor`, or `devs-pool` public APIs — conversion traits (`From`/`Into`) are required at crate boundaries.

**ServerService RPC (Phase 0 baseline):**

```protobuf
service ServerService {
  rpc GetInfo(GetInfoRequest) returns (GetInfoResponse);
  rpc HealthCheck(HealthCheckRequest) returns (HealthCheckResponse);
}

message GetInfoRequest {}
message GetInfoResponse {
  string version = 1;
  string server_id = 2;
  uint64 uptime_secs = 3;
  string request_id = 4;
}
message HealthCheckRequest {}
message HealthCheckResponse {
  bool healthy = 1;
  string request_id = 2;
}
```

**Core message types (extended in Phase 3):**

```json
{
  "WorkflowRun": {
    "type": "object",
    "properties": {
      "run_id": { "type": "string", "format": "uuid" },
      "workflow_name": { "type": "string", "minLength": 1, "maxLength": 128 },
      "run_name": { "type": "string", "minLength": 1, "maxLength": 128 },
      "status": { "type": "string", "enum": ["pending", "running", "completed", "failed"] },
      "project_path": { "type": "string" },
      "stages": { "type": "array", "items": { "$ref": "#/StageRun" } },
      "created_at": { "type": "string", "format": "date-time" },
      "updated_at": { "type": "string", "format": "date-time" }
    },
    "required": ["run_id", "workflow_name", "status", "project_path", "created_at"]
  },
  "StageRun": {
    "type": "object",
    "properties": {
      "stage_name": { "type": "string" },
      "status": { "type": "string", "enum": ["waiting", "eligible", "running", "completed", "failed", "timed_out", "cancelled"] },
      "exit_code": { "type": "integer", "nullable": true },
      "output": { "type": "object", "nullable": true },
      "attempt": { "type": "integer", "minimum": 0 },
      "started_at": { "type": "string", "format": "date-time", "nullable": true },
      "completed_at": { "type": "string", "format": "date-time", "nullable": true }
    },
    "required": ["stage_name", "status", "attempt"]
  },
  "PoolState": {
    "type": "object",
    "properties": {
      "pool_name": { "type": "string" },
      "max_concurrent": { "type": "integer" },
      "active_count": { "type": "integer" },
      "available_agents": { "type": "array", "items": { "type": "string" } },
      "cooldown_agents": { "type": "array", "items": { "type": "string" } }
    },
    "required": ["pool_name", "max_concurrent", "active_count"]
  }
}
```

**Versioning:** Protobuf field numbering is sequential and additive-only. Breaking changes require a new `devs.v2` package.

#### Test Fixture

```
// GetInfo request/response
Request:  GetInfoRequest {}
Response: GetInfoResponse {
  version: "0.1.0",
  server_id: "devs-abc123",
  uptime_secs: 42,
  request_id: "req-001"
}
```

---

### 2. devs-core: BoundedString

- **Owner:** Phase 0 / devs-core Crate
- **Consumers:** Phase 1 / devs-config, Phase 1 / devs-adapters, Phase 1 / devs-pool, Phase 2 / devs-scheduler
- **Contract Type:** Function/Method

#### Specification

```rust
/// A string validated to be within [MIN, MAX] byte length (inclusive).
/// No tokio, git2, reqwest, or tonic dependencies.
pub struct BoundedString<const MIN: usize, const MAX: usize>(String);

impl<const MIN: usize, const MAX: usize> BoundedString<MIN, MAX> {
    /// Returns Err(BoundedStringError::TooShort { min, actual }) or
    /// Err(BoundedStringError::TooLong { max, actual }) on violation.
    pub fn new(value: impl Into<String>) -> Result<Self, BoundedStringError>;
    pub fn as_str(&self) -> &str;
    pub fn into_inner(self) -> String;
}

#[derive(Debug, thiserror::Error)]
pub enum BoundedStringError {
    #[error("string length {actual} is below minimum {min}")]
    TooShort { min: usize, actual: usize },
    #[error("string length {actual} exceeds maximum {max}")]
    TooLong { max: usize, actual: usize },
}
```

**Versioning:** Semver on devs-core crate. Adding new const generics is non-breaking.

#### Test Fixture

```rust
// Success
let name = BoundedString::<1, 128>::new("my-workflow").unwrap();
assert_eq!(name.as_str(), "my-workflow");

// Failure: empty string
let err = BoundedString::<1, 128>::new("").unwrap_err();
assert!(matches!(err, BoundedStringError::TooShort { min: 1, actual: 0 }));
```

---

### 3. devs-core: WorkflowRunState & StageRunState State Machines

- **Owner:** Phase 0 / devs-core Crate
- **Consumers:** Phase 2 / devs-scheduler, Phase 3 / devs-grpc, Phase 3 / devs-mcp
- **Contract Type:** Function/Method

#### Specification

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WorkflowRunState { Pending, Running, Completed, Failed }

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StageRunState { Waiting, Eligible, Running, Completed, Failed, TimedOut, Cancelled }

impl WorkflowRunState {
    /// Returns Ok(new_state) or Err(InvalidTransition) if the transition is not allowed.
    pub fn transition(self, to: WorkflowRunState) -> Result<WorkflowRunState, InvalidTransition>;
    pub fn is_terminal(self) -> bool;
}

impl StageRunState {
    pub fn transition(self, to: StageRunState) -> Result<StageRunState, InvalidTransition>;
    pub fn is_terminal(self) -> bool;
}

/// Valid transitions:
/// WorkflowRunState: Pending->Running, Running->Completed, Running->Failed
/// StageRunState: Waiting->Eligible, Eligible->Running, Running->Completed,
///   Running->Failed, Running->TimedOut, Running->Cancelled,
///   Failed->Waiting (retry loopback)
```

**Versioning:** Adding new states is a breaking change requiring semver major bump.

#### Test Fixture

```rust
let state = WorkflowRunState::Pending;
let next = state.transition(WorkflowRunState::Running).unwrap();
assert_eq!(next, WorkflowRunState::Running);

let err = WorkflowRunState::Completed.transition(WorkflowRunState::Running);
assert!(err.is_err()); // InvalidTransition
```

---

### 4. devs-core: TemplateResolver

- **Owner:** Phase 0 / devs-core Crate
- **Consumers:** Phase 2 / devs-scheduler
- **Contract Type:** Function/Method

#### Specification

```rust
pub struct TemplateContext {
    /// Workflow input parameters
    pub inputs: HashMap<String, serde_json::Value>,
    /// Stage outputs keyed by stage name, then by field name
    pub stage_outputs: HashMap<String, HashMap<String, serde_json::Value>>,
}

pub struct TemplateResolver;

impl TemplateResolver {
    /// Resolves all `{{key}}` and `{{stage.<name>.<field>}}` placeholders.
    /// Returns Err(TemplateError::UnresolvedVariable(name)) for missing variables.
    /// No code execution -- pure string interpolation only.
    pub fn resolve(template: &str, context: &TemplateContext) -> Result<String, TemplateError>;
}

#[derive(Debug, thiserror::Error)]
pub enum TemplateError {
    #[error("unresolved variable: {0}")]
    UnresolvedVariable(String),
    #[error("invalid template syntax at position {0}")]
    InvalidSyntax(usize),
}
```

**Versioning:** Semver on devs-core. Adding new variable namespaces is non-breaking.

#### Test Fixture

```rust
let ctx = TemplateContext {
    inputs: HashMap::from([("task".into(), json!("implement auth"))]),
    stage_outputs: HashMap::from([(
        "plan".into(),
        HashMap::from([("summary".into(), json!("Add OAuth2 support"))])
    )]),
};
let result = TemplateResolver::resolve(
    "Task: {{task}}. Plan said: {{stage.plan.summary}}",
    &ctx
).unwrap();
assert_eq!(result, "Task: implement auth. Plan said: Add OAuth2 support");
```

---

### 5. devs-core: PhaseTransitionCheckpoint Schema

- **Owner:** Phase 0 / devs-core Crate
- **Consumers:** Phase 1 (gate), Phase 2 (gate), Phase 3 (gate), Phase 4 (gate), Phase 5 (gate)
- **Contract Type:** Data Schema

#### Specification

```json
{
  "type": "object",
  "properties": {
    "schema_version": { "type": "integer", "const": 1 },
    "phase_id": { "type": "string", "pattern": "^phase-[0-5]$" },
    "phase_name": { "type": "string" },
    "completed_at": { "type": "string", "format": "date-time" },
    "completed_by": { "type": "string" },
    "ci_pipeline_url": { "type": "string", "format": "uri" },
    "platforms_verified": {
      "type": "array",
      "items": { "type": "string", "enum": ["linux", "macos", "windows"] },
      "minItems": 3, "maxItems": 3, "uniqueItems": true
    },
    "gate_conditions": {
      "type": "array", "minItems": 1,
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "description": { "type": "string" },
          "verified": { "type": "boolean", "const": true }
        },
        "required": ["id", "description", "verified"]
      }
    },
    "risk_mitigations_confirmed": { "type": "array", "items": { "type": "string" } },
    "bootstrap_stubs_present": { "type": "boolean" },
    "notes": { "type": "string" }
  },
  "required": ["schema_version", "phase_id", "phase_name", "completed_at", "completed_by",
    "ci_pipeline_url", "platforms_verified", "gate_conditions", "bootstrap_stubs_present"]
}
```

```rust
pub struct PhaseTransitionCheckpoint { /* fields matching schema */ }

impl PhaseTransitionCheckpoint {
    pub fn validate(&self) -> Result<(), Vec<PtcValidationError>>;
}
```

**Versioning:** `schema_version` field. Currently always `1`.

#### Test Fixture

```json
{
  "schema_version": 1,
  "phase_id": "phase-0",
  "phase_name": "Project Foundation & Toolchain",
  "completed_at": "2026-03-10T14:30:00Z",
  "completed_by": "agent-claude",
  "ci_pipeline_url": "https://gitlab.example.com/devs/-/pipelines/12345",
  "platforms_verified": ["linux", "macos", "windows"],
  "gate_conditions": [
    { "id": "AC-ROAD-P0-001", "description": "Presubmit Linux passes", "verified": true }
  ],
  "risk_mitigations_confirmed": ["RISK-005", "RISK-009"],
  "bootstrap_stubs_present": true,
  "notes": "Phase 0 complete"
}
```

---

### 6. devs-config: ServerConfig & Configuration Parsing

- **Owner:** Phase 1 / devs-config Crate
- **Consumers:** Phase 1 / devs-pool, Phase 1 / devs-executor, Phase 2 / devs-scheduler, Phase 2 / devs-webhook, Phase 3 / devs-server, Phase 3 / devs-cli
- **Contract Type:** Data Schema + Function/Method

#### Specification

```rust
pub struct ServerConfig {
    pub listen_addr: SocketAddr,      // default: 127.0.0.1:7890
    pub mcp_port: u16,                // default: 7891
    pub default_pool: String,
    pub scheduling_policy: SchedulingPolicy,
    pub pools: Vec<PoolConfig>,
    pub webhooks: Vec<WebhookTarget>,
    pub credentials: HashMap<String, Redacted<String>>,
}

pub struct PoolConfig {
    pub name: BoundedString<1, 64>,
    pub max_concurrent: u32,          // min: 1
    pub agents: Vec<AgentConfig>,
}

pub struct AgentConfig {
    pub tool: AgentTool,              // enum: Claude, Gemini, OpenCode, Qwen, Copilot
    pub capabilities: Vec<String>,
    pub fallback: bool,
}

pub struct ProjectEntry {
    pub repo_path: PathBuf,
    pub priority: u32,                // for strict priority queue
    pub weight: f64,                  // for weighted fair queuing, 0.0 < weight <= 1.0
    pub checkpoint_branch: Option<String>,  // default: None (working branch)
    pub workflow_search_paths: Vec<PathBuf>,
}

pub struct WorkflowDefinition {
    pub name: BoundedString<1, 128>,
    pub stages: Vec<StageDefinition>,
    pub inputs: Vec<InputParameter>,
    pub timeout: Option<Duration>,
}

pub struct StageDefinition {
    pub name: BoundedString<1, 128>,
    pub pool: String,
    pub prompt: Option<String>,
    pub prompt_file: Option<PathBuf>,
    pub system_prompt: Option<String>,
    pub depends_on: Vec<String>,
    pub completion: CompletionSignal,  // enum: ExitCode, StructuredOutput, McpToolCall
    pub env_vars: HashMap<String, String>,
    pub execution_target: ExecutionTarget, // enum: Tempdir, Docker, Remote
    pub retry: Option<RetryConfig>,
    pub timeout: Option<Duration>,
    pub fan_out: Option<FanOutConfig>,
    pub branch: Option<BranchConfig>,
}

pub struct InputParameter {
    pub name: String,
    pub param_type: ParamType,  // enum: String, Path, Integer, Boolean
    pub required: bool,
    pub default: Option<serde_json::Value>,
}

pub struct RetryConfig {
    pub max_attempts: u32,
    pub backoff: BackoffStrategy,  // enum: Fixed(Duration), Exponential { base: Duration, max: Duration }
}

pub struct FanOutConfig {
    pub count: Option<u32>,
    pub inputs: Option<Vec<serde_json::Value>>,
    pub merge_handler: Option<String>,  // named handler reference
}

pub struct BranchConfig {
    pub handler: Option<String>,        // named Rust handler
    pub predicates: Vec<BranchPredicate>,
}

pub struct BranchPredicate {
    pub condition: BranchCondition,     // enum: ExitCode(i32), StdoutContains(String), OutputField { field, value }
    pub target: String,                 // stage name to route to
}

pub enum SchedulingPolicy { StrictPriority, WeightedFairQueuing }
pub enum CompletionSignal { ExitCode, StructuredOutput, McpToolCall }
pub enum ExecutionTarget { Tempdir, Docker(DockerConfig), Remote(SshConfig) }
pub enum ParamType { String, Path, Integer, Boolean }

impl ServerConfig {
    /// Override chain: TOML file -> env vars -> CLI flags.
    pub fn load(path: Option<&Path>, overrides: &ConfigOverrides) -> Result<Self, ConfigError>;
    /// Single-pass validation collecting ALL errors.
    pub fn validate(&self) -> Result<(), Vec<ConfigError>>;
}
```

**Versioning:** Semver on devs-config crate.

#### Test Fixture

```toml
# devs.toml
[server]
listen_addr = "127.0.0.1:7890"
mcp_port = 7891
default_pool = "primary"
scheduling_policy = "strict_priority"

[[pool]]
name = "primary"
max_concurrent = 4

[[pool.agent]]
tool = "claude"
capabilities = ["code-gen", "review"]

[[pool.agent]]
tool = "opencode"
capabilities = ["code-gen"]
fallback = true
```

```rust
let config = ServerConfig::load(Some(Path::new("devs.toml")), &ConfigOverrides::default()).unwrap();
assert_eq!(config.listen_addr, "127.0.0.1:7890".parse().unwrap());
assert_eq!(config.pools[0].agents.len(), 2);
assert!(config.validate().is_ok());
```

---

### 7. Redacted\<T\> Security Wrapper

- **Owner:** Phase 1 / Security Foundations
- **Consumers:** Phase 1 / devs-config, Phase 1 / devs-adapters, Phase 1 / devs-executor, Phase 3 / devs-server, Phase 3 / devs-mcp
- **Contract Type:** Function/Method

#### Specification

```rust
pub struct Redacted<T>(T);

impl<T> Redacted<T> {
    pub fn new(value: T) -> Self;
    /// Explicit opt-in access. Callers must justify use.
    pub fn expose(&self) -> &T;
}

impl<T> fmt::Debug for Redacted<T> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "[REDACTED]")
    }
}

impl<T> fmt::Display for Redacted<T> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "[REDACTED]")
    }
}

// Clone, Serialize (as "[REDACTED]"), PartialEq (delegates to inner)
```

**Versioning:** Semver on containing crate.

#### Test Fixture

```rust
let secret = Redacted::new("sk-ant-api-key-12345".to_string());
assert_eq!(format!("{:?}", secret), "[REDACTED]");
assert_eq!(format!("{}", secret), "[REDACTED]");
assert_eq!(secret.expose(), "sk-ant-api-key-12345");
```

---

### 8. devs-adapters: AgentAdapter Trait

- **Owner:** Phase 1 / devs-adapters Crate
- **Consumers:** Phase 1 / devs-pool, Phase 1 / devs-executor, Phase 2 / devs-scheduler
- **Contract Type:** Function/Method

#### Specification

```rust
#[async_trait]
pub trait AgentAdapter: Send + Sync {
    /// Spawn the agent process with the given invocation config.
    async fn spawn(&self, config: &AgentInvocation) -> Result<AgentProcess, AdapterError>;
    /// Check if process output indicates a rate limit.
    fn detect_rate_limit(&self, output: &ProcessOutput) -> Option<RateLimitInfo>;
    /// Agent tool name (e.g., "claude", "gemini").
    fn tool_name(&self) -> &str;
}

pub struct AgentInvocation {
    pub prompt: String,
    pub system_prompt: Option<String>,
    pub env_vars: HashMap<String, String>,
    pub working_dir: PathBuf,
    pub pty_mode: bool,
    pub prompt_mode: PromptMode,  // enum: Flag, File
}

pub struct AgentProcess {
    // Internal: child process or PTY handle
}

impl AgentProcess {
    /// Write to the agent's stdin (for devs->agent interaction).
    pub async fn write_stdin(&mut self, data: &[u8]) -> Result<(), io::Error>;
    /// Wait for the agent to exit, collecting output.
    pub async fn wait(self) -> Result<ProcessOutput, AdapterError>;
    /// Send cancel signal (SIGTERM on Unix, TerminateProcess on Windows).
    pub async fn cancel(&mut self) -> Result<(), AdapterError>;
}

pub struct ProcessOutput {
    pub exit_code: i32,
    pub stdout: String,
    pub stderr: String,
}

pub struct RateLimitInfo {
    pub agent_id: String,
    pub suggested_cooldown: Duration,  // default: 60s
}

/// Platform-aware PTY support flag.
pub static PTY_AVAILABLE: LazyLock<bool> = /* runtime probe */;
```

**Versioning:** Semver on devs-adapters crate. Adding methods to `AgentAdapter` is breaking.

#### Test Fixture

```rust
let adapter = ClaudeAdapter::new();
assert_eq!(adapter.tool_name(), "claude");

let invocation = AgentInvocation {
    prompt: "List files".into(),
    system_prompt: None,
    env_vars: HashMap::new(),
    working_dir: PathBuf::from("/tmp/work"),
    pty_mode: false,
    prompt_mode: PromptMode::Flag,
};
let mut process = adapter.spawn(&invocation).await.unwrap();
let output = process.wait().await.unwrap();
assert_eq!(output.exit_code, 0);
assert!(adapter.detect_rate_limit(&output).is_none());
```

---

### 9. devs-pool: Agent Pool Routing & Concurrency

- **Owner:** Phase 1 / devs-pool Crate
- **Consumers:** Phase 2 / devs-scheduler, Phase 2 / devs-webhook, Phase 3 / devs-grpc, Phase 3 / devs-mcp
- **Contract Type:** Function/Method + Event/Message

#### Specification

```rust
pub struct PoolManager {
    // Internal: HashMap<String, Pool>
}

impl PoolManager {
    pub fn new(configs: Vec<PoolConfig>, adapters: HashMap<String, Arc<dyn AgentAdapter>>) -> Self;

    /// Acquire an agent from the named pool matching required capabilities.
    /// Blocks (async) until an agent is available or pool is exhausted.
    pub async fn acquire_agent(
        &self, pool: &str, required_caps: &[&str]
    ) -> Result<AgentLease, PoolError>;

    /// Return the agent lease to the pool.
    pub async fn release_agent(&self, lease: AgentLease);

    /// Mark an agent as rate-limited until the given timestamp.
    pub fn report_rate_limit(&self, agent_id: &AgentId, cooldown_until: DateTime<Utc>);

    /// Get current pool utilization snapshot.
    pub fn get_pool_state(&self, pool: &str) -> Result<PoolState, PoolError>;

    /// Subscribe to pool exhaustion events.
    pub fn subscribe_exhaustion(&self) -> tokio::sync::mpsc::Receiver<PoolExhaustedEvent>;
}

pub struct AgentLease {
    pub agent_id: AgentId,
    pub adapter: Arc<dyn AgentAdapter>,
    pub pool_name: String,
    // internal: semaphore permit
}

pub struct PoolExhaustedEvent {
    pub pool_name: String,
    pub timestamp: DateTime<Utc>,
}
```

**PoolExhausted fires once per episode** -- not repeatedly while exhausted. Resets when an agent becomes available.

**Versioning:** Semver on devs-pool crate.

#### Test Fixture

```rust
let manager = PoolManager::new(
    vec![PoolConfig { name: "primary".into(), max_concurrent: 2, agents: vec![/*...*/] }],
    adapters,
);
let lease = manager.acquire_agent("primary", &["code-gen"]).await.unwrap();
assert_eq!(lease.pool_name, "primary");
let state = manager.get_pool_state("primary").unwrap();
assert_eq!(state.active_count, 1);
manager.release_agent(lease).await;
```

---

### 10. devs-checkpoint: Git-Backed State Persistence

- **Owner:** Phase 1 / devs-checkpoint Crate
- **Consumers:** Phase 2 / devs-scheduler, Phase 3 / devs-server
- **Contract Type:** Function/Method

#### Specification

```rust
pub struct CheckpointManager {
    // Uses git2 on spawn_blocking internally
}

impl CheckpointManager {
    pub fn new() -> Self;

    /// Atomically commit checkpoint for a workflow run.
    /// Writes to `.devs/checkpoints/<run_id>.json` in the project repo.
    pub async fn save_checkpoint(
        &self, project: &ProjectRef, run: &WorkflowRun
    ) -> Result<(), CheckpointError>;

    /// Restore all in-flight runs from a project's checkpoint directory.
    /// Must not fail server startup -- returns empty vec on any git error.
    pub async fn restore_checkpoints(
        &self, project: &ProjectRef
    ) -> Result<Vec<WorkflowRun>, CheckpointError>;

    /// Store an immutable workflow definition snapshot.
    pub async fn snapshot_definition(
        &self, project: &ProjectRef, def: &WorkflowDefinition
    ) -> Result<SnapshotId, CheckpointError>;

    /// Enforce log retention policy (max age / max size).
    pub async fn enforce_retention(
        &self, project: &ProjectRef, policy: &RetentionPolicy
    ) -> Result<(), CheckpointError>;
}

pub struct ProjectRef {
    pub repo_path: PathBuf,
    pub checkpoint_branch: Option<String>,
}

pub struct SnapshotId(String);  // content-addressed hash

pub struct RetentionPolicy {
    pub max_age: Option<Duration>,
    pub max_size_bytes: Option<u64>,
}
```

**Versioning:** Semver on devs-checkpoint crate.

#### Test Fixture

```rust
let mgr = CheckpointManager::new();
let project = ProjectRef { repo_path: "/tmp/test-repo".into(), checkpoint_branch: None };
let run = WorkflowRun { run_id: RunId::new(), /* ... */ };
mgr.save_checkpoint(&project, &run).await.unwrap();

let restored = mgr.restore_checkpoints(&project).await.unwrap();
assert_eq!(restored.len(), 1);
assert_eq!(restored[0].run_id, run.run_id);
```

---

### 11. devs-executor: Execution Environment Management

- **Owner:** Phase 1 / devs-executor Crate
- **Consumers:** Phase 2 / devs-scheduler, Phase 3 / devs-mcp
- **Contract Type:** Function/Method

#### Specification

```rust
pub struct ExecutionManager;

impl ExecutionManager {
    /// Clone repo into isolated environment; inject env vars; write context file.
    pub async fn prepare_environment(
        &self, target: &ExecutionTarget, project: &ProjectRef
    ) -> Result<WorkingEnvironment, ExecutorError>;

    /// Execute an agent in the prepared environment.
    pub async fn run_agent(
        &self, env: &WorkingEnvironment, adapter: &dyn AgentAdapter, invocation: &AgentInvocation
    ) -> Result<ProcessOutput, ExecutorError>;

    /// Collect artifacts post-stage: auto-collect (diff+commit+push) or agent-driven.
    pub async fn collect_artifacts(
        &self, env: &WorkingEnvironment, mode: ArtifactMode
    ) -> Result<(), ExecutorError>;

    /// Tear down the working environment.
    pub async fn cleanup(&self, env: WorkingEnvironment) -> Result<(), ExecutorError>;
}

pub struct WorkingEnvironment {
    pub working_dir: PathBuf,
    pub target: ExecutionTarget,
    pub env_vars: HashMap<String, String>,  // includes DEVS_MCP_ADDR
}

pub enum ArtifactMode { AgentDriven, AutoCollect }
```

**Versioning:** Semver on devs-executor crate.

#### Test Fixture

```rust
let mgr = ExecutionManager;
let env = mgr.prepare_environment(
    &ExecutionTarget::Tempdir,
    &ProjectRef { repo_path: "/home/user/project".into(), checkpoint_branch: None }
).await.unwrap();
assert!(env.working_dir.exists());
assert!(env.env_vars.contains_key("DEVS_MCP_ADDR"));
mgr.cleanup(env).await.unwrap();
```

---

### 12. devs-scheduler: DAG Workflow Engine

- **Owner:** Phase 2 / devs-scheduler Crate
- **Consumers:** Phase 3 / devs-grpc, Phase 3 / devs-mcp, Phase 3 / devs-server
- **Contract Type:** Function/Method

#### Specification

```rust
pub struct Scheduler {
    runs: Arc<RwLock<HashMap<RunId, WorkflowRun>>>,
    // internal: pool_manager, checkpoint_manager, executor, webhook_dispatcher
}

impl Scheduler {
    pub fn new(
        pool: PoolManager,
        checkpoint: CheckpointManager,
        executor: ExecutionManager,
        webhook: WebhookDispatcher,
        config: SchedulerConfig,
    ) -> Self;

    /// 7-step atomic validation under per-project mutex:
    /// 1. definition exists, 2. required inputs present, 3. type-valid,
    /// 4. type coercion, 5. no extra keys, 6. run name unique,
    /// 7. server not shutting down -> create WorkflowRun.
    pub async fn submit_run(
        &self, project: &ProjectRef, workflow: &str,
        inputs: HashMap<String, serde_json::Value>, name: Option<String>
    ) -> Result<RunId, SchedulerError>;

    pub async fn cancel_run(&self, run_id: &RunId) -> Result<(), SchedulerError>;
    pub async fn get_run(&self, run_id: &RunId) -> Result<WorkflowRun, SchedulerError>;
    pub fn list_runs(&self, project: Option<&ProjectRef>) -> Vec<WorkflowRunSummary>;
    pub async fn get_stage_output(&self, run_id: &RunId, stage: &str) -> Result<StageOutput, SchedulerError>;

    /// MCP completion signal. Returns error if stage is already terminal.
    pub async fn signal_completion(
        &self, run_id: &RunId, stage: &str, result: CompletionResult
    ) -> Result<(), SchedulerError>;

    pub async fn pause_run(&self, run_id: &RunId) -> Result<(), SchedulerError>;
    pub async fn resume_run(&self, run_id: &RunId) -> Result<(), SchedulerError>;
}

pub struct StageOutput {
    pub exit_code: Option<i32>,
    pub stdout: Option<String>,
    pub structured: Option<serde_json::Value>,
}

pub struct CompletionResult {
    pub success: bool,
    pub data: Option<serde_json::Value>,
}

pub struct WorkflowRunSummary {
    pub run_id: RunId,
    pub workflow_name: String,
    pub run_name: String,
    pub status: WorkflowRunState,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, thiserror::Error)]
pub enum SchedulerError {
    #[error("workflow not found: {0}")]
    WorkflowNotFound(String),
    #[error("run not found: {0}")]
    RunNotFound(RunId),
    #[error("run name already exists: {0}")]
    RunNameExists(String),
    #[error("invalid input: {0}")]
    InvalidInput(String),
    #[error("server shutting down")]
    ShuttingDown,
    #[error("failed precondition: {0}")]
    FailedPrecondition(String),
    #[error("cycle detected: {0:?}")]
    CycleDetected(Vec<String>),
}
```

**Lock acquisition order:** project registry -> workflow runs -> pool state -> checkpoint.

**DAG dispatch latency:** <=100ms from dependency completion to eligible stage dispatch.

**Versioning:** Semver on devs-scheduler crate.

#### Test Fixture

```rust
let run_id = scheduler.submit_run(
    &project,
    "presubmit-check",
    HashMap::from([("crate".into(), json!("devs-core"))]),
    Some("test-run-1".into()),
).await.unwrap();

let run = scheduler.get_run(&run_id).await.unwrap();
assert_eq!(run.status, WorkflowRunState::Pending);

// After engine ticks:
let runs = scheduler.list_runs(Some(&project));
assert_eq!(runs.len(), 1);
```

---

### 13. devs-webhook: Outbound Notifications

- **Owner:** Phase 2 / devs-webhook Crate
- **Consumers:** Phase 3 / devs-server
- **Contract Type:** Event/Message

#### Specification

```rust
pub struct WebhookDispatcher {
    // Internal: bounded mpsc channel, reqwest client, retry logic
}

impl WebhookDispatcher {
    pub fn new(targets: Vec<WebhookTarget>) -> Self;

    /// Non-blocking enqueue. Returns Err if channel is full.
    pub fn send(&self, event: WebhookEvent) -> Result<(), WebhookError>;

    /// Spawn the background delivery task. Call once at startup.
    pub fn start(&self) -> tokio::task::JoinHandle<()>;
}

pub struct WebhookTarget {
    pub url: String,
    pub events: Vec<WebhookEventType>,
    pub project: Option<String>,  // None = all projects
}

#[derive(Clone, Debug, Serialize)]
pub enum WebhookEvent {
    RunStarted { run_id: String, workflow: String, timestamp: DateTime<Utc> },
    RunCompleted { run_id: String, workflow: String, timestamp: DateTime<Utc> },
    RunFailed { run_id: String, workflow: String, error: String, timestamp: DateTime<Utc> },
    StageStarted { run_id: String, stage: String, timestamp: DateTime<Utc> },
    StageCompleted { run_id: String, stage: String, exit_code: i32, timestamp: DateTime<Utc> },
    StageFailed { run_id: String, stage: String, error: String, timestamp: DateTime<Utc> },
    PoolExhausted { pool: String, timestamp: DateTime<Utc> },
    StateChanged { run_id: String, from: String, to: String, timestamp: DateTime<Utc> },
}

pub enum WebhookEventType {
    RunLifecycle, StageLifecycle, PoolExhaustion, AllStateChanges,
}
```

**Delivery guarantee:** At-least-once with fixed-backoff retry (3 attempts, 1s/5s/15s delays).

**Versioning:** Semver on devs-webhook crate.

#### Test Fixture

```rust
let dispatcher = WebhookDispatcher::new(vec![WebhookTarget {
    url: "http://localhost:9999/hooks".into(),
    events: vec![WebhookEventType::RunLifecycle],
    project: None,
}]);
dispatcher.start();
dispatcher.send(WebhookEvent::RunStarted {
    run_id: "run-001".into(),
    workflow: "presubmit-check".into(),
    timestamp: Utc::now(),
}).unwrap();
// Webhook POST sent to http://localhost:9999/hooks with JSON body
```

---

### 14. Server Discovery Protocol

- **Owner:** Phase 0 / devs-core (protocol def), Phase 3 / devs-server (writer)
- **Consumers:** Phase 3 / devs-cli, Phase 3 / devs-tui, Phase 3 / devs-mcp-bridge, Phase 4 / Bootstrap
- **Contract Type:** Configuration

#### Specification

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `DEVS_DISCOVERY_FILE` | env var (path) | `~/.config/devs/server.addr` | Override path for test isolation |
| Discovery file content | `host:port` string | n/a | Single line: `127.0.0.1:7890` |

**Resolution order:**
1. `--server` CLI flag (explicit address)
2. `DEVS_DISCOVERY_FILE` env var -> read that file
3. `~/.config/devs/server.addr` -> read default file
4. Error: server not found

**Write protocol:** Atomic write via temp file + rename in same directory. Server creates parent directories if missing. File deleted on clean server shutdown.

**Stale detection:** Client connects and calls `HealthCheck` RPC. If connection fails, treat discovery file as stale.

**Versioning:** File format is `host:port` on line 1. No version header needed -- format is trivially extensible by adding lines.

#### Test Fixture

```
# Discovery file content
127.0.0.1:7890

# Client resolution
$ DEVS_DISCOVERY_FILE=/tmp/test-server.addr devs status
# reads /tmp/test-server.addr, connects to 127.0.0.1:7890

$ devs status --server 192.168.1.5:7890
# ignores discovery file, connects directly
```

---

## Cross-Phase Boundary Interfaces

### 15. Phase 0 -> Phase 1: devs-core Domain Types

- **Owner:** Phase 0 / devs-core
- **Consumers:** Phase 1 / all crates
- **Contract Type:** Function/Method

#### Specification

Phase 1 crates import `devs-core` for:
- `BoundedString<MIN, MAX>` (see Interface #2)
- `WorkflowRunState` / `StageRunState` enums (see Interface #3)
- `TemplateResolver` (see Interface #4)
- Error types: `InvalidTransition`, `BoundedStringError`, `TemplateError`
- `PhaseTransitionCheckpoint` (see Interface #5)

**Constraint:** devs-core has zero runtime dependencies (no tokio, git2, reqwest, tonic). Phase 1 crates must not add these as transitive dependencies of devs-core.

#### Test Fixture

```rust
// Phase 1 crate (devs-config) uses devs-core types
use devs_core::{BoundedString, WorkflowRunState};
let name = BoundedString::<1, 64>::new("primary").unwrap();
assert!(!WorkflowRunState::Running.is_terminal());
```

---

### 16. Phase 0 -> Phase 2: devs-proto Wire Types

- **Owner:** Phase 0 / devs-proto
- **Consumers:** Phase 2 / devs-scheduler (via conversion traits only)
- **Contract Type:** Data Schema

#### Specification

Phase 2 crates use devs-proto types only at serialization boundaries (checkpoint persistence). The scheduler's public API uses devs-core domain types exclusively.

```rust
// Conversion traits at boundary
impl From<&WorkflowRun> for devs_proto::devs::v1::WorkflowRun { /* ... */ }
impl TryFrom<devs_proto::devs::v1::WorkflowRun> for WorkflowRun { /* ... */ }
```

**Constraint:** Wire types must not leak into `devs-scheduler` public API signatures.

#### Test Fixture

```rust
let domain_run = WorkflowRun { /* devs-core types */ };
let proto_run: devs_proto::devs::v1::WorkflowRun = (&domain_run).into();
let roundtrip: WorkflowRun = proto_run.try_into().unwrap();
assert_eq!(domain_run.run_id, roundtrip.run_id);
```

---

### 17. Phase 1 -> Phase 2: devs-config -> devs-scheduler

- **Owner:** Phase 1 / devs-config
- **Consumers:** Phase 2 / devs-scheduler
- **Contract Type:** Data Schema

#### Specification

The scheduler receives:
- `WorkflowDefinition` -- parsed workflow with stages, branches, fan-out, inputs
- `ProjectEntry` -- project registry entries for multi-project scheduling
- `SchedulingPolicy` -- strict priority or weighted fair queuing

These types are defined in devs-config (Interface #6) and consumed read-only by devs-scheduler.

#### Test Fixture

```rust
let def = WorkflowDefinition {
    name: BoundedString::new("test-wf").unwrap(),
    stages: vec![
        StageDefinition { name: BoundedString::new("plan").unwrap(), depends_on: vec![], /* ... */ },
        StageDefinition { name: BoundedString::new("impl").unwrap(), depends_on: vec!["plan".into()], /* ... */ },
    ],
    inputs: vec![InputParameter { name: "task".into(), param_type: ParamType::String, required: true, default: None }],
    timeout: Some(Duration::from_secs(3600)),
};
// Scheduler accepts this directly
```

---

### 18. Phase 1 -> Phase 2: devs-pool -> devs-scheduler

- **Owner:** Phase 1 / devs-pool
- **Consumers:** Phase 2 / devs-scheduler
- **Contract Type:** Function/Method

#### Specification

The scheduler calls `PoolManager::acquire_agent` when dispatching a stage and `release_agent` when the stage completes. See Interface #9 for full API.

Key interaction pattern:
1. Scheduler identifies eligible stage
2. Calls `pool.acquire_agent(stage.pool, stage.required_caps)`
3. On success: dispatches stage via executor with the leased agent
4. On completion/failure: calls `pool.release_agent(lease)`
5. On rate limit detection: calls `pool.report_rate_limit(agent_id, cooldown_until)`

#### Test Fixture

```rust
// Scheduler dispatch cycle
let lease = pool.acquire_agent("primary", &["code-gen"]).await.unwrap();
let output = executor.run_agent(&env, lease.adapter.as_ref(), &invocation).await.unwrap();
if let Some(rl) = lease.adapter.detect_rate_limit(&output) {
    pool.report_rate_limit(&lease.agent_id, Utc::now() + rl.suggested_cooldown);
}
pool.release_agent(lease).await;
```

---

### 19. Phase 1 -> Phase 2: devs-checkpoint -> devs-scheduler

- **Owner:** Phase 1 / devs-checkpoint
- **Consumers:** Phase 2 / devs-scheduler
- **Contract Type:** Function/Method

#### Specification

The scheduler calls checkpoint operations at these points:
- **Run start:** `snapshot_definition` to freeze the workflow definition
- **State change:** `save_checkpoint` after each stage state transition
- **Shutdown:** `save_checkpoint` for all running workflows

See Interface #10 for full API. Checkpoint restoration happens at server startup (Phase 3 / devs-server), not in the scheduler directly.

#### Test Fixture

```rust
// On run submission
let snap_id = checkpoint.snapshot_definition(&project, &workflow_def).await.unwrap();

// On stage completion
let updated_run = scheduler.get_run(&run_id).await.unwrap();
checkpoint.save_checkpoint(&project, &updated_run).await.unwrap();
```

---

### 20. Phase 1 -> Phase 2: devs-executor -> devs-scheduler

- **Owner:** Phase 1 / devs-executor
- **Consumers:** Phase 2 / devs-scheduler
- **Contract Type:** Function/Method

#### Specification

The scheduler orchestrates the executor for each stage:
1. `prepare_environment` -- clone repo, set up execution target
2. `run_agent` -- execute the agent with the leased adapter
3. `collect_artifacts` -- gather results
4. `cleanup` -- tear down environment

See Interface #11 for full API.

#### Test Fixture

```rust
let env = executor.prepare_environment(&ExecutionTarget::Tempdir, &project).await.unwrap();
let output = executor.run_agent(&env, adapter, &invocation).await.unwrap();
executor.collect_artifacts(&env, ArtifactMode::AutoCollect).await.unwrap();
executor.cleanup(env).await.unwrap();
```

---

### 21. Phase 2 -> Phase 3: devs-scheduler -> devs-grpc

- **Owner:** Phase 2 / devs-scheduler
- **Consumers:** Phase 3 / devs-grpc
- **Contract Type:** Function/Method

#### Specification

devs-grpc wraps scheduler methods as gRPC service implementations with proto type conversions:

| gRPC RPC | Scheduler Method | gRPC Error Code |
|----------|-----------------|-----------------|
| `WorkflowService.SubmitRun` | `scheduler.submit_run()` | `INVALID_ARGUMENT`, `NOT_FOUND`, `ALREADY_EXISTS`, `FAILED_PRECONDITION` |
| `WorkflowService.ListRuns` | `scheduler.list_runs()` | (none) |
| `WorkflowService.GetRun` | `scheduler.get_run()` | `NOT_FOUND` |
| `WorkflowService.CancelRun` | `scheduler.cancel_run()` | `NOT_FOUND`, `FAILED_PRECONDITION` |
| `StageService.GetStageOutput` | `scheduler.get_stage_output()` | `NOT_FOUND` |
| `StageService.ListStages` | `scheduler.get_run()` -> extract stages | `NOT_FOUND` |

All unary responses include a `request_id` field. Streaming RPCs respect Tokio context cancellation.

#### Test Fixture

```protobuf
// SubmitRun
Request: SubmitRunRequest {
  project_path: "/home/user/project",
  workflow: "presubmit-check",
  inputs: { "crate": "devs-core" },
  run_name: "test-run"
}
Response: SubmitRunResponse {
  run_id: "550e8400-e29b-41d4-a716-446655440000",
  request_id: "req-42"
}

// Error case
Response: gRPC Status {
  code: NOT_FOUND,
  message: "workflow not found: nonexistent"
}
```

---

### 22. Phase 2 -> Phase 3: devs-scheduler -> devs-mcp

- **Owner:** Phase 2 / devs-scheduler
- **Consumers:** Phase 3 / devs-mcp
- **Contract Type:** Function/Method

#### Specification

devs-mcp exposes scheduler methods as MCP tools via JSON-RPC:

| MCP Tool | Scheduler Method | Error |
|----------|-----------------|-------|
| `submit_run` | `scheduler.submit_run()` | `{"code": -32602, "message": "..."}` |
| `list_runs` | `scheduler.list_runs()` | (none) |
| `get_run` | `scheduler.get_run()` | `{"code": -32602, "message": "run not found"}` |
| `cancel_run` | `scheduler.cancel_run()` | see above |
| `signal_completion` | `scheduler.signal_completion()` | `"failed_precondition: stage is already in a terminal state"` |
| `get_stage_output` | `scheduler.get_stage_output()` | see above |
| `get_pool_state` | `pool.get_pool_state()` | see above |

**JSON-RPC format:**
```json
// Request
// POST /mcp/v1/call
{"jsonrpc": "2.0", "id": 1, "method": "submit_run", "params": {"workflow": "presubmit-check", "project_path": "/home/user/project", "inputs": {"crate": "devs-core"}}}

// Success response
{"jsonrpc": "2.0", "id": 1, "result": {"run_id": "550e8400-e29b-41d4-a716-446655440000"}}

// Error response
{"jsonrpc": "2.0", "id": 1, "error": {"code": -32602, "message": "workflow not found: bad"}}
```

#### Test Fixture

```bash
# Submit a run via MCP
curl -X POST http://localhost:7891/mcp/v1/call \
  -d '{"jsonrpc":"2.0","id":1,"method":"list_runs","params":{}}'

# Response
# {"jsonrpc":"2.0","id":1,"result":{"runs":[]}}
```

---

### 23. Phase 2 -> Phase 3: devs-webhook -> devs-server

- **Owner:** Phase 2 / devs-webhook
- **Consumers:** Phase 3 / devs-server
- **Contract Type:** Function/Method

#### Specification

devs-server initializes the webhook dispatcher at startup and shuts it down during graceful shutdown:

```rust
// In devs-server startup
let webhook = WebhookDispatcher::new(config.webhooks.clone());
let webhook_handle = webhook.start();

// Pass to scheduler
let scheduler = Scheduler::new(pool, checkpoint, executor, webhook, sched_config);

// On shutdown
webhook_handle.abort();
```

The scheduler sends events to the webhook dispatcher's bounded channel. The dispatcher's background task delivers them asynchronously. See Interface #13.

#### Test Fixture

```rust
// Server startup integration
let config = ServerConfig::load(Some("devs.toml"), &overrides).unwrap();
let webhook = WebhookDispatcher::new(config.webhooks);
let handle = webhook.start();
// Scheduler sends events...
// On shutdown:
handle.abort();
```

---

### 24. Phase 3 -> Phase 4: devs-server -> Bootstrap Validation

- **Owner:** Phase 3 / devs-server
- **Consumers:** Phase 4 / Bootstrap Validation
- **Contract Type:** Configuration + Function/Method

#### Specification

Bootstrap validates three conditions against the running server:

| Condition | Validation Method | Success Criteria |
|-----------|-------------------|------------------|
| COND-001 | TCP connect to `listen_addr` + `mcp_port`; read discovery file | Both ports accept connections; discovery file exists and contains valid `host:port`; `HealthCheck` RPC returns `healthy: true` |
| COND-002 | `devs submit presubmit-check` via devs-cli | Exit code 0; stdout contains valid UUID4 run_id |
| COND-003 | `devs status <run_id>` polled until terminal | Status is `"completed"`; all stages have status `"completed"` |

**Bootstrap execution sequence:**
```bash
# 1. Start server
devs-server --config devs.toml &

# 2. Verify discovery file
cat ~/.config/devs/server.addr  # => 127.0.0.1:7890

# 3. Add project
devs project add /path/to/devs --priority 1

# 4. Submit workflow
RUN_ID=$(devs submit presubmit-check --format json | jq -r '.run_id')

# 5. Wait for completion
devs logs $RUN_ID --follow
devs status $RUN_ID --format json  # => {"status": "completed", ...}
```

**Versioning:** Bootstrap conditions are versioned via PTC schema.

#### Test Fixture

```bash
# COND-001
$ devs status --server 127.0.0.1:7890
# Output: {"healthy": true, "version": "0.1.0", ...}

# COND-002
$ devs submit presubmit-check --name "bootstrap-test" --format json
# Output: {"run_id": "550e8400-e29b-41d4-a716-446655440000"}
# Exit code: 0

# COND-003
$ devs status 550e8400-e29b-41d4-a716-446655440000 --format json
# Output: {"status": "completed", "stages": [{"name": "lint", "status": "completed"}, ...]}
```

---

## Shared Concurrency & State Patterns

These are not standalone interfaces but enforced conventions that all crates must follow:

| Pattern | Specification | Enforced By |
|---------|--------------|-------------|
| Lock acquisition order | project registry -> workflow runs -> pool state -> checkpoint | Code review + `./do lint` |
| Shared mutable state | `Arc<RwLock<T>>` for all shared state | Code review |
| Pool concurrency | `tokio::sync::Semaphore` | devs-pool |
| Webhook dispatch | `tokio::sync::mpsc::channel(256)` bounded | devs-webhook |
| Blocking I/O | `spawn_blocking` for all git2 operations | `./do lint` (forbidden import check) |
| Wire type isolation | Proto types only at serialization boundaries | `./do lint` (cargo tree check) |
| Runtime | Single multi-threaded Tokio runtime | devs-server |

---

## Presubmit & CI Contract

| Interface | Specification | Owner |
|-----------|--------------|-------|
| `./do presubmit` | Exit 0 if all checks pass within 900s | Phase 0 |
| `./do test` | Generates `target/traceability.json` | Phase 0 |
| `./do lint` | Validates PTCs, BOOTSTRAP-STUBs, forbidden imports, cargo tree | Phase 0 |
| `./do coverage` | Enforces QG-001 through QG-005 | Phase 0 |
| `DEVS_DISCOVERY_FILE` | Unique temp path per E2E test for isolation | Phase 0 |
