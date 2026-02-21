---
package: "@devs/core"
module: "index"
type: module-doc
status: active
created: 2026-02-21
updated: 2026-02-21
---

# index.ts — @devs/core Entry Point

## Purpose

Package entry point for `@devs/core`. Re-exports all public symbols from the
core sub-modules. Consumers should import from `@devs/core` directly.

## Exports

All symbols from the following modules are re-exported via barrel exports:

| Module                     | Key Exports                                                         |
|----------------------------|---------------------------------------------------------------------|
| `constants.ts`             | `STATE_FILE_PATH`, `DEVS_DIR`, `MANIFEST_SCHEMA_VERSION`           |
| `persistence.ts`           | `findProjectRoot`, `resolveStatePath`, `resolveDevsDir`            |
| `schemas/turn_envelope.ts` | `TurnEnvelopeSchema`, `TurnEnvelope`, `AgentIdSchema`, `AgentId`, etc. |
| `schemas/events.ts`        | `EventSchema`, `EventPayloadSchema`, `EventPayload`, per-type schemas |

## Notes

- Consumers must use `.js` extensions when importing sub-paths directly
  (e.g., `import { TurnEnvelopeSchema } from '@devs/core/schemas/turn_envelope.js'`).
- Prefer importing from `@devs/core` directly to avoid coupling to internal paths.
