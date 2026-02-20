# Requirements for UI/UX Architecture

### **[UI-ARCH-001]** VSCode Extension (The Visual Glass-Box)
- **Type:** Technical
- **Description:** The primary interface for architectural review and real-time monitoring, using React 18.3+, Vite 5.x, @vscode/webview-ui-toolkit, Mermaid.js, and VSCode postMessage API.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-002]** CLI (The Automation Engine)
- **Type:** Technical
- **Description:** The interface for "Makers" and CI/CD integration, using Node.js (LTS), ink (v4+), and supporting both Interactive TUI and Headless JSON modes.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-003]** Interface-Core Decoupling (The "Thin UI" Rule)
- **Type:** Technical
- **Description:** The UI layers MUST remain strictly observational. No business logic, agent state transitions, or requirement distillation logic is permitted in the presentation packages.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-004]** Theme-Aware Styling
- **Type:** UX
- **Description:** The VSCode Extension MUST NOT hardcode colors. It MUST utilize standard VSCode CSS variables to ensure legibility across all themes.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-005]** Sub-Second State Hydration
- **Type:** Technical
- **Description:** The UI MUST be reactive, utilizing a dedicated "Event Stream" (WebSockets in CLI, postMessage in VSCode) to reflect SQLite state transitions.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-020]** Message Throttling
- **Type:** Technical
- **Description:** The UI MUST implement a throttling mechanism (max 60fps) for agent thought streams to prevent blocking the UI main thread.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-021]** Bundle Size Constraints
- **Type:** Technical
- **Description:** The Webview bundle MUST be optimized for load speed. Heavy visualization libraries (Mermaid, D3) SHOULD be lazy-loaded.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-043]** The Orchestrator Bridge
- **Type:** Technical
- **Description:** Both interfaces communicate with the @devs/core orchestrator via a standardized MCP Client.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[REQ-UI-026]** Orchestrator Request/Response
- **Type:** Technical
- **Description:** UI triggers tool calls (e.g., approve_tas) which are forwarded to the OrchestratorServer via MCP.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [UI-ARCH-043]

### **[REQ-UI-027]** Orchestrator State Streaming
- **Type:** Technical
- **Description:** The Orchestrator emits STATE_CHANGE events which the UI captures for partial state refresh, ensuring sync with SQLite.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [UI-ARCH-043]

### **[REQ-UI-028]** Orchestrator Error Propagation
- **Type:** Technical
- **Description:** All system errors MUST be bubbled up to the UI with original stack traces and "Root Cause" summaries.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [UI-ARCH-043]

### **[UI-ARCH-044]** Content Security Policy (CSP)
- **Type:** Security
- **Description:** The VSCode Webview MUST implement a strict CSP, including self-only scripts (with unsafe-inline/eval for Mermaid) and vscode-resource URI scheme for local assets.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[REQ-UI-001]** TUI Resilience
- **Type:** Technical
- **Description:** The CLI MUST detect terminal capabilities (Unicode support, color depth) and degrade gracefully to ASCII Fallbacks if unsupported.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [UI-ARCH-002]

### **[REQ-UI-002]** OS Compatibility
- **Type:** Technical
- **Description:** The UI layers MUST be tested and verified on macOS, Linux, and Windows, with specific attention to font rendering and keybinding parity.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[COMP-001]** ThoughtStreamer
- **Type:** Functional
- **Description:** Renders the agent's internal reasoning (SAOP reasoning_chain) in real-time as it is streamed from the orchestrator.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[REQ-UI-003]** ThoughtStreamer Rendering Logic
- **Type:** Technical
- **Description:** Uses react-markdown with remark-gfm and MUST support incremental streaming without full re-renders to prevent flickering.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [COMP-001]

### **[REQ-UI-004]** ThoughtStreamer Styling
- **Type:** UX
- **Description:** Uses a distinctive typography (e.g., font-serif or italic) to separate "Internal Thought" from "External Output".
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [COMP-001]

### **[REQ-UI-005]** ThoughtStreamer Large Log Handling
- **Type:** Technical
- **Description:** MUST implement virtual scrolling for tasks with >50 turns to maintain 60fps performance.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [COMP-001]

### **[REQ-UI-006]** ThoughtStreamer Requirement Mapping
- **Type:** UX
- **Description:** Thoughts mentioning a REQ-ID SHOULD be decorated with a hoverable badge linking back to the PRD.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [COMP-001]

### **[COMP-002]** DAGCanvas
- **Type:** Functional
- **Description:** Visualizes the 200+ task Directed Acyclic Graph (DAG) generated by the Distiller.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[REQ-UI-007]** DAGCanvas Engine
- **Type:** Technical
- **Description:** Custom implementation using d3-force for layout and react-zoom-pan-pinch for navigation.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [COMP-002]

