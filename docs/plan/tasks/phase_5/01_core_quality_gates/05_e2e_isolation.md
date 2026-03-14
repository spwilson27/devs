# Task: E2E Coverage Isolation & Interface Validation (Sub-Epic: 01_Core Quality Gates)

## Covered Requirements
- [3_MCP_DESIGN-REQ-044]

## Dependencies
- depends_on: ["01_e2e_infrastructure.md", "03_coverage_gates.md"]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a "violation" test file at `crates/devs-cli/tests/e2e/violation_example.rs` that:
  1. Attempts to import an internal module from `devs-core` (e.g., `use devs_core::internal_module;`).
  2. This test should **fail to compile** because E2E tests are forbidden from depending on server-internal crates.
  3. Annotates with `// Covers: [3_MCP_DESIGN-REQ-044]`.
- [ ] Create a Python test `tests/test_e2e_linter.py` that:
  1. Runs `cargo check -p devs-cli --test violation_example` and asserts it fails with a compile error.
  2. Verifies that the E2E linter correctly identifies imports from forbidden crates.
  3. Annotates with `// Covers: [3_MCP_DESIGN-REQ-044]`.
- [ ] Run the tests to confirm they fail (red) before the linter is implemented:
  ```
  pytest tests/test_e2e_linter.py -v 2>&1 | tee /tmp/e2e_linter_baseline.txt
  ```

## 2. Task Implementation
- [ ] **Implement a custom "E2E Linter"** (as a Python script at `.tools/lint_e2e_imports.py`):
  - Scans all files in `tests/e2e/` directories of `devs-cli`, `devs-tui`, and `devs-mcp` crates.
  - Parses Rust source files to extract `use` statements and `extern crate` declarations.
  - Verifies that imports are restricted to:
    - The crate's own public interface (e.g., `devs-cli` can import from `devs_cli::public_api`).
    - External client-side libraries (e.g., `assert_cmd`, `reqwest`, `ratatui`).
  - Explicitly **forbids** importing modules from server-internal crates:
    - `devs-core`
    - `devs-scheduler`
    - `devs-pool`
    - `devs-checkpoint`
    - `devs-executor`
    - `devs-adapters`
    - `devs-webhook`
    - `devs-grpc` (except for generated proto types used in serialization)
    - `devs-server`
  - Produces a lint report at `target/e2e_lint_report.json`:
    ```json
    {
      "schema_version": 1,
      "violations": [
        {
          "file": "crates/devs-cli/tests/e2e/violation_example.rs",
          "line": 5,
          "forbidden_import": "devs_core::internal_module",
          "message": "E2E tests MUST NOT import server-internal crates"
        }
      ],
      "passed": true
    }
    ```
  - Exit non-zero if any violations are found.
  - Annotate with `# [3_MCP_DESIGN-REQ-044]`.

- [ ] **Update `./do lint`** to invoke the E2E linter:
  - After running `cargo fmt` and `cargo clippy`, invoke `.tools/lint_e2e_imports.py`.
  - Exit non-zero if the linter reports violations.
  - Annotate with `# [3_MCP_DESIGN-REQ-044]`.

- [ ] **Update the coverage aggregator** (`.tools/aggregate_coverage.py`) to:
  - Run E2E tests in a clean environment without unit tests by using `cargo llvm-cov` with test path filtering:
    ```
    cargo llvm-cov --workspace --json --output-path target/coverage/e2e_raw.json -- --test-threads=1 --test e2e
    ```
  - Aggregate only the code that is exercised by tests in `tests/e2e/` directories.
  - This provides the "interface-only" coverage data for QG-002 through QG-005.
  - Ensure that coverage from E2E tests does NOT include code that is only reachable via internal paths (the linter enforces this).
  - Annotate with `# [3_MCP_DESIGN-REQ-044]`.

- [ ] **Update `Cargo.toml` files** to enforce E2E import restrictions at compile time:
  - In `crates/devs-cli/Cargo.toml`, create a `[dev-dependencies]` section for E2E tests that does NOT include `devs-core` or other internal crates.
  - Use Cargo's `[[test]]` target configuration to specify different dependencies for E2E tests vs unit tests:
    ```toml
    [[test]]
    name = "e2e_tests"
    path = "tests/e2e/mod.rs"
    # Do NOT list devs-core, devs-scheduler, etc. here
    ```
  - Repeat for `devs-tui` and `devs-mcp` crates.

