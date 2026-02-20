# Requirements for UI/UX Architecture

### **[6_UI_UX_ARCH-REQ-001]** VSCode Extension (The Visual Glass-Box)
- **Type:** Technical
- **Description:** The primary interface for architectural review and real-time monitoring. Built with React 18.3+ (TypeScript), Vite 5.x, @vscode/webview-ui-toolkit, Mermaid.js (v10+), and VSCode postMessage API.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-002]** CLI (The Automation Engine)
- **Type:** Technical
- **Description:** The interface for "Makers" and CI/CD integration. Built with Node.js (LTS), ink (v4+), terminal-kit / chalk, supporting both Interactive and Headless (NDJSON) modes.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-003]** Interface-Core Decoupling (The "Thin UI" Rule)
- **Type:** Technical
- **Description:** UI layers MUST remain strictly observational. No business logic, agent state transitions, or requirement distillation logic is permitted in the presentation packages.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-004]** Theme-Aware Styling
- **Type:** UX
- **Description:** The VSCode Extension MUST NOT hardcode colors. It MUST utilize the standard VSCode CSS variables to ensure perfect legibility across Dark, Light, and High-Contrast themes.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-005]** Sub-Second State Hydration
- **Type:** Technical
- **Description:** The UI MUST be reactive, utilizing a dedicated "Event Stream" (WebSockets in CLI, postMessage in VSCode) to reflect underlying SQLite state transitions.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-006]** Message Throttling
- **Type:** Technical
- **Description:** The UI MUST implement a throttling mechanism (max 60fps) for agent thought streams to prevent blocking the UI main thread or causing input lag.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-007]** Bundle Size Constraints
- **Type:** Technical
- **Description:** The Webview bundle MUST be optimized for load speed. Heavy visualization libraries (Mermaid, D3) SHOULD be lazy-loaded only when the user navigates to the Roadmap or Spec views.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-008]** The Orchestrator Bridge
- **Type:** Technical
- **Description:** Both interfaces communicate with the @devs/core orchestrator via a standardized MCP (Model Context Protocol) Client.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-009]** Request/Response
- **Type:** Technical
- **Description:** UI triggers tool calls which are forwarded to the OrchestratorServer via MCP.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-008]

### **[6_UI_UX_ARCH-REQ-010]** State Streaming
- **Type:** Technical
- **Description:** The Orchestrator emits STATE_CHANGE events which the UI Context Provider captures to perform partial state refreshes, keeping the UI in sync with the SQLite "Flight Recorder".
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-008]

### **[6_UI_UX_ARCH-REQ-011]** Error Propagation
- **Type:** Technical
- **Description:** All system errors MUST be bubbled up to the UI with original stack traces and "Root Cause" summaries to facilitate human debugging.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-008]

### **[6_UI_UX_ARCH-REQ-012]** Content Security Policy (CSP)
- **Type:** Security
- **Description:** The VSCode Webview MUST implement a strict CSP, and all project assets and documentation MUST be served via the vscode-resource URI scheme.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-013]** TUI Resilience
- **Type:** Technical
- **Description:** The CLI MUST detect terminal capabilities and degrade gracefully using ASCII Fallbacks if Unicode or specific color depths are unsupported.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-002]

### **[6_UI_UX_ARCH-REQ-014]** OS Compatibility
- **Type:** Technical
- **Description:** UI layers MUST be tested and verified on macOS, Linux, and Windows, with attention to font rendering and keybinding parity (Cmd vs Ctrl).
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-015]** ThoughtStreamer (The Glass-Box Heart)
- **Type:** Functional
- **Description:** Component that renders the agent's internal reasoning (SAOP reasoning_chain) in real-time.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-016]** Rendering Logic
- **Type:** Technical
- **Description:** ThoughtStreamer uses react-markdown with remark-gfm and MUST support incremental streaming without full re-renders.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-015]

### **[6_UI_UX_ARCH-REQ-017]** Styling
- **Type:** UX
- **Description:** ThoughtStreamer uses distinctive typography (serif/italic) to separate "Internal Thought" from "External Output".
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-015]

### **[6_UI_UX_ARCH-REQ-018]** Edge Case: Large Reasoning Logs
- **Type:** Technical
- **Description:** ThoughtStreamer MUST implement virtual scrolling for tasks with >50 turns to maintain 60fps performance.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-015]

