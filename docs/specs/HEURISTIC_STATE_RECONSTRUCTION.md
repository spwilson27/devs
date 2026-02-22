# Heuristic State Reconstruction

This document describes the Heuristic State Reconstruction feature implemented as part of TAS-069.

Overview
--------
When a project's Flight Recorder `.devs/state.sqlite` is missing or deleted, the Heuristic Reconstructor scans the project's `.agent/` markdown files and source code comments for requirement identifiers (e.g., `TAS-069`, `REQ-123`) and rebuilds a minimal Flight Recorder database containing the `projects`, `requirements`, `epics`, and `tasks` tables.

Key points
----------
- Reconstruction is best-effort and non-destructive — existing data is preserved when present.
- Reconstructed state is marked in the project's metadata as `HEURISTICALLY_RECONSTRUCTED` for transparency.
- Duplicate requirements or tasks are avoided by checking existing entries before inserts.

Usage
-----
The reconstructor is invoked automatically by `@devs/core` when the shared state file is missing. It can also be called programmatically via:

```ts
import { reconstructStateFromProject } from "@devs/core/recovery/HeuristicReconstructor";
reconstructStateFromProject(process.cwd());
```

Limitations
-----------
- The heuristics rely on simple regex matching and may miss complex or non-standard requirement identifiers.
- Reconstructed tasks are generated with conservative default statuses (`pending`) and should be reviewed by a developer.

Notes
-----
- Requirements: TAS-069
- Implemented: HeuristicReconstructor + tests
