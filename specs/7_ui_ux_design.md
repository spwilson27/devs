# UI/UX Design Specification: Project 'devs'

## 1. Design System Philosophy & Aesthetic

**[7_UI_UX_DESIGN-REQ-UI-DES-001] The Glass-Box Philosophy (Observability-Driven Design)**: The visual language of 'devs' is rooted in transparency, information density, and technical authority. It rejects the industry trend of "hiding complexity" in favor of exposing it through structured, auditable telemetry. The system must feel like a "High-Fidelity Flight Recorder" for software engineering—precise, data-rich, and natively integrated into the developer's environment. The core goal is to eliminate the "Magic Gap" where users lose track of agentic intent.

**[7_UI_UX_DESIGN-REQ-UI-DES-002] Visual Hierarchy of Agency (Source of Truth levels)**: To prevent cognitive overload, UI elements are prioritized based on their "Source of Truth" (SoT). This hierarchy determines z-index, contrast ratio, and font-weight:
1.  **[7_UI_UX_DESIGN-REQ-UI-DES-002-1] Level 1: Human Authority (Directives)**: The highest priority. Rendered using high-contrast borders (e.g., `var(--vscode-focusBorder)`) and bold weights. These are the "Command overrides."
2.  **[7_UI_UX_DESIGN-REQ-UI-DES-002-2] Level 2: Agent Autonomy (Reasoning/Logic)**: Middle priority. Rendered using a distinct narrative font (Serif) and alpha-blended backgrounds (`--devs-bg-thought`). This represents the agent's "Internal State."
3.  **[7_UI_UX_DESIGN-REQ-UI-DES-002-3] Level 3: Environmental Fact (Files/Logs/Tests)**: The base priority. Rendered in raw, monospaced blocks. This represents the "External Reality" the agent is acting upon.

**[7_UI_UX_DESIGN-REQ-UI-DES-003] Deterministic Layout & Telemetry Anchors**: Components MUST maintain fixed, immutable anchors for critical project telemetry. Users should never have to search for the "Active Task," "Current Phase," or "Cumulative USD Spend."
- **[7_UI_UX_DESIGN-REQ-UI-DES-003-1] Fixed Zones**: The top-right quadrant is reserved for "System Health" (Token budgets, Rate limits). The left sidebar is reserved for "Context & Navigation" (Epic Roadmap).
- **[7_UI_UX_DESIGN-REQ-UI-DES-003-2] No-Drawer Policy**: Core architectural state (TAS/PRD status) must never be hidden behind drawers or modals unless it's for secondary editing.

**[7_UI_UX_DESIGN-REQ-UI-DES-004] High-Density Signal-to-Noise Ratio**: 'devs' prioritizes a high data-to-pixel ratio over whitespace-heavy "minimalist" designs.
- **[7_UI_UX_DESIGN-REQ-UI-DES-004-1] Sparklines & Indicators**: Use micro-visualizations (sparklines) for resource consumption and status dots for requirement fulfillment.
- **[7_UI_UX_DESIGN-REQ-UI-DES-004-2] Technical Conciseness**: Labels should be authoritative and brief (e.g., "REQ-ID: 402" instead of "Requirement Identifier 402").

**[7_UI_UX_DESIGN-REQ-UI-DES-005] Platform-Native "Ghost" Integration**: The UI must feel like an extension of VSCode itself, not an external web application hosted in a frame.
- **[7_UI_UX_DESIGN-REQ-UI-DES-005-1] Token Compliance**: Mandatory use of VSCode design tokens (`--vscode-*` variables) for all primary UI elements.
- **[7_UI_UX_DESIGN-REQ-UI-DES-005-2] Codicon Utilization**: Exclusive use of the `@vscode/codicons` library for iconography to maintain semantic consistency with the host editor.

**[7_UI_UX_DESIGN-REQ-UI-DES-006] Meaningful & Non-Decorated Motion**: Animations are strictly prohibited if they do not serve a functional state-transition purpose.
- **[7_UI_UX_DESIGN-REQ-UI-DES-006-1] Functional Motion**: Permitted for showing the "Flow of Data" (e.g., a document "distilling" into requirements) or "System Pulsing" (indicating active agent thinking).
- **[7_UI_UX_DESIGN-REQ-UI-DES-006-2] Anti-Magic Rule**: No "fade-ins" or "sliding" for purely decorative reasons. Transitions must be fast (< 200ms) and use standard engineering easing (`cubic-bezier(0.4, 0, 0.2, 1)`).

**[7_UI_UX_DESIGN-REQ-UI-DES-007] The "Agent-Ready" Visual Contract**: The design must be consistent and predictable to ensure that "Visual Reviewer" agents (using screenshot-to-text capabilities) can accurately parse the state of the UI. This requires high-contrast separators between different agentic threads.

**[7_UI_UX_DESIGN-REQ-UI-DES-008] Technical Unknowns & Design Risks**:
- **[7_UI_UX_DESIGN-REQ-UI-RISK-001] Risk**: Information density may lead to "Dashboard Fatigue" for non-architect users. *Mitigation*: Implementation of "LOD" (Level of Detail) toggles to collapse technical telemetry.
- **[7_UI_UX_DESIGN-REQ-UI-RISK-002] Risk**: Theme resilience across 1,000+ community VSCode themes. *Mitigation*: Strict reliance on standard VSCode semantic tokens rather than custom hex codes.

---

## 2. Color Palette & Theming

The 'devs' design system is engineered for **Architectural Cohesion** with the VSCode environment. It utilizes a multi-layered approach to theming: inheriting base editor tokens for UI consistency, while injecting a high-signal semantic palette for agentic observability.

### 2.1 Core Semantic Colors & VSCode Token Mapping

**[7_UI_UX_DESIGN-REQ-UI-DES-010] Token Anchoring**: To ensure theme resilience, all semantic colors MUST be derived from or mapped to standard VSCode theme tokens. This prevents the "Flashlight Effect" (bright UI elements in dark themes) and ensures accessibility across 1,000+ community themes.

| Token | Semantic Role | VSCode Mapping | Logic / Usage | ID |
| :--- | :--- | :--- | :--- | :--- |
| `--devs-primary` | Action/Focus | `--vscode-focusBorder` | Primary buttons, active node highlights, and interactive borders. | **[7_UI_UX_DESIGN-REQ-UI-DES-011]** |
| `--devs-success` | Validated/Pass | `--vscode-testing-iconPassed` | Successful task completion, passing test suites, and met requirements. | **[7_UI_UX_DESIGN-REQ-UI-DES-012]** |
| `--devs-error` | Failure/Critical| `--vscode-errorForeground` | TDD loop failures, sandbox security breaches, and project-stop errors. | **[7_UI_UX_DESIGN-REQ-UI-DES-013]** |
| `--devs-warning` | Entropy/Risk | `--vscode-warningForeground` | Strategy loops, performance regressions, and budget thresholds (>80%). | **[7_UI_UX_DESIGN-REQ-UI-DES-014]** |
| `--devs-thinking` | Agent Narrative | `--vscode-symbolIcon-propertyForeground` | Narrative reasoning (Serif blocks), "Internal Monologue" headers. | **[7_UI_UX_DESIGN-REQ-UI-DES-015]** |
| `--devs-border` | UI Boundaries | `--vscode-panel-border` | Card strokes, sidebar dividers, and DAG bounding boxes. | **[7_UI_UX_DESIGN-REQ-UI-DES-016]** |
| `--devs-muted` | Ghost/De-emphasized| `--vscode-descriptionForeground` | Version numbers, timestamps, and secondary metadata. | **[7_UI_UX_DESIGN-REQ-UI-DES-017]** |

