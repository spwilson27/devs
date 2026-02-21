# Task: Implement Document Validity Linting Suite (Sub-Epic: 24_Benchmarking Suite Document and Quality Metrics)

## Covered Requirements
- [9_ROADMAP-REQ-027]

## 1. Initial Test Written
- [ ] Create `src/benchmarks/__tests__/documentValidity.bench.ts` with the following test cases:
  - **Unit test — lint pass**: Write a test that passes a well-formed Markdown string (valid headings hierarchy, no broken links, no trailing spaces) through `DocumentValidator.lint()` and asserts it returns `{ valid: true, errors: [] }`.
  - **Unit test — lint fail**: Write a test that passes Markdown with deliberately broken syntax (duplicate H1, broken relative link `[foo](./missing.md)`, trailing whitespace lines) and asserts `valid: false` with at least one entry in `errors`.
  - **Integration test — PRD file**: Write a test that reads `specs/1_prd.md` from disk, runs it through `DocumentValidator.lint()`, and asserts `valid: true`.
  - **Integration test — TAS file**: Same as above for `specs/2_tas.md`.
  - **Integration test — Security Design file**: Same as above for `specs/5_security_design.md`.
  - **Integration test — UI/UX Design file**: Same as above for `specs/7_uiux_design.md` (or the equivalent file path).
  - **Version status test**: Write a test that reads the YAML front-matter (or a JSON sidecar) for each of the four documents above and asserts each contains `status: APPROVED` and `version: "1.0"`.

## 2. Task Implementation
- [ ] Install `markdownlint` and `gray-matter` as dependencies: `npm install markdownlint gray-matter`.
- [ ] Create `src/benchmarks/documentValidator.ts` exporting a `DocumentValidator` class with:
  - `lint(markdownContent: string, filePath?: string): { valid: boolean; errors: LintError[] }` method.
  - Uses `markdownlint.sync()` with a config object defined in `src/benchmarks/config/markdownlintConfig.ts` (rules: MD001 heading increment, MD009 no trailing spaces, MD012 no multiple blanks, MD022 headings surrounded by blanks, MD041 first line heading).
  - Wraps errors into a typed `LintError` interface: `{ ruleId: string; lineNumber: number; message: string }`.
- [ ] Create `src/benchmarks/documentVersionChecker.ts` exporting `DocumentVersionChecker` class with:
  - `check(filePath: string): { approved: boolean; version: string | null }` method.
  - Uses `gray-matter` to parse YAML front-matter from the file.
  - Returns `approved: true` only when front-matter contains `status: APPROVED` and `version: "1.0"`.
- [ ] Add npm script: `"bench:document-validity": "ts-node src/benchmarks/scripts/runDocumentValidityBench.ts"` which lints PRD, TAS, Security Design, and UI/UX Design files and prints `{ allValid: boolean, results: Record<string, { valid: boolean; approved: boolean }> }`.
- [ ] Add YAML front-matter to `specs/1_prd.md`, `specs/2_tas.md`, `specs/5_security_design.md`, and the UI/UX design spec file if it does not already exist:
  ```yaml
  ---
  status: APPROVED
  version: "1.0"
  ---
  ```

## 3. Code Review
- [ ] Verify `DocumentValidator.lint()` is a pure function — no file I/O inside it (file reading is the caller's responsibility).
- [ ] Confirm `LintError` is a named exported interface in a `src/benchmarks/types.ts` file (not inlined).
- [ ] Ensure the markdownlint config file is a typed `markdownlint.Options["config"]` object, not `any`.
- [ ] Verify the YAML front-matter insertion does not break existing document rendering (headings still start on the correct line after the front-matter block).
- [ ] Confirm all spec file paths are resolved relative to the project root using `path.resolve(process.cwd(), ...)`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="documentValidity"` and confirm all tests pass with exit code 0.
- [ ] Run `npm run bench:document-validity` and confirm `allValid: true` is printed.

## 5. Update Documentation
- [ ] Update `docs/benchmarks/README.md` with a section "Document Validity Linting" describing the linting rules, how to run the suite, and the pass criterion (`APPROVED v1.0` status + zero lint errors, maps to `[9_ROADMAP-REQ-027]`).
- [ ] Add a `// [9_ROADMAP-REQ-027]` comment above the `lint()` method signature in `documentValidator.ts`.
- [ ] Create `src/benchmarks/documentValidator.agent.md` describing the module, the markdownlint rules applied, and the YAML front-matter schema expected.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="documentValidity" --coverage` and assert coverage ≥ 90% for `src/benchmarks/documentValidator.ts` and `src/benchmarks/documentVersionChecker.ts`.
- [ ] Run `npm run bench:document-validity` and pipe output through `node -e "const r=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));process.exit(r.allValid?0:1)"` to programmatically assert `allValid: true`.
- [ ] Add `bench:document-validity` to the CI pipeline so it gates merges when any spec file fails linting or is missing the `APPROVED` status.
