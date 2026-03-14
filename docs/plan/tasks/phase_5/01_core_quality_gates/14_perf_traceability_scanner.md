# Task: Performance Requirement Traceability Scanner (Sub-Epic: 01_core_quality_gates)

## Covered Requirements
- [PERF-TRACE-BR-001], [PERF-TRACE-BR-002], [PERF-TRACE-BR-003], [PERF-TRACE-BR-004], [PERF-TRACE-BR-005], [PERF-TRACE-BR-006], [PERF-TRACE-BR-007], [PERF-TRACE-BR-008], [PERF-TRACE-BR-009], [PERF-TRACE-BR-010], [PERF-TRACE-BR-011], [PERF-TRACE-BR-012], [PERF-TRACE-BR-013]
- [PERF-TRACE-AC-001], [PERF-TRACE-AC-002], [PERF-TRACE-AC-003], [PERF-TRACE-AC-004], [PERF-TRACE-AC-005], [PERF-TRACE-AC-006], [PERF-TRACE-AC-007], [PERF-TRACE-AC-008], [PERF-TRACE-AC-009], [PERF-TRACE-AC-010]

## Dependencies
- depends_on: ["04_traceability_report.md", "06_perf_core_infrastructure.md"]
- shared_components: [Traceability & Verification Infrastructure, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create `tests/test_perf_traceability.py` with tests that:
  1. Assert `target/traceability.json` contains `perf_summary.total_perf_ids >= 165` after clean build ([PERF-TRACE-AC-001]).
  2. Assert `perf_summary.uncovered == 0` when all tests pass ([PERF-TRACE-AC-002]).
  3. Assert `perf_summary.stale_upstream_ids` is empty when source docs unmodified ([PERF-TRACE-AC-003]).
  4. Assert `// Covers: PERF-99999` (non-existent) causes exit 1 with `stale_annotations` entry ([PERF-TRACE-AC-004]).
  5. Assert removing the only `// Covers: PERF-001` causes exit 1 with PERF-001 in uncovered list ([PERF-TRACE-AC-005]).
  6. Assert `// Covers: PERF-001, PERF-038` causes both to appear as `covered: true` ([PERF-TRACE-AC-006]).
  7. Assert `./do lint` scans for `axum::`, `actix_web::`, `warp::` in cargo tree ([PERF-TRACE-AC-007]).
  8. Assert `perf_summary.by_category` contains exactly 6 categories: `latency`, `throughput`, `resource`, `presubmit`, `observability`, `principle` ([PERF-TRACE-AC-008]).
  9. Assert `./do test` exits non-zero if `perf_summary.uncovered > 0` even when all cargo tests pass ([PERF-TRACE-AC-009]).
  10. Assert stderr output format: `UNCOVERED PERF IDs: <ID1>, <ID2> (N total)` ([PERF-TRACE-AC-010]).
  11. Annotate all with `# Covers:`.
- [ ] Run tests to confirm red:
  ```
  pytest tests/test_perf_traceability.py -v 2>&1 | tee /tmp/perf_trace_baseline.txt
  ```

## 2. Task Implementation
- [ ] **Extend `.tools/verify_requirements.py`** to handle PERF-specific traceability:
  - `test_type = "design_invariant"` IDs (e.g., PERF-081) exempt from `covered: false` gate ([PERF-TRACE-BR-001]).
  - `test_type = "benchmark"` IDs require a Criterion benchmark in `benches/` ([PERF-TRACE-BR-002]).
  - All `upstream_ids` must resolve to known IDs; unresolvable = `stale_upstream_id` ([PERF-TRACE-BR-003]).
  - `PERF-GP-NNN` guiding principles scanned for coverage same as `PERF-NNN` ([PERF-TRACE-BR-004]).
  - Multi-ID coverage: test covering multiple IDs appears in `covering_tests` for each ([PERF-TRACE-BR-005]).
  - `overall_passed` is `false` if any non-design-invariant PERF ID has `covered: false` ([PERF-TRACE-BR-006]).
  - `perf_summary.uncovered > 0` prints uncovered IDs to stderr before exit 1 ([PERF-TRACE-BR-007]).
  - Upstream IDs resolved by exact string search including brackets ([PERF-TRACE-BR-008]).
  - Section references (`§N`) resolved by verifying heading exists ([PERF-TRACE-BR-009]).
  - Superseded/renamed doc reference = `stale_upstream_id` ([PERF-TRACE-BR-010]).
  - "Two-together" rule: PERF ID must be added with at least one `// Covers:` annotation ([PERF-TRACE-BR-011]).
  - PERF ID removal forbidden while annotations exist ([PERF-TRACE-BR-012]).
  - Test deletion causing uncovered PERF ID detected in same `./do presubmit` ([PERF-TRACE-BR-013]).
- [ ] **Add `perf_summary` section** to `target/traceability.json`:
  ```json
  {
    "perf_summary": {
      "total_perf_ids": 221,
      "covered": 221,
      "uncovered": 0,
      "stale_upstream_ids": [],
      "by_category": {
        "latency": {"total": 40, "covered": 40},
        "throughput": {"total": 15, "covered": 15},
        "resource": {"total": 30, "covered": 30},
        "presubmit": {"total": 20, "covered": 20},
        "observability": {"total": 25, "covered": 25},
        "principle": {"total": 21, "covered": 21}
      }
    }
  }
  ```
- [ ] **Update `./do test`** to check `perf_summary.uncovered` and exit non-zero if > 0.
- [ ] **Update `./do lint`** to scan `cargo tree` for REST framework imports ([PERF-TRACE-AC-007]).

## 3. Code Review
- [ ] Verify design-invariant exemption logic is correct.
- [ ] Verify "two-together" rule enforcement.
- [ ] Verify `by_category` mapping is exhaustive.
- [ ] Verify `# Covers:` annotations present.

## 4. Run Automated Tests to Verify
- [ ] Run perf traceability tests:
  ```
  pytest tests/test_perf_traceability.py -v
  ```
- [ ] Run `./do test` and check `perf_summary`:
  ```
  python3 -c "import json; d=json.load(open('target/traceability.json')); print(d.get('perf_summary', {}))"
  ```

## 5. Update Documentation
- [ ] Document PERF traceability scanner rules in `docs/architecture/testing.md`.

## 6. Automated Verification
- [ ] Confirm all requirements covered:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_perf_trace.txt
  ```
