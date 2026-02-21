---
package: "@devs/sandbox"
module: "index"
type: module-doc
status: placeholder
created: 2026-02-21
---

# index.ts — @devs/sandbox Entry Point

## Purpose

Package entry point for `@devs/sandbox`. Currently a stub that re-exports nothing.
Sandboxed execution environment APIs will be exported from here in later phases.

## Exports

None yet (infrastructure phase).

## Notes

- This stub satisfies the TypeScript `tsc --noEmit` build step.
- `@devs/sandbox` is strictly isolated: `@devs/core` must NEVER depend on it (TAS-096).
- Future phases will add exports for sandboxed code execution capabilities.
