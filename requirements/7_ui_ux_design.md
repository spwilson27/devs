### **[7_UI_UX_DESIGN-REQ-UI-DES-001]** The Glass-Box Philosophy (Observability-Driven Design)
- **Type:** UX
- **Description:** The visual language of 'devs' is rooted in transparency, information density, and technical authority. It rejects the industry trend of "hiding complexity" in favor of exposing it through structured, auditable telemetry. The system must feel like a "High-Fidelity Flight Recorder" for software engineering—precise, data-rich, and natively integrated into the developer's environment. The core goal is to eliminate the "Magic Gap" where users lose track of agentic intent.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-002]** Visual Hierarchy of Agency (Source of Truth levels)
- **Type:** UX
- **Description:** To prevent cognitive overload, UI elements are prioritized based on their "Source of Truth" (SoT). This hierarchy determines z-index, contrast ratio, and font-weight:
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-002-1]** Level 1: Human Authority (Directives)
- **Type:** Functional
- **Description:** The highest priority. Rendered using high-contrast borders (e.g., `var(--vscode-focusBorder)`) and bold weights. These are the "Command overrides."
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-002-2]** Level 2: Agent Autonomy (Reasoning/Logic)
- **Type:** Functional
- **Description:** Middle priority. Rendered using a distinct narrative font (Serif) and alpha-blended backgrounds (`--devs-bg-thought`). This represents the agent's "Internal State."
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-002-3]** Level 3: Environmental Fact (Files/Logs/Tests)
- **Type:** Functional
- **Description:** The base priority. Rendered in raw, monospaced blocks. This represents the "External Reality" the agent is acting upon.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-003]** Deterministic Layout & Telemetry Anchors
- **Type:** UX
- **Description:** Components MUST maintain fixed, immutable anchors for critical project telemetry. Users should never have to search for the "Active Task," "Current Phase," or "Cumulative USD Spend."
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-003-1]** Fixed Zones
- **Type:** UX
- **Description:** The top-right quadrant is reserved for "System Health" (Token budgets, Rate limits). The left sidebar is reserved for "Context & Navigation" (Epic Roadmap).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-003-2]** No-Drawer Policy
- **Type:** Functional
- **Description:** Core architectural state (TAS/PRD status) must never be hidden behind drawers or modals unless it's for secondary editing.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-004]** High-Density Signal-to-Noise Ratio
- **Type:** UX
- **Description:** 'devs' prioritizes a high data-to-pixel ratio over whitespace-heavy "minimalist" designs.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-004-1]** Sparklines & Indicators
- **Type:** UX
- **Description:** Use micro-visualizations (sparklines) for resource consumption and status dots for requirement fulfillment.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-004-2]** Technical Conciseness
- **Type:** UX
- **Description:** Labels should be authoritative and brief (e.g., "REQ-ID: 402" instead of "Requirement Identifier 402").
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-005]** Platform-Native "Ghost" Integration
- **Type:** UX
- **Description:** The UI must feel like an extension of VSCode itself, not an external web application hosted in a frame.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-005-1]** Token Compliance
- **Type:** UX
- **Description:** Mandatory use of VSCode design tokens (`--vscode-*` variables) for all primary UI elements.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-005-2]** Codicon Utilization
- **Type:** Functional
- **Description:** Exclusive use of the `@vscode/codicons` library for iconography to maintain semantic consistency with the host editor.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-006]** Meaningful & Non-Decorated Motion
- **Type:** UX
- **Description:** Animations are strictly prohibited if they do not serve a functional state-transition purpose.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-006-1]** Functional Motion
- **Type:** UX
- **Description:** Permitted for showing the "Flow of Data" (e.g., a document "distilling" into requirements) or "System Pulsing" (indicating active agent thinking).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-006-2]** Anti-Magic Rule
- **Type:** Functional
- **Description:** No "fade-ins" or "sliding" for purely decorative reasons. Transitions must be fast (< 200ms) and use standard engineering easing (`cubic-bezier(0.4, 0, 0.2, 1)`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-007]** The "Agent-Ready" Visual Contract
- **Type:** UX
- **Description:** The design must be consistent and predictable to ensure that "Visual Reviewer" agents (using screenshot-to-text capabilities) can accurately parse the state of the UI. This requires high-contrast separators between different agentic threads.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-008]** Technical Unknowns & Design Risks
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-RISK-001] Risk**: Information density may lead to "Dashboard Fatigue" for non-architect users. *Mitigation*: Implementation of "LOD" (Level of Detail) toggles to collapse technical telemetry.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-010]** Token Anchoring
- **Type:** UX
- **Description:** To ensure theme resilience, all semantic colors MUST be derived from or mapped to standard VSCode theme tokens. This prevents the "Flashlight Effect" (bright UI elements in dark themes) and ensures accessibility across 1,000+ community themes.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-011]** ** |
| `--devs-success` | Validated/Pass | `--vscode-testing-iconPassed` | Successful task completion, passing test suites, and met requirements. | **[7_UI_UX_DESIGN-REQ-UI-DES-012]** |
| `--devs-error` | Failure/Critical| `--vscode-errorForeground` | TDD loop failures, sandbox security breaches, and project-stop errors. | **[7_UI_UX_DESIGN-REQ-UI-DES-013]** |
| `--devs-warning` | Entropy/Risk | `--vscode-warningForeground` | Strategy loops, performance regressions, and budget thresholds (>80%). | **[7_UI_UX_DESIGN-REQ-UI-DES-014]** |
| `--devs-thinking` | Agent Narrative | `--vscode-symbolIcon-propertyForeground` | Narrative reasoning (Serif blocks), "Internal Monologue" headers. | **[7_UI_UX_DESIGN-REQ-UI-DES-015]** |
| `--devs-border` | UI Boundaries | `--vscode-panel-border` | Card strokes, sidebar dividers, and DAG bounding boxes. | **[7_UI_UX_DESIGN-REQ-UI-DES-016]** |
| `--devs-muted` | Ghost/De-emphasized| `--vscode-descriptionForeground` | Version numbers, timestamps, and secondary metadata. | **[7_UI_UX_DESIGN-REQ-UI-DES-017]** |

### 2.2 Glass-Box Layering & Compositing Logic

**[7_UI_UX_DESIGN-REQ-UI-DES-018] Multi-Layer Compositing
- **Type:** Security
- **Description:** Backgrounds for agentic content utilize the CSS `color-mix()` function to create a "Glass-Box" effect that adapts to the user's background while maintaining semantic intent.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-012]** ** |
| `--devs-error` | Failure/Critical| `--vscode-errorForeground` | TDD loop failures, sandbox security breaches, and project-stop errors. | **[7_UI_UX_DESIGN-REQ-UI-DES-013]** |
| `--devs-warning` | Entropy/Risk | `--vscode-warningForeground` | Strategy loops, performance regressions, and budget thresholds (>80%). | **[7_UI_UX_DESIGN-REQ-UI-DES-014]** |
| `--devs-thinking` | Agent Narrative | `--vscode-symbolIcon-propertyForeground` | Narrative reasoning (Serif blocks), "Internal Monologue" headers. | **[7_UI_UX_DESIGN-REQ-UI-DES-015]** |
| `--devs-border` | UI Boundaries | `--vscode-panel-border` | Card strokes, sidebar dividers, and DAG bounding boxes. | **[7_UI_UX_DESIGN-REQ-UI-DES-016]** |
| `--devs-muted` | Ghost/De-emphasized| `--vscode-descriptionForeground` | Version numbers, timestamps, and secondary metadata. | **[7_UI_UX_DESIGN-REQ-UI-DES-017]** |

### 2.2 Glass-Box Layering & Compositing Logic

**[7_UI_UX_DESIGN-REQ-UI-DES-018] Multi-Layer Compositing
- **Type:** Security
- **Description:** Backgrounds for agentic content utilize the CSS `color-mix()` function to create a "Glass-Box" effect that adapts to the user's background while maintaining semantic intent.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-013]** ** |
| `--devs-warning` | Entropy/Risk | `--vscode-warningForeground` | Strategy loops, performance regressions, and budget thresholds (>80%). | **[7_UI_UX_DESIGN-REQ-UI-DES-014]** |
| `--devs-thinking` | Agent Narrative | `--vscode-symbolIcon-propertyForeground` | Narrative reasoning (Serif blocks), "Internal Monologue" headers. | **[7_UI_UX_DESIGN-REQ-UI-DES-015]** |
| `--devs-border` | UI Boundaries | `--vscode-panel-border` | Card strokes, sidebar dividers, and DAG bounding boxes. | **[7_UI_UX_DESIGN-REQ-UI-DES-016]** |
| `--devs-muted` | Ghost/De-emphasized| `--vscode-descriptionForeground` | Version numbers, timestamps, and secondary metadata. | **[7_UI_UX_DESIGN-REQ-UI-DES-017]** |

### 2.2 Glass-Box Layering & Compositing Logic

**[7_UI_UX_DESIGN-REQ-UI-DES-018] Multi-Layer Compositing
- **Type:** Technical
- **Description:** Backgrounds for agentic content utilize the CSS `color-mix()` function to create a "Glass-Box" effect that adapts to the user's background while maintaining semantic intent.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-014]** ** |
| `--devs-thinking` | Agent Narrative | `--vscode-symbolIcon-propertyForeground` | Narrative reasoning (Serif blocks), "Internal Monologue" headers. | **[7_UI_UX_DESIGN-REQ-UI-DES-015]** |
| `--devs-border` | UI Boundaries | `--vscode-panel-border` | Card strokes, sidebar dividers, and DAG bounding boxes. | **[7_UI_UX_DESIGN-REQ-UI-DES-016]** |
| `--devs-muted` | Ghost/De-emphasized| `--vscode-descriptionForeground` | Version numbers, timestamps, and secondary metadata. | **[7_UI_UX_DESIGN-REQ-UI-DES-017]** |

### 2.2 Glass-Box Layering & Compositing Logic

**[7_UI_UX_DESIGN-REQ-UI-DES-018] Multi-Layer Compositing
- **Type:** UX
- **Description:** Backgrounds for agentic content utilize the CSS `color-mix()` function to create a "Glass-Box" effect that adapts to the user's background while maintaining semantic intent.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-015]** ** |
| `--devs-border` | UI Boundaries | `--vscode-panel-border` | Card strokes, sidebar dividers, and DAG bounding boxes. | **[7_UI_UX_DESIGN-REQ-UI-DES-016]** |
| `--devs-muted` | Ghost/De-emphasized| `--vscode-descriptionForeground` | Version numbers, timestamps, and secondary metadata. | **[7_UI_UX_DESIGN-REQ-UI-DES-017]** |

