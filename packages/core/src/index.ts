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

// State machine robustness and error recovery — errorNode, pivotAgentNode, turn budget, entropy detection.
export * from "./orchestration/robustness.js";

// Task-scoped git hash persistence and time-travel rewind lookup (TAS-095, 9_ROADMAP-REQ-015).
export * from "./persistence/TaskRepository.js";
