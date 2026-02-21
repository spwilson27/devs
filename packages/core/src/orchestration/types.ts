/**
 * packages/core/src/orchestration/types.ts
 *
 * Defines the complete type system for the devs orchestration engine:
 *
 * 1. Status enumerations — lifecycle states for every entity in the pipeline.
 * 2. Data record interfaces — one per SQLite table; carry all serializable fields.
 * 3. `OrchestratorState` — the full, serializable snapshot of the engine state.
 * 4. `OrchestratorAnnotation` — LangGraph channel definitions for StateGraph.
 * 5. `GraphState` — TypeScript type derived from `OrchestratorAnnotation`.
 * 6. `createInitialState` — factory that returns a blank starting state.
 *
 * Design invariants:
 * - All fields are JSON-serializable (no Dates, functions, or class instances).
 * - The state is self-contained: it carries enough information to resume
 *   execution after a process restart without relying on in-process memory.
 * - Aligns with the SQLite table hierarchy:
 *   `projects` → `documents` / `requirements` / `epics` → `tasks`
 *                → `agent_logs` / `entropy_events`
 * - No `any` types; strict mode enforced (TAS-005).
 *
 * Requirements: [TAS-097], [2_TAS-REQ-016], [9_ROADMAP-PHASE-001]
 */

import { Annotation } from "@langchain/langgraph";
import type {
  AgentId,
  TurnContent,
  TurnMetadata,
} from "../schemas/turn_envelope.js";

// ── Re-export AgentId so orchestration consumers don't need to import schemas ─

export type { AgentId };

// ── Status enumerations ───────────────────────────────────────────────────────

/**
 * Lifecycle status for the top-level project.
 * Maps to the `status` column in the `projects` SQLite table.
 *
 * `"paused_for_approval"` is set when the orchestration pipeline reaches a
 * HITL approval gate and is waiting for a human decision before proceeding.
 */
export type ProjectStatus =
  | "initializing"
  | "researching"
  | "specifying"
  | "planning"
  | "implementing"
  | "completed"
  | "failed"
  | "paused_for_approval";

// ── HITL (Human-in-the-Loop) types ────────────────────────────────────────────

/**
 * Identifies a HITL approval gate in the orchestration pipeline.
 *
 * - `"design_approval"` — gate after PRD/TAS generation, before distillation.
 * - `"dag_approval"`    — gate after requirement distillation, before implementation.
 */
export type HitlGate = "design_approval" | "dag_approval";

/**
 * The approval/rejection signal provided by a human reviewer.
 *
 * Passed as the `resume` value in a LangGraph `Command` to unblock a
 * suspended approval gate node.
 */
export interface HitlApprovalSignal {
  /** Whether the human approved this stage. */
  approved: boolean;
  /** Optional human-readable feedback or revision notes. */
  feedback?: string;
  /** Identity of the approver (CLI user, VSCode user, etc.). */
  approvedBy?: string;
  /** ISO 8601 UTC timestamp of the approval/rejection decision. */
  approvedAt: string;
}

/**
 * A persisted record of a HITL gate decision.
 *
 * Stored in `OrchestratorState.hitlDecisions` for audit trail and routing.
 * Corresponds conceptually to the `agent_logs` / Decision Logs table requirement.
 */
export interface HitlDecisionRecord {
  /** Which approval gate this decision belongs to. */
  gate: HitlGate;
  /** The approval/rejection signal provided by the human reviewer. */
  signal: HitlApprovalSignal;
  /** ISO 8601 UTC timestamp when the decision was recorded in state. */
  decidedAt: string;
}

/**
 * Review / approval status for a generated document.
 * Maps to the `status` column in the `documents` SQLite table.
 */
export type DocumentStatus = "draft" | "approved" | "superseded";

/**
 * Satisfaction status for a distilled requirement.
 * Maps to the `status` column in the `requirements` SQLite table.
 */
export type RequirementStatus = "pending" | "active" | "satisfied" | "blocked";

/**
 * Execution status for an epic (project phase).
 * Maps to the `status` column in the `epics` SQLite table.
 */
export type EpicStatus = "pending" | "active" | "completed" | "failed";

/**
 * Execution status for an atomic task.
 * Maps to the `status` column in the `tasks` SQLite table.
 */
export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "blocked";

// ── Data record interfaces ────────────────────────────────────────────────────

/**
 * High-level project metadata.
 * Corresponds to a row in the `projects` SQLite table.
 */
export interface ProjectConfig {
  /** UUID v4 primary key. */
  projectId: string;
  /** Human-readable project name. */
  name: string;
  /** Short description of the project (from the user's initial brief). */
  description: string;
  /** Current lifecycle status of the project. */
  status: ProjectStatus;
  /** ISO 8601 UTC timestamp of project creation. */
  createdAt: string;
  /** ISO 8601 UTC timestamp of last update. */
  updatedAt: string;
}