### 2.2 Glass-Box Layering & Compositing Logic

**[7_UI_UX_DESIGN-REQ-UI-DES-018] Multi-Layer Compositing**: Backgrounds for agentic content utilize the CSS `color-mix()` function to create a "Glass-Box" effect that adapts to the user's background while maintaining semantic intent.

| Token | Semantic Role | CSS Compositing Logic | ID |
| :--- | :--- | :--- | :--- |
| `--devs-bg-thought` | Reasoning Block | `color-mix(in srgb, var(--vscode-editor-background), var(--devs-thinking) 8%)` | **[7_UI_UX_DESIGN-REQ-UI-DES-019]** |
| `--devs-bg-task-active`| Running Node | `color-mix(in srgb, var(--vscode-editor-lineHighlightBackground), var(--devs-primary) 12%)` | **[7_UI_UX_DESIGN-REQ-UI-DES-020]** |
| `--devs-bg-terminal` | Log/Shell Block | Fixed: `#0D1117` (Dark) / `#F6F8FA` (Light) | **[7_UI_UX_DESIGN-REQ-UI-DES-021]** |
| `--devs-bg-diff-add` | Implementation + | `color-mix(in srgb, var(--vscode-editor-background), var(--devs-success) 15%)` | **[7_UI_UX_DESIGN-REQ-UI-DES-022]** |
| `--devs-bg-diff-sub` | Implementation - | `color-mix(in srgb, var(--vscode-editor-background), var(--devs-error) 15%)` | **[7_UI_UX_DESIGN-REQ-UI-DES-023]** |

### 2.3 Terminal ANSI Mapping (CLI & Sandbox Logs)

**[7_UI_UX_DESIGN-REQ-UI-DES-024] ANSI Palette Calibration**: The CLI and VSCode `LogTerminal` components MUST map the semantic palette to standard ANSI escape codes for consistent cross-platform rendering.

- **[7_UI_UX_DESIGN-REQ-UI-DES-024-1] Success (Green)**: ANSI 2 (Green) / ANSI 10 (Light Green).
- **[7_UI_UX_DESIGN-REQ-UI-DES-024-2] Error (Red)**: ANSI 1 (Red) / ANSI 9 (Light Red).
- **[7_UI_UX_DESIGN-REQ-UI-DES-024-3] Thinking (Magenta)**: ANSI 5 (Magenta) / ANSI 13 (Light Magenta).
- **[7_UI_UX_DESIGN-REQ-UI-DES-024-4] Warning (Yellow)**: ANSI 3 (Yellow) / ANSI 11 (Light Yellow).
- **[7_UI_UX_DESIGN-REQ-UI-DES-024-5] Metadata (Grey)**: ANSI 8 (Bright Black).

### 2.4 Theme Resilience & Accessibility Standards

**[7_UI_UX_DESIGN-REQ-UI-DES-025] High-Contrast (HC) Mode Overrides**: When a VSCode High Contrast theme is active (`.vscode-high-contrast` class present), the following overrides are mandatory:
- **[7_UI_UX_DESIGN-REQ-UI-DES-025-1] Alpha-Blending Removal**: All `color-mix()` backgrounds MUST be replaced with solid `var(--vscode-editor-background)`.
- **[7_UI_UX_DESIGN-REQ-UI-DES-025-2] Border Emphasis**: All `1px` borders MUST increase to `2px` using `var(--vscode-contrastBorder)`.
- **[7_UI_UX_DESIGN-REQ-UI-DES-025-3] Text Luminance**: All semantic text colors MUST be verified against a 7:1 contrast ratio (WCAG AAA).

**[7_UI_UX_DESIGN-REQ-UI-DES-026] Theme Switching Latency**: The UI MUST react to theme changes (emitted by VSCode) within 50ms. CSS variable updates MUST NOT trigger full React re-renders of the Task DAG; instead, the DAG canvas MUST utilize `requestAnimationFrame` to update its internal theme state.

**[7_UI_UX_DESIGN-REQ-UI-DES-027] Agentic Differentiators (Multi-Agent Support)**: In scenarios where multiple agents (e.g., Developer vs. Reviewer) are working simultaneously, the UI SHOULD use secondary accent tints from the VSCode `symbolIcon` palette to differentiate their "Thought" headers:
- **[7_UI_UX_DESIGN-REQ-UI-DES-027-1] Developer**: `--vscode-symbolIcon-functionForeground` (Blue/Cyan).
- **[7_UI_UX_DESIGN-REQ-UI-DES-027-2] Reviewer**: `--vscode-symbolIcon-variableForeground` (Orange/Amber).
- **[7_UI_UX_DESIGN-REQ-UI-DES-027-3] Architect**: `--vscode-symbolIcon-classForeground` (Green/Teal).

**[7_UI_UX_DESIGN-REQ-UI-DES-028] The "Red-Screen" Security Alert**: In the event of a `SANDBOX_BREACH_ALERT`, the UI MUST override the active theme with a high-intensity red overlay (`#FF0000` at 15% opacity) and set all borders to `3px solid var(--devs-error)`, forcing an immediate shift in the user's focus.

---

## 3. Typography System

**[7_UI_UX_DESIGN-REQ-UI-DES-030] Typography Philosophy (Semantic Separation)**: The typography in 'devs' is designed to create an immediate cognitive distinction between human input, agentic reasoning, and system output. By varying font families and scales, the UI communicates the "weight" and "source" of information without requiring explicit labels.

### 3.1 Primary Font Stacks & Inheritance

**[7_UI_UX_DESIGN-REQ-UI-DES-031] Interface Hierarchy (Tiered Fonts)**: 'devs' utilizes a tri-modal font system to categorize content by origin and intent.

| Usage | Priority | Font Family Stack | Size / Weight | ID |
| :--- | :--- | :--- | :--- | :--- |
| **System UI** | High (UX) | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | `13px-14px / 400` | **[7_UI_UX_DESIGN-REQ-UI-DES-031-1]** |
| **Agent Thought**| High (Narrative)| `"Georgia", "Times New Roman", "Source Serif Pro", serif` | `15px-16px / 400` | **[7_UI_UX_DESIGN-REQ-UI-DES-031-2]** |
| **Technical Logs**| Medium (Data) | `var(--vscode-editor-font-family), "Fira Code", "JetBrains Mono", monospace` | `12px-13px / 450` | **[7_UI_UX_DESIGN-REQ-UI-DES-031-3]** |

**[7_UI_UX_DESIGN-REQ-UI-DES-032] VSCode Editor Font Inheritance**: The "Technical Logs" and "Source Code" views MUST inherit the user's active VSCode editor font settings (family, weight, and ligatures) via the `--vscode-editor-font-family` and `--vscode-editor-font-weight` variables. This ensures the implementation view feels identical to the user's coding environment.

### 3.2 Type Scale & Semantic Mapping

**[7_UI_UX_DESIGN-REQ-UI-DES-033] Standardized Type Scale**: To maintain high information density, 'devs' uses a compact, non-linear scale.

