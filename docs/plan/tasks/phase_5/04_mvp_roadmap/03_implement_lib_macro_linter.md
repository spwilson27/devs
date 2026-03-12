# Task: Implement Library Macro Linter (Sub-Epic: 04_MVP Roadmap)

## Covered Requirements
- [AC-ROAD-P5-007]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a test file `devs-core/src/forbidden_macros.rs` containing `println!("test");`.
- [ ] Verify that running `./do lint` on the current codebase (with the new file) fails.

## 2. Task Implementation
- [ ] Create a Python script `.tools/lint_macros.py` that:
    - Scans all `.rs` files in the `src/` directory of the following crates: all crates in the workspace EXCEPT `devs-server`, `devs-cli`, `devs-tui`, and `devs-mcp-bridge`.
    - Detects calls to `println!`, `eprintln!`, or any macro from the `log` crate (e.g., `info!`, `warn!`, `error!`, `debug!`, `trace!`).
    - Reports the filename and line number of each violation.
    - Returns a non-zero exit code if any violations are found.
- [ ] Integrate `.tools/lint_macros.py` into the `cmd_lint` function in `./do`.
- [ ] Fix any existing violations in the library crates by replacing them with the appropriate `devs`-specific logging or error-reporting mechanisms.

## 3. Code Review
- [ ] Verify that the linter correctly ignores the exempted crates (`devs-server`, `devs-cli`, `devs-tui`, `devs-mcp-bridge`).
- [ ] Ensure that it doesn't flag comments or strings containing these macro names (i.e., use regex word boundaries `\bprintln!\(`).

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure it fails when a `println!` is added to `devs-core` and passes after it's removed.

## 5. Update Documentation
- [ ] Update the project's coding standards to explicitly mention the prohibition of standard IO and logging macros in library crates.

## 6. Automated Verification
- [ ] Run `./do presubmit` and verify that the `lint` stage correctly executes the custom macro linter.