### 2.2 Glass-Box Layering & Compositing Logic

**[7_UI_UX_DESIGN-REQ-UI-DES-018] Multi-Layer Compositing
- **Type:** UX
- **Description:** Backgrounds for agentic content utilize the CSS `color-mix()` function to create a "Glass-Box" effect that adapts to the user's background while maintaining semantic intent.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-016]** ** |
| `--devs-muted` | Ghost/De-emphasized| `--vscode-descriptionForeground` | Version numbers, timestamps, and secondary metadata. | **[7_UI_UX_DESIGN-REQ-UI-DES-017]** |

### 2.2 Glass-Box Layering & Compositing Logic

**[7_UI_UX_DESIGN-REQ-UI-DES-018] Multi-Layer Compositing
- **Type:** UX
- **Description:** Backgrounds for agentic content utilize the CSS `color-mix()` function to create a "Glass-Box" effect that adapts to the user's background while maintaining semantic intent.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-017]** ** |

### 2.2 Glass-Box Layering & Compositing Logic

**[7_UI_UX_DESIGN-REQ-UI-DES-018] Multi-Layer Compositing
- **Type:** UX
- **Description:** Backgrounds for agentic content utilize the CSS `color-mix()` function to create a "Glass-Box" effect that adapts to the user's background while maintaining semantic intent.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-018]** Multi-Layer Compositing
- **Type:** UX
- **Description:** Backgrounds for agentic content utilize the CSS `color-mix()` function to create a "Glass-Box" effect that adapts to the user's background while maintaining semantic intent.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-019]** ** |
| `--devs-bg-task-active`| Running Node | `color-mix(in srgb, var(--vscode-editor-lineHighlightBackground), var(--devs-primary) 12%)` | **[7_UI_UX_DESIGN-REQ-UI-DES-020]** |
| `--devs-bg-terminal` | Log/Shell Block | Fixed: `#0D1117` (Dark) / `#F6F8FA` (Light) | **[7_UI_UX_DESIGN-REQ-UI-DES-021]** |
| `--devs-bg-diff-add` | Implementation + | `color-mix(in srgb, var(--vscode-editor-background), var(--devs-success) 15%)` | **[7_UI_UX_DESIGN-REQ-UI-DES-022]** |
| `--devs-bg-diff-sub` | Implementation - | `color-mix(in srgb, var(--vscode-editor-background), var(--devs-error) 15%)` | **[7_UI_UX_DESIGN-REQ-UI-DES-023]** |

### 2.3 Terminal ANSI Mapping (CLI & Sandbox Logs)

**[7_UI_UX_DESIGN-REQ-UI-DES-024] ANSI Palette Calibration
- **Type:** UX
- **Description:** The CLI and VSCode `LogTerminal` components MUST map the semantic palette to standard ANSI escape codes for consistent cross-platform rendering.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-020]** ** |
| `--devs-bg-terminal` | Log/Shell Block | Fixed: `#0D1117` (Dark) / `#F6F8FA` (Light) | **[7_UI_UX_DESIGN-REQ-UI-DES-021]** |
| `--devs-bg-diff-add` | Implementation + | `color-mix(in srgb, var(--vscode-editor-background), var(--devs-success) 15%)` | **[7_UI_UX_DESIGN-REQ-UI-DES-022]** |
| `--devs-bg-diff-sub` | Implementation - | `color-mix(in srgb, var(--vscode-editor-background), var(--devs-error) 15%)` | **[7_UI_UX_DESIGN-REQ-UI-DES-023]** |

### 2.3 Terminal ANSI Mapping (CLI & Sandbox Logs)

**[7_UI_UX_DESIGN-REQ-UI-DES-024] ANSI Palette Calibration
- **Type:** UX
- **Description:** The CLI and VSCode `LogTerminal` components MUST map the semantic palette to standard ANSI escape codes for consistent cross-platform rendering.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-021]** ** |
| `--devs-bg-diff-add` | Implementation + | `color-mix(in srgb, var(--vscode-editor-background), var(--devs-success) 15%)` | **[7_UI_UX_DESIGN-REQ-UI-DES-022]** |
| `--devs-bg-diff-sub` | Implementation - | `color-mix(in srgb, var(--vscode-editor-background), var(--devs-error) 15%)` | **[7_UI_UX_DESIGN-REQ-UI-DES-023]** |

### 2.3 Terminal ANSI Mapping (CLI & Sandbox Logs)

**[7_UI_UX_DESIGN-REQ-UI-DES-024] ANSI Palette Calibration
- **Type:** UX
- **Description:** The CLI and VSCode `LogTerminal` components MUST map the semantic palette to standard ANSI escape codes for consistent cross-platform rendering.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-022]** ** |
| `--devs-bg-diff-sub` | Implementation - | `color-mix(in srgb, var(--vscode-editor-background), var(--devs-error) 15%)` | **[7_UI_UX_DESIGN-REQ-UI-DES-023]** |

### 2.3 Terminal ANSI Mapping (CLI & Sandbox Logs)

**[7_UI_UX_DESIGN-REQ-UI-DES-024] ANSI Palette Calibration
- **Type:** UX
- **Description:** The CLI and VSCode `LogTerminal` components MUST map the semantic palette to standard ANSI escape codes for consistent cross-platform rendering.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-023]** ** |

### 2.3 Terminal ANSI Mapping (CLI & Sandbox Logs)

**[7_UI_UX_DESIGN-REQ-UI-DES-024] ANSI Palette Calibration
- **Type:** UX
- **Description:** The CLI and VSCode `LogTerminal` components MUST map the semantic palette to standard ANSI escape codes for consistent cross-platform rendering.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-024]** ANSI Palette Calibration
- **Type:** Functional
- **Description:** The CLI and VSCode `LogTerminal` components MUST map the semantic palette to standard ANSI escape codes for consistent cross-platform rendering.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-024-1]** Success (Green)
- **Type:** Functional
- **Description:** ANSI 2 (Green) / ANSI 10 (Light Green).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-024-2]** Error (Red)
- **Type:** Functional
- **Description:** ANSI 1 (Red) / ANSI 9 (Light Red).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-024-3]** Thinking (Magenta)
- **Type:** Functional
- **Description:** ANSI 5 (Magenta) / ANSI 13 (Light Magenta).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-024-4]** Warning (Yellow)
- **Type:** Functional
- **Description:** ANSI 3 (Yellow) / ANSI 11 (Light Yellow).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-024-5]** Metadata (Grey)
- **Type:** Functional
- **Description:** ANSI 8 (Bright Black).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-025]** High-Contrast (HC) Mode Overrides
- **Type:** UX
- **Description:** When a VSCode High Contrast theme is active (`.vscode-high-contrast` class present), the following overrides are mandatory:
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-025-1]** Alpha-Blending Removal
- **Type:** UX
- **Description:** All `color-mix()` backgrounds MUST be replaced with solid `var(--vscode-editor-background)`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-025-2]** Border Emphasis
- **Type:** Functional
- **Description:** All `1px` borders MUST increase to `2px` using `var(--vscode-contrastBorder)`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-025-3]** Text Luminance
- **Type:** UX
- **Description:** All semantic text colors MUST be verified against a 7:1 contrast ratio (WCAG AAA).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-026]** Theme Switching Latency
- **Type:** Technical
- **Description:** The UI MUST react to theme changes (emitted by VSCode) within 50ms. CSS variable updates MUST NOT trigger full React re-renders of the Task DAG; instead, the DAG canvas MUST utilize `requestAnimationFrame` to update its internal theme state.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-027]** Agentic Differentiators (Multi-Agent Support)
- **Type:** UX
- **Description:** In scenarios where multiple agents (e.g., Developer vs. Reviewer) are working simultaneously, the UI SHOULD use secondary accent tints from the VSCode `symbolIcon` palette to differentiate their "Thought" headers:
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-027-1]** Developer
- **Type:** Functional
- **Description:** `--vscode-symbolIcon-functionForeground` (Blue/Cyan).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-027-2]** Reviewer
- **Type:** UX
- **Description:** `--vscode-symbolIcon-variableForeground` (Orange/Amber).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-027-3]** Architect
- **Type:** Functional
- **Description:** `--vscode-symbolIcon-classForeground` (Green/Teal).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-028]** The "Red-Screen" Security Alert
- **Type:** Security
- **Description:** In the event of a `SANDBOX_BREACH_ALERT`, the UI MUST override the active theme with a high-intensity red overlay (`#FF0000` at 15% opacity) and set all borders to `3px solid var(--devs-error)`, forcing an immediate shift in the user's focus.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-030]** Typography Philosophy (Semantic Separation)
- **Type:** UX
- **Description:** The typography in 'devs' is designed to create an immediate cognitive distinction between human input, agentic reasoning, and system output. By varying font families and scales, the UI communicates the "weight" and "source" of information without requiring explicit labels.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-031]** Interface Hierarchy (Tiered Fonts)
- **Type:** Functional
- **Description:** 'devs' utilizes a tri-modal font system to categorize content by origin and intent.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-031-1]** ** |
| **Agent Thought**| High (Narrative)| `"Georgia", "Times New Roman", "Source Serif Pro", serif` | `15px-16px / 400` | **[7_UI_UX_DESIGN-REQ-UI-DES-031-2]** |
| **Technical Logs**| Medium (Data) | `var(--vscode-editor-font-family), "Fira Code", "JetBrains Mono", monospace` | `12px-13px / 450` | **[7_UI_UX_DESIGN-REQ-UI-DES-031-3]** |

**[7_UI_UX_DESIGN-REQ-UI-DES-032] VSCode Editor Font Inheritance
- **Type:** UX
- **Description:** The "Technical Logs" and "Source Code" views MUST inherit the user's active VSCode editor font settings (family, weight, and ligatures) via the `--vscode-editor-font-family` and `--vscode-editor-font-weight` variables. This ensures the implementation view feels identical to the user's coding environment.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-031-2]** ** |
| **Technical Logs**| Medium (Data) | `var(--vscode-editor-font-family), "Fira Code", "JetBrains Mono", monospace` | `12px-13px / 450` | **[7_UI_UX_DESIGN-REQ-UI-DES-031-3]** |

**[7_UI_UX_DESIGN-REQ-UI-DES-032] VSCode Editor Font Inheritance
- **Type:** UX
- **Description:** The "Technical Logs" and "Source Code" views MUST inherit the user's active VSCode editor font settings (family, weight, and ligatures) via the `--vscode-editor-font-family` and `--vscode-editor-font-weight` variables. This ensures the implementation view feels identical to the user's coding environment.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-031-3]** ** |

