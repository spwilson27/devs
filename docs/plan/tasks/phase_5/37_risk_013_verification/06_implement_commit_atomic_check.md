# Task: Implement Commit-Atomic Traceability Verification (Sub-Epic: 37_Risk 013 Verification)

## Covered Requirements
- [RISK-013], [RISK-013-BR-003]

## Dependencies
- depends_on: ["01_enforce_traceability_gates.md", "03_implement_traceability_scanner.md"]
- shared_components: [./do Entrypoint Script, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create a unit test in `.tools/tests/test_commit_atomic.py` class `TestCommitAtomicTraceability` with the following test methods:
  - `test_detects_new_requirement_without_covering_test`: Mock a git diff that adds `[NEW-REQ-001]` to a spec file, with no `// Covers: NEW-REQ-001` in any `.rs` file, verify failure
  - `test_allows_new_requirement_with_covering_test`: Mock a git diff that adds `[NEW-REQ-002]` to a spec file AND `// Covers: NEW-REQ-002` to a test file, verify pass
  - `test_ignores_existing_requirements`: Mock a git diff that doesn't add any new requirement IDs, verify pass (no check needed for existing requirements)
  - `test_detects_requirement_added_in_multiple_files`: Mock a git diff that adds `[NEW-REQ-003]` to two different spec files (e.g., requirements.md and a spec), verify it's detected as one new requirement
  - `test_handles_requirement_rename`: Mock a git diff that removes `[OLD-REQ-001]` and adds `[NEW-REQ-001]` in same commit, verify both are checked (old should have annotation removed, new should have annotation added)
  - `test_works_without_git_available`: When git is not available (e.g., raw build), verify the check is skipped gracefully with a warning (not an error)
- [ ] Create an integration test `test_full_commit_atomic_workflow`:
  - Create a temporary git branch
  - Add a new requirement `[COMMIT-TEST-001]` to a spec file without adding a covering test
  - Commit the change
  - Run the commit-atomic check, verify it fails
  - Add a `// Covers: COMMIT-TEST-001` annotation to a test file
  - Amend the commit
  - Run the check again, verify it passes
  - Clean up the temporary branch

## 2. Task Implementation
- [ ] In `.tools/verify_requirements.py`, implement `CommitAtomicChecker` class:
  ```python
  class CommitAtomicChecker:
      def __init__(self, workspace_root: Path):
          self.workspace_root = workspace_root
          
      def get_commit_diff(self) -> Optional[str]:
          """Get git diff for current commit. Returns None if git not available."""
          try:
              result = subprocess.run(
                  ["git", "diff", "HEAD^", "HEAD"],
                  cwd=self.workspace_root,
                  capture_output=True,
                  text=True,
                  check=False
              )
              return result.stdout if result.returncode == 0 else None
          except (FileNotFoundError, subprocess.SubprocessError):
              return None
      
      def find_new_requirement_ids(self, diff: str) -> Set[str]:
          """Extract requirement IDs added in this commit from diff."""
          new_ids = set()
          for line in diff.splitlines():
              if line.startswith('+') and not line.startswith('+++'):
                  # Look for added requirement headers: +### **[REQ-ID]**
                  for match in re.finditer(r'\*\*\*\[([A-Z0-9_-]+)\]\*\*', line):
                      new_ids.add(match.group(1))
          return new_ids
      
      def find_removed_annotations(self, diff: str) -> Set[str]:
          """Extract // Covers: annotations removed in this commit."""
          removed = set()
          for line in diff.splitlines():
              if line.startswith('-') and not line.startswith('---'):
                  if match := re.search(r'//\s+Covers:\s+(.+)', line):
                      for id_str in match.group(1).split(', '):
                          removed.add(id_str.strip())
          return removed
      
      def check_commit_atomicity(self) -> Tuple[bool, List[str]]:
          """
          Verify that new requirements have covering tests in same commit.
          Returns (passed, list of error messages).
          """
          diff = self.get_commit_diff()
          if diff is None:
              return (True, ["Warning: Git not available, skipping commit-atomic check"])
          
          new_reqs = self.find_new_requirement_ids(diff)
          removed_annotations = self.find_removed_annotations(diff)
          
          # Scan workspace for current annotations
          scanner = TraceabilityScanner(self.workspace_root)
          current_annotations = scanner.scan_workspace()
          valid_ids = scanner.extract_all_requirement_ids()
          
          errors = []
          for req_id in new_reqs:
              if req_id not in current_annotations:
                  errors.append(f"New requirement {req_id} has no covering // Covers: annotation in this commit")
          
          # Check that removed annotations correspond to removed requirements
          # (if annotation removed but requirement still exists, that's an error)
          for ann_id in removed_annotations:
              if ann_id in valid_ids:
                  errors.append(f"Annotation for {ann_id} was removed but requirement still exists")
          
          return (len(errors) == 0, errors)
  ```
- [ ] Integrate into `./do lint` or `./do presubmit`:
  - Add a new function `cmd_commit_check()` in `./do` script
  - Call it as part of the presubmit flow (after lint, before test)
  - Alternatively, integrate into `verify_requirements.py` with a `--commit-check` flag
- [ ] Ensure the check runs on the presubmit temporary commit (which is how `./do presubmit` works)

## 3. Code Review
- [ ] Verify git diff parsing handles edge cases: merge commits, multi-line additions, binary files
- [ ] Check that the check doesn't false-positive on requirement IDs in comments or examples (only header format `### **[ID]**` should count)
- [ ] Confirm that the check handles the initial commit (no HEAD^) gracefully — should skip or pass
- [ ] Verify that annotations in production code (not just tests) are accepted per RISK-013-BR-004
- [ ] Check that the error messages are actionable and suggest where to add the annotation

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_commit_atomic.py -v` and ensure all 6 test methods pass
- [ ] Manually test with a real commit:
  - Create a feature branch
  - Add a new requirement without a test, commit
  - Run `./do presubmit`, verify it fails with commit-atomic error
  - Add the covering test, amend commit
  - Run `./do presubmit` again, verify it passes
- [ ] Test without git available:
  - Temporarily rename `git` to `git.bak`
  - Run the check, verify it skips with a warning (not error)
  - Restore `git`

## 5. Update Documentation
- [ ] Add docstrings to `CommitAtomicChecker` class explaining the "two-together" rule from RISK-013/MIT-013
- [ ] Update `docs/plan/specs/8_risks_mitigation.md` under RISK-013-BR-003 to note that commit-atomic check is implemented
- [ ] Add a section to `.agent/MEMORY.md` explaining that new requirements must have covering tests in the same commit

## 6. Automated Verification
- [ ] Create a verification script `.tools/tests/verify_commit_atomic.sh`:
  ```bash
  #!/usr/bin/env bash
  set -e
  
  # Save current branch
  CURRENT_BRANCH=$(git branch --show-current)
  
  # Create test branch
  git checkout -b test-commit-atomic-$$
  
  # Test 1: Add requirement without test (should fail)
  echo "### **[TEST-COMMIT-ATOMIC-001]** Test Requirement" >> docs/plan/requirements/test-commit.md
  git add docs/plan/requirements/test-commit.md
  git commit -m "Add test requirement without covering test"
  
  echo "Test 1: Verifying commit without covering test fails..."
  if python .tools/verify_requirements.py --commit-check 2>&1 | grep -q "TEST-COMMIT-ATOMIC-001"; then
      echo "PASS: Commit-atomic check detected missing annotation"
  else
      echo "FAIL: Commit-atomic check did not detect missing annotation"
      git checkout "$CURRENT_BRANCH"
      git branch -D test-commit-atomic-$$
      exit 1
  fi
  
  # Test 2: Add covering test (should pass)
  echo "// Covers: TEST-COMMIT-ATOMIC-001" >> .tools/tests/test_example.py
  git add .tools/tests/test_example.py
  git commit --amend -m "Add test requirement with covering test"
  
  echo "Test 2: Verifying commit with covering test passes..."
  if python .tools/verify_requirements.py --commit-check; then
      echo "PASS: Commit-atomic check passed"
  else
      echo "FAIL: Commit-atomic check failed unexpectedly"
      git checkout "$CURRENT_BRANCH"
      git branch -D test-commit-atomic-$$
      exit 1
  fi
  
  # Cleanup
  git checkout "$CURRENT_BRANCH"
  git branch -D test-commit-atomic-$$
  rm docs/plan/requirements/test-commit.md
  git reset --hard HEAD
  
  echo "Commit-atomic verification complete!"
  ```
- [ ] Make the script executable: `chmod +x .tools/tests/verify_commit_atomic.sh`
- [ ] Run the script and verify all checks pass
