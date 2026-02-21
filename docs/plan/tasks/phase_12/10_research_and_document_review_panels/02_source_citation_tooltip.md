# Task: Source Citation Tooltip Component (Sub-Epic: 10_Research and Document Review Panels)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-091-2]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/research/__tests__/CitationTooltip.test.tsx`, write unit tests using React Testing Library and Vitest that verify:
  - The `CitationTooltip` component renders an inline superscript trigger element (`<sup>`) with the citation number visible.
  - The tooltip popover is **not** present in the DOM (or has `hidden` attribute) before hover/focus.
  - After `fireEvent.mouseEnter` on the trigger, a tooltip element (`role="tooltip"`) appears containing:
    - The full source URL as a clickable `<a>` link that opens in a new tab (`target="_blank" rel="noopener noreferrer"`).
    - A "Reliability Score" label with the numeric score formatted to one decimal place (e.g., `0.8`).
    - A color-coded badge: green (`≥0.8`), amber (`0.5–0.79`), red (`<0.5`).
  - After `fireEvent.mouseLeave`, the tooltip is hidden again.
  - The tooltip also appears on `focus` of the trigger and hides on `blur` (keyboard accessibility).
  - Passing `reliabilityScore` outside `[0, 1]` logs a console warning and clamps to the nearest valid value.
- [ ] Write an accessibility test using `axe` (via `jest-axe` or `@axe-core/react`) asserting zero violations on the rendered component.

## 2. Task Implementation
- [ ] Define (or extend) the `Citation` interface in `packages/webview-ui/src/types/research.ts` (already declared in Task 01; confirm it includes `id`, `url`, `reliabilityScore`, `retrievedAt`).
- [ ] Create `packages/webview-ui/src/components/research/CitationTooltip.tsx`:
  - Props: `citation: Citation`, `index: number` (1-based display number).
  - Use `useState<boolean>` to track `isVisible`.
  - Render:
    ```tsx
    <span className="relative inline-block">
      <sup
        id={`cite-trigger-${citation.id}`}
        aria-describedby={`cite-tooltip-${citation.id}`}
        tabIndex={0}
        className="cursor-pointer text-blue-500 text-xs"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        [{index}]
      </sup>
      {isVisible && (
        <div
          role="tooltip"
          id={`cite-tooltip-${citation.id}`}
          className="absolute z-50 bottom-full left-0 mb-1 w-72 rounded-md border bg-white p-3 shadow-lg text-sm"
        >
          <a href={citation.url} target="_blank" rel="noopener noreferrer"
             className="break-all text-blue-600 underline">
            {citation.url}
          </a>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-gray-600">Reliability Score:</span>
            <span className={reliabilityBadgeClass(citation.reliabilityScore)}>
              {clampedScore.toFixed(1)}
            </span>
          </div>
        </div>
      )}
    </span>
    ```
  - Implement `reliabilityBadgeClass(score: number): string` as a pure helper function in the same file:
    - Returns `"bg-green-100 text-green-800 px-1 rounded"` for score ≥ 0.8.
    - Returns `"bg-amber-100 text-amber-800 px-1 rounded"` for 0.5 ≤ score < 0.8.
    - Returns `"bg-red-100 text-red-800 px-1 rounded"` for score < 0.5.
  - Implement `clampScore(score: number): number` that clamps to [0, 1] and logs `console.warn` if out of range.
- [ ] Create `packages/webview-ui/src/components/research/CitedText.tsx`:
  - Props: `text: string`, `citations: Citation[]`.
  - Parses `text` for citation markers in the format `[cite:ID]` and replaces them inline with `<CitationTooltip citation={...} index={n} />`.
  - Falls back to rendering plain text if no markers found.
- [ ] Export both components from `packages/webview-ui/src/components/research/index.ts`.
- [ ] Integrate `CitedText` into the `ResearchSection` renderer inside `ResearchPanel` so section body text renders with citation tooltips.

## 3. Code Review
- [ ] Confirm `role="tooltip"` and `aria-describedby` linkage is correct per WAI-ARIA 1.2.
- [ ] Verify `reliabilityBadgeClass` has no side effects and is a pure function; unit-test it directly.
- [ ] Check that the tooltip renders in a `<span className="relative">` so it positions relative to the trigger, not the viewport.
- [ ] Ensure `target="_blank"` links include `rel="noopener noreferrer"` to prevent opener attacks.
- [ ] Confirm `CitedText` regex for `[cite:ID]` markers is safe against catastrophic backtracking.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter webview-ui test -- --run CitationTooltip` and confirm all tests pass.
- [ ] Run `pnpm --filter webview-ui test -- --run CitedText` and confirm all tests pass.
- [ ] Confirm the `axe` accessibility test reports zero violations.

## 5. Update Documentation
- [ ] Add JSDoc to `CitationTooltip.tsx` describing the `reliabilityScore` color mapping thresholds.
- [ ] Add JSDoc to `CitedText.tsx` documenting the `[cite:ID]` marker syntax.
- [ ] Add to `docs/agent-memory/phase_12_decisions.md`: "Citation tooltips use inline `[cite:ID]` markers; reliability score thresholds are 0.8 (green) and 0.5 (amber)."

## 6. Automated Verification
- [ ] `pnpm --filter webview-ui test -- --run` exits 0.
- [ ] `pnpm --filter webview-ui tsc --noEmit` exits 0.
- [ ] Run `pnpm --filter webview-ui test -- --run --reporter=verbose 2>&1 | grep -c "✓"` and confirm the count includes the CitationTooltip and CitedText suites.