**[7_UI_UX_DESIGN-REQ-UI-DES-032] VSCode Editor Font Inheritance
- **Type:** UX
- **Description:** The "Technical Logs" and "Source Code" views MUST inherit the user's active VSCode editor font settings (family, weight, and ligatures) via the `--vscode-editor-font-family` and `--vscode-editor-font-weight` variables. This ensures the implementation view feels identical to the user's coding environment.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-032]** VSCode Editor Font Inheritance
- **Type:** UX
- **Description:** The "Technical Logs" and "Source Code" views MUST inherit the user's active VSCode editor font settings (family, weight, and ligatures) via the `--vscode-editor-font-family` and `--vscode-editor-font-weight` variables. This ensures the implementation view feels identical to the user's coding environment.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-033]** Standardized Type Scale
- **Type:** Functional
- **Description:** To maintain high information density, 'devs' uses a compact, non-linear scale.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-033-1]** ** |
| **Header H2** | `18px` | `600` | `-0.005em` | Phase Headers (e.g., RESEARCH). | **[7_UI_UX_DESIGN-REQ-UI-DES-033-2]** |
| **Subhead H3** | `14px` | `700` | `0.02em` | Task IDs, Tool Names (Uppercase). | **[7_UI_UX_DESIGN-REQ-UI-DES-033-3]** |
| **Body UI** | `13px` | `400` | `normal` | Default UI text, Labels, Buttons. | **[7_UI_UX_DESIGN-REQ-UI-DES-033-4]** |
| **Agent Mono** | `13px` | `450` | `normal` | Thoughts (Serif) or Logs (Mono). | **[7_UI_UX_DESIGN-REQ-UI-DES-033-5]** |
| **Caption** | `11px` | `400` | `0.01em` | Timestamps, Token Counts, Redaction Tags. | **[7_UI_UX_DESIGN-REQ-UI-DES-033-6]** |

### 3.3 Semantic Use of Style & Weight

**[7_UI_UX_DESIGN-REQ-UI-DES-034] Signaling Agency via Style
- **Type:** Security
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-034-1] Agentic Reasoning (Thoughts)**: MUST be rendered in **Italic Serif**. This creates a "journalistic" or "internal monologue" feel, separating reasoning from code implementation.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-033-2]** ** |
| **Subhead H3** | `14px` | `700` | `0.02em` | Task IDs, Tool Names (Uppercase). | **[7_UI_UX_DESIGN-REQ-UI-DES-033-3]** |
| **Body UI** | `13px` | `400` | `normal` | Default UI text, Labels, Buttons. | **[7_UI_UX_DESIGN-REQ-UI-DES-033-4]** |
| **Agent Mono** | `13px` | `450` | `normal` | Thoughts (Serif) or Logs (Mono). | **[7_UI_UX_DESIGN-REQ-UI-DES-033-5]** |
| **Caption** | `11px` | `400` | `0.01em` | Timestamps, Token Counts, Redaction Tags. | **[7_UI_UX_DESIGN-REQ-UI-DES-033-6]** |

### 3.3 Semantic Use of Style & Weight

**[7_UI_UX_DESIGN-REQ-UI-DES-034] Signaling Agency via Style
- **Type:** Security
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-034-1] Agentic Reasoning (Thoughts)**: MUST be rendered in **Italic Serif**. This creates a "journalistic" or "internal monologue" feel, separating reasoning from code implementation.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-033-3]** ** |
| **Body UI** | `13px` | `400` | `normal` | Default UI text, Labels, Buttons. | **[7_UI_UX_DESIGN-REQ-UI-DES-033-4]** |
| **Agent Mono** | `13px` | `450` | `normal` | Thoughts (Serif) or Logs (Mono). | **[7_UI_UX_DESIGN-REQ-UI-DES-033-5]** |
| **Caption** | `11px` | `400` | `0.01em` | Timestamps, Token Counts, Redaction Tags. | **[7_UI_UX_DESIGN-REQ-UI-DES-033-6]** |

### 3.3 Semantic Use of Style & Weight

**[7_UI_UX_DESIGN-REQ-UI-DES-034] Signaling Agency via Style
- **Type:** Security
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-034-1] Agentic Reasoning (Thoughts)**: MUST be rendered in **Italic Serif**. This creates a "journalistic" or "internal monologue" feel, separating reasoning from code implementation.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-033-4]** ** |
| **Agent Mono** | `13px` | `450` | `normal` | Thoughts (Serif) or Logs (Mono). | **[7_UI_UX_DESIGN-REQ-UI-DES-033-5]** |
| **Caption** | `11px` | `400` | `0.01em` | Timestamps, Token Counts, Redaction Tags. | **[7_UI_UX_DESIGN-REQ-UI-DES-033-6]** |

### 3.3 Semantic Use of Style & Weight

**[7_UI_UX_DESIGN-REQ-UI-DES-034] Signaling Agency via Style
- **Type:** Security
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-034-1] Agentic Reasoning (Thoughts)**: MUST be rendered in **Italic Serif**. This creates a "journalistic" or "internal monologue" feel, separating reasoning from code implementation.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-033-5]** ** |
| **Caption** | `11px` | `400` | `0.01em` | Timestamps, Token Counts, Redaction Tags. | **[7_UI_UX_DESIGN-REQ-UI-DES-033-6]** |

### 3.3 Semantic Use of Style & Weight

**[7_UI_UX_DESIGN-REQ-UI-DES-034] Signaling Agency via Style
- **Type:** Security
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-034-1] Agentic Reasoning (Thoughts)**: MUST be rendered in **Italic Serif**. This creates a "journalistic" or "internal monologue" feel, separating reasoning from code implementation.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-033-6]** ** |

### 3.3 Semantic Use of Style & Weight

**[7_UI_UX_DESIGN-REQ-UI-DES-034] Signaling Agency via Style
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-034-1] Agentic Reasoning (Thoughts)**: MUST be rendered in **Italic Serif**. This creates a "journalistic" or "internal monologue" feel, separating reasoning from code implementation.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-034]** Signaling Agency via Style
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-034-1] Agentic Reasoning (Thoughts)**: MUST be rendered in **Italic Serif**. This creates a "journalistic" or "internal monologue" feel, separating reasoning from code implementation.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-034-1]** Agentic Reasoning (Thoughts)
- **Type:** Functional
- **Description:** MUST be rendered in **Italic Serif**. This creates a "journalistic" or "internal monologue" feel, separating reasoning from code implementation.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-034-2]** Human Directives (Directives)
- **Type:** UX
- **Description:** MUST be rendered in **Bold System UI** with a specific accent color (`--devs-primary`). This signals human authority and priority.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-034-3]** Tool Invocations (Actions)
- **Type:** Functional
- **Description:** MUST use **Monospace Bold** for tool names (e.g., `READ_FILE`) to signify deterministic, system-level execution.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-035]** Line Height & Readability Metrics
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-035-1] Narrative Blocks (Thoughts)**: `line-height: 1.6`. High vertical rhythm to facilitate scanning long chains of thought.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-035-1]** Narrative Blocks (Thoughts)
- **Type:** Functional
- **Description:** `line-height: 1.6`. High vertical rhythm to facilitate scanning long chains of thought.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-035-2]** Technical Blocks (Logs)
- **Type:** Functional
- **Description:** `line-height: 1.4`. Optimized for density while maintaining line-to-line separation.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-035-3]** UI Navigation
- **Type:** UX
- **Description:** `line-height: 1.2`. Compact for sidebar items and dashboard tiles.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-036]** Font Loading & Anti-Aliasing
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-036-1] Subpixel Rendering**: Components MUST use `-webkit-font-smoothing: antialiased` to ensure crisp text in the Webview, especially when using light weights on dark backgrounds.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-036-1]** Subpixel Rendering
- **Type:** UX
- **Description:** Components MUST use `-webkit-font-smoothing: antialiased` to ensure crisp text in the Webview, especially when using light weights on dark backgrounds.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-036-2]** Webfont Strategy
- **Type:** UX
- **Description:** Serif fonts (e.g., Georgia) are treated as system-standard. If a user's OS lacks a quality serif, the UI MUST fallback to a generic `serif` to avoid the overhead of heavy font-face downloads within the VSCode extension.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-037]** Code Block Typography (Syntax Highlighting)
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-037-1] Font Weight Alignment**: Code blocks in logs SHOULD use a slightly heavier weight (`450` or `500`) than the standard editor to ensure legibility during real-time streaming against the dark terminal background.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-037-1]** Font Weight Alignment
- **Type:** Functional
- **Description:** Code blocks in logs SHOULD use a slightly heavier weight (`450` or `500`) than the standard editor to ensure legibility during real-time streaming against the dark terminal background.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-037-2]** Ligatures
- **Type:** UX
- **Description:** If the user has enabled font ligatures in VSCode, they MUST be supported in the 'devs' code previews via `font-variant-ligatures: contextual;`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-038]** CJK & Multi-Script Support
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-038-1] Fallback Chain**: For Non-Latin scripts (Chinese, Japanese, Korean), the system MUST fallback to the host OS defaults (e.g., `PingFang SC` for macOS, `Meiryo` for Windows) to prevent "tofu" or broken character rendering in research reports.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-038-1]** Fallback Chain
- **Type:** Functional
- **Description:** For Non-Latin scripts (Chinese, Japanese, Korean), the system MUST fallback to the host OS defaults (e.g., `PingFang SC` for macOS, `Meiryo` for Windows) to prevent "tofu" or broken character rendering in research reports.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-039]** Readability Edge Cases
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-039-1] Variable Font Size**: The UI MUST respect the `window.zoomLevel` and `editor.fontSize` settings from VSCode, scaling the entire typography system proportionally.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-039-1]** Variable Font Size
- **Type:** UX
- **Description:** The UI MUST respect the `window.zoomLevel` and `editor.fontSize` settings from VSCode, scaling the entire typography system proportionally.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-039-2]** High Contrast Contrast
- **Type:** UX
- **Description:** In HC themes, font weights for H2 and H3 MUST increase by one step (e.g., `600` to `700`) to ensure structural clarity against the stark background.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-040]** The 4px Base Grid (Deterministic Spacing)
- **Type:** UX
- **Description:** 'devs' utilizes a 4px base increment for all spatial relationships. This ensures mathematical alignment and consistent density across different display scales. All margins, padding, and component dimensions MUST be multiples of 4px.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-041]** ** |
| `$spacing-sm` | `8px` | Tight-spacing: List items, card internal padding, text-to-label gaps. | **[7_UI_UX_DESIGN-REQ-UI-DES-042]** |
| `$spacing-md` | `16px` | Standard: Section margins, between cards, sidebar internal padding. | **[7_UI_UX_DESIGN-REQ-UI-DES-043]** |
| `$spacing-lg` | `24px` | Layout: Between major view regions (e.g., Sidebar to Main). | **[7_UI_UX_DESIGN-REQ-UI-DES-044]** |
| `$spacing-xl` | `32px` | Visual separation for distinct agentic phases. | **[7_UI_UX_DESIGN-REQ-UI-DES-044-1]** |
| `$spacing-xxl`| `48px` | Hero spacing for empty states or project start views. | **[7_UI_UX_DESIGN-REQ-UI-DES-044-2]** |

