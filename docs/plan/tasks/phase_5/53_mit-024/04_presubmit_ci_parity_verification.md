# Task: Verify and Enforce `./do presubmit` Parity with `presubmit-linux` CI Job (Sub-Epic: 53_MIT-024)

## Covered Requirements
- [MIT-024], [AC-RISK-024-02]

## Dependencies
- depends_on: [01_gitlab_ci_yml_definition.md, 02_do_lint_yamllint_integration.md, 03_do_ci_gitlab_api_implementation.md]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] In `.tools/tests/test_presubmit_ci_parity.py`, write a test `test_presubmit_steps_match_ci_job_script` that:
  - Loads `.gitlab-ci.yml` using `yaml.safe_load` and extracts the `script` list for `presubmit-linux`.
  - Reads the `./do` shell script source and extracts all commands executed inside the `presubmit)` case (use a regex or structured extraction — the `presubmit` case MUST contain `./do setup`, `./do format`, `./do lint`, `./do test`, `./do coverage`).
  - Asserts that the `presubmit-linux` job's `script` list contains `"./do setup"` and `"./do presubmit"` in that order.
  - Asserts that `./do presubmit` itself contains (via source inspection) a call to `./do setup`, `./do format`, `./do lint`, `./do test`, `./do coverage`, and `./do ci`.
  - Add traceability annotation `# [AC-RISK-024-02]` above the assertion block.

- [ ] Write a test `test_presubmit_15_minute_timeout_enforced` that:
  - Reads `./do` source and asserts that the `presubmit)` case wraps its commands with a timeout of 900 seconds (15 minutes), e.g., via `timeout 900` or a `TIMEOUTCMD` abstraction.
  - Confirm the timeout constant appears as a named value or comment so it is auditable.
  - Add traceability annotation `# [AC-RISK-024-02] [MIT-024]` above the assertion.

- [ ] Write a test `test_docker_simulation_command_documented` that:
  - Reads `./do` source (or `docs/adr/`) for the Docker simulation command described in MIT-024:
    `docker run --rm -v "$PWD:/workspace" rust:1.80-slim-bookworm sh -c 'cd /workspace && ./do setup && ./do presubmit'`
  - Asserts the string `"rust:1.80-slim-bookworm"` appears somewhere in either `./do` source or a documented ADR file under `docs/adr/`.
  - Add traceability annotation `# [MIT-024]` above the assertion.

- [ ] Confirm all tests fail (red) before implementation.

## 2. Task Implementation
- [ ] Open `./do` and inspect the `presubmit)` case. Verify it calls the following sub-commands in order (matching the `presubmit-linux` CI job script):
  1. `./do setup`
  2. `./do format`
  3. `./do lint`
  4. `./do test`
  5. `./do coverage`
  6. `./do ci`
  - If any of these are missing or in a different order, add them now so `./do presubmit` and the CI job script are **exactly equivalent** for the Linux platform.

- [ ] In the `presubmit)` case of `./do`, ensure a 15-minute (900-second) timeout is applied to the entire block. Use the OS-portable pattern already established in `./do` (e.g., `timeout 900 bash -c '...'` on Linux/macOS, `Start-Process -Wait -Timeout 900` on Windows). If cross-platform timeout is already handled by an abstraction in `./do`, confirm it applies to the `presubmit` case and is set to exactly 900 seconds. Add a comment:
  ```bash
  # Enforces the 15-minute presubmit timeout per the project dev standards.
  # [MIT-024] [AC-RISK-024-02]
  ```

- [ ] Add the Docker-based local simulation command as a comment block in `./do` directly above the `presubmit)` case (or in a dedicated `# Usage:` doc comment at the top of `./do`):
  ```bash
  # [MIT-024] Local Docker cross-platform simulation (Linux):
  # docker run --rm -v "$PWD:/workspace" rust:1.80-slim-bookworm \
  #   sh -c 'cd /workspace && ./do setup && ./do presubmit'
  ```
  This comment serves as the machine-readable reference tested by `test_docker_simulation_command_documented`.

- [ ] Confirm that the `presubmit-linux` job in `.gitlab-ci.yml` calls exactly `./do setup` then `./do presubmit` — no additional commands. If the current `.gitlab-ci.yml` has extra steps, remove them so parity is maintained by definition: the CI job delegates entirely to `./do presubmit`.

- [ ] Confirm that `./do presubmit` exits non-zero immediately if any sub-command fails (enforced by `set -e` or equivalent), so the pass/fail result propagates correctly to the CI job. This is the structural guarantee that AC-RISK-024-02 relies on: if local and CI run the same `./do presubmit` on the same source tree and Rust version, they produce the same result.

## 3. Code Review
- [ ] Confirm the ordering of sub-commands in `./do presubmit` exactly matches the `presubmit-linux` script in `.gitlab-ci.yml`.
- [ ] Confirm the 15-minute timeout is applied and the constant `900` (or `15 * 60`) is clearly labeled with a comment explaining its origin (the project dev standards in the PRD).
- [ ] Confirm the Docker simulation command comment contains the exact image tag `rust:1.80-slim-bookworm` (or the current pinned Rust version used by CI — update if it has changed).
- [ ] Confirm `# [AC-RISK-024-02]` and `# [MIT-024]` traceability annotations are present in `./do` at the relevant locations.
- [ ] Confirm no step in `./do presubmit` is platform-specific in a way that would cause divergence between local Linux execution and CI Linux execution (e.g., avoid hardcoded paths that differ between a developer machine and a GitLab runner).

## 4. Run Automated Tests to Verify
- [ ] Run `python -m pytest .tools/tests/test_presubmit_ci_parity.py -v` and confirm all three tests pass (green).
- [ ] Run `./do presubmit` locally on Linux and confirm it passes end-to-end with exit code 0 (this is the definitive parity check — if it passes locally and the CI job runs the same commands, they are equivalent by construction).
- [ ] If a local Docker installation is available, optionally run the Docker simulation command to confirm it also exits 0.

## 5. Update Documentation
- [ ] Update `requirements.md` traceability entry for `AC-RISK-024-02` to reference `.tools/tests/test_presubmit_ci_parity.py`.
- [ ] Update `requirements.md` traceability entry for `MIT-024` to reference the Docker simulation comment location in `./do`.
- [ ] If a `docs/adr/` file describing the CI strategy exists, add a note that `./do presubmit` and `presubmit-linux` are kept equivalent by construction (the CI job calls `./do presubmit`) and that parity is enforced by `test_presubmit_ci_parity.py`.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` and confirm `MIT-024` and `AC-RISK-024-02` both show `status: covered`.
- [ ] Run `python -m pytest .tools/tests/test_presubmit_ci_parity.py --tb=short 2>&1 | tail -5` and confirm `3 passed`.
- [ ] Run `grep -n "AC-RISK-024-02\|MIT-024" ./do` and confirm both annotations appear in the file.
- [ ] Run `python -m pytest .tools/tests/ -v --tb=short 2>&1 | tail -10` to confirm the full test suite for this sub-epic passes without regressions.
