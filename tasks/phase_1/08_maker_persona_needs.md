# Tasks for 08_Maker Persona Needs (Phase: phase_1.md)

## Covered Requirements
- [REQ-NEED-MAKER-01], [REQ-NEED-MAKER-02], [REQ-NEED-MAKER-03]

### Task Checklist
- [ ] **Subtask 1: Ad-Hoc Tooling Setup for Documentation (REQ-NEED-MAKER-01)**: Create a `scripts/docs_gen_tool.py` (or equivalent script) that provides a basic CLI interface for the Maker to quickly scaffold high-level documents (PRD, TAS) without requiring the full `devs` system. Implement templating for Markdown generation.
- [ ] **Subtask 2: Automated Validation Infrastructure (REQ-NEED-MAKER-02)**: Configure a robust test runner (e.g., `pytest` or `vitest`) and establish a `tests/` directory structure. Ensure that a single command (e.g., `make test` or `npm run test`) can discover and run all tests, serving as the basis for thorough and entirely automated project validation from day one.
- [ ] **Subtask 3: Agentic Profiling Interfaces (REQ-NEED-MAKER-03)**: Design and implement a core profiling module (`core/profiler`) with methods to track execution time, memory usage, and token consumption. Expose these metrics in a structured JSON schema so AI agents can easily parse them during the development process.
- [ ] **Subtask 4: Agentic Debugging Hooks (REQ-NEED-MAKER-03)**: Implement an interceptor or middleware pattern in the core execution loop. This allows an external agent (via the MCP server interface) to pause execution, inspect the current state (variables, call stack), and resume execution, supporting gemini-based development.

### Testing & Verification
- [ ] **Test `docs_gen_tool.py`**: Write unit tests to ensure template creation and file generation work as expected based on mock inputs.
- [ ] **Test Automated Validation Pipeline**: Implement a sanity check test suite in the configured test runner to verify it discovers and executes tests correctly. Configure a dummy CI workflow to fail on broken markdown links.
- [ ] **Test Profiling Metrics**: Write unit tests for the `core/profiler` module, validating that mock token consumption and execution time are accurately recorded and output in the correct JSON schema.
- [ ] **Test Debugging Middleware**: Create an integration test simulating an MCP client attaching to the debugging middleware, sending "pause" and "resume" commands, and verifying that execution state transitions properly without crashing.
