# Task: Spec Generation Pipeline (compression -> Gemini -> write spec) (Sub-Epic: 01_ArchitectAgent Core Implementation)

## Covered Requirements
- [TAS-050], [9_ROADMAP-PHASE-004]

## 1. Initial Test Written
- [ ] Create `tests/test_spec_pipeline_integration.py` with an integration-style (but offline) test:
  - Use `tmp_path` to create a `research.md` input file with a known research fixture.
  - Monkeypatch the `GeminiAdapter.send_prompt` to return a deterministic spec markdown string that includes a `## Technical Architecture` heading and a fenced mermaid block (```mermaid\ngraph TD; A-->B;\n```).
  - Call `run_spec_generation(research_path=str(research_file), output_path=str(tmp_path / "blueprint.md"), meta={"project": "test"})` and assert that `blueprint.md` exists and contains the expected heading and mermaid fence.

## 2. Task Implementation
- [ ] Implement `src/pipeline/spec_pipeline.py` with a function `run_spec_generation(research_path: str, output_path: str, meta: dict) -> str` that performs the following steps:
  - Read and validate the research input file.
  - Call `compress_research_to_spec` to produce a compact seed.
  - Build a clear prompt using the seed and `meta` for the GeminiAdapter.
  - Call `GeminiAdapter.send_prompt` (inject adapter via function parameter or DI) to get generated spec content.
  - Post-process the response: ensure single top-level Markdown file, ensure mermaid code fences are present for diagrams, and sanitize any sensitive content.
  - Write the result atomically to `output_path` (write to temp + os.replace).
  - Return the `output_path` string on success.

## 3. Code Review
- [ ] Verify the pipeline uses dependency injection for the Gemini adapter, handles IO errors gracefully, writes files atomically, and logs structured events for observability. Ensure it does not block indefinitely and has a configurable timeout for the Gemini call.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_spec_pipeline_integration.py -q` to confirm the pipeline produces the expected output when the Gemini adapter is mocked.

## 5. Update Documentation
- [ ] Add `docs/pipeline/spec_pipeline.md` detailing the pipeline steps, config knobs (timeouts, retry counts, output directory), and example input/output pairs used by the test.

## 6. Automated Verification
- [ ] Provide `tools/verify_spec_pipeline.py` which runs `run_spec_generation` on `tests/fixtures/research_sample.md` using a mocked Gemini adapter (deterministic) and asserts the existence of mermaid blocks and that the produced file checksum matches the golden file in `tests/fixtures/golden_blueprint.md`.