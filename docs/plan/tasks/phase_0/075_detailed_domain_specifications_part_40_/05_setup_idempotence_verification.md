# Task: Verify ./do setup Idempotence (Sub-Epic: 075_Detailed Domain Specifications (Part 40))

## Covered Requirements
- [2_TAS-REQ-454]

## Dependencies
- depends_on: ["04_setup_minimal_fresh_environment.md"]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Create a test script `tests/ci/test_setup_idempotent.sh` that runs `./do setup` twice in sequence (`./do setup && ./do setup`) and asserts both invocations exit 0.
- [ ] The test must also verify that the second invocation does not re-download or re-install tools that are already present (capture stdout/stderr of both runs; the second run should contain "already installed" or skip messages, not download progress).
- [ ] Add a CI job (or extend the minimal-environment job from task 04) that runs this idempotence test on a fresh container: first `./do setup` installs everything, second `./do setup` is a no-op success.

## 2. Task Implementation
- [ ] Ensure every install step in `./do setup` is guarded by a presence check: `command -v <tool> >/dev/null 2>&1 && return 0` (or equivalent skip logic).
- [ ] Ensure no install step fails when the tool is already at the expected version (e.g., `rustup toolchain install <version>` should be safe to re-run; `cargo install cargo-llvm-cov` should skip if already installed at the right version).
- [ ] Ensure `./do setup` does not create duplicate PATH entries or duplicate configuration on repeated runs.

## 3. Code Review
- [ ] Verify each tool-install function in `./do setup` has an explicit "already installed" early-return path.
- [ ] Confirm no file is unconditionally overwritten on each run (e.g., config files should only be written if missing or outdated).

## 4. Run Automated Tests to Verify
- [ ] Run `./do setup && ./do setup` locally and confirm both exit 0.
- [ ] Run `tests/ci/test_setup_idempotent.sh` in a container and confirm exit 0.

## 5. Update Documentation
- [ ] Add `# Covers: 2_TAS-REQ-454` annotation to the test script and relevant `./do setup` guard logic.

## 6. Automated Verification
- [ ] The CI pipeline must run the idempotence test. Confirm the job passes with both `./do setup` invocations exiting 0.
