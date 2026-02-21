# .devs/ Directory Access Policy

## Purpose

The `.devs/` directory is the **Flight Recorder** for the `devs` system. It
stores all runtime observability data: task execution traces, agent decision
logs, SQLite state databases, and LanceDB vector indexes.

## Directory Layout (Planned)

```
.devs/
├── .gitignore        # Excludes runtime state from VCS
├── POLICY.md         # This file
├── flight_recorder/  # Task execution event log (SQLite)
├── state/            # Agent task state and checkpoints (SQLite)
├── vectors/          # Semantic memory indexes (LanceDB)
└── traces/           # Structured execution traces (runtime only, gitignored)
```

## Developer Agent Write-Access Policy

**Developer Agents (AI coding agents executing tasks) MUST NOT write to `.devs/`
directly.** Only the following system components have write access:

| Component               | Access    | Reason                                      |
|-------------------------|-----------|---------------------------------------------|
| `@devs/core` runtime    | Read/Write | Primary owner of flight recorder state      |
| `@devs/memory` package  | Read/Write | Manages SQLite and LanceDB persistence      |
| Orchestrator (`run_workflow.py`) | Read/Write | Task state management            |
| Developer Agent         | **None**  | Agents must not tamper with observability   |
| MCP Server              | Read-only | Queries state for AI tool calls             |

**Rationale:** Allowing Developer Agents to write to `.devs/` creates a
tamper risk where an agent could modify its own task history or manipulate
loop-detection counters. All agent observability data must flow exclusively
through the `@devs/core` and `@devs/memory` APIs.

## SQLite Usage

The flight recorder will use SQLite via the `better-sqlite3` package (Node.js,
synchronous API for simplicity). Schema initialization is handled by
`@devs/memory` on first startup.

## LanceDB Usage

Semantic memory (agent context, past decisions) will use LanceDB via the
`vectordb` package. The index directory lives at `.devs/vectors/` and is
gitignored. LanceDB is managed exclusively by `@devs/memory`.
