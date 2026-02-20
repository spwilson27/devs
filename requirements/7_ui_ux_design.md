# Requirements from UI/UX Design (specs/7_ui_ux_design.md)

## 1. Design System Philosophy & Aesthetic

### **[REQ-UI-DES-001]** The Glass-Box Philosophy (Observability-Driven Design)
- **Type:** UX
- **Description:** The visual language must be rooted in transparency, information density, and technical authority, exposing complexity through structured, auditable telemetry to eliminate the "Magic Gap" of agentic intent.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-002]** Visual Hierarchy of Agency (Source of Truth levels)
- **Type:** UX
- **Description:** UI elements are prioritized based on their "Source of Truth" (SoT) level to determine z-index, contrast ratio, and font-weight.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-002-1]** Level 1: Human Authority (Directives)
- **Type:** UX
- **Description:** Rendered using high-contrast borders and bold weights as the highest priority command overrides.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-002]

### **[REQ-UI-DES-002-2]** Level 2: Agent Autonomy (Reasoning/Logic)
- **Type:** UX
- **Description:** Rendered using a distinct narrative serif font and alpha-blended backgrounds to represent internal state.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-002]

### **[REQ-UI-DES-002-3]** Level 3: Environmental Fact (Files/Logs/Tests)
- **Type:** UX
- **Description:** Rendered in raw, monospaced blocks to represent the external reality the agent is acting upon.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-002]

### **[REQ-UI-DES-003]** Deterministic Layout & Telemetry Anchors
- **Type:** UX
- **Description:** Components MUST maintain fixed, immutable anchors for critical project telemetry like Active Task, Current Phase, and Cumulative USD Spend.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-003-1]** Fixed Zones
- **Type:** UX
- **Description:** The top-right quadrant is reserved for "System Health" and the left sidebar for "Context & Navigation".
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-003]

### **[REQ-UI-DES-003-2]** No-Drawer Policy
- **Type:** UX
- **Description:** Core architectural state must never be hidden behind drawers or modals unless for secondary editing.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-003]

### **[REQ-UI-DES-004]** High-Density Signal-to-Noise Ratio
- **Type:** UX
- **Description:** Prioritize a high data-to-pixel ratio over whitespace-heavy designs.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-004-1]** Sparklines & Indicators
- **Type:** UX
- **Description:** Use micro-visualizations (sparklines) for resource consumption and status dots for requirement fulfillment.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-004]

### **[REQ-UI-DES-004-2]** Technical Conciseness
- **Type:** UX
- **Description:** Labels must be authoritative and brief (e.g., "REQ-ID: 402").
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-004]

### **[REQ-UI-DES-005]** Platform-Native "Ghost" Integration
- **Type:** UX
- **Description:** The UI must feel like an extension of VSCode, not an external web application.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-005-1]** Token Compliance
- **Type:** Technical
- **Description:** Mandatory use of VSCode design tokens (`--vscode-*` variables) for all primary UI elements.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-005]

### **[REQ-UI-DES-005-2]** Codicon Utilization
- **Type:** UX
- **Description:** Exclusive use of the `@vscode/codicons` library for iconography.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-005]

### **[REQ-UI-DES-006]** Meaningful & Non-Decorated Motion
- **Type:** UX
- **Description:** Animations are prohibited unless they serve a functional state-transition purpose.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-006-1]** Functional Motion
- **Type:** UX
- **Description:** Permitted for showing "Flow of Data" or "System Pulsing".
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-006]

### **[REQ-UI-DES-006-2]** Anti-Magic Rule
- **Type:** UX
- **Description:** No decorative fade-ins or sliding; transitions must be fast (< 200ms) with standard engineering easing.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-006]

### **[REQ-UI-DES-007]** The "Agent-Ready" Visual Contract
- **Type:** UX
- **Description:** Design must be consistent and predictable for "Visual Reviewer" agents to accurately parse UI state via screenshots.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-008]** Technical Unknowns & Design Risks
- **Type:** UX
- **Description:** Manage design risks through LOD toggles and strict reliance on semantic tokens.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-RISK-001]** Dashboard Fatigue
- **Type:** UX
- **Description:** Mitigation: Implementation of "LOD" (Level of Detail) toggles to collapse technical telemetry for non-architect users.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-RISK-002]** Theme Resilience Risk
- **Type:** Technical
- **Description:** Risk of theme breakage across 1,000+ themes. Mitigation: Strict reliance on standard VSCode semantic tokens.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

## 2. Color Palette & Theming

### **[REQ-UI-DES-010]** Token Anchoring
- **Type:** Technical
- **Description:** All semantic colors MUST be derived from or mapped to standard VSCode theme tokens.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-011]** --devs-primary (Action/Focus)
- **Type:** Technical
- **Description:** Mapped to `--vscode-focusBorder`. Used for primary buttons and active node highlights.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-010]

### **[REQ-UI-DES-012]** --devs-success (Validated/Pass)
- **Type:** Technical
- **Description:** Mapped to `--vscode-testing-iconPassed`. Used for task completion and met requirements.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-010]

### **[REQ-UI-DES-013]** --devs-error (Failure/Critical)
- **Type:** Technical
- **Description:** Mapped to `--vscode-errorForeground`. Used for TDD failures and security breaches.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-010]

### **[REQ-UI-DES-014]** --devs-warning (Entropy/Risk)
- **Type:** Technical
- **Description:** Mapped to `--vscode-warningForeground`. Used for strategy loops and budget thresholds.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-010]

### **[REQ-UI-DES-015]** --devs-thinking (Agent Narrative)
- **Type:** Technical
- **Description:** Mapped to `--vscode-symbolIcon-propertyForeground`. Used for narrative reasoning.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-010]

### **[REQ-UI-DES-016]** --devs-border (UI Boundaries)
- **Type:** Technical
- **Description:** Mapped to `--vscode-panel-border`. Used for card strokes and sidebar dividers.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-010]

### **[REQ-UI-DES-017]** --devs-muted (Ghost/Metadata)
- **Type:** Technical
- **Description:** Mapped to `--vscode-descriptionForeground`. Used for timestamps and metadata.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-010]

