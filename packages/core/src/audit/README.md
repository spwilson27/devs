# @devs/core/audit — Flight Recorder (Glass-Box Observability)

The `audit/` directory implements the **Flight Recorder** subsystem — the Glass-Box observability layer that makes every agent decision, reasoning step, tool call, and result fully auditable.

## Modules

| Module | Purpose |
|---|---|
| `DecisionLogger` | Records agent architectural decisions (alternatives considered, reasoning, selection) to `decision_logs`. |
| `TraceInterceptor` | Captures and persists THOUGHT / ACTION / OBSERVATION events to `agent_logs` in real time. |

---

## TraceInterceptor — How It Works

The `TraceInterceptor` hooks into the LangGraph node execution flow via the `SharedEventBus`. When an agent produces a thought, initiates a tool call, or receives a tool result, the orchestration node publishes a typed event on the bus. The `TraceInterceptor` intercepts these events and **synchronously** persists them to `state.sqlite` before the LangGraph state transition completes.

### Orchestration Cycle

```
LangGraph node executes
  ↓
Agent produces thought / action / observation
  ↓
Node calls bus.publish("TRACE_THOUGHT" | "TRACE_ACTION" | "TRACE_OBSERVATION", payload)
  ↓
EventBus emits locally (synchronous Node.js EventEmitter dispatch)
  ↓
TraceInterceptor handler is called synchronously
  ↓
persistTrace() → StateRepository.appendAgentLog() → SQLite WAL commit
  ↓
Control returns to LangGraph node (audit log is already committed)
  ↓
LangGraph advances to next state
```

### EventBus Topics

| Topic | When emitted | Persisted as |
|---|---|---|
| `TRACE_THOUGHT` | Agent produces a reasoning step | `content_type = 'THOUGHT'` in `agent_logs` |
| `TRACE_ACTION` | Agent initiates a tool call | `content_type = 'ACTION'` in `agent_logs` |
| `TRACE_OBSERVATION` | Agent receives a tool result | `content_type = 'OBSERVATION'` in `agent_logs` |

All three topics are part of the `EventTopics` registry in `@devs/core/events/types.ts`.

### Content Blob Schema

`agent_logs.content` is always a JSON object. `turn_index` is always the first key:

```json
// THOUGHT
{ "turn_index": 0, "thought": "I need to refactor the auth module." }

// ACTION
{ "turn_index": 0, "tool_name": "read_file", "tool_input": { "path": "src/auth.ts" } }

// OBSERVATION
{ "turn_index": 0, "tool_result": "export function authenticate() {}" }
```

### Minimal Setup

```ts
import {
  createDatabase,
  initializeSchema,
  initializeAuditSchema,
  StateRepository,
  TraceInterceptor,
  SharedEventBus,
  EVENTBUS_SOCKET_NAME,
} from "@devs/core";
import * as path from "node:path";

// 1. Open the Flight Recorder database.
const db = createDatabase();      // opens .devs/state.sqlite with WAL + FK PRAGMAs
initializeSchema(db);             // creates core tables (projects, tasks, agent_logs, ...)
initializeAuditSchema(db);        // adds decision_logs + performance indices

// 2. Create repository and interceptor.
const stateRepo = new StateRepository(db);
const interceptor = new TraceInterceptor(stateRepo);

// 3. Create the EventBus server and subscribe the interceptor.
const socketPath = path.join(".devs", EVENTBUS_SOCKET_NAME);
const bus = await SharedEventBus.createServer(socketPath);
interceptor.subscribe(bus);

// 4. Inside a LangGraph node — publish trace events.
bus.publish("TRACE_THOUGHT", {
  task_id: currentTaskId,
  turn_index: 0,
  agent_role: "developer",
  thought: "I'll start by reading the requirements document.",
  timestamp: new Date().toISOString(),
});

bus.publish("TRACE_ACTION", {
  task_id: currentTaskId,
  turn_index: 0,
  agent_role: "developer",
  tool_name: "read_file",
  tool_input: { path: "docs/plan/requirements.md" },
  timestamp: new Date().toISOString(),
});

bus.publish("TRACE_OBSERVATION", {
  task_id: currentTaskId,
  turn_index: 0,
  agent_role: "developer",
  tool_result: "# Requirements\n...",
  timestamp: new Date().toISOString(),
});
// → Three agent_logs rows are committed synchronously.
```

### Direct Persist (Without EventBus)

```ts
// Useful when there is no bus (e.g. in tests or standalone scripts).
const interceptor = new TraceInterceptor(stateRepo);

const id = interceptor.persistTrace({
  task_id: currentTaskId,
  turn_index: 0,
  agent_role: "developer",
  content_type: "THOUGHT",
  content: { thought: "Analyzing dependency graph." },
});
// id is the agent_logs primary key, or null if the DB was unavailable.
```

---

## DecisionLogger — How It Works

`DecisionLogger` records **why** an agent made a particular architectural choice. When an agent evaluates multiple strategies and rejects some, `DecisionLogger` captures each rejected alternative with the reasoning, enabling future agent turns to query what was previously tried and skip already-rejected approaches.

### Usage

```ts
import { DecisionLogger } from "@devs/core";

// Orchestrator creates one DecisionLogger per task.
const logger = new DecisionLogger(db, currentTaskId);

// Agent evaluates strategies:
logger.logAlternative("Use Redis", "Overkill for our scale; adds ops complexity");
logger.logAlternative("Use Memcached", "No persistence on restart");
logger.confirmSelection("In-memory Map with LRU eviction");

// Future agent turns check prior decisions:
const priorRejections = logger.searchDecisions("Redis");
if (priorRejections.length > 0) {
  // Redis was already rejected — skip re-evaluation.
}
```

---

## Verifying the Audit Trail

After running the orchestration engine, inspect `agent_logs` directly:

```bash
# All traces for task 1, in insertion order:
sqlite3 .devs/state.sqlite \
  "SELECT id, content_type, role, json_extract(content, '$.turn_index') AS turn, content
   FROM agent_logs WHERE task_id = 1 ORDER BY id;"

# All decision logs for task 1:
sqlite3 .devs/state.sqlite \
  "SELECT * FROM decision_logs WHERE task_id = 1 ORDER BY id;"
```

---

## Security

- **Secret masking**: `TraceInterceptor.persistTrace()` applies `maskSensitiveData()` to the content JSON before writing. Bearer tokens, API keys, AWS credentials, and basic-auth URLs are replaced with `[REDACTED]` markers.
- **Access control**: The `agent_logs` and `decision_logs` tables are protected by the `.devs/POLICY.md` access policy — Developer Agents have NO write access to `.devs/` at the filesystem level.
- **ACID writes**: All writes use `StateRepository.appendAgentLog()` which wraps every insert in a `db.transaction()`. Partial log writes are impossible.
