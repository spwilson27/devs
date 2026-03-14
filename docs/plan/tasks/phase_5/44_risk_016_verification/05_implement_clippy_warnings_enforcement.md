# Task: Implement Clippy Warnings Enforcement (Sub-Epic: 44_Risk 016 Verification)

## Covered Requirements
- [AC-RISK-016-02]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Write a test in `tests/verify/clippy_enforcement_test.rs` (or shell script `tests/verify/clippy_enforcement_test.sh`) that:
  1. Runs `cargo clippy --workspace --all-targets -- -D warnings`
  2. Asserts the command exits 0
  3. Verifies the command is run on all three CI platforms (Linux, macOS, Windows) via CI config
- [ ] Write a unit test that verifies the clippy suppression audit:
  1. Scans all `.rs` files for `#[allow(clippy::...)]` attributes
  2. For each suppression, checks that a comment explaining the justification is present
  3. Fails if any suppression lacks justification
- [ ] Add `// Covers: AC-RISK-016-02` annotation to both tests.
- [ ] Tests should initially fail if there are any clippy warnings or unjustified suppressions.

## 2. Task Implementation
- [ ] Update `./do lint` to include the clippy check:
  ```bash
  cargo clippy --workspace --all-targets -- -D warnings
  ```
- [ ] Implement the clippy suppression audit in `scripts/audit_clippy_suppressions.py` (or Rust equivalent):
  ```python
  #!/usr/bin/env python3
  import re, sys, pathlib
  
  ALLOW_PATTERN = re.compile(r'#\[allow\(clippy::(\w+)\)\]')
  JUSTIFICATION_PATTERN = re.compile(r'//\s*(justification|reason|why)[:\s]+', re.IGNORECASE)
  
  def audit_suppressions():
      violations = []
      for rs_file in pathlib.Path('crates').glob('**/*.rs'):
          content = rs_file.read_text()
          for match in ALLOW_PATTERN.finditer(content):
              # Check if there's a justification comment nearby
              start = max(0, match.start() - 200)
              context = content[start:match.start()]
              if not JUSTIFICATION_PATTERN.search(context):
                  violations.append(f"{rs_file}:{match.start()}: clippy::{match.group(1)} suppression lacks justification")
      return violations
  ```
- [ ] Integrate the suppression audit into `./do lint`.
- [ ] Fix all existing clippy warnings in the workspace.
- [ ] Add justification comments to any existing `#[allow(clippy::...)]` attributes.
- [ ] Update `.gitlab-ci.yml` to run clippy on all three platforms:
  ```yaml
  presubmit-linux:
    script:
      - ./do lint  # includes clippy check
  
  presubmit-macos:
    script:
      - ./do lint  # includes clippy check
  
  presubmit-windows:
    script:
      - ./do lint  # includes clippy check
  ```

## 3. Code Review
- [ ] Verify the suppression audit correctly identifies unjustified suppressions.
- [ ] Ensure the clippy check uses `--all-targets` to cover tests, benches, and examples.
- [ ] Confirm the CI configuration runs clippy on all three platforms.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and verify it includes the clippy check and suppression audit.
- [ ] Intentionally introduce a clippy warning and confirm `./do lint` fails.
- [ ] Remove a justification comment and confirm the suppression audit fails.

## 5. Update Documentation
- [ ] Document the clippy enforcement policy in `CONTRIBUTING.md` or `docs/development.md`.
- [ ] Add `AC-RISK-016-02` to the traceability mapping.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` and confirm `AC-RISK-016-02` is marked as covered.
- [ ] Run `./do presubmit` and verify the clippy check is part of the presubmit gate.
- [ ] Verify CI config runs clippy on all three platforms by checking `.gitlab-ci.yml`.
