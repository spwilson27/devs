# Interface Contracts

## Overview
- Total interfaces defined: 12
- Shared component interfaces: 8
- Cross-phase boundary interfaces: 4

---

## Shared Component Interfaces

### devs-proto: gRPC Service Contracts
- **Owner:** Phase 0 / Project Foundation
- **Consumers:** Phase 3 / Server & Client Interfaces, Phase 4 / Self-Hosting
- **Contract Type:** Function/Method (gRPC)

#### Specification
Foundational gRPC services for all client-server communication.

**Service: RunService**
- `SubmitRun(SubmitRunRequest) -> WorkflowRun`
- `GetRun(GetRunRequest) -> WorkflowRun`
- `ListRuns(ListRunsRequest) -> ListRunsResponse`
- `CancelRun(CancelRunRequest) -> WorkflowRun`

**Service: LogService**
- `StreamLogs(StreamLogsRequest) -> stream LogChunk`

**Data Types (Protobuf):**
- `WorkflowRun`: Contains `run_id`, `slug`, `status`, `inputs_json`, `snapshot_json`, and `stage_runs`.
- `StageRun`: Contains `stage_run_id`, `status`, `attempt`, `exit_code`.
- `RunStatus`: `PENDING`, `RUNNING`, `PAUSED`, `COMPLETED`, `FAILED`, `CANCELLED`.

#### Test Fixture
**Request (SubmitRun):**
```json
{
  "workflow_name": "build-and-test",
  "project_id": "p1",
  "inputs": { "commit_sha": "abc123" }
}
```
**Response:**
```json
{
  "run_id": "550e8400-e29b-41d4-a716-446655440000",
  "slug": "build-and-test-20260311-x8y2",
  "status": "PENDING"
}
```

---

### devs-core: StateMachine & Domain Types
- **Owner:** Phase 1 / Core Domain
- **Consumers:** Phase 2 / Workflow Engine, Phase 3 / Server
- **Contract Type:** Function/Method (Rust Trait)

#### Specification
Authoritative state transition logic for runs and stages.

**Trait: StateMachine**
```rust
pub trait StateMachine {
    fn transition_run(run: &mut WorkflowRun, event: RunEvent) -> Result<(), TransitionError>;
    fn transition_stage(stage: &mut StageRun, event: StageEvent) -> Result<(), TransitionError>;
    fn is_terminal(status: RunStatus) -> bool;
}
```

**Valid Transitions:**
- `Pending -> Running`
- `Running -> Paused <-> Running`
- `Running -> Completed | Failed | Cancelled`

#### Test Fixture
**Input:** `WorkflowRun` with status `Pending`, `RunEvent::Start`.
**Output:** `Ok(())`, `WorkflowRun` status updated to `Running`.

---

### devs-config: Configuration Schemas
- **Owner:** Phase 1 / Core Domain
- **Consumers:** Phase 3 / Server, Phase 2 / Workflow Engine
- **Contract Type:** Configuration (TOML)

#### Specification
**Schema: ServerConfig (`devs.toml`)**
- `listen_addr`: String (IP:Port)
- `mcp_port`: u16
- `default_pool`: String
- `storage`: Table { `checkpoint_branch`: String, `retention_days`: u32 }

**Schema: ProjectRegistry (`projects.toml`)**
- `[[project]]`:
  - `id`: UUID
  - `path`: PathBuf
  - `priority`: u8 (1-10)

#### Test Fixture
```toml
[server]
listen_addr = "127.0.0.1:50051"
mcp_port = 8080

[[project]]
id = "550e8400-e29b-41d4-a716-446655440001"
path = "/home/user/repo"
priority = 5
```

---

### devs-checkpoint: Persistence Schema
- **Owner:** Phase 1 / Core Domain
- **Consumers:** Phase 2 / Workflow Engine, Phase 3 / Server (Recovery)
- **Contract Type:** Data Schema (JSON)

#### Specification
**Entity: `checkpoint.json`**
- `schema_version`: Integer (Fixed: 1)
- `written_at`: ISO8601 Timestamp
- `run`: `WorkflowRun` (as defined in `devs-proto`)
- `logs`: Map<StageName, Map<Attempt, { stdout_base64: String, stderr_base64: String }>>

#### Test Fixture
```json
{
  "schema_version": 1,
  "written_at": "2026-03-11T10:00:00Z",
  "run": {
    "run_id": "uuid",
    "status": "RUNNING",
    "stage_runs": []
  }
}
```

---

### devs-adapters: AgentAdapter Trait
- **Owner:** Phase 1 / Core Domain
- **Consumers:** Phase 1 / Core Domain (Pools), Phase 2 / Workflow Engine
- **Contract Type:** Function/Method (Rust Trait)