### 4.2 Major Layout Regions & Zoning

**[7_UI_UX_DESIGN-REQ-UI-DES-045] The Fixed Zone Architecture
- **Type:** UX
- **Description:** To support cognitive anchoring [7_UI_UX_DESIGN-REQ-UI-DES-003], the UI is divided into resizable but persistent zones.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-042]** ** |
| `$spacing-md` | `16px` | Standard: Section margins, between cards, sidebar internal padding. | **[7_UI_UX_DESIGN-REQ-UI-DES-043]** |
| `$spacing-lg` | `24px` | Layout: Between major view regions (e.g., Sidebar to Main). | **[7_UI_UX_DESIGN-REQ-UI-DES-044]** |
| `$spacing-xl` | `32px` | Visual separation for distinct agentic phases. | **[7_UI_UX_DESIGN-REQ-UI-DES-044-1]** |
| `$spacing-xxl`| `48px` | Hero spacing for empty states or project start views. | **[7_UI_UX_DESIGN-REQ-UI-DES-044-2]** |

### 4.2 Major Layout Regions & Zoning

**[7_UI_UX_DESIGN-REQ-UI-DES-045] The Fixed Zone Architecture
- **Type:** UX
- **Description:** To support cognitive anchoring [7_UI_UX_DESIGN-REQ-UI-DES-003], the UI is divided into resizable but persistent zones.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-043]** ** |
| `$spacing-lg` | `24px` | Layout: Between major view regions (e.g., Sidebar to Main). | **[7_UI_UX_DESIGN-REQ-UI-DES-044]** |
| `$spacing-xl` | `32px` | Visual separation for distinct agentic phases. | **[7_UI_UX_DESIGN-REQ-UI-DES-044-1]** |
| `$spacing-xxl`| `48px` | Hero spacing for empty states or project start views. | **[7_UI_UX_DESIGN-REQ-UI-DES-044-2]** |

### 4.2 Major Layout Regions & Zoning

**[7_UI_UX_DESIGN-REQ-UI-DES-045] The Fixed Zone Architecture
- **Type:** UX
- **Description:** To support cognitive anchoring [7_UI_UX_DESIGN-REQ-UI-DES-003], the UI is divided into resizable but persistent zones.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-044]** ** |
| `$spacing-xl` | `32px` | Visual separation for distinct agentic phases. | **[7_UI_UX_DESIGN-REQ-UI-DES-044-1]** |
| `$spacing-xxl`| `48px` | Hero spacing for empty states or project start views. | **[7_UI_UX_DESIGN-REQ-UI-DES-044-2]** |

### 4.2 Major Layout Regions & Zoning

**[7_UI_UX_DESIGN-REQ-UI-DES-045] The Fixed Zone Architecture
- **Type:** UX
- **Description:** To support cognitive anchoring [7_UI_UX_DESIGN-REQ-UI-DES-003], the UI is divided into resizable but persistent zones.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-044-1]** ** |
| `$spacing-xxl`| `48px` | Hero spacing for empty states or project start views. | **[7_UI_UX_DESIGN-REQ-UI-DES-044-2]** |

### 4.2 Major Layout Regions & Zoning

**[7_UI_UX_DESIGN-REQ-UI-DES-045] The Fixed Zone Architecture
- **Type:** UX
- **Description:** To support cognitive anchoring [7_UI_UX_DESIGN-REQ-UI-DES-003], the UI is divided into resizable but persistent zones.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-044-2]** ** |

### 4.2 Major Layout Regions & Zoning

**[7_UI_UX_DESIGN-REQ-UI-DES-045] The Fixed Zone Architecture
- **Type:** UX
- **Description:** To support cognitive anchoring [7_UI_UX_DESIGN-REQ-UI-DES-003], the UI is divided into resizable but persistent zones.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-045]** The Fixed Zone Architecture
- **Type:** UX
- **Description:** To support cognitive anchoring [7_UI_UX_DESIGN-REQ-UI-DES-003], the UI is divided into resizable but persistent zones.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-045-1]** ** |
| **Main Viewport** | Focus (Dashboard/DAG/Spec) | Flexible (`flex-grow: 1`) | The primary work area; scrolls vertically. | **[7_UI_UX_DESIGN-REQ-UI-DES-045-2]** |
| **Right Sidebar** | Auxiliary (Logs/Docs) | Width: `320px` (Collapsible) | Supporting data; can be hidden to focus on code. | **[7_UI_UX_DESIGN-REQ-UI-DES-045-3]** |
| **Bottom Console**| Terminal / Thought Stream | Height: `240px` (Resizable) | Real-time agentic telemetry; always visible in Phase 4. | **[7_UI_UX_DESIGN-REQ-UI-DES-045-4]** |

### 4.3 Component-Level Metrics

**[7_UI_UX_DESIGN-REQ-UI-DES-046] Task Node (DAG) Geometry
- **Type:** Technical
- **Description:** The Task DAG is the most performance-sensitive component.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-045-2]** ** |
| **Right Sidebar** | Auxiliary (Logs/Docs) | Width: `320px` (Collapsible) | Supporting data; can be hidden to focus on code. | **[7_UI_UX_DESIGN-REQ-UI-DES-045-3]** |
| **Bottom Console**| Terminal / Thought Stream | Height: `240px` (Resizable) | Real-time agentic telemetry; always visible in Phase 4. | **[7_UI_UX_DESIGN-REQ-UI-DES-045-4]** |

### 4.3 Component-Level Metrics

**[7_UI_UX_DESIGN-REQ-UI-DES-046] Task Node (DAG) Geometry
- **Type:** Technical
- **Description:** The Task DAG is the most performance-sensitive component.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-045-3]** ** |
| **Bottom Console**| Terminal / Thought Stream | Height: `240px` (Resizable) | Real-time agentic telemetry; always visible in Phase 4. | **[7_UI_UX_DESIGN-REQ-UI-DES-045-4]** |

### 4.3 Component-Level Metrics

**[7_UI_UX_DESIGN-REQ-UI-DES-046] Task Node (DAG) Geometry
- **Type:** Technical
- **Description:** The Task DAG is the most performance-sensitive component.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-045-4]** ** |

### 4.3 Component-Level Metrics

