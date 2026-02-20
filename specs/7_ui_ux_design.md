# UI/UX Design Specification: Project 'devs'

## 1. Design System Philosophy & Aesthetic

**[UI-DES-001] The Glass-Box Philosophy (Observability-Driven Design)**: The visual language of 'devs' is rooted in transparency, information density, and technical authority. It rejects the industry trend of "hiding complexity" in favor of exposing it through structured, auditable telemetry. The system must feel like a "High-Fidelity Flight Recorder" for software engineering—precise, data-rich, and natively integrated into the developer's environment. The core goal is to eliminate the "Magic Gap" where users lose track of agentic intent.

**[UI-DES-002] Visual Hierarchy of Agency (Source of Truth levels)**: To prevent cognitive overload, UI elements are prioritized based on their "Source of Truth" (SoT). This hierarchy determines z-index, contrast ratio, and font-weight:
1.  **Level 1: Human Authority (Directives)**: The highest priority. Rendered using high-contrast borders (e.g., `var(--vscode-focusBorder)`) and bold weights. These are the "Command overrides."
2.  **Level 2: Agent Autonomy (Reasoning/Logic)**: Middle priority. Rendered using a distinct narrative font (Serif) and alpha-blended backgrounds (`--devs-bg-thought`). This represents the agent's "Internal State."
3.  **Level 3: Environmental Fact (Files/Logs/Tests)**: The base priority. Rendered in raw, monospaced blocks. This represents the "External Reality" the agent is acting upon.

**[UI-DES-003] Deterministic Layout & Telemetry Anchors**: Components MUST maintain fixed, immutable anchors for critical project telemetry. Users should never have to search for the "Active Task," "Current Phase," or "Cumulative USD Spend."
- **Fixed Zones**: The top-right quadrant is reserved for "System Health" (Token budgets, Rate limits). The left sidebar is reserved for "Context & Navigation" (Epic Roadmap).
- **No-Drawer Policy**: Core architectural state (TAS/PRD status) must never be hidden behind drawers or modals unless it's for secondary editing.

**[UI-DES-004] High-Density Signal-to-Noise Ratio**: 'devs' prioritizes a high data-to-pixel ratio over whitespace-heavy "minimalist" designs.
- **Sparklines & Indicators**: Use micro-visualizations (sparklines) for resource consumption and status dots for requirement fulfillment.
- **Technical Conciseness**: Labels should be authoritative and brief (e.g., "REQ-ID: 402" instead of "Requirement Identifier 402").

**[UI-DES-005] Platform-Native "Ghost" Integration**: The UI must feel like an extension of VSCode itself, not an external web application hosted in a frame.
- **Token Compliance**: Mandatory use of VSCode design tokens (`--vscode-*` variables) for all primary UI elements.
- **Codicon Utilization**: Exclusive use of the `@vscode/codicons` library for iconography to maintain semantic consistency with the host editor.

**[UI-DES-006] Meaningful & Non-Decorated Motion**: Animations are strictly prohibited if they do not serve a functional state-transition purpose.
- **Functional Motion**: Permitted for showing the "Flow of Data" (e.g., a document "distilling" into requirements) or "System Pulsing" (indicating active agent thinking).
- **Anti-Magic Rule**: No "fade-ins" or "sliding" for purely decorative reasons. Transitions must be fast (< 200ms) and use standard engineering easing (`cubic-bezier(0.4, 0, 0.2, 1)`).

**[UI-DES-007] The "Agent-Ready" Visual Contract**: The design must be consistent and predictable to ensure that "Visual Reviewer" agents (using screenshot-to-text capabilities) can accurately parse the state of the UI. This requires high-contrast separators between different agentic threads.

**[UI-DES-008] Technical Unknowns & Design Risks**:
- **Risk [RISK-DES-001]**: Information density may lead to "Dashboard Fatigue" for non-architect users. *Mitigation*: Implementation of "LOD" (Level of Detail) toggles to collapse technical telemetry.
- **Risk [RISK-DES-002]**: Theme resilience across 1,000+ community VSCode themes. *Mitigation*: Strict reliance on standard VSCode semantic tokens rather than custom hex codes.

---

## 2. Color Palette & Theming

The 'devs' design system is engineered for **Architectural Cohesion** with the VSCode environment. It utilizes a multi-layered approach to theming: inheriting base editor tokens for UI consistency, while injecting a high-signal semantic palette for agentic observability.

### 2.1 Core Semantic Colors & VSCode Token Mapping

**[UI-DES-010] Token Anchoring**: To ensure theme resilience, all semantic colors MUST be derived from or mapped to standard VSCode theme tokens. This prevents the "Flashlight Effect" (bright UI elements in dark themes) and ensures accessibility across 1,000+ community themes.

| Token | Semantic Role | VSCode Mapping | Logic / Usage | ID |
| :--- | :--- | :--- | :--- | :--- |
| `--devs-primary` | Action/Focus | `--vscode-focusBorder` | Primary buttons, active node highlights, and interactive borders. | **[UI-DES-011]** |
| `--devs-success` | Validated/Pass | `--vscode-testing-iconPassed` | Successful task completion, passing test suites, and met requirements. | **[UI-DES-012]** |
| `--devs-error` | Failure/Critical| `--vscode-errorForeground` | TDD loop failures, sandbox security breaches, and project-stop errors. | **[UI-DES-013]** |
| `--devs-warning` | Entropy/Risk | `--vscode-warningForeground` | Strategy loops, performance regressions, and budget thresholds (>80%). | **[UI-DES-014]** |
| `--devs-thinking` | Agent Narrative | `--vscode-symbolIcon-propertyForeground` | Narrative reasoning (Serif blocks), "Internal Monologue" headers. | **[UI-DES-015]** |
| `--devs-border` | UI Boundaries | `--vscode-panel-border` | Card strokes, sidebar dividers, and DAG bounding boxes. | **[UI-DES-016]** |
| `--devs-muted` | Ghost/De-emphasized| `--vscode-descriptionForeground` | Version numbers, timestamps, and secondary metadata. | **[UI-DES-017]** |

