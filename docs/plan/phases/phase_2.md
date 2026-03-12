# Phase 2: Workflow Engine

## Objective
Implement the core workflow orchestration engine, responsible for DAG scheduling, parallel execution, stage lifecycle management, and outbound notifications. This phase ensures that `devs` can correctly schedule and run complex agentic workflows with dependencies, retries, and timeouts.

## Requirements Covered
- [1_PRD-REQ-004]: Dependency-driven DAG Scheduling
- [1_PRD-REQ-005]: Parallel Stage Execution
- [1_PRD-REQ-006]: Rust Builder API and Declarative formats
- [1_PRD-REQ-011]: Completion signal types (exit, structured, tool)
- [1_PRD-REQ-012]: Data Flow (template, context, directory)
- [2_TAS-REQ-033]: Pool exhaustion state event
- [2_TAS-REQ-045]: Webhook retry with backoff
- [2_TAS-REQ-046]: Webhook payload schema
- [2_TAS-REQ-047]: PoolExhausted event delivery
- [1_PRD-REQ-024]: Parallel Agent Execution (Fan-Out)
- [1_PRD-REQ-025]: Fan-out authoring formats
- [1_PRD-REQ-026]: Fan-out merge mechanisms
- [1_PRD-REQ-027]: Per-stage and Branch retry config
- [1_PRD-REQ-028]: Per-stage and Workflow timeouts
- [1_PRD-REQ-032]: Log retention policy enforcement
- [1_PRD-REQ-034]: Multi-project priority scheduling
- [2_TAS-REQ-091]: Completion signal handler logic
- [2_TAS-REQ-092]: Timeout monitoring and cancellation
- [2_TAS-REQ-093]: Webhook retry logic
- [1_PRD-REQ-036]: Outbound webhook notifications
- [1_PRD-REQ-037]: Webhook configuration and classes
- [2_TAS-REQ-086]: Log retention sweep logic
- [AC-ROAD-P2-001] [AC-ROAD-P2-002] [AC-ROAD-P2-003] [AC-ROAD-P2-004] [AC-ROAD-P2-005] [AC-ROAD-P2-006] [AC-ROAD-P2-007] [AC-ROAD-P2-008] [ROAD-P2-DEP-001]

## Detailed Deliverables & Components
### DAG Scheduler (devs-scheduler)
- Implement a topological sort for workflow DAGs with cycle detection.
- Implement an event-driven scheduler that dispatches `Eligible` stages.
- Implement fan-out orchestration and parallel result merging.

### Stage Lifecycle Management
- Implement stage completion handlers for exit codes, structured output, and MCP tool calls.
- Implement per-stage and workflow-level timeout enforcement.
- Implement automatic and branch-driven retry mechanisms with backoff.

### Multi-Project Scheduling
- Implement scheduling policies (Strict Priority Queue, Weighted Fair Queuing).
- Enforce project-level weights and priorities during agent pool allocation.

### Notifications (devs-webhook)
- Implement an outbound webhook dispatcher with HMAC-SHA256 signing.
- Implement at-least-once delivery with exponential backoff for retries.
- Implement `pool.exhausted` and run/stage lifecycle events.

## Technical Considerations
- **Dispatch Latency:** Ensure DAG dispatch latency remains ≤100 ms to support high-throughput workflows.
- **SSRF Protection:** Implement strict SSRF checks for webhook targets to prevent internal network scanning.
- **State Consistency:** Ensure all scheduler events lead to atomic checkpoint updates to survive crashes.