### **[REQ-UI-008]** DAGCanvas Node States
- **Type:** UX
- **Description:** MUST support PENDING, RUNNING, SUCCESS, FAILED, and PAUSED states with specific visual cues.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [COMP-002]

### **[REQ-UI-009]** DAGCanvas Zoom/Pan Interaction
- **Type:** UX
- **Description:** Mandatory zoom and pan capabilities for navigating 8-16 Epics.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [COMP-002]

### **[REQ-UI-010]** DAGCanvas Focus Interaction
- **Type:** UX
- **Description:** Clicking a node focuses the TaskDetailCard and syncs the ConsoleView to that task's history.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [COMP-002]

### **[REQ-UI-011]** DAGCanvas Massive Graph Handling
- **Type:** Technical
- **Description:** If task count > 300, the canvas MUST switch to a simplified "LOD" mode where labels are hidden until zoomed in.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [COMP-002]

### **[COMP-003]** MermaidHost
- **Type:** Technical
- **Description:** A centralized, safe environment for rendering Mermaid.js diagrams.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[REQ-UI-012]** MermaidHost Sandbox
- **Type:** Security
- **Description:** Mermaid MUST be rendered within an internal iframe or strictly controlled div to prevent CSS leakage.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [COMP-003]

### **[REQ-UI-013]** MermaidHost Error Resilience
- **Type:** UX
- **Description:** MUST display raw code with "Syntax Error" warning and "Edit" shortcut if parsing fails.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [COMP-003]

### **[REQ-UI-014]** MermaidHost Theme Sync
- **Type:** UX
- **Description:** MUST listen to VSCode theme changes and re-initialize Mermaid with appropriate configuration.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [COMP-003]

### **[COMP-004]** DirectiveWhisperer
- **Type:** Functional
- **Description:** The primary channel for "User Whispering" (mid-task directives).
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[REQ-UI-015]** DirectiveWhisperer Context Awareness
- **Type:** UX
- **Description:** Auto-complete for @file paths and #requirement IDs.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [COMP-004]

### **[REQ-UI-016]** DirectiveWhisperer Priority Toggle
- **Type:** Functional
- **Description:** Ability to flag a directive as "Immediate Pivot" to force current agent turn to abort and reflect.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [COMP-004]

### **[REQ-UI-017]** DirectiveWhisperer State Integration
- **Type:** Technical
- **Description:** Triggers inject_directive MCP tool and optimistically appends directive to ThoughtStreamer.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [COMP-004]

### **[UI-ARCH-034]** Shared Logic Hooks (@devs/ui-hooks)
- **Type:** Technical
- **Description:** Shared logic for task status calculation, entropy monitoring, and requirement tracing.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-035]** Cross-Platform State (Zustand Store)
- **Type:** Technical
- **Description:** Platform-agnostic Zustand store for core state logic, consumed by Ink (CLI) and React (VSCode).
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-001]** Tier 0: Transient Component State (Ephemeral)
- **Type:** Technical
- **Description:** Local component state (e.g., hover, toggles) using React useState/useReducer; never persisted.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-002]** Tier 1: Global UI Layout State (Volatile)
- **Type:** Technical
- **Description:** Active tab, sidebar width, zoom/pan coordinates using Zustand (Slices Pattern).
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-003]** Tier 2: Synchronized Project Mirror (Source of Truth)
- **Type:** Technical
- **Description:** Normalized Zustand Store hydrated via MCP Subscriptions, reflecting SQLite state.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-004]** Tier 3: Persistent User Preferences (Host-Level)
- **Type:** Technical
- **Description:** Preferred theme, directive history, toggles; persisted across sessions via VSCode state.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-005]** Update Batching
- **Type:** Technical
- **Description:** Orchestrator MUST batch thought chunks every 32ms to prevent saturating the communication bridge.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-006]** Selective Reactivity
- **Type:** Technical
- **Description:** ThoughtStreamer MUST use selector-based subscriptions to only re-render when its specific content changes.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-007]** Reasoning Log Windowing
- **Type:** Technical
- **Description:** UI store only maintains full trace for activeTaskId; others are fetched on-demand via MCP.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-008]** Log Chunking
- **Type:** Technical
- **Description:** Observations exceeding 50KB are stored as discrete chunks; LogTerminal renders only the last 500 lines by default.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-009]** DAG Level-of-Detail (LOD)
- **Type:** Technical
- **Description:** Store calculates simplified DAG for large projects; full task-level DAG computed only on drill-down.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-010]** Disconnection Resilience
- **Type:** Technical
- **Description:** UI enters RECONNECTING state on MCP socket closure; full sync issued upon reconnection.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-011]** State Desync Detection
- **Type:** Technical
- **Description:** Updates include sequence IDs/timestamps; older sequences trigger a hard refresh.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STATE-012]** Webview Crash Recovery
- **Type:** Technical
- **Description:** Critical UI state persisted to vscode.getState() every 5 seconds for session restoration.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-001]** Router Provider
- **Type:** Technical
- **Description:** Top-level ViewRouter component for state-driven virtual routing in the Webview.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-002]** Multi-Pane Architecture
- **Type:** UX
- **Description:** Persistent Sidebar with a dynamic MainViewport that transitions between specialized views.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[REQ-UI-018]** DASHBOARD View
- **Type:** Functional
- **Description:** Project overview view, always available.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [UI-ROUT-001]