**[7_UI_UX_DESIGN-REQ-UI-DES-046] Task Node (DAG) Geometry
- **Type:** Technical
- **Description:** The Task DAG is the most performance-sensitive component.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-046]** Task Node (DAG) Geometry
- **Type:** Technical
- **Description:** The Task DAG is the most performance-sensitive component.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-046-1]** Node Dimensions
- **Type:** Functional
- **Description:** Width `180px`, Height `64px` (fixed).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-046-2]** Internal Padding
- **Type:** UX
- **Description:** `$spacing-sm` (`8px`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-046-3]** Edge Weight
- **Type:** Functional
- **Description:** `1px` stroke (normal) / `2.5px` stroke (dependency highlighted).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-046-4]** Port Spacing
- **Type:** UX
- **Description:** Input (Left) and Output (Right) ports are vertically centered.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-047]** Card & Container Attributes
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-047-1] Border Radius**: `4px` (Rigid, professional feel).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-047-1]** Border Radius
- **Type:** Functional
- **Description:** `4px` (Rigid, professional feel).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-047-2]** Border Width
- **Type:** Functional
- **Description:** `1px` solid `var(--devs-border)`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-047-3]** Shadows
- **Type:** UX
- **Description:** Only used for elevated states (Modals, Overlays).    - **[7_UI_UX_DESIGN-REQ-UI-DES-047-3-1] shadow-sm**: `0 2px 4px rgba(0,0,0,0.15)`   - **[7_UI_UX_DESIGN-REQ-UI-DES-047-3-2] shadow-md**: `0 8px 24px rgba(0,0,0,0.30)`
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-047-3-1]** shadow-sm
- **Type:** UX
- **Description:** `0 2px 4px rgba(0,0,0,0.15)`   - **[7_UI_UX_DESIGN-REQ-UI-DES-047-3-2] shadow-md**: `0 8px 24px rgba(0,0,0,0.30)`
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-047-3-2]** shadow-md
- **Type:** Functional
- **Description:** `0 8px 24px rgba(0,0,0,0.30)`
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-048]** Interactive Target Sizes
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-048-1] Min Target**: `24px` x `24px` (Optimized for mouse/trackpad precision in VSCode).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-048-1]** Min Target
- **Type:** Functional
- **Description:** `24px` x `24px` (Optimized for mouse/trackpad precision in VSCode).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-048-2]** Standard Button
- **Type:** Functional
- **Description:** Height `28px`, Horizontal Padding `12px`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-049]** Depth Perception
- **Type:** UX
- **Description:** Layering MUST reflect the SoT hierarchy [7_UI_UX_DESIGN-REQ-UI-DES-002].
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-049-1]** Ultra-Wide Support
- **Type:** UX
- **Description:** On viewports > 1920px, the Main Viewport MUST maintain a `max-width: 1200px` (centered) for PRD/TAS reading to maintain line-length legibility (~80 characters per line).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-049-2]** Sidebar Collapse
- **Type:** UX
- **Description:** When the Left Sidebar is collapsed (< 80px), it MUST transform into a "Ghost Rail" showing only Epic icons and requirement fulfillment badges.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-049-3]** Information Density Scaling
- **Type:** UX
- **Description:** If the task count in the DAG exceeds 100, the spacing between nodes reduces from `$spacing-md` to `$spacing-sm` to maintain a global view.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-049-4]** Scrollbar Metrics
- **Type:** UX
- **Description:** Scrollbars MUST be slim (`8px` width) with a `4px` radius thumb, utilizing `--vscode-scrollbarSlider-background` to minimize visual noise in high-density views.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-049-Z0]** Level 0 (Base)
- **Type:** UX
- **Description:** Workspace, Dashboard tiles, Background logs. `z-index: 0`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-049-Z1]** Level 1 (Navigation)
- **Type:** UX
- **Description:** Sticky headers, Sidebar nav, Fixed phase-stepper. `z-index: 100`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-049-Z2]** Level 2 (Overlays)
- **Type:** UX
- **Description:** Tooltip previews, "Whisper" field (active), Tool call expansion. `z-index: 200`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-049-Z3]** Level 3 (Modals)
- **Type:** UX
- **Description:** HITL Approval gates, Diff reviewers, Strategy pivot analysis. `z-index: 300`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-049-Z4]** Level 4 (Critical)
- **Type:** Security
- **Description:** Sandbox Breach Alerts, System Crashes. `z-index: 400`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-050]** Functional Animation Manifesto (The Logic of Motion)
- **Type:** Technical
- **Description:** Motion in 'devs' is never decorative. It is a technical tool used to communicate system state, data flow, and agentic intent. All animations MUST be fast (< 250ms), utilize the standard engineering easing curve `cubic-bezier(0.4, 0, 0.2, 1)`, and prioritize performance by animating only `transform` and `opacity` properties where possible.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-051]** The Reasoning Pulse (Thinking State)
- **Type:** UX
- **Description:** When an agent is actively generating a "Reasoning Chain," the UI MUST communicate "Live Activity" without causing distraction.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-051-1]** Visual
- **Type:** Functional
- **Description:** A subtle opacity pulse (0.6 to 1.0) applied to the `active_task_node` in the DAG and the header of the `ThoughtStreamer`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-051-2]** Timing
- **Type:** Functional
- **Description:** 2000ms duration, infinite loop, using a sinusoidal ease-in-out.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-051-3]** Logic
- **Type:** Functional
- **Description:** Triggered by the `AGENT_THOUGHT_STREAM` event; terminated immediately upon the `TOOL_LIFECYCLE:INVOKED` event.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-052]** Tool Execution Micro-Animations
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-052-1] Invocation Shimmer**: When a tool is called, the corresponding "Action Card" in the log MUST exhibit a one-time horizontal shimmer effect (linear-gradient sweep) to signify the handoff from reasoning to execution.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-052-1]** Invocation Shimmer
- **Type:** Functional
- **Description:** When a tool is called, the corresponding "Action Card" in the log MUST exhibit a one-time horizontal shimmer effect (linear-gradient sweep) to signify the handoff from reasoning to execution.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-052-2]** Active Progress Sweep
- **Type:** Functional
- **Description:** During long-running tools (e.g., `npm install`, `vitest`), a 2px indeterminate progress bar MUST scan across the top of the card or terminal window using a 1500ms cycle.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-052-3]** Completion "Pop"
- **Type:** Functional
- **Description:** Successful tool completion triggers a subtle `scale(1.02)` pop followed by a `var(--devs-success)` border-flash (500ms decay).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-052-4]** Failure Shake
- **Type:** Functional
- **Description:** Tool failure triggers a horizontal shake (`±4px` at 400ms) and an immediate shift to a solid `var(--devs-error)` background for the card header.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-053]** Gated Autonomy Highlighting (The "Attention" Pulse)
- **Type:** UX
- **Description:** When the orchestrator hits a mandatory approval gate (Phase 2, Phase 3, or Task Failure), the UI MUST guide the user to the resolution point.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-053-1]** Visual
- **Type:** Functional
- **Description:** The primary approval button or "Directives" field MUST exhibit a glowing box-shadow pulse (`0 0 8px var(--devs-primary)`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-053-2]** Secondary Indicator
- **Type:** UX
- **Description:** The Sidebar's "Phase Stepper" icon for the current phase MUST pulse amber.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-053-3]** Constraint
- **Type:** Functional
- **Description:** These pulses MUST terminate as soon as the user interacts with the target element or the keyboard focus (`tab`) reaches it.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-054]** Directive Injection Feedback (The "Whisper" Confirmation)
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-054-1] Visual**: On submission of a directive, a transient success badge (`Directive Injected`) MUST slide in from the top-right of the Console View (+20px Y-offset).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-054-1]** Visual
- **Type:** UX
- **Description:** On submission of a directive, a transient success badge (`Directive Injected`) MUST slide in from the top-right of the Console View (+20px Y-offset).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-054-2]** Persistence
- **Type:** Functional
- **Description:** Visible for 3000ms, then fades out via `opacity: 0` over 500ms.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-054-3]** Agentic Response
- **Type:** Functional
- **Description:** The next "Thought" block MUST include a one-time visual highlight (light-blue border) to indicate that the user's directive has been ingested into the reasoning context.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-055]** Node Interaction & Focus States
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-055-1] Hover Elevation**: Hovering a task node triggers a `scale(1.05)` transform and an increased shadow depth (`shadow-md`) to separate it from the graph background.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-055-1]** Hover Elevation
- **Type:** Functional
- **Description:** Hovering a task node triggers a `scale(1.05)` transform and an increased shadow depth (`shadow-md`) to separate it from the graph background.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-055-2]** Selection Anchor
- **Type:** UX
- **Description:** Clicking a node applies a persistent `3px solid var(--devs-primary)` border and centers the node in the viewport using a smooth `d3-zoom` transition (500ms).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-055-3]** Dependency Flow Highlighting
- **Type:** Functional
- **Description:** When a node is selected, its upstream dependencies (inputs) and downstream dependents (outputs) MUST be highlighted. The connecting lines (edges) MUST transform from grey to `var(--devs-primary)` with an animated dash-offset effect simulating "Data Flow" toward the selected node.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-056]** Pan & Zoom Inertia
- **Type:** Technical
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-056-1] Physics**: The DAG canvas MUST implement momentum scrolling (inertia). Rapid pans MUST decelerate gracefully over 400ms.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-056-1]** Physics
- **Type:** Technical
- **Description:** The DAG canvas MUST implement momentum scrolling (inertia). Rapid pans MUST decelerate gracefully over 400ms.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-056-2]** Semantic Zooming
- **Type:** Functional
- **Description:** At zoom levels < 0.4, detailed task titles are hidden in favor of `REQ-ID` badges. At zoom levels < 0.1, individual tasks are hidden, and only Epic bounding boxes with progress radials are rendered.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-057]** The Distillation Sweep (Phase 2 to 3)
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-057-1] Visual**: During requirement distillation, requirements MUST appear to "fly" from the TAS/PRD document preview into the Roadmap list.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-057-1]** Visual
- **Type:** UX
- **Description:** During requirement distillation, requirements MUST appear to "fly" from the TAS/PRD document preview into the Roadmap list.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-057-2]** Implementation
- **Type:** UX
- **Description:** Particle-based animation where text fragments transform into requirement badges.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-057-3]** Duration
- **Type:** UX
- **Description:** 800ms total, staggered by 50ms per requirement to create a "Waterfall" effect.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-058]** State Recovery & Rewind (Time-Travel)
- **Type:** Technical
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-058-1] Visual**: Triggering a `rewind` MUST apply a temporary "Glitch/Desaturation" filter to the entire UI (CSS `grayscale(1) brightness(0.8)`) for 600ms while the Git/SQLite state is restored.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-058-1]** Visual
- **Type:** Technical
- **Description:** Triggering a `rewind` MUST apply a temporary "Glitch/Desaturation" filter to the entire UI (CSS `grayscale(1) brightness(0.8)`) for 600ms while the Git/SQLite state is restored.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-058-2]** Feedback
- **Type:** Functional
- **Description:** A "State Restored" toast with the new Task ID MUST slide in from the bottom-center.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-059]** Animation Guardrails
- **Type:** Technical
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-059-1] FPS Target**: All animations MUST maintain 60FPS on a standard developer machine (e.g., MacBook M1).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-059-1]** FPS Target
- **Type:** Technical
- **Description:** All animations MUST maintain 60FPS on a standard developer machine (e.g., MacBook M1).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-059-2]** Disabling Motion
- **Type:** UX
- **Description:** The UI MUST respect the `prefers-reduced-motion` media query, replacing all transforms and pulses with static state-indicators (e.g., solid color changes).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-059-3]** Threading
- **Type:** Technical
- **Description:** Heavy canvas updates (DAG layout) MUST be offloaded to a Web Worker to ensure that the React main thread remains responsive for user input.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-060]** TUI Philosophy (Minimalist Authority)
- **Type:** Technical
- **Description:** The CLI interface MUST provide the same "Glass-Box" telemetry as the VSCode Extension but optimized for the low-latency, keyboard-driven environment of the terminal. It utilizes `Ink` (React for CLI) to manage stateful components and `Chalk` for ANSI color mapping. The TUI prioritizes vertical flow and high-density text over the spatial 2D graph of the VSCode DAG.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-061]** Terminal Layout Zones
- **Type:** UX
- **Description:** In interactive mode (TTY), the interface is divided into persistent zones using Ink's Flexbox engine.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-061-1]** ** |
| **Main (Context)** | Epic Roadmap (Left) and Active Task (Right). | Flexible height. Side-by-side if width > 100 chars. | **[7_UI_UX_DESIGN-REQ-UI-DES-061-2]** |
| **Telemetry (Live)** | Agent Thought Stream & Tool Action Logs. | Height: `min-height 10`, `flex-grow: 1`. | **[7_UI_UX_DESIGN-REQ-UI-DES-061-3]** |
| **Footer (Control)** | Active Shortcuts (Keybindings) & Whisper Field. | Height: `2` lines. Fixed bottom. | **[7_UI_UX_DESIGN-REQ-UI-DES-061-4]** |

**[7_UI_UX_DESIGN-REQ-UI-DES-062] Responsive Reflow (Terminal Constraints)
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-062-1] Compact Mode (< 80 chars)**: The layout switches to a single vertical stack. The Roadmap is hidden in favor of a `[Current Task ID]` breadcrumb in the header.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-061-2]** ** |
| **Telemetry (Live)** | Agent Thought Stream & Tool Action Logs. | Height: `min-height 10`, `flex-grow: 1`. | **[7_UI_UX_DESIGN-REQ-UI-DES-061-3]** |
| **Footer (Control)** | Active Shortcuts (Keybindings) & Whisper Field. | Height: `2` lines. Fixed bottom. | **[7_UI_UX_DESIGN-REQ-UI-DES-061-4]** |

**[7_UI_UX_DESIGN-REQ-UI-DES-062] Responsive Reflow (Terminal Constraints)
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-062-1] Compact Mode (< 80 chars)**: The layout switches to a single vertical stack. The Roadmap is hidden in favor of a `[Current Task ID]` breadcrumb in the header.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-061-3]** ** |
| **Footer (Control)** | Active Shortcuts (Keybindings) & Whisper Field. | Height: `2` lines. Fixed bottom. | **[7_UI_UX_DESIGN-REQ-UI-DES-061-4]** |