## 3. Code Review
- [ ] Confirm that QG-002–QG-005 strictly reflect coverage through the external interfaces (CLI, TUI, MCP).
- [ ] Ensure that the agent cannot "cheat" the coverage gates by adding unit-like tests inside the E2E directories.
- [ ] Verify that the E2E linter correctly identifies all forbidden imports.
- [ ] Confirm that `Cargo.toml` configurations prevent E2E tests from compiling if they import internal crates.
- [ ] Confirm all public functions have doc comments.
- [ ] Verify `// Covers: [3_MCP_DESIGN-REQ-044]` annotations are present in test files and linter code.

## 4. Run Automated Tests to Verify
- [ ] Run the E2E violation test and verify the linter catches it:
  ```
  python3 .tools/lint_e2e_imports.py 2>&1 | tee /tmp/e2e_lint_run.txt
  ```
  The linter must report the violation and exit non-zero.
- [ ] Run `./do lint` and confirm the E2E linter is invoked:
  ```
  ./do lint 2>&1 | tee /tmp/lint_run.txt
  grep "E2E import lint" /tmp/lint_run.txt
  ```
- [ ] Run `./do coverage` and confirm that QG-002–QG-005 are populated based on E2E-only runs:
  ```
  ./do coverage 2>&1 | tee /tmp/coverage_run.txt
  cat target/coverage/report.json | python3 -c "import sys,json; d=json.load(sys.stdin); print('\n'.join(f\"{g['gate_id']}: {g['actual_pct']}%\" for g in d['gates'] if g['gate_id'].startswith('QG-00')))
  ```
- [ ] Run traceability verification:
  ```
  python3 .tools/verify_requirements.py --ids 3_MCP_DESIGN-REQ-044
  ```
  Must exit 0 and report `3_MCP_DESIGN-REQ-044` as "covered".

## 5. Update Documentation
- [ ] Update the "Testing Policy" in `docs/architecture/testing.md` to explain the restriction on E2E test imports:
  - E2E tests MUST ONLY import from the client crate's public API or external libraries.
  - E2E tests MUST NOT import server-internal crates (`devs-core`, `devs-scheduler`, etc.).
  - This ensures E2E coverage gates (QG-002–QG-005) reflect true interface-level coverage.
- [ ] Add this policy to `GEMINI.md` under a section titled "E2E Test Import Restrictions":
  - An agent MUST NOT add tests that cover code through private helper functions or internal paths not reachable from the declared external interfaces (CLI, TUI, MCP).
  - E2E coverage gates require code to be exercised through the actual client interface boundaries.
  - The E2E linter (`.tools/lint_e2e_imports.py`) enforces this policy.
- [ ] In `docs/plan/phases/phase_5.md`, update the entry for `[3_MCP_DESIGN-REQ-044]`:
  ```
  - [3_MCP_DESIGN-REQ-044]: Covered by `.tools/lint_e2e_imports.py` and E2E import restrictions in Cargo.toml
  ```

## 6. Automated Verification
- [ ] Verify that a test in `crates/devs-cli/tests/e2e/` cannot compile if it attempts to import `devs_core::internal_module`:
  ```
  cargo check -p devs-cli --test violation_example 2>&1 | grep -E "error\[E0432\]: unresolved import"
  ```
  Must show an unresolved import error.
- [ ] Verify that `target/coverage/report.json` correctly segregates E2E coverage:
  ```
  python3 -c "
  import json
  d = json.load(open('target/coverage/report.json'))
  e2e_gates = [g for g in d['gates'] if g['gate_id'] in ['QG-002', 'QG-003', 'QG-004', 'QG-005']]
  for g in e2e_gates:
      print(f\"{g['gate_id']}: {g['actual_pct']}% (threshold: {g['threshold_pct']}%)\")
  print('OK: E2E gates present')
  "
  ```
- [ ] Verify that the E2E linter report is produced:
  ```
  cat target/e2e_lint_report.json | python3 -m json.tool
  ```
- [ ] Confirm the requirement is covered in the traceability report:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_e2e_isolation.txt
  grep "3_MCP_DESIGN-REQ-044" /tmp/presubmit_e2e_isolation.txt
  ```
  The ID must appear as `COVERED`.