### **[6_UI_UX_ARCH-REQ-019]** Requirement Mapping
- **Type:** UX
- **Description:** Thoughts mentioning a REQ-ID SHOULD be decorated with a hoverable badge linking back to the PRD.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-015]

### **[6_UI_UX_ARCH-REQ-020]** DAGCanvas (Interactive Roadmap)
- **Type:** Functional
- **Description:** Component that visualizes the 200+ task Directed Acyclic Graph (DAG) generated by the Distiller.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-021]** Engine
- **Type:** Technical
- **Description:** DAGCanvas uses d3-force for layout and react-zoom-pan-pinch for navigation.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-020]

### **[6_UI_UX_ARCH-REQ-022]** Node States
- **Type:** UX
- **Description:** DAGCanvas MUST support PENDING, RUNNING, SUCCESS, FAILED, and PAUSED states with specific visual cues.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-020]

### **[6_UI_UX_ARCH-REQ-023]** Zoom/Pan Interaction
- **Type:** UX
- **Description:** Mandatory for navigating 8-16 Epics in the DAGCanvas.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-020]

### **[6_UI_UX_ARCH-REQ-024]** Focus Interaction
- **Type:** UX
- **Description:** Clicking a node in DAGCanvas focuses the TaskDetailCard and syncs the ConsoleView to that task's history.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-020]

### **[6_UI_UX_ARCH-REQ-025]** Edge Case: Massive Graphs
- **Type:** Technical
- **Description:** If task count > 300, the DAGCanvas MUST switch to a simplified "LOD" mode where labels are hidden until zoomed in.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-020]

### **[6_UI_UX_ARCH-REQ-026]** MermaidHost (Diagram Orchestrator)
- **Type:** Functional
- **Description:** A centralized, safe environment for rendering Mermaid.js diagrams.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-027]** Sandbox
- **Type:** Security
- **Description:** Mermaid MUST be rendered within an internal iframe or strictly controlled div to prevent CSS leakage.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-026]

### **[6_UI_UX_ARCH-REQ-028]** Error Resilience
- **Type:** UX
- **Description:** If Mermaid parsing fails, MermaidHost MUST display the raw code block with a Syntax Error warning and an "Edit" shortcut.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-026]

### **[6_UI_UX_ARCH-REQ-029]** Theme Sync
- **Type:** UX
- **Description:** MermaidHost MUST listen to VSCode theme changes and re-initialize Mermaid with the appropriate configuration.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-026]

### **[6_UI_UX_ARCH-REQ-030]** DirectiveWhisperer (HITL Input)
- **Type:** Functional
- **Description:** The primary channel for "User Whispering" (mid-task directives).
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-031]** Context Awareness
- **Type:** Functional
- **Description:** DirectiveWhisperer supports auto-complete for @file paths and #requirement IDs.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-030]

### **[6_UI_UX_ARCH-REQ-032]** Priority Toggle
- **Type:** Functional
- **Description:** Ability to flag a directive as "Immediate Pivot" in DirectiveWhisperer.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-030]

### **[6_UI_UX_ARCH-REQ-033]** State Integration
- **Type:** Technical
- **Description:** On submit, DirectiveWhisperer triggers the inject_directive MCP tool and optimistically appends the directive to the ThoughtStreamer.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-030]

### **[6_UI_UX_ARCH-REQ-034]** Shared Logic Hooks (@devs/ui-hooks)
- **Type:** Technical
- **Description:** Shared React hooks for task status, entropy monitoring (loop detection), and requirement tracing.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-035]** Cross-Platform State (Zustand Store)
- **Type:** Technical
- **Description:** Core state logic implemented in a platform-agnostic Zustand store consumed by both CLI (Ink) and VSCode (React).
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-036]** Webview Message Bottleneck Mitigation
- **Type:** Technical
- **Description:** Implement an internal buffer in @devs/core that batches thought chunks every 50ms before sending to the UI via postMessage.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-037]** SVG Rendering Overhead Mitigation
- **Type:** Technical
- **Description:** MermaidHost MUST use a ResizeObserver to only render diagrams currently in the viewport.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-026]