### 2.2 Glass-Box Layering & Compositing Logic

**[UI-DES-018] Multi-Layer Compositing**: Backgrounds for agentic content utilize the CSS `color-mix()` function to create a "Glass-Box" effect that adapts to the user's background while maintaining semantic intent.

| Token | Semantic Role | CSS Compositing Logic | ID |
| :--- | :--- | :--- | :--- |
| `--devs-bg-thought` | Reasoning Block | `color-mix(in srgb, var(--vscode-editor-background), var(--devs-thinking) 8%)` | **[UI-DES-019]** |
| `--devs-bg-task-active`| Running Node | `color-mix(in srgb, var(--vscode-editor-lineHighlightBackground), var(--devs-primary) 12%)` | **[UI-DES-020]** |
| `--devs-bg-terminal` | Log/Shell Block | Fixed: `#0D1117` (Dark) / `#F6F8FA` (Light) | **[UI-DES-021]** |
| `--devs-bg-diff-add` | Implementation + | `color-mix(in srgb, var(--vscode-editor-background), var(--devs-success) 15%)` | **[UI-DES-022]** |
| `--devs-bg-diff-sub` | Implementation - | `color-mix(in srgb, var(--vscode-editor-background), var(--devs-error) 15%)` | **[UI-DES-023]** |

### 2.3 Terminal ANSI Mapping (CLI & Sandbox Logs)

**[UI-DES-024] ANSI Palette Calibration**: The CLI and VSCode `LogTerminal` components MUST map the semantic palette to standard ANSI escape codes for consistent cross-platform rendering.

- **Success (Green)**: ANSI 2 (Green) / ANSI 10 (Light Green).
- **Error (Red)**: ANSI 1 (Red) / ANSI 9 (Light Red).
- **Thinking (Magenta)**: ANSI 5 (Magenta) / ANSI 13 (Light Magenta).
- **Warning (Yellow)**: ANSI 3 (Yellow) / ANSI 11 (Light Yellow).
- **Metadata (Grey)**: ANSI 8 (Bright Black).

### 2.4 Theme Resilience & Accessibility Standards

**[UI-DES-025] High-Contrast (HC) Mode Overrides**: When a VSCode High Contrast theme is active (`.vscode-high-contrast` class present), the following overrides are mandatory:
- **Alpha-Blending Removal**: All `color-mix()` backgrounds MUST be replaced with solid `var(--vscode-editor-background)`.
- **Border Emphasis**: All `1px` borders MUST increase to `2px` using `var(--vscode-contrastBorder)`.
- **Text Luminance**: All semantic text colors MUST be verified against a 7:1 contrast ratio (WCAG AAA).

**[UI-DES-026] Theme Switching Latency**: The UI MUST react to theme changes (emitted by VSCode) within 50ms. CSS variable updates MUST NOT trigger full React re-renders of the Task DAG; instead, the DAG canvas MUST utilize `requestAnimationFrame` to update its internal theme state.

**[UI-DES-027] Agentic Differentiators (Multi-Agent Support)**: In scenarios where multiple agents (e.g., Developer vs. Reviewer) are working simultaneously, the UI SHOULD use secondary accent tints from the VSCode `symbolIcon` palette to differentiate their "Thought" headers:
- **Developer**: `--vscode-symbolIcon-functionForeground` (Blue/Cyan).
- **Reviewer**: `--vscode-symbolIcon-variableForeground` (Orange/Amber).
- **Architect**: `--vscode-symbolIcon-classForeground` (Green/Teal).

**[UI-DES-028] The "Red-Screen" Security Alert**: In the event of a `SANDBOX_BREACH_ALERT`, the UI MUST override the active theme with a high-intensity red overlay (`#FF0000` at 15% opacity) and set all borders to `3px solid var(--devs-error)`, forcing an immediate shift in the user's focus.

---

## 3. Typography System

**[UI-DES-020] Typography Philosophy (Semantic Separation)**: The typography in 'devs' is designed to create an immediate cognitive distinction between human input, agentic reasoning, and system output. By varying font families and scales, the UI communicates the "weight" and "source" of information without requiring explicit labels.

### 3.1 Primary Font Stacks & Inheritance

**[UI-DES-021] Interface Hierarchy (Tiered Fonts)**: 'devs' utilizes a tri-modal font system to categorize content by origin and intent.

| Usage | Priority | Font Family Stack | Size / Weight | ID |
| :--- | :--- | :--- | :--- | :--- |
| **System UI** | High (UX) | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | `13px-14px / 400` | **[UI-DES-021.1]** |
| **Agent Thought**| High (Narrative)| `"Georgia", "Times New Roman", "Source Serif Pro", serif` | `15px-16px / 400` | **[UI-DES-021.2]** |
| **Technical Logs**| Medium (Data) | `var(--vscode-editor-font-family), "Fira Code", "JetBrains Mono", monospace` | `12px-13px / 450` | **[UI-DES-021.3]** |

**[UI-DES-022] VSCode Editor Font Inheritance**: The "Technical Logs" and "Source Code" views MUST inherit the user's active VSCode editor font settings (family, weight, and ligatures) via the `--vscode-editor-font-family` and `--vscode-editor-font-weight` variables. This ensures the implementation view feels identical to the user's coding environment.

### 3.2 Type Scale & Semantic Mapping

**[UI-DES-023] Standardized Type Scale**: To maintain high information density, 'devs' uses a compact, non-linear scale.