### **[REQ-UI-DES-018]** Multi-Layer Compositing
- **Type:** Technical
- **Description:** Backgrounds for agentic content utilize `color-mix()` for a "Glass-Box" effect.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-019]** --devs-bg-thought (Reasoning Block)
- **Type:** Technical
- **Description:** `color-mix(in srgb, var(--vscode-editor-background), var(--devs-thinking) 8%)`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-018], [REQ-UI-DES-015]

### **[REQ-UI-DES-020]** --devs-bg-task-active (Running Node)
- **Type:** Technical
- **Description:** `color-mix(in srgb, var(--vscode-editor-lineHighlightBackground), var(--devs-primary) 12%)`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-018], [REQ-UI-DES-011]

### **[REQ-UI-DES-021]** --devs-bg-terminal (Log Block)
- **Type:** Technical
- **Description:** Fixed: `#0D1117` (Dark) / `#F6F8FA` (Light).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-018]

### **[REQ-UI-DES-022]** --devs-bg-diff-add (Implementation +)
- **Type:** Technical
- **Description:** `color-mix(in srgb, var(--vscode-editor-background), var(--devs-success) 15%)`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-018], [REQ-UI-DES-012]

### **[REQ-UI-DES-023]** --devs-bg-diff-sub (Implementation -)
- **Type:** Technical
- **Description:** `color-mix(in srgb, var(--vscode-editor-background), var(--devs-error) 15%)`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-018], [REQ-UI-DES-013]

### **[REQ-UI-DES-024]** ANSI Palette Calibration
- **Type:** Technical
- **Description:** Map semantic palette to standard ANSI escape codes for consistent terminal rendering.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-024-1]** ANSI Success (Green)
- **Type:** Technical
- **Description:** ANSI 2 / ANSI 10.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-024]

### **[REQ-UI-DES-024-2]** ANSI Error (Red)
- **Type:** Technical
- **Description:** ANSI 1 / ANSI 9.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-024]

### **[REQ-UI-DES-024-3]** ANSI Thinking (Magenta)
- **Type:** Technical
- **Description:** ANSI 5 / ANSI 13.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-024]

### **[REQ-UI-DES-024-4]** ANSI Warning (Yellow)
- **Type:** Technical
- **Description:** ANSI 3 / ANSI 11.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-024]

### **[REQ-UI-DES-024-5]** ANSI Metadata (Grey)
- **Type:** Technical
- **Description:** ANSI 8 (Bright Black).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-024]

### **[REQ-UI-DES-025]** High-Contrast (HC) Theme Support
- **Type:** Technical
- **Description:** Explicit overrides for High Contrast themes to ensure accessibility.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-025-1]** Background Simplification
- **Type:** Technical
- **Description:** In HC mode, alpha-blended backgrounds revert to solid background colors.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-025]

### **[REQ-UI-DES-025-2]** Border Emphasis
- **Type:** Technical
- **Description:** Increase border width to 2px using `var(--vscode-contrastBorder)`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-025]

### **[REQ-UI-DES-025-3]** Text Luminance
- **Type:** Technical
- **Description:** Verify semantic text colors against 7:1 contrast ratio (WCAG AAA).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-025]

### **[REQ-UI-DES-026]** Theme Switching Latency
- **Type:** Technical
- **Description:** UI must react to theme changes within 50ms without triggering full re-renders of the Task DAG.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-027]** Agentic Differentiators (Multi-Agent Support)
- **Type:** UX
- **Description:** Use secondary accent tints from `symbolIcon` palette to differentiate agent thought headers.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-027-1]** Developer Color
- **Type:** UX
- **Description:** `--vscode-symbolIcon-functionForeground` (Blue/Cyan).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-027]

### **[REQ-UI-DES-027-2]** Reviewer Color
- **Type:** UX
- **Description:** `--vscode-symbolIcon-variableForeground` (Orange/Amber).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-027]

### **[REQ-UI-DES-027-3]** Architect Color
- **Type:** UX
- **Description:** `--vscode-symbolIcon-classForeground` (Green/Teal).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-027]

### **[REQ-UI-DES-028]** The "Red-Screen" Security Alert
- **Type:** Security
- **Description:** In event of sandbox breach, override theme with red overlay and thick error borders.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

## 3. Typography System

### **[REQ-UI-DES-030]** Typography Philosophy (Semantic Separation)
- **Type:** UX
- **Description:** Create immediate cognitive distinction between human input, agent reasoning, and system output via font families and scales.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-031]** Interface Hierarchy (Tiered Fonts)
- **Type:** UX
- **Description:** Tri-modal font system: System UI (Sans), Agent Thought (Serif), Technical Logs (Mono).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-031-1]** System UI Font
- **Type:** UX
- **Description:** Native system sans-serif stack; 13px-14px / 400 weight.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-031]

### **[REQ-UI-DES-031-2]** Agent Thought Font
- **Type:** UX
- **Description:** Serif stack (Georgia, Times New Roman); 15px-16px / 400 weight.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-031]

### **[REQ-UI-DES-031-3]** Technical Logs Font
- **Type:** UX
- **Description:** Monospace stack (inherited from VSCode); 12px-13px / 450 weight.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-031]

### **[REQ-UI-DES-032]** VSCode Editor Font Inheritance
- **Type:** Technical
- **Description:** Technical Logs and Source Code views MUST inherit user's active VSCode editor font settings.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-033]** Standardized Type Scale
- **Type:** UX
- **Description:** Compact, non-linear scale for high information density.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-033-1]** Display H1
- **Type:** UX
- **Description:** 22px / 600 weight; for Project Title and Epic Headers.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-033]

### **[REQ-UI-DES-033-2]** Header H2
- **Type:** UX
- **Description:** 18px / 600 weight; for Phase Headers.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-033]

### **[REQ-UI-DES-033-3]** Subhead H3
- **Type:** UX
- **Description:** 14px / 700 weight; for Task IDs and Tool Names.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-033]

### **[REQ-UI-DES-033-4]** Body UI
- **Type:** UX
- **Description:** 13px / 400 weight; default UI text.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-033]

### **[REQ-UI-DES-033-5]** Agent Mono/Serif Body
- **Type:** UX
- **Description:** 13px / 450 weight; for thoughts and logs.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-033]

### **[REQ-UI-DES-033-6]** Caption
- **Type:** UX
- **Description:** 11px / 400 weight; for timestamps and metadata.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-033]

