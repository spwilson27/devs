# Project Scaffolding Utility

> **Requirement:** [1_PRD-REQ-NEED-MAKER-01] Instant Project Scaffolding

The `devs` scaffolding utility creates a new, agent-friendly, devs-ready project
structure in seconds — conforming to TAS-040 and TAS-104 specifications.

## Usage

```bash
python3 scripts/scaffold_project.py init-project <path>
```

### Examples

```bash
# Create a new project in the current directory
python3 scripts/scaffold_project.py init-project ./my-project

# Create a project at an absolute path
python3 scripts/scaffold_project.py init-project /projects/my-saas-app

# The last segment of the path becomes the project name
python3 scripts/scaffold_project.py init-project ../my-api
```

The target directory must either not exist or be empty. The utility will refuse
to overwrite a non-empty directory.

## Standard Scaffolded Structure

Every project created by this utility has the following layout:

```
<project-root>/
├── .devs/                   # Internal Orchestrator State (Flight Recorder)
│   ├── .gitignore           # Excludes runtime state from VCS
│   └── POLICY.md            # Developer Agent write-access prohibition
├── .agent/                  # Agent-Oriented Documentation (AOD)
│   ├── index.agent.md       # AI agent entry point & "Rules of the House"
│   ├── catalog.json         # Machine-readable module map
│   └── modules/             # Per-module .agent.md files (added over time)
├── mcp-server/              # Project-Specific MCP Observability Server
│   └── src/
│       ├── tools/           # Project-specific inspection tools
│       ├── resources/       # Dynamic MCP resources
│       └── prompts/         # Reusable debugging prompt templates
├── src/                     # Application Source Code
├── tests/                   # Red-Green-Refactor Test Suite
│   ├── unit/                # Atomic logic tests
│   ├── integration/         # Cross-module flow tests
│   ├── e2e/                 # Full user-journey validation
│   └── agent/               # Agentic observability tests
├── docs/                    # High-Level Specs & Research Reports
│   ├── research/            # Market, competitive, tech, user research
│   └── specs/               # PRD, TAS, MCP Design, UI/UX, Security
├── scripts/                 # Utility & Automation Scripts
├── .github/                 # CI/CD & Workflow Definitions
│   └── workflows/
├── .gitignore               # Standard Git Exclusions
├── .env.example             # Environment Template (No Secrets)
├── README.md                # Human-Readable Overview
└── package.json             # Version-Locked Manifest with devs metadata
```

## Generated File Details

### `package.json`

Every scaffolded `package.json` includes a `devs` metadata section (TAS-076):

```json
{
  "name": "my-project",
  "version": "0.0.1",
  "private": true,
  "devs": {
    "project_id": "<uuid>",
    "version": "1.0.0",
    "generated_by": "devs-scaffold"
  },
  "engines": {
    "node": ">=22",
    "pnpm": ">=9"
  }
}
```

The `project_id` is a unique UUID generated at scaffold time. It identifies the
project across all `devs` state stores.

### `.agent/index.agent.md`

The AI agent entry point. Contains:

- Core philosophy for the project
- High-level architecture overview (placeholder, to be filled during research)
- "The Rules of the House" — project-wide constraints for AI agents
- Link to `catalog.json` for the machine-readable module map

### `.agent/catalog.json`

A machine-readable JSON file that maps modules to their `.agent.md` files and
requirement IDs. Initially empty (no modules yet); populated as the project
grows.

```json
{
  "version": "1.0.0",
  "project": "my-project",
  "modules": [],
  "generated_by": "devs-scaffold"
}
```

### `.devs/POLICY.md`

Documents the Developer Agent write-access prohibition for the `.devs/`
directory (TAS-061 Flight Recorder). This file is the only documentation inside
`.devs/` committed to VCS — all runtime state (SQLite, LanceDB, logs) is
excluded via `.devs/.gitignore`.

## Why This Structure?

The scaffolded structure implements **Glass-Box transparency**:

| Directory    | Purpose                                                                   |
|--------------|---------------------------------------------------------------------------|
| `.devs/`     | Tamper-proof flight recorder; agents cannot corrupt orchestrator state    |
| `.agent/`    | Every module explained from an AI perspective; enables efficient handoffs |
| `mcp-server/`| Agents can inspect the *running* application via MCP tools                |
| `tests/agent/`| Reviewer Agent can verify agentic observability automatically            |

## Automated Verification

The scaffolding utility is covered by an automated integration test:

```bash
bash tests/infrastructure/verify_scaffold_utility.sh
```

This test is integrated into `./do test` (and therefore `./do presubmit`) and
runs 26 checks covering:

- Scaffold command exits successfully
- All required directories exist (TAS-104)
- All required root files exist (TAS-104)
- `package.json` has `devs` metadata with `project_id`, `version`, `generated_by`
- AOD structure: `index.agent.md`, `catalog.json`, `modules/` (TAS-042)
- Flight Recorder: `.devs/.gitignore` and `.devs/POLICY.md` (TAS-061)
- Safety: refuses to overwrite a non-empty directory

## Next Steps After Scaffolding

1. `cd <project-path>`
2. Configure `package.json` scripts for your chosen toolchain (TypeScript + ESLint + Vitest recommended)
3. Update `.agent/index.agent.md` with the project's real architecture
4. Run `devs research` to generate the research phase documents into `docs/research/`
5. Initialize git: `git init && git add . && git commit -m "Initial scaffold"`
