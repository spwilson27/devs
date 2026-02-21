# Task: Reviewer Autonomy Anti-Pattern Detection Benchmark (Sub-Epic: 25_Benchmarking Suite Process and Performance Metrics)

## Covered Requirements
- [9_ROADMAP-REQ-034]

## 1. Initial Test Written
- [ ] Create test file at `src/orchestrator/__tests__/reviewer-autonomy.bench.test.ts`.
- [ ] Write a unit test `reviewerDetectsHardcodedSecret` that injects a TypeScript code snippet containing `const API_KEY = "sk-abc123def456"` into `runReviewerAgent({ code, taskId })` and asserts the returned `ReviewResult.antiPatternsFound` array contains an entry with `type: "hardcoded-secret"`.
- [ ] Write a unit test `reviewerDetectsConsoleLog` that injects a snippet with `console.log(userPassword)` and asserts `antiPatternsFound` contains `type: "sensitive-data-leak"`.
- [ ] Write a unit test `reviewerProposesRevert` that asserts when `antiPatternsFound.length > 0`, the `ReviewResult.action` is `"revert"` and `ReviewResult.revertCommitSha` is a non-empty string.
- [ ] Write a unit test `reviewerPassesCleanCode` that provides a clean code snippet with no anti-patterns and asserts `ReviewResult.action === "approve"` and `antiPatternsFound` is empty.
- [ ] Write an integration test `benchmarkReviewerAutonomy_endToEnd` that:
  1. Commits a file with a hardcoded secret to a temporary git repo.
  2. Calls `runReviewerAgent` with the diff.
  3. Asserts `ReviewResult.action === "revert"` and the revert commit is successfully applied (the secret is gone from HEAD).
- [ ] Write a benchmark test measuring `runReviewerAgent` latency for a 200-line diff, asserting p95 < 2000ms (reviewer uses LLM but must be fast).
- [ ] All tests must FAIL before implementation begins (Red-Phase Gate confirmed).

## 2. Task Implementation
- [ ] Create `src/agents/reviewer-agent.ts` exporting:
  - `interface AntiPattern { type: string; line: number; description: string }`.
  - `interface ReviewResult { taskId: string; antiPatternsFound: AntiPattern[]; action: "approve" | "revert"; revertCommitSha?: string }`.
  - `async function runReviewerAgent(input: { code: string; taskId: string; gitRepoPath?: string }): Promise<ReviewResult>` that:
    1. Runs static analysis patterns (regex-based) for known anti-patterns: hardcoded secrets (`/['"](sk|api|secret|password)[_-]?[a-z0-9]{8,}/i`), sensitive console logs, eval usage, `process.exit`, etc.
    2. Sends the diff to the configured LLM (Gemini Flash) with a structured prompt listing forbidden patterns.
    3. Merges static + LLM findings into `antiPatternsFound`.
    4. If `antiPatternsFound.length > 0` and `gitRepoPath` is provided, runs `git revert HEAD --no-edit` in the repo, sets `action = "revert"`, and captures the new commit SHA.
- [ ] Create `src/agents/anti-pattern-registry.ts` exporting an `ANTI_PATTERNS` constant array of `{ type, regex, description }` objects — start with at least 5 patterns (hardcoded secret, eval, process.exit, console.log with variable, TODO in prod).
- [ ] Create `src/orchestrator/benchmark-reviewer-autonomy.ts` exporting `runReviewerAutonomyBenchmark(): Promise<BenchmarkReport>` that:
  1. Injects each entry from `fixtures/anti-pattern-samples.json` (minimum 5 samples: 1 clean, 4 with different anti-patterns).
  2. Calls `runReviewerAgent` for each.
  3. Asserts all 4 dirty samples resulted in `action = "revert"`.
  4. Returns `{ metric: "reviewer-autonomy", catchRate: number, pass: boolean }` where `pass = catchRate >= 1.0` (must catch all injected anti-patterns).
- [ ] Create fixture `fixtures/anti-pattern-samples.json` with the 5 sample entries.
- [ ] Register in `package.json` under `devs.benchmarks`: `"reviewer-autonomy": "vitest bench src/agents/__tests__/reviewer-autonomy.bench.test.ts"`.

## 3. Code Review
- [ ] Verify static analysis runs before LLM call (fail-fast: avoid spending tokens if regex already catches the issue).
- [ ] Confirm `git revert` is only called when `gitRepoPath` is provided and the path is validated (no path traversal).
- [ ] Verify `ANTI_PATTERNS` registry is imported from the separate registry file, not hardcoded in the agent.
- [ ] Confirm the LLM prompt uses structured delimiters (per [1_PRD-REQ-SEC-012]) to prevent prompt injection.
- [ ] Verify the `ReviewResult` type matches the `BenchmarkReport` consumer interface.

## 4. Run Automated Tests to Verify
- [ ] Run `npx vitest run src/agents/__tests__/reviewer-autonomy.bench.test.ts` and confirm all tests pass.
- [ ] Run `npx vitest bench src/agents/__tests__/reviewer-autonomy.bench.test.ts` and confirm p95 < 2000ms.
- [ ] Run `npm run lint` and confirm zero errors.

## 5. Update Documentation
- [ ] Create `src/agents/reviewer-agent.agent.md` documenting: anti-pattern registry, revert flow, LLM prompt structure, and benchmark pass criteria.
- [ ] Update `docs/benchmarks/README.md` to add a row for `reviewer-autonomy` with threshold `catch rate = 100% of injected anti-patterns`.
- [ ] Add `# [9_ROADMAP-REQ-034]` comment above `runReviewerAgent` in source.

## 6. Automated Verification
- [ ] Run `node scripts/validate-all.js --benchmark reviewer-autonomy` and confirm exit code 0.
- [ ] Confirm `reports/benchmarks/reviewer-autonomy.json` contains `{ "catchRate": 1.0, "pass": true }`.
- [ ] Run `grep -r "9_ROADMAP-REQ-034" src/agents/reviewer-agent.ts` and confirm the requirement ID appears in source.
