# Task: Implement CLIController for Core Logic Abstraction (Sub-Epic: 01_CLI Foundation & Core Logic)

## Covered Requirements
- [2_TAS-REQ-033], [TAS-102]

## 1. Initial Test Written
- [ ] Write unit tests for `CLIController` in `packages/cli/src/controllers/__tests__/CLIController.test.ts`.
- [ ] Test that `CLIController` can correctly parse and route internal command objects to the orchestrator.
- [ ] Mock the core orchestrator and verify that calling `controller.execute('init')` triggers the appropriate orchestrator method.
- [ ] Verify that `CLIController` handles errors from the orchestrator gracefully.

## 2. Task Implementation
- [ ] Create `packages/cli/src/controllers/CLIController.ts`.
- [ ] Implement a class `CLIController` that takes an instance of the orchestrator from `@devs/core`.
- [ ] Add methods to handle different command types: `init`, `run`, `status`.
- [ ] Implement a `handleError` method to format orchestrator errors for terminal display.
- [ ] Ensure the controller manages the lifecycle of the TUI or Headless logger depending on the flags.

## 3. Code Review
- [ ] Verify that `CLIController` remains decoupled from specific TUI implementation details (Ink).
- [ ] Check for proper TypeScript typing for command arguments and responses.
- [ ] Ensure the controller follows the singleton or dependency injection pattern used in the project.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/cli/src/controllers/CLIController.test.ts` and verify all tests pass.

## 5. Update Documentation
- [ ] Add JSDoc comments to `CLIController` methods explaining their role in the CLI lifecycle.

## 6. Automated Verification
- [ ] Use a test script to instantiate `CLIController` with a mock orchestrator and verify it returns a successful "Ready" state.
