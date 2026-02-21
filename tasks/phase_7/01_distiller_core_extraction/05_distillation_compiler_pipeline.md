# Task: Implement Distillation Compiler Pipeline (Sub-Epic: 01_Distiller_Core_Extraction)

## Covered Requirements
- [9_ROADMAP-REQ-009], [9_ROADMAP-TAS-501]

## 1. Initial Test Written
- [ ] Create tests/distiller/test_compiler_pipeline.py with tests:
  - test_compiler_end_to_end_compiles_and_emits_json()
  - test_compiler_handles_empty_sources()
  - test_compiler_includes_provenance_and_normalized_ids()
- [ ] Provide a fixture set under tests/fixtures/compiler/{sample_prd.md,sample_tas.md} and assert the compiler output JSON contains keys: requirements, rti, provenance_summary.
- [ ] Run: pytest -q tests/distiller/test_compiler_pipeline.py and confirm failures before implementation.

## 2. Task Implementation
- [ ] Implement src/distiller/compiler.py with a DistillationCompiler class:
  - compile(sources: List[Tuple[str, str]]) -> DistillerResult where sources is list of (filename, content)
  - Pipeline steps: 1) run parsers (markdown/prd) -> raw Requirement list 2) normalize/deduplicate -> unique Requirement list 3) compute RTI (call rti.compute_rti) 4) return DistillerResult with metadata
  - Expose a public function compile_and_write(sources, out_path: str) that writes canonical JSON with deterministic sorting of requirements by normalized_id.
- [ ] Add executable CLI script scripts/distill.py that accepts a directory of docs and writes output JSON to stdout or file; ensure --dry-run option for tests.

## 3. Code Review
- [ ] Ensure pipeline is modular, each step independently testable (parsers, normalizer, rti calculator are injected or imported as small modules).
- [ ] Ensure deterministic output ordering and stable JSON serialization for automated verification.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/distiller/test_compiler_pipeline.py and then run the CLI smoke test: python scripts/distill.py --input tests/fixtures/compiler --out /tmp/distill_output.json; then jq ".requirements | length" /tmp/distill_output.json to assert expected counts.

## 5. Update Documentation
- [ ] Add a docs section "Distillation Compiler" describing the pipeline, CLI usage examples, and JSON output schema.

## 6. Automated Verification
- [ ] After tests pass, run the CLI on the fixture directory and validate output JSON schema using a small validator script: python -c "import json,sys; print(json.load(open('/tmp/distill_output.json')).keys())" and assert keys include 'requirements' and 'rti'.