**[7_UI_UX_DESIGN-REQ-UI-DES-062] Responsive Reflow (Terminal Constraints)
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-062-1] Compact Mode (< 80 chars)**: The layout switches to a single vertical stack. The Roadmap is hidden in favor of a `[Current Task ID]` breadcrumb in the header.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-061-4]** ** |

**[7_UI_UX_DESIGN-REQ-UI-DES-062] Responsive Reflow (Terminal Constraints)
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-062-1] Compact Mode (< 80 chars)**: The layout switches to a single vertical stack. The Roadmap is hidden in favor of a `[Current Task ID]` breadcrumb in the header.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-062]** Responsive Reflow (Terminal Constraints)
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-062-1] Compact Mode (< 80 chars)**: The layout switches to a single vertical stack. The Roadmap is hidden in favor of a `[Current Task ID]` breadcrumb in the header.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-062-1]** Compact Mode (< 80 chars)
- **Type:** UX
- **Description:** The layout switches to a single vertical stack. The Roadmap is hidden in favor of a `[Current Task ID]` breadcrumb in the header.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-062-2]** Standard Mode (80-120 chars)
- **Type:** UX
- **Description:** Sidebar (Epic List) occupies `25%` width; Main implementation view occupies `75%`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-062-3]** Wide Mode (> 120 chars)
- **Type:** UX
- **Description:** Tri-pane layout (Roadmap, Implementation, Documentation Preview).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-063]** ANSI Token Mapping (The TUI Palette)
- **Type:** UX
- **Description:** The VSCode semantic tokens [7_UI_UX_DESIGN-REQ-UI-DES-010] are mapped to the closest ANSI equivalents.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-063-1]** TrueColor (24-bit)
- **Type:** UX
- **Description:** Used by default if `chalk.level >= 3`. Maps hex codes directly from the VSCode Dark+ theme.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-063-2]** 256-Color (xterm)
- **Type:** UX
- **Description:** Fallback mapping for older terminals (e.g., standard macOS Terminal.app).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-063-3]** 16-Color (Basic)
- **Type:** UX
- **Description:** High-contrast fallback using standard ANSI constants (Green, Red, Yellow, Cyan, Magenta).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-064]** Semantic Prefixes & Unicode Fallbacks
- **Type:** Functional
- **Description:** To ensure cross-platform compatibility, iconography uses a tiered fallback system.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-064-1]** ** |
| **Action** | `[tool]  ⚙` | `[tool]  *` | `blueBold` | **[7_UI_UX_DESIGN-REQ-UI-DES-064-2]** |
| **Success** | `[pass]  ✔` | `[pass]  V` | `green` | **[7_UI_UX_DESIGN-REQ-UI-DES-064-3]** |
| **Failure** | `[fail]  ✘` | `[fail]  X` | `red` | **[7_UI_UX_DESIGN-REQ-UI-DES-064-4]** |
| **Human** | `(user)  👤` | `(user)  U` | `cyanBold` | **[7_UI_UX_DESIGN-REQ-UI-DES-064-5]** |
| **Entropy** | `[loop]  ∞` | `[loop]  @` | `yellowBright`| **[7_UI_UX_DESIGN-REQ-UI-DES-064-6]** |

**[7_UI_UX_DESIGN-REQ-UI-DES-065] Box-Drawing & Action Cards
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-065-1] Structured Blocks**: Tool calls and Reasoning turns MUST be wrapped in Unicode box-drawing characters (`┌`, `─`, `┐`, `│`, `└`, `─`, `┘`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-064-2]** ** |
| **Success** | `[pass]  ✔` | `[pass]  V` | `green` | **[7_UI_UX_DESIGN-REQ-UI-DES-064-3]** |
| **Failure** | `[fail]  ✘` | `[fail]  X` | `red` | **[7_UI_UX_DESIGN-REQ-UI-DES-064-4]** |
| **Human** | `(user)  👤` | `(user)  U` | `cyanBold` | **[7_UI_UX_DESIGN-REQ-UI-DES-064-5]** |
| **Entropy** | `[loop]  ∞` | `[loop]  @` | `yellowBright`| **[7_UI_UX_DESIGN-REQ-UI-DES-064-6]** |

**[7_UI_UX_DESIGN-REQ-UI-DES-065] Box-Drawing & Action Cards
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-065-1] Structured Blocks**: Tool calls and Reasoning turns MUST be wrapped in Unicode box-drawing characters (`┌`, `─`, `┐`, `│`, `└`, `─`, `┘`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-064-3]** ** |
| **Failure** | `[fail]  ✘` | `[fail]  X` | `red` | **[7_UI_UX_DESIGN-REQ-UI-DES-064-4]** |
| **Human** | `(user)  👤` | `(user)  U` | `cyanBold` | **[7_UI_UX_DESIGN-REQ-UI-DES-064-5]** |
| **Entropy** | `[loop]  ∞` | `[loop]  @` | `yellowBright`| **[7_UI_UX_DESIGN-REQ-UI-DES-064-6]** |

**[7_UI_UX_DESIGN-REQ-UI-DES-065] Box-Drawing & Action Cards
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-065-1] Structured Blocks**: Tool calls and Reasoning turns MUST be wrapped in Unicode box-drawing characters (`┌`, `─`, `┐`, `│`, `└`, `─`, `┘`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-064-4]** ** |
| **Human** | `(user)  👤` | `(user)  U` | `cyanBold` | **[7_UI_UX_DESIGN-REQ-UI-DES-064-5]** |
| **Entropy** | `[loop]  ∞` | `[loop]  @` | `yellowBright`| **[7_UI_UX_DESIGN-REQ-UI-DES-064-6]** |

**[7_UI_UX_DESIGN-REQ-UI-DES-065] Box-Drawing & Action Cards
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-065-1] Structured Blocks**: Tool calls and Reasoning turns MUST be wrapped in Unicode box-drawing characters (`┌`, `─`, `┐`, `│`, `└`, `─`, `┘`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-064-5]** ** |
| **Entropy** | `[loop]  ∞` | `[loop]  @` | `yellowBright`| **[7_UI_UX_DESIGN-REQ-UI-DES-064-6]** |

**[7_UI_UX_DESIGN-REQ-UI-DES-065] Box-Drawing & Action Cards
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-065-1] Structured Blocks**: Tool calls and Reasoning turns MUST be wrapped in Unicode box-drawing characters (`┌`, `─`, `┐`, `│`, `└`, `─`, `┘`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-064-6]** ** |

**[7_UI_UX_DESIGN-REQ-UI-DES-065] Box-Drawing & Action Cards
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-065-1] Structured Blocks**: Tool calls and Reasoning turns MUST be wrapped in Unicode box-drawing characters (`┌`, `─`, `┐`, `│`, `└`, `─`, `┘`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-065]** Box-Drawing & Action Cards
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-065-1] Structured Blocks**: Tool calls and Reasoning turns MUST be wrapped in Unicode box-drawing characters (`┌`, `─`, `┐`, `│`, `└`, `─`, `┘`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-065-1]** Structured Blocks
- **Type:** Functional
- **Description:** Tool calls and Reasoning turns MUST be wrapped in Unicode box-drawing characters (`┌`, `─`, `┐`, `│`, `└`, `─`, `┘`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-065-2]** Indentation Hierarchy
- **Type:** UX
- **Description:** Nested tool calls (Reviewer checking Developer) are indented by `$spacing-sm` (2 spaces) and use dotted vertical lines (`┆`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-066]** Keyboard-First Navigation (Hotkeys)
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-066-1] Global Actions**: `P` (Pause/Resume), `R` (Rewind Menu), `H` (Help/Keymap).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-066-1]** Global Actions
- **Type:** Functional
- **Description:** `P` (Pause/Resume), `R` (Rewind Menu), `H` (Help/Keymap).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-066-2]** Phase Gates
- **Type:** Functional
- **Description:** `Enter` (Approve/Proceed), `ESC` (Reject/Back).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-066-3]** The Whisperer
- **Type:** Functional
- **Description:** `/` (slash) or `W` focuses the Directive input field.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-066-4]** Task Switching
- **Type:** Functional
- **Description:** `Up/Down` arrows to navigate the Epic Roadmap; `TAB` to switch focus between Roadmap and Console.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-067]** Focus Management (Ink-Focus)
- **Type:** UX
- **Description:** The TUI MUST maintain a clear "Active Focus" state. The focused zone (e.g., the Roadmap) MUST exhibit a double-line border (`║`) while inactive zones use single-line borders (`│`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-068]** Flicker-Free Rendering (Memoization)
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-068-1] State Optimization**: High-frequency streaming (Thoughts) MUST utilize `React.memo` and partial updates. Only the `LogTerminal` component should re-render on character-level data arrivals.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-068-1]** State Optimization
- **Type:** Functional
- **Description:** High-frequency streaming (Thoughts) MUST utilize `React.memo` and partial updates. Only the `LogTerminal` component should re-render on character-level data arrivals.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-068-2]** Scrollback Buffer
- **Type:** UX
- **Description:** The TUI MUST maintain a virtualized scrollback buffer of the last 1000 lines. Use of `Static` components from Ink for historical logs to minimize the reconciliation load.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-069]** Secret Redaction (TUI Integration)
- **Type:** Security
- **Description:** The `SecretMasker` MUST be applied to the TUI stream before the data reaches the `Ink` renderer. Redacted strings are highlighted in `inverse` or `bgRed` to ensure they are visually distinct to the user.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-070]** The Terminal Diff Reviewer
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-070-1] Visual**: When approving a TAS/PRD change, the TUI MUST render a side-by-side or unified diff using standard `+` (Green) and `-` (Red) syntax.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-070-1]** Visual
- **Type:** UX
- **Description:** When approving a TAS/PRD change, the TUI MUST render a side-by-side or unified diff using standard `+` (Green) and `-` (Red) syntax.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-070-2]** Multi-Select
- **Type:** UX
- **Description:** Use `ink-select-input` for requirement sign-offs, allowing users to toggle checkboxes using `Space`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-080]** The Adaptive Layout Engine
- **Type:** UX
- **Description:** The 'devs' UI utilizes a "Fluid-to-Linear" layout strategy. It must maintain technical authority across three primary environments: the VSCode Editor (Main Webview), the VSCode Sidebar (Narrow View), and the CLI TUI (Terminal).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-081]** Viewport Breakpoints (Logical Widths)
- **Type:** UX
- **Description:** The UI MUST adapt its multi-pane architecture based on the available width of the Webview container.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-081-1]** ** |
| **Compact**| `480 - 768` | Main + Bottom Console | Right Sidebar (Logs) is hidden. Console height increases to 40% of viewport. | **[7_UI_UX_DESIGN-REQ-UI-DES-081-2]** |
| **Standard**| `768 - 1280`| Tri-Pane (Sidebar + Main + Console) | Right Sidebar is collapsible but visible by default. Standard Information Density. | **[7_UI_UX_DESIGN-REQ-UI-DES-081-3]** |
| **Wide** | `1280 - 1920`| Full Quad-Pane | All panes visible. Main Viewport implements a `max-width: 1000px` for text readability. | **[7_UI_UX_DESIGN-REQ-UI-DES-081-4]** |
| **Ultra** | `> 1920` | Centered Fixed-Width | Main content centered with expanded gutters; DAG Canvas expands to fill the full background. | **[7_UI_UX_DESIGN-REQ-UI-DES-081-5]** |

