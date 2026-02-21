---
package: "@devs/vscode"
module: "index"
type: module-doc
status: placeholder
created: 2026-02-21
---

# index.ts — @devs/vscode Entry Point

## Purpose

Package entry point for `@devs/vscode`. Currently a stub that re-exports nothing.
The VS Code extension shell that delegates to `@devs/core` will be implemented later.

## Exports

None yet (infrastructure phase).

## Notes

- This stub satisfies the TypeScript `tsc --noEmit` build step.
- `@devs/vscode` is a thin UI shell — all business logic lives in `@devs/core`.
- Future phases will add the VS Code extension activation and command registration.
