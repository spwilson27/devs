# Task: Verify presubmit Passes on Linux for Bootstrap Crates (Sub-Epic: 29_MIT-009)

## Covered Requirements
- [AC-RISK-009-03]

## Dependencies
- depends_on: ["01_verify_workflow_definitions.md", "02_enforce_no_bootstrap_stubs.md"]
- shared_components: [./do Entrypoint Script (Owner), devs-core (Consumer), devs-config (Consumer), devs-checkpoint (Consumer), devs-adapters (Consumer), devs-pool (Consumer), devs-executor (Consumer)]

## 1. Initial Test Written
- [ ] Create a CI verification script `tests/ci/verify_bootstrap_presubmit.sh`:
    ```bash
    #!/usr/bin/env bash
    set -euo pipefail

    echo "=== Bootstrap presubmit verification (AC-RISK-009-03) ==="

    # Identify which crates were completed during Bootstrap Phase
    # (This list should be updated as crates are completed)
    BOOTSTRAP_CRATES=(
        "devs-core"
        "devs-config"
        "devs-checkpoint"
        "devs-adapters"
        "devs-pool"
        "devs-executor"
    )

    echo "Verifying presubmit for Bootstrap crates: ${BOOTSTRAP_CRATES[*]}"

    # Run presubmit for each crate
    FAILED=0
    for crate in "${BOOTSTRAP_CRATES[@]}"; do
        echo "--- Testing crate: $crate ---"
        if ! ./do presubmit --crate "$crate"; then
            echo "FAILED: presubmit failed for $crate" >&2
            FAILED=1
        fi
    done

    if [ "$FAILED" -eq 1 ]; then
        echo "ERROR: One or more bootstrap crates failed presubmit" >&2
        exit 1
    fi

    echo "SUCCESS: All bootstrap crates passed presubmit"
    ```
- [ ] Create a unit test in `crates/devs-core/tests/presubmit_integration_test.rs` that:
    - Invokes `./do presubmit` as a subprocess.
    - Captures stdout/stderr.
    - Asserts exit code is 0.
    - Parses output to verify all sub-commands ran (format, lint, test, coverage).

## 2. Task Implementation
- [ ] Ensure `./do presubmit` is implemented with the following sub-commands:
    ```bash
    presubmit() {
        run_format
        run_lint
        run_test
        run_coverage
        run_ci
    }
    ```
- [ ] Implement each sub-command:
    - `run_format`: `cargo fmt --all -- --check`
    - `run_lint`: `cargo fmt`, `cargo clippy`, `cargo doc`, dependency audit, PTC validation, BOOTSTRAP-STUB check
    - `run_test`: `cargo test --all`
    - `run_coverage`: `cargo llvm-cov --lcov --output-path target/lcov.info`
    - `run_ci`: GitLab CI pipeline simulation or trigger
- [ ] Implement the `--crate` flag to run presubmit on a specific crate:
    ```bash
    ./do presubmit --crate devs-core
    # Should run: cargo test -p devs-core, cargo clippy -p devs-core, etc.
    ```
- [ ] Ensure the script respects the 900-second timeout:
    ```bash
    timeout 900 ./do presubmit
    ```
- [ ] Run `./do presubmit` on a Linux environment (native or Docker) and fix any failures:
    - Format errors → run `cargo fmt`.
    - Clippy warnings → fix code or add `#[allow(...)]` with justification.
    - Test failures → fix code or tests (TDD: write failing test first).
    - Coverage gaps → add targeted tests.

## 3. Code Review
- [ ] Verify the presubmit script is POSIX sh-compatible (not bash-specific).
- [ ] Confirm timeout handling:
    - Script exits with 124 if timeout exceeded.
    - Partial results are saved before timeout.
- [ ] Check error messages are actionable:
    - "clippy failed" → show specific warnings.
    - "test failed" → show failing test name and assertion message.
- [ ] Ensure the script works in CI environment (GitLab runners).
- [ ] Verify the script doesn't require interactive input.

## 4. Run Automated Tests to Verify
- [ ] Run `./do presubmit` locally on Linux and verify it exits 0.
- [ ] Run `bash tests/ci/verify_bootstrap_presubmit.sh` and verify all bootstrap crates pass.
- [ ] Run the same in a Docker container to simulate CI environment:
    ```bash
    docker run --rm -v "$PWD":/workspace rust:1.75 /workspace/tests/ci/verify_bootstrap_presubmit.sh
    ```
- [ ] Verify the GitLab CI pipeline passes on the same commit.

## 5. Update Documentation
- [ ] Document the presubmit checklist in `CONTRIBUTING.md`:
    - "Before pushing, run `./do presubmit`."
    - "Expected duration: <15 minutes."
- [ ] Add troubleshooting section:
    - "If presubmit times out, run individual checks to identify bottleneck."
    - "If tests fail, run `cargo test --package <crate>` for detailed output."
- [ ] Update `docs/ci-cd/presubmit.md` with the full presubmit flow diagram.

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` shows `AC-RISK-009-03` as covered.
- [ ] Run `./do coverage` and verify all bootstrap crates meet 90% unit coverage threshold.
- [ ] Verify the CI script is referenced in `.gitlab-ci.yml`.
- [ ] Confirm the presubmit check is listed in `docs/phase-gates/bootstrap-complete.md`.