### **[REQ-UI-DES-034]** Signaling Agency via Style
- **Type:** UX
- **Description:** Use specific styles to signal agent reasoning, human directives, and tool actions.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-034-1]** Agentic Reasoning (Thoughts)
- **Type:** UX
- **Description:** MUST be rendered in Italic Serif for a "journalistic" feel.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-034]

### **[REQ-UI-DES-034-2]** Human Directives (Directives)
- **Type:** UX
- **Description:** MUST be rendered in Bold System UI with `--devs-primary` accent.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-034]

### **[REQ-UI-DES-034-3]** Tool Invocations (Actions)
- **Type:** UX
- **Description:** MUST use Monospace Bold for tool names (e.g., `READ_FILE`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-034]

### **[REQ-UI-DES-035]** Line Height & Readability Metrics
- **Type:** UX
- **Description:** Specific line-heights for narrative blocks (1.6), technical blocks (1.4), and navigation (1.2).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-035-1]** Narrative Line-Height
- **Type:** UX
- **Description:** 1.6 for thought scanning.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-035]

### **[REQ-UI-DES-035-2]** Technical Line-Height
- **Type:** UX
- **Description:** 1.4 for density and separation.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-035]

### **[REQ-UI-DES-035-3]** UI Nav Line-Height
- **Type:** UX
- **Description:** 1.2 for compact navigation.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-035]

### **[REQ-UI-DES-036]** Font Loading & Anti-Aliasing
- **Type:** Technical
- **Description:** Use subpixel rendering and efficient webfont strategies.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-036-1]** Subpixel Rendering
- **Type:** Technical
- **Description:** MUST use `-webkit-font-smoothing: antialiased`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-036]

### **[REQ-UI-DES-036-2]** Webfont Strategy
- **Type:** Technical
- **Description:** Use system-standard serifs; fallback to generic `serif` to avoid heavy downloads.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-036]

### **[REQ-UI-DES-037]** Code Block Typography
- **Type:** UX
- **Description:** Heavier weights for logs (450/500) and support for font ligatures.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-037-1]** Log Font Weight
- **Type:** UX
- **Description:** SHOULD use 450 or 500 weight for real-time streaming legibility.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-037]

### **[REQ-UI-DES-037-2]** Ligature Support
- **Type:** Technical
- **Description:** MUST support `font-variant-ligatures: contextual` if enabled in VSCode.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-037]

### **[REQ-UI-DES-038]** CJK & Multi-Script Support
- **Type:** Technical
- **Description:** Fallback chain for non-Latin scripts to host OS defaults.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-038-1]** Multi-Script Fallback Chain
- **Type:** Technical
- **Description:** For Non-Latin scripts (CJK), the system MUST fallback to the host OS defaults (e.g., PingFang SC, Meiryo).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-038]

### **[REQ-UI-DES-039]** Readability Edge Cases
- **Type:** UX
- **Description:** Respect VSCode zoom/font settings and handle high-contrast weight increases.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-039-1]** Variable Font Size
- **Type:** UX
- **Description:** MUST respect `window.zoomLevel` and `editor.fontSize` scaling proportionally.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-039]

### **[REQ-UI-DES-039-2]** High Contrast Weight
- **Type:** UX
- **Description:** Increase header weights in HC themes.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-039]

### **[REQ-UI-UNK-001]** Serif Override Restriction
- **Type:** UX
- **Description:** User should NOT be allowed to override "Agent Thought" serif font as it's a critical semantic marker.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-RISK-003]** Low-DPI Serif Legibility
- **Type:** UX
- **Description:** Mitigation: Implementation of "Monospace Only" mode for accessibility if subpixel rendering fails.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

## 4. Spacing, Grid & Layout Metrics

### **[REQ-UI-DES-040]** The 4px Base Grid (Deterministic Spacing)
- **Type:** Technical
- **Description:** All margins, padding, and component dimensions MUST be multiples of 4px.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-041]** $spacing-xs (4px)
- **Type:** Technical
- **Description:** Micro-spacing: Icons to text, internal component padding.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-040]

### **[REQ-UI-DES-042]** $spacing-sm (8px)
- **Type:** Technical
- **Description:** Tight-spacing: List items, card internal padding.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-040]

### **[REQ-UI-DES-043]** $spacing-md (16px)
- **Type:** Technical
- **Description:** Standard: Section margins, between cards.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-040]

### **[REQ-UI-DES-044]** $spacing-lg (24px)
- **Type:** Technical
- **Description:** Layout: Between major view regions.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-040]

### **[REQ-UI-DES-044-1]** $spacing-xl (32px)
- **Type:** Technical
- **Description:** Visual separation for distinct agentic phases.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-040]

### **[REQ-UI-DES-044-2]** $spacing-xxl (48px)
- **Type:** Technical
- **Description:** Hero spacing for empty states.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-040]

### **[REQ-UI-DES-045]** The Fixed Zone Architecture
- **Type:** UX
- **Description:** Persistent resizable zones for Roadmap, Viewport, Aux Sidebar, and Bottom Console.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-003]

### **[REQ-UI-DES-045-1]** Left Sidebar Zone
- **Type:** UX
- **Description:** Width: 280px (Resizable); for Epic Roadmap/Map.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-045]

### **[REQ-UI-DES-045-2]** Main Viewport Zone
- **Type:** UX
- **Description:** Flexible (`flex-grow: 1`); for Dashboard/DAG/Spec.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-045]

### **[REQ-UI-DES-045-3]** Right Sidebar Zone
- **Type:** UX
- **Description:** Width: 320px (Collapsible); for Logs/Docs.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-045]

### **[REQ-UI-DES-045-4]** Bottom Console Zone
- **Type:** UX
- **Description:** Height: 240px (Resizable); for Terminal/Thought Stream.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-045]

### **[REQ-UI-DES-046]** Task Node (DAG) Geometry
- **Type:** Technical
- **Description:** Specific dimensions and edge weights for the performance-sensitive Task DAG.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-046-1]** Node Dimensions
- **Type:** Technical
- **Description:** Width 180px, Height 64px (fixed).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-046]

### **[REQ-UI-DES-046-2]** Node Internal Padding
- **Type:** Technical
- **Description:** $spacing-sm (8px).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-046]

### **[REQ-UI-DES-046-3]** Edge Weight
- **Type:** Technical
- **Description:** 1px stroke (normal) / 2.5px stroke (highlighted).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-046]

