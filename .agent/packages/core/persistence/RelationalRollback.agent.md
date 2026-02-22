---
title: RelationalRollback
package: core
module: packages/core/src/persistence/RelationalRollback.ts
description: |
  ACID-safe helper that rewinds relational business tables (agent_logs, tasks,
  requirements) to a LangGraph checkpoint snapshot. Performed inside a single
  SQLite transaction to maintain consistency with filesystem restores.
---
