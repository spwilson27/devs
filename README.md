# devs

`devs` is a powerful agentic AI system that takes a short project description and example user journeys, translating them into a completely finished, thoroughly tested greenfield software project. 

It exposes its functionality via a VSCode Extension, a CLI tool, and an MCP interface.

## How It Works

The system operates by orchestrating a series of specialized AI agents:

1. **Research & Analysis**: Generates comprehensive market, competitive, technical, and user research reports.
2. **Specification authoring**: Produces a detailed set of authoritative high-level documents (PRD, TAS, MCP Architecture, Security Design, UI/UX). No flowery language—just decisive, problem-identifying architectures.
3. **Requirement Distillation**: Distills all specifications into a complete, deduplicated list of requirements ordered by dependencies.
4. **Phase & Task Generation**: Groups requirements into broad phases (epics) and breaks them down into atomic tasks (approx. 25+ per phase), ensuring 100% requirement coverage.
5. **Rigorous TDD Loop**: Iterates through tasks, using AI agents to write initial tests, implement code, review, and validate against automated test runs. The AI updates documentation and "memory" throughout the process.

## The `do` Script

The primary tool for managing the project's development lifecycle locally is the `./do` script. Built natively in Python, it handles code formatting, linting, testing, and more. 

### Available Commands:

- `./do fmt` - Run code formatting.
- `./do lint` - Run code linting.
- `./do build` - Run the build process.
- `./do test` - Run unit tests.
- `./do coverage` - Run code coverage.
- `./do presubmit` - Run all presubmit checks sequentially (`fmt`, `lint`, `build`, `test`, `coverage`). 

> **Note:** The `do` script currently contains boilerplate placeholders (`echo`). Be sure to configure it with the physical tools chosen for your generated project (e.g., `black`/`ruff` for formatting, `pytest` for testing).

## Monorepo Structure

`devs` is a pnpm monorepo. All packages live under `packages/` and are scoped to `@devs/`.

```
devs/
├── packages/
│   ├── core/       @devs/core     — Orchestration logic, LangGraph state machine (headless-first)
│   ├── agents/     @devs/agents   — AI agent implementations
│   ├── sandbox/    @devs/sandbox  — Isolated execution environment
│   ├── memory/     @devs/memory   — Agent memory layer (short/medium/long-term, SQLite-backed)
│   ├── mcp/        @devs/mcp      — MCP server (debugging and profiling tools for AI agents)
│   ├── cli/        @devs/cli      — CLI interface (UI shell; all logic in @devs/core)
│   └── vscode/     @devs/vscode   — VSCode extension (UI shell; all logic in @devs/core)
├── docs/
│   ├── plan/           — AI-generated research, specs, requirements, phases, tasks
│   └── infrastructure/ — Infrastructure and tooling documentation
├── tests/
│   └── infrastructure/ — Monorepo structure verification tests
├── scripts/            — Orchestration and generation scripts
├── pnpm-workspace.yaml — Workspace definition
├── .nvmrc              — Node.js 22 (LTS)
└── .npmrc              — pnpm settings (shamefully-hoist=false)
```

**Requirements:** Node.js >= 22.x, pnpm >= 9.x. See [docs/infrastructure/monorepo_setup.md](docs/infrastructure/monorepo_setup.md).

```bash
pnpm install   # install and link all workspace packages
./do test      # verify monorepo structure
```

## Planning Documents

- `docs/plan/` - Contains all AI-generated research, specifications, requirements, phases, and tasks.
- `scripts/gen_all.py` - Orchestrates the generation of all documents, requirements, and tasks phases.
- `scripts/run_workflow.py` - Executes the parallel DAG-based TDD implementation loop.
- `scripts/verify_requirements.py` - A robust verification tool ensuring every requirement maps completely to epic and task phases without hallucination.

## Agentic Debugging & Validation

Every project produced by `devs` must support agentic debugging and profiling from day one. This guarantees proper separation of concerns, strong test coverage, and straightforward integration with the included MCP server.

Whether through direct specification override or by interacting via chat, the `devs` user is capable of stepping into the generation process to review architectural decisions or correct any automated actions at any phase.
