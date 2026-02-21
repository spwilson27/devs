# Task: Finalize Task Manifest and Mapping (Sub-Epic: 10_1_PRD)

## Covered Requirements
- [1_PRD-REQ-PIL-003]

## 1. Initial Test Written
- [ ] Add a validation test at tests/prd/task_manifest.test.js that:
  - Loads the directory tasks/phase_8/10_1_prd and asserts there are 6+ markdown files.
  - Parses each markdown file and validates the presence of the header line matching the required pattern: `# Task: .*\(Sub-Epic: 10_1_PRD\)`.
  - Confirms at least one of the files explicitly lists the covered requirement `[1_PRD-REQ-PIL-003]` (all files should, but at least one is required).

- [ ] Run the test to confirm it fails before this manifest exists.

## 2. Task Implementation
- [ ] Ensure all task markdown files are present in tasks/phase_8/10_1_prd and that each file uses the exact required template headings: (Title, Covered Requirements, sections 1-6).
- [ ] If any file is missing fields, add or repair them.
- [ ] Commit the task manifest files with message: "task(10_1_prd): add PRD task manifest for 1_PRD-REQ-PIL-003".

## 3. Code Review
- [ ] Verify manifest completeness, filename sequencing, and that every task file includes the Covered Requirements section referencing 1_PRD-REQ-PIL-003.
- [ ] Confirm tests in section 1 point to realistic file paths under tests/ and use the same test framework conventions as the repository.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest tests/prd/task_manifest.test.js --runInBand` and confirm it passes.

## 5. Update Documentation
- [ ] Update docs/README.md to include a link to tasks/phase_8/10_1_prd and a one-line summary describing the purpose of the manifest.

## 6. Automated Verification
- [ ] CI should fail if any required task markdown is missing or does not reference 1_PRD-REQ-PIL-003. Add a CI check script scripts/verify_task_manifest.sh that exits non-zero on failure.