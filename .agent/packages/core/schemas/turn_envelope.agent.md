---
package: "@devs/core"
module: "schemas/turn_envelope"
type: module-doc
status: active
created: 2026-02-21
requirements: ["TAS-112", "TAS-035"]
---

# schemas/turn_envelope.ts — SAOP Turn Envelope Schema

## Purpose

Defines the `TurnEnvelope` — the strictly-typed container for a single agent
interaction turn in the SAOP (Structured Agent-Orchestrator Protocol). Every
turn an agent produces must be wrapped in this envelope before being persisted
to the SQLite `agent_logs` table or emitted on the event bus.

## Exports

| Symbol               | Kind      | Description                                           |
|----------------------|-----------|-------------------------------------------------------|
| `AgentIdSchema`      | Zod schema | Enum of the four agent role identifiers              |
| `AgentId`            | Type       | `"researcher" \| "architect" \| "developer" \| "reviewer"` |
| `TurnContentSchema`  | Zod schema | Structured thought / action / observation content    |
| `TurnContent`        | Type       | Inferred type from `TurnContentSchema`               |
| `TurnMetadataSchema` | Zod schema | Per-turn telemetry and correlation metadata          |
| `TurnMetadata`       | Type       | Inferred type from `TurnMetadataSchema`              |
| `TurnEnvelopeSchema` | Zod schema | Root envelope wrapping a complete agent turn         |
| `TurnEnvelope`       | Type       | Inferred type from `TurnEnvelopeSchema`              |

## Schema Shape

```typescript
TurnEnvelope {
  turn_index:  number     // Zero-based ordinal; must be integer >= 0
  agent_id:    AgentId    // The producing agent
  role:        AgentId    // The role the agent is playing this turn
  content: {
    thought:     string   // Internal reasoning / chain-of-thought
    action:      string   // Planned actions for this turn
    observation: string   // Results observed from previous turn's tools
  }
  metadata: {
    version:              "1.0.0"              // Literal; schema version
    task_id:              string               // SQLite tasks correlation ID
    timestamp:            string               // ISO 8601 UTC
    confidence:           number               // [0.0, 1.0]
    estimated_complexity: "low"|"medium"|"high"
  }
}
```

## Design Notes

- `agent_id` and `role` both use the same `AgentIdSchema` enum. They are
  distinct fields to allow future support for agents adopting temporary
  perspectives (e.g., a developer performing a self-review as `role: reviewer`).
- `turn_index` is persisted to SQLite and enables deterministic turn ordering
  even if events arrive out of order.
- `metadata.version` is a literal type (`"1.0.0"`). When the schema evolves
  incompatibly, increment this version and add a migration layer.

## Related Modules

- `schemas/events.ts` — imports `AgentIdSchema` from this module.
- `index.ts` — re-exports all symbols from this module.
