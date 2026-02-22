# DECISIONS

## Decision 001

Use the Strategy pattern for `SandboxProvider` to allow interchangeable `DockerDriver` and `WebContainerDriver` without coupling orchestration logic to container technology.

## Decision 002

The `src/types/index.ts` barrel is the single source of truth for all cross-cutting interfaces; drivers must not define divergent types.

## Decision 003

`FilesystemManager` will exclude `.git/` and `.devs/` directories from any sandbox sync operation to prevent host environment contamination.
