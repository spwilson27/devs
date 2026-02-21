# Task: Add sparklines & status indicators components and integrate into task items (Sub-Epic: 36_High_Density_SNR)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-004-1]

## 1. Initial Test Written
- [ ] Add unit tests at src/ui/components/__tests__/Sparkline.test.tsx:
  - Given an array of samples (e.g., [0,1,3,2,5]) assert the SVG path generator returns a valid path string and the component renders an <svg> with one <path>.
  - Add tests for downsampling: if samples.length > 32, ensure generator reduces to <=32 points.
- [ ] Add tests at src/ui/components/__tests__/StatusDot.test.tsx for status-to-color mapping (PENDING/SUCCESS/FAILURE).

Example snippet:

```ts
import { render } from '@testing-library/react';
import { Sparkline } from 'src/ui/components/Sparkline';

test('renders sparkline path', () => {
  const { container } = render(<Sparkline data={[0,1,2,3]} width={40} height={12} />);
  expect(container.querySelector('svg path')).toBeTruthy();
});
```

## 2. Task Implementation
- [ ] Implement src/ui/components/Sparkline.tsx:
  - Use an SVG path generator with maxPoints = 32 and linear scaling to component width/height.
  - Downsample input using simple stride or largest-triangle-three-buckets (LT3B) if available; fallback to stride sampling to keep implementation tiny.
  - Props: data:number[], width?:number, height?:number, color?:string
  - Keep DOM minimal and memoize path string.
- [ ] Implement src/ui/components/StatusDot.tsx:
  - Props: size:number, status: 'PENDING'|'SUCCESS'|'FAILURE' and map to theme colors; include aria-label.
- [ ] Integrate both components into CompactTaskList row renderer (lazy load or memoize) and prefer SVG for clarity; support canvas fallback when rendering thousands of items.

## 3. Code Review
- [ ] Verify determinism of path generator and downsampling correctness.
- [ ] Ensure components are memoized and cheap to render.
- [ ] Confirm accessible aria-labels for StatusDot.

## 4. Run Automated Tests to Verify
- [ ] Run: npm test -- src/ui/components --silent
- [ ] Add lightweight perf test that renders 500 Sparkline components in a test and ensures no exceptions are thrown.

## 5. Update Documentation
- [ ] Add examples and storybook stories for Sparkline and StatusDot with recommended props for high-density display.

## 6. Automated Verification
- [ ] Add snapshot tests for the Sparkline path and an automated check that sampledPoints <= 32 for large inputs.