| Style Name | Size | Weight | Letter Spacing | Usage | ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display H1** | `22px` | `600` | `-0.01em` | Project Title, Epic Headers. | **[UI-DES-023.1]** |
| **Header H2** | `18px` | `600` | `-0.005em` | Phase Headers (e.g., RESEARCH). | **[UI-DES-023.2]** |
| **Subhead H3** | `14px` | `700` | `0.02em` | Task IDs, Tool Names (Uppercase). | **[UI-DES-023.3]** |
| **Body UI** | `13px` | `400` | `normal` | Default UI text, Labels, Buttons. | **[UI-DES-023.4]** |
| **Agent Mono** | `13px` | `450` | `normal` | Thoughts (Serif) or Logs (Mono). | **[UI-DES-023.5]** |
| **Caption** | `11px` | `400` | `0.01em` | Timestamps, Token Counts, Redaction Tags. | **[UI-DES-023.6]** |

### 3.3 Semantic Use of Style & Weight

**[UI-DES-024] Signaling Agency via Style**:
- **Agentic Reasoning (Thoughts)**: MUST be rendered in **Italic Serif**. This creates a "journalistic" or "internal monologue" feel, separating reasoning from code implementation.
- **Human Directives (Directives)**: MUST be rendered in **Bold System UI** with a specific accent color (`--devs-primary`). This signals human authority and priority.
- **Tool Invocations (Actions)**: MUST use **Monospace Bold** for tool names (e.g., `READ_FILE`) to signify deterministic, system-level execution.

**[UI-DES-025] Line Height & Readability Metrics**:
- **Narrative Blocks (Thoughts)**: `line-height: 1.6`. High vertical rhythm to facilitate scanning long chains of thought.
- **Technical Blocks (Logs)**: `line-height: 1.4`. Optimized for density while maintaining line-to-line separation.
- **UI Navigation**: `line-height: 1.2`. Compact for sidebar items and dashboard tiles.

### 3.4 Technical Implementation Details

**[UI-DES-026] Font Loading & Anti-Aliasing**:
- **Subpixel Rendering**: Components MUST use `-webkit-font-smoothing: antialiased` to ensure crisp text in the Webview, especially when using light weights on dark backgrounds.
- **Webfont Strategy**: Serif fonts (e.g., Georgia) are treated as system-standard. If a user's OS lacks a quality serif, the UI MUST fallback to a generic `serif` to avoid the overhead of heavy font-face downloads within the VSCode extension.

**[UI-DES-027] Code Block Typography (Syntax Highlighting)**:
- **Font Weight Alignment**: Code blocks in logs SHOULD use a slightly heavier weight (`450` or `500`) than the standard editor to ensure legibility during real-time streaming against the dark terminal background.
- **Ligatures**: If the user has enabled font ligatures in VSCode, they MUST be supported in the 'devs' code previews via `font-variant-ligatures: contextual;`.

**[UI-DES-028] CJK & Multi-Script Support**:
- **Fallback Chain**: For Non-Latin scripts (Chinese, Japanese, Korean), the system MUST fallback to the host OS defaults (e.g., `PingFang SC` for macOS, `Meiryo` for Windows) to prevent "tofu" or broken character rendering in research reports.

### 3.5 Accessibility & Accessibility Edge Cases

**[UI-DES-029] Readability Edge Cases**:
- **Variable Font Size**: The UI MUST respect the `window.zoomLevel` and `editor.fontSize` settings from VSCode, scaling the entire typography system proportionally.
- **High Contrast Contrast**: In HC themes, font weights for H2 and H3 MUST increase by one step (e.g., `600` to `700`) to ensure structural clarity against the stark background.
- **Unknown [UNK-DES-021]**: Should the user be allowed to override the "Agent Thought" Serif font with a custom font? *Recommendation*: No, the serif font is a critical semantic marker for agency; allowing overrides could dilute the visual hierarchy.
- **Risk [RISK-DES-022]**: Serif fonts on low-DPI displays can sometimes exhibit poor legibility. *Mitigation*: Implementation of a "Monospace Only" mode for accessibility if subpixel rendering fails.

---

## 4. Spacing, Grid & Layout Metrics

**[UI-DES-030] The 4px Base Grid (Deterministic Spacing)**: 'devs' utilizes a 4px base increment for all spatial relationships. This ensures mathematical alignment and consistent density across different display scales. All margins, padding, and component dimensions MUST be multiples of 4px.

### 4.1 Spacing Variables & Semantic Usage

| Variable | Value | Usage | ID |
| :--- | :--- | :--- | :--- |
| `$spacing-xs` | `4px` | Micro-spacing: Icons to text, internal component padding. | **[UI-DES-031]** |
| `$spacing-sm` | `8px` | Tight-spacing: List items, card internal padding, text-to-label gaps. | **[UI-DES-032]** |
| `$spacing-md` | `16px` | Standard: Section margins, between cards, sidebar internal padding. | **[UI-DES-033]** |
| `$spacing-lg` | `24px` | Layout: Between major view regions (e.g., Sidebar to Main). | **[UI-DES-034]** |
| `$spacing-xl` | `32px` | Visual separation for distinct agentic phases. | **[UI-DES-034.1]** |
| `$spacing-xxl`| `48px` | Hero spacing for empty states or project start views. | **[UI-DES-034.2]** |

### 4.2 Major Layout Regions & Zoning

**[UI-DES-035] The Fixed Zone Architecture**: To support cognitive anchoring [UI-DES-003], the UI is divided into resizable but persistent zones.