| Style Name | Size | Weight | Letter Spacing | Usage | ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display H1** | `22px` | `600` | `-0.01em` | Project Title, Epic Headers. | **[7_UI_UX_DESIGN-REQ-UI-DES-033-1]** |
| **Header H2** | `18px` | `600` | `-0.005em` | Phase Headers (e.g., RESEARCH). | **[7_UI_UX_DESIGN-REQ-UI-DES-033-2]** |
| **Subhead H3** | `14px` | `700` | `0.02em` | Task IDs, Tool Names (Uppercase). | **[7_UI_UX_DESIGN-REQ-UI-DES-033-3]** |
| **Body UI** | `13px` | `400` | `normal` | Default UI text, Labels, Buttons. | **[7_UI_UX_DESIGN-REQ-UI-DES-033-4]** |
| **Agent Mono** | `13px` | `450` | `normal` | Thoughts (Serif) or Logs (Mono). | **[7_UI_UX_DESIGN-REQ-UI-DES-033-5]** |
| **Caption** | `11px` | `400` | `0.01em` | Timestamps, Token Counts, Redaction Tags. | **[7_UI_UX_DESIGN-REQ-UI-DES-033-6]** |

### 3.3 Semantic Use of Style & Weight

**[7_UI_UX_DESIGN-REQ-UI-DES-034] Signaling Agency via Style**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-034-1] Agentic Reasoning (Thoughts)**: MUST be rendered in **Italic Serif**. This creates a "journalistic" or "internal monologue" feel, separating reasoning from code implementation.
- **[7_UI_UX_DESIGN-REQ-UI-DES-034-2] Human Directives (Directives)**: MUST be rendered in **Bold System UI** with a specific accent color (`--devs-primary`). This signals human authority and priority.
- **[7_UI_UX_DESIGN-REQ-UI-DES-034-3] Tool Invocations (Actions)**: MUST use **Monospace Bold** for tool names (e.g., `READ_FILE`) to signify deterministic, system-level execution.

**[7_UI_UX_DESIGN-REQ-UI-DES-035] Line Height & Readability Metrics**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-035-1] Narrative Blocks (Thoughts)**: `line-height: 1.6`. High vertical rhythm to facilitate scanning long chains of thought.
- **[7_UI_UX_DESIGN-REQ-UI-DES-035-2] Technical Blocks (Logs)**: `line-height: 1.4`. Optimized for density while maintaining line-to-line separation.
- **[7_UI_UX_DESIGN-REQ-UI-DES-035-3] UI Navigation**: `line-height: 1.2`. Compact for sidebar items and dashboard tiles.

### 3.4 Technical Implementation Details

**[7_UI_UX_DESIGN-REQ-UI-DES-036] Font Loading & Anti-Aliasing**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-036-1] Subpixel Rendering**: Components MUST use `-webkit-font-smoothing: antialiased` to ensure crisp text in the Webview, especially when using light weights on dark backgrounds.
- **[7_UI_UX_DESIGN-REQ-UI-DES-036-2] Webfont Strategy**: Serif fonts (e.g., Georgia) are treated as system-standard. If a user's OS lacks a quality serif, the UI MUST fallback to a generic `serif` to avoid the overhead of heavy font-face downloads within the VSCode extension.

**[7_UI_UX_DESIGN-REQ-UI-DES-037] Code Block Typography (Syntax Highlighting)**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-037-1] Font Weight Alignment**: Code blocks in logs SHOULD use a slightly heavier weight (`450` or `500`) than the standard editor to ensure legibility during real-time streaming against the dark terminal background.
- **[7_UI_UX_DESIGN-REQ-UI-DES-037-2] Ligatures**: If the user has enabled font ligatures in VSCode, they MUST be supported in the 'devs' code previews via `font-variant-ligatures: contextual;`.

**[7_UI_UX_DESIGN-REQ-UI-DES-038] CJK & Multi-Script Support**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-038-1] Fallback Chain**: For Non-Latin scripts (Chinese, Japanese, Korean), the system MUST fallback to the host OS defaults (e.g., `PingFang SC` for macOS, `Meiryo` for Windows) to prevent "tofu" or broken character rendering in research reports.

### 3.5 Accessibility & Accessibility Edge Cases

**[7_UI_UX_DESIGN-REQ-UI-DES-039] Readability Edge Cases**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-039-1] Variable Font Size**: The UI MUST respect the `window.zoomLevel` and `editor.fontSize` settings from VSCode, scaling the entire typography system proportionally.
- **[7_UI_UX_DESIGN-REQ-UI-DES-039-2] High Contrast Contrast**: In HC themes, font weights for H2 and H3 MUST increase by one step (e.g., `600` to `700`) to ensure structural clarity against the stark background.
- **[7_UI_UX_DESIGN-REQ-UI-UNK-001] Unknown**: Should the user be allowed to override the "Agent Thought" Serif font with a custom font? *Recommendation*: No, the serif font is a critical semantic marker for agency; allowing overrides could dilute the visual hierarchy.
- **[7_UI_UX_DESIGN-REQ-UI-RISK-003] Risk**: Serif fonts on low-DPI displays can sometimes exhibit poor legibility. *Mitigation*: Implementation of a "Monospace Only" mode for accessibility if subpixel rendering fails.

---

## 4. Spacing, Grid & Layout Metrics

**[7_UI_UX_DESIGN-REQ-UI-DES-040] The 4px Base Grid (Deterministic Spacing)**: 'devs' utilizes a 4px base increment for all spatial relationships. This ensures mathematical alignment and consistent density across different display scales. All margins, padding, and component dimensions MUST be multiples of 4px.

### 4.1 Spacing Variables & Semantic Usage

| Variable | Value | Usage | ID |
| :--- | :--- | :--- | :--- |
| `$spacing-xs` | `4px` | Micro-spacing: Icons to text, internal component padding. | **[7_UI_UX_DESIGN-REQ-UI-DES-041]** |
| `$spacing-sm` | `8px` | Tight-spacing: List items, card internal padding, text-to-label gaps. | **[7_UI_UX_DESIGN-REQ-UI-DES-042]** |
| `$spacing-md` | `16px` | Standard: Section margins, between cards, sidebar internal padding. | **[7_UI_UX_DESIGN-REQ-UI-DES-043]** |
| `$spacing-lg` | `24px` | Layout: Between major view regions (e.g., Sidebar to Main). | **[7_UI_UX_DESIGN-REQ-UI-DES-044]** |
| `$spacing-xl` | `32px` | Visual separation for distinct agentic phases. | **[7_UI_UX_DESIGN-REQ-UI-DES-044-1]** |
| `$spacing-xxl`| `48px` | Hero spacing for empty states or project start views. | **[7_UI_UX_DESIGN-REQ-UI-DES-044-2]** |

### 4.2 Major Layout Regions & Zoning

**[7_UI_UX_DESIGN-REQ-UI-DES-045] The Fixed Zone Architecture**: To support cognitive anchoring [7_UI_UX_DESIGN-REQ-UI-DES-003], the UI is divided into resizable but persistent zones.

| Zone | Primary Content | Default Metrics | Logic | ID |
| :--- | :--- | :--- | :--- | :--- |
| **Left Sidebar** | Epic Roadmap / Map | Width: `280px` (Resizable) | High-level context; stays fixed during Implementation. | **[7_UI_UX_DESIGN-REQ-UI-DES-045-1]** |
| **Main Viewport** | Focus (Dashboard/DAG/Spec) | Flexible (`flex-grow: 1`) | The primary work area; scrolls vertically. | **[7_UI_UX_DESIGN-REQ-UI-DES-045-2]** |
| **Right Sidebar** | Auxiliary (Logs/Docs) | Width: `320px` (Collapsible) | Supporting data; can be hidden to focus on code. | **[7_UI_UX_DESIGN-REQ-UI-DES-045-3]** |
| **Bottom Console**| Terminal / Thought Stream | Height: `240px` (Resizable) | Real-time agentic telemetry; always visible in Phase 4. | **[7_UI_UX_DESIGN-REQ-UI-DES-045-4]** |

