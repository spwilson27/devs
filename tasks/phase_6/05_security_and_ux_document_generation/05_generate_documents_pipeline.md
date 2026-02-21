# Task: Implement document generation pipeline to run SecuritySpecAgent and UIUXAgent and record checksums (Sub-Epic: 05_Security and UX Document Generation)

## Covered Requirements
- [9_ROADMAP-TAS-403], [9_ROADMAP-REQ-DOC-003], [8_RISKS-REQ-025]

## 1. Initial Test Written
- [ ] Create an integration test at `tests/integration/test_document_pipeline.py` named `test_pipeline_writes_documents_and_records_checksums` that:
  - Uses tmp_path to create an isolated output directory.
  - Mocks both agents' `generate` methods to return deterministic Markdown files and paths (pointing into tmp_path) rather than invoking LLMs.
  - Runs the pipeline entrypoint `scripts/generate_docs.py --out-dir <tmp_path>` (or a small function `pipeline.generate_all(out_dir)`).
  - Asserts that both `docs/5_security_design.md` and `docs/uiux_design_system.md` exist in the out directory and that a metadata file `docs/blueprints_checksums.json` exists containing entries for each generated file with keys `{path, sha256}`.
  - Validates that each checksum in `docs/blueprints_checksums.json` matches the SHA256 of the corresponding file.

## 2. Task Implementation
- [ ] Implement a small orchestrator script at `scripts/generate_docs.py` (and an importable function at `pipeline/generate.py`) that:
  - Loads the project brief from `tests/fixtures/sample_brief.json` when called in test mode or accepts a `--brief <file>` argument for production usage.
  - Instantiates `SecuritySpecAgent` and `UIUXAgent` with real or pluggable LLM clients.
  - Calls their `generate()` methods in sequence and writes the returned documents into the specified out directory.
  - After successful writes, computes SHA256 checksums for each generated file and writes `docs/blueprints_checksums.json` with structure: `[{"path": "docs/5_security_design.md", "sha256": "..."}, ...]`.
  - Ensure atomic semantics when writing the checksum file (write temp -> rename).
  - Exit with non-zero code on any validation failure (schema fail) and print helpful diagnostics to stdout/stderr.

## 3. Code Review
- [ ] Reviewer checklist:
  - The pipeline is idempotent: re-running does not create duplicate files or corrupt existing ones.
  - Agents are invoked via dependency injection and can be mocked for tests.
  - Checksums use SHA256 and are computed on the exact bytes written to disk.
  - Proper error handling and exit codes exist for CI integration.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/integration/test_document_pipeline.py` after installing test deps.
- [ ] Run the pipeline locally: `python scripts/generate_docs.py --out-dir docs` and then validate that `docs/blueprints_checksums.json` exists and contains valid sha256 entries for both docs.

## 5. Update Documentation
- [ ] Update `docs/README.md` with a short section "Document generation pipeline" describing how to run `scripts/generate_docs.py`, expected outputs, and how checksums are recorded.

## 6. Automated Verification
- [ ] CI should run the integration test and then execute the pipeline in a clean workspace, ensuring the checksums file is generated and matches the artifacts; failure should mark the CI job as failed.
- [ ] Add a simple script `scripts/verify_checksums.py` that reads `docs/blueprints_checksums.json` and verifies each checksum to be used by CI as a final verification step.