| Zone | Primary Content | Default Metrics | Logic | ID |
| :--- | :--- | :--- | :--- | :--- |
| **Left Sidebar** | Epic Roadmap / Map | Width: `280px` (Resizable) | High-level context; stays fixed during Implementation. | **[UI-DES-035.1]** |
| **Main Viewport** | Focus (Dashboard/DAG/Spec) | Flexible (`flex-grow: 1`) | The primary work area; scrolls vertically. | **[UI-DES-035.2]** |
| **Right Sidebar** | Auxiliary (Logs/Docs) | Width: `320px` (Collapsible) | Supporting data; can be hidden to focus on code. | **[UI-DES-035.3]** |
| **Bottom Console**| Terminal / Thought Stream | Height: `240px` (Resizable) | Real-time agentic telemetry; always visible in Phase 4. | **[UI-DES-035.4]** |

### 4.3 Component-Level Metrics

**[UI-DES-036] Task Node (DAG) Geometry**: The Task DAG is the most performance-sensitive component.
- **Node Dimensions**: Width `180px`, Height `64px` (fixed).
- **Internal Padding**: `$spacing-sm` (`8px`).
- **Edge Weight**: `1px` stroke (normal) / `2.5px` stroke (dependency highlighted).
- **Port Spacing**: Input (Left) and Output (Right) ports are vertically centered.

**[UI-DES-037] Card & Container Attributes**:
- **Border Radius**: `4px` (Rigid, professional feel).
- **Border Width**: `1px` solid `var(--devs-border)`.
- **Shadows**: Only used for elevated states (Modals, Overlays). 
  - `shadow-sm`: `0 2px 4px rgba(0,0,0,0.15)`
  - `shadow-md`: `0 8px 24px rgba(0,0,0,0.30)`

**[UI-DES-038] Interactive Target Sizes**:
- **Min Target**: `24px` x `24px` (Optimized for mouse/trackpad precision in VSCode).
- **Standard Button**: Height `28px`, Horizontal Padding `12px`.

### 4.4 Z-Index Hierarchy (Layering Strategy)

**[UI-DES-039] Depth Perception**: Layering MUST reflect the SoT hierarchy [UI-DES-002].

- **Level 0 (Base)**: Workspace, Dashboard tiles, Background logs. `z-index: 0`.
- **Level 1 (Navigation)**: Sticky headers, Sidebar nav, Fixed phase-stepper. `z-index: 100`.
- **Level 2 (Overlays)**: Tooltip previews, "Whisper" field (active), Tool call expansion. `z-index: 200`.
- **Level 3 (Modals)**: HITL Approval gates, Diff reviewers, Strategy pivot analysis. `z-index: 300`.
- **Level 4 (Critical)**: Sandbox Breach Alerts, System Crashes. `z-index: 400`.

### 4.5 Responsive & Scaling Edge Cases

- **[UI-DES-039.1] Ultra-Wide Support**: On viewports > 1920px, the Main Viewport MUST maintain a `max-width: 1200px` (centered) for PRD/TAS reading to maintain line-length legibility (~80 characters per line).
- **[UI-DES-039.2] Sidebar Collapse**: When the Left Sidebar is collapsed (< 80px), it MUST transform into a "Ghost Rail" showing only Epic icons and requirement fulfillment badges.
- **[UI-DES-039.3] Information Density Scaling**: If the task count in the DAG exceeds 100, the spacing between nodes reduces from `$spacing-md` to `$spacing-sm` to maintain a global view.
- **[UI-DES-039.4] Scrollbar Metrics**: Scrollbars MUST be slim (`8px` width) with a `4px` radius thumb, utilizing `--vscode-scrollbarSlider-background` to minimize visual noise in high-density views.

---

## 5. Interactive States & Micro-Animations

**[UI-DES-040] Functional Animation Manifesto (The Logic of Motion)**: Motion in 'devs' is never decorative. It is a technical tool used to communicate system state, data flow, and agentic intent. All animations MUST be fast (< 250ms), utilize the standard engineering easing curve `cubic-bezier(0.4, 0, 0.2, 1)`, and prioritize performance by animating only `transform` and `opacity` properties where possible.

### 5.1 Agentic State & Telemetry Visualizations

**[UI-DES-041] The Reasoning Pulse (Thinking State)**: When an agent is actively generating a "Reasoning Chain," the UI MUST communicate "Live Activity" without causing distraction.
- **Visual**: A subtle opacity pulse (0.6 to 1.0) applied to the `active_task_node` in the DAG and the header of the `ThoughtStreamer`.
- **Timing**: 2000ms duration, infinite loop, using a sinusoidal ease-in-out.
- **Logic**: Triggered by the `AGENT_THOUGHT_STREAM` event; terminated immediately upon the `TOOL_LIFECYCLE:INVOKED` event.

**[UI-DES-042] Tool Execution Micro-Animations**:
- **[UI-DES-042.1] Invocation Shimmer**: When a tool is called, the corresponding "Action Card" in the log MUST exhibit a one-time horizontal shimmer effect (linear-gradient sweep) to signify the handoff from reasoning to execution.
- **[UI-DES-042.2] Active Progress Sweep**: During long-running tools (e.g., `npm install`, `vitest`), a 2px indeterminate progress bar MUST scan across the top of the card or terminal window using a 1500ms cycle.
- **[UI-DES-042.3] Completion "Pop"**: Successful tool completion triggers a subtle `scale(1.02)` pop followed by a `var(--devs-success)` border-flash (500ms decay).
- **[UI-DES-042.4] Failure Shake**: Tool failure triggers a horizontal shake (`±4px` at 400ms) and an immediate shift to a solid `var(--devs-error)` background for the card header.

### 5.2 Human-in-the-Loop (HITL) Attention Mechanisms

**[UI-DES-043] Gated Autonomy Highlighting (The "Attention" Pulse)**: When the orchestrator hits a mandatory approval gate (Phase 2, Phase 3, or Task Failure), the UI MUST guide the user to the resolution point.
- **Visual**: The primary approval button or "Directives" field MUST exhibit a glowing box-shadow pulse (`0 0 8px var(--devs-primary)`).
- **Secondary Indicator**: The Sidebar's "Phase Stepper" icon for the current phase MUST pulse amber.
- **Constraint**: These pulses MUST terminate as soon as the user interacts with the target element or the keyboard focus (`tab`) reaches it.