### **[6_UI_UX_ARCH-REQ-038]** State Desync Mitigation
- **Type:** Technical
- **Description:** Mandatory use of SQLite WAL mode and file-system watchers on state.sqlite to trigger UI refreshes across all interfaces.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-039]** 3D Visualization / Profiler Trace Handling
- **Type:** Technical
- **Description:** 3D visualizations or complex profiler traces are currently out of scope; use static SVG snapshots within the Webview.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-040]** Tier 0: Transient Component State (Ephemeral)
- **Type:** Technical
- **Description:** Ephemeral component-level state (hover, toggles) using React useState/useReducer; never persisted.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-041]** Tier 1: Global UI Layout State (Volatile)
- **Type:** Technical
- **Description:** Volatile layout state (active tab, zoom/pan) using Zustand; shared across Webview, resets on reload.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-042]** Tier 2: Synchronized Project Mirror (Source of Truth)
- **Type:** Technical
- **Description:** Normalized Zustand store hydrated via MCP subscriptions, reflecting the SQLite state.sqlite database.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-008]

### **[6_UI_UX_ARCH-REQ-043]** Tier 3: Persistent User Preferences (Host-Level)
- **Type:** Technical
- **Description:** Host-level persistent preferences (theme, directive history) using VSCode workspaceState/globalState.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-044]** Update Batching (60FPS Rule)
- **Type:** Technical
- **Description:** The @devs/core orchestrator MUST batch thought chunks every 32ms (targeting 30fps) during high-velocity tasks to prevent bridge saturation.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-045]** Selective Reactivity
- **Type:** Technical
- **Description:** ThoughtStreamer uses selector-based subscriptions to Zustand to only re-render when its specific task_id content changes.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-015], [6_UI_UX_ARCH-REQ-035]

### **[6_UI_UX_ARCH-REQ-046]** Reasoning Log Windowing
- **Type:** Technical
- **Description:** The UI store only maintains the "Full Trace" for the activeTaskId; historical traces are evicted and re-fetched via MCP on-demand.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-047]** Log Chunking
- **Type:** Technical
- **Description:** Observations exceeding 50KB are stored as discrete chunks in the UI; LogTerminal renders last 500 lines by default with infinite scroll.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-048]** DAG Level-of-Detail (LOD)
- **Type:** Technical
- **Description:** For projects with >10 Epics, the Zustand store calculates a simplified DAG of Epic-level summaries; full DAG is computed only on drill-down.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-020]

### **[6_UI_UX_ARCH-REQ-049]** Disconnection Resilience
- **Type:** Technical
- **Description:** If MCP socket closes, UI enters RECONNECTING state, disables interactive buttons, and reconciles state via sync_all upon reconnection.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-008]

### **[6_UI_UX_ARCH-REQ-050]** State Desync Detection
- **Type:** Technical
- **Description:** Every state update includes a sequence_id/timestamp; UI initiates "Hard Refresh" if it receives an older sequence update.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-051]** Webview Crash Recovery
- **Type:** Technical
- **Description:** Critical UI state (active view, filters) MUST be persisted to vscode.getState() every 5 seconds to allow restoration after a crash or reload.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-052]** Router Provider
- **Type:** Technical
- **Description:** Top-level ViewRouter component that conditionally renders primary view modules based on the viewMode state.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-053]** Multi-Pane Architecture
- **Type:** UX
- **Description:** Support for a split-pane layout where Sidebar remains persistent while MainViewport transitions between views.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-054]** DASHBOARD View
- **Type:** Functional
- **Description:** Always available project overview view.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-055]** RESEARCH_VIEW
- **Type:** Functional
- **Description:** View for research reports, accessible once Phase 1 is active or completed.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-056]** SPEC_VIEW
- **Type:** Functional
- **Description:** View for PRD/TAS preview and requirement approval, accessible once Phase 2 is active or completed.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-057]** ROADMAP View
- **Type:** Functional
- **Description:** View for task DAG visualization, accessible once Phase 3 is completed.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-058]** CONSOLE View
- **Type:** Functional
- **Description:** View for agent thought stream and implementation, accessible once Phase 4 is active.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-059]** SETTINGS View
- **Type:** Functional
- **Description:** Always available settings view.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-060]** Extension Host URI Handler
- **Type:** Technical
- **Description:** Register a custom URI scheme (vscode://google.gemini-devs/open-task?id=...) to deep-link into specific tasks from external files.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-061]** Cross-Document Spec Linking
- **Type:** Technical
- **Description:** Links within generated documents (e.g., REQ-ID) MUST trigger NAVIGATE_TO_SPEC in the Webview instead of opening an external browser.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-062]** Incremental View Unlocking
- **Type:** Functional
- **Description:** Navigation is strictly constrained by the current project phase; views unlock as the project progresses through phases.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-063]** Hard Redirects (Gated Autonomy)
- **Type:** Functional
- **Description:** UI MUST automatically navigate the user to relevant views (e.g., SPEC_VIEW) when the orchestrator is WAITING_FOR_APPROVAL.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-064]** Virtual History Stack
- **Type:** Technical
- **Description:** The UI store maintains a 10-level deep navigationHistory array for Back/Forward functionality within the Webview.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-065]** View State Restoration
- **Type:** UX
- **Description:** The router MUST cache transient states (e.g., pan/zoom) for each view and restore them when returning to the view.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-052]