### 4.3 Component-Level Metrics

**[7_UI_UX_DESIGN-REQ-UI-DES-046] Task Node (DAG) Geometry**: The Task DAG is the most performance-sensitive component.
- **[7_UI_UX_DESIGN-REQ-UI-DES-046-1] Node Dimensions**: Width `180px`, Height `64px` (fixed).
- **[7_UI_UX_DESIGN-REQ-UI-DES-046-2] Internal Padding**: `$spacing-sm` (`8px`).
- **[7_UI_UX_DESIGN-REQ-UI-DES-046-3] Edge Weight**: `1px` stroke (normal) / `2.5px` stroke (dependency highlighted).
- **[7_UI_UX_DESIGN-REQ-UI-DES-046-4] Port Spacing**: Input (Left) and Output (Right) ports are vertically centered.

**[7_UI_UX_DESIGN-REQ-UI-DES-047] Card & Container Attributes**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-047-1] Border Radius**: `4px` (Rigid, professional feel).
- **[7_UI_UX_DESIGN-REQ-UI-DES-047-2] Border Width**: `1px` solid `var(--devs-border)`.
- **[7_UI_UX_DESIGN-REQ-UI-DES-047-3] Shadows**: Only used for elevated states (Modals, Overlays). 
  - **[7_UI_UX_DESIGN-REQ-UI-DES-047-3-1] shadow-sm**: `0 2px 4px rgba(0,0,0,0.15)`
  - **[7_UI_UX_DESIGN-REQ-UI-DES-047-3-2] shadow-md**: `0 8px 24px rgba(0,0,0,0.30)`

**[7_UI_UX_DESIGN-REQ-UI-DES-048] Interactive Target Sizes**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-048-1] Min Target**: `24px` x `24px` (Optimized for mouse/trackpad precision in VSCode).
- **[7_UI_UX_DESIGN-REQ-UI-DES-048-2] Standard Button**: Height `28px`, Horizontal Padding `12px`.

### 4.4 Z-Index Hierarchy (Layering Strategy)

**[7_UI_UX_DESIGN-REQ-UI-DES-049] Depth Perception**: Layering MUST reflect the SoT hierarchy [7_UI_UX_DESIGN-REQ-UI-DES-002].

- **[7_UI_UX_DESIGN-REQ-UI-DES-049-Z0] Level 0 (Base)**: Workspace, Dashboard tiles, Background logs. `z-index: 0`.
- **[7_UI_UX_DESIGN-REQ-UI-DES-049-Z1] Level 1 (Navigation)**: Sticky headers, Sidebar nav, Fixed phase-stepper. `z-index: 100`.
- **[7_UI_UX_DESIGN-REQ-UI-DES-049-Z2] Level 2 (Overlays)**: Tooltip previews, "Whisper" field (active), Tool call expansion. `z-index: 200`.
- **[7_UI_UX_DESIGN-REQ-UI-DES-049-Z3] Level 3 (Modals)**: HITL Approval gates, Diff reviewers, Strategy pivot analysis. `z-index: 300`.
- **[7_UI_UX_DESIGN-REQ-UI-DES-049-Z4] Level 4 (Critical)**: Sandbox Breach Alerts, System Crashes. `z-index: 400`.

### 4.5 Responsive & Scaling Edge Cases

- **[7_UI_UX_DESIGN-REQ-UI-DES-049-1] Ultra-Wide Support**: On viewports > 1920px, the Main Viewport MUST maintain a `max-width: 1200px` (centered) for PRD/TAS reading to maintain line-length legibility (~80 characters per line).
- **[7_UI_UX_DESIGN-REQ-UI-DES-049-2] Sidebar Collapse**: When the Left Sidebar is collapsed (< 80px), it MUST transform into a "Ghost Rail" showing only Epic icons and requirement fulfillment badges.
- **[7_UI_UX_DESIGN-REQ-UI-DES-049-3] Information Density Scaling**: If the task count in the DAG exceeds 100, the spacing between nodes reduces from `$spacing-md` to `$spacing-sm` to maintain a global view.
- **[7_UI_UX_DESIGN-REQ-UI-DES-049-4] Scrollbar Metrics**: Scrollbars MUST be slim (`8px` width) with a `4px` radius thumb, utilizing `--vscode-scrollbarSlider-background` to minimize visual noise in high-density views.

---

## 5. Interactive States & Micro-Animations

**[7_UI_UX_DESIGN-REQ-UI-DES-050] Functional Animation Manifesto (The Logic of Motion)**: Motion in 'devs' is never decorative. It is a technical tool used to communicate system state, data flow, and agentic intent. All animations MUST be fast (< 250ms), utilize the standard engineering easing curve `cubic-bezier(0.4, 0, 0.2, 1)`, and prioritize performance by animating only `transform` and `opacity` properties where possible.

### 5.1 Agentic State & Telemetry Visualizations

**[7_UI_UX_DESIGN-REQ-UI-DES-051] The Reasoning Pulse (Thinking State)**: When an agent is actively generating a "Reasoning Chain," the UI MUST communicate "Live Activity" without causing distraction.
- **[7_UI_UX_DESIGN-REQ-UI-DES-051-1] Visual**: A subtle opacity pulse (0.6 to 1.0) applied to the `active_task_node` in the DAG and the header of the `ThoughtStreamer`.
- **[7_UI_UX_DESIGN-REQ-UI-DES-051-2] Timing**: 2000ms duration, infinite loop, using a sinusoidal ease-in-out.
- **[7_UI_UX_DESIGN-REQ-UI-DES-051-3] Logic**: Triggered by the `AGENT_THOUGHT_STREAM` event; terminated immediately upon the `TOOL_LIFECYCLE:INVOKED` event.

**[7_UI_UX_DESIGN-REQ-UI-DES-052] Tool Execution Micro-Animations**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-052-1] Invocation Shimmer**: When a tool is called, the corresponding "Action Card" in the log MUST exhibit a one-time horizontal shimmer effect (linear-gradient sweep) to signify the handoff from reasoning to execution.
- **[7_UI_UX_DESIGN-REQ-UI-DES-052-2] Active Progress Sweep**: During long-running tools (e.g., `npm install`, `vitest`), a 2px indeterminate progress bar MUST scan across the top of the card or terminal window using a 1500ms cycle.
- **[7_UI_UX_DESIGN-REQ-UI-DES-052-3] Completion "Pop"**: Successful tool completion triggers a subtle `scale(1.02)` pop followed by a `var(--devs-success)` border-flash (500ms decay).
- **[7_UI_UX_DESIGN-REQ-UI-DES-052-4] Failure Shake**: Tool failure triggers a horizontal shake (`±4px` at 400ms) and an immediate shift to a solid `var(--devs-error)` background for the card header.

### 5.2 Human-in-the-Loop (HITL) Attention Mechanisms

**[7_UI_UX_DESIGN-REQ-UI-DES-053] Gated Autonomy Highlighting (The "Attention" Pulse)**: When the orchestrator hits a mandatory approval gate (Phase 2, Phase 3, or Task Failure), the UI MUST guide the user to the resolution point.
- **[7_UI_UX_DESIGN-REQ-UI-DES-053-1] Visual**: The primary approval button or "Directives" field MUST exhibit a glowing box-shadow pulse (`0 0 8px var(--devs-primary)`).
- **[7_UI_UX_DESIGN-REQ-UI-DES-053-2] Secondary Indicator**: The Sidebar's "Phase Stepper" icon for the current phase MUST pulse amber.
- **[7_UI_UX_DESIGN-REQ-UI-DES-053-3] Constraint**: These pulses MUST terminate as soon as the user interacts with the target element or the keyboard focus (`tab`) reaches it.