### **[REQ-UI-DES-046-4]** Port Spacing
- **Type:** Technical
- **Description:** Input/Output ports vertically centered.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-046]

### **[REQ-UI-DES-047]** Card & Container Attributes
- **Type:** UX
- **Description:** 4px radius and 1px border; shadows only for elevated states.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-047-1]** Border Radius
- **Type:** UX
- **Description:** 4px (Rigid, professional feel).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-047]

### **[REQ-UI-DES-047-2]** Border Width
- **Type:** UX
- **Description:** 1px solid `var(--devs-border)`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-047]

### **[REQ-UI-DES-047-3]** Elevation Shadows
- **Type:** UX
- **Description:** Only used for Modals and Overlays.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-047]

### **[REQ-UI-DES-047-3-1]** shadow-sm
- **Type:** UX
- **Description:** `0 2px 4px rgba(0,0,0,0.15)`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-047-3]

### **[REQ-UI-DES-047-3-2]** shadow-md
- **Type:** UX
- **Description:** `0 8px 24px rgba(0,0,0,0.30)`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-047-3]

### **[REQ-UI-DES-048]** Interactive Target Sizes
- **Type:** UX
- **Description:** Minimum targets and standard button heights optimized for mouse precision in VSCode.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-048-1]** Min Target Size
- **Type:** UX
- **Description:** 24px x 24px minimum.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-048]

### **[REQ-UI-DES-048-2]** Standard Button Height
- **Type:** UX
- **Description:** Height 28px, Horizontal Padding 12px.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-048]

### **[REQ-UI-DES-049]** Depth Perception (Z-Index Hierarchy)
- **Type:** UX
- **Description:** Layering MUST reflect the SoT hierarchy across 5 distinct levels.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-002]

### **[REQ-UI-DES-049-Z0]** Level 0 (Base)
- **Type:** UX
- **Description:** z-index: 0; Workspace, Dashboard tiles, Background logs.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-049]

### **[REQ-UI-DES-049-Z1]** Level 1 (Navigation)
- **Type:** UX
- **Description:** z-index: 100; Sticky headers, Sidebar nav, Fixed phase-stepper.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-049]

### **[REQ-UI-DES-049-Z2]** Level 2 (Overlays)
- **Type:** UX
- **Description:** z-index: 200; Tooltip previews, "Whisper" field (active), Tool call expansion.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-049]

### **[REQ-UI-DES-049-Z3]** Level 3 (Modals)
- **Type:** UX
- **Description:** z-index: 300; HITL Approval gates, Diff reviewers, Strategy pivot analysis.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-049]

### **[REQ-UI-DES-049-Z4]** Level 4 (Critical)
- **Type:** UX
- **Description:** z-index: 400; Sandbox Breach Alerts, System Crashes.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-049]

### **[REQ-UI-DES-049-1]** Ultra-Wide Support
- **Type:** UX
- **Description:** Viewports > 1920px MUST maintain max-width: 1200px (centered) for readability.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-049-2]** Sidebar Collapse
- **Type:** UX
- **Description:** Left Sidebar < 80px MUST transform into a "Ghost Rail" showing only icons and badges.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-049-3]** Information Density Scaling
- **Type:** UX
- **Description:** If task count > 100, reduce node spacing to maintain global view.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-049-4]** Scrollbar Metrics
- **Type:** UX
- **Description:** Slim 8px width with 4px radius; use VSCode scrollbar tokens.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

## 5. Interactive States & Micro-Animations

### **[REQ-UI-DES-050]** Functional Animation Manifesto
- **Type:** UX
- **Description:** All animations MUST be fast (< 250ms), use engineering easing, and serve functional state communication.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-051]** The Reasoning Pulse (Thinking State)
- **Type:** UX
- **Description:** Subtle opacity pulse to communicate "Live Activity" during agent reasoning.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-051-1]** Pulse Visual
- **Type:** UX
- **Description:** Opacity pulse (0.6 to 1.0) on active DAG node and ThoughtStreamer header.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-051]

### **[REQ-UI-DES-051-2]** Pulse Timing
- **Type:** UX
- **Description:** 2000ms duration, infinite sinusoidal loop.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-051]

### **[REQ-UI-DES-051-3]** Pulse Logic
- **Type:** Technical
- **Description:** Triggered by `AGENT_THOUGHT_STREAM`; terminated by `TOOL_LIFECYCLE:INVOKED`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-051]

### **[REQ-UI-DES-052]** Tool Execution Micro-Animations
- **Type:** UX
- **Description:** Visual feedback for tool invocation, progress, and results (shimmer, sweep, pop, shake).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-052-1]** Invocation Shimmer
- **Type:** UX
- **Description:** One-time horizontal shimmer effect on tool call.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-052]

### **[REQ-UI-DES-052-2]** Active Progress Sweep
- **Type:** UX
- **Description:** 2px indeterminate progress bar with 1500ms cycle for long tools.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-052]

### **[REQ-UI-DES-052-3]** Completion "Pop"
- **Type:** UX
- **Description:** `scale(1.02)` pop and success border-flash (500ms decay).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-052]

### **[REQ-UI-DES-052-4]** Failure Shake
- **Type:** UX
- **Description:** Horizontal shake and error background shift on tool failure.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-052]

### **[REQ-UI-DES-053]** Gated Autonomy Highlighting (Attention Pulse)
- **Type:** UX
- **Description:** Guide user to resolution point during mandatory approval gates.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-053-1]** Approval Button Pulse
- **Type:** UX
- **Description:** Glowing box-shadow pulse on approval buttons or directive fields.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-053]

### **[REQ-UI-DES-053-2]** Secondary Indicator Pulse
- **Type:** UX
- **Description:** Sidebar phase stepper icon pulses amber.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-053]

### **[REQ-UI-DES-053-3]** Interaction Termination
- **Type:** UX
- **Description:** Pulse MUST terminate upon user interaction or keyboard focus.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-053]

### **[REQ-UI-DES-054]** Directive Injection Feedback
- **Type:** UX
- **Description:** Visual confirmation (badge and highlight) of user directive ingestion.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-054-1]** Success Badge
- **Type:** UX
- **Description:** Transient "Directive Injected" badge sliding in (+20px Y-offset).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-054]

### **[REQ-UI-DES-054-2]** Badge Persistence
- **Type:** UX
- **Description:** Visible for 3000ms, then fades over 500ms.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-054]

