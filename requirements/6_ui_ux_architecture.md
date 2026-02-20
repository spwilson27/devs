# UI/UX Architecture Requirements

### **[UI-ARCH-001]** VSCode Extension Interface
- **Type:** Technical
- **Description:** The primary interface MUST be a VSCode Extension using React 18.3+, Vite 5.x, and `@vscode/webview-ui-toolkit`. It MUST include Mermaid.js for Task DAG visualization and use the VSCode `postMessage` API for communication via a custom JSON-RPC layer.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-002]** CLI Interface
- **Type:** Technical
- **Description:** The CLI MUST be built with Node.js (LTS) using `ink` (v4+) for TUI and `terminal-kit/chalk` for ANSI escape sequence management. It MUST support an Interactive Mode with approval gates and a Headless Mode that outputs NDJSON.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-003]** Interface-Core Decoupling (The "Thin UI" Rule)
- **Type:** Technical
- **Description:** UI layers MUST remain strictly observational. No business logic, agent state transitions, or requirement distillation logic is permitted in the presentation packages. All state transformations MUST occur in `@devs/core`.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-004]** Theme-Aware Styling
- **Type:** UX
- **Description:** The VSCode Extension MUST NOT hardcode colors. It MUST utilize standard VSCode CSS variables (e.g., `--vscode-editor-background`) to ensure legibility across Dark, Light, and High-Contrast themes.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-005]** Sub-Second State Hydration
- **Type:** Non-Functional
- **Description:** The UI MUST be reactive, utilizing a dedicated "Event Stream" (WebSockets in CLI, `postMessage` in VSCode) to reflect underlying SQLite state transitions with sub-second latency.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-020]** Message Throttling
- **Type:** Non-Functional
- **Description:** The UI MUST implement a throttling mechanism (max 60fps) for agent thought streams to prevent blocking the UI main thread or causing input lag.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-021]** Bundle Size Constraints
- **Type:** Non-Functional
- **Description:** The Webview bundle MUST be optimized for load speed. Heavy visualization libraries (Mermaid, D3) SHOULD be lazy-loaded only when the user navigates to the Roadmap or Spec views.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-043]** The Orchestrator Bridge (MCP)
- **Type:** Technical
- **Description:** Interfaces MUST communicate with the `@devs/core` orchestrator via a standardized MCP (Model Context Protocol) Client for request/response, state streaming (STATE_CHANGE events), and error propagation.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-044]** Content Security Policy (CSP)
- **Type:** Security
- **Description:** The VSCode Webview MUST implement a strict CSP: `default-src 'none';`, `script-src 'self' 'unsafe-inline' 'unsafe-eval';`, `style-src 'self' 'unsafe-inline';`, `img-src 'self' data: https:;`.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-045]** Local Resource Loading Security
- **Type:** Security
- **Description:** All project assets and documentation MUST be served via the `vscode-resource` URI scheme. Direct local path access is prohibited.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-046]** TUI Resilience
- **Type:** Non-Functional
- **Description:** The CLI MUST detect terminal capabilities (Unicode support, color depth) and degrade gracefully (e.g., using ASCII Fallbacks if Unicode is unsupported).
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-047]** OS Compatibility
- **Type:** Non-Functional
- **Description:** UI layers MUST be tested and verified on macOS (Darwin), Linux (Ubuntu/Debian), and Windows (Windows 11 / WSL2), with specific attention to font rendering and keybinding parity (Cmd vs Ctrl).
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[COMP-001]** ThoughtStreamer Component
- **Type:** Functional
- **Description:** Renders the agent's internal reasoning (SAOP `reasoning_chain`) in real-time. MUST support incremental streaming without re-rendering the entire block, use distinctive typography, and implement virtual scrolling for >50 turns.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[COMP-002]** DAGCanvas Component
- **Type:** Functional
- **Description:** Visualizes the task Directed Acyclic Graph (DAG). MUST support zoom/pan, node state visualization (PENDING, RUNNING, SUCCESS, FAILED, PAUSED), and a simplified "Level of Detail" mode for >300 nodes.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[COMP-003]** MermaidHost Component
- **Type:** Technical
- **Description:** Safe environment for rendering Mermaid.js diagrams. MUST be rendered within a sandbox (iframe or controlled div), display raw code on error, and sync with VSCode themes.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[COMP-004]** DirectiveWhisperer Component
- **Type:** Functional
- **Description:** Primary channel for User Directives. MUST include context awareness (auto-complete for `@file` and `#requirement`), a priority toggle for "Immediate Pivot", and optimistic state integration.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-034]** Shared Logic Hooks
- **Type:** Technical
- **Description:** UI logic MUST be shared between CLI and VSCode via `@devs/ui-hooks`, including hooks for task status calculation, agent loop detection, and requirement tracing.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-035]** Cross-Platform State
- **Type:** Technical
- **Description:** Core state logic (Task DAG, Agent Logs) MUST be implemented in a platform-agnostic Zustand store consumed by both the Ink TUI and React Webview.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[RISK-UI-201]** Webview Message Bottleneck Mitigation
- **Type:** Technical
- **Description:** High-frequency streaming MUST be mitigated by an internal buffer in `@devs/core` that batches thought chunks every 50ms before sending to the UI.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[RISK-UI-202]** SVG Rendering Overhead Mitigation
- **Type:** Technical
- **Description:** MermaidHost MUST use a `ResizeObserver` to only render diagrams currently in the viewport to prevent UI lag.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[RISK-UI-203]** State Desync Mitigation
- **Type:** Technical
- **Description:** Mandatory use of SQLite WAL mode and file-system watchers on `state.sqlite` to trigger UI refreshes across all interfaces to prevent desync when multiple interfaces are open.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-001]** Tier 0 State: Transient Component State
- **Type:** Technical
- **Description:** Ephemeral state (hovers, toggles) MUST be implemented with React `useState`/`useReducer` and never persisted.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-002]** Tier 1 State: Global UI Layout State
- **Type:** Technical
- **Description:** Volatile layout state (active tab, zoom coordinates) MUST be managed by Zustand (Slices Pattern) and shared across all components.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-003]** Tier 2 State: Synchronized Project Mirror
- **Type:** Technical
- **Description:** Source of truth for project state (tasks, logs) MUST be a normalized Zustand store hydrated via MCP subscriptions, reflecting the SQLite state.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-004]** Tier 3 State: Persistent User Preferences
- **Type:** Technical
- **Description:** Host-level preferences MUST be bridged via VSCode `workspaceState` and `globalState` using `postMessage`.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-005]** Update Batching
- **Type:** Non-Functional
- **Description:** `@devs/core` MUST batch thought chunks every 32ms (targeting 30fps) during high-velocity tasks to prevent saturation of the `postMessage` bridge.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-006]** Selective Reactivity
- **Type:** Non-Functional
- **Description:** Components MUST use selector-based subscriptions to Zustand to only re-render when their specific data changes (e.g., `ThoughtStreamer` only on `active_turn_content` change).
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-007]** Reasoning Log Windowing
- **Type:** Non-Functional
- **Description:** The UI store MUST only maintain the "Full Trace" for the active task. Historical traces MUST be evicted and re-fetched from MCP on-demand.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-008]** Log Chunking
- **Type:** Non-Functional
- **Description:** Observations exceeding 50KB MUST be stored as discrete chunks in the UI. `LogTerminal` MUST only render the last 500 lines by default.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-009]** DAG Level-of-Detail (LOD)
- **Type:** Non-Functional
- **Description:** For projects with >10 Epics, the store MUST calculate a simplified DAG of Epic-level summaries until the user drills down.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-010]** Disconnection Resilience
- **Type:** Non-Functional
- **Description:** If the MCP socket closes, the UI MUST enter a `RECONNECTING` state, disable interactive buttons, and perform a full `sync_all` upon reconnection.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-011]** State Desync Detection
- **Type:** Technical
- **Description:** Every state update MUST include a `sequence_id` or `timestamp`. UI MUST initiate a "Hard Refresh" if it receives an update older than its current state.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-012]** Webview Crash Recovery
- **Type:** Non-Functional
- **Description:** Critical UI state (active view, filters) SHOULD be persisted to `vscode.getState()` every 5 seconds to allow restoration after a reload or crash.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-001]** Router Provider
- **Type:** Technical
- **Description:** A top-level `ViewRouter` MUST conditionally render primary view modules based on the `viewMode` state in Zustand.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-002]** Multi-Pane Architecture
- **Type:** UX
- **Description:** The router MUST support a split-pane layout where the Sidebar remains persistent while the MainViewport transitions between views.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-003]** Extension Host URI Handler
- **Type:** Technical
- **Description:** The Extension MUST register a custom URI scheme (e.g., `vscode://google.gemini-devs/open-task?id=...`) to activate the Webview and focus specific tasks from external links.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-004]** Cross-Document Spec Linking
- **Type:** Technical
- **Description:** Links within generated documents (e.g., `[REQ-001]`) MUST be intercepted by the Webview's Markdown renderer and trigger a `NAVIGATE_TO_SPEC` action.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-005]** Incremental View Unlocking
- **Type:** Functional
- **Description:** Navigation MUST be constrained by project phase (e.g., `SPEC_VIEW` unlocks in Phase 2, `ROADMAP` in Phase 3).
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-006]** Hard Redirects (Gated Autonomy)
- **Type:** UX
- **Description:** If the orchestrator transitions to `WAITING_FOR_APPROVAL`, the UI MUST automatically navigate the user to the relevant view and trigger a notification.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-007]** Virtual History Stack
- **Type:** UX
- **Description:** The UI store MUST maintain a 10-level deep `navigationHistory` for Back/Forward functionality within the Webview header.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-008]** View State Restoration
- **Type:** UX
- **Description:** The router MUST cache transient states (e.g., pan/zoom coordinates) for each view to restore them upon return.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-009]** Session Re-hydration
- **Type:** UX
- **Description:** On every navigation change, the UI MUST call `vscode.setState()` to ensure `viewMode` and `activeTaskId` are restored if the Webview is disposed.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-010]** Active Task Lock
- **Type:** UX
- **Description:** UI MUST show a confirmation warning if the user attempts to navigate away from the `CONSOLE` while a critical HITL gate is active.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-011]** Invalid Context Recovery
- **Type:** Technical
- **Description:** If a `taskId` in the navigation state no longer exists, the router MUST fallback to the `DASHBOARD` and display a "Task Not Found" toast.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-012]** Headless Transition
- **Type:** Technical
- **Description:** In the CLI (Ink), "Routing" MUST be simplified to a linear phase-based progression, ignoring complex navigation parameters.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STYLE-001]** Tailwind CSS with Shadow DOM Isolation
- **Type:** Technical
- **Description:** Tailwind MUST use a unique prefix (e.g., `devs-`) and `important` selector to prevent collisions. JIT compilation MUST be used to keep CSS under 50KB.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STYLE-002]** VSCode Theme Variable Mapping
- **Type:** UX
- **Description:** All colors MUST reference `vscode-webview-ui-toolkit` tokens or native VSCode variables. Custom variables (e.g., `--devs-thought-bg`) MUST be derived via `color-mix()`.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STYLE-003]** TUI Styling (Ink & Chalk)
- **Type:** Technical
- **Description:** The CLI MUST use a semantic color mapper for ANSI codes and detect terminal background color to select between Dark and Light ANSI themes.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ASSET-001]** VSCode Codicons (Iconography)
- **Type:** UX
- **Description:** Icons MUST use `@vscode/codicons` via font-injection. Custom icons MUST be SVGs injected via an `IconSprite` to avoid external HTTP fetches.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ASSET-002]** Local Resource Loading (URI Scheme)
- **Type:** Security
- **Description:** All assets MUST be loaded using `webview.asWebviewUri()`. The Extension Host MUST resolve these to `vscode-resource://` URIs.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ASSET-003]** Vector-First Visualization Pipeline
- **Type:** Technical
- **Description:** Diagrams MUST be rendered client-side as SVGs. HTML5 Canvas (`d3-canvas`) MAY be used for >500 nodes in the Task DAG. SVGs MUST use `currentColor` or CSS variables for theme resilience.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-TYPO-001]** Font Stack Hierarchy
- **Type:** UX
- **Description:** UI elements MUST inherit VSCode's workbench font. Agent Reasoning MUST use a serif stack with 1.6 line-height. Terminal logs MUST inherit the user's editor font.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-TYPO-002]** Syntax Highlighting
- **Type:** UX
- **Description:** Syntax highlighting MUST use `shiki` or a Prism-based highlighter and dynamically match the active VSCode color theme.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-PERF-019]** Asset Lazy Loading
- **Type:** Non-Functional
- **Description:** Heavy binary assets (e.g., Mermaid.js sub-modules) MUST be lazy-loaded using dynamic imports.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-PERF-020]** Image Redaction
- **Type:** Security
- **Description:** Scraped images MUST be proxied through a local "Sanitation Buffer" to prevent CSP violations or IP leaks.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-PERF-021]** TUI ASCII Fallbacks
- **Type:** Non-Functional
- **Description:** If Unicode is unsupported, the CLI MUST automatically swap Codicons for ASCII equivalents (e.g., `[+]` instead of ``).
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-024]** Streaming Thought Protocol
- **Type:** Functional
- **Description:** The `ThoughtStream` component MUST support incremental rendering of Markdown as received from the SAOP stream.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-025]** Semantic Differentiators
- **Type:** UX
- **Description:** Thoughts MUST be serif/italicized. Actions MUST be rendered as "Action Cards" with collapsed code blocks. Observations MUST be in terminal-themed blocks with redaction markers.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-026]** Chain-of-Thought Visualization
- **Type:** UX
- **Description:** The UI MUST visually link tool calls back to the reasoning block that initiated them using vertical lines or indentation.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-027]** Temporal Navigation
- **Type:** UX
- **Description:** A scrollable vertical timeline MUST allow users to jump back to previous turns within the current task.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-028]** State Delta Highlighting
- **Type:** Functional
- **Description:** The UI MUST offer a "Diff View" showing which files were modified by an implementation turn upon completion.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-029]** Spec Sign-off Component
- **Type:** Functional
- **Description:** Specialized view for Phase 2 MUST render PRD and TAS with "Accept/Reject" buttons for individual requirement blocks.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-030]** Roadmap DAG Editor
- **Type:** Functional
- **Description:** Interactive canvas MUST allow dragging to reorder tasks, right-click to delete/merge, and double-click to edit descriptions.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-031]** Global Directive Input
- **Type:** Functional
- **Description:** A persistent text field in the sidebar or console footer MUST be available for user directives.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-032]** Contextual Snippets
- **Type:** Functional
- **Description:** Directive input MUST support `@file` mentions to automatically inject file contents into the context.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-033]** Priority Feedback
- **Type:** UX
- **Description:** UI MUST show visual confirmation (e.g., a "Directive Acknowledged" badge) when an agent acknowledges a directive.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-034]** Log Virtualization
- **Type:** Non-Functional
- **Description:** For tasks with 100+ turns, `ConsoleView` MUST use virtualized rendering (e.g., `react-window`) to prevent DOM bloat.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-035]** Graph Throttling
- **Type:** Non-Functional
- **Description:** The DAG visualization MUST use an internal debouncer for updates during parallel task execution to prevent stuttering.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-036]** Broken Mermaid Handling
- **Type:** Technical
- **Description:** UI MUST catch Mermaid rendering errors and display a "Syntax Error" fallback with a button to view raw markup.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-037]** Massive Log Handling
- **Type:** Non-Functional
- **Description:** Observations >10,000 characters MUST be truncated with a "Read More" button to fetch full logs from SQLite on-demand.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-038]** Disconnected State Overlay
- **Type:** UX
- **Description:** If the MCP connection drops, the UI MUST overlay a "Reconnecting..." modal and disable interactive buttons.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-039]** Screen Reader ARIA-Live
- **Type:** UX
- **Description:** `ThoughtStream` MUST use `aria-live="polite"` to announce new agent thoughts.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-040]** Keyboard Navigation
- **Type:** UX
- **Description:** Every task card and roadmap node MUST be focusable and operable via Keyboard (`Enter`/`Space`).
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-041]** i18n Skeleton
- **Type:** Non-Functional
- **Description:** Use `i18next` for all static UI strings to support dynamic locale switching.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-042]** Theme Contrast Logic
- **Type:** UX
- **Description:** The UI MUST calculate foreground colors for diagrams to ensure WCAG 2.1 AA contrast ratios based on the inherited VSCode theme.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None