**[UI-DES-044] Directive Injection Feedback (The "Whisper" Confirmation)**:
- **Visual**: On submission of a directive, a transient success badge (`Directive Injected`) MUST slide in from the top-right of the Console View (+20px Y-offset).
- **Persistence**: Visible for 3000ms, then fades out via `opacity: 0` over 500ms.
- **Agentic Response**: The next "Thought" block MUST include a one-time visual highlight (light-blue border) to indicate that the user's directive has been ingested into the reasoning context.

### 5.3 DAG Canvas & Roadmap Dynamics

**[UI-DES-045] Node Interaction & Focus States**:
- **[UI-DES-045.1] Hover Elevation**: Hovering a task node triggers a `scale(1.05)` transform and an increased shadow depth (`shadow-md`) to separate it from the graph background.
- **[UI-DES-045.2] Selection Anchor**: Clicking a node applies a persistent `3px solid var(--devs-primary)` border and centers the node in the viewport using a smooth `d3-zoom` transition (500ms).
- **[UI-DES-045.3] Dependency Flow Highlighting**: When a node is selected, its upstream dependencies (inputs) and downstream dependents (outputs) MUST be highlighted. The connecting lines (edges) MUST transform from grey to `var(--devs-primary)` with an animated dash-offset effect simulating "Data Flow" toward the selected node.

**[UI-DES-046] Pan & Zoom Inertia**:
- **Physics**: The DAG canvas MUST implement momentum scrolling (inertia). Rapid pans MUST decelerate gracefully over 400ms.
- **Semantic Zooming**: At zoom levels < 0.4, detailed task titles are hidden in favor of `REQ-ID` badges. At zoom levels < 0.1, individual tasks are hidden, and only Epic bounding boxes with progress radials are rendered.

### 5.4 Glass-Box Data Transitions

**[UI-DES-047] The Distillation Sweep (Phase 2 to 3)**:
- **Visual**: During requirement distillation, requirements MUST appear to "fly" from the TAS/PRD document preview into the Roadmap list.
- **Implementation**: Particle-based animation where text fragments transform into requirement badges.
- **Duration**: 800ms total, staggered by 50ms per requirement to create a "Waterfall" effect.

**[UI-DES-048] State Recovery & Rewind (Time-Travel)**:
- **Visual**: Triggering a `rewind` MUST apply a temporary "Glitch/Desaturation" filter to the entire UI (CSS `grayscale(1) brightness(0.8)`) for 600ms while the Git/SQLite state is restored.
- **Feedback**: A "State Restored" toast with the new Task ID MUST slide in from the bottom-center.

### 5.5 Technical Performance & Implementation Specs

**[UI-DES-049] Animation Guardrails**:
- **FPS Target**: All animations MUST maintain 60FPS on a standard developer machine (e.g., MacBook M1).
- **Disabling Motion**: The UI MUST respect the `prefers-reduced-motion` media query, replacing all transforms and pulses with static state-indicators (e.g., solid color changes).
- **Threading**: Heavy canvas updates (DAG layout) MUST be offloaded to a Web Worker to ensure that the React main thread remains responsive for user input.

**[UI-DES-049.1] Interaction Unknowns & Risks**:
- **Risk [RISK-DES-040]**: High-frequency updates from Gemini 1.5 Flash could lead to "Stuttering" if animations are too complex. *Mitigation*: Implementation of a global "Animation Throttler" that drops frames if the CPU usage exceeds 30%.
- **Unknown [UNK-DES-041]**: Should the "Thinking Pulse" be color-coded based on model confidence? *Recommendation*: No, keep it neutral; use the `LogTerminal` for confidence scores to avoid visual noise.

---

## 6. CLI TUI (Ink) Design Rules

**[UI-DES-050] TUI Philosophy (Minimalist Authority)**: The CLI interface MUST provide the same "Glass-Box" telemetry as the VSCode Extension but optimized for the low-latency, keyboard-driven environment of the terminal. It utilizes `Ink` (React for CLI) to manage stateful components and `Chalk` for ANSI color mapping. The TUI prioritizes vertical flow and high-density text over the spatial 2D graph of the VSCode DAG.

### 6.1 Layout Architecture & Flexbox Zoning

**[UI-DES-051] Terminal Layout Zones**: In interactive mode (TTY), the interface is divided into persistent zones using Ink's Flexbox engine.

| Zone | Logic | Dimensions / Constraints | ID |
| :--- | :--- | :--- | :--- |
| **Header (Global)** | Project Name, Phase Stepper, Health (USD/Tokens). | Height: `3` lines. Fixed top. | **[UI-DES-051.1]** |
| **Main (Context)** | Epic Roadmap (Left) and Active Task (Right). | Flexible height. Side-by-side if width > 100 chars. | **[UI-DES-051.2]** |
| **Telemetry (Live)** | Agent Thought Stream & Tool Action Logs. | Height: `min-height 10`, `flex-grow: 1`. | **[UI-DES-051.3]** |
| **Footer (Control)** | Active Shortcuts (Keybindings) & Whisper Field. | Height: `2` lines. Fixed bottom. | **[UI-DES-051.4]** |

**[UI-DES-052] Responsive Reflow (Terminal Constraints)**:
- **Compact Mode (< 80 chars)**: The layout switches to a single vertical stack. The Roadmap is hidden in favor of a `[Current Task ID]` breadcrumb in the header.
- **Standard Mode (80-120 chars)**: Sidebar (Epic List) occupies `25%` width; Main implementation view occupies `75%`.
- **Wide Mode (> 120 chars)**: Tri-pane layout (Roadmap, Implementation, Documentation Preview).

