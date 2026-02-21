# Task: Implement contextual ingestion after resume to rehydrate agent state (Sub-Epic: 26_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-076]

## 1. Initial Test Written
- [ ] Create `tests/phase_8/26_8_risks/test_04_contextual_ingestion_after_resume.py` that:
  - Constructs a persisted suspended sandbox artifact (archive) containing `metadata.json` and a small set of modified files.
  - Calls `ResumeEngine.ingest_context(sandbox_path)` and asserts:
    - Only changed files are parsed and added to short-term memory.
    - The returned `ResumeSummary` contains a deterministic three-sentence summary which includes changed file names and high-level reason for suspension.
    - A `resume_token` (a deterministic content hash) is returned and stored in the task metadata.

## 2. Task Implementation
- [ ] Implement `ResumeEngine` under `src/agent/resume` with methods:
  - `compute_resume_diff(sandbox_path: Path, repo_root: Path) -> List[FileChange]`:
    - Compute diff between saved workspace snapshot and current repo HEAD; return list of changed file paths and hunks.
  - `ingest_changes_to_memory(file_changes: List[FileChange]) -> ResumeSummary`:
    - For each changed file, parse AST (or use simple heuristics) to extract changed functions/classes/tests; build a concise (<= 3 sentences) deterministic summary.
  - `create_resume_token(metadata: dict, file_hashes: dict) -> str`:
    - Produce a base64-encoded SHA256 digest over canonicalized metadata+file_hashes to be used as `resume_token`.
  - Ensure the ingestion deduplicates content by content-hash and does not re-ingest unchanged blobs.
- [ ] Wire `ResumeEngine` into `DeveloperAgent.resume_from_sandbox(sandbox_path)` so resume flow updates agent short-term memory and sets task state to `resumed` with the `resume_token` persisted.

## 3. Code Review
- [ ] Confirm resume summaries are deterministic and size-limited (e.g., <= 512 tokens), and that no secrets are included in summaries.
- [ ] Confirm diff computation is stable across platforms and uses canonical normalization (line endings, path separators).

## 4. Run Automated Tests to Verify
- [ ] Execute the new test and any associated unit tests for `compute_resume_diff` and `create_resume_token`; validate token equality for repeated runs with identical inputs.

## 5. Update Documentation
- [ ] Add `docs/resume_workflow.md` describing sandbox format, `resume_token` semantics, ingestion steps, and how the UI should present the resume summary to users.

## 6. Automated Verification
- [ ] Add an integration CI job `ci/verify_resume_ingest.yml` that creates a sandbox via test harness, runs `ResumeEngine.ingest_context`, and verifies the token is persisted to the task row in SQLite and matches the computed hash.
