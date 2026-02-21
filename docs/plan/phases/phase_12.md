# Phase 12: Visibility - Real-time Streaming & Dashboard

## Objective
Implement the real-time event streaming and dashboard visibility features. This phase ensures that the orchestrator's internal state transitions, agent thought streams, and sandbox outputs are visualized with minimal latency. It focuses on the "Observability-Driven Design," providing users with live feedback on epic progress, token expenditure, and system health through sparklines and progress radials.

## Requirements Covered
- [TAS-038]: Real-time Trace & Event Streaming (RTES) bus
- [1_PRD-REQ-MAP-005]: Real-time streaming of LangGraph state
- [TAS-058]: Trace streaming requirement (Agent thoughts to UI)
- [1_PRD-REQ-UI-005]: Live trace streaming (Thoughts/Actions/Obs)
- [1_PRD-REQ-UI-006]: Visual task progress (DAG View)
- [1_PRD-REQ-UI-007]: Tool call interception (Safety Mode)
- [1_PRD-REQ-UI-008]: Global Pause/Resume UI
- [1_PRD-REQ-UI-018]: Transparency and exposure requirement
- [3_MCP-TAS-038]: Real-time trace streaming implementation
- [9_ROADMAP-REQ-036]: Real-time streaming (60FPS benchmark)
- [9_ROADMAP-REQ-037]: State synchronization (0ms desync target)
- [9_ROADMAP-TAS-703]: Implement Agent Console with SAOP streaming
- [5_SECURITY_DESIGN-REQ-SEC-SD-069]: Low-latency event bus (WS/SSE)
- [5_SECURITY_DESIGN-REQ-SEC-SD-071]: HITL block signaling
- [8_RISKS-REQ-036]: Virtualized trace streaming
- [8_RISKS-REQ-038]: High-signal Diff UI implementation
- [8_RISKS-REQ-040]: Staggered review cadence UI
- [4_USER_FEATURES-REQ-069]: Real-time resource gauges (CPU/MEM)
- [4_USER_FEATURES-REQ-070]: API connectivity monitoring indicators
- [4_USER_FEATURES-REQ-085]: Cost transparency dashboard
- [1_PRD-REQ-INT-009]: VSCode Agent Console implementation
- [7_UI_UX_DESIGN-REQ-UI-DES-051]: The Reasoning Pulse (Thinking state)
- [7_UI_UX_DESIGN-REQ-UI-DES-052]: Tool execution micro-animations
- [7_UI_UX_DESIGN-REQ-UI-DES-053]: Gated autonomy attention pulse
- [7_UI_UX_DESIGN-REQ-UI-DES-054]: Directive injection feedback
- [7_UI_UX_DESIGN-REQ-UI-DES-055]: Node interaction & focus states
- [7_UI_UX_DESIGN-REQ-UI-DES-056]: Pan & Zoom inertia (physics)
- [7_UI_UX_DESIGN-REQ-UI-DES-057]: The Distillation Sweep animation
- [7_UI_UX_DESIGN-REQ-UI-DES-058]: State recovery & rewind (Glitch state)
- [7_UI_UX_DESIGN-REQ-UI-DES-059]: Animation guardrails (FPS target)
- [7_UI_UX_DESIGN-REQ-UI-DES-090-1]: Epic progress radial visualization
- [7_UI_UX_DESIGN-REQ-UI-DES-090-2]: Activity feed (Commit list)
- [7_UI_UX_DESIGN-REQ-UI-DES-090-3]: Health telemetry gauges
- [7_UI_UX_DESIGN-REQ-UI-DES-090-4]: Phase stepper visualization
- [7_UI_UX_DESIGN-REQ-UI-DES-091-1]: Tabs: Market, Comp, Tech, User
- [7_UI_UX_DESIGN-REQ-UI-DES-091-2]: Source tooltips & citations
- [7_UI_UX_DESIGN-REQ-UI-DES-091-3]: Decision matrix table
- [7_UI_UX_DESIGN-REQ-UI-DES-092-1]: Dual pane: Markdown vs. Mermaid
- [7_UI_UX_DESIGN-REQ-UI-DES-092-2]: Requirement highlighting (PRD -> TAS)
- [7_UI_UX_DESIGN-REQ-UI-DES-092-3]: Approval checkboxes logic
- [7_UI_UX_DESIGN-REQ-UI-DES-093-1]: Clustering: Task Epic boxes
- [7_UI_UX_DESIGN-REQ-UI-DES-093-2]: Critical path highlighting
- [7_UI_UX_DESIGN-REQ-UI-DES-093-3]: Filtering bar (TaskID/ReqID)
- [7_UI_UX_DESIGN-REQ-UI-DES-093-4]: Task detail card implementation
- [7_UI_UX_DESIGN-REQ-UI-DES-094-1]: Thought stream (Center)
- [7_UI_UX_DESIGN-REQ-UI-DES-094-2]: Tool log (Right sidebar)
- [7_UI_UX_DESIGN-REQ-UI-DES-094-3]: Sandbox terminal (Bottom)
- [7_UI_UX_DESIGN-REQ-UI-DES-111-1]: Flamegraphs implementation
- [7_UI_UX_DESIGN-REQ-UI-DES-111-2]: Heap snapshots implementation
- [7_UI_UX_DESIGN-REQ-UI-DES-123]: Token budget overrun warning
- [7_UI_UX_DESIGN-REQ-UI-DES-130-2]: Introspection highlights (gutter icons)
- [7_UI_UX_DESIGN-REQ-UI-DES-140-1]: Aria-live polite thoughts
- [7_UI_UX_DESIGN-REQ-UI-DES-140-2]: Aria-live assertive success
- [7_UI_UX_DESIGN-REQ-UI-RISK-004]: Animation throttler implementation
- [4_USER_FEATURES-REQ-063]: Visual loop indicators (Orange/Red)
- [9_ROADMAP-SPIKE-004]: Visual requirement mapping spike

## Detailed Deliverables & Components
### Real-time Event Bus (RTES)
- Implement the `EventBus` in `@devs/core` using a publish-subscribe pattern.
- Develop the "Thought Batching Buffer" to prevent bridge saturation during high-frequency updates.
- Build the WebSocket/postMessage bridge for real-time telemetry streaming.

### Agent Console & Trace View
- Build the `AgentConsole` component showing the triad of Thought, Action, and Observation.
- Implement the "Reasoning Pulse" and "Invocation Shimmer" animations.
- Develop the "Temporal Navigation Timeline" allowing users to jump between agent turns.

### Project Dashboard Modules
- Implement the `HealthTelemetry` panel with gauges for Token Spend, Code Coverage, and Pass Rate.
- Build the `EpicProgressRadial` and the `PhaseStepper` navigation indicators.
- Develop the `ActivityFeed` showing the last 10 successful task commits.

### High-Fidelity DAG Visualization
- Implement the interactive `DAGCanvas` with momentum scrolling and inertia.
- Build the "Critical Path Highlighting" and "Dependency Flow" animations.
- Develop "Semantic Zooming" logic that transitions between node details and epic summaries.

## Technical Considerations
- Maintaining 60FPS UI performance during high-frequency log updates from the LLM.
- Implementing efficient "Partial Refreshes" to avoid full React re-renders on character arrivals.
- Ensuring the "Disconnected" mask correctly blurs the UI if the MCP connection drops.
