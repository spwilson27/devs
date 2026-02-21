# Task: Implement CompactTaskList React component with virtualization (Sub-Epic: 36_High_Density_SNR)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-004]

## 1. Initial Test Written
- [ ] Add integration tests at src/ui/tasklist/__tests__/CompactTaskList.test.tsx:
  - Render CompactTaskList with 1000 mocked tasks and density mode 'compact'.
  - Assert that the DOM contains only the visible rows (e.g., container.querySelectorAll('.task-item').length <= Math.ceil(height / itemHeight) + 10).
  - Snapshot a single rendered row for regression.

Example test outline (React Testing Library + Jest):

```ts
import { render } from '@testing-library/react';
import { CompactTaskList } from 'src/ui/tasklist/CompactTaskList';
// mock density store to 'compact' and itemHeight = 24
// render with 1000 tasks and assert visible DOM nodes count
```

## 2. Task Implementation
- [ ] Implement src/ui/tasklist/CompactTaskList.tsx using react-window FixedSizeList:
  - Props: tasks: Task[], height:number, width:number
  - itemSize should be derived from useDensityStore().getItemHeight()
  - Row renderer must be minimal: icon (Codicon), concise Label component, Sparkline placeholder, StatusDot.
  - Use React.memo for the row renderer and useCallback for itemData.
  - Ensure role attributes: role="list" on container and role="listitem" for rows.

## 3. Code Review
- [ ] Verify virtualization reduces DOM nodes for large lists.
- [ ] Confirm memoization patterns and stable keys (task.id).
- [ ] Confirm accessibility roles and keyboard navigation support.

## 4. Run Automated Tests to Verify
- [ ] Run: npm test -- src/ui/tasklist --silent
- [ ] Run specific jest test: npx jest -t "CompactTaskList"

## 5. Update Documentation
- [ ] Add a Storybook story src/ui/tasklist/CompactTaskList.stories.tsx showing 10k items and the density toggle.

## 6. Automated Verification
- [ ] Add a unit test in CI that mounts the component in jsdom, counts .task-item nodes and asserts node count <= visible window + buffer.
