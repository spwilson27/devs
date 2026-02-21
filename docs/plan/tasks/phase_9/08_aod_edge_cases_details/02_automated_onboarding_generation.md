# Task: Implement Automated Onboarding Document Generation (Sub-Epic: 08_AOD Edge Cases & Details)

## Covered Requirements
- [8_RISKS-REQ-068]

## 1. Initial Test Written
- [ ] Write an integration test `tests/integration/OnboardingGenerator.spec.ts` that initializes a mock project using the Phase 2 Blueprinting output.
- [ ] The test must verify that an `onboarding.agent.md` file is successfully generated at the root of the project directory.
- [ ] Assert that the generated `onboarding.agent.md` contains key architectural summaries, the system layout, and explicit instructions for any new developer (human or AI) to get started with the repository.

## 2. Task Implementation
- [ ] Create `src/agents/documentation/OnboardingGenerator.ts`.
- [ ] Implement logic to consume the finalized TAS (Technical Architecture Specification), PRD, and system layout to synthesize a comprehensive onboarding guide.
- [ ] The `onboarding.agent.md` must highlight the project's critical path, core architectural patterns, and provide setup and debugging instructions.
- [ ] Hook the `OnboardingGenerator` into the end of Phase 2 or the beginning of Phase 3, ensuring it triggers automatically once architectural blueprints are approved.

## 3. Code Review
- [ ] Ensure the generated document provides clear, high-signal information without excessive boilerplate.
- [ ] Verify that the `OnboardingGenerator` handles missing or incomplete TAS documents gracefully (e.g., throwing a clear validation error).
- [ ] Check that the onboarding document conforms to the project's machine-readable schema for agent compatibility.

## 4. Run Automated Tests to Verify
- [ ] Execute `pnpm run test:integration tests/integration/OnboardingGenerator.spec.ts` and ensure it passes.
- [ ] Run the project's linter `pnpm run lint` to ensure new code meets quality standards.

## 5. Update Documentation
- [ ] Update the TAS to explicitly list `onboarding.agent.md` as a required artifact in the generated project directory structure.
- [ ] Update the global `.gemini/settings.json` or equivalent agent memory to recognize `onboarding.agent.md` as the entry point for new agents assigned to the repository.

## 6. Automated Verification
- [ ] Run a test CLI command `devs generate-docs --mock` and verify `cat ./mock-project/onboarding.agent.md` outputs a valid, structured markdown file explaining the mock architecture.