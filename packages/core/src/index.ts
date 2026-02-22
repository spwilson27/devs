// @devs/core — Core orchestration logic entry point.

// Path constants and project-root resolution utilities.
export * from "./constants.js";
export * from "./persistence.js";

// SAOP interaction schemas (TurnEnvelope + Event/EventPayload).
export * from "./schemas/turn_envelope.js";
export * from "./schemas/events.js";

// Database connection factory and singleton (WAL + FK PRAGMAs).
export * from "./persistence/database.js";

// Hardened SQLite connection manager (WAL + 0600 permissions).
export * from "./persistence/SqliteManager.js";

// Orchestration state types and LangGraph channel annotations (TAS-097).
export * from "./orchestration/types.js";

// Git integration: client wrapper, ignore policy, commit message formatting, snapshot strategy, and integrity checks.
export * from "./git/GitClient.js";
export * from "./git/GitIgnoreManager.js";
export * from "./git/CommitMessageGenerator.js";
export * from "./git/SnapshotManager.js";
export * from "./git/GitIntegrityChecker.js";

// Cyclical OrchestrationGraph — nodes, routing, and compiled StateGraph (TAS-103).
export * from "./orchestration/graph.js";

// LangGraph node: task snapshot integration (TAS-054, TAS-055).
export * from "./orchestration/ImplementationNode.js";

// HITL approval gates — approveDesignNode, approveTaskDagNode, routing, and signal types (TAS-078).
export * from "./orchestration/hitl.js";

// LangGraph SQLiteSaver — ACID checkpoint persister for crash recovery (9_ROADMAP-REQ-014).
export * from "./orchestration/SqliteSaver.js";

// Git-Atomic coordinator: binds SQLite task-state updates to git commits atomically.
export * from "./orchestration/GitAtomicManager.js";

// Schema drift detection and reconciliation (8_RISKS-REQ-073).
export * from "./persistence/SchemaReconciler.js";

// Audit schema: decision_logs table + performance indices for Glass-Box observability (TAS-046, TAS-059).
export * from "./persistence/audit_schema.js";

// State machine robustness and error recovery — errorNode, pivotAgentNode, turn budget, entropy detection.
export * from "./orchestration/robustness.js";

// Task-scoped git hash persistence and time-travel rewind lookup (TAS-095, 9_ROADMAP-REQ-015).
export * from "./persistence/TaskRepository.js";

// DecisionLogger: structured API for recording agent architectural decisions (TAS-059).
export * from "./audit/DecisionLogger.js";

// TraceInterceptor: real-time Flight Recorder — captures THOUGHT/ACTION/OBSERVATION to agent_logs (TAS-001, TAS-046, 1_PRD-REQ-PIL-004).
export * from "./audit/TraceInterceptor.js";

// Cross-process EventBus — typed pub/sub over Unix Domain Sockets (2_TAS-REQ-018, 1_PRD-REQ-INT-004).
export * from "./events/types.js";
export * from "./events/EventBus.js";
export * from "./events/SharedEventBus.js";

// Crash recovery engine — deterministic resume from last committed checkpoint.
// Requirements: [1_PRD-REQ-REL-003], [1_PRD-REQ-SYS-002], [1_PRD-REQ-MET-014], [1_PRD-REQ-CON-002]
export * from "./recovery/RecoveryManager.js";

// DAG cycle detection and refinement flow validation (9_ROADMAP-REQ-031, TAS-083).
export * from "./orchestration/DAGValidator.js";
export * from "./git/GitManager.js";
export * from "./orchestration/Orchestrator.js";
export * from "./Orchestrator.js";

// Input ingestion and locality enforcement utilities (phase_1 tasks)
export * from "./InputIngestor.js";
export * from "./LocalityGuard.js";
export * from "./lifecycle/MilestoneService.js";

