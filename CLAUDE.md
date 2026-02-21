# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

`devs` is a meta-project: an AI orchestration system that takes a project description and generates a complete, tested greenfield software project. It is not yet implemented — this repo contains the planning infrastructure and the scripts that will drive the TDD implementation loop.

The generation pipeline:
1. **Research** → market/competitive/technical/user reports (`docs/plan/research/`)
2. **Specs** → PRD, TAS, MCP Design, Security, UI/UX (`docs/plan/specs/`)
3. **Requirements** → deduplicated, dependency-ordered list (`docs/plan/requirements.md`)
4. **Phases & Tasks** → ~15 phases, 300+ atomic tasks with DAG dependency maps (`docs/plan/tasks/`)
5. **TDD Loop** → parallel implementation via `run_workflow.py` (not yet started)

All generation is **complete**. The project is ready to begin Phase 1 TDD implementation.

## Commands

The `./do` script is the project task runner:

```bash
./do fmt        # Code formatting
./do lint       # Code linting
./do build      # Build
./do test       # Unit tests
./do coverage   # Coverage
./do presubmit  # All checks sequentially (fmt → lint → build → test → coverage)
```

> **Note:** `./do` currently contains placeholder `echo` commands. Before implementing any phase, configure it with the actual tools chosen for the generated project (e.g., `ruff`/`black` for formatting, `pytest` for testing).

## Architecture & Structure

### Planning Documents (`docs/plan/`)
- `input/description.md` — Original project brief (primary context for all agents)
- `research/` — Four research reports (market, competitive, tech, user)
- `specs/` — Nine specification documents (1_prd.md through 9_project_roadmap.md)
- `requirements.md` — Master ordered requirements (~400+ requirements with IDs like `[1_PRD-REQ-PIL-001]`)
- `phases/` — 15 phase definitions
- `tasks/phase_N/` — Atomic task markdown files + `dag_reviewed.json` per phase

### Agent Memory
`.agent/memory.md` — Shared long-term memory for all agents. **Read this before starting any implementation task and append architectural decisions after completing tasks.**
