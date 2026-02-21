# Task: Define Out-of-Scope Manifest Schema and Data Model (Sub-Epic: 02_Out-of-Scope Manifest - Platform & Runtime Services)

## Covered Requirements
- [1_PRD-REQ-OOS-004], [1_PRD-REQ-OOS-010], [1_PRD-REQ-OOS-011], [1_PRD-REQ-OOS-015], [1_PRD-REQ-OOS-016]

## 1. Initial Test Written
- [ ] In `src/manifest/__tests__/oos-manifest.schema.test.ts`, write unit tests that:
  - Validate that a `OutOfScopeEntry` TypeScript interface requires fields: `id` (string), `title` (string), `description` (string), `category` (enum), `rationale` (string), and `futureRoadmapHook` (optional string).
  - Validate that the `category` enum includes at minimum: `PLATFORM_RUNTIME`, `COLLABORATION`, `SECURITY`, `FRONTEND_COMPATIBILITY`.
  - Validate that a `loadOosManifest()` function exists and returns an array of `OutOfScopeEntry` objects.
  - Validate that the loaded manifest contains exactly the following IDs: `1_PRD-REQ-OOS-004`, `1_PRD-REQ-OOS-010`, `1_PRD-REQ-OOS-011`, `1_PRD-REQ-OOS-015`, `1_PRD-REQ-OOS-016` (as part of the Platform & Runtime Services sub-epic entries), and that none of these are missing.
  - Validate that each entry's `description` is non-empty and at least 20 characters long.
  - Validate that the manifest JSON file can be parsed without errors and conforms to a JSON Schema (use `ajv` or equivalent).

## 2. Task Implementation
- [ ] Create `src/manifest/oos-manifest.types.ts` defining:
  ```typescript
  export enum OosCategory {
    PLATFORM_RUNTIME = 'PLATFORM_RUNTIME',
    COLLABORATION = 'COLLABORATION',
    SECURITY = 'SECURITY',
    FRONTEND_COMPATIBILITY = 'FRONTEND_COMPATIBILITY',
    CONTENT_GENERATION = 'CONTENT_GENERATION',
    INFRASTRUCTURE = 'INFRASTRUCTURE',
  }

  export interface OutOfScopeEntry {
    id: string;
    title: string;
    description: string;
    category: OosCategory;
    rationale: string;
    futureRoadmapHook?: string;
  }
  ```
- [ ] Create `src/manifest/data/platform-runtime-oos.json` containing an array of `OutOfScopeEntry` objects for the following requirement IDs. Each entry must include a `rationale` explaining the architectural decision and, where applicable, a `futureRoadmapHook`:
  - `1_PRD-REQ-OOS-004` (Ongoing Agent-as-a-Service Maintenance): category `PLATFORM_RUNTIME`, explain that `devs` is a project-generation tool, not a long-term SRE/maintenance agent; no incident response or on-call automation.
  - `1_PRD-REQ-OOS-010` (Real-time Multi-User Orchestration): category `COLLABORATION`, explain that the current SQLite + single-process architecture is optimized for a single user; multi-user requires a shared database and websocket event bus; `futureRoadmapHook`: "9_ROADMAP-FUTURE-002".
  - `1_PRD-REQ-OOS-011` (Local LLM Hosting & Inference Management): category `PLATFORM_RUNTIME`, explain that managing `ollama`, `llama.cpp`, or similar runtimes is a separate infrastructure concern; `futureRoadmapHook`: "9_ROADMAP-FUTURE-001".
  - `1_PRD-REQ-OOS-015` (Secret Management & Vault Hosting): category `SECURITY`, explain that `devs` reads secrets from environment variables but does not host, rotate, or audit a secret vault.
  - `1_PRD-REQ-OOS-016` (Browser/OS-Specific Polyfilling & Quirk-Handling): category `FRONTEND_COMPATIBILITY`, explain that generated projects target modern toolchains; legacy browser polyfills and OS-specific quirks are the responsibility of the target project's build pipeline.
- [ ] Create `src/manifest/oos-manifest.loader.ts`:
  ```typescript
  import platformRuntimeOos from './data/platform-runtime-oos.json';
  import { OutOfScopeEntry } from './oos-manifest.types';

  export function loadOosManifest(): OutOfScopeEntry[] {
    return [...platformRuntimeOos] as OutOfScopeEntry[];
  }

  export function getOosEntryById(id: string): OutOfScopeEntry | undefined {
    return loadOosManifest().find(entry => entry.id === id);
  }
  ```
- [ ] Create `src/manifest/index.ts` that re-exports all public symbols from `oos-manifest.types.ts` and `oos-manifest.loader.ts`.
- [ ] Create a JSON Schema file at `src/manifest/schemas/oos-entry.schema.json` that validates the `OutOfScopeEntry` structure (required fields, category enum values, minimum string lengths).

## 3. Code Review
- [ ] Verify that the JSON data file does not contain any logic — it is pure data; all loading logic is in the `.loader.ts` file.
- [ ] Verify that `OosCategory` enum values match the `category` field values used in the JSON data file exactly (no loose strings).
- [ ] Verify that the `loadOosManifest()` function is pure (no side effects, no file system calls at import time beyond the static `import`).
- [ ] Verify that all five requirement IDs (`1_PRD-REQ-OOS-004`, `1_PRD-REQ-OOS-010`, `1_PRD-REQ-OOS-011`, `1_PRD-REQ-OOS-015`, `1_PRD-REQ-OOS-016`) are present in the JSON data file — cross-check against the phase document.
- [ ] Verify that TypeScript strict mode is satisfied (no implicit `any`, no missing types).

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/manifest/__tests__/oos-manifest.schema.test.ts --coverage` and confirm 100% statement coverage and all tests pass.
- [ ] Run the full test suite with `npm test` and confirm no regressions.

## 5. Update Documentation
- [ ] Add a section `## Out-of-Scope Manifest` to `docs/architecture/manifest.md` (create the file if it does not exist) describing: the purpose of the manifest, its location, the schema, and how to add new OOS entries.
- [ ] Update `src/manifest/index.ts` with a JSDoc comment block at the top explaining the module's purpose.
- [ ] Add an entry to `docs/adr/` (Architecture Decision Records) titled `ADR-015-oos-manifest-schema.md` explaining why a static JSON + TypeScript interface approach was chosen over a database-backed schema for OOS entries.

## 6. Automated Verification
- [ ] Run `node -e "const m = require('./dist/manifest/index'); const ids = m.loadOosManifest().map(e => e.id); const required = ['1_PRD-REQ-OOS-004','1_PRD-REQ-OOS-010','1_PRD-REQ-OOS-011','1_PRD-REQ-OOS-015','1_PRD-REQ-OOS-016']; required.forEach(id => { if(!ids.includes(id)) throw new Error('Missing: ' + id); }); console.log('All required OOS IDs present.');"` after building, confirming all five IDs are present with exit code 0.
- [ ] Run `npx ajv validate -s src/manifest/schemas/oos-entry.schema.json -d src/manifest/data/platform-runtime-oos.json` and confirm output `platform-runtime-oos.json valid`.
