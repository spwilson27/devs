# Task: Implement technical conciseness in labels (truncation + tooltips + ARIA) (Sub-Epic: 36_High_Density_SNR)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-004-2]

## 1. Initial Test Written
- [ ] Add unit tests at src/ui/components/__tests__/Label.test.tsx:
  - Test truncateLabel util for ASCII long strings, long identifiers, and multi-byte (CJK) strings: assert expected truncated output contains '…' and length <= maxChars.
  - Test Label component renders aria-label with full text, shows tooltip on hover, and supports keyboard focus.

Example truncate util test:

```ts
import { truncateLabel } from 'src/ui/utils/truncateLabel';

test('truncate ascii and cjk', () => {
  expect(truncateLabel('very-long-identifier-12345', 10)).toMatch(/…$/);
  expect(truncateLabel('中文字符测试很长的标签', 6)).toMatch(/…$/);
});
```

## 2. Task Implementation
- [ ] Implement src/ui/utils/truncateLabel.ts that:
  - Exposes truncateLabel(full:string, maxChars:number):string using grapheme-cluster-aware trimming (use Intl.Segmenter if available, fallback to codepoint-safe slicing).
- [ ] Implement src/ui/components/Label.tsx:
  - Props: text:string, maxChars:number, tooltipPlacement?: 'top'|'bottom'
  - Renders truncated text with aria-label={fullText} and a tooltip (role="tooltip") that displays the full text on hover/focus.
  - Support copy-to-clipboard on long-press / keyboard shortcut (Ctrl/Cmd+C when focused)

## 3. Code Review
- [ ] Verify Unicode-safe truncation and no broken grapheme clusters.
- [ ] Ensure tooltip is accessible and that aria-labels are present for screen readers.
- [ ] Confirm tests verify keyboard interactions.

## 4. Run Automated Tests to Verify
- [ ] Run: npm test -- src/ui/components --silent
- [ ] Run axe-core accessibility tests integrated into unit tests (e.g., jest-axe) to ensure aria attributes.

## 5. Update Documentation
- [ ] Document truncation rules and examples in docs/ui/labels.md and add Storybook stories demonstrating truncation and tooltip behavior.

## 6. Automated Verification
- [ ] Add a CI unit test that runs truncateLabel against a representative dataset and flags a high collision rate; enforce uniqueness threshold >= 95% for short labels in the sample.