**[7_UI_UX_DESIGN-REQ-UI-DES-054] Directive Injection Feedback (The "Whisper" Confirmation)**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-054-1] Visual**: On submission of a directive, a transient success badge (`Directive Injected`) MUST slide in from the top-right of the Console View (+20px Y-offset).
- **[7_UI_UX_DESIGN-REQ-UI-DES-054-2] Persistence**: Visible for 3000ms, then fades out via `opacity: 0` over 500ms.
- **[7_UI_UX_DESIGN-REQ-UI-DES-054-3] Agentic Response**: The next "Thought" block MUST include a one-time visual highlight (light-blue border) to indicate that the user's directive has been ingested into the reasoning context.

### 5.3 DAG Canvas & Roadmap Dynamics

**[7_UI_UX_DESIGN-REQ-UI-DES-055] Node Interaction & Focus States**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-055-1] Hover Elevation**: Hovering a task node triggers a `scale(1.05)` transform and an increased shadow depth (`shadow-md`) to separate it from the graph background.
- **[7_UI_UX_DESIGN-REQ-UI-DES-055-2] Selection Anchor**: Clicking a node applies a persistent `3px solid var(--devs-primary)` border and centers the node in the viewport using a smooth `d3-zoom` transition (500ms).
- **[7_UI_UX_DESIGN-REQ-UI-DES-055-3] Dependency Flow Highlighting**: When a node is selected, its upstream dependencies (inputs) and downstream dependents (outputs) MUST be highlighted. The connecting lines (edges) MUST transform from grey to `var(--devs-primary)` with an animated dash-offset effect simulating "Data Flow" toward the selected node.

**[7_UI_UX_DESIGN-REQ-UI-DES-056] Pan & Zoom Inertia**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-056-1] Physics**: The DAG canvas MUST implement momentum scrolling (inertia). Rapid pans MUST decelerate gracefully over 400ms.
- **[7_UI_UX_DESIGN-REQ-UI-DES-056-2] Semantic Zooming**: At zoom levels < 0.4, detailed task titles are hidden in favor of `REQ-ID` badges. At zoom levels < 0.1, individual tasks are hidden, and only Epic bounding boxes with progress radials are rendered.

### 5.4 Glass-Box Data Transitions

**[7_UI_UX_DESIGN-REQ-UI-DES-057] The Distillation Sweep (Phase 2 to 3)**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-057-1] Visual**: During requirement distillation, requirements MUST appear to "fly" from the TAS/PRD document preview into the Roadmap list.
- **[7_UI_UX_DESIGN-REQ-UI-DES-057-2] Implementation**: Particle-based animation where text fragments transform into requirement badges.
- **[7_UI_UX_DESIGN-REQ-UI-DES-057-3] Duration**: 800ms total, staggered by 50ms per requirement to create a "Waterfall" effect.

**[7_UI_UX_DESIGN-REQ-UI-DES-058] State Recovery & Rewind (Time-Travel)**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-058-1] Visual**: Triggering a `rewind` MUST apply a temporary "Glitch/Desaturation" filter to the entire UI (CSS `grayscale(1) brightness(0.8)`) for 600ms while the Git/SQLite state is restored.
- **[7_UI_UX_DESIGN-REQ-UI-DES-058-2] Feedback**: A "State Restored" toast with the new Task ID MUST slide in from the bottom-center.

### 5.5 Technical Performance & Implementation Specs

**[7_UI_UX_DESIGN-REQ-UI-DES-059] Animation Guardrails**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-059-1] FPS Target**: All animations MUST maintain 60FPS on a standard developer machine (e.g., MacBook M1).
- **[7_UI_UX_DESIGN-REQ-UI-DES-059-2] Disabling Motion**: The UI MUST respect the `prefers-reduced-motion` media query, replacing all transforms and pulses with static state-indicators (e.g., solid color changes).
- **[7_UI_UX_DESIGN-REQ-UI-DES-059-3] Threading**: Heavy canvas updates (DAG layout) MUST be offloaded to a Web Worker to ensure that the React main thread remains responsive for user input.

**[7_UI_UX_DESIGN-REQ-UI-RISK-004] Risk**: High-frequency updates from Gemini 3 Flash could lead to "Stuttering" if animations are too complex. *Mitigation*: Implementation of a global "Animation Throttler" that drops frames if the CPU usage exceeds 30%.

**[7_UI_UX_DESIGN-REQ-UI-UNK-002] Unknown**: Should the "Thinking Pulse" be color-coded based on model confidence? *Recommendation*: No, keep it neutral; use the `LogTerminal` for confidence scores to avoid visual noise.

---

## 6. CLI TUI (Ink) Design Rules

**[7_UI_UX_DESIGN-REQ-UI-DES-060] TUI Philosophy (Minimalist Authority)**: The CLI interface MUST provide the same "Glass-Box" telemetry as the VSCode Extension but optimized for the low-latency, keyboard-driven environment of the terminal. It utilizes `Ink` (React for CLI) to manage stateful components and `Chalk` for ANSI color mapping. The TUI prioritizes vertical flow and high-density text over the spatial 2D graph of the VSCode DAG.

### 6.1 Layout Architecture & Flexbox Zoning

**[7_UI_UX_DESIGN-REQ-UI-DES-061] Terminal Layout Zones**: In interactive mode (TTY), the interface is divided into persistent zones using Ink's Flexbox engine.

| Zone | Logic | Dimensions / Constraints | ID |
| :--- | :--- | :--- | :--- |
| **Header (Global)** | Project Name, Phase Stepper, Health (USD/Tokens). | Height: `3` lines. Fixed top. | **[7_UI_UX_DESIGN-REQ-UI-DES-061-1]** |
| **Main (Context)** | Epic Roadmap (Left) and Active Task (Right). | Flexible height. Side-by-side if width > 100 chars. | **[7_UI_UX_DESIGN-REQ-UI-DES-061-2]** |
| **Telemetry (Live)** | Agent Thought Stream & Tool Action Logs. | Height: `min-height 10`, `flex-grow: 1`. | **[7_UI_UX_DESIGN-REQ-UI-DES-061-3]** |
| **Footer (Control)** | Active Shortcuts (Keybindings) & Whisper Field. | Height: `2` lines. Fixed bottom. | **[7_UI_UX_DESIGN-REQ-UI-DES-061-4]** |

**[7_UI_UX_DESIGN-REQ-UI-DES-062] Responsive Reflow (Terminal Constraints)**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-062-1] Compact Mode (< 80 chars)**: The layout switches to a single vertical stack. The Roadmap is hidden in favor of a `[Current Task ID]` breadcrumb in the header.
- **[7_UI_UX_DESIGN-REQ-UI-DES-062-2] Standard Mode (80-120 chars)**: Sidebar (Epic List) occupies `25%` width; Main implementation view occupies `75%`.
- **[7_UI_UX_DESIGN-REQ-UI-DES-062-3] Wide Mode (> 120 chars)**: Tri-pane layout (Roadmap, Implementation, Documentation Preview).

### 6.2 Component Mapping & Visual Fidelity

**[7_UI_UX_DESIGN-REQ-UI-DES-063] ANSI Token Mapping (The TUI Palette)**: The VSCode semantic tokens [7_UI_UX_DESIGN-REQ-UI-DES-010] are mapped to the closest ANSI equivalents.

