# Phase 1: Core Domain & Infrastructure

## Objective
Implement the core domain logic, persistence, and external tool adapters. This phase covers the foundational business logic for managing workflows, agents, pools, and execution environments, while ensuring all components are unit-tested and isolated.

## Requirements Covered
- [2_TAS-REQ-019]: State machine for Run/Stage
- [2_TAS-REQ-020]: Valid status transitions
- [2_TAS-REQ-017]: Checkpoint JSON structure
- [2_TAS-REQ-018]: Snapshot JSON structure
- [1_PRD-REQ-013]: Five Agent CLI adapters
- [1_PRD-REQ-014]: Extensible adapter layer
- [1_PRD-REQ-019]: Named, ordered Agent Pools
- [1_PRD-REQ-029]: Git-backed checkpoint persistence
- [1_PRD-REQ-042]: TOML Server Configuration
- [2_TAS-REQ-024]: devs-config responsibilities
- [2_TAS-REQ-025]: devs-core StateMachine integration
- [2_TAS-REQ-027]: State mutation atomicity
- [1_PRD-REQ-007]: Typed input parameters and resolution
- [1_PRD-REQ-008]: Run Identification and slugs
- [1_PRD-REQ-009]: Workflow Snapshotting logic
- [1_PRD-REQ-010]: Stage Inputs (Prompts, Env)
- [2_TAS-REQ-030]: RunSlug generation algorithm
- [2_TAS-REQ-032]: Workflow validation error collection
- [2_TAS-REQ-034]: AgentAdapter trait definition
- [2_TAS-REQ-035]: Five adapter default configurations
- [2_TAS-REQ-036]: Rate-limit passive detection
- [2_TAS-REQ-037]: Adapter environment injection
- [2_TAS-REQ-038]: Stdin signal protocol (devs:cancel)
- [2_TAS-REQ-039]: Adapter fatal error handling
- [2_TAS-REQ-040]: StageExecutor trait definition
- [2_TAS-REQ-041]: Executor clone paths
- [2_TAS-REQ-042]: Shallow clone (depth 1) default
- [2_TAS-REQ-043]: Mandatory working directory cleanup
- [2_TAS-REQ-044]: Auto-collect logic (git add/commit/push)
- [2_TAS-REQ-044C]: Execution environment schema
- [1_PRD-REQ-015]: Flag vs File prompt delivery
- [1_PRD-REQ-016]: PTY mode for agent CLIs
- [1_PRD-REQ-017]: Bidirectional mid-run interaction
- [1_PRD-REQ-018]: Passive/Active rate limit detection
- [1_PRD-REQ-021]: Pool Concurrency limits
- [1_PRD-REQ-022]: Local, Docker, and Remote environments
- [1_PRD-REQ-023]: Agent-driven or Auto-collect artifacts
- [1_PRD-REQ-033]: Multi-project shared Agent Pool
- [2_TAS-REQ-087]: checkpoint.json write protocol
- [2_TAS-REQ-088]: TemplateResolver resolution order
- [2_TAS-REQ-089]: .devs_context.json schema
- [2_TAS-REQ-090]: Context file write atomicity
- [1_PRD-REQ-020]: Capability-based pool routing
- [1_PRD-REQ-030]: Checkpoint Branch configuration
- [2_TAS-REQ-073]: Template resolution priority levels
- [2_TAS-REQ-074]: Template cross-stage resolution rules
- [2_TAS-REQ-075]: Template resolution for missing fields
- [2_TAS-REQ-076]: Run slug generation format
- [AC-ROAD-P1-001] [AC-ROAD-P1-002] [AC-ROAD-P1-003] [AC-ROAD-P1-004] [AC-ROAD-P1-005] [AC-ROAD-P1-006] [AC-ROAD-P1-007] [AC-ROAD-P1-008] [AC-ROAD-P1-009] [ROAD-P1-DEP-001]

## Detailed Deliverables & Components
### Core Domain & State (devs-core)
- Implement `StateMachine` for `WorkflowRun` and `StageRun` with authoritative status transitions.
- Implement `TemplateResolver` with 7-priority resolution order and single-pass expansion for security.
- Implement `WorkflowDefinition` validation with multi-error collection.

### Configuration & Persistence (devs-config, devs-checkpoint)
- Implement `devs.toml` and `projects.toml` parsing with default precedence.
- Implement `CheckpointStore` using `git2` for atomic state persistence.
- Implement workflow snapshotting to `.devs/runs/`.

### Agent Adapters & Pools (devs-adapters, devs-pool)
- Implement `AgentAdapter` trait and the 5 MVP adapters (Claude, Gemini, etc.).
- Implement passive rate-limit detection and PTY support.
- Implement `AgentPool` with capability-based routing and concurrency enforcement.

### Execution Environments (devs-executor)
- Implement `StageExecutor` for `LocalTempDir`, `Docker`, and `RemoteSsh`.
- Implement repository cloning, `.devs_context.json` generation, and artifact auto-collection.

## Technical Considerations
- **Concurrency:** Ensure pool semaphores and checkpoint writes are thread-safe and performant.
- **Git Interaction:** Use `git2` for atomic, machine-verifiable state commits rather than shelling out.
- **PTY Handling:** Use `portable_pty` for platform-agnostic terminal emulation.
- **Security:** Sanitize environment variables and validate template substitutions to prevent injection.
