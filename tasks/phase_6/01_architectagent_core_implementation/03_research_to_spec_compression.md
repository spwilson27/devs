# Task: Research-to-Spec compression implementation (Sub-Epic: 01_ArchitectAgent Core Implementation)

## Covered Requirements
- [2_TAS-REQ-002]

## 1. Initial Test Written
- [ ] Create `tests/test_compression.py` with unit tests that validate the compression function behavior using deterministic fixtures:
  - test_compress_research_shortens_and_preserves_headings:
    - Provide a multi-paragraph research fixture file (in `tests/fixtures/research_sample.md`).
    - Call `compress_research_to_spec(research_text, ratio=0.20)` and assert the output length is <= 20% of the input length (by characters) and that key headings or keywords (e.g., "Requirements", "API", "Data Model") appear in the compressed output.
  - test_compress_handles_edge_cases_empty_or_small:
    - Ensure the compressor returns the original content if the input is already below the compression threshold and does not crash on empty input.

## 2. Task Implementation
- [ ] Implement `src/pipeline/compression.py` with a function `compress_research_to_spec(research_text: str, ratio: float=0.2) -> str`:
  - Use a deterministic, dependency-free algorithm suitable for unit tests (avoid heavy external NLP libs):
    - Split text into sentences.
    - Score sentences by presence of requirement-keywords and sentence position.
    - Select top sentences until the target ratio of characters is reached.
    - Post-process selected sentences into a compact markdown spec skeleton with bullet points and headings preserved where possible.
  - Expose configuration for `keywords` and `scoring_weights` so the behavior is testable and deterministic.

## 3. Code Review
- [ ] Verify the compressor is deterministic (same input -> same output), parameterized by `ratio`, handles unicode, and has no external network or non-standard dependencies.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_compression.py -q` and validate that all assertions pass for the provided fixtures.

## 5. Update Documentation
- [ ] Add `docs/pipeline/compression.md` describing the algorithm, tunable knobs (ratio, keywords), and sample outputs for the example fixture.

## 6. Automated Verification
- [ ] Add a script `tools/verify_compression_on_fixture.py` that loads `tests/fixtures/research_sample.md`, runs the compressor, writes the compressed spec to `tmp/` and asserts that the checksum of that compressed file matches the committed golden output in `tests/fixtures/golden_compressed.txt`.