### **[REQ-UI-DES-054-3]** Thought Block Highlight
- **Type:** UX
- **Description:** One-time light-blue border on next thought block to show ingestion.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-054]

### **[REQ-UI-DES-055]** Node Interaction & Focus States
- **Type:** UX
- **Description:** Hover elevation, selection anchors, and animated dependency flow highlighting.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-055-1]** Hover Elevation
- **Type:** UX
- **Description:** `scale(1.05)` and `shadow-md` on node hover.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-055]

### **[REQ-UI-DES-055-2]** Selection Anchor
- **Type:** UX
- **Description:** 3px border and smooth `d3-zoom` centering (500ms).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-055]

### **[REQ-UI-DES-055-3]** Dependency Flow Highlighting
- **Type:** UX
- **Description:** Animated dash-offset effect on edges simulating data flow.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-055]

### **[REQ-UI-DES-056]** Pan & Zoom Inertia
- **Type:** Technical
- **Description:** Implementation of momentum scrolling and semantic zooming logic.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-056-1]** Momentum Physics
- **Type:** Technical
- **Description:** Decelerate pans gracefully over 400ms.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-056]

### **[REQ-UI-DES-056-2]** Semantic Zooming Levels
- **Type:** UX
- **Description:** Zoom < 0.4 hides titles; Zoom < 0.1 hides tasks in favor of Epics.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-056]

### **[REQ-UI-DES-057]** The Distillation Sweep (Phase 2 to 3)
- **Type:** UX
- **Description:** Particle-based "Waterfall" animation showing requirements flying from spec to roadmap.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-057-1]** Sweep Visual
- **Type:** UX
- **Description:** Particle fly-in from TAS/PRD preview to Roadmap list.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-057]

### **[REQ-UI-DES-057-2]** Sweep Implementation
- **Type:** Technical
- **Description:** Particle-based animation of text fragments.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-057]

### **[REQ-UI-DES-057-3]** Sweep Duration
- **Type:** UX
- **Description:** 800ms total, staggered by 50ms per requirement.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-057]

### **[REQ-UI-DES-058]** State Recovery & Rewind (Time-Travel)
- **Type:** UX
- **Description:** Visual glitch filter and "State Restored" toast during rewind.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-058-1]** Rewind Visual
- **Type:** UX
- **Description:** 600ms grayscale/brightness glitch filter during restoration.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-058]

### **[REQ-UI-DES-058-2]** Restoration Feedback
- **Type:** UX
- **Description:** "State Restored" toast with new Task ID.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-058]

### **[REQ-UI-DES-059]** Animation Guardrails
- **Type:** Technical
- **Description:** 60FPS target, support for reduced motion, and Web Worker layout offloading.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-059-1]** FPS Target
- **Type:** Technical
- **Description:** MUST maintain 60FPS on standard developer machine (e.g. M1).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-059]

### **[REQ-UI-DES-059-2]** Disabling Motion
- **Type:** UX
- **Description:** Respect `prefers-reduced-motion` and use static indicators.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-059]

### **[REQ-UI-DES-059-3]** Threading
- **Type:** Technical
- **Description:** Offload DAG layout updates to a Web Worker.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-059]

### **[REQ-UI-RISK-004]** Animation Stuttering
- **Type:** Technical
- **Description:** Mitigation: Implementation of global "Animation Throttler" that drops frames if CPU > 30%.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-UNK-002]** Thinking Pulse Color-coding
- **Type:** UX
- **Description:** Recommendation: Keep it neutral; use LogTerminal for confidence scores.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

## 6. CLI TUI (Ink) Design Rules

### **[REQ-UI-DES-060]** TUI Philosophy (Minimalist Authority)
- **Type:** UX
- **Description:** Keyboard-driven "Glass-Box" telemetry using Ink and Chalk, prioritizing vertical flow and high-density text.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-061]** Terminal Layout Zones
- **Type:** UX
- **Description:** Interface divided into 4 persistent zones using Ink's Flexbox engine.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-061-1]** TUI Header
- **Type:** UX
- **Description:** 3 lines height; Fixed top; shows Project/Phase/Health.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-061]

### **[REQ-UI-DES-061-2]** TUI Main
- **Type:** UX
- **Description:** Flexible height; shows Roadmap and Active Task.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-061]

### **[REQ-UI-DES-061-3]** TUI Telemetry
- **Type:** UX
- **Description:** Min-height 10; flex-grow: 1; shows Thought Stream and Logs.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-061]

### **[REQ-UI-DES-061-4]** TUI Footer
- **Type:** UX
- **Description:** 2 lines height; Fixed bottom; shows Shortcuts and Whisper Field.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-061]

### **[REQ-UI-DES-062]** Responsive Reflow (Terminal Constraints)
- **Type:** Technical
- **Description:** Switch layout based on terminal width: Compact (<80), Standard (80-120), Wide (>120).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-062-1]** TUI Compact Mode
- **Type:** Technical
- **Description:** Single vertical stack; hide Roadmap in favor of breadcrumb.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-062]

### **[REQ-UI-DES-062-2]** TUI Standard Mode
- **Type:** Technical
- **Description:** Side-by-side (25%/75%) layout for Sidebar/Main.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-062]

### **[REQ-UI-DES-062-3]** TUI Wide Mode
- **Type:** Technical
- **Description:** Tri-pane layout (Roadmap, Implementation, Docs).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-062]

### **[REQ-UI-DES-063]** ANSI Token Mapping
- **Type:** Technical
- **Description:** Map VSCode semantic tokens to ANSI equivalents (TrueColor, 256-color, or 16-color).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-010]

### **[REQ-UI-DES-063-1]** TrueColor Support
- **Type:** Technical
- **Description:** Use 24-bit hex codes if supported by chalk.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-063]

### **[REQ-UI-DES-063-2]** 256-Color Fallback
- **Type:** Technical
- **Description:** Fallback mapping for older terminals.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-063]

### **[REQ-UI-DES-063-3]** 16-Color Fallback
- **Type:** Technical
- **Description:** High-contrast fallback using standard ANSI constants.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-063]

### **[REQ-UI-DES-064]** Semantic Prefixes & Unicode Fallbacks
- **Type:** UX
- **Description:** Iconography mapping for Thought, Action, Success, Failure, Human, and Entropy.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-064-1]** Thought Prefix
- **Type:** UX
- **Description:** `(agent) »` / `(agent) >` (magentaItalic).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-064]

### **[REQ-UI-DES-064-2]** Action Prefix
- **Type:** UX
- **Description:** `[tool]  ⚙` / `[tool]  *` (blueBold).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-064]

### **[REQ-UI-DES-064-3]** Success Prefix
- **Type:** UX
- **Description:** `[pass]  ✔` / `[pass]  V` (green).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-064]

### **[REQ-UI-DES-064-4]** Failure Prefix
- **Type:** UX
- **Description:** `[fail]  ✘` / `[fail]  X` (red).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-064]

### **[REQ-UI-DES-064-5]** Human Prefix
- **Type:** UX
- **Description:** `(user)  👤` / `(user)  U` (cyanBold).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-064]

### **[REQ-UI-DES-064-6]** Entropy Prefix
- **Type:** UX
- **Description:** `[loop]  ∞` / `[loop]  @` (yellowBright).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-064]

### **[REQ-UI-DES-065]** Box-Drawing & Action Cards
- **Type:** UX
- **Description:** Wrap turns in Unicode box-drawing characters and maintain indentation hierarchy.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-065-1]** Structured Blocks
- **Type:** UX
- **Description:** MUST be wrapped in Unicode box-drawing characters (┌, ─, ┐, etc.).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-065]

### **[REQ-UI-DES-065-2]** Indentation Hierarchy
- **Type:** UX
- **Description:** Nested tool calls indented by 2 spaces with dotted vertical lines.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-065]

### **[REQ-UI-DES-066]** Keyboard-First Navigation (Hotkeys)
- **Type:** UX
- **Description:** Mandatory hotkeys: P (Pause), R (Rewind), H (Help), Enter (Approve), ESC (Reject), / (Whisper), Arrows/TAB (Nav).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-066-1]** Global Action Keys
- **Type:** UX
- **Description:** P (Pause/Resume), R (Rewind Menu), H (Help/Keymap).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-066]

### **[REQ-UI-DES-066-2]** Phase Gate Keys
- **Type:** UX
- **Description:** Enter (Approve/Proceed), ESC (Reject/Back).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-066]

### **[REQ-UI-DES-066-3]** Whisper Key
- **Type:** UX
- **Description:** `/` (slash) or `W` focuses Directive input.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-066]

### **[REQ-UI-DES-066-4]** Task Nav Keys
- **Type:** UX
- **Description:** Up/Down to navigate Roadmap; TAB to switch focus.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-066]

### **[REQ-UI-DES-067]** TUI Focus Management
- **Type:** UX
- **Description:** Clear active focus using double-line borders (║).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-068]** Flicker-Free Rendering (Memoization)
- **Type:** Technical
- **Description:** Use `React.memo` and virtualized scrollback buffer (1000 lines) to minimize load.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-068-1]** State Optimization
- **Type:** Technical
- **Description:** Only `LogTerminal` re-renders on character data arrivals.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-068]

### **[REQ-UI-DES-068-2]** Scrollback Buffer
- **Type:** Technical
- **Description:** Maintain virtualized buffer of 1000 lines using Ink `Static` components.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-068]

### **[REQ-UI-DES-069]** Secret Redaction (TUI Integration)
- **Type:** Security
- **Description:** `SecretMasker` MUST be applied to TUI stream; redacted strings highlighted (inverse/bgRed).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-070]** The Terminal Diff Reviewer
- **Type:** UX
- **Description:** Unified diff rendering and `ink-select-input` for requirement sign-offs.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-070-1]** Diff Visuals
- **Type:** UX
- **Description:** Side-by-side or unified diff using +/- syntax.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-070]

### **[REQ-UI-DES-070-2]** Multi-Select logic
- **Type:** UX
- **Description:** Use `ink-select-input` for requirement sign-offs via `Space`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-070]

### **[REQ-UI-RISK-005]** Terminal Resizing Crash
- **Type:** Technical
- **Description:** Mitigation: Implementation of `ResizeObserver` for full layout re-calculation.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-UNK-003]** TUI Mouse Interaction
- **Type:** UX
- **Description:** Recommendation: No; maintain 100% keyboard-driven interface.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

## 7. Responsive & Adaptive Rules

### **[REQ-UI-DES-080]** The Adaptive Layout Engine
- **Type:** Technical
- **Description:** "Fluid-to-Linear" strategy across VSCode Editor, Sidebar, and TUI.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-081]** Viewport Breakpoints
- **Type:** Technical
- **Description:** Adaptation logic for 5 breakpoints: Narrow (<480), Compact (480-768), Standard (768-1280), Wide (1280-1920), Ultra (>1920).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-080]

### **[REQ-UI-DES-081-1]** Narrow Breakpoint
- **Type:** Technical
- **Description:** Single Column; for VSCode Sidebar.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-081]

### **[REQ-UI-DES-081-2]** Compact Breakpoint
- **Type:** Technical
- **Description:** Main + Bottom Console.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-081]

### **[REQ-UI-DES-081-3]** Standard Breakpoint
- **Type:** Technical
- **Description:** Tri-Pane (Sidebar + Main + Console).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-081]

### **[REQ-UI-DES-081-4]** Wide Breakpoint
- **Type:** Technical
- **Description:** Full Quad-Pane.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-081]

### **[REQ-UI-DES-081-5]** Ultra Breakpoint
- **Type:** Technical
- **Description:** Centered Fixed-Width with expanded gutters.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-081]

### **[REQ-UI-DES-082]** Automatic Pane Eviction
- **Type:** Technical
- **Description:** If height < 600px, minimize Bottom Console to Status Bar mode.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-083]** Level-of-Detail (LOD) Scaling
- **Type:** UX
- **Description:** Dynamically adjust information resolution based on zoom or container size.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-083-1]** DAG Semantic Zooming
- **Type:** UX
- **Description:** 3 LOD levels for the DAG canvas.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-083]

### **[REQ-UI-DES-083-1-1]** LOD-3 (Close)
- **Type:** UX
- **Description:** Full node details and status icons.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-083-1]

### **[REQ-UI-DES-083-1-2]** LOD-2 (Mid)
- **Type:** UX
- **Description:** Task titles only; simplified status dots.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-083-1]

