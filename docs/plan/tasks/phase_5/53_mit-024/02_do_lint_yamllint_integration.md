# Task: Integrate `yamllint` Validation into `./do lint` (Sub-Epic: 53_MIT-024)

## Covered Requirements
- [MIT-024], [AC-RISK-024-03]

## Dependencies
- depends_on: [01_gitlab_ci_yml_definition.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] In `.tools/tests/test_do_lint_yamllint.py`, write a test `test_do_lint_invokes_yamllint_on_gitlab_ci_yml` that:
  - Patches the `./do lint` command by reading the `./do` shell script source and asserting it contains a line matching `yamllint .gitlab-ci.yml` (via `grep` or `re.search`).
  - Uses `subprocess.run(["bash", "./do", "lint"], capture_output=True, text=True)` to actually execute `./do lint` against the repo.
  - Asserts the exit code is `0` when `.gitlab-ci.yml` is valid YAML.
  - Add traceability annotation `# [AC-RISK-024-03]` above the assertion.
- [ ] Write a test `test_do_lint_fails_on_invalid_gitlab_ci_yml` that:
  - Creates a temporary copy of `.gitlab-ci.yml` containing deliberately invalid YAML (e.g., a tab character where YAML forbids it, or an unclosed bracket).
  - Temporarily replaces `.gitlab-ci.yml` with the invalid copy using `tmp_path` fixtures.
  - Runs `bash ./do lint` with the corrupted file in place.
  - Asserts the exit code is non-zero.
  - Restores the original file using `pytest` fixture teardown.
  - Add traceability annotation `# [AC-RISK-024-03]` above the assertion.
- [ ] Write a test `test_do_lint_yamllint_runs_before_other_checks` that:
  - Verifies that in the `./do` script source text, the `yamllint .gitlab-ci.yml` invocation appears before the first `cargo` command (by checking line number order via `grep -n`).
  - This enforces the business rule from RISK-024-BR-003: "An invalid pipeline YAML causes `./do lint` to exit non-zero **before any other check runs**."
  - Add traceability annotation `# [RISK-024-BR-003]` above the assertion.
- [ ] Confirm all tests fail (red) before implementing the `./do lint` change.

## 2. Task Implementation
- [ ] Open `./do` (the entrypoint shell script) in the repo root.
- [ ] Locate the `lint` command handler (the `case "lint"` or `lint)` branch).
- [ ] Insert the following as the **first** executable line inside the `lint` case, before any `cargo clippy` or other checks:
  ```bash
  # [MIT-024] [AC-RISK-024-03] [RISK-024-BR-003]
  yamllint .gitlab-ci.yml || { echo "lint_failed: .gitlab-ci.yml failed yamllint"; exit 1; }
  ```
- [ ] Verify that `yamllint` is listed as a required tool in `./do setup`. If not, add the `yamllint` installation step to the `setup` case:
  - On Linux (Debian/Ubuntu): `pip3 install yamllint` or `apt-get install yamllint`.
  - On macOS: `brew install yamllint`.
  - On Windows: `pip install yamllint`.
  - Wrap each in the appropriate OS-detection block already used by the `setup` case pattern in `./do`.
- [ ] Confirm `./do setup` installs `yamllint` by running `./do setup && which yamllint`.
- [ ] If `./do` uses a `set -e` / `set -o errexit` pattern globally, verify that the `yamllint` invocation naturally exits non-zero without needing explicit `|| exit 1` (remove the redundant clause if so, keeping only the error message).

## 3. Code Review
- [ ] Confirm that `yamllint .gitlab-ci.yml` appears on a **single line** in `./do` with no line continuations that might be missed by the source-text test.
- [ ] Confirm the `# [AC-RISK-024-03]` and `# [RISK-024-BR-003]` traceability annotations are present on the line immediately preceding the `yamllint` invocation.
- [ ] Confirm the error message printed on failure matches a human-readable format: `"lint_failed: .gitlab-ci.yml failed yamllint"` — consistent with other error messages in `./do lint`.
- [ ] Confirm no other lint checks have been removed or reordered as a side effect of inserting the `yamllint` step.
- [ ] Confirm `./do lint` still exits 0 on a clean, unmodified repo (regression check).

## 4. Run Automated Tests to Verify
- [ ] Run `python -m pytest .tools/tests/test_do_lint_yamllint.py -v` and confirm all three tests pass (green).
- [ ] Run `./do lint` end-to-end from the repo root and confirm exit code 0.
- [ ] To manually verify the fail path: introduce a tab character into `.gitlab-ci.yml` temporarily, run `./do lint`, observe non-zero exit and the error message, then revert `.gitlab-ci.yml`.

## 5. Update Documentation
- [ ] Update `requirements.md` traceability entry for `AC-RISK-024-03` to reference the new test file `.tools/tests/test_do_lint_yamllint.py`.
- [ ] Add a single-line comment to the `setup` section of `./do` indicating that `yamllint` is required for the lint step, so developers know why it is installed.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` and confirm `AC-RISK-024-03` shows `status: covered` (two test files should now reference it).
- [ ] Run `python -m pytest .tools/tests/test_do_lint_yamllint.py --tb=short 2>&1 | tail -5` and confirm `3 passed`.
- [ ] Run `./do lint; echo "exit:$?"` and confirm `exit:0`.
