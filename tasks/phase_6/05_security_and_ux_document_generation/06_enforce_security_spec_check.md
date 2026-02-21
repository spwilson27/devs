# Task: Enforce mandatory security spec presence and schema compliance in CI (Sub-Epic: 05_Security and UX Document Generation)

## Covered Requirements
- [8_RISKS-REQ-025], [9_ROADMAP-REQ-DOC-003]

## 1. Initial Test Written
- [ ] Create tests at `tests/ci/test_security_spec_presence.py` with two test cases:
  - `test_security_spec_missing_fails_check`: run `scripts/check_security_spec.py` against a temporary repo root without `docs/5_security_design.md` and assert the script exits with non-zero status (use subprocess.run with check=False and assert returncode != 0).
  - `test_security_spec_invalid_schema_fails_check`: place `docs/5_security_design.md` in tmp_path with intentionally invalid frontmatter and assert the script exits non-zero and prints schema validation errors.
  - `test_security_spec_valid_passes_check`: place a valid `docs/5_security_design.md` (from fixtures) and assert the script exits with zero and prints `OK`.

## 2. Task Implementation
- [ ] Implement `scripts/check_security_spec.py` which:
  - Accepts a `--root` (default `.`) argument to locate `docs/5_security_design.md` and `--schema` (default `specs/security_spec.schema.json`).
  - Exits with code 1 and prints a clear error if `docs/5_security_design.md` is missing.
  - If present, parses frontmatter and validates against the provided schema using `jsonschema`; on validation errors, prints the error details and exits non-zero.
  - On success prints `OK` and exits 0.
  - The script must not call any external services and must be safe to run in CI.

## 3. Code Review
- [ ] Reviewer must ensure:
  - Exit codes are explicit and documented.
  - Validation errors include JSON Schema error paths and human-readable messages.
  - The script is dependency-light (only pyyaml and jsonschema) and includes a `--json` flag to output machine-readable results for CI consumption.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/ci/test_security_spec_presence.py` after installing test deps.
- [ ] Manually exercise the script: `python scripts/check_security_spec.py --root .` in a repo with valid `docs/5_security_design.md` and expect `OK`.

## 5. Update Documentation
- [ ] Document in `docs/README.md` the existence of this CI check and add it to the required pre-merge checks in the repo's CONTRIBUTING.md or CI configuration notes.

## 6. Automated Verification
- [ ] Add the script `scripts/check_security_spec.py` as a step in CI (e.g., `jobs.checkout-validate.steps`) so PRs without a valid `docs/5_security_design.md` are rejected automatically.
- [ ] CI must run `python scripts/check_security_spec.py --root . --schema specs/security_spec.schema.json` as a gating check and fail the pipeline on non-zero exit codes to enforce `8_RISKS-REQ-025`.
