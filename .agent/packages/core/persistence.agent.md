---
package: "@devs/core"
module: "persistence"
type: module-doc
status: active
created: 2026-02-21
requirements: ["1_PRD-REQ-INT-013", "TAS-076"]
---

# persistence.ts — @devs/core Persistence Path Helpers

## Purpose

Utilities for resolving the shared state file path from any working directory
within the monorepo or a generated project. Enables packages to locate the
project root without hardcoding paths.

## Exports

| Symbol              | Signature                                          | Description                                                       |
|---------------------|----------------------------------------------------|-------------------------------------------------------------------|
| `findProjectRoot`   | `(startDir: string) => string \| null`             | Walks up from `startDir` to find nearest `private: true` package.json |
| `resolveStatePath`  | `(fromDir?: string) => string`                     | Returns absolute path to `.devs/state.sqlite`; throws if root not found |
| `resolveDevsDir`    | `(fromDir?: string) => string`                     | Returns absolute path to `.devs/` directory; throws if root not found |

## Design Notes

- Root detection: walks up directory tree looking for `package.json` with `"private": true`.
- All functions default `fromDir` to `process.cwd()` when omitted.
- Throws `Error` (not returns null) on resolution failure for `resolveStatePath` / `resolveDevsDir`.

## Related Modules

- `constants.ts` — provides `STATE_FILE_PATH` and `DEVS_DIR` constants used here.
