# Task: Implement Roadmap Reconstructor via Commit-Tag Cross-Reference (Sub-Epic: 08_State Machine and Integrity)

## Covered Requirements
- [8_RISKS-REQ-084]
- [8_RISKS-REQ-083]

## 1. Initial Test Written
- [ ] In `packages/devs-core/src/audit/__tests__/roadmap-reconstructor.test.ts`, write tests for `RoadmapReconstructor`:
  - `reconstruct(repoPath: string): Promise<ReconstructedRoadmap>`:
    - Given a mocked `AuditTrailReconstructor` returning an `AuditTrail` with entries containing `reqIds`, and a mocked `SpecsReader` that returns spec document content for each `reqId`'s source file, asserts that the output `ReconstructedRoadmap.phases` is an array ordered by `phaseId` ascending.
    - Each `ReconstructedPhase` has: `{ phaseId: string, tasks: ReconstructedTask[], requirementIds: string[], sourceSpecSections: SpecSection[] }`.
    - When an `AuditTrailEntry.reqId` does not exist in any spec file (i.e., `SpecsReader` returns `null`), the entry is included in the roadmap but `sourceSpecSections` is `[]` and a warning is emitted via `EventEmitter2`.
    - When two audit trail entries share the same `phaseId`, they are merged into a single `ReconstructedPhase`.
    - Returns `{ phases: [], generatedAt: Date }` when the audit trail is empty.
  - `SpecsReader.findSection(reqId: string): Promise<SpecSection | null>`:
    - Returns a `SpecSection` with `{ file: string, heading: string, bodySnippet: string }` when the requirement ID is found as a heading anchor in a markdown file under `specs/`.
    - Returns `null` when not found.
    - Uses `grep -n` under the hood (via `child_process.execFile`) to locate the heading.
    - Test with a virtual filesystem mock (use `memfs`).

## 2. Task Implementation
- [ ] Create `packages/devs-core/src/audit/specs-reader.ts`:
  - `SpecsReader` class with injected `specsDir: string` (default: `path.join(repoRoot, 'specs')`).
  - `findSection(reqId: string): Promise<SpecSection | null>`:
    1. Uses `execFile('grep', ['-rn', `### **[${reqId}]**`, specsDir])` to locate the heading line.
    2. If found, reads the file and extracts the heading text and up to 10 subsequent lines as `bodySnippet`.
    3. Returns `null` if grep finds no matches.
- [ ] Create `packages/devs-core/src/audit/roadmap-reconstructor.ts`:
  - `RoadmapReconstructor` class with injected `AuditTrailReconstructor` and `SpecsReader`.
  - `reconstruct(repoPath: string): Promise<ReconstructedRoadmap>`:
    1. Calls `AuditTrailReconstructor.reconstruct(repoPath)` to get the full audit trail.
    2. Groups `AuditTrailEntry[]` by `phaseId`.
    3. For each group, collects all unique `reqIds` across entries.
    4. For each `reqId`, calls `SpecsReader.findSection(reqId)` concurrently (use `Promise.all`).
    5. Builds `ReconstructedPhase[]` sorted by `phaseId` string ascending.
    6. Returns `{ phases, generatedAt: new Date() }`.
    7. Emits `RoadmapReconstructed` event with the full roadmap.
- [ ] Add `ReconstructedRoadmap`, `ReconstructedPhase`, `ReconstructedTask`, `SpecSection` TypeScript interfaces to `packages/devs-core/src/audit/types.ts`.
- [ ] Expose a CLI command `devs audit reconstruct-roadmap` in `packages/devs-cli/src/commands/audit.ts` that calls `RoadmapReconstructor.reconstruct(process.cwd())` and prints a formatted table (phase → tasks → req IDs).

## 3. Code Review
- [ ] Verify that `SpecsReader.findSection()` uses `execFile` (not `exec`) with the `specsDir` path validated to be within the project root to prevent path traversal.
- [ ] Confirm `RoadmapReconstructor` emits a `ReqIdNotFoundInSpecs` warning (not an error) for missing cross-references rather than throwing, preserving partial roadmaps.
- [ ] Ensure `Promise.all` calls for `SpecsReader.findSection()` are properly bounded (no more than 10 concurrent file reads) using a concurrency limiter (e.g., `p-limit`).
- [ ] Confirm that the output `ReconstructedRoadmap` is serializable to JSON with no circular references.
- [ ] Verify the CLI command renders output using a structured table formatter (e.g., `cli-table3`) and not raw `console.log` strings.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter devs-core test -- --testPathPattern="roadmap-reconstructor"` and confirm all tests pass.
- [ ] Run `pnpm --filter devs-core test -- --coverage --testPathPattern="(roadmap-reconstructor|specs-reader)"` and confirm ≥ 90% coverage.
- [ ] Run `pnpm --filter devs-cli test -- --testPathPattern="audit"` and confirm CLI command tests pass.

## 5. Update Documentation
- [ ] Create `packages/devs-core/src/audit/roadmap-reconstructor.agent.md` documenting:
  - The reconstruction algorithm (audit trail → group by phase → cross-ref specs).
  - The `SpecsReader` heading format it expects (`### **[REQ-ID]** Title`).
  - What `ReqIdNotFoundInSpecs` warnings mean and when they are expected.
  - How the CLI command output is structured.
- [ ] Update `docs/architecture/audit-trail.md` with a "Roadmap Reconstruction" section describing how `devs audit reconstruct-roadmap` works and its output format.

## 6. Automated Verification
- [ ] Run `pnpm --filter devs-core test:ci` and `pnpm --filter devs-cli test:ci`; assert both exit with code `0`.
- [ ] Run `node packages/devs-cli/dist/index.js audit reconstruct-roadmap --repo $(pwd)` against the devs repo itself; assert exit code `0` and that stdout contains at least one phase entry.