/**
 * A generated document (PRD, TAS, MCP Design, etc.).
 * Corresponds to a row in the `documents` SQLite table.
 */
export interface DocumentRecord {
  /** UUID v4 primary key. */
  documentId: string;
  /** FK → projects.project_id */
  projectId: string;
  /** Document type identifier (e.g., "PRD", "TAS", "MCP"). */
  type: string;
  /** Document title. */
  title: string;
  /** Full document content (markdown or structured text). */
  content: string;
  /** Review / approval status. */
  status: DocumentStatus;
  /** Monotonically increasing version counter. */
  version: number;
  /** ISO 8601 UTC creation timestamp. */
  createdAt: string;
  /** ISO 8601 UTC last-updated timestamp. */
  updatedAt: string;
}

/**
 * A single distilled requirement from the planning documents.
 * Corresponds to a row in the `requirements` SQLite table.
 */
export interface RequirementRecord {
  /** UUID v4 primary key. */
  requirementId: string;
  /** FK → projects.project_id */
  projectId: string;
  /** External requirement ID, e.g. "TAS-097" or "1_PRD-REQ-PIL-001". */
  externalId: string;
  /** Human-readable description of the requirement. */
  description: string;
  /** Current satisfaction status. */
  status: RequirementStatus;
  /**
   * IDs of requirements that must be satisfied before this one.
   * Defines the DAG ordering for epic and task generation.
   */
  dependsOn: readonly string[];
}

/**
 * A high-level project epic (phase).
 * Corresponds to a row in the `epics` SQLite table.
 */
export interface EpicRecord {
  /** UUID v4 primary key. */
  epicId: string;
  /** FK → projects.project_id */
  projectId: string;
  /** Epic name (e.g., "Phase 4: LangGraph Core Orchestration Engine"). */
  name: string;
  /** Detailed description of the epic's scope. */
  description: string;
  /** Current execution status. */
  status: EpicStatus;
  /** 1-indexed phase number (1..N). */
  phaseNumber: number;
  /** IDs of requirements this epic satisfies. */
  requirementIds: readonly string[];
}

/**
 * An atomic implementation task within an epic.
 * Corresponds to a row in the `tasks` SQLite table.
 */
export interface TaskRecord {
  /** UUID v4 primary key. */
  taskId: string;
  /** FK → epics.epic_id */
  epicId: string;
  /** Task name (e.g., "Define Orchestration State and Types"). */
  name: string;
  /** Full task description and acceptance criteria. */
  description: string;
  /** Current execution status. */
  status: TaskStatus;
  /** The agent role responsible for implementing this task. */
  agentRole: AgentId;
  /** IDs of tasks that must complete before this one (DAG edges). */
  dependsOn: readonly string[];
  /** Git commit SHA recorded upon successful task completion. Optional. */
  gitHash?: string;
}

/**
 * A single recorded agent interaction turn.
 * Corresponds to a row in the `agent_logs` SQLite table.
 *
 * Embeds `TurnContent` (thought / action / observation) and `TurnMetadata`
 * directly from the SAOP interaction schemas (TAS-112), keeping the two
 * representations in sync.
 */
export interface AgentLogRecord {
  /** UUID v4 primary key. */
  logId: string;
  /** FK → tasks.task_id */
  taskId: string;
  /** Zero-based turn ordinal within the task session. */
  turnIndex: number;
  /** Agent that produced this turn. */
  agentId: AgentId;
  /** Structured reasoning content (thought / action / observation). */
  content: TurnContent;
  /** Per-turn telemetry and correlation metadata. */
  metadata: TurnMetadata;
}

/**
 * A loop-detection entropy record.
 * Corresponds to a row in the `entropy_events` SQLite table.
 *
 * The devs orchestrator hashes agent output on each turn and compares it
 * against recently recorded hashes. Repeated identical outputs indicate
 * a stuck agent loop, triggering an intervention or abort.
 */
export interface EntropyRecord {
  /** SHA-256 hex digest of the agent's output for a given turn. */
  outputHash: string;
  /** ISO 8601 UTC timestamp when this hash was first observed. */
  seenAt: string;
  /** FK → tasks.task_id */
  taskId: string;
  /** Number of consecutive turns that have produced this identical hash. */
  loopCount: number;
}

// ── OrchestratorState ─────────────────────────────────────────────────────────

/**
 * The complete, serializable state of the devs orchestration engine.
 *
 * This is the single source of truth passed between LangGraph nodes.
 * Every field must be JSON-serializable so the state can be checkpointed
 * to SQLite and resumed across process restarts (TAS-097).
 *
 * Field → SQLite table mapping:
 * - `projectConfig`  → `projects`
 * - `documents`      → `documents`
 * - `requirements`   → `requirements`
 * - `epics`          → `epics`
 * - `tasks`          → `tasks`
 * - `agentLogs`      → `agent_logs`   (flushed at turn boundaries)
 * - `entropy`        → `entropy_events`
 */
