# Task: Define User Persona & Journey Research Data Models (Sub-Epic: 07_Market & User Research Domains)

## Covered Requirements
- [1_PRD-REQ-RES-003], [9_ROADMAP-REQ-RES-003]

## 1. Initial Test Written
- [ ] In `src/research/user/__tests__/models.test.ts`, write the following unit tests:
  - **`PersonaProfile` schema validation**
    - Assert `PersonaProfile` requires: `id: string`, `name: string`, `age: number`, `occupation: string`, `technicalLevel: 'beginner' | 'intermediate' | 'expert'`, `goals: string[]` (min 1), `painPoints: string[]` (min 1), `motivations: string[]` (min 1), `preferredChannels: string[]`.
    - Assert that omitting `goals` throws a Zod validation error.
    - Assert that `technicalLevel` rejects arbitrary strings (e.g., `"guru"` should throw).
  - **`JourneyStep` schema validation**
    - Assert `JourneyStep` requires: `step: number`, `action: string`, `userThought: string`, `emotion: 'positive' | 'neutral' | 'negative'`, `touchpoint: string`.
  - **`UserJourney` schema validation**
    - Assert `UserJourney` requires: `id: string`, `personaId: string`, `scenario: string`, `steps: JourneyStep[]` (min 2).
    - Assert that `steps: []` (empty array) throws a validation error.
  - **`UserResearchReport` schema validation**
    - Assert `UserResearchReport` requires: `projectId: string`, `generatedAt: Date`, `personas: PersonaProfile[]` (min 3), `journeys: UserJourney[]` (min 1), `researchSummary: string`.
    - Assert `personas` with fewer than 3 items throws.
  - **Round-trip serialization**: Serialize a valid `UserResearchReport` to JSON and parse it back; assert all fields are preserved including `generatedAt` as a `Date`.

## 2. Task Implementation
- [ ] Create `src/research/user/models.ts` exporting Zod schemas and inferred TypeScript types:
  - `JourneyStepSchema` / `JourneyStep`
  - `UserJourneySchema` / `UserJourney`
  - `PersonaProfileSchema` / `PersonaProfile`
  - `UserResearchReportSchema` / `UserResearchReport`
- [ ] Apply `.min(3)` on `UserResearchReportSchema.personas` to enforce ≥3 personas from `1_PRD-REQ-RES-003`.
- [ ] Apply `.min(2)` on `UserJourneySchema.steps` to enforce journeys have at least 2 steps.
- [ ] Use `z.coerce.date()` for `generatedAt` to handle both `Date` objects and ISO string deserialization.
- [ ] Export `parseUserResearchReport(raw: unknown): UserResearchReport` helper wrapping `UserResearchReportSchema.parse()` in a typed `ValidationError`.
- [ ] Create `src/research/user/index.ts` as a barrel re-exporting all public symbols.

## 3. Code Review
- [ ] Verify no `z.any()` used in any schema field.
- [ ] Verify `PersonaProfile.technicalLevel` uses `z.enum(['beginner', 'intermediate', 'expert'])`.
- [ ] Verify `JourneyStep.emotion` uses `z.enum(['positive', 'neutral', 'negative'])`.
- [ ] Verify `UserResearchReport.personas` enforces `.min(3)`.
- [ ] Verify `parseUserResearchReport` throws a typed error (not raw Zod error) on invalid input.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/research/user/__tests__/models.test.ts` and confirm all tests pass with 0 failures.
- [ ] Run `pnpm tsc --noEmit` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `src/research/user/user.agent.md` with:
  - Purpose: Defines canonical data shapes for user persona and journey research output.
  - Key schemas: `PersonaProfile`, `UserJourney`, `UserResearchReport`.
  - Constraint notes: ≥3 personas required; journeys require ≥2 steps; `technicalLevel` is an enum.
  - Usage example showing `parseUserResearchReport(rawJson)`.

## 6. Automated Verification
- [ ] Run `pnpm test --coverage src/research/user/__tests__/models.test.ts` and assert line coverage ≥ 95% for `models.ts`.
- [ ] Run `pnpm tsc --noEmit` and assert exit code 0.
- [ ] Run `node -e "require('./dist/research/user/index.js')"` (after build) and assert no runtime errors on import.