### 6.2 Component Mapping & Visual Fidelity

**[UI-DES-053] ANSI Token Mapping (The TUI Palette)**: The VSCode semantic tokens [UI-DES-010] are mapped to the closest ANSI equivalents.

- **TrueColor (24-bit)**: Used by default if `chalk.level >= 3`. Maps hex codes directly from the VSCode Dark+ theme.
- **256-Color (xterm)**: Fallback mapping for older terminals (e.g., standard macOS Terminal.app).
- **16-Color (Basic)**: High-contrast fallback using standard ANSI constants (Green, Red, Yellow, Cyan, Magenta).

**[UI-DES-054] Semantic Prefixes & Unicode Fallbacks**: To ensure cross-platform compatibility, iconography uses a tiered fallback system.

| Entity | Unicode Glyph (Default) | ASCII Fallback (`!is-unicode`) | Color (Chalk) | ID |
| :--- | :--- | :--- | :--- | :--- |
| **Thought** | `(agent) »` | `(agent) >` | `magentaItalic` | **[UI-DES-054.1]** |
| **Action** | `[tool]  ⚙` | `[tool]  *` | `blueBold` | **[UI-DES-054.2]** |
| **Success** | `[pass]  ✔` | `[pass]  V` | `green` | **[UI-DES-054.3]** |
| **Failure** | `[fail]  ✘` | `[fail]  X` | `red` | **[UI-DES-054.4]** |
| **Human** | `(user)  👤` | `(user)  U` | `cyanBold` | **[UI-DES-054.5]** |
| **Entropy** | `[loop]  ∞` | `[loop]  @` | `yellowBright`| **[UI-DES-054.6]** |

**[UI-DES-055] Box-Drawing & Action Cards**:
- **Structured Blocks**: Tool calls and Reasoning turns MUST be wrapped in Unicode box-drawing characters (`┌`, `─`, `┐`, `│`, `└`, `─`, `┘`).
- **Indentation Hierarchy**: Nested tool calls (Reviewer checking Developer) are indented by `$spacing-sm` (2 spaces) and use dotted vertical lines (`┆`).

### 6.3 Interaction Model & Focus Management

**[UI-DES-056] Keyboard-First Navigation (Hotkeys)**:
- **Global Actions**: `P` (Pause/Resume), `R` (Rewind Menu), `H` (Help/Keymap).
- **Phase Gates**: `Enter` (Approve/Proceed), `ESC` (Reject/Back).
- **The Whisperer**: `/` (slash) or `W` focuses the Directive input field.
- **Task Switching**: `Up/Down` arrows to navigate the Epic Roadmap; `TAB` to switch focus between Roadmap and Console.

**[UI-DES-057] Focus Management (Ink-Focus)**: The TUI MUST maintain a clear "Active Focus" state. The focused zone (e.g., the Roadmap) MUST exhibit a double-line border (`║`) while inactive zones use single-line borders (`│`).

### 6.4 Real-time Telemetry & Performance

**[UI-DES-058] Flicker-Free Rendering (Memoization)**:
- **State Optimization**: High-frequency streaming (Thoughts) MUST utilize `React.memo` and partial updates. Only the `LogTerminal` component should re-render on character-level data arrivals.
- **Scrollback Buffer**: The TUI MUST maintain a virtualized scrollback buffer of the last 1000 lines. Use of `Static` components from Ink for historical logs to minimize the reconciliation load.

**[UI-DES-059] Secret Redaction (TUI Integration)**: The `SecretMasker` MUST be applied to the TUI stream before the data reaches the `Ink` renderer. Redacted strings are highlighted in `inverse` or `bgRed` to ensure they are visually distinct to the user.

### 6.5 HITL Approval Gates in TUI

**[UI-DES-060] The Terminal Diff Reviewer**:
- **Visual**: When approving a TAS/PRD change, the TUI MUST render a side-by-side or unified diff using standard `+` (Green) and `-` (Red) syntax.
- **Multi-Select**: Use `ink-select-input` for requirement sign-offs, allowing users to toggle checkboxes using `Space`.

**[UI-DES-061] Technical Risks & Unknowns (TUI)**:
- **Risk [RISK-TUI-01]**: Terminal resizing during a long-running task can cause `Ink` to crash or corrupt the buffer. *Mitigation*: Implementation of a `ResizeObserver` that forces a full layout re-calculation and terminal clear.
- **Unknown [UNK-TUI-01]**: Should the CLI support "Mouse Interaction" (clicking nodes)? *Recommendation*: No, maintain a 100% keyboard-driven interface for CLI consistency; reserve mouse interaction for the VSCode Extension.

---

## 7. Responsive & Adaptive Rules

**[UI-DES-060] The Adaptive Layout Engine**: The 'devs' UI utilizes a "Fluid-to-Linear" layout strategy. It must maintain technical authority across three primary environments: the VSCode Editor (Main Webview), the VSCode Sidebar (Narrow View), and the CLI TUI (Terminal).

### 7.1 Breakpoints & Pane Management

**[UI-DES-061] Viewport Breakpoints (Logical Widths)**: The UI MUST adapt its multi-pane architecture based on the available width of the Webview container.

| Breakpoint | Range (px) | Layout Configuration | Logic | ID |
| :--- | :--- | :--- | :--- | :--- |
| **Narrow** | `< 480` | Single Column (Linear Stack) | Used in the VSCode Sidebar. All sidebars are hidden; Main Viewport becomes a vertical list. | **[UI-DES-061.1]** |
| **Compact**| `480 - 768` | Main + Bottom Console | Right Sidebar (Logs) is hidden. Console height increases to 40% of viewport. | **[UI-DES-061.2]** |
| **Standard**| `768 - 1280`| Tri-Pane (Sidebar + Main + Console) | Right Sidebar is collapsible but visible by default. Standard Information Density. | **[UI-DES-061.3]** |
| **Wide** | `1280 - 1920`| Full Quad-Pane | All panes visible. Main Viewport implements a `max-width: 1000px` for text readability. | **[UI-DES-061.4]** |
| **Ultra** | `> 1920` | Centered Fixed-Width | Main content centered with expanded gutters; DAG Canvas expands to fill the full background. | **[UI-DES-061.5]** |