export interface OrchestratorState {
  /** High-level project metadata. Maps to the `projects` table. */
  projectConfig: ProjectConfig;
  /** All generated documents (PRD, TAS, etc.). Maps to `documents`. */
  documents: readonly DocumentRecord[];
  /** All distilled requirements and their DAG edges. Maps to `requirements`. */
  requirements: readonly RequirementRecord[];
  /** All epics / phases and their execution status. Maps to `epics`. */
  epics: readonly EpicRecord[];
  /** All atomic tasks and their execution status. Maps to `tasks`. */
  tasks: readonly TaskRecord[];
  /**
   * In-memory buffer for the current execution turn's agent log entries.
   * Flushed to the `agent_logs` SQLite table at turn boundaries.
   */
  agentLogs: readonly AgentLogRecord[];
  /**
   * Loop-detection state. Each entry records the SHA-256 hash of an agent's
   * output and how many consecutive turns have produced that same hash.
   * Maps to the `entropy_events` table.
   */
  entropy: readonly EntropyRecord[];
  /** ID of the currently executing epic. `null` when no epic is active. */
  activeEpicId: string | null;
  /** ID of the currently executing task. `null` when no task is active. */
  activeTaskId: string | null;
  /**
   * Overall pipeline status.
   * Mirrors `projectConfig.status` for convenient access in graph nodes
   * without destructuring.
   */
  status: ProjectStatus;
  /**
   * Audit log of all HITL approval/rejection decisions made during this run.
   * Entries are appended by approval gate nodes after each human decision.
   * Corresponds to Decision Logs / `agent_logs` table in the persistence layer.
   */
  hitlDecisions: readonly HitlDecisionRecord[];
  /**
   * The currently active HITL gate awaiting human review.
   * Set to `null` when no approval is pending.
   * Used by external systems (CLI, VSCode) to prompt the user.
   */
  pendingApprovalGate: HitlGate | null;
}

// ── LangGraph channel annotations ─────────────────────────────────────────────

/**
 * LangGraph `Annotation.Root` definition for the orchestrator state.
 *
 * All channels use the default "replace" (last-write-wins) reducer.
 * This is intentional: state mutations are explicit and always produce
 * a complete, consistent new state. The orchestrator owns state transitions
 * through SQLite persistence — LangGraph is used for routing and control
 * flow, not as an append-only log.
 *
 * Usage with StateGraph:
 * ```ts
 * import { StateGraph, START, END } from "@langchain/langgraph";
 * import { OrchestratorAnnotation } from "@devs/core";
 *
 * const graph = new StateGraph(OrchestratorAnnotation)
 *   .addNode("researcher", researcherNode)
 *   .addEdge(START, "researcher")
 *   .addEdge("researcher", END)
 *   .compile();
 * ```
 */
export const OrchestratorAnnotation = Annotation.Root({
  projectConfig: Annotation<ProjectConfig>(),
  documents: Annotation<readonly DocumentRecord[]>(),
  requirements: Annotation<readonly RequirementRecord[]>(),
  epics: Annotation<readonly EpicRecord[]>(),
  tasks: Annotation<readonly TaskRecord[]>(),
  agentLogs: Annotation<readonly AgentLogRecord[]>(),
  entropy: Annotation<readonly EntropyRecord[]>(),
  activeEpicId: Annotation<string | null>(),
  activeTaskId: Annotation<string | null>(),
  status: Annotation<ProjectStatus>(),
  hitlDecisions: Annotation<readonly HitlDecisionRecord[]>(),
  pendingApprovalGate: Annotation<HitlGate | null>(),
});

/**
 * The TypeScript type of the orchestrator's LangGraph graph state.
 *
 * Derived from `OrchestratorAnnotation` — this is the type that all
 * LangGraph node functions receive as their first argument, and what
 * `StateGraph.compile().invoke()` returns.
 *
 * `GraphState` is structurally equivalent to `OrchestratorState`.
 * Both types are exported to allow consumers to use either, depending
 * on context (pure TypeScript vs. LangGraph node functions).
 */
export type GraphState = typeof OrchestratorAnnotation.State;

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Creates a valid initial `OrchestratorState` for a new project.
 *
 * All collection fields are initialized to empty arrays. `activeEpicId` and
 * `activeTaskId` are `null` (no active work yet). The `status` field mirrors
 * `config.status` for convenience.
 *
 * @param config - The project configuration (sourced from the `projects` table).
 * @returns A fresh `OrchestratorState` ready for the first orchestration turn.
 */
export function createInitialState(config: ProjectConfig): OrchestratorState {
  return {
    projectConfig: config,
    documents: [],
    requirements: [],
    epics: [],
    tasks: [],
    agentLogs: [],
    entropy: [],
    activeEpicId: null,
    activeTaskId: null,
    status: config.status,
    hitlDecisions: [],
    pendingApprovalGate: null,
  };
}
