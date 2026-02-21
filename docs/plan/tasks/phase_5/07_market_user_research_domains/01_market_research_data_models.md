# Task: Define Market & Competitive Research Data Models (Sub-Epic: 07_Market & User Research Domains)

## Covered Requirements
- [1_PRD-REQ-RES-001], [9_ROADMAP-REQ-RES-001]

## 1. Initial Test Written
- [ ] In `src/research/market/__tests__/models.test.ts`, write unit tests that:
  - Assert `CompetitorProfile` can be instantiated with required fields: `id: string`, `name: string`, `url: string`, `description: string`, `features: FeatureSet[]`, `pricing: PricingData`, `credibilityScore: number` (0–1).
  - Assert `FeatureSet` enforces `category: string`, `features: string[]`, and optional `notes: string`.
  - Assert `PricingData` enforces `model: 'free' | 'freemium' | 'paid' | 'enterprise' | 'unknown'`, `tiers: PricingTier[]`, and optional `freeTrialAvailable: boolean`.
  - Assert `PricingTier` enforces `name: string`, `pricePerMonth: number | null`, `features: string[]`.
  - Assert `SWOTAnalysis` enforces `strengths: string[]`, `weaknesses: string[]`, `opportunities: string[]`, `threats: string[]`, all with minimum length of 1 item each.
  - Assert `MarketResearchReport` enforces `projectId: string`, `generatedAt: Date`, `competitors: CompetitorProfile[]` (min 5), `swotPerCompetitor: Record<string, SWOTAnalysis>`, and `overallMarketSummary: string`.
  - Assert that Zod schema validation throws on invalid/missing required fields.
  - Write snapshot tests that serialize a valid `MarketResearchReport` to JSON and back without data loss.

## 2. Task Implementation
- [ ] Create `src/research/market/models.ts` exporting the following Zod schemas and inferred TypeScript types:
  - `PricingTierSchema` / `PricingTier`
  - `PricingDataSchema` / `PricingData`
  - `FeatureSetSchema` / `FeatureSet`
  - `CompetitorProfileSchema` / `CompetitorProfile`
  - `SWOTAnalysisSchema` / `SWOTAnalysis`
  - `MarketResearchReportSchema` / `MarketResearchReport`
- [ ] Use `zod` for runtime validation. Apply `.min(1)` constraints on array fields that must be non-empty.
- [ ] Apply `.min(5)` on `MarketResearchReportSchema.competitors` to enforce the ≥5 competitors rule from `1_PRD-REQ-RES-001`.
- [ ] Apply `.min(0).max(1)` on `CompetitorProfile.credibilityScore` to enforce source credibility bounds.
- [ ] Export a `parseMarketResearchReport(raw: unknown): MarketResearchReport` helper that calls `MarketResearchReportSchema.parse(raw)` and wraps errors in a typed `ValidationError`.
- [ ] Create `src/research/market/index.ts` as a barrel re-exporting all public symbols.

## 3. Code Review
- [ ] Verify that every schema field has an explicit Zod type—no `z.any()` used.
- [ ] Confirm `CompetitorProfile.credibilityScore` is bounded `[0, 1]`.
- [ ] Confirm `MarketResearchReport.competitors` enforces `.min(5)`.
- [ ] Confirm all models are pure data structures with no side effects or I/O.
- [ ] Confirm `parseMarketResearchReport` throws a typed error (not a raw Zod error) on invalid input.
- [ ] Confirm the barrel `index.ts` does not leak internal/private symbols.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/research/market/__tests__/models.test.ts` and confirm all tests pass with 0 failures.
- [ ] Run `pnpm tsc --noEmit` and confirm zero TypeScript errors in the new files.

## 5. Update Documentation
- [ ] Create `src/research/market/market.agent.md` with:
  - Purpose: Defines the canonical data shapes for market and competitive research output.
  - Key schemas: `CompetitorProfile`, `SWOTAnalysis`, `MarketResearchReport`.
  - Constraint notes: ≥5 competitors enforced at schema level; credibility score bounded [0,1].
  - Usage example showing `parseMarketResearchReport(rawJson)`.

## 6. Automated Verification
- [ ] Run `pnpm test --coverage src/research/market/__tests__/models.test.ts` and assert line coverage ≥ 95% for `models.ts`.
- [ ] Run `pnpm tsc --noEmit` and assert exit code 0.
- [ ] Run `node -e "require('./dist/research/market/index.js')"` (after build) and assert no runtime errors on import.
