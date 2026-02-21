# Task: Design Native Mobile App Monitoring Architecture Specification (Sub-Epic: 05_Future Roadmap Strategy)

## Covered Requirements
- [9_ROADMAP-FUTURE-004]

## 1. Initial Test Written
- [ ] In `src/api/__tests__/monitoring_api.test.ts`, write unit tests for a `MonitoringAPIRouter`:
  - Test that `GET /api/v1/projects/:projectId/status` returns a `ProjectStatusDTO` with fields: `projectId`, `currentPhase`, `currentTaskId`, `overallProgress` (0–100), `agentStatus` (`'idle' | 'running' | 'paused' | 'error'`), `lastUpdatedAt`.
  - Test that the response schema validates with a Zod `ProjectStatusDTOSchema`.
  - Test that `GET /api/v1/projects/:projectId/events` returns a Server-Sent Events (SSE) stream (Content-Type `text/event-stream`) when the `Accept: text/event-stream` header is present.
  - Test that when `Accept` is not `text/event-stream`, the endpoint returns `406 Not Acceptable` with body `{ error: "This endpoint requires Accept: text/event-stream for SSE." }`.
  - Test that `GET /api/v1/projects/:projectId/logs?limit=50&offset=0` returns a paginated `LogEntryDTO[]` with `total`, `limit`, `offset`, and `entries` fields.
- [ ] In `src/api/__tests__/auth.test.ts`, write tests verifying that all `/api/v1/` routes return `401 Unauthorized` when no `Authorization: Bearer <token>` header is provided.

## 2. Task Implementation
- [ ] Create `src/api/types.ts` with Zod schemas:
  - `ProjectStatusDTOSchema`: `{ projectId: z.string().uuid(), currentPhase: z.string(), currentTaskId: z.string().nullable(), overallProgress: z.number().min(0).max(100), agentStatus: z.enum(['idle','running','paused','error']), lastUpdatedAt: z.string().datetime() }`.
  - `LogEntryDTOSchema`: `{ id: z.string(), timestamp: z.string().datetime(), level: z.enum(['info','warn','error','debug']), message: z.string(), taskId: z.string().nullable() }`.
  - `PaginatedLogsDTOSchema`: `{ total: z.number(), limit: z.number(), offset: z.number(), entries: z.array(LogEntryDTOSchema) }`.
- [ ] Create `src/api/monitoring_router.ts` using Express (or the project's existing HTTP framework):
  - `GET /api/v1/projects/:projectId/status` — queries `StateStore` for current project state, maps to `ProjectStatusDTO`, returns JSON.
  - `GET /api/v1/projects/:projectId/events` — checks `Accept` header; if `text/event-stream`, sets SSE headers and pipes events from an `EventEmitter` (the existing `AgentEventBus` if it exists, or a new stub `ProjectEventBus`); otherwise returns `406`.
  - `GET /api/v1/projects/:projectId/logs` — queries the `logs` table with `limit`/`offset` pagination, returns `PaginatedLogsDTO`.
- [ ] Create `src/api/auth_middleware.ts` implementing Bearer token validation using `process.env.DEVS_API_TOKEN`. Return `401` if missing or invalid. Add JSDoc: `/** Future hook for 9_ROADMAP-FUTURE-004: Native Mobile App auth will extend this to support OAuth2. */`
- [ ] Create `src/api/project_event_bus.ts` as a stub `ProjectEventBus extends EventEmitter` with a `emit(event: ProjectEvent)` method and a note: `/** Stub event bus for 9_ROADMAP-FUTURE-004. Full implementation requires real-time agent lifecycle hooks. */`
- [ ] Register `monitoringRouter` in the main Express app (`src/server.ts` or equivalent).
- [ ] Add `DEVS_API_TOKEN` to `.env.example` with a comment: `# Required for Mobile App monitoring API (9_ROADMAP-FUTURE-004)`.

## 3. Code Review
- [ ] Verify all routes are protected by `authMiddleware` (no unauthenticated access to project data).
- [ ] Verify SSE response sets correct headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`.
- [ ] Verify `GET /status` queries only `StateStore` (no direct DB queries in the route handler).
- [ ] Verify `GET /logs` uses parameterized queries and respects `limit` (max 100) and `offset` bounds.
- [ ] Verify `ProjectEventBus` contains NO real subscription/emission logic that could affect existing agent workflows — it is a stub only.
- [ ] Verify `DEVS_API_TOKEN` is never logged or included in error responses.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/api/__tests__/"` and confirm all tests pass.
- [ ] Run `npm test` to confirm no regressions.

## 5. Update Documentation
- [ ] Create `src/api/api.agent.md` documenting: all three monitoring endpoints (method, path, auth, request params, response schema), the SSE event format, the `authMiddleware` contract, and a `## Future: Native Mobile App (9_ROADMAP-FUTURE-004)` section.
- [ ] Add a `## Future: Native Mobile App Monitoring (9_ROADMAP-FUTURE-004)` section to `docs/FUTURE_ROADMAP.md` covering:
  - The three REST/SSE endpoints already implemented as hooks.
  - The `ProjectEventBus` stub and what agent lifecycle events it will need to emit.
  - Recommended mobile technology (e.g., React Native + Expo) and how it would consume the SSE stream.
  - Auth extension path: current `Bearer <static token>` → future OAuth2/device flow.
  - A Mermaid diagram of the mobile monitoring architecture:
    ```mermaid
    graph LR
      Agent["devs Agent"] -->|emits events| EventBus["ProjectEventBus"]
      EventBus -->|SSE stream| API["GET /api/v1/projects/:id/events"]
      API -->|HTTP SSE| MobileApp["Native Mobile App"]
      MobileApp -->|poll| StatusAPI["GET /api/v1/projects/:id/status"]
    ```

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="src/api/__tests__/" --json --outputFile=test-results/monitoring-api.json` and verify `numFailedTests === 0`.
- [ ] Run `node -e "const app = require('./dist/server'); const http = require('http'); const server = http.createServer(app); server.listen(0, () => { const {port} = server.address(); require('http').get({port, path:'/api/v1/projects/test/status'}, (r) => { process.exit(r.statusCode === 401 ? 0 : 1); }); });"` and confirm exit code `0` (unauthenticated request returns 401).
