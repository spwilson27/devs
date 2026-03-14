# Task: Enforce No Bootstrap Stubs (Sub-Epic: 29_MIT-009)

## Covered Requirements
- [AC-RISK-009-04]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script (Owner)]

## 1. Initial Test Written
- [ ] Create a test script `tests/scripts/test_bootstrap_stub_detection.sh` that:
    - **Test 1 (Stub Detection):**
        ```bash
        # Create temp file with stub
        echo '// TODO: BOOTSTRAP-STUB: implement this' > /tmp/test_stub.rs
        # Run lint and capture exit code
        ./do lint 2>&1 | grep -q "BOOTSTRAP-STUB"
        assert_eq $EXIT_CODE 1 "Expected ./do lint to fail with BOOTSTRAP-STUB present"
        ```
    - **Test 2 (Clean Pass):**
        ```bash
        # Remove stub
        rm /tmp/test_stub.rs
        # Run lint and verify it passes (assuming no other errors)
        ./do lint
        assert_eq $EXIT_CODE 0 "Expected ./do lint to pass with no stubs"
        ```
    - **Test 3 (Pattern Variations):**
        ```bash
        # Test different stub patterns that should all be caught
        echo '// TODO: BOOTSTRAP-STUB' > /tmp/test1.rs
        echo '// TODO:BOOTSTRAP-STUB: missing space' > /tmp/test2.rs
        echo '# TODO: BOOTSTRAP-STUB' > /tmp/test3.rs  # Different comment style
        # All should trigger detection
        ```
- [ ] Add the test script to `./do test` execution pipeline.

## 2. Task Implementation
- [ ] Open the `./do` entrypoint script and locate the `lint` subcommand function.
- [ ] Add a new lint check after existing format/lint checks:
    ```bash
    lint() {
        # ... existing checks ...
        
        # Bootstrap stub detection (AC-RISK-009-04)
        echo "Checking for BOOTSTRAP-STUB comments..."
        STUB_COUNT=$(grep -rn "TODO: BOOTSTRAP-STUB" crates/ 2>/dev/null | wc -l)
        if [ "$STUB_COUNT" -gt 0 ]; then
            echo "ERROR: Found $STUB_COUNT BOOTSTRAP-STUB comments:" >&2
            grep -rn "TODO: BOOTSTRAP-STUB" crates/ >&2
            echo "Bootstrap Phase is complete. All stubs must be implemented." >&2
            return 1
        fi
        echo "No BOOTSTRAP-STUB comments found."
    }
    ```
- [ ] Scan the entire codebase for existing `BOOTSTRAP-STUB` comments:
    ```bash
    grep -rn "TODO: BOOTSTRAP-STUB" crates/
    ```
- [ ] For each stub found:
    - **Option A:** Implement the missing functionality with full TDD (write test first, then implement).
    - **Option B:** If genuinely post-MVP, convert to standard `// TODO:` without `BOOTSTRAP-STUB` marker.
    - **Option C:** If the stub is in dead code or obsolete, remove it entirely.
- [ ] Commit stub removals separately from new implementations for clear history.

## 3. Code Review
- [ ] Verify the grep pattern catches all variations:
    - `// TODO: BOOTSTRAP-STUB`
    - `// TODO:BOOTSTRAP-STUB` (missing space)
    - `/* TODO: BOOTSTRAP-STUB */` (block comment)
- [ ] Confirm the error message clearly explains why stubs are prohibited.
- [ ] Ensure the lint check runs early in the pipeline (fail fast).
- [ ] Verify no false positives (e.g., comments about BOOTSTRAP-STUB that aren't stubs themselves).

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and verify it exits with code 0.
- [ ] Temporarily add a stub comment and verify `./do lint` exits with code 1.
- [ ] Run `bash tests/scripts/test_bootstrap_stub_detection.sh` to verify the test script works.
- [ ] Run full `./do presubmit` to ensure no other checks are broken.

## 5. Update Documentation
- [ ] Add a section to `CONTRIBUTING.md` explaining that `BOOTSTRAP-STUB` comments are prohibited after Bootstrap Phase.
- [ ] Update `./do --help` output to mention the bootstrap stub check in the lint command description.
- [ ] Document the migration path: "If you find a BOOTSTRAP-STUB, here's how to resolve it..."

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` shows `AC-RISK-009-04` as covered.
- [ ] Run `./do ci` to verify the check passes in CI simulation mode.
- [ ] Verify the test script is listed in `tests/README.md` or equivalent test documentation.