- **[7_UI_UX_DESIGN-REQ-UI-DES-063-1] TrueColor (24-bit)**: Used by default if `chalk.level >= 3`. Maps hex codes directly from the VSCode Dark+ theme.
- **[7_UI_UX_DESIGN-REQ-UI-DES-063-2] 256-Color (xterm)**: Fallback mapping for older terminals (e.g., standard macOS Terminal.app).
- **[7_UI_UX_DESIGN-REQ-UI-DES-063-3] 16-Color (Basic)**: High-contrast fallback using standard ANSI constants (Green, Red, Yellow, Cyan, Magenta).

**[7_UI_UX_DESIGN-REQ-UI-DES-064] Semantic Prefixes & Unicode Fallbacks**: To ensure cross-platform compatibility, iconography uses a tiered fallback system.

| Entity | Unicode Glyph (Default) | ASCII Fallback (`!is-unicode`) | Color (Chalk) | ID |
| :--- | :--- | :--- | :--- | :--- |
| **Thought** | `(agent) »` | `(agent) >` | `magentaItalic` | **[7_UI_UX_DESIGN-REQ-UI-DES-064-1]** |
| **Action** | `[tool]  ⚙` | `[tool]  *` | `blueBold` | **[7_UI_UX_DESIGN-REQ-UI-DES-064-2]** |
| **Success** | `[pass]  ✔` | `[pass]  V` | `green` | **[7_UI_UX_DESIGN-REQ-UI-DES-064-3]** |
| **Failure** | `[fail]  ✘` | `[fail]  X` | `red` | **[7_UI_UX_DESIGN-REQ-UI-DES-064-4]** |
| **Human** | `(user)  👤` | `(user)  U` | `cyanBold` | **[7_UI_UX_DESIGN-REQ-UI-DES-064-5]** |
| **Entropy** | `[loop]  ∞` | `[loop]  @` | `yellowBright`| **[7_UI_UX_DESIGN-REQ-UI-DES-064-6]** |

**[7_UI_UX_DESIGN-REQ-UI-DES-065] Box-Drawing & Action Cards**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-065-1] Structured Blocks**: Tool calls and Reasoning turns MUST be wrapped in Unicode box-drawing characters (`┌`, `─`, `┐`, `│`, `└`, `─`, `┘`).
- **[7_UI_UX_DESIGN-REQ-UI-DES-065-2] Indentation Hierarchy**: Nested tool calls (Reviewer checking Developer) are indented by `$spacing-sm` (2 spaces) and use dotted vertical lines (`┆`).

### 6.3 Interaction Model & Focus Management

**[7_UI_UX_DESIGN-REQ-UI-DES-066] Keyboard-First Navigation (Hotkeys)**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-066-1] Global Actions**: `P` (Pause/Resume), `R` (Rewind Menu), `H` (Help/Keymap).
- **[7_UI_UX_DESIGN-REQ-UI-DES-066-2] Phase Gates**: `Enter` (Approve/Proceed), `ESC` (Reject/Back).
- **[7_UI_UX_DESIGN-REQ-UI-DES-066-3] The Whisperer**: `/` (slash) or `W` focuses the Directive input field.
- **[7_UI_UX_DESIGN-REQ-UI-DES-066-4] Task Switching**: `Up/Down` arrows to navigate the Epic Roadmap; `TAB` to switch focus between Roadmap and Console.

**[7_UI_UX_DESIGN-REQ-UI-DES-067] Focus Management (Ink-Focus)**: The TUI MUST maintain a clear "Active Focus" state. The focused zone (e.g., the Roadmap) MUST exhibit a double-line border (`║`) while inactive zones use single-line borders (`│`).

### 6.4 Real-time Telemetry & Performance

**[7_UI_UX_DESIGN-REQ-UI-DES-068] Flicker-Free Rendering (Memoization)**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-068-1] State Optimization**: High-frequency streaming (Thoughts) MUST utilize `React.memo` and partial updates. Only the `LogTerminal` component should re-render on character-level data arrivals.
- **[7_UI_UX_DESIGN-REQ-UI-DES-068-2] Scrollback Buffer**: The TUI MUST maintain a virtualized scrollback buffer of the last 1000 lines. Use of `Static` components from Ink for historical logs to minimize the reconciliation load.

**[7_UI_UX_DESIGN-REQ-UI-DES-069] Secret Redaction (TUI Integration)**: The `SecretMasker` MUST be applied to the TUI stream before the data reaches the `Ink` renderer. Redacted strings are highlighted in `inverse` or `bgRed` to ensure they are visually distinct to the user.

### 6.4 HITL Approval Gates in TUI

**[7_UI_UX_DESIGN-REQ-UI-DES-070] The Terminal Diff Reviewer**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-070-1] Visual**: When approving a TAS/PRD change, the TUI MUST render a side-by-side or unified diff using standard `+` (Green) and `-` (Red) syntax.
- **[7_UI_UX_DESIGN-REQ-UI-DES-070-2] Multi-Select**: Use `ink-select-input` for requirement sign-offs, allowing users to toggle checkboxes using `Space`.

**[7_UI_UX_DESIGN-REQ-UI-RISK-005] Risk**: Terminal resizing during a long-running task can cause `Ink` to crash or corrupt the buffer. *Mitigation*: Implementation of a `ResizeObserver` that forces a full layout re-calculation and terminal clear.

**[7_UI_UX_DESIGN-REQ-UI-UNK-003] Unknown**: Should the CLI support "Mouse Interaction" (clicking nodes)? *Recommendation*: No, maintain a 100% keyboard-driven interface for CLI consistency; reserve mouse interaction for the VSCode Extension.

---

## 7. Responsive & Adaptive Rules

**[7_UI_UX_DESIGN-REQ-UI-DES-080] The Adaptive Layout Engine**: The 'devs' UI utilizes a "Fluid-to-Linear" layout strategy. It must maintain technical authority across three primary environments: the VSCode Editor (Main Webview), the VSCode Sidebar (Narrow View), and the CLI TUI (Terminal).

### 7.1 Breakpoints & Pane Management

**[7_UI_UX_DESIGN-REQ-UI-DES-081] Viewport Breakpoints (Logical Widths)**: The UI MUST adapt its multi-pane architecture based on the available width of the Webview container.

| Breakpoint | Range (px) | Layout Configuration | Logic | ID |
| :--- | :--- | :--- | :--- | :--- |
| **Narrow** | `< 480` | Single Column (Linear Stack) | Used in the VSCode Sidebar. All sidebars are hidden; Main Viewport becomes a vertical list. | **[7_UI_UX_DESIGN-REQ-UI-DES-081-1]** |
| **Compact**| `480 - 768` | Main + Bottom Console | Right Sidebar (Logs) is hidden. Console height increases to 40% of viewport. | **[7_UI_UX_DESIGN-REQ-UI-DES-081-2]** |
| **Standard**| `768 - 1280`| Tri-Pane (Sidebar + Main + Console) | Right Sidebar is collapsible but visible by default. Standard Information Density. | **[7_UI_UX_DESIGN-REQ-UI-DES-081-3]** |
| **Wide** | `1280 - 1920`| Full Quad-Pane | All panes visible. Main Viewport implements a `max-width: 1000px` for text readability. | **[7_UI_UX_DESIGN-REQ-UI-DES-081-4]** |
| **Ultra** | `> 1920` | Centered Fixed-Width | Main content centered with expanded gutters; DAG Canvas expands to fill the full background. | **[7_UI_UX_DESIGN-REQ-UI-DES-081-5]** |

