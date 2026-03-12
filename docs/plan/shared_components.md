# Shared Components Manifest

## devs-proto
- **Owner:** Phase 0 / Sub-Epic: Project Foundation
- **Consumers:** Phase 3 / Sub-Epic: Server & Client Interfaces (Server, TUI, CLI, MCP Bridge)
- **Description:** Foundational gRPC and Protobuf definitions. This component defines the communication contract between the headless server and all its clients.
- **Key Interfaces:**
  - `devs.proto`: Definitions for `WorkflowService`, `RunService`, `PoolService`, and `LogService`.
  - Generated Rust code for messages like `SubmitRunRequest`, `RunStatus`, `LogLine`.
- **Requirements:** [[2_TAS-REQ-022], [2_TAS-REQ-008], [2_TAS-REQ-009], [2_TAS-REQ-067]]

## devs-core
- **Owner:** Phase 1 / Sub-Epic: Core Domain & Infrastructure
- **Consumers:** Phase 1 (Adapters, Pools), Phase 2 (Scheduler), Phase 3 (Server)
- **Description:** The core business logic and domain types for the `devs` platform. Includes the authoritative state machine for runs/stages and the template variable resolution engine.
- **Key Interfaces:**
  - `StateMachine`: Authoritative transitions for `WorkflowRun` and `StageRun`.
  - `TemplateResolver`: Logic for `{{stage.name.field}}` interpolation with 7-priority levels.
  - Domain types: `RunID`, `StageID`, `BoundedString`, `EnvKey`.
- **Requirements:** [[2_TAS-REQ-023], [2_TAS-REQ-019], [2_TAS-REQ-020], [2_TAS-REQ-028], [2_TAS-REQ-029], [2_TAS-REQ-031]]

## devs-config
- **Owner:** Phase 1 / Sub-Epic: Core Domain & Infrastructure
- **Consumers:** Phase 1 (Pools), Phase 2 (Scheduler), Phase 3 (Server, CLI, TUI)
- **Description:** Configuration parsing and validation for the server and user projects.
- **Key Interfaces:**
  - `ServerConfig`: Parsed `devs.toml` settings.
  - `ProjectRegistry`: Parsed `projects.toml` entries.
  - `WorkflowDefinition`: Parsed and validated YAML/TOML workflow DAGs.
- **Requirements:** [[2_TAS-REQ-024], [1_PRD-REQ-042], [2_TAS-REQ-032]]

## devs-checkpoint
- **Owner:** Phase 1 / Sub-Epic: Core Domain & Infrastructure
- **Consumers:** Phase 2 (Scheduler), Phase 3 (Server)
- **Description:** Git-backed state persistence for workflow checkpoints and log retention.
- **Key Interfaces:**
  - `CheckpointStore`: Atomic writes of `checkpoint.json` to the project's state branch.
  - `Snapshotter`: Logic for capturing the workflow definition at run start.
- **Requirements:** [[1_PRD-REQ-029], [2_TAS-REQ-017], [2_TAS-REQ-018], [2_TAS-REQ-087]]

## devs-pool
- **Owner:** Phase 1 / Sub-Epic: Core Domain & Infrastructure
- **Consumers:** Phase 2 (Scheduler), Phase 3 (Server)
- **Description:** Management of named agent pools, capability-based routing, and concurrency enforcement.
- **Key Interfaces:**
  - `AgentPool`: Methods for acquiring and releasing agent slots.
  - `Router`: Logic for selecting the best agent based on capability tags and fallback order.
- **Requirements:** [[1_PRD-REQ-019], [1_PRD-REQ-020], [1_PRD-REQ-021], [1_PRD-REQ-033]]

## devs-adapters
- **Owner:** Phase 1 / Sub-Epic: Core Domain & Infrastructure
- **Consumers:** Phase 1 (Pools), Phase 2 (Scheduler)
- **Description:** Extensible adapter layer for invoking agent CLIs (Claude, Gemini, etc.).
- **Key Interfaces:**
  - `AgentAdapter` Trait: Standard interface for `spawn`, `signal`, and `wait`.
  - PTY support: Logic for running agents in interactive terminals.
- **Requirements:** [[1_PRD-REQ-013], [1_PRD-REQ-014], [2_TAS-REQ-034], [1_PRD-REQ-016]]

## devs-executor
- **Owner:** Phase 1 / Sub-Epic: Core Domain & Infrastructure
- **Consumers:** Phase 2 (Scheduler)
- **Description:** Management of execution environments where agent stages run (TempDir, Docker, SSH).
- **Key Interfaces:**
  - `StageExecutor` Trait: Interface for `setup_env`, `run_stage`, and `collect_artifacts`.
- **Requirements:** [[1_PRD-REQ-022], [2_TAS-REQ-040], [1_PRD-REQ-023]]

## devs-scheduler
- **Owner:** Phase 2 / Sub-Epic: Workflow Engine
- **Consumers:** Phase 3 (Server)
- **Description:** Event-driven orchestration engine for DAG scheduling and parallel stage execution.
- **Key Interfaces:**
  - `DagScheduler`: High-performance topological sort and stage dispatch logic.
  - `FanOutManager`: Orchestration of parallel agents within a single stage.
- **Requirements:** [[1_PRD-REQ-004], [1_PRD-REQ-005], [1_PRD-REQ-024], [2_TAS-REQ-092]]

## devs-webhook
- **Owner:** Phase 2 / Sub-Epic: Workflow Engine
- **Consumers:** Phase 3 (Server)
- **Description:** Outbound notification system for run/stage lifecycle events.
- **Key Interfaces:**
  - `WebhookDispatcher`: Signed HTTP delivery with exponential backoff.
- **Requirements:** [[1_PRD-REQ-036], [1_PRD-REQ-037], [2_TAS-REQ-045], [2_TAS-REQ-046]]

## devs-grpc
- **Owner:** Phase 3 / Sub-Epic: Server & Client Interfaces
- **Consumers:** Phase 3 (Server, TUI, CLI, MCP Bridge)
- **Description:** Common gRPC plumbing and client utilities.
- **Key Interfaces:**
  - `ClientChannel`: Auto-discovery and reconnection logic for clients.
  - `ServerDiscovery`: Well-known file management for server address publication.
- **Requirements:** [[1_PRD-REQ-001], [1_PRD-REQ-003]]

## ./do Entrypoint Script
- **Owner:** Phase 0 / Sub-Epic: Project Foundation
- **Consumers:** All Phases / All Sub-Epics
- **Description:** Unified developer interface for all lifecycle tasks (build, test, lint, coverage).
- **Key Interfaces:**
  - CLI commands: `setup`, `build`, `test`, `lint`, `format`, `coverage`, `presubmit`, `ci`.
- **Requirements:** [[1_PRD-REQ-045], [1_PRD-BR-001], [1_PRD-BR-002]]

## Traceability & Verification Infrastructure
- **Owner:** Phase 0 / Sub-Epic: Project Foundation
- **Consumers:** All Phases / All Sub-Epics
- **Description:** Python scripts and configuration for maintaining 100% requirement-to-test traceability.
- **Key Interfaces:**
  - `.tools/verify_requirements.py`: Validates traceability annotations in code.
  - `.tools/ci.py`: Orchestrates CI pipeline steps.
- **Requirements:** [[2_TAS-REQ-079], [2_TAS-REQ-080], [2_TAS-REQ-081]]