**[UI-DES-062] Automatic Pane Eviction (Vertical Constraints)**: If the viewport height is `< 600px`, the Bottom Console MUST be minimized to a "Status Bar" mode (32px height) showing only the active task ID and a progress pulse, maximizing the vertical space for the Roadmap or Spec View.

### 7.2 Adaptive Information Density (LOD)

**[UI-DES-063] Level-of-Detail (LOD) Scaling**: To prevent "Telemetry Noise," the UI MUST dynamically adjust the resolution of information based on the visual "Zoom Level" or "Container Size."

- **[UI-DES-063.1] DAG Semantic Zooming**:
  - **LOD-3 (Close)**: Full node details, requirement tags, and agent status icons.
  - **LOD-2 (Mid)**: Task titles only; icons are simplified to status dots. Edges (lines) are thinned to 0.5px.
  - **LOD-1 (Far)**: Individual tasks are hidden; only Epic bounding boxes with progress percentages are rendered.
- **[UI-DES-063.2] Log Truncation & Summarization**:
  - In **Narrow** mode, SAOP observations (raw logs) are hidden behind a "View Log" button to prevent vertical bloat. Only the "Reasoning Chain" (Thoughts) is streamed by default.
  - In **Wide** mode, the UI displays a side-by-side "Thought vs. Action" view.

### 7.3 Accessibility & Theme Adaptivity

**[UI-DES-064] High-Contrast (HC) Resilience**: The UI MUST strictly adhere to WCAG 2.1 AA standards.
- **[UI-DES-064.1] Contrast Enforcement**: All text-to-background ratios MUST exceed 4.5:1. In High Contrast themes, this MUST increase to 7:1 for all primary actions.
- **[UI-DES-064.2] Focus Ring Persistence**: The standard VSCode focus ring (`2px solid var(--vscode-focusBorder)`) MUST be visible on all keyboard-navigable elements. In HC mode, the border MUST be `offset` by 2px to ensure it is not masked by the component boundary.
- **[UI-DES-064.3] Aria-Live Annunciation**: The UI MUST utilize a non-visual `aria-live` buffer to announce "Agentic Events" (e.g., "Task T-102 Failed at Red Phase") without disrupting the user's focus on the code.

**[UI-DES-065] Reduced Motion Optimization**: If the host OS has "Reduced Motion" enabled (`prefers-reduced-motion: reduce`), the UI MUST:
- Disable all `ThoughtStream` sliding animations.
- Replace the "Thinking Pulse" with a static "Active" icon.
- Disable the "Distillation Sweep" particle effects in Phase 3.
- Instant-jump all tab transitions (0ms duration).

### 7.4 Connectivity & Hydration States

**[UI-DES-066] Persistence & Recovery UX**:
- **[UI-DES-066.1] Skeleton Shimmer Logic**: During initial project hydration (Tier 2 sync), the UI MUST render skeleton loaders for all Dashboard tiles and the Roadmap DAG. The shimmer effect MUST use a `linear-gradient` derived from `--vscode-editor-lineHighlightBackground`.
- **[UI-DES-066.2] The "Disconnected" Mask**: If the MCP connection drops, a semi-transparent blur overlay (CSS `backdrop-filter: blur(4px)`) MUST cover the interactive zones with a high-priority "Reconnecting..." toast.
- **[UI-DES-066.3] Optimistic State Rollback**: If a human-initiated directive fails to persist in the SQLite state, the UI MUST perform a "Snap-Back" animation (300ms) to the last verified state and display a "Persistence Failure" warning.

### 7.5 Technical Performance Adaptivity

**[UI-DES-067] Hardware-Aware Rendering**:
- **Battery Saver Mode**: If the device is detected to be in "Battery Saver" mode (via Battery API where available), the UI MUST throttle the DAG Canvas refresh rate from 60FPS to 15FPS.
- **GPU Acceleration**: Heavy visualizations (Flamegraphs, Large DAGs) MUST use `transform: translate3d(0,0,0)` to force GPU layer creation, preventing CPU spikes during agent implementation loops.

**[UI-DES-068] Adaptive Layout Risks**:
- **Risk [RISK-DES-060]**: Sudden layout shifts during streaming logs can disorient the user. *Mitigation*: Implementation of a "Scroll Lock" that prevents the view from jumping when new content is appended unless the user is already at the bottom of the buffer.
- **Unknown [UNK-DES-061]**: How should the UI adapt if the user has a custom VSCode "Zoom" setting > 200%? *Recommendation*: All spacing variables MUST use `rem` or `em` units to ensure they scale with the editor's base font size.

---

## 8. Detailed View Specifications

### 8.1 Dashboard View (Project Command Center)
**[UI-DES-070] Dashboard Layout**: The initial landing state after `devs init`.
- **Epic Progress Radial**: A large, circular visualization showing the percentage completion of requirements across all 8-16 epics.
- **Activity Feed**: A scrolling list of the last 10 successful task commits, including timestamps and contributor agent IDs.
- **Health Telemetry**: Real-time gauges for Token Spend (USD), Code Coverage (%), and Test Pass Rate (%).
- **Phase Stepper**: A horizontal indicator at the top showing the transition from Research -> Design -> Distill -> Implement -> Validate.

