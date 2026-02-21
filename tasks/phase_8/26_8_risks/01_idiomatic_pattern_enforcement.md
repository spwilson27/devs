# Task: Enforce idiomatic code patterns via an idiomatic patterns manifest and CI linter gate (Sub-Epic: 26_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-067]

## 1. Initial Test Written
- [ ] Create a test at `tests/phase_8/26_8_risks/test_01_idiomatic_pattern_enforcement.py` that:
  - Uses the repository's test runner (detect by presence of `package.json` -> use `npm test`/Jest, else `pyproject.toml` or `requirements.txt` -> use `pytest`).
  - The test must fail initially by asserting that `docs/idiomatic_patterns.md` exists and contains a top-level heading `# Idiomatic Patterns`.
  - Implementation detail examples:
    - Python (pytest):
      ```py
      from pathlib import Path
      def test_idiomatic_manifest_exists():
          p = Path("docs/idiomatic_patterns.md")
          assert p.exists()
          assert p.read_text(encoding="utf-8").splitlines()[0].strip().startswith("# Idiomatic Patterns")
      ```
    - Node (jest):
      ```js
      const fs = require('fs');
      test('idiomatic manifest exists', () => {
        const p = 'docs/idiomatic_patterns.md';
        expect(fs.existsSync(p)).toBe(true);
        const first = fs.readFileSync(p, 'utf8').split('\n')[0].trim();
        expect(first.startsWith('# Idiomatic Patterns')).toBe(true);
      });
      ```
  - This test MUST be the Red phase: it should fail on a clean repo and therefore drive the implementation in the Green phase.

## 2. Task Implementation
- [ ] Create `docs/idiomatic_patterns.md` containing the canonical idiomatic rules for this repository. Structure: one human-readable rule per section and a machine-readable JSON manifest at `docs/idiomatic_patterns.json` with entries {"id","description","pattern"}.
- [ ] Implement a small scanner script `scripts/check_idiomatic_patterns.py` (or `.js`) that:
  - Loads `docs/idiomatic_patterns.json` and searches `src/`, `lib/`, and other code roots for regex matches/violations.
  - Exits with non-zero if any violation is found and prints a machine-readable JSON list of violations to stdout.
  - Respects `.gitignore` and does not modify files.
- [ ] Add a CI job `.github/workflows/idiomatic-lint.yml` that runs the scanner and fails the PR if the scanner exits non-zero.
- [ ] After adding the manifest and scanner, update the test from step 1 so the initial manifest assertion passes; then extend tests to assert that the scanner fails when a small engineered violation is added (ensures linter enforcement is testable).

## 3. Code Review
- [ ] Confirm the manifest is explicit and authoritative (no ambiguous rules), with at least one concrete example per rule.
- [ ] Ensure the scanner is deterministic (uses content hashing, stable file traversal order), respects performance constraints, and does not write to source files.
- [ ] Verify CI job runs only on PRs and protects the default branch by requiring the idiomatic-lint job to succeed.

## 4. Run Automated Tests to Verify
- [ ] Run the project test runner (e.g., `pytest -q` or `npm test`) to execute the new test; run the scanner locally: `python scripts/check_idiomatic_patterns.py` or `node scripts/check_idiomatic_patterns.js` and fix until green.

## 5. Update Documentation
- [ ] Update `docs/README.md` and add a short section describing the idiomatic patterns document, how the scanner works, and how to add a new rule to `docs/idiomatic_patterns.json`.

## 6. Automated Verification
- [ ] Add `scripts/verify_idiomatic.sh` that runs the test runner and the scanner and exits non-zero if either fails; ensure CI invokes this verification script as a gating check.
