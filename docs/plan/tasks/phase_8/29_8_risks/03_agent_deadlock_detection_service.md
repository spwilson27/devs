# Task: Implement Agent Deadlock Detection Service (Sub-Epic: 29_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-125]

## 1. Initial Test Written
- [ ] Create a unit test at tests/agents/deadlock-detector.spec.ts that exercises the detection algorithm directly. The test must:
  - Instantiate the detector, add edges representing agent wait-for relationships (e.g., A -> B, B -> C, C -> A) and assert `detectCycles()` returns the cycle `[A,B,C]` (order-insensitive but contains all members).
  - Add tests for non-cyclic graphs to assert `detectCycles()` returns an empty array.
  - Use deterministic inputs and assert runtime complexity by testing on small graphs (3-20 nodes) for correctness.

## 2. Task Implementation
- [ ] Implement `src/agents/deadlock-detector.ts` containing a `WaitForGraph` class with methods `addEdge(fromAgentId, toAgentId)`, `removeEdge(fromAgentId, toAgentId)`, and `detectCycles()` that returns an array of arrays (each inner array is a cycle of agent IDs).
- [ ] Use a reliable algorithm (Tarjan's SCC or DFS cycle detection) and provide unit-tested helper utilities.
- [ ] Export a lightweight event emitter API so other modules (watchdog, monitor) can subscribe to deadlock events.
- [ ] Persist detection events to a durable store (`/var/run/devs/deadlocks.json` or the project's SQLite DB) with timestamp and involved agent IDs.

## 3. Code Review
- [ ] Ensure the algorithm is O(N + E) and works on graphs up to thousands of nodes without unnecessary memory churn.
- [ ] Verify exported types and event shapes are well-documented and stable.
- [ ] Confirm persistence is robust and does not leak agent secrets; use structured logs and rotate the file.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- tests/agents/deadlock-detector.spec.ts` and ensure all cycle detection tests pass.
- [ ] Optionally run the detector against a generated random graph fixture to validate performance without doing it in CI.

## 5. Update Documentation
- [ ] Add `docs/agents/deadlock-detection.md` describing the detection algorithm, event schema, persistence location, and how to subscribe to events.

## 6. Automated Verification
- [ ] Add `scripts/simulate-deadlock.js` which builds a sample wait-for graph that contains a known cycle and asserts `detectCycles()` returns expected members, exiting non-zero on mismatch. CI should call this script periodically as a sanity check.
