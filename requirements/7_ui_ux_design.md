### **[UI-DES-001]** The Glass-Box Philosophy (Observability-Driven Design)
- **Type:** UX
- **Description:** The visual language must prioritize transparency, information density, and technical authority, exposing complexity through structured, auditable telemetry to eliminate the "Magic Gap."
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-002]** Visual Hierarchy of Agency (Source of Truth levels)
- **Type:** UX
- **Description:** UI elements must be prioritized based on Source of Truth (SoT) levels: Level 1 (Human Authority) using high-contrast borders; Level 2 (Agent Autonomy) using Serif fonts and alpha-blended backgrounds; Level 3 (Environmental Fact) using monospaced blocks.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-003]** Deterministic Layout & Telemetry Anchors
- **Type:** UX
- **Description:** Components must maintain fixed, immutable anchors for critical project telemetry (Active Task, Current Phase, Spend).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-004]** High-Density Signal-to-Noise Ratio
- **Type:** UX
- **Description:** Prioritize high data-to-pixel ratio using micro-visualizations (sparklines), status dots, and authoritative, brief technical labels.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-005]** Platform-Native "Ghost" Integration
- **Type:** Technical
- **Description:** The UI must use VSCode design tokens (`--vscode-*` variables) and `@vscode/codicons` for all primary elements and iconography to feel like a native extension.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-006]** Meaningful & Non-Decorated Motion
- **Type:** UX
- **Description:** Animations are prohibited unless they serve a functional state-transition purpose (e.g., flow of data, active thinking) and must be fast (< 200ms) with standard engineering easing.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-007]** The "Agent-Ready" Visual Contract
- **Type:** Technical
- **Description:** The design must be consistent and predictable with high-contrast separators to ensure "Visual Reviewer" agents can accurately parse the UI state via screenshots.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-010]** Token Anchoring
- **Type:** Technical
- **Description:** All semantic colors must be derived from or mapped to standard VSCode theme tokens to ensure theme resilience and accessibility.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-011]** Action/Focus Color Mapping
- **Type:** Technical
- **Description:** `--devs-primary` must map to `--vscode-focusBorder` for primary actions and interactive borders.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-012]** Success Color Mapping
- **Type:** Technical
- **Description:** `--devs-success` must map to `--vscode-testing-iconPassed` for successful completions and passing tests.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-013]** Error Color Mapping
- **Type:** Technical
- **Description:** `--devs-error` must map to `--vscode-errorForeground` for failures and security breaches.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-014]** Warning Color Mapping
- **Type:** Technical
- **Description:** `--devs-warning` must map to `--vscode-warningForeground` for strategy loops and budget thresholds.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-015]** Thinking Color Mapping
- **Type:** Technical
- **Description:** `--devs-thinking` must map to `--vscode-symbolIcon-propertyForeground` for agent reasoning blocks.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-016]** Border Color Mapping
- **Type:** Technical
- **Description:** `--devs-border` must map to `--vscode-panel-border` for UI boundaries and dividers.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-017]** Muted Color Mapping
- **Type:** Technical
- **Description:** `--devs-muted` must map to `--vscode-descriptionForeground` for secondary metadata and timestamps.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-018]** Multi-Layer Compositing (Glass-Box Effect)
- **Type:** Technical
- **Description:** Backgrounds for agentic content must use the CSS `color-mix()` function to create a "Glass-Box" effect that adapts to the user's background.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-019]** Reasoning Block Background
- **Type:** Technical
- **Description:** `--devs-bg-thought` must be calculated as `color-mix(in srgb, var(--vscode-editor-background), var(--devs-thinking) 8%)`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-020]** Running Node Background
- **Type:** Technical
- **Description:** `--devs-bg-task-active` must be calculated as `color-mix(in srgb, var(--vscode-editor-lineHighlightBackground), var(--devs-primary) 12%)`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-021]** Log/Shell Block Background
- **Type:** Technical
- **Description:** `--devs-bg-terminal` must use fixed colors: `#0D1117` (Dark) or `#F6F8FA` (Light).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-022]** Implementation Diff Add Background
- **Type:** Technical
- **Description:** `--devs-bg-diff-add` must be calculated as `color-mix(in srgb, var(--vscode-editor-background), var(--devs-success) 15%)`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-023]** Implementation Diff Sub Background
- **Type:** Technical
- **Description:** `--devs-bg-diff-sub` must be calculated as `color-mix(in srgb, var(--vscode-editor-background), var(--devs-error) 15%)`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-024]** ANSI Palette Calibration
- **Type:** Technical
- **Description:** CLI and LogTerminal components must map the semantic palette to standard ANSI escape codes (Success: Green/10, Error: Red/9, Thinking: Magenta/13, Warning: Yellow/11, Metadata: Grey/8).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-025]** High-Contrast (HC) Mode Overrides
- **Type:** Non-Functional
- **Description:** In VSCode High Contrast mode, alpha-blending must be removed, borders must increase to 2px, and semantic font weights must increase for clarity.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-023.1]** Typography: Display H1
- **Type:** UX
- **Description:** Display H1 style: 22px, 600 weight, -0.01em spacing, used for Project Title and Epic Headers.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-023.2]** Typography: Header H2
- **Type:** UX
- **Description:** Header H2 style: 18px, 600 weight, -0.005em spacing, used for Phase Headers.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-023.3]** Typography: Subhead H3
- **Type:** UX
- **Description:** Subhead H3 style: 14px, 700 weight, 0.02em spacing, used for Task IDs and Tool Names (Uppercase).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-023.4]** Typography: Body UI
- **Type:** UX
- **Description:** Body UI style: 13px, 400 weight, normal spacing, used for default UI text and labels.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-023.5]** Typography: Agent Mono
- **Type:** UX
- **Description:** Agent Mono style: 13px, 450 weight, used for Thoughts (Serif fallback) or Logs (Mono).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-023.6]** Typography: Caption
- **Type:** UX
- **Description:** Caption style: 11px, 400 weight, 0.01em spacing, used for timestamps and token counts.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-024.1]** Signaling Agency via Style
- **Type:** UX
- **Description:** Agentic Reasoning (Thoughts) must be Italic Serif; Human Directives must be Bold System UI; Tool Invocations must be Monospace Bold.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-025.1]** Line Height & Readability Metrics
- **Type:** UX
- **Description:** Narrative blocks (Thoughts) use line-height 1.6; Technical blocks (Logs) use 1.4; UI navigation uses 1.2.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-026]** Font Loading & Anti-Aliasing
- **Type:** Technical
- **Description:** Use `-webkit-font-smoothing: antialiased` for crisp text and treat Serif fonts as system-standard with generic fallback.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-027]** Code Block Typography
- **Type:** UX
- **Description:** Code blocks in logs use weight 450-500 for legibility and must support VSCode font ligatures.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-028]** CJK & Multi-Script Support
- **Type:** Non-Functional
- **Description:** For non-Latin scripts, the system must fallback to host OS defaults to prevent broken rendering.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-029]** Typography: Respect Editor Settings
- **Type:** Technical
- **Description:** The UI must respect `window.zoomLevel` and `editor.fontSize` from VSCode, scaling the typography system proportionally.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-030]** The 4px Base Grid
- **Type:** Technical
- **Description:** Utilize a 4px base increment for all spatial relationships (margins, padding, dimensions).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-031]** $spacing-xs
- **Type:** Technical
- **Description:** Micro-spacing of 4px for icons-to-text and internal component padding.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-032]** $spacing-sm
- **Type:** Technical
- **Description:** Tight-spacing of 8px for list items and card internal padding.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-033]** $spacing-md
- **Type:** Technical
- **Description:** Standard spacing of 16px for section margins and card gaps.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-034]** $spacing-lg
- **Type:** Technical
- **Description:** Layout spacing of 24px between major view regions.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-035]** Fixed Zone Architecture
- **Type:** UX
- **Description:** Divide UI into persistent zones: Left Sidebar (Roadmap, 280px), Main Viewport (Flexible), Right Sidebar (Logs, 320px), Bottom Console (Telemetry, 240px).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-036]** Task Node (DAG) Geometry
- **Type:** Technical
- **Description:** Task DAG nodes must have fixed dimensions of 180px width and 64px height with 1px stroke (normal) or 2.5px (highlighted).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-037]** Card & Container Attributes
- **Type:** UX
- **Description:** Use 4px border radius for containers and 1px solid `--devs-border`. Shadows reserved for elevated states only.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-038]** Interactive Target Sizes
- **Type:** UX
- **Description:** Minimum interactive target size is 24px x 24px; standard buttons have 28px height.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-039]** Depth Perception (Z-Index Strategy)
- **Type:** Technical
- **Description:** Layering hierarchy: Base (0), Navigation (100), Overlays (200), Modals/Gates (300), Critical Alerts (400).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-039.1]** Ultra-Wide Layout Constraint
- **Type:** UX
- **Description:** On viewports > 1920px, the Main Viewport must maintain a max-width of 1200px for readability.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-039.2]** Sidebar Collapse Transformation
- **Type:** UX
- **Description:** When Left Sidebar is < 80px, it must transform into a "Ghost Rail" showing only icons and badges.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-039.4]** Scrollbar Metrics
- **Type:** UX
- **Description:** Scrollbars must be slim (8px width) with 4px radius thumb using `--vscode-scrollbarSlider-background`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-040]** Functional Animation Manifesto
- **Type:** UX
- **Description:** All animations must communicate system state, be fast (< 250ms), and only animate `transform` or `opacity` for performance.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-041]** The Reasoning Pulse (Thinking State)
- **Type:** UX
- **Description:** Active reasoning triggers a subtle opacity pulse (0.6 to 1.0) on the active node and thought header (2000ms duration).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-042.1]** Tool Invocation Shimmer
- **Type:** UX
- **Description:** Tool calls must exhibit a one-time horizontal shimmer effect on the action card.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-042.2]** Active Progress Sweep
- **Type:** UX
- **Description:** Long-running tools must show a 2px indeterminate progress bar sweep (1500ms cycle).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-042.3]** Tool Completion "Pop"
- **Type:** UX
- **Description:** Successful tool completion triggers a `scale(1.02)` pop and a green border flash (500ms decay).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-042.4]** Tool Failure Shake
- **Type:** UX
- **Description:** Tool failure triggers a horizontal shake (±4px) and a red background for the card header.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-043]** Gated Autonomy Attention Pulse
- **Type:** UX
- **Description:** Mandatory approval gates trigger a glowing box-shadow pulse on the primary action button and an amber pulse on the phase icon.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-044]** Directive Injection Feedback
- **Type:** UX
- **Description:** Submission of a directive triggers a success badge toast and a blue border highlight on the next agent thought.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-045.3]** Dependency Flow Highlighting
- **Type:** UX
- **Description:** Selecting a node must highlight upstream and downstream edges with an animated dash-offset effect simulating "Data Flow."
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-046]** Pan & Zoom Inertia
- **Type:** UX
- **Description:** The DAG canvas must implement momentum scrolling (inertia) and semantic zooming (LOD changes at specific zoom levels).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-047]** The Distillation Sweep Animation
- **Type:** UX
- **Description:** Requirement distillation triggers a particle-based animation where text fragments "fly" from document to roadmap list (800ms duration).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-048]** State Recovery Visual (Rewind)
- **Type:** UX
- **Description:** Triggering a rewind applies a temporary grayscale/glitch filter (600ms) to signify state restoration.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-049]** Animation Guardrails (Performance)
- **Type:** Non-Functional
- **Description:** All animations must maintain 60FPS; heavy updates must be offloaded to a Web Worker.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-051]** TUI Layout Zones
- **Type:** Technical
- **Description:** CLI TUI must be divided into 4 zones: Header (3 lines), Main (Context), Telemetry (Thought Stream), and Footer (Control).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-052]** TUI Responsive Reflow
- **Type:** Technical
- **Description:** CLI layout adapts to terminal width: Compact (< 80 chars), Standard (80-120 chars), and Wide (> 120 chars).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-054]** TUI Semantic Prefixes & Icons
- **Type:** UX
- **Description:** TUI must use a tiered icon system: Thought (agent), Action (tool), Success (pass), Failure (fail), Human (user), and Entropy (loop) with ASCII fallbacks.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-055]** TUI Box-Drawing & Indentation
- **Type:** Technical
- **Description:** Tool calls and reasoning must be wrapped in Unicode box-drawing characters with nested calls indented by 2 spaces and dotted lines.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-056]** TUI Keyboard-First Navigation
- **Type:** Functional
- **Description:** TUI must support global hotkeys: P (Pause), R (Rewind), H (Help), Enter (Approve), ESC (Reject), and / (Whisperer).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-058]** TUI Flicker-Free Rendering
- **Type:** Non-Functional
- **Description:** Use React.memo and partial updates for high-frequency streaming; maintain a virtualized scrollback buffer of 1000 lines.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-059]** TUI Secret Redaction
- **Type:** Security
- **Description:** Apply SecretMasker to the TUI stream; redacted strings must be visually distinct using `inverse` or `bgRed`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-060.1]** TUI Terminal Diff Reviewer
- **Type:** Functional
- **Description:** Render side-by-side or unified diffs for TAS/PRD approvals in the terminal with multi-select requirement sign-offs.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-060.2]** Adaptive Layout Engine (Breakpoints)
- **Type:** Technical
- **Description:** UI adapts based on width: Narrow (< 480px), Compact (480-768px), Standard (768-1280px), Wide (1280-1920px), and Ultra (> 1920px).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-062]** Automatic Pane Eviction
- **Type:** UX
- **Description:** If viewport height is < 600px, the Bottom Console minimizes to a "Status Bar" mode (32px).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-063.1]** DAG Semantic Zooming (LOD)
- **Type:** UX
- **Description:** Dynamic Level-of-Detail for DAG: LOD-3 (Full details), LOD-2 (Titles/Dots), LOD-1 (Epic bounding boxes only).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-064.1]** Contrast Enforcement
- **Type:** Non-Functional
- **Description:** All text-to-background ratios must exceed 4.5:1 (7:1 in High Contrast themes) to meet WCAG 2.1 AA.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-064.3]** Aria-Live Annunciation
- **Type:** Non-Functional
- **Description:** Use non-visual `aria-live` buffer to announce agentic events without disrupting user focus.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-066.1]** Skeleton Shimmer Logic
- **Type:** UX
- **Description:** Render skeleton loaders during initial project hydration using gradients derived from VSCode tokens.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-066.2]** The "Disconnected" Mask
- **Type:** UX
- **Description:** If MCP connection drops, apply a semi-transparent blur overlay and a "Reconnecting" toast.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-067]** Hardware-Aware Rendering (Power Optimization)
- **Type:** Non-Functional
- **Description:** Throttle DAG Canvas from 60FPS to 15FPS if Battery Saver mode is detected.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-070]** Dashboard Command Center
- **Type:** Functional
- **Description:** Dashboard must show Epic Progress Radial, Activity Feed (last 10 commits), Health Telemetry (Token/Coverage/Pass Rate), and Phase Stepper.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-071]** Research Suite Multi-Pane discovery
- **Type:** Functional
- **Description:** Tabbed view for Phase 1 results with Source Tooltips (hoverable citations) and Tech Stack Decision Matrix.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-072]** Gated Spec Review Interface
- **Type:** Functional
- **Description:** Dual-pane review for Phase 2: Markdown source on left, Mermaid diagrams on right, with mandatory sign-off checkboxes for all requirements.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-074]** Agent Console (Implementation Lab)
- **Type:** Functional
- **Description:** Phase 4 active view: Central Thought Stream (Serif), Tool Log (Right Sidebar), and Sandbox Terminal (Bottom).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-080]** The Directive Whisperer Field
- **Type:** Functional
- **Description:** Context-aware injection field (Cmd+K) with `@` (files) and `#` (requirements) autocomplete and an "Immediate Pivot" toggle.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-090]** Interactive Mermaid Blueprint Rendering
- **Type:** Technical
- **Description:** Auto-sync diagrams on file save (200ms), provide pan/zoom controls, and link nodes to source definitions.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-091]** Agentic Profiling Dashboard
- **Type:** Functional
- **Description:** Visual representation of CPU execution (Flamegraphs) and memory allocation (Heap Treemaps) captured via ProjectServer.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-100]** Entropy & Loop Glitch State
- **Type:** UX
- **Description:** Detect repeating hashes (>3) and pulse active thought block red with a shake effect, presenting a Root Cause Analysis modal.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-102]** Sandbox Breach Alert
- **Type:** Security
- **Description:** Display a high-priority red banner across the entire UI if a container escape attempt is detected.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-103]** Token Budget Overrun Warning
- **Type:** Non-Functional
- **Description:** Mask the "Run" button with a yellow overlay when the project exceeds 80% of its USD budget.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-110]** AOD Contextual Guidance Display
- **Type:** UX
- **Description:** Module hover in file view must show `.agent.md` documentation summaries and highlight "Agentic Hooks" in the code gutter.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-121]** Forced Contrast Mode Resilience
- **Type:** Non-Functional
- **Description:** In High Contrast themes, alpha-blended backgrounds must revert to solid colors with high-contrast borders for WCAG 2.1 compliance.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None