### **[6_UI_UX_ARCH-REQ-066]** Session Re-hydration
- **Type:** Technical
- **Description:** UI MUST call vscode.setState() on every navigation change to restore viewMode and activeTaskId if the Webview is disposed.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-067]** Active Task Lock
- **Type:** UX
- **Description:** Show confirmation warning if user attempts to navigate away from CONSOLE during a high-priority "Human-in-the-Loop" gate.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-068]** Invalid Context Recovery
- **Type:** Technical
- **Description:** Router MUST fallback to DASHBOARD and show a "Task Not Found" toast if a taskId no longer exists.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-069]** Headless Transition (CLI)
- **Type:** Technical
- **Description:** The CLI ignores complex navigation parameters and focuses on the current active task or phase gate.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-002]

### **[6_UI_UX_ARCH-REQ-070]** Tailwind CSS with Shadow DOM Isolation
- **Type:** Technical
- **Description:** Use prefixed Tailwind with Shadow DOM to prevent style collisions with VSCode or other extensions.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-071]** VSCode Theme Variable Mapping
- **Type:** UX
- **Description:** Mandatory use of vscode-webview-ui-toolkit tokens or native VSCode variables; no hardcoded hex codes.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-072]** TUI Styling (Ink & Chalk)
- **Type:** Technical
- **Description:** CLI uses a semantic color mapper for ANSI codes and detects terminal background for theme selection.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-002]

### **[6_UI_UX_ARCH-REQ-073]** VSCode Codicons (Iconography)
- **Type:** UX
- **Description:** Use @vscode/codicons for standard icons to support theme-driven color inheritance.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-074]** Local Resource Loading (URI Scheme)
- **Type:** Security
- **Description:** All assets MUST be loaded using webview.asWebviewUri() and resolved to vscode-resource:// URIs.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-012]

### **[6_UI_UX_ARCH-REQ-075]** Vector-First Visualization Pipeline
- **Type:** Technical
- **Description:** Diagrams are rendered client-side to SVG; high-density DAG may use HTML5 Canvas fallback for performance.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-076]** Font Stack Hierarchy
- **Type:** UX
- **Description:** UI inherits VSCode workbench font; agent thoughts use serif font; terminal/code logs inherit user's editor font.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-077]** Syntax Highlighting (Glass-Box Logs)
- **Type:** Technical
- **Description:** Integration of shiki or Prism for syntax highlighting that matches the active VSCode color theme.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-078]** Asset Lazy Loading
- **Type:** Technical
- **Description:** Heavy binary assets (e.g., Mermaid sub-modules) MUST be lazy-loaded using dynamic imports.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-079]** Image Redaction
- **Type:** Security
- **Description:** Scraped images MUST be proxied through a local "Sanitation Buffer" to ensure CSP compliance and prevent IP leaks.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-012]

### **[6_UI_UX_ARCH-REQ-080]** TUI ASCII Fallbacks
- **Type:** Technical
- **Description:** CLI MUST automatically swap Codicons for ASCII equivalents if Unicode is not supported.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-013]

### **[6_UI_UX_ARCH-REQ-081]** Custom CSS Handling
- **Type:** Technical
- **Description:** Custom CSS for the generated app is ignored by the 'devs' orchestrator UI; only applied to the generated project's src folder.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-082]** Streaming Thought Protocol
- **Type:** Technical
- **Description:** ThoughtStream component MUST support incremental rendering of Markdown from the SAOP stream.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-015]

