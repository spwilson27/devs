---
module: packages/core/src/persistence/audit_schema.ts
purpose: >
  Audit-specific schema additions for the Glass-Box Observability system.
  Creates the decision_logs table and adds performance indices to agent_logs
  and decision_logs for efficient audit trail queries.
status: stable
requirements: [TAS-046, TAS-059, TAS-001, 3_MCP-MCP-002]
---

# audit_schema.ts

Initializes the audit-specific schema extensions required by the Glass-Box
observability requirements. Must be called AFTER `initializeSchema(db)`.

## Exports

| Symbol | Type | Description |
|--------|------|-------------|
| `AUDIT_TABLES` | `readonly string[]` | Table names added by this module: `['decision_logs']` |
| `AuditTable` | type | Union of AUDIT_TABLES values |
| `initializeAuditSchema` | function | Creates decision_logs + performance indices |

## Tables Created

### decision_logs

Records architectural and implementation decisions made during agent runs.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | |
| task_id | INTEGER | NOT NULL, FK → tasks(id) ON DELETE CASCADE | |
| timestamp | TEXT | NOT NULL DEFAULT (datetime('now')) | ISO-8601 |
| alternative_considered | TEXT | nullable | One or more alternatives |
| reasoning_for_rejection | TEXT | nullable | Why alternatives were rejected |
| selected_option | TEXT | nullable | The chosen approach |

## Indices Created

### On agent_logs (created by schema.ts)
| Index | Column | Purpose |
|-------|--------|---------|
| `idx_agent_logs_task_id` | task_id | Task-scoped audit replay |
| `idx_agent_logs_epic_id` | epic_id | Epic-scoped audit queries |
| `idx_agent_logs_timestamp` | timestamp | Time-range historical queries |

### On decision_logs
| Index | Column | Purpose |
|-------|--------|---------|
| `idx_decision_logs_task_id` | task_id | Task-scoped decision lookup |
| `idx_decision_logs_timestamp` | timestamp | Time-range decision history |

## Prerequisites

`initializeSchema(db)` must be called first because:
- `decision_logs` has an FK to `tasks` (created by schema.ts)
- The agent_logs indices target `agent_logs` (created by schema.ts)

## Usage

```typescript
import { createDatabase } from '@devs/core';
import { initializeSchema } from '@devs/core/persistence/schema.js';
import { initializeAuditSchema } from '@devs/core/persistence/audit_schema.js';

const db = createDatabase({ dbPath: '.devs/state.sqlite' });
initializeSchema(db);         // create 7 core tables
initializeAuditSchema(db);    // create decision_logs + indices
```

## Design Decisions

- **Separate module**: Audit schema is kept separate from core schema to
  allow callers to opt in to the full observability stack independently.
- **decision_logs is nullable-first**: All content columns (alternative_considered,
  reasoning_for_rejection, selected_option) are nullable to allow recording
  partial decisions incrementally.
- **Consistent `db.prepare().run()` for all DDL**: Both table and index DDL
  statements use `db.prepare(ddl).run()`, consistent with `schema.ts`. All
  statements are wrapped in a single `db.transaction()` for atomicity.

## Related Modules

- `schema.ts` — creates the 7 core tables including the updated `agent_logs`
- `state_repository.ts` — `appendAgentLog()` writes to the updated `agent_logs`
- `audit_schemas.test.ts` — comprehensive schema verification tests