#### Specification
Standardized interface for invoking external AI agent CLIs.

**Trait: AgentAdapter**
```rust
#[async_trait]
pub trait AgentAdapter: Send + Sync {
    async fn spawn(&self, req: SpawnRequest) -> Result<Box<dyn AgentProcess>, AdapterError>;
    fn capabilities(&self) -> Vec<Capability>;
    fn passive_rate_limit_check(&self, exit_code: i32, stderr: &str) -> bool;
}
```

#### Test Fixture
**Input:** `SpawnRequest` with prompt "Hello", PTY=true.
**Output:** `Ok(AgentProcess)` that Believes it is in a TTY.

---

### devs-executor: StageExecutor Trait
- **Owner:** Phase 1 / Core Domain
- **Consumers:** Phase 2 / Workflow Engine
- **Contract Type:** Function/Method (Rust Trait)

#### Specification
Abstracts the execution environment (Local, Docker, SSH).

**Trait: StageExecutor**
```rust
#[async_trait]
pub trait StageExecutor: Send + Sync {
    async fn prepare(&self, project_path: &Path) -> Result<WorkingDirectory, ExecutorError>;
    async fn execute(&self, cmd: Command, env: EnvVars) -> Result<ExitStatus, ExecutorError>;
    async fn collect_artifacts(&self) -> Result<Vec<Artifact>, ExecutorError>;
    async fn cleanup(&self) -> Result<(), ExecutorError>;
}
```

#### Test Fixture
**Call:** `prepare("/tmp/repo")`.
**Verification:** Directory created, `.git` cloned, `.devs_context.json` written.

---

### devs-webhook: Notification Dispatcher
- **Owner:** Phase 2 / Workflow Engine
- **Consumers:** Phase 2 / Workflow Engine (Scheduler)
- **Contract Type:** Event/Message (Webhook HTTP/JSON)

#### Specification
**Delivery:** At-least-once, 5s fixed backoff, 10s timeout.
**Auth:** HMAC-SHA256 signature in `X-Devs-Signature` header.

**Payload Schema:**
```json
{
  "event": "run.completed",
  "timestamp": "2026-03-11T10:05:00Z",
  "project_id": "uuid",
  "run_id": "uuid",
  "stage_name": null,
  "data": { "status": "COMPLETED" },
  "truncated": false
}
```

#### Test Fixture
**POST /webhook**
**Header:** `X-Devs-Signature: <hmac-sha256>`
**Body:** `{ "event": "pool.exhausted", "data": { "pool_name": "primary" } }`

---

### devs-mcp: Glass-Box Interface
- **Owner:** Phase 3 / Server & Client Interfaces
- **Consumers:** Phase 4 / Agentic Development, External AI Agents
- **Contract Type:** Function/Method (MCP JSON-RPC)

#### Specification
Exposes full internal state and control to AI agents.

**Tool: submit_run**
- Parameters: `workflow_name`, `project_id`, `inputs` (object)
- Returns: `run_id`, `slug`

**Tool: get_stage_output**
- Parameters: `run_id`, `stage_name`, `attempt`
- Returns: `stdout`, `stderr`, `structured`, `exit_code`

#### Test Fixture
**Request:**
```json
{ "method": "get_run", "params": { "run_id": "uuid" } }
```
**Response:**
```json
{ "result": { "run_id": "uuid", "status": "COMPLETED", "stage_runs": [...] }, "error": null }
```

---

## Cross-Phase Boundary Interfaces

### gRPC API: Phase 3 -> Phase 4/5
- **Description:** Boundary between the core server and the client interfaces used for agentic self-hosting.
- **Contract:** See `devs-proto`.

### DAG Events: Phase 2 -> Phase 3
- **Description:** Internal event stream from the scheduler to the gRPC server for real-time updates.
- **Contract Type:** Event/Message (Tokio Broadcast Channel)
- **Payload:** `RunEvent` (Protobuf-compatible struct).

#### Test Fixture
**Message:** `RunEvent { type: "stage.status_changed", stage: { name: "test", status: "RUNNING" } }`

### Adapter Trait: Phase 1 -> Phase 2
- **Description:** Core trait defined in Phase 1, implemented for 5 specific CLI tools in Phase 1, and consumed by the scheduler in Phase 2.
- **Contract:** See `devs-adapters`.

### MCP Observation: Phase 3 -> Phase 4
- **Description:** Glass-Box state exposure used by agents in Phase 4 to perform TDD and self-correction.
- **Contract:** See `devs-mcp`.