### **[REQ-UI-019]** RESEARCH_VIEW View
- **Type:** Functional
- **Description:** Research report view, available after Phase 1 starts.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [UI-ROUT-001]

### **[REQ-UI-020]** SPEC_VIEW View
- **Type:** Functional
- **Description:** Specification editor/preview view, available after Phase 2 starts.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [UI-ROUT-001]

### **[REQ-UI-021]** ROADMAP View
- **Type:** Functional
- **Description:** Task DAG visualization view, available after Phase 3 completes.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [UI-ROUT-001]

### **[REQ-UI-022]** CONSOLE View
- **Type:** Functional
- **Description:** Agent implementation console view, active during Phase 4.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [UI-ROUT-001]

### **[REQ-UI-023]** SETTINGS View
- **Type:** Functional
- **Description:** Project settings view, always available.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [UI-ROUT-001]

### **[UI-ROUT-003]** Extension Host URI Handler
- **Type:** Technical
- **Description:** Custom URI scheme support for deep-linking to specific tasks or views from external sources.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-004]** Cross-Document Spec Linking
- **Type:** UX
- **Description:** Links within documents (e.g., REQ-IDs) MUST be intercepted to trigger internal navigation.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[REQ-001]** Example Requirement
- **Type:** Technical
- **Description:** Placeholder for example requirement referenced in UI-ROUT-004.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-005]** Incremental View Unlocking
- **Type:** UX
- **Description:** Access to specific views is gated by the current project phase progress.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-006]** Hard Redirects (Gated Autonomy)
- **Type:** UX
- **Description:** UI MUST automatically navigate to relevant views when waiting for user approval.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-007]** Virtual History Stack
- **Type:** UX
- **Description:** 10-level deep navigation history for Back/Forward functionality in the Webview.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-008]** View State Restoration
- **Type:** UX
- **Description:** Router MUST cache transient view states (e.g., zoom/pan) when navigating between views.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-009]** Session Re-hydration
- **Type:** Technical
- **Description:** Current view and task context MUST be persisted to vscode.setState() for restoration on reopen.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-010]** Active Task Lock
- **Type:** UX
- **Description:** Confirmation warning required when navigating away from CONSOLE during a critical HITL gate.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-011]** Invalid Context Recovery
- **Type:** Technical
- **Description:** Router MUST fallback to DASHBOARD if a non-existent taskId is provided in navigation.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ROUT-012]** Headless Transition (CLI)
- **Type:** Technical
- **Description:** CLI routing is simplified to linear phase progression, ignoring complex navigation parameters.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STYLE-001]** Tailwind CSS with Shadow DOM Isolation
- **Type:** Technical
- **Description:** Use of Tailwind with unique prefixing and JIT engine for isolated, optimized styling in Webview.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STYLE-002]** VSCode Theme Variable Mapping
- **Type:** UX
- **Description:** Mandatory use of VSCode CSS variables and toolkit tokens; no hardcoded hex codes.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-STYLE-003]** TUI Styling (Ink & Chalk)
- **Type:** UX
- **Description:** Semantic color mapper for CLI; layout props MUST mirror Tailwind spacing scales.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ASSET-001]** VSCode Codicons (Iconography)
- **Type:** UX
- **Description:** Use of @vscode/codicons with standard class patterns for theme-driven color inheritance.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ASSET-002]** Local Resource Loading (URI Scheme)
- **Type:** Security
- **Description:** All assets MUST be loaded via webview.asWebviewUri() and resolved to vscode-resource://.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ASSET-003]** Vector-First Visualization Pipeline
- **Type:** Technical
- **Description:** Mermaid diagrams rendered client-side; use of HTML5 Canvas for high-density DAGs.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-TYPO-001]** Font Stack Hierarchy
- **Type:** UX
- **Description:** UI elements inherit workbench font; reasoning uses serif stack; logs inherit editor font.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-TYPO-002]** Syntax Highlighting
- **Type:** UX
- **Description:** Integration of shiki/Prism for logs, dynamically matching active VSCode color theme.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-PERF-019]** Asset Lazy Loading
- **Type:** Technical
- **Description:** Heavy assets (e.g., Mermaid modules) MUST be lazy-loaded using dynamic imports.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-PERF-020]** Image Redaction
- **Type:** Security
- **Description:** Scraped images MUST be proxied through a local buffer to ensure CSP compliance and IP privacy.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-PERF-021]** TUI ASCII Fallbacks
- **Type:** UX
- **Description:** Automatic swap of Codicons for ASCII equivalents if Unicode is not supported.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UNKNOWN-STYLE-001]** Custom CSS Handling
- **Type:** Technical
- **Description:** Current scope ignores custom CSS for the orchestrator UI; it is only applied to generated projects.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-024]** Streaming Thought Protocol
- **Type:** Technical
- **Description:** ThoughtStream component MUST support incremental rendering of Markdown from SAOP stream.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-025]** Semantic Differentiators
- **Type:** UX
- **Description:** Distinct visual styles for Thoughts (serif/italic), Actions (cards), and Observations (monospaced terminal).
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-026]** Chain-of-Thought Visualization
- **Type:** UX
- **Description:** MUST visually link tool calls back to the reasoning block that initiated them.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-027]** Temporal Navigation
- **Type:** UX
- **Description:** Scrollable vertical timeline for jumping back to previous turns within the current task.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-028]** State Delta Highlighting
- **Type:** UX
- **Description:** Offer a "Diff View" showing file modifications made during an implementation turn.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-029]** Spec Sign-off Component
- **Type:** Functional
- **Description:** Specialized view for Phase 2 for individual requirement block approval/rejection.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-030]** Roadmap DAG Editor
- **Type:** Functional
- **Description:** Interactive canvas for dragging, reordering, deleting, or merging tasks.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-031]** Global Directive Input
- **Type:** Functional
- **Description:** Persistent text field for user directives in the sidebar or console footer.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-032]** Contextual Snippets
- **Type:** UX
- **Description:** Support for @file mentions in directives to inject file contents into context.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-033]** Priority Feedback
- **Type:** UX
- **Description:** Visual confirmation (badge) when the agent acknowledges a user directive.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[REQ-UI-024]** UI Task DAG Model
- **Type:** Technical
- **Description:** Standardized TypeScript interface for task nodes, including status, dependencies, and position.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[REQ-UI-025]** SAOP Envelope UI Representation
- **Type:** Technical
- **Description:** Standardized TypeScript interface for agent turns, including thoughts, strategies, and actions.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-047]** Log Virtualization
- **Type:** Technical
- **Description:** ConsoleView MUST use virtualized rendering for tasks with 100+ turns to prevent DOM bloat.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-048]** Graph Throttling
- **Type:** Technical
- **Description:** DAG visualization MUST use debouncing for updates during parallel execution to prevent stuttering.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-036]** Broken Mermaid Handling
- **Type:** UX
- **Description:** UI MUST catch Mermaid rendering errors and show a fallback with the raw markup and an edit button.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-037]** Massive Log Handling
- **Type:** Technical
- **Description:** Observations >10,000 characters MUST be truncated with a "Read More" button to fetch full logs on-demand.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-038]** Disconnected State
- **Type:** UX
- **Description:** Overlay "Reconnecting..." modal and disable interaction if MCP connection drops.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-039]** Screen Reader ARIA-Live
- **Type:** UX
- **Description:** ThoughtStream MUST use aria-live="polite" for accessibility.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-040]** Keyboard Navigation
- **Type:** UX
- **Description:** All interactive elements MUST be keyboard focusable and operable.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-041]** i18n Skeleton
- **Type:** Technical
- **Description:** Use of i18next for all static UI strings to support localization.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UI-ARCH-042]** Theme Contrast Logic
- **Type:** UX
- **Description:** Dynamic foreground color calculation for diagrams to ensure WCAG 2.1 AA contrast ratios.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[RISK-UI-201]** Webview Message Bottleneck
- **Type:** Technical
- **Description:** Risk of high-frequency streaming saturating postMessage bridge. Mitigation: batch chunks every 50ms.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[RISK-UI-202]** SVG Rendering Overhead
- **Type:** Technical
- **Description:** Risk of UI lag from massive Mermaid diagrams. Mitigation: use ResizeObserver for viewport-only rendering.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[RISK-UI-203]** State Desync
- **Type:** Technical
- **Description:** Risk of desync if CLI and VSCode are open simultaneously. Mitigation: WAL mode and FS watchers on SQLite.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[UNKNOWN-UI-201]** Complex Visualization Handling
- **Type:** Technical
- **Description:** Uncertainty on handling 3D/Flamegraphs in Webview. Currently out of scope; using static SVGs.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None
