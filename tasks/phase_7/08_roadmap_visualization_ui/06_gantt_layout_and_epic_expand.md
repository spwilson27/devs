# Task: Gantt Layout and Expandable Epic/Task Layout (Sub-Epic: 08_Roadmap_Visualization_UI)

## Covered Requirements
- [4_USER_FEATURES-REQ-033]

## 1. Initial Test Written
- [ ] Add unit tests at tests/ui/roadmap/gantt.test.(ts|js) verifying:
  - Epic rows render in temporal order given epic.start_date and epic.end_date.
  - Expanding an epic exposes its tasks aligned to the same timeline and maintains consistent widths/positions when the time scale changes.
  - Collapsing an epic reclaims vertical space and preserves scroll position.

## 2. Task Implementation
- [ ] Implement a Gantt component at src/ui/roadmap/GanttView.(tsx|jsx) with:
  - Time axis (configurable granularity day/week/month) and responsive scaling.
  - Expand/collapse controls on epic rows; keyboard accessible toggles.
  - Smooth animated transitions when expanding/collapsing using CSS transforms, without reflow of the entire document.

## 3. Code Review
- [ ] Verify correct time-to-pixel calculations, off-by-one date handling, and that expand/collapse operations have tests covering focus management and ARIA attributes for screen readers.

## 4. Run Automated Tests to Verify
- [ ] Run gantt unit tests and a small integration test that renders a 10-epic sample and programmatically toggles expands/collapses.

## 5. Update Documentation
- [ ] Document the Gantt configuration options and an example JSON payload used by the component in docs/gantt.md.

## 6. Automated Verification
- [ ] Add a script `scripts/verify_gantt.sh` that runs the unit tests and uses a headless renderer to take a DOM snapshot of an expanded epic and compares it against an approved fixture.