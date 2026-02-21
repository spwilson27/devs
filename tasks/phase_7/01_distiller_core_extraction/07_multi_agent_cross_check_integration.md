# Task: Multi-Agent Cross-Check Integration and CLI (Sub-Epic: 01_Distiller_Core_Extraction)

## Covered Requirements
- [9_ROADMAP-PHASE-005], [9_ROADMAP-TAS-501]

## 1. Initial Test Written
- [ ] Create tests/distiller/test_multi_agent_cross_check.py with tests:
  - test_cross_check_detects_conflicts_between_extractors()
  - test_cross_check_passes_when_extractors_agree()
  - test_cross_check_outputs_conflict_report_file()
- [ ] Use two extractor fixtures: extractor_a returns parsing via markdown_parser, extractor_b returns parsing via prd_parser or a slightly different strategy; tests should assert that when extractor_a and extractor_b disagree on presence/normalization the report file contains a 'conflicts' key with details.
- [ ] Run: pytest -q tests/distiller/test_multi_agent_cross_check.py and expect failures initially.

## 2. Task Implementation
- [ ] Implement src/distiller/crosscheck.py exposing:
  - function cross_check(extractor_a: Callable, extractor_b: Callable, sources: List[Tuple[str,str]]) -> Dict containing keys: agreed_requirements, conflicts, merged_provenance
  - function write_conflict_report(report: Dict, out_path: str)
- [ ] Integrate cross_check into scripts/distill.py as an optional flag --cross-check which runs both extractors, merges results when safe, and writes conflict_report.json when conflicts exist.

## 3. Code Review
- [ ] Ensure cross-checking is pluggable (pass extractor callables), reports deterministic diffs, and does not mutate input Requirement objects (always return new objects when merging provenance).
- [ ] Validate CLI flags and help text follow repo conventions.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/distiller/test_multi_agent_cross_check.py and then run CLI with --cross-check on tests/fixtures and assert conflict_report.json exists when expected.

## 5. Update Documentation
- [ ] Add a "Cross-Check" subsection in docs/distiller.md describing multi-agent validation, report format, and CLI usage example for --cross-check.

## 6. Automated Verification
- [ ] After tests pass, run: python scripts/distill.py --input tests/fixtures --cross-check --out /tmp/distill_out.json; then ensure /tmp/distill_out.json and /tmp/conflict_report.json (if produced) exist and their JSON keys match the documentation.