### **[REQ-UI-DES-083-1-3]** LOD-1 (Far)
- **Type:** UX
- **Description:** Tasks hidden; Epics and progress radials only.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-083-1]

### **[REQ-UI-DES-083-2]** Log Truncation
- **Type:** UX
- **Description:** Hide/show raw logs vs reasoning based on Narrow/Wide mode.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-083]

### **[REQ-UI-DES-083-2-1]** Narrow mode log
- **Type:** UX
- **Description:** Raw logs hidden behind button; reasoning streamed by default.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-083-2]

### **[REQ-UI-DES-083-2-2]** Wide mode log
- **Type:** UX
- **Description:** Side-by-side "Thought vs. Action" view.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-083-2]

### **[REQ-UI-DES-084]** High-Contrast (HC) Resilience
- **Type:** Technical
- **Description:** Strict adherence to WCAG 2.1 AA standards; increase contrast to 7:1 in HC themes.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-084-1]** Contrast Enforcement
- **Type:** Technical
- **Description:** exceed 4.5:1 (Normal) / 7:1 (HC themes).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-084]

### **[REQ-UI-DES-084-2]** Focus Ring Persistence
- **Type:** UX
- **Description:** Visible VSCode focus ring on all navigable elements; offset in HC mode.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-084]

### **[REQ-UI-DES-084-3]** Aria-Live Annunciation
- **Type:** UX
- **Description:** Use non-visual `aria-live` buffer for "Agentic Events".
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-084]

### **[REQ-UI-DES-085]** Reduced Motion Optimization
- **Type:** UX
- **Description:** Disable sliding, pulsing, and particle animations if preferred.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-085-1]** Disable sliding animations
- **Type:** UX
- **Description:** Disable all ThoughtStream sliding animations.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-085]

### **[REQ-UI-DES-085-2]** Replace pulse
- **Type:** UX
- **Description:** Replace "Thinking Pulse" with a static "Active" icon.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-085]

### **[REQ-UI-DES-085-3]** Disable sweep
- **Type:** UX
- **Description:** Disable the "Distillation Sweep" particle effects.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-085]

### **[REQ-UI-DES-085-4]** Instant-jump transitions
- **Type:** UX
- **Description:** 0ms duration for all tab transitions.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-085]

### **[REQ-UI-DES-086]** Persistence & Recovery UX
- **Type:** UX
- **Description:** Skeleton shimmers for hydration, blur mask for disconnection, and snap-back for rollback.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-086-1]** Skeleton Shimmer
- **Type:** UX
- **Description:** Render skeleton loaders during Tier 2 sync using lineHighlight tokens.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-086]

### **[REQ-UI-DES-086-2]** Disconnected Mask
- **Type:** UX
- **Description:** `backdrop-filter: blur(4px)` overlay with high-priority toast.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-086]

### **[REQ-UI-DES-086-3]** Optimistic Rollback
- **Type:** UX
- **Description:** 300ms "Snap-Back" animation on persistence failure.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-086]

### **[REQ-UI-DES-087]** Hardware-Aware Rendering
- **Type:** Technical
- **Description:** Throttle refresh rate to 15FPS in Battery Saver mode; force GPU layer creation for heavy visuals.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-087-1]** Battery Saver Throttle
- **Type:** Technical
- **Description:** Throttle refresh rate from 60FPS to 15FPS.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-087]

### **[REQ-UI-DES-087-2]** GPU Acceleration
- **Type:** Technical
- **Description:** Use `translate3d(0,0,0)` to force GPU layer creation for Flamegraphs/DAGs.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-087]

### **[REQ-UI-RISK-006]** Scroll Jumps during Streaming
- **Type:** UX
- **Description:** Mitigation: Implementation of "Scroll Lock" during log appending.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-UNK-004]** Large Zoom Scaling
- **Type:** UX
- **Description:** Recommendation: Use `rem` or `em` units for all spacing to ensure scaling.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

## 8. Detailed View Specifications

### **[REQ-UI-DES-090]** Dashboard Layout
- **Type:** UX
- **Description:** Landing state with Epic Progress Radial, Activity Feed, Health Telemetry, and Phase Stepper.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-090-1]** Epic Progress Radial
- **Type:** UX
- **Description:** Large circular visualization of requirement completion across all epics.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-090]

### **[REQ-UI-DES-090-2]** Activity Feed
- **Type:** UX
- **Description:** List of last 10 task commits with timestamps and agent IDs.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-090]

### **[REQ-UI-DES-090-3]** Health Telemetry
- **Type:** UX
- **Description:** Gauges for Token Spend (USD), Code Coverage (%), and Test Pass Rate (%).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-090]

### **[REQ-UI-DES-090-4]** Phase Stepper
- **Type:** UX
- **Description:** Horizontal indicator of Research -> Design -> Distill -> Implement -> Validate.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-090]

### **[REQ-UI-DES-091]** Research Suite View
- **Type:** UX
- **Description:** Multi-pane Discovery with Tabs, Source Tooltips (with Reliability Scores), and Decision Matrix.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-091-1]** Research Tabs
- **Type:** UX
- **Description:** Market Research, Competitive Analysis, Technology Landscape, User Research.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-091]

### **[REQ-UI-DES-091-2]** Source Tooltips
- **Type:** UX
- **Description:** Citations with source URL and Reliability Score (0.0-1.0).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-091]

### **[REQ-UI-DES-091-3]** Decision Matrix
- **Type:** UX
- **Description:** Side-by-side comparison of tech stacks with weighted pros/cons.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-091]

### **[REQ-UI-DES-092]** Spec Editor & Previewer (Phase 2 Review)
- **Type:** UX
- **Description:** Dual Pane editor, Requirement Highlighting (PRD vs TAS), and Sign-off Checkboxes.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-092-1]** Dual Pane Editor
- **Type:** UX
- **Description:** Markdown source vs live-rendered Mermaid.js diagrams.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-092]

### **[REQ-UI-DES-092-2]** Requirement Highlighting
- **Type:** UX
- **Description:** Sync highlighting between PRD requirements and TAS data models.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-092]

### **[REQ-UI-DES-092-3]** Approval Checkboxes
- **Type:** UX
- **Description:** Sign-off checkboxes per requirement; gate for architecture approval.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-092]

