# @devs/sandbox

Isolated execution abstraction for shell commands and file I/O.

## Build

pnpm --filter @devs/sandbox run build

## Test

pnpm --filter @devs/sandbox test

## Source tree

```
src/
├── index.ts           # Public barrel export
├── providers/         # SandboxProvider abstraction barrels
│   └── index.ts
├── drivers/           # Concrete driver implementations
│   └── index.ts
├── filesystem/        # FilesystemManager barrel
│   └── index.ts
├── network/           # Network egress components
│   └── index.ts
├── types/             # Shared TypeScript types and interfaces
│   └── index.ts
└── utils/             # Internal utility functions
    └── index.ts
```

One-line descriptions:
- providers: Provider abstractions (SandboxProvider) used by consumers to inject implementations.
- drivers: Concrete drivers (process, container) that implement execution semantics.
- filesystem: FilesystemManager helpers and adapters.
- network: Network egress components and policies.
- types: Shared interfaces like SandboxExecResult and SandboxProvisionOptions.
- utils: Internal helpers not exported to consumers.

## .agent

Agent-Oriented Documentation (AOD) lives in `packages/sandbox/.agent` and provides module context, architectural decisions, hard constraints, dependency mappings, and a progress tracker for the package.

Files and purpose:
- `CONTEXT.md` — module purpose, phase context, public surface, integration points.
- `DECISIONS.md` — numbered, immutable architectural decisions.
- `CONSTRAINTS.md` — hard constraints that must be followed.
- `DEPENDENCIES.md` — upstream/downstream and driver-level external deps.
- `PROGRESS.md` — task progress tracker for the sub-epic.

AI agents should update these files as part of the TDD loop when implementing tasks in this package.

