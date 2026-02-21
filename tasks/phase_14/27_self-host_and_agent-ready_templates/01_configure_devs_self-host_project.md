# Task: Configure devs Project for Self-Hosting (Sub-Epic: 27_Self-Host and Agent-Ready Templates)

## Covered Requirements
- [9_ROADMAP-TAS-804]

## 1. Initial Test Written
- [ ] Write a unit test in `src/orchestrator/__tests__/selfHostConfig.test.ts` that:
  - Imports and validates the `devs.config.ts` file at the project root.
  - Asserts that `config.projectName` equals `"devs"`.
  - Asserts that `config.sourceRoot` points to `"src/"`.
  - Asserts that `config.agentModel` is set to a valid Gemini model identifier (e.g., `"gemini-3-pro"`).
  - Asserts that `config.selfHost === true` (a boolean flag that enables self-hosting mode).
  - Asserts that `config.requirementsPath` resolves to `"requirements.md"` within the devs repo root.
  - Asserts that `config.phases` is a non-empty array of phase file paths under `phases/`.
  - Asserts that `config.tasksRoot` resolves to `"tasks/"`.
  - Asserts that `config.testCommand` is a non-empty string (e.g., `"npm run test"`).
  - Asserts that `config.lintCommand` is a non-empty string (e.g., `"npm run lint"`).
- [ ] Write a test asserting that the `SelfHostConfigLoader` service throws a descriptive error when `selfHost` is `false` or missing.
- [ ] Write a test asserting that `SelfHostConfigLoader` throws when `requirementsPath` does not exist on disk.

## 2. Task Implementation
- [ ] Create `devs.config.ts` at the project root (`/Users/mrwilson/Software/devs/devs.config.ts`) with the following exported object:
  ```typescript
  // [9_ROADMAP-TAS-804] Self-host configuration for the devs project.
  export default {
    projectName: "devs",
    sourceRoot: "src/",
    agentModel: "gemini-3-pro",
    utilityModel: "gemini-3-flash",
    selfHost: true,
    requirementsPath: "requirements.md",
    phases: [
      "phases/phase_1.md",
      // ... (enumerate all phases)
    ],
    tasksRoot: "tasks/",
    testCommand: "npm run test",
    lintCommand: "npm run lint",
    buildCommand: "npm run build",
  };
  ```
- [ ] Create `src/orchestrator/SelfHostConfigLoader.ts`:
  - Export a `SelfHostConfigLoader` class with a `load(configPath: string): Promise<DevsConfig>` method.
  - `load()` must dynamically `import()` the config file.
  - Validate that `config.selfHost === true`; throw `SelfHostDisabledError` otherwise.
  - Validate that `config.requirementsPath` exists via `fs.access`; throw `ConfigValidationError` otherwise.
  - Return the validated typed `DevsConfig` object.
- [ ] Define the `DevsConfig` TypeScript interface in `src/orchestrator/types/DevsConfig.ts` with all fields strongly typed.
- [ ] Register `SelfHostConfigLoader` in the DI container (`src/container.ts`) under the token `SELF_HOST_CONFIG_LOADER`.

## 3. Code Review
- [ ] Confirm `devs.config.ts` is committed to the root of the repository and referenced in `package.json` under `"devs": { "config": "devs.config.ts" }`.
- [ ] Confirm all config fields are strongly typed via `DevsConfig` interface — no `any` types.
- [ ] Confirm `SelfHostConfigLoader` is stateless and injectable.
- [ ] Confirm validation errors include the offending field name and value in the error message.
- [ ] Confirm the file passes `tsc --noEmit` with strict mode enabled.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- --testPathPattern=selfHostConfig` and confirm all assertions pass with zero failures.
- [ ] Run `npm run lint` and confirm zero lint warnings or errors in modified files.
- [ ] Run `npm run build` and confirm the TypeScript compilation succeeds.

## 5. Update Documentation
- [ ] Add a `## Self-Hosting` section to `docs/orchestrator.md` explaining the `devs.config.ts` schema, the `selfHost` flag, and how `SelfHostConfigLoader` validates the configuration.
- [ ] Update the agent memory file `docs/agent_memory/phase_14.md` to note: "devs.config.ts created and validated by SelfHostConfigLoader; selfHost mode enabled."

## 6. Automated Verification
- [ ] Run `node -e "import('./devs.config.ts').then(c => { if (!c.default.selfHost) process.exit(1); console.log('OK'); })"` and confirm exit code 0.
- [ ] Run `npm run test -- --ci --coverage --testPathPattern=selfHostConfig` and confirm the coverage report shows ≥ 90% statement coverage for `SelfHostConfigLoader.ts`.