**[7_UI_UX_DESIGN-REQ-UI-DES-082] Automatic Pane Eviction (Vertical Constraints)**: If the viewport height is `< 600px`, the Bottom Console MUST be minimized to a "Status Bar" mode (32px height) showing only the active task ID and a progress pulse, maximizing the vertical space for the Roadmap or Spec View.

### 7.2 Adaptive Information Density (LOD)

**[7_UI_UX_DESIGN-REQ-UI-DES-083] Level-of-Detail (LOD) Scaling**: To prevent "Telemetry Noise," the UI MUST dynamically adjust the resolution of information based on the visual "Zoom Level" or "Container Size."

- **[7_UI_UX_DESIGN-REQ-UI-DES-083-1] DAG Semantic Zooming**:
  - **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-1] LOD-3 (Close)**: Full node details, requirement tags, and agent status icons.
  - **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-2] LOD-2 (Mid)**: Task titles only; icons are simplified to status dots. Edges (lines) are thinned to 0.5px.
  - **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-3] LOD-1 (Far)**: Individual tasks are hidden; only Epic bounding boxes with progress percentages are rendered.
- **[7_UI_UX_DESIGN-REQ-UI-DES-083-2] Log Truncation & Summarization**:
  - **[7_UI_UX_DESIGN-REQ-UI-DES-083-2-1] Narrow mode**: In **Narrow** mode, SAOP observations (raw logs) are hidden behind a "View Log" button to prevent vertical bloat. Only the "Reasoning Chain" (Thoughts) is streamed by default.
  - **[7_UI_UX_DESIGN-REQ-UI-DES-083-2-2] Wide mode**: In **Wide** mode, the UI displays a side-by-side "Thought vs. Action" view.

### 7.3 Accessibility & Theme Adaptivity

**[7_UI_UX_DESIGN-REQ-UI-DES-084] High-Contrast (HC) Resilience**: The UI MUST strictly adhere to WCAG 2.1 AA standards.
- **[7_UI_UX_DESIGN-REQ-UI-DES-084-1] Contrast Enforcement**: All text-to-background ratios MUST exceed 4.5:1. In High Contrast themes, this MUST increase to 7:1 for all primary actions.
- **[7_UI_UX_DESIGN-REQ-UI-DES-084-2] Focus Ring Persistence**: The standard VSCode focus ring (`2px solid var(--vscode-focusBorder)`) MUST be visible on all keyboard-navigable elements. In HC mode, the border MUST be `offset` by 2px to ensure it is not masked by the component boundary.
- **[7_UI_UX_DESIGN-REQ-UI-DES-084-3] Aria-Live Annunciation**: The UI MUST utilize a non-visual `aria-live` buffer to announce "Agentic Events" (e.g., "Task T-102 Failed at Red Phase") without disrupting the user's focus on the code.

**[7_UI_UX_DESIGN-REQ-UI-DES-085] Reduced Motion Optimization**: If the host OS has "Reduced Motion" enabled (`prefers-reduced-motion: reduce`), the UI MUST:
- **[7_UI_UX_DESIGN-REQ-UI-DES-085-1] Disable sliding animations**: Disable all `ThoughtStream` sliding animations.
- **[7_UI_UX_DESIGN-REQ-UI-DES-085-2] Replace pulse**: Replace the "Thinking Pulse" with a static "Active" icon.
- **[7_UI_UX_DESIGN-REQ-UI-DES-085-3] Disable sweep**: Disable the "Distillation Sweep" particle effects in Phase 3.
- **[7_UI_UX_DESIGN-REQ-UI-DES-085-4] Instant-jump transitions**: Instant-jump all tab transitions (0ms duration).

### 7.4 Connectivity & Hydration States

**[7_UI_UX_DESIGN-REQ-UI-DES-086] Persistence & Recovery UX**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-086-1] Skeleton Shimmer Logic**: During initial project hydration (Tier 2 sync), the UI MUST render skeleton loaders for all Dashboard tiles and the Roadmap DAG. The shimmer effect MUST use a `linear-gradient` derived from `--vscode-editor-lineHighlightBackground`.
- **[7_UI_UX_DESIGN-REQ-UI-DES-086-2] The "Disconnected" Mask**: If the MCP connection drops, a semi-transparent blur overlay (CSS `backdrop-filter: blur(4px)`) MUST cover the interactive zones with a high-priority "Reconnecting..." toast.
- **[7_UI_UX_DESIGN-REQ-UI-DES-086-3] Optimistic State Rollback**: If a human-initiated directive fails to persist in the SQLite state, the UI MUST perform a "Snap-Back" animation (300ms) to the last verified state and display a "Persistence Failure" warning.

### 7.5 Technical Performance Adaptivity

**[7_UI_UX_DESIGN-REQ-UI-DES-087] Hardware-Aware Rendering**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-087-1] Battery Saver Mode**: If the device is detected to be in "Battery Saver" mode (via Battery API where available), the UI MUST throttle the DAG Canvas refresh rate from 60FPS to 15FPS.
- **[7_UI_UX_DESIGN-REQ-UI-DES-087-2] GPU Acceleration**: Heavy visualizations (Flamegraphs, Large DAGs) MUST use `transform: translate3d(0,0,0)` to force GPU layer creation, preventing CPU spikes during agent implementation loops.

**[7_UI_UX_DESIGN-REQ-UI-RISK-006] Risk**: Sudden layout shifts during streaming logs can disorient the user. *Mitigation*: Implementation of a "Scroll Lock" that prevents the view from jumping when new content is appended unless the user is already at the bottom of the buffer.

**[7_UI_UX_DESIGN-REQ-UI-UNK-004] Unknown**: How should the UI adapt if the user has a custom VSCode "Zoom" setting > 200%? *Recommendation*: All spacing variables MUST use `rem` or `em` units to ensure they scale with the editor's base font size.

---

## 8. Detailed View Specifications

### 8.1 Dashboard View (Project Command Center)
**[7_UI_UX_DESIGN-REQ-UI-DES-090] Dashboard Layout**: The initial landing state after `devs init`.
- **[7_UI_UX_DESIGN-REQ-UI-DES-090-1] Epic Progress Radial**: A large, circular visualization showing the percentage completion of requirements across all 8-16 epics.
- **[7_UI_UX_DESIGN-REQ-UI-DES-090-2] Activity Feed**: A scrolling list of the last 10 successful task commits, including timestamps and contributor agent IDs.
- **[7_UI_UX_DESIGN-REQ-UI-DES-090-3] Health Telemetry**: Real-time gauges for Token Spend (USD), Code Coverage (%), and Test Pass Rate (%).
- **[7_UI_UX_DESIGN-REQ-UI-DES-090-4] Phase Stepper**: A horizontal indicator at the top showing the transition from Research -> Design -> Distill -> Implement -> Validate.

### 8.2 Research Suite View
**[7_UI_UX_DESIGN-REQ-UI-DES-091] Multi-Pane Discovery**: Specialized view for Phase 1 results.
- **[7_UI_UX_DESIGN-REQ-UI-DES-091-1] Tabs**: Market Research, Competitive Analysis, Technology Landscape, User Research.
- **[7_UI_UX_DESIGN-REQ-UI-DES-091-2] Source Tooltips**: Every factual claim in the reports MUST have a hoverable citation that shows the source URL and a "Reliability Score" (0.0 - 1.0).
- **[7_UI_UX_DESIGN-REQ-UI-DES-091-3] Decision Matrix**: A side-by-side comparison table of tech stacks (e.g., React vs. Angular) with weighted pros/cons.

