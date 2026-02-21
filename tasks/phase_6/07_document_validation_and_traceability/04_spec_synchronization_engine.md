# Task: Implement Spec Synchronization Engine (Sub-Epic: 07_Document Validation and Traceability)

## Covered Requirements
- [9_ROADMAP-TAS-405]

## 1. Initial Test Written
- [ ] Add unit tests at `tests/specSync/specSync.spec.js` that validate the core checksum and sync behaviors:
  - `computeChecksum(fileContent: string)` returns the same SHA-256 for identical content and different value for modified content.
  - `detectManualEdit(storedChecksum, currentContent)` returns true when content changes and false otherwise.
  - `applySyncDecision(filePath, storedChecksum, currentContent)` returns an object showing the decision type `{action: 'no-op'|'flag-for-review'|'auto-sync', reason: string}` based on configurable thresholds.
- [ ] Add an integration test that simulates: commit -> manual edit -> detection -> spec-sync emits a `specChangeDetected` event and stores an audit record.

## 2. Task Implementation
- [ ] Implement `src/sync/specSync.(js|ts)` providing:
  - `computeChecksum(content: string): string` using SHA-256.
  - A persistent store `data/spec-sync-store.sqlite` or `data/spec-sync-store.json` to persist `{ filePath, checksum, lastModifiedAt, approvedChecksum }` records.
  - A `watchAndDetect(baseDir: string)` function that can be run as a long-running process or triggered on-demand; it should detect changes and, when changes are manual (checksum mismatch and not an automated generator commit), create a `specChange` record and optionally open a review ticket via the project's issue/notification system.
  - A CLI `bin/spec-sync` with commands: `scan`, `watch`, `force-approve <filePath>`, `report <filePath>`.
- [ ] Integrate Spec Synchronization with DocumentValidator so that when a discrepancy is detected the system can mark the doc as `stale` and surface the `specChange` to the ArchitectAgent.
- [ ] Add an audit log format that records `who` (system or user), `what` (oldChecksum/newChecksum), `when` (timestamp), and a reference `commit` or `note` when available.

## 3. Code Review
- [ ] Ensure checksum algorithm is stable and uses canonicalization (normalize line endings to LF, strip trailing whitespace) before computing hash.
- [ ] Ensure persistence is ACID-ish (sqlite with transactional writes preferred) and that watch loops don't busy-spin; use filesystem events with debouncing.
- [ ] Ensure secure handling of paths to avoid directory traversal and that specSync can be safely run by a CI user.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test` targeted to `tests/specSync/*` and run an integration scenario that writes a temp file, updates it, and asserts the store record is created and `specChange` is emitted.

## 5. Update Documentation
- [ ] Add `docs/ops/spec_sync.md` documenting the spec-sync CLI, configuration options, audit log format, and recommended operational procedure for approving automated syncs vs manual review.
- [ ] Update the ArchitectAgent design doc to include hooks/events emitted by specSync for downstream agents.

## 6. Automated Verification
- [ ] Provide `scripts/spec-sync-smoke.sh` which:
  - Creates a temp document, records initial checksum, modifies the document, runs `bin/spec-sync scan`, and verifies that an audit record and `specChange` entry exist for the file.
  - Exits non-zero on any mismatch. CI should execute this script in a sandboxed environment as part of the phase verification.