**[7_UI_UX_DESIGN-REQ-UI-DES-082] Automatic Pane Eviction (Vertical Constraints)
- **Type:** UX
- **Description:** If the viewport height is `< 600px`, the Bottom Console MUST be minimized to a "Status Bar" mode (32px height) showing only the active task ID and a progress pulse, maximizing the vertical space for the Roadmap or Spec View.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-081-2]** ** |
| **Standard**| `768 - 1280`| Tri-Pane (Sidebar + Main + Console) | Right Sidebar is collapsible but visible by default. Standard Information Density. | **[7_UI_UX_DESIGN-REQ-UI-DES-081-3]** |
| **Wide** | `1280 - 1920`| Full Quad-Pane | All panes visible. Main Viewport implements a `max-width: 1000px` for text readability. | **[7_UI_UX_DESIGN-REQ-UI-DES-081-4]** |
| **Ultra** | `> 1920` | Centered Fixed-Width | Main content centered with expanded gutters; DAG Canvas expands to fill the full background. | **[7_UI_UX_DESIGN-REQ-UI-DES-081-5]** |

**[7_UI_UX_DESIGN-REQ-UI-DES-082] Automatic Pane Eviction (Vertical Constraints)
- **Type:** UX
- **Description:** If the viewport height is `< 600px`, the Bottom Console MUST be minimized to a "Status Bar" mode (32px height) showing only the active task ID and a progress pulse, maximizing the vertical space for the Roadmap or Spec View.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-081-3]** ** |
| **Wide** | `1280 - 1920`| Full Quad-Pane | All panes visible. Main Viewport implements a `max-width: 1000px` for text readability. | **[7_UI_UX_DESIGN-REQ-UI-DES-081-4]** |
| **Ultra** | `> 1920` | Centered Fixed-Width | Main content centered with expanded gutters; DAG Canvas expands to fill the full background. | **[7_UI_UX_DESIGN-REQ-UI-DES-081-5]** |

**[7_UI_UX_DESIGN-REQ-UI-DES-082] Automatic Pane Eviction (Vertical Constraints)
- **Type:** UX
- **Description:** If the viewport height is `< 600px`, the Bottom Console MUST be minimized to a "Status Bar" mode (32px height) showing only the active task ID and a progress pulse, maximizing the vertical space for the Roadmap or Spec View.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-081-4]** ** |
| **Ultra** | `> 1920` | Centered Fixed-Width | Main content centered with expanded gutters; DAG Canvas expands to fill the full background. | **[7_UI_UX_DESIGN-REQ-UI-DES-081-5]** |

**[7_UI_UX_DESIGN-REQ-UI-DES-082] Automatic Pane Eviction (Vertical Constraints)
- **Type:** UX
- **Description:** If the viewport height is `< 600px`, the Bottom Console MUST be minimized to a "Status Bar" mode (32px height) showing only the active task ID and a progress pulse, maximizing the vertical space for the Roadmap or Spec View.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-081-5]** ** |