### **[REQ-UI-DES-093]** Roadmap & DAG View
- **Type:** UX
- **Description:** Large-scale graph navigation with Epic Clustering, Critical Path Highlighting, and Task Detail Cards.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-093-1]** Epic Clustering
- **Type:** UX
- **Description:** Visual grouping of tasks into Epic bounding boxes.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-093]

### **[REQ-UI-DES-093-2]** Critical Path Highlighting
- **Type:** UX
- **Description:** Toggle to highlight sequence of tasks defining duration.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-093]

### **[REQ-UI-DES-093-3]** DAG Filtering
- **Type:** UX
- **Description:** Search by Task ID, Title, or Requirement ID.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-093]

### **[REQ-UI-DES-093-4]** Task Detail Card
- **Type:** UX
- **Description:** Slide-out panel showing implementation history and diffs.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-093]

### **[REQ-UI-DES-094]** Agent Console (Phase 4 Hub)
- **Type:** UX
- **Description:** High-density hub with Thought Stream, Tool Log, and Sandbox Terminal.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-094-1]** Thought Stream
- **Type:** UX
- **Description:** Serif-based narrative reasoning streamer.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-094]

### **[REQ-UI-DES-094-2]** Tool Log
- **Type:** UX
- **Description:** Collapsed list of tool calls with expandable output.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-094]

### **[REQ-UI-DES-094-3]** Sandbox Terminal
- **Type:** Technical
- **Description:** `xterm.js` terminal showing real-time stdout/stderr.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-094]

## 9. Form & Input Design

### **[REQ-UI-DES-100]** The "Directive Whisperer" Field
- **Type:** UX
- **Description:** Cmd+K triggered field with autocomplete (@ for files, # for requirements) and Priority Toggle.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-100-1]** Whisperer Trigger
- **Type:** UX
- **Description:** `Cmd+K` (macOS) / `Ctrl+K` (Windows).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-100]

### **[REQ-UI-DES-100-2]** Autocomplete logic
- **Type:** Technical
- **Description:** `@` for project files; `#` for requirement IDs.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-100]

### **[REQ-UI-DES-100-3]** Ghost Text
- **Type:** UX
- **Description:** Instruction: "Whisper a directive to the agent...".
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-100]

### **[REQ-UI-DES-100-4]** Priority Toggle
- **Type:** UX
- **Description:** Checkbox for "Immediate Pivot" forcing reflection.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-100]

### **[REQ-UI-DES-101]** Approval Gate Modals
- **Type:** UX
- **Description:** Mid-implementation TAS change diffs with Risk Indicator badges.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-101-1]** TAS Diff View
- **Type:** UX
- **Description:** Side-by-side diff of Markdown spec.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-101]

### **[REQ-UI-DES-101-2]** Risk Indicators
- **Type:** UX
- **Description:** Color-coded badges based on downstream impact.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-101]

## 10. Visualization Design (Mermaid & Profiling)

### **[REQ-UI-DES-110]** Mermaid.js Integration
- **Type:** Technical
- **Description:** Interactive blueprint rendering with auto-sync (200ms) and Agentic Links.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-110-1]** Diagram Auto-Sync
- **Type:** Technical
- **Description:** MUST re-render within 200ms of file save.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-110]

### **[REQ-UI-DES-110-2]** Diagram Controls
- **Type:** UX
- **Description:** Floating toolbar for "Reset View" and "Export to SVG".
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-110]

### **[REQ-UI-DES-110-3]** Agentic Links
- **Type:** UX
- **Description:** Double-clicking node opens definition in source.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-110]

### **[REQ-UI-DES-111]** Agentic Profiling Dashboard
- **Type:** Technical
- **Description:** Performance telemetry using Flamegraphs and Heap Snapshot treemaps.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-111-1]** Flamegraph Profiling
- **Type:** Technical
- **Description:** CPU execution time from `ProjectServer`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-111]

### **[REQ-UI-DES-111-2]** Heap Treemap
- **Type:** Technical
- **Description:** Memory allocation visualization highlighting quota excesses.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-111]

## 11. Error & Edge Case Visualization

### **[REQ-UI-DES-120]** Entropy & Loop Visualization
- **Type:** UX
- **Description:** The "Glitch" State: Red pulse and shake effect with RCA Report modal.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-120-1]** Loop Visual Feedback
- **Type:** UX
- **Description:** Pulse red and "shake" effect on Thought Block header.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-120]

### **[REQ-UI-DES-120-2]** RCA Report
- **Type:** UX
- **Description:** Modal contrasting failing strategy with proposed pivot.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-120]

### **[REQ-UI-DES-121]** Connection Lost Overlay
- **Type:** UX
- **Description:** Full-page blurred overlay with "Reconnecting..." spinner.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-122]** Sandbox Breach Alert
- **Type:** Security
- **Description:** High-priority red banner across entire UI.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-123]** Token Budget Overrun mask
- **Type:** UX
- **Description:** Yellow overlay masking "Run" button when budget exceeds 80%.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

## 12. Design for "Agentic Readiness" (AOD)

### **[REQ-UI-DES-130]** AOD Presentation
- **Type:** UX
- **Description:** Contextual guidance display: Module hovers showing `.agent.md` and Introspection Highlights.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-130-1]** Module Hover AOD
- **Type:** UX
- **Description:** Show summary of `.agent.md` (Intent, Hooks, Test Strategy).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-130]

### **[REQ-UI-DES-130-2]** Introspection Highlights
- **Type:** UX
- **Description:** Highlight "Agentic Hooks" lines with "Glass Box" glyph.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-130]

## 13. Accessibility & Theme Resilience

### **[REQ-UI-DES-140]** Screen Reader Protocols
- **Type:** UX
- **Description:** Semantic Annunciations via Aria-Live (Polite for thoughts, Assertive for success).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[REQ-UI-DES-140-1]** Aria-Live Thought Updates
- **Type:** UX
- **Description:** New agent thoughts MUST be announced as "Polite".
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-140]

### **[REQ-UI-DES-140-2]** Aria-Live Task Success
- **Type:** UX
- **Description:** "Task [ID] Completed Successfully" MUST be announced as "Assertive".
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-140]

### **[REQ-UI-DES-141]** Forced Contrast Mode
- **Type:** Technical
- **Description:** High-contrast borders and solid backgrounds for HC themes.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** [REQ-UI-DES-025]
