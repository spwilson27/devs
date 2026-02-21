# Task: Implement AOD Testability and Edge Case Documentation Generator (Sub-Epic: 08_AOD Edge Cases & Details)

## Covered Requirements
- [1_PRD-REQ-OBS-006], [1_PRD-REQ-OBS-007]

## 1. Initial Test Written
- [ ] Write unit tests for `AODGenerator` class in `src/agents/documentation/AODGenerator.spec.ts`.
- [ ] Create mock source file inputs and assert that the generated `.agent.md` correctly extracts and renders an explicit `## How to Test` section.
- [ ] Create mock inputs with known constraints and assert the generated `.agent.md` contains an `## Edge Cases and Constraints` section.
- [ ] Write an integration test to ensure these two sections are populated during a standard module generation lifecycle, failing the test if the sections are empty or missing.

## 2. Task Implementation
- [ ] Update `src/agents/documentation/AODGenerator.ts` to include logic for extracting testability guidelines and edge case constraints from the agent's context or reasoning trace.
- [ ] Modify the `AOD_TEMPLATE` to explicitly include placeholders for `## How to Test` and `## Edge Cases and Constraints`.
- [ ] Ensure that when an agent generates or updates a module, it actively formulates testing instructions specific to that module's functionality and lists any known constraints, injecting them into the template.
- [ ] Execute `pnpm run build` to verify there are no compilation errors in the new types or interfaces.

## 3. Code Review
- [ ] Verify that the extraction logic does not hardcode generic testing advice but actively analyzes the module's AST or agent context for specific testing approaches.
- [ ] Ensure the generated markdown is clean, properly formatted, and adheres to the `Agent-Oriented Documentation` style guidelines.
- [ ] Confirm that no existing AOD generation pipelines are broken by these new mandatory fields.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm run test:unit src/agents/documentation/AODGenerator.spec.ts` and verify it passes.
- [ ] Run the full test suite `pnpm run test` to catch any regressions.

## 5. Update Documentation
- [ ] Update `docs/architecture/AOD_Specification.md` to reflect the new mandatory `How to Test` and `Edge Cases` sections in all `.agent.md` files.
- [ ] Add a memory note to the Developer Agent instructing it to always populate these sections when creating or modifying modules.

## 6. Automated Verification
- [ ] Run the validation script `node scripts/verify_aod_format.js --strict` to ensure all recently generated `.agent.md` mock outputs contain the newly required headers and that the script completes with exit code 0.