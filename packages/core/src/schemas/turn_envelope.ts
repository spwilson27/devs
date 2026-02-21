/**
 * packages/core/src/schemas/turn_envelope.ts
 *
 * Defines the TurnEnvelope — the strictly-typed container for a single
 * agent interaction turn in the SAOP (Structured Agent-Orchestrator Protocol).
 *
 * Every turn an agent produces must be wrapped in this envelope before being
 * persisted to the SQLite `agent_logs` table or emitted on the event bus.
 *
 * Requirements: [TAS-112], [TAS-035]
 */

import { z } from "zod";

// ── Primitive enumerations ────────────────────────────────────────────────────

/**
 * The four agent roles in the devs pipeline.
 * Matches the `agent_id` values in the SAOP header specification (TAS-112).
 */
export const AgentIdSchema = z.enum([
  "researcher",
  "architect",
  "developer",
  "reviewer",
]);

export type AgentId = z.infer<typeof AgentIdSchema>;

// ── Content ───────────────────────────────────────────────────────────────────

/**
 * The structured content of a single agent turn.
 *
 * - `thought`:      The agent's internal reasoning / chain-of-thought for
 *                   this turn (Glass-Box visibility, per TAS-035).
 * - `action`:       The agent's plan or strategy for the current turn.
 * - `observation`:  The results / output observed from the previous turn's
 *                   tool calls.
 */
export const TurnContentSchema = z.object({
  thought: z.string(),
  action: z.string(),
  observation: z.string(),
});

export type TurnContent = z.infer<typeof TurnContentSchema>;

// ── Metadata ──────────────────────────────────────────────────────────────────

/**
 * Per-turn metadata for correlation, ordering, and telemetry.
 *
 * - `version`:               Schema version. Always "1.0.0" for this revision.
 * - `task_id`:               Correlation ID linking this turn to the active
 *                            task row in the SQLite `tasks` table.
 * - `timestamp`:             ISO 8601 UTC timestamp of when the turn was produced.
 * - `confidence`:            Agent's self-assessed certainty [0.0, 1.0].
 * - `estimated_complexity`:  Agent's assessment of the task complexity.
 */
export const TurnMetadataSchema = z.object({
  version: z.literal("1.0.0"),
  task_id: z.string(),
  timestamp: z.string().datetime(),
  confidence: z.number().min(0).max(1),
  estimated_complexity: z.enum(["low", "medium", "high"]),
});

export type TurnMetadata = z.infer<typeof TurnMetadataSchema>;

// ── TurnEnvelope (root) ───────────────────────────────────────────────────────

/**
 * The TurnEnvelope wraps a complete agent interaction turn.
 *
 * Field summary:
 * - `turn_index`:   Zero-based ordinal position of this turn within the
 *                   current task session. Used for ordering in the DB.
 * - `agent_id`:     Identifier of the agent that produced this turn.
 * - `role`:         The role the agent is playing (matches agent_id for
 *                   single-role agents; may differ when an agent adopts a
 *                   temporary perspective, e.g. self-review).
 * - `content`:      The structured reasoning content (thought/action/observation).
 * - `metadata`:     Telemetry and correlation metadata.
 */
export const TurnEnvelopeSchema = z.object({
  turn_index: z.number().int().nonnegative(),
  agent_id: AgentIdSchema,
  role: AgentIdSchema,
  content: TurnContentSchema,
  metadata: TurnMetadataSchema,
});

export type TurnEnvelope = z.infer<typeof TurnEnvelopeSchema>;
