# Task: Implement `yamllint` Validation in `./do lint` as First Check (Sub-Epic: 52_Risk 024 Verification)

## Covered Requirements
- [RISK-024-BR-003], [RISK-024-BR-004]

## Dependencies
- depends_on: [01_gitlab_ci_yml_pipeline_structure.md]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written

- [ ] In `.tools/tests/test_do_lint_yamllint.py`, write the following tests **before** modifying `./do lint`:

  **Test: `test_do_lint_runs_yamllint_first`**
  Use `subprocess.run(['./do', 'lint'], capture_output=True, text=True)` with a **temporarily corrupted** `.gitlab-ci.yml` (inject a syntax error such as a tab character in a YAML value). Assert that:
  - The process exits non-zero.
  - `stderr` or `stdout` contains the string `yamllint` (confirming the linter ran).
  Restore `.gitlab-ci.yml` after the test using a `try/finally` block. Tag with `# [RISK-024-BR-003]`.

  **Test: `test_do_lint_yamllint_blocks_further_checks`**
  With a corrupted `.gitlab-ci.yml`, run `./do lint` and assert that the output does **not** contain output from any subsequent lint checks (e.g., `cargo clippy`, `rustfmt`) — i.e., the script exits before running other linters. Restore file after. Tag with `# [RISK-024-BR-003]`.

  **Test: `test_do_lint_valid_yaml_passes`**
  With the real (valid) `.gitlab-ci.yml`, run `./do lint` and assert exit code is 0. Tag with `# [RISK-024-BR-003]`.

  **Test: `test_do_lint_validates_artifact_config`**
  Write a helper Python function (not an end-to-end test of `./do lint`, but an assertion test) that parses `.gitlab-ci.yml` and asserts that all three presubmit jobs contain `artifacts.when == 'always'` and `artifacts.expire_in == '7 days'`. This verifies the YAML-parsing check that `./do lint` performs. Tag with `# [RISK-024-BR-004]`.

  **Test: `test_do_lint_validates_three_job_names`**
  Write a Python test that parses `.gitlab-ci.yml` and asserts the presence of `presubmit-linux`, `presubmit-macos`, and `presubmit-windows` as top-level keys. Tag with `# [RISK-024-BR-003]`.

  Confirm all tests **fail** before the implementation step.

## 2. Task Implementation

- [ ] Install `yamllint` as a dev dependency. Add it to `.tools/requirements.txt` if using Python-based tooling, or ensure `./do setup` installs it via `pip install yamllint` (or equivalent package manager step).

- [ ] In `./do` (the entrypoint shell script), locate the `lint` command handler. Add the following as the **first** check inside the `lint` case, before any other lint steps:

  ```sh
  # [RISK-024-BR-003] Validate .gitlab-ci.yml syntax before all other lint checks.
  echo "==> Validating .gitlab-ci.yml with yamllint..."
  yamllint .gitlab-ci.yml || {
      echo "ERROR: .gitlab-ci.yml failed yamllint validation. Fix YAML errors before proceeding." >&2
      exit 1
  }
  ```

- [ ] After the `yamllint` check (still within the `lint` handler), add a Python-based structural validation step that:
  1. Parses `.gitlab-ci.yml` with `pyyaml`.
  2. Asserts the three required job names are present.
  3. For each presubmit job, asserts `artifacts.when == 'always'` and `artifacts.expire_in == '7 days'`.
  4. Exits non-zero with a descriptive error message if any assertion fails.

  Implement this as a small inline Python script or a callable `.tools/validate_ci_yaml.py` script. Example invocation from `./do lint`:

  ```sh
  # [RISK-024-BR-004] Verify artifact retention settings in .gitlab-ci.yml
  python3 .tools/validate_ci_yaml.py || exit 1
  ```