### **[6_UI_UX_ARCH-REQ-083]** Semantic Differentiators
- **Type:** UX
- **Description:** Distinct rendering for Thoughts (serif/italic), Actions (Action Cards), and Observations (terminal-themed blocks with redaction).
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-084]** Chain-of-Thought Visualization
- **Type:** UX
- **Description:** UI MUST visually link tool calls back to the reasoning block that initiated them.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-085]** Temporal Navigation
- **Type:** Functional
- **Description:** Vertical timeline allowing users to jump back to previous turns within the current task.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-086]** State Delta Highlighting
- **Type:** UX
- **Description:** Offer a "Diff View" showing exactly which files were modified by an implementation turn.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-087]** Spec Sign-off Component
- **Type:** Functional
- **Description:** Specialized view for Phase 2 that renders PRD and TAS with "Accept/Reject" buttons for requirement blocks.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-056]

### **[6_UI_UX_ARCH-REQ-088]** Roadmap DAG Editor
- **Type:** Functional
- **Description:** Interactive canvas for reordering, deleting, merging, or editing tasks in the Roadmap.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-057]

### **[6_UI_UX_ARCH-REQ-089]** Global Directive Input
- **Type:** Functional
- **Description:** Persistent text field for "User Whispering" in the sidebar or console footer.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-030]

### **[6_UI_UX_ARCH-REQ-090]** Contextual Snippets
- **Type:** Functional
- **Description:** Support for @file mentions in directives to automatically inject file contents.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-089]

### **[6_UI_UX_ARCH-REQ-091]** Priority Feedback
- **Type:** UX
- **Description:** Visual confirmation (badge) when the agent acknowledges a directive in the thought stream.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-089]

### **[6_UI_UX_ARCH-REQ-092]** UI Task DAG Model
- **Type:** Technical
- **Description:** Standardized JSON model for representing the task DAG in the UI.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-093]** SAOP Envelope UI Representation
- **Type:** Technical
- **Description:** Standardized JSON model for representing agent turns (thoughts, actions, observations) in the UI.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-094]** Log Virtualization
- **Type:** Technical
- **Description:** Use virtualized rendering for ConsoleView turns to prevent DOM bloat in long-running tasks.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-058]

### **[6_UI_UX_ARCH-REQ-095]** Graph Throttling
- **Type:** Technical
- **Description:** Internal debouncer for DAG updates during parallel task execution to prevent UI stuttering.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-020]

### **[6_UI_UX_ARCH-REQ-096]** Broken Mermaid Handling
- **Type:** Technical
- **Description:** Catch rendering errors for invalid Mermaid diagrams and display a fallback with raw markup.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-026]

### **[6_UI_UX_ARCH-REQ-097]** Massive Log Handling
- **Type:** Technical
- **Description:** Truncate observations exceeding 10,000 characters and provide "Read More" functionality.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-098]** Disconnected State
- **Type:** UX
- **Description:** Overlay "Reconnecting..." modal and disable interaction if MCP connection drops.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-049]

### **[6_UI_UX_ARCH-REQ-099]** Screen Reader ARIA-Live
- **Type:** UX
- **Description:** Use aria-live="polite" for ThoughtStream to announce new agent thoughts.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-015]

### **[6_UI_UX_ARCH-REQ-100]** Keyboard Navigation
- **Type:** UX
- **Description:** Every task card and roadmap node MUST be focusable and operable via Enter/Space keys.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-101]** i18n Skeleton
- **Type:** Technical
- **Description:** Use i18next for static UI strings to support dynamic locale switching.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-102]** Theme Contrast Logic
- **Type:** UX
- **Description:** Dynamically calculate foreground colors for diagrams to ensure WCAG 2.1 AA contrast ratios across themes.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-004]

### **[6_UI_UX_ARCH-REQ-103]** StatusBadge Primitive
- **Type:** Technical
- **Description:** Custom primitive (React/Ink) that renders task/epic status with standardized colors.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-104]** ActionCard Primitive
- **Type:** Technical
- **Description:** Custom primitive (React/Ink) that displays a single SAOP tool call and its arguments.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-105]** LogTerminal Primitive
- **Type:** Technical
- **Description:** Primitive using xterm.js (React) or monospaced text (Ink) that renders sandbox stdout/stderr with secret masking.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-106]** IconButton Primitive
- **Type:** Technical
- **Description:** Primitive using vscode-webview-ui-toolkit (React) or keybinding shortcuts (Ink) for standardized interactive triggers.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-107]** StepProgress Primitive
- **Type:** Technical
- **Description:** Custom primitive (React/Ink) that visualizes the 5 phases of the 'devs' lifecycle.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None
