# Task: Implement Live Library Reputation Check to Mitigate Supply Chain Poisoning (Sub-Epic: 06_Input Sanitization & Prompt Injection Mitigation)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-THR-002]

## 1. Initial Test Written
- [ ] Create `src/research/tools/__tests__/reputation_checker.test.ts`.
- [ ] Write a unit test `approvesLegitimatePackage` that calls `ReputationChecker.check(packageName: string, ecosystem: string): Promise<ReputationResult>` with `("react", "npm")` and, using a mocked HTTP client, returns a mocked NPM registry response with `>1000` weekly downloads and a publish date >6 months ago, then asserts `ReputationResult.approved` is `true`.
- [ ] Write a unit test `rejectsTyposquattedPackage` that passes `("reakt", "npm")` with a mocked response showing 0 downloads and a publish date of yesterday, then asserts `approved` is `false` and `ReputationResult.flags` includes `"low_download_count"` and `"new_package"`.
- [ ] Write a unit test `rejectsMaliciousPackageWithKnownAdvisory` that mocks the OSV.dev API returning a critical vulnerability for the package and asserts `approved` is `false` and `flags` includes `"known_advisory"`.
- [ ] Write a unit test `flagsNameSimilarityToPopularPackage` that passes `("lodahs", "npm")` and asserts `flags` includes `"typosquat_suspected"` when the Levenshtein distance to `"lodash"` is ≤ 2.
- [ ] Write a unit test `handlesRegistryTimeoutGracefully` that mocks the HTTP client to throw a timeout error and asserts the function throws a `ReputationCheckError` with `retryable: true`.
- [ ] Write an integration test `techLandscapeAgentInvokesReputationCheckForEveryLibrary` in `src/agents/tech_landscape/__tests__/tech_landscape_agent.integration.test.ts` that mocks `ReputationChecker` and asserts it is called once for every library recommendation the `TechLandscapeAgent` emits, and that any library with `approved: false` is excluded from the final recommendation set.
- [ ] Write an integration test `reputationCheckResultsArePersisted` that asserts each `ReputationResult` is written to the project's persistent decision log (SQLite or JSON store), including `packageName`, `ecosystem`, `approved`, `flags`, and `checkedAt` timestamp.

## 2. Task Implementation
- [ ] Create `src/research/tools/reputation_checker.ts` with a class `ReputationChecker` implementing:
  - Constructor accepting an `HttpClient` (injectable for testing) and a `DecisionLogger`.
  - `async check(packageName: string, ecosystem: "npm" | "pypi" | "cargo" | "go"): Promise<ReputationResult>` that:
    1. Queries the appropriate registry API: NPM registry (`https://registry.npmjs.org/{package}`), PyPI JSON API (`https://pypi.org/pypi/{package}/json`), etc.
    2. Extracts: weekly download count, first publish date, maintainer count, and deprecated flag.
    3. Queries OSV.dev (`https://api.osv.dev/v1/query`) with the package name and ecosystem to check for known security advisories.
    4. Computes a Levenshtein distance score against the top-500 most downloaded packages for the ecosystem (loaded from `src/research/tools/popular_packages/{ecosystem}.json`).
    5. Applies scoring rules and populates `ReputationResult.flags` and `approved` based on configurable thresholds in `config/reputation_thresholds.ts`.
    6. Logs the result via `DecisionLogger.log()`.
    7. Returns `ReputationResult`.
- [ ] Create `src/research/tools/reputation_checker_types.ts` exporting: `ReputationResult { packageName: string; ecosystem: string; approved: boolean; flags: ReputationFlag[]; weeklyDownloads: number; ageInDays: number; advisoryCount: number; checkedAt: string }` and `ReputationFlag` union type of string literals `"low_download_count" | "new_package" | "known_advisory" | "typosquat_suspected" | "deprecated"`.
- [ ] Create `config/reputation_thresholds.ts` with defaults: `MIN_WEEKLY_DOWNLOADS = 500`, `MIN_AGE_DAYS = 30`, `MAX_TYPOSQUAT_DISTANCE = 2`, `MAX_ADVISORY_COUNT = 0`.
- [ ] Create `src/research/tools/levenshtein.ts` with a pure function `levenshteinDistance(a: string, b: string): number`.
- [ ] Create `src/research/tools/popular_packages/npm.json` containing the top-500 npm package names (sourced from the public npmjs.com download rankings — include the list as a static JSON file committed to the repo).
- [ ] Update `src/agents/tech_landscape/tech_landscape_agent.ts` to import `ReputationChecker` and, after generating each library recommendation, call `reputationChecker.check(library.name, library.ecosystem)`. Filter out any library where `result.approved === false`. Emit a structured warning log for each rejected library including `packageName` and `flags`.
- [ ] Create `src/research/tools/index.ts` re-exporting `ReputationChecker` and all types.

## 3. Code Review
- [ ] Verify `ReputationChecker` uses the injected `HttpClient` exclusively — no direct `fetch`/`axios` calls at the top level — to ensure full testability via mocks.
- [ ] Confirm OSV.dev advisory check is performed on every library, not only those flagged by other heuristics.
- [ ] Verify `levenshteinDistance` is a pure function with no external dependencies.
- [ ] Confirm `popular_packages/npm.json` (and equivalents) are committed as static assets and are not fetched at runtime (to avoid circular supply-chain risk).
- [ ] Confirm the decision log entry includes a timestamp, all flags, and the `approved` boolean — sufficient for a security audit trail.
- [ ] Verify `TechLandscapeAgent` never passes a library with `approved: false` to the downstream Architect Agent under any code path.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/research/tools/__tests__/reputation_checker.test.ts"` and confirm all assertions pass.
- [ ] Run `npm test -- --testPathPattern="src/agents/tech_landscape/__tests__/tech_landscape_agent.integration.test.ts"` and confirm all assertions pass.
- [ ] Run `npm test -- --coverage --collectCoverageFrom="src/research/tools/**"` and confirm line coverage ≥ 90%.

## 5. Update Documentation
- [ ] Create `src/research/tools/reputation_checker.agent.md` documenting: the purpose of the reputation check, the data sources (registry APIs + OSV.dev), the scoring heuristics, the typosquat detection approach, the threshold configuration file, and integration point in `TechLandscapeAgent`.
- [ ] Add an entry in `docs/security/supply_chain_mitigations.md` describing the `ReputationChecker` design and explicitly referencing `5_SECURITY_DESIGN-REQ-SEC-THR-002`.
- [ ] Update `CHANGELOG.md` with a `Security` entry: `Add ReputationChecker tool to mitigate supply chain poisoning during Tech Landscape phase library recommendations`.

## 6. Automated Verification
- [ ] Run `npm test -- --ci` and assert exit code is `0`.
- [ ] Run `grep -rn "ReputationChecker" src/agents/tech_landscape/tech_landscape_agent.ts` and assert the class is imported and instantiated, confirming the tool is wired into the agent.
- [ ] Run `node scripts/verify_reputation_check_wired.js` — a script that parses `src/agents/tech_landscape/tech_landscape_agent.ts` AST and asserts that every code path that produces a library recommendation calls `reputationChecker.check()` before returning. Create this script in `scripts/` as part of this task.