- [ ] Create `.tools/validate_ci_yaml.py` with the following logic:
  ```python
  #!/usr/bin/env python3
  # [RISK-024-BR-003] [RISK-024-BR-004]
  import sys
  import yaml
  import pathlib

  REQUIRED_JOBS = ["presubmit-linux", "presubmit-macos", "presubmit-windows"]
  REQUIRED_ARTIFACT_PATHS = [
      "target/coverage/report.json",
      "target/presubmit_timings.jsonl",
      "target/traceability.json",
  ]

  doc = yaml.safe_load(pathlib.Path(".gitlab-ci.yml").read_text())
  errors = []

  for job in REQUIRED_JOBS:
      if job not in doc:
          errors.append(f"Missing required CI job: {job}")
          continue
      artifacts = doc[job].get("artifacts", {})
      if artifacts.get("when") != "always":
          errors.append(f"{job}: artifacts.when must be 'always', got {artifacts.get('when')!r}")
      if artifacts.get("expire_in") != "7 days":
          errors.append(f"{job}: artifacts.expire_in must be '7 days', got {artifacts.get('expire_in')!r}")
      for path in REQUIRED_ARTIFACT_PATHS:
          if path not in artifacts.get("paths", []):
              errors.append(f"{job}: missing artifact path {path!r}")

  if errors:
      for e in errors:
          print(f"ERROR: {e}", file=sys.stderr)
      sys.exit(1)

  print("OK: .gitlab-ci.yml structure and artifact configuration validated.")
  ```

- [ ] Add `yamllint` configuration file `.yamllint.yml` at the repository root to configure acceptable YAML style (disable line-length for CI comments if needed):
  ```yaml
  extends: default
  rules:
    line-length:
      max: 120
    truthy:
      allowed-values: ["true", "false"]
  ```

## 3. Code Review

- [ ] Confirm that `yamllint .gitlab-ci.yml` is the **first** command executed in the `lint` handler of `./do` — no other command precedes it.
- [ ] Confirm that a YAML syntax error causes immediate exit before `cargo clippy`, `rustfmt`, or any other linter runs.
- [ ] Confirm `.tools/validate_ci_yaml.py` uses `sys.exit(1)` (not a bare `raise`) so the shell correctly captures the exit code.
- [ ] Confirm that traceability annotations `# [RISK-024-BR-003]` and `# [RISK-024-BR-004]` are present in `./do`, `.tools/validate_ci_yaml.py`, and all test functions.
- [ ] Confirm the `.yamllint.yml` configuration does not suppress errors for structural YAML problems (only relaxes style rules).

## 4. Run Automated Tests to Verify

- [ ] Run: `python3 -m pytest .tools/tests/test_do_lint_yamllint.py -v`
- [ ] All 5 tests must pass.
- [ ] Run `./do lint` against the valid `.gitlab-ci.yml` — must exit 0.
- [ ] Manually introduce a YAML syntax error (e.g., `echo "  bad: [unclosed"  >> .gitlab-ci.yml`) and run `./do lint` — must exit non-zero. Restore the file.
- [ ] Run `./do test` to confirm no regressions.

## 5. Update Documentation

- [ ] Add a comment block at the top of `.tools/validate_ci_yaml.py` explaining its role as a lint sub-step and the requirements it satisfies.
- [ ] In `requirements.md`, confirm `RISK-024-BR-003` and `RISK-024-BR-004` reference `.tools/tests/test_do_lint_yamllint.py` and `.tools/validate_ci_yaml.py`.
- [ ] Update `./do` inline comments for the `lint` command to mention that `yamllint` is the first check per `RISK-024-BR-003`.

## 6. Automated Verification

- [ ] Run: `python3 -m pytest .tools/tests/test_do_lint_yamllint.py -v --tb=short 2>&1 | tee /tmp/task02_results.txt && grep -c "PASSED" /tmp/task02_results.txt`
- [ ] Confirm output shows `5` (all 5 tests passed).
- [ ] Run: `python3 .tools/validate_ci_yaml.py && echo "VALIDATE_OK"` — must print `VALIDATE_OK`.
- [ ] Run: `python3 .tools/verify_requirements.py 2>&1 | grep "RISK-024-BR-003\|RISK-024-BR-004"` — both must appear as traced.
