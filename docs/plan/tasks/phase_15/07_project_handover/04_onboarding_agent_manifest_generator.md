# Task: Implement Onboarding Agent Manifest Generator (Sub-Epic: 07_Project Handover)

## Covered Requirements
- [4_USER_FEATURES-REQ-087]

## 1. Initial Test Written
- [ ] In `src/export/__tests__/onboarding-manifest.test.ts`, write unit tests:
  - **Unit – Manifest structure**: Given a mock `ValidationReportData` and a mock project metadata object, assert `buildOnboardingManifest(data, meta)` returns an object satisfying the `OnboardingManifest` TypeScript interface, with all required top-level keys present: `projectName`, `generatedAt`, `techStack`, `keyArchitecturalDecisions`, `openItems`, `knownLimitations`, `gettingStarted`, and `requirementTraceabilitySummary`.
  - **Unit – Tech stack extraction**: Given a mock `devs.db` containing a `phase_decisions` table with entries like `{ phase: 2, key: 'language', value: 'TypeScript' }`, assert `extractTechStack(db)` returns `{ language: 'TypeScript', … }`.
  - **Unit – Open items extraction**: Given tasks in the mock DB with `status = 'deferred'` or requirements with `status = 'out_of_scope'`, assert `extractOpenItems(db)` returns a list of objects with `id`, `description`, and `deferralReason`.
  - **Unit – Markdown serialisation**: Assert `renderManifestAsMarkdown(manifest)` produces a Markdown string with sections: `# Onboarding Guide`, `## Tech Stack`, `## Getting Started`, `## Key Architectural Decisions`, `## Open Items & Known Limitations`, `## Requirement Traceability Summary`.
  - **Unit – JSON serialisation**: Assert `renderManifestAsJson(manifest)` produces valid JSON that round-trips through `JSON.parse` without loss.

## 2. Task Implementation
- [ ] Create `src/export/onboarding-manifest.ts` exporting:
  - `extractTechStack(db: Database): TechStack` — queries `phase_decisions` for architecture choices made during Phase 2 (TAS approval).
  - `extractKeyDecisions(db: Database): ArchitecturalDecision[]` — queries `agent_logs` or `phase_decisions` for decisions tagged as `architectural`.
  - `extractOpenItems(db: Database): OpenItem[]` — queries `tasks` for status `deferred` and `requirements` for status `out_of_scope` or `future`.
  - `buildOnboardingManifest(db: Database, reportData: ValidationReportData): OnboardingManifest` — orchestrates all extraction functions and assembles the manifest.
  - `renderManifestAsMarkdown(manifest: OnboardingManifest): string` — pure function, produces human-readable Markdown.
  - `renderManifestAsJson(manifest: OnboardingManifest): string` — pure function, produces machine-readable JSON.
- [ ] Add `OnboardingManifest`, `TechStack`, `ArchitecturalDecision`, and `OpenItem` interfaces to `src/export/types.ts`.
- [ ] Add a `getting_started` table (or derive it from existing schema) that stores the project's local dev setup steps (e.g., `npm install`, `npm run dev`); the manifest's `gettingStarted` section reads from this.

## 3. Code Review
- [ ] Confirm `buildOnboardingManifest` does not perform I/O directly — it must accept an already-open `Database` handle.
- [ ] Confirm `renderManifestAsMarkdown` and `renderManifestAsJson` are pure functions with no side effects.
- [ ] Verify `extractOpenItems` correctly distinguishes between `out_of_scope` requirements (documented OOS from Phase 15 manifest) and merely deferred tasks.
- [ ] Check that the `generatedAt` timestamp in the manifest uses ISO 8601 UTC format.
- [ ] Ensure all DB queries use parameterised statements (no string interpolation) to prevent SQL injection even in internal tooling.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="onboarding-manifest"` and confirm all tests pass.
- [ ] Run `npm run type-check` and confirm no new type errors.

## 5. Update Documentation
- [ ] Add `docs/export/onboarding-manifest.md` describing the manifest schema, all fields, and their data sources within `devs.db`.
- [ ] Update `docs/agent-memory/phase_15.md` noting that the onboarding manifest is produced in both Markdown and JSON formats and embedded in the project archive.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="onboarding-manifest" --coverage` and assert `onboarding-manifest.ts` has ≥ 90% line coverage.
- [ ] Execute a JSON schema validation smoke test: generate a manifest from the fixture project and validate it against `src/export/schemas/onboarding-manifest.schema.json` using `ajv-cli` or equivalent; assert exit code 0.