### 8.2 Research Suite View
**[UI-DES-071] Multi-Pane Discovery**: Specialized view for Phase 1 results.
- **Tabs**: Market Research, Competitive Analysis, Technology Landscape, User Research.
- **Source Tooltips**: Every factual claim in the reports MUST have a hoverable citation that shows the source URL and a "Reliability Score" (0.0 - 1.0).
- **Decision Matrix**: A side-by-side comparison table of tech stacks (e.g., React vs. Angular) with weighted pros/cons.

### 8.3 Spec Editor & Previewer (The Blueprint)
**[UI-DES-072] Gated Spec Review**: The interface for Phase 2 human-in-the-loop approvals.
- **Dual Pane**: Markdown source on the left, live-rendered Mermaid.js diagrams on the right.
- **Requirement Highlighting**: Hovering over a requirement in the PRD MUST highlight the corresponding data model in the TAS ERD.
- **Approval Checkboxes**: Every requirement block MUST have a "Sign-off" checkbox. The "Approve Architecture" button remains disabled until all P3 (Must-have) requirements are checked.

### 8.4 Roadmap & DAG View (The Dependency Graph)
**[UI-DES-073] Large-Scale Graph Navigation**:
- **Clustering**: Tasks are visually grouped into Epic bounding boxes (light grey background).
- **Critical Path Highlighting**: A toggle to highlight the longest sequence of dependent tasks that define the project duration.
- **Filtering Bar**: Fast search by Task ID, Title, or associated Requirement ID.
- **Task Detail Card**: A slide-out panel showing the full implementation history, including failing test logs and git diffs.

### 8.5 Agent Console (The Implementation Lab)
**[UI-DES-074] High-Density Development Hub**: The active view during Phase 4.
- **Thought Stream (Center)**: The serif-based, narrative reasoning of the agent. New thoughts slide in from the bottom.
- **Tool Log (Right Sidebar)**: A collapsed list of tool calls (`read_file`, `npm test`). Clicking expands the raw redacted output.
- **Sandbox Terminal (Bottom)**: A monospaced terminal view (`xterm.js`) showing the real-time stdout/stderr of the active test execution.

---

## 9. Form & Input Design

### 9.1 The "Directive Whisperer" Field
**[UI-DES-080] Context-Aware Injection**:
- **Trigger**: `Cmd+K` (macOS) or `Ctrl+K` (Windows).
- **Autocomplete**: `@` triggers a list of project files; `#` triggers a list of requirement IDs.
- **Ghost Text**: "Whisper a directive to the agent (e.g., 'Use fetch instead of axios')..."
- **Priority Toggle**: A checkbox for "Immediate Pivot" that forces the current agent turn to interrupt and reflect on the directive.

### 9.2 Approval Gate Modals
**[UI-DES-081] Transactional Sign-off**:
- **Diff View**: When an agent proposes a TAS change mid-implementation, the approval modal MUST show a side-by-side diff of the Markdown spec.
- **Risk Indicator**: Color-coded badges (Low, Med, High) based on how many downstream tasks are affected by the change.

---

## 10. Visualization Design (Mermaid & Profiling)

### 10.1 Mermaid.js Integration
**[UI-DES-090] Interactive Blueprint Rendering**:
- **Auto-Sync**: Diagrams re-render within 200ms of a file save.
- **Pan/Zoom Controls**: Floating toolbar on every diagram for "Reset View" and "Export to SVG".
- **Agentic Links**: Double-clicking a node in a Mermaid diagram (e.g., a DB table) MUST open the corresponding definition in the TAS source.

### 10.2 Agentic Profiling Dashboard
**[UI-DES-091] Performance Telemetry**:
- **Flamegraphs**: Visual representation of CPU execution time captured via the `ProjectServer` profiling tool.
- **Heap Snapshots**: A treemap visualization of memory allocation, highlighting modules exceeding the TAS memory quota.

---

## 11. Error & Edge Case Visualization

### 11.1 Entropy & Loop Visualization
**[UI-DES-100] The "Glitch" State**:
- **Visual Feedback**: When entropy is detected (>3 repeating hashes), the active Thought Block header should pulse red and exhibit a subtle "shake" effect.
- **RCA Report**: A modal overlay presenting the agent's Root Cause Analysis, contrasting the failing strategy with a proposed pivot.

### 11.2 System State Disruptions
- **[UI-DES-101] Connection Lost**: A full-page blurred overlay with a "Reconnecting to Orchestrator..." spinner.
- **[UI-DES-102] Sandbox Breach Alert**: A high-priority red banner across the entire UI if a container attempt to escape its network/filesystem boundary is detected.
- **[UI-DES-103] Token Budget Overrun**: A yellow overlay masking the "Run" button when the project exceeds 80% of its allocated USD budget.

---

## 12. Design for "Agentic Readiness" (AOD)

### 12.1 AOD Presentation
**[UI-DES-110] Contextual Guidance Display**:
- **Module Hover**: In the `src/` view, hovering a file name MUST show a summary of its `.agent.md` documentation (Intent, Hooks, Test Strategy).
- **Introspection Highlights**: Specific lines of code that serve as "Agentic Hooks" SHOULD be highlighted with a distinctive left-gutter icon (e.g., a "Glass Box" glyph).

---

## 13. Accessibility & Theme Resilience

### 13.1 Screen Reader Protocols
**[UI-DES-120] Semantic Annunciations**:
- **Aria-Live**: New agent thoughts MUST be announced as "Polite" updates.
- **Task Success**: "Task [ID] Completed Successfully" MUST be announced as an "Assertive" update.

### 13.2 High-Contrast Strategy
**[UI-DES-121] Forced Contrast Mode**: In VSCode High Contrast themes, all alpha-blended backgrounds (`--devs-bg-thought`) revert to solid background colors with high-contrast borders to ensure WCAG 2.1 compliance.
