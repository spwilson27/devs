# Task: Citation Verification & Confidence Score Enforcement (Sub-Epic: 03_Search Integration Tools)

## Covered Requirements
- [9_ROADMAP-REQ-025], [1_PRD-REQ-RES-006]

## 1. Initial Test Written
- [ ] Create `src/tools/search/__tests__/citation_verifier.test.ts`.
- [ ] Write a unit test verifying `CitationVerifier.verify(citation: Citation): Promise<VerifiedCitation>` resolves with `isVerifiable: true` and `confidenceScore >= 0.8` when the citation URL returns a real search result via the (mocked) `CachedSearchClient` whose top scored result has credibility > 0.8.
- [ ] Write a unit test verifying `isVerifiable: false` is returned when the mocked search client returns zero organic results for the citation URL.
- [ ] Write a unit test verifying that when the `Citation.claim` text is not found verbatim (or semantically close) in any top-scored snippet, `claimSupportScore < 0.5` and `requiresReview: true` is set.
- [ ] Write a unit test verifying `CitationVerifier.verifyAll(citations: Citation[]): Promise<CitationVerificationReport>` returns a report where `allCitationsVerified` is `false` if ANY citation has `confidenceScore < 0.8`.
- [ ] Write a unit test verifying that `CitationVerificationReport.failedCitations` contains exactly the citations that failed the 0.8 threshold.
- [ ] Write a unit test verifying `CitationVerifier.verifyAll` processes citations sequentially and does not call `CachedSearchClient.search` for a URL that has already been verified in the same batch (deduplication by URL).
- [ ] Create `src/tools/search/__tests__/report_citation_auditor.test.ts`.
- [ ] Write a unit test verifying `ReportCitationAuditor.audit(reportMarkdown: string): Citation[]` correctly extracts all Markdown hyperlinks `[text](url)` from a Markdown document as `Citation` objects.
- [ ] Write a unit test verifying `ReportCitationAuditor.audit` also extracts bare URLs matching `https://` prefixed strings that are not already part of a Markdown link.
- [ ] Write a unit test verifying `ReportCitationAuditor.auditAndVerify(reportMarkdown: string): Promise<CitationVerificationReport>` calls `CitationVerifier.verifyAll` with the extracted citations.

## 2. Task Implementation
- [ ] Add to `src/tools/search/types.ts`:
  - `Citation`: `{ url: string; claim: string; context?: string }` — `claim` is the fact being cited, `context` is the surrounding paragraph.
  - `VerifiedCitation`: `Citation & { isVerifiable: boolean; confidenceScore: number; claimSupportScore: number; requiresReview: boolean; verifiedAt: string }`.
  - `CitationVerificationReport`: `{ citations: VerifiedCitation[]; allCitationsVerified: boolean; failedCitations: VerifiedCitation[]; verifiedAt: string }`.
- [ ] Create `src/tools/search/citation_verifier.ts` implementing `CitationVerifier`:
  - Constructor: `constructor(private searchClient: CachedSearchClient, private scorer: CredibilityScorer)`.
  - `async verify(citation: Citation): Promise<VerifiedCitation>`:
    1. Search for the citation URL using `searchClient.search(citation.url)`.
    2. Score results with `scorer.scoreAll()`.
    3. Take the top-scored result; set `confidenceScore = topResult.credibility.value` (or `0.0` if no results).
    4. Calculate `claimSupportScore` by checking how many words from `citation.claim` appear in `topResult.snippet` (Jaccard-like overlap).
    5. Set `isVerifiable = confidenceScore >= 0.8`.
    6. Set `requiresReview = claimSupportScore < 0.5`.
  - `async verifyAll(citations: Citation[]): Promise<CitationVerificationReport>`:
    - Deduplicate by URL before verifying.
    - Process sequentially.
    - Build and return the `CitationVerificationReport`.
- [ ] Create `src/tools/search/report_citation_auditor.ts` implementing `ReportCitationAuditor`:
  - Constructor: `constructor(private verifier: CitationVerifier)`.
  - `audit(reportMarkdown: string): Citation[]` — uses regex to extract Markdown links and bare HTTPS URLs. Constructs `Citation` objects with `url` and `claim` (from the link text or the surrounding sentence extracted via sentence-boundary heuristics).
  - `async auditAndVerify(reportMarkdown: string): Promise<CitationVerificationReport>` — calls `audit` then `verifier.verifyAll`.
- [ ] Export `CitationVerifier`, `ReportCitationAuditor`, and new types from `src/tools/search/index.ts`.

## 3. Code Review
- [ ] Verify `CitationVerifier` uses constructor injection for both `CachedSearchClient` and `CredibilityScorer`.
- [ ] Verify the URL deduplication in `verifyAll` uses a `Set<string>` on `citation.url` before the verification loop.
- [ ] Verify the `claimSupportScore` calculation is isolated in a private method `private calculateClaimSupport(claim: string, snippet: string): number` to keep `verify` readable.
- [ ] Verify `ReportCitationAuditor.audit` handles edge cases: empty string input, Markdown without any links, and documents with only bare URLs.
- [ ] Verify the confidence threshold `0.8` references the `DEFAULT_CREDIBILITY_THRESHOLD` constant from `credibility_scorer.ts` rather than being a new magic number.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="citation_verifier|report_citation_auditor"` and confirm all tests pass.
- [ ] Run the linter and confirm 0 errors.

## 5. Update Documentation
- [ ] Update `src/tools/search/search.agent.md` adding sections `## CitationVerifier` and `## ReportCitationAuditor` documenting the verification workflow, the `Citation` type, the `CitationVerificationReport` structure, and the 0.8 confidence threshold enforcement rule.
- [ ] Update `docs/research_phase.md` adding a section "Citation Verification" explaining that every research report generated by the Discovery phase must pass `ReportCitationAuditor.auditAndVerify()` before being surfaced to the user, and that reports with `allCitationsVerified: false` must be flagged for human review.
- [ ] Add an entry to `ARCHITECTURE.md` under "Data Quality" describing the end-to-end citation enforcement pipeline: `ResearchAgent → ReportCitationAuditor → CitationVerifier → CachedSearchClient → CredibilityScorer`.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern="citation_verifier|report_citation_auditor"` and confirm coverage ≥ 90% for both source files.
- [ ] Confirm no hardcoded `0.8` literal exists in `citation_verifier.ts` (it must reference `DEFAULT_CREDIBILITY_THRESHOLD`): `grep -n "0\.8" src/tools/search/citation_verifier.ts` should return no results.
- [ ] Confirm `search.agent.md` contains the sections `## CitationVerifier` and `## ReportCitationAuditor`: `grep -n "CitationVerifier\|ReportCitationAuditor" src/tools/search/search.agent.md`.
- [ ] Confirm `docs/research_phase.md` contains the phrase `auditAndVerify`: `grep -n "auditAndVerify" docs/research_phase.md`.
