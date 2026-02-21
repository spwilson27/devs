# Monorepo Setup

## Runtime Requirements

| Tool    | Required Version | Rationale                                                              |
|---------|-----------------|------------------------------------------------------------------------|
| Node.js | >= 22.x (LTS)   | [TAS-060] High-performance async I/O; native VSCode Extension Host compatibility. |
| pnpm    | >= 9.x          | [TAS-006] Workspace monorepo support; content-addressable storage minimizes disk usage across sandboxes. |

The `.nvmrc` file at the repository root pins the project to Node.js 22. Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to activate it:

```bash
nvm use      # uses .nvmrc automatically
# or
fnm use      # uses .nvmrc automatically
```

## Package Manager Configuration

`.npmrc` settings:

| Setting                  | Value   | Rationale                                                       |
|--------------------------|---------|-----------------------------------------------------------------|
| `shamefully-hoist`       | `false` | Prevents phantom dependencies; each package must declare its own deps. |
| `strict-peer-dependencies` | `false` | Avoids install failures during early development phases; tighten later. |
| `auto-install-peers`     | `true`  | Automatically resolves peer dependency chains.                  |

## Workspace Structure

```
devs/                         ← root workspace (private)
├── packages/
│   ├── core/                 ← @devs/core       Orchestration logic, LangGraph state machine
│   ├── agents/               ← @devs/agents     AI agent implementations
│   ├── sandbox/              ← @devs/sandbox     Isolated execution environment
│   ├── memory/               ← @devs/memory      Agent memory layer (SQLite-backed)
│   ├── mcp/                  ← @devs/mcp         MCP server (debugging/profiling tools)
│   ├── cli/                  ← @devs/cli         CLI interface (headless-first)
│   └── vscode/               ← @devs/vscode      VSCode extension (UI shell only)
├── pnpm-workspace.yaml       ← workspace definition
├── package.json              ← root (private: true)
├── .nvmrc                    ← Node.js 22
└── .npmrc                    ← pnpm settings
```

## Package Naming Convention

All packages follow `@devs/<package-name>` scoped naming. Current packages:

| Package         | Scope  | Purpose                                                              |
|-----------------|--------|----------------------------------------------------------------------|
| `@devs/core`    | shared | Headless orchestration. No UI dependencies. Consumed by all packages. |
| `@devs/agents`  | shared | AI agent node implementations. Depends on `@devs/core`.             |
| `@devs/sandbox` | isolated | Sandboxed code execution. **Must not be imported by `@devs/core`** ([TAS-096]). |
| `@devs/memory`  | shared | Short/medium/long-term agent memory. SQLite persistence.            |
| `@devs/mcp`     | server | MCP server exposing project introspection to AI agents.             |
| `@devs/cli`     | UI shell | CLI entry point only. All logic delegated to `@devs/core`.       |
| `@devs/vscode`  | UI shell | VSCode extension. All logic delegated to `@devs/core`.           |

## Dependency Rules (TAS-096 Module Separation)

```
@devs/core    ← foundational: no workspace deps (only external libs)
@devs/memory  ← no workspace deps
@devs/sandbox ← no workspace deps (strict isolation from core)
@devs/agents  → @devs/core
@devs/mcp     → @devs/core
@devs/cli     → @devs/core
@devs/vscode  → @devs/core
```

`@devs/core` must never depend on `@devs/sandbox`. This prevents logic leakage and enforces the sandbox isolation boundary required by TAS-096.

## Verification

Run the infrastructure verification test:

```bash
bash tests/infrastructure/verify_monorepo.sh
```

Or via the project task runner:

```bash
./do test
```

The test checks:
- Node.js >= 22.x is available
- `.nvmrc` specifies `22`
- pnpm >= 9.x is available
- `.npmrc` has `shamefully-hoist=false`
- Root `package.json` is `private: true` with `engines.node` set
- `pnpm-workspace.yaml` defines all 7 packages
- All 7 package directories exist with correctly named `package.json`
- `@devs/core` does not depend on `@devs/sandbox`

## Installing Dependencies

```bash
pnpm install
```

This resolves all workspace cross-references (e.g., `"@devs/core": "workspace:*"`) and links packages via pnpm's content-addressable store.
