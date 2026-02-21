# Task: Implement Architectural Traceability Mapping (Sub-Epic: 07_Document Validation and Traceability)

## Covered Requirements
- [9_ROADMAP-REQ-029]

## 1. Initial Test Written
- [ ] Create unit tests at `tests/traceability/mapper.spec.js` that:
  - Provide a sample PRD markdown containing several requirement markers (e.g., `REQ: 1_PRD-REQ-DOC-001`, or block-scoped `<!-- REQ_ID: 9_ROADMAP-REQ-027 -->`).
  - Provide a sample TAS markdown containing matching contract references (e.g., `CONTRACT: TAS-ERD-001` that references PRD requirement IDs).
  - Assert that `buildTraceMap(prdText, tasText)` returns a mapping object `{ prdReqId: [tasContractIds...] }` and that all PRD requirement IDs in the sample are present in the mapping with expected targets.
  - Assert that `findOrphanRequirements(prdText, tasText)` returns PRD IDs that have no matching TAS contracts.

## 2. Task Implementation
- [ ] Implement `src/traceability/mapper.(js|ts)` that provides the following functions:
  - `extractRequirementIds(markdownText: string): Array<{id: string, line: number, context: string}>` which parses known requirement ID patterns and returns their positions and a short context snippet.
  - `extractContracts(markdownText: string): Array<{contractId: string, anchors: Array<string>, line: number}>` which extracts TAS contract identifiers and any anchor/reference text.
  - `buildTraceMap(prdText: string, tasText: string): TraceMap` that returns a deterministic mapping structure that can be serialized to JSON: `{ prdReqId: {contracts: [contractId], confidence: 0-1, evidence: [{tasFile, snippet, line}] } }`.
  - `reportTraceabilityIssues(traceMap): { unlinkedPRDs: string[], ambiguousMappings: [{prdId, candidates: []}] }` to surface gaps.
- [ ] Persist the resulting trace map per-phase under `data/traceability/phase_6/trace_map.json` with a timestamped history of changes.
- [ ] Provide an API `GET /api/traceability/report?phase=phase_6` that returns the current trace map and an HTML/JSON human-friendly report for the Review Dashboard.

## 3. Code Review
- [ ] Verify the parser is robust to formatting variations (inline code, fenced blocks, HTML comments) and that extraction uses regexes with anchors and unit tests for edge cases.
- [ ] Confirm the mapping algorithm provides confidence scores based on heuristic matches (exact id match > anchor text similarity > fuzzy text match) and document the heuristics.
- [ ] Ensure mapping is idempotent: repeated runs on the same inputs produce identical trace_map.json output.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- tests/traceability/mapper.spec.js` and a small integration scenario that loads real PRD and TAS excerpts from `docs/examples/` and verifies the expected mapping entries exist.

## 5. Update Documentation
- [ ] Add `docs/traceability/README.md` explaining the trace map format, the heuristics for confidence scoring, example queries to the `GET /api/traceability/report` endpoint, and operational notes for resolving ambiguous mappings.
- [ ] Add an agent memory entry describing the trace_map JSON schema so downstream agents can query it deterministically.

## 6. Automated Verification
- [ ] Provide `scripts/verify-traceability.sh` that:
  - Loads sample PRD/TAS pairs from `docs/examples/traceability/`, runs the mapper, and asserts that a minimal expected set of mappings are present.
  - Exits non-zero if any expected mapping is absent or if the mapping contains ambiguous confidence below a threshold (e.g., 0.7) for expected exact matches.
