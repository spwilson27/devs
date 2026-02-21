# Task: Build Motion Examples and Documentation (Sub-Epic: 48_Motion_Philosophy)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-050], [7_UI_UX_DESIGN-REQ-UI-DES-006]

## 1. Initial Test Written
- [ ] Create integration examples and lightweight tests that demonstrate approved motion patterns:
  - Add storybook stories: packages/ui-components/stories/motion.stories.tsx that render DataDistillation (a short animation showing items flying into a requirements list) and SystemPulse (a pulsing UI element for agent thinking).
  - Add test that mounts the story in a headless browser and asserts only transform/opacity are animated (inspect computed style before and during animation frames).

Test details:
1. Use Storybook + Playwright or Puppeteer to open the story, capture computed styles, and ensure transitions are transform/opacity and duration <= 250ms.
2. The tests must fail before the components and stories are added.

## 2. Task Implementation
- [ ] Add stories and minimal example components (DataDistillationExample, SystemPulseExample) under packages/ui-components/stories/.
- [ ] Ensure the examples import AnimatedTransform and Pulse primitives from packages/ui-components and use ANIMATION_POLICY values.
- [ ] Add a short markdown page in docs/ui/motion-examples.md describing each example and the rationale linking to requirement IDs.

## 3. Code Review
- [ ] Verify examples exercise only allowed animation primitives, confirm examples are accessible (reduced-motion toggle works), and documentation references requirements.

## 4. Run Automated Tests to Verify
- [ ] Run storybook build and the headless integration tests: pnpm --filter @devs/ui-components test:integration or run the Playwright script that navigates to the local storybook build and asserts styles.

## 5. Update Documentation
- [ ] Commit docs/ui/motion-examples.md, update the top-level UI docs to include the motion examples, and add an anchor linking to the Functional Animation Manifesto.

## 6. Automated Verification
- [ ] Add a visual regression check that captures the short animation frames and validates that only transform/opacity change in pixel diff outlines (or use computed-style checks in CI).