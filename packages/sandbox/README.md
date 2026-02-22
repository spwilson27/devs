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