**[7_UI_UX_DESIGN-REQ-UI-DES-082] Automatic Pane Eviction (Vertical Constraints)
- **Type:** UX
- **Description:** If the viewport height is `< 600px`, the Bottom Console MUST be minimized to a "Status Bar" mode (32px height) showing only the active task ID and a progress pulse, maximizing the vertical space for the Roadmap or Spec View.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-082]** Automatic Pane Eviction (Vertical Constraints)
- **Type:** UX
- **Description:** If the viewport height is `< 600px`, the Bottom Console MUST be minimized to a "Status Bar" mode (32px height) showing only the active task ID and a progress pulse, maximizing the vertical space for the Roadmap or Spec View.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-083]** Level-of-Detail (LOD) Scaling
- **Type:** UX
- **Description:** To prevent "Telemetry Noise," the UI MUST dynamically adjust the resolution of information based on the visual "Zoom Level" or "Container Size."
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-083-1]** DAG Semantic Zooming
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-1] LOD-3 (Close)**: Full node details, requirement tags, and agent status icons.   - **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-2] LOD-2 (Mid)**: Task titles only; icons are simplified to status dots. Edges (lines) are thinned to 0.5px.   - **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-3] LOD-1 (Far)**: Individual tasks are hidden; only Epic bounding boxes with progress percentages are rendered.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-1]** LOD-3 (Close)
- **Type:** UX
- **Description:** Full node details, requirement tags, and agent status icons.   - **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-2] LOD-2 (Mid)**: Task titles only; icons are simplified to status dots. Edges (lines) are thinned to 0.5px.   - **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-3] LOD-1 (Far)**: Individual tasks are hidden; only Epic bounding boxes with progress percentages are rendered.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-2]** LOD-2 (Mid)
- **Type:** UX
- **Description:** Task titles only; icons are simplified to status dots. Edges (lines) are thinned to 0.5px.   - **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-3] LOD-1 (Far)**: Individual tasks are hidden; only Epic bounding boxes with progress percentages are rendered.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-3]** LOD-1 (Far)
- **Type:** Functional
- **Description:** Individual tasks are hidden; only Epic bounding boxes with progress percentages are rendered.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-083-2]** Log Truncation & Summarization
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-083-2-1] Narrow mode**: In **Narrow** mode, SAOP observations (raw logs) are hidden behind a "View Log" button to prevent vertical bloat. Only the "Reasoning Chain" (Thoughts) is streamed by default.   - **[7_UI_UX_DESIGN-REQ-UI-DES-083-2-2] Wide mode**: In **Wide** mode, the UI displays a side-by-side "Thought vs. Action" view.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-083-2-1]** Narrow mode
- **Type:** UX
- **Description:** In **Narrow** mode, SAOP observations (raw logs) are hidden behind a "View Log" button to prevent vertical bloat. Only the "Reasoning Chain" (Thoughts) is streamed by default.   - **[7_UI_UX_DESIGN-REQ-UI-DES-083-2-2] Wide mode**: In **Wide** mode, the UI displays a side-by-side "Thought vs. Action" view.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-083-2-2]** Wide mode
- **Type:** UX
- **Description:** In **Wide** mode, the UI displays a side-by-side "Thought vs. Action" view.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-084]** High-Contrast (HC) Resilience
- **Type:** UX
- **Description:** The UI MUST strictly adhere to WCAG 2.1 AA standards.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-084-1]** Contrast Enforcement
- **Type:** UX
- **Description:** All text-to-background ratios MUST exceed 4.5:1. In High Contrast themes, this MUST increase to 7:1 for all primary actions.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-084-2]** Focus Ring Persistence
- **Type:** Functional
- **Description:** The standard VSCode focus ring (`2px solid var(--vscode-focusBorder)`) MUST be visible on all keyboard-navigable elements. In HC mode, the border MUST be `offset` by 2px to ensure it is not masked by the component boundary.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-084-3]** Aria-Live Annunciation
- **Type:** UX
- **Description:** The UI MUST utilize a non-visual `aria-live` buffer to announce "Agentic Events" (e.g., "Task T-102 Failed at Red Phase") without disrupting the user's focus on the code.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-085]** Reduced Motion Optimization
- **Type:** UX
- **Description:** If the host OS has "Reduced Motion" enabled (`prefers-reduced-motion: reduce`), the UI MUST:
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-085-1]** Disable sliding animations
- **Type:** UX
- **Description:** Disable all `ThoughtStream` sliding animations.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-085-2]** Replace pulse
- **Type:** Functional
- **Description:** Replace the "Thinking Pulse" with a static "Active" icon.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-085-3]** Disable sweep
- **Type:** Functional
- **Description:** Disable the "Distillation Sweep" particle effects in Phase 3.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-085-4]** Instant-jump transitions
- **Type:** Functional
- **Description:** Instant-jump all tab transitions (0ms duration).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-086]** Persistence & Recovery UX
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-086-1] Skeleton Shimmer Logic**: During initial project hydration (Tier 2 sync), the UI MUST render skeleton loaders for all Dashboard tiles and the Roadmap DAG. The shimmer effect MUST use a `linear-gradient` derived from `--vscode-editor-lineHighlightBackground`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-086-1]** Skeleton Shimmer Logic
- **Type:** UX
- **Description:** During initial project hydration (Tier 2 sync), the UI MUST render skeleton loaders for all Dashboard tiles and the Roadmap DAG. The shimmer effect MUST use a `linear-gradient` derived from `--vscode-editor-lineHighlightBackground`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-086-2]** The "Disconnected" Mask
- **Type:** Functional
- **Description:** If the MCP connection drops, a semi-transparent blur overlay (CSS `backdrop-filter: blur(4px)`) MUST cover the interactive zones with a high-priority "Reconnecting..." toast.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-086-3]** Optimistic State Rollback
- **Type:** Technical
- **Description:** If a human-initiated directive fails to persist in the SQLite state, the UI MUST perform a "Snap-Back" animation (300ms) to the last verified state and display a "Persistence Failure" warning.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-087]** Hardware-Aware Rendering
- **Type:** Technical
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-087-1] Battery Saver Mode**: If the device is detected to be in "Battery Saver" mode (via Battery API where available), the UI MUST throttle the DAG Canvas refresh rate from 60FPS to 15FPS.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-087-1]** Battery Saver Mode
- **Type:** Technical
- **Description:** If the device is detected to be in "Battery Saver" mode (via Battery API where available), the UI MUST throttle the DAG Canvas refresh rate from 60FPS to 15FPS.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-087-2]** GPU Acceleration
- **Type:** Technical
- **Description:** Heavy visualizations (Flamegraphs, Large DAGs) MUST use `transform: translate3d(0,0,0)` to force GPU layer creation, preventing CPU spikes during agent implementation loops.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-090]** Dashboard Layout
- **Type:** UX
- **Description:** The initial landing state after `devs init`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-090-1]** Epic Progress Radial
- **Type:** UX
- **Description:** A large, circular visualization showing the percentage completion of requirements across all 8-16 epics.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-090-2]** Activity Feed
- **Type:** Functional
- **Description:** A scrolling list of the last 10 successful task commits, including timestamps and contributor agent IDs.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-090-3]** Health Telemetry
- **Type:** Functional
- **Description:** Real-time gauges for Token Spend (USD), Code Coverage (%), and Test Pass Rate (%).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-090-4]** Phase Stepper
- **Type:** UX
- **Description:** A horizontal indicator at the top showing the transition from Research -> Design -> Distill -> Implement -> Validate.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-091]** Multi-Pane Discovery
- **Type:** UX
- **Description:** Specialized view for Phase 1 results.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-091-1]** Tabs
- **Type:** Functional
- **Description:** Market Research, Competitive Analysis, Technology Landscape, User Research.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-091-2]** Source Tooltips
- **Type:** Functional
- **Description:** Every factual claim in the reports MUST have a hoverable citation that shows the source URL and a "Reliability Score" (0.0 - 1.0).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-091-3]** Decision Matrix
- **Type:** Functional
- **Description:** A side-by-side comparison table of tech stacks (e.g., React vs. Angular) with weighted pros/cons.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-092]** Gated Spec Review
- **Type:** UX
- **Description:** The interface for Phase 2 human-in-the-loop approvals.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-092-1]** Dual Pane
- **Type:** Functional
- **Description:** Markdown source on the left, live-rendered Mermaid.js diagrams on the right.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-092-2]** Requirement Highlighting
- **Type:** UX
- **Description:** Hovering over a requirement in the PRD MUST highlight the corresponding data model in the TAS ERD.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-092-3]** Approval Checkboxes
- **Type:** UX
- **Description:** Every requirement block MUST have a "Sign-off" checkbox. The "Approve Architecture" button remains disabled until all P3 (Must-have) requirements are checked.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-093]** Large-Scale Graph Navigation
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-093-1] Clustering**: Tasks are visually grouped into Epic bounding boxes (light grey background).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-093-1]** Clustering
- **Type:** Functional
- **Description:** Tasks are visually grouped into Epic bounding boxes (light grey background).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-093-2]** Critical Path Highlighting
- **Type:** Functional
- **Description:** A toggle to highlight the longest sequence of dependent tasks that define the project duration.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-093-3]** Filtering Bar
- **Type:** UX
- **Description:** Fast search by Task ID, Title, or associated Requirement ID.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-093-4]** Task Detail Card
- **Type:** Technical
- **Description:** A slide-out panel showing the full implementation history, including failing test logs and git diffs.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-094]** High-Density Development Hub
- **Type:** UX
- **Description:** The active view during Phase 4.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-094-1]** Thought Stream (Center)
- **Type:** Functional
- **Description:** The serif-based, narrative reasoning of the agent. New thoughts slide in from the bottom.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-094-2]** Tool Log (Right Sidebar)
- **Type:** UX
- **Description:** A collapsed list of tool calls (`read_file`, `npm test`). Clicking expands the raw redacted output.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-094-3]** Sandbox Terminal (Bottom)
- **Type:** UX
- **Description:** A monospaced terminal view (`xterm.js`) showing the real-time stdout/stderr of the active test execution.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-100]** Context-Aware Injection
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-100-1] Trigger**: `Cmd+K` (macOS) or `Ctrl+K` (Windows).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-100-1]** Trigger
- **Type:** Functional
- **Description:** `Cmd+K` (macOS) or `Ctrl+K` (Windows).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-100-2]** Autocomplete
- **Type:** UX
- **Description:** `@` triggers a list of project files; `#` triggers a list of requirement IDs.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-100-3]** Ghost Text
- **Type:** Functional
- **Description:** "Whisper a directive to the agent (e.g., 'Use fetch instead of axios')..."
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-100-4]** Priority Toggle
- **Type:** Functional
- **Description:** A checkbox for "Immediate Pivot" that forces the current agent turn to interrupt and reflect on the directive.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-101]** Transactional Sign-off
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-101-1] Diff View**: When an agent proposes a TAS change mid-implementation, the approval modal MUST show a side-by-side diff of the Markdown spec.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-101-1]** Diff View
- **Type:** UX
- **Description:** When an agent proposes a TAS change mid-implementation, the approval modal MUST show a side-by-side diff of the Markdown spec.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-101-2]** Risk Indicator
- **Type:** UX
- **Description:** Color-coded badges (Low, Med, High) based on how many downstream tasks are affected by the change.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-110]** Interactive Blueprint Rendering
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-110-1] Auto-Sync**: Diagrams re-render within 200ms of a file save.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-110-1]** Auto-Sync
- **Type:** Functional
- **Description:** Diagrams re-render within 200ms of a file save.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-110-2]** Pan/Zoom Controls
- **Type:** UX
- **Description:** Floating toolbar on every diagram for "Reset View" and "Export to SVG".
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-110-3]** Agentic Links
- **Type:** Functional
- **Description:** Double-clicking a node in a Mermaid diagram (e.g., a DB table) MUST open the corresponding definition in the TAS source.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-111]** Performance Telemetry
- **Type:** Technical
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-111-1] Flamegraphs**: Visual representation of CPU execution time captured via the `ProjectServer` profiling tool.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-111-1]** Flamegraphs
- **Type:** Functional
- **Description:** Visual representation of CPU execution time captured via the `ProjectServer` profiling tool.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-111-2]** Heap Snapshots
- **Type:** Functional
- **Description:** A treemap visualization of memory allocation, highlighting modules exceeding the TAS memory quota.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-120]** The "Glitch" State
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-120-1] Visual Feedback**: When entropy is detected (>3 repeating hashes), the active Thought Block header should pulse red and exhibit a subtle "shake" effect.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-120-1]** Visual Feedback
- **Type:** Functional
- **Description:** When entropy is detected (>3 repeating hashes), the active Thought Block header should pulse red and exhibit a subtle "shake" effect.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-120-2]** RCA Report
- **Type:** Functional
- **Description:** A modal overlay presenting the agent's Root Cause Analysis, contrasting the failing strategy with a proposed pivot.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-121]** Connection Lost
- **Type:** Functional
- **Description:** A full-page blurred overlay with a "Reconnecting to Orchestrator..." spinner.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-122]** Sandbox Breach Alert
- **Type:** Security
- **Description:** A high-priority red banner across the entire UI if a container attempt to escape its network/filesystem boundary is detected.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-123]** Token Budget Overrun
- **Type:** Functional
- **Description:** A yellow overlay masking the "Run" button when the project exceeds 80% of its allocated USD budget.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-130]** Contextual Guidance Display
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-130-1] Module Hover**: In the `src/` view, hovering a file name MUST show a summary of its `.agent.md` documentation (Intent, Hooks, Test Strategy).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-130-1]** Module Hover
- **Type:** UX
- **Description:** In the `src/` view, hovering a file name MUST show a summary of its `.agent.md` documentation (Intent, Hooks, Test Strategy).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-130-2]** Introspection Highlights
- **Type:** Functional
- **Description:** Specific lines of code that serve as "Agentic Hooks" SHOULD be highlighted with a distinctive left-gutter icon (e.g., a "Glass Box" glyph).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-140]** Semantic Annunciations
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-140-1] Aria-Live**: New agent thoughts MUST be announced as "Polite" updates.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-140-1]** Aria-Live
- **Type:** Functional
- **Description:** New agent thoughts MUST be announced as "Polite" updates.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-140-2]** Task Success
- **Type:** Functional
- **Description:** "Task [ID] Completed Successfully" MUST be announced as an "Assertive" update.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-141]** Forced Contrast Mode
- **Type:** UX
- **Description:** In VSCode High Contrast themes, all alpha-blended backgrounds (`--devs-bg-thought`) revert to solid background colors with high-contrast borders to ensure WCAG 2.1 compliance.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-RISK-001]** Risk
- **Type:** Non-Functional
- **Description:** Information density may lead to "Dashboard Fatigue" for non-architect users. *Mitigation*: Implementation of "LOD" (Level of Detail) toggles to collapse technical telemetry.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-RISK-002]** Risk
- **Type:** Non-Functional
- **Description:** Theme resilience across 1,000+ community VSCode themes. *Mitigation*: Strict reliance on standard VSCode semantic tokens rather than custom hex codes.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-RISK-003]** Risk
- **Type:** Non-Functional
- **Description:** Serif fonts on low-DPI displays can sometimes exhibit poor legibility. *Mitigation*: Implementation of a "Monospace Only" mode for accessibility if subpixel rendering fails.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-RISK-004]** Risk
- **Type:** Non-Functional
- **Description:** High-frequency updates from Gemini 3 Flash could lead to "Stuttering" if animations are too complex. *Mitigation*: Implementation of a global "Animation Throttler" that drops frames if the CPU usage exceeds 30%.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-RISK-005]** Risk
- **Type:** Non-Functional
- **Description:** Terminal resizing during a long-running task can cause `Ink` to crash or corrupt the buffer. *Mitigation*: Implementation of a `ResizeObserver` that forces a full layout re-calculation and terminal clear.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-RISK-006]** Risk
- **Type:** Non-Functional
- **Description:** Sudden layout shifts during streaming logs can disorient the user. *Mitigation*: Implementation of a "Scroll Lock" that prevents the view from jumping when new content is appended unless the user is already at the bottom of the buffer.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-UNK-001]** Unknown
- **Type:** Technical
- **Description:** Should the user be allowed to override the "Agent Thought" Serif font with a custom font? *Recommendation*: No, the serif font is a critical semantic marker for agency; allowing overrides could dilute the visual hierarchy.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-UNK-002]** Unknown
- **Type:** Technical
- **Description:** Should the "Thinking Pulse" be color-coded based on model confidence? *Recommendation*: No, keep it neutral; use the `LogTerminal` for confidence scores to avoid visual noise.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-UNK-003]** Unknown
- **Type:** Technical
- **Description:** Should the CLI support "Mouse Interaction" (clicking nodes)? *Recommendation*: No, maintain a 100% keyboard-driven interface for CLI consistency; reserve mouse interaction for the VSCode Extension.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-UNK-004]** Unknown
- **Type:** Technical
- **Description:** How should the UI adapt if the user has a custom VSCode "Zoom" setting > 200%? *Recommendation*: All spacing variables MUST use `rem` or `em` units to ensure they scale with the editor's base font size.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

