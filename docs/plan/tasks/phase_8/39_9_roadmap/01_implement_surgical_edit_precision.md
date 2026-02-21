# Task: Implement Surgical Edit Precision and Benchmark (Sub-Epic: 39_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-BLOCKER-002], [9_ROADMAP-REQ-022]

## 1. Initial Test Written
- [ ] Create `tests/tools/surgical_edit.test.ts`.
- [ ] Write a test `should correctly replace a specific function without altering the rest of the file`.
- [ ] Write a test `should fail gracefully if the search string is not unique`.
- [ ] Write a test `should achieve 100% precision on the surgical precision benchmark suite (a set of 5 complex file modification scenarios)`.

## 2. Task Implementation
- [ ] Implement the `surgical_edit` tool in `src/tools/surgical_edit.ts`.
- [ ] Ensure the tool accepts `filePath`, `searchString`, and `replaceString`.
- [ ] Implement validation to ensure `searchString` appears exactly once in the file to prevent unintended modifications.
- [ ] Integrate the tool into the MCP tool registry.

## 3. Code Review
- [ ] Verify that `surgical_edit.ts` handles large files efficiently.
- [ ] Ensure proper error handling and descriptive error messages for the LLM when a replacement fails.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- tests/tools/surgical_edit.test.ts` to ensure all tests pass.

## 5. Update Documentation
- [ ] Update `docs/tools.md` with usage instructions and examples for the `surgical_edit` tool.
- [ ] Add an entry in the agent memory indicating the tool is ready for use.

## 6. Automated Verification
- [ ] A script `scripts/verify_surgical_edit_benchmark.ts` should run the benchmark suite and output a pass/fail status, which the CI can read.