### 8.3 Spec Editor & Previewer (The Blueprint)
**[7_UI_UX_DESIGN-REQ-UI-DES-092] Gated Spec Review**: The interface for Phase 2 human-in-the-loop approvals.
- **[7_UI_UX_DESIGN-REQ-UI-DES-092-1] Dual Pane**: Markdown source on the left, live-rendered Mermaid.js diagrams on the right.
- **[7_UI_UX_DESIGN-REQ-UI-DES-092-2] Requirement Highlighting**: Hovering over a requirement in the PRD MUST highlight the corresponding data model in the TAS ERD.
- **[7_UI_UX_DESIGN-REQ-UI-DES-092-3] Approval Checkboxes**: Every requirement block MUST have a "Sign-off" checkbox. The "Approve Architecture" button remains disabled until all P3 (Must-have) requirements are checked.

### 8.4 Roadmap & DAG View (The Dependency Graph)
**[7_UI_UX_DESIGN-REQ-UI-DES-093] Large-Scale Graph Navigation**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-093-1] Clustering**: Tasks are visually grouped into Epic bounding boxes (light grey background).
- **[7_UI_UX_DESIGN-REQ-UI-DES-093-2] Critical Path Highlighting**: A toggle to highlight the longest sequence of dependent tasks that define the project duration.
- **[7_UI_UX_DESIGN-REQ-UI-DES-093-3] Filtering Bar**: Fast search by Task ID, Title, or associated Requirement ID.
- **[7_UI_UX_DESIGN-REQ-UI-DES-093-4] Task Detail Card**: A slide-out panel showing the full implementation history, including failing test logs and git diffs.

### 8.5 Agent Console (The Implementation Lab)
**[7_UI_UX_DESIGN-REQ-UI-DES-094] High-Density Development Hub**: The active view during Phase 4.
- **[7_UI_UX_DESIGN-REQ-UI-DES-094-1] Thought Stream (Center)**: The serif-based, narrative reasoning of the agent. New thoughts slide in from the bottom.
- **[7_UI_UX_DESIGN-REQ-UI-DES-094-2] Tool Log (Right Sidebar)**: A collapsed list of tool calls (`read_file`, `npm test`). Clicking expands the raw redacted output.
- **[7_UI_UX_DESIGN-REQ-UI-DES-094-3] Sandbox Terminal (Bottom)**: A monospaced terminal view (`xterm.js`) showing the real-time stdout/stderr of the active test execution.

---

## 9. Form & Input Design

### 9.1 The "Directive Whisperer" Field
**[7_UI_UX_DESIGN-REQ-UI-DES-100] Context-Aware Injection**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-100-1] Trigger**: `Cmd+K` (macOS) or `Ctrl+K` (Windows).
- **[7_UI_UX_DESIGN-REQ-UI-DES-100-2] Autocomplete**: `@` triggers a list of project files; `#` triggers a list of requirement IDs.
- **[7_UI_UX_DESIGN-REQ-UI-DES-100-3] Ghost Text**: "Whisper a directive to the agent (e.g., 'Use fetch instead of axios')..."
- **[7_UI_UX_DESIGN-REQ-UI-DES-100-4] Priority Toggle**: A checkbox for "Immediate Pivot" that forces the current agent turn to interrupt and reflect on the directive.

### 9.2 Approval Gate Modals
**[7_UI_UX_DESIGN-REQ-UI-DES-101] Transactional Sign-off**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-101-1] Diff View**: When an agent proposes a TAS change mid-implementation, the approval modal MUST show a side-by-side diff of the Markdown spec.
- **[7_UI_UX_DESIGN-REQ-UI-DES-101-2] Risk Indicator**: Color-coded badges (Low, Med, High) based on how many downstream tasks are affected by the change.

---

## 10. Visualization Design (Mermaid & Profiling)

### 10.1 Mermaid.js Integration
**[7_UI_UX_DESIGN-REQ-UI-DES-110] Interactive Blueprint Rendering**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-110-1] Auto-Sync**: Diagrams re-render within 200ms of a file save.
- **[7_UI_UX_DESIGN-REQ-UI-DES-110-2] Pan/Zoom Controls**: Floating toolbar on every diagram for "Reset View" and "Export to SVG".
- **[7_UI_UX_DESIGN-REQ-UI-DES-110-3] Agentic Links**: Double-clicking a node in a Mermaid diagram (e.g., a DB table) MUST open the corresponding definition in the TAS source.

### 10.2 Agentic Profiling Dashboard
**[7_UI_UX_DESIGN-REQ-UI-DES-111] Performance Telemetry**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-111-1] Flamegraphs**: Visual representation of CPU execution time captured via the `ProjectServer` profiling tool.
- **[7_UI_UX_DESIGN-REQ-UI-DES-111-2] Heap Snapshots**: A treemap visualization of memory allocation, highlighting modules exceeding the TAS memory quota.

---

## 11. Error & Edge Case Visualization

### 11.1 Entropy & Loop Visualization
**[7_UI_UX_DESIGN-REQ-UI-DES-120] The "Glitch" State**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-120-1] Visual Feedback**: When entropy is detected (>3 repeating hashes), the active Thought Block header should pulse red and exhibit a subtle "shake" effect.
- **[7_UI_UX_DESIGN-REQ-UI-DES-120-2] RCA Report**: A modal overlay presenting the agent's Root Cause Analysis, contrasting the failing strategy with a proposed pivot.

### 11.2 System State Disruptions
- **[7_UI_UX_DESIGN-REQ-UI-DES-121] Connection Lost**: A full-page blurred overlay with a "Reconnecting to Orchestrator..." spinner.
- **[7_UI_UX_DESIGN-REQ-UI-DES-122] Sandbox Breach Alert**: A high-priority red banner across the entire UI if a container attempt to escape its network/filesystem boundary is detected.
- **[7_UI_UX_DESIGN-REQ-UI-DES-123] Token Budget Overrun**: A yellow overlay masking the "Run" button when the project exceeds 80% of its allocated USD budget.

---

## 12. Design for "Agentic Readiness" (AOD)

### 12.1 AOD Presentation
**[7_UI_UX_DESIGN-REQ-UI-DES-130] Contextual Guidance Display**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-130-1] Module Hover**: In the `src/` view, hovering a file name MUST show a summary of its `.agent.md` documentation (Intent, Hooks, Test Strategy).
- **[7_UI_UX_DESIGN-REQ-UI-DES-130-2] Introspection Highlights**: Specific lines of code that serve as "Agentic Hooks" SHOULD be highlighted with a distinctive left-gutter icon (e.g., a "Glass Box" glyph).

---

## 13. Accessibility & Theme Resilience

### 13.1 Screen Reader Protocols
**[7_UI_UX_DESIGN-REQ-UI-DES-140] Semantic Annunciations**:
- **[7_UI_UX_DESIGN-REQ-UI-DES-140-1] Aria-Live**: New agent thoughts MUST be announced as "Polite" updates.
- **[7_UI_UX_DESIGN-REQ-UI-DES-140-2] Task Success**: "Task [ID] Completed Successfully" MUST be announced as an "Assertive" update.

### 13.2 High-Contrast Strategy
**[7_UI_UX_DESIGN-REQ-UI-DES-141] Forced Contrast Mode**: In VSCode High Contrast themes, all alpha-blended backgrounds (`--devs-bg-thought`) revert to solid background colors with high-contrast borders to ensure WCAG 2.1 compliance.

