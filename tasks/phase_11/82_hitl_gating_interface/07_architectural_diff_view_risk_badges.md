# Task: Architectural Change Diff View with Risk Indicator Badges (Sub-Epic: 82_HITL_Gating_Interface)

## Covered Requirements
- [4_USER_FEATURES-REQ-009], [7_UI_UX_DESIGN-REQ-UI-DES-092]

## 1. Initial Test Written

- [ ] Create `packages/vscode-webview/src/__tests__/ArchitecturalDiffView.test.tsx`.
- [ ] Write RTL unit tests:
  - Test that `ArchitecturalDiffView` renders two columns: "Before" (left) and "After" (right) when given `before` and `after` Markdown strings.
  - Test that lines present in `after` but not in `before` are highlighted with a green background (`--vscode-diffEditor-insertedLineBackground`).
  - Test that lines present in `before` but not in `after` are highlighted with a red background (`--vscode-diffEditor-removedLineBackground`).
  - Test that a `RiskBadge` renders for each semantic change type in the `semanticChanges` prop array with the correct label and color: `LOW` (green), `MED` (amber), `HIGH` (red).
  - Test that hovering a `RiskBadge` shows a tooltip explaining the downstream impact count (e.g., "Affects 12 downstream tasks").
  - Test that a "New Dependency Added" semantic change marker renders the codicon `$(extensions)` prefix in the diff line annotation.
  - Test that a "Security Policy Modified" semantic change renders the codicon `$(shield)` prefix.
  - Test that the component renders in read-only mode (no editing controls).
  - Test that the diff view is scrollable independently for each pane.
- [ ] Write a Storybook story `ArchitecturalDiffView.stories.tsx` with variants: `NO_CHANGES`, `MINOR_CHANGES`, `HIGH_RISK_CHANGES`.

## 2. Task Implementation

- [ ] Create `packages/vscode-webview/src/components/ArchitecturalDiffView/ArchitecturalDiffView.tsx`:
  - Props:
    ```ts
    interface SemanticChange {
      type: 'NEW_DEPENDENCY' | 'SECURITY_POLICY_MODIFIED' | 'SCHEMA_CHANGE' | 'API_CONTRACT_CHANGE' | 'AGENT_SCOPE_CHANGE';
      description: string;
      affectedDownstreamTaskCount: number;
      risk: 'LOW' | 'MED' | 'HIGH';
    }

    interface ArchitecturalDiffViewProps {
      before: string;             // Markdown source of the previous version
      after: string;              // Markdown source of the proposed version
      semanticChanges: SemanticChange[];
      title?: string;             // e.g., "Proposed TAS Changes — Phase 2"
    }
    ```
  - Use the `diff` npm package (`import { diffLines } from 'diff'`) to compute line-level changes between `before` and `after`.
  - Render a header bar with `title` and all `RiskBadge` components for each `semanticChange`.
  - Render a two-column side-by-side diff layout (per [7_UI_UX_DESIGN-REQ-UI-DES-092]):
    - Left column "Before": removed lines styled with `--vscode-diffEditor-removedLineBackground`.
    - Right column "After": added lines styled with `--vscode-diffEditor-insertedLineBackground`.
    - Unchanged lines rendered without background.
    - Each line prefixed with its line number (monospaced, `--vscode-editor-lineHighlightBackground` for line number gutter).
  - For lines matching a `semanticChange` (detected by keyword matching in the diff line content), prepend the appropriate codicon:
    - `NEW_DEPENDENCY` → `$(extensions)` codicon + semantic change label.
    - `SECURITY_POLICY_MODIFIED` → `$(shield)` codicon.
    - `SCHEMA_CHANGE` → `$(database)` codicon.
    - `API_CONTRACT_CHANGE` → `$(plug)` codicon.
    - `AGENT_SCOPE_CHANGE` → `$(robot)` codicon.
  - Each diff column is independently scrollable (`overflow-y: auto`).
- [ ] Create `packages/vscode-webview/src/components/ArchitecturalDiffView/RiskBadge.tsx`:
  - Props: `{ risk: 'LOW' | 'MED' | 'HIGH'; label: string; affectedCount: number }`.
  - Render a `<span>` with:
    - Background: `LOW` → `--vscode-charts-green`, `MED` → `--vscode-charts-yellow`, `HIGH` → `--vscode-charts-red`.
    - Text: `{label} ({affectedCount} tasks)`.
    - `title` attribute for native tooltip: `"Affects {affectedCount} downstream tasks"`.
    - `aria-label` for screen readers.
  - Border radius `4px`, font size `11px` (metadata size per [7_UI_UX_DESIGN-REQ-UI-DES-033-6]).
- [ ] Integrate `ArchitecturalDiffView` into `HitlApprovalModal`:
  - When the `HitlGatePayload` includes an `architecturalDiff` field (`{ before: string; after: string; semanticChanges: SemanticChange[] }`), render `ArchitecturalDiffView` inside the modal description section (below the `ReactMarkdown` description, before the footer buttons).
- [ ] Extend `HitlGatePayload` type (from task 01) to add optional `architecturalDiff?: { before: string; after: string; semanticChanges: SemanticChange[] }`.

## 3. Code Review

- [ ] Verify the `diff` library output is not rendered with `dangerouslySetInnerHTML` — each diff segment must be mapped to a React element.
- [ ] Confirm `RiskBadge` uses only `var(--vscode-charts-*)` color tokens — no hex literals.
- [ ] Verify the two-column layout uses CSS Grid with `grid-template-columns: 1fr 1fr` (not a table, to avoid accessibility issues with screen readers misinterpreting row relationships).
- [ ] Confirm that when `semanticChanges` is empty, the header badge area renders a "No semantic changes detected" notice (codicon `$(check)` + muted text).
- [ ] Verify the `diff` npm package is added to `packages/vscode-webview/package.json` dependencies.
- [ ] Confirm line number rendering uses `font-family: var(--vscode-editor-font-family)` (monospaced, per [7_UI_UX_DESIGN-REQ-UI-DES-033-5]).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/vscode-webview test -- --testPathPattern="ArchitecturalDiffView"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/vscode-webview tsc --noEmit` for type validation.

## 5. Update Documentation

- [ ] Add `ArchitecturalDiffView` to `packages/vscode-webview/src/components/README.md` under **"HITL Components"**, documenting the `SemanticChange` type and how semantic change detection works.
- [ ] Update `docs/agent_memory/phase_11_decisions.md`: "ArchitecturalDiffView uses the `diff` npm library for line diffing. SemanticChanges are pre-computed by the orchestrator and passed in HitlGatePayload.architecturalDiff. RiskBadges use vscode-charts color tokens."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/vscode-webview test --coverage --coverageThreshold='{"global":{"lines":90}}'` and confirm coverage threshold.
- [ ] Run `grep -r '"diff"' packages/vscode-webview/package.json` and assert the `diff` dependency is listed.
- [ ] Run `grep -r 'vscode-diffEditor-insertedLineBackground' packages/vscode-webview/src/components/ArchitecturalDiffView/` and assert the VSCode token is used.
