# Task: Research and Implement GitHub Automated PR Reviewer Integration Specification (Sub-Epic: 05_Future Roadmap Strategy)

## Covered Requirements
- [9_ROADMAP-FUTURE-003]

## 1. Initial Test Written
- [ ] In `src/integrations/github/__tests__/pr_reviewer.test.ts`, write unit tests for a `GitHubPRReviewerConfig` configuration model:
  - Test that `GitHubPRReviewerConfigSchema` (Zod) validates a valid config: `{ enabled: false, webhookSecret: z.string().optional(), repositoryPatterns: z.array(z.string()).optional() }`.
  - Test that `GitHubPRReviewerConfigSchema` rejects `enabled: true` with the error `"Automated PR Reviewer integration is not yet supported. See FUTURE_ROADMAP.md (9_ROADMAP-FUTURE-003)."`.
  - Test that `GitHubPRReviewerService.handleWebhookEvent(event)` throws `NotImplementedError` with the message above when called.
  - Test that `GitHubPRReviewerService.getIntegrationPoints()` returns a static, well-defined `IntegrationPointsManifest` object (see implementation) without throwing.
- [ ] In `src/integrations/github/__tests__/integration_points.test.ts`, write a snapshot test for the `IntegrationPointsManifest` to lock in the documented integration surface.

## 2. Task Implementation
- [ ] Create `src/integrations/github/types.ts` with:
  - `GitHubPRReviewerConfigSchema` Zod schema: `enabled` is `z.literal(false)` with a `.refine()` producing the error above if anything else is passed.
  - `IntegrationPointsManifest` interface: `{ webhookEvents: string[]; requiredPermissions: string[]; proposedWorkflow: string; requiredSecrets: string[]; }`.
- [ ] Create `src/integrations/github/pr_reviewer_service.ts` implementing `GitHubPRReviewerService`:
  - `handleWebhookEvent(event: unknown): Promise<void>` — throws `NotImplementedError`. Add JSDoc: `/** Future hook for 9_ROADMAP-FUTURE-003: Automated PR Reviewer. */`
  - `getIntegrationPoints(): IntegrationPointsManifest` — returns a static manifest object documenting:
    - `webhookEvents`: `['pull_request.opened', 'pull_request.synchronize', 'pull_request_review.submitted']`
    - `requiredPermissions`: `['pull-requests: write', 'checks: write', 'contents: read']`
    - `proposedWorkflow`: `"1. Receive PR webhook. 2. Trigger devs code review agent. 3. Post review comments via GitHub Checks API. 4. Set PR status check."`
    - `requiredSecrets`: `['GITHUB_TOKEN', 'DEVS_WEBHOOK_SECRET']`
- [ ] Create `src/integrations/github/index.ts` exporting the service and types.
- [ ] Create `docs/integrations/github_pr_reviewer.md` as a research document covering:
  - The GitHub Checks API vs Pull Request Reviews API — which to use and why (use Checks API for programmatic agent feedback).
  - The proposed webhook payload flow (PR opened → devs agent triggered → check run created → agent posts annotations).
  - Required GitHub App permissions.
  - Security considerations: webhook secret validation using HMAC-SHA256.
  - How the existing `LLMProvider` abstraction (Task 01) will be reused by the PR reviewer agent.

## 3. Code Review
- [ ] Verify `GitHubPRReviewerConfigSchema` uses `z.literal(false)` so `enabled: true` is a compile-time AND runtime error.
- [ ] Verify `handleWebhookEvent` has NO real logic beyond the `NotImplementedError` throw.
- [ ] Verify `getIntegrationPoints()` is a pure function returning a static object (no async, no side effects, no external calls).
- [ ] Verify the research document `docs/integrations/github_pr_reviewer.md` references the GitHub Checks API documentation and is written for an AI agent audience (authoritative, no fluff, uses Mermaid for the webhook flow diagram).
- [ ] Verify the snapshot test for `IntegrationPointsManifest` is committed (not `.gitignore`d) so future changes are caught.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/integrations/github/__tests__/"` and confirm all tests pass.
- [ ] Run `npm test` to confirm no regressions.

## 5. Update Documentation
- [ ] Create `src/integrations/github/github.agent.md` documenting: the `GitHubPRReviewerService` stub, the `IntegrationPointsManifest` shape, how to extend the service, and a reference to `9_ROADMAP-FUTURE-003`.
- [ ] Add a `## Future: Automated PR Reviewer (9_ROADMAP-FUTURE-003)` section to `docs/FUTURE_ROADMAP.md` with a Mermaid sequence diagram showing the proposed webhook → agent → GitHub Checks API flow:
  ```mermaid
  sequenceDiagram
    GitHub->>devs Webhook: POST /webhook (pull_request.opened)
    devs Webhook->>devs Agent: trigger code review
    devs Agent->>GitHub Checks API: create check run
    devs Agent->>LLMProvider: generateText(diff + review prompt)
    LLMProvider-->>devs Agent: review comments
    devs Agent->>GitHub Checks API: update check run with annotations
  ```

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="src/integrations/github/__tests__/" --json --outputFile=test-results/github-pr-reviewer.json` and verify `numFailedTests === 0`.
- [ ] Run `node -e "const {GitHubPRReviewerConfigSchema} = require('./dist/integrations/github'); const r = GitHubPRReviewerConfigSchema.safeParse({enabled:true}); process.exit(r.success ? 1 : 0);"` and confirm exit code `0` (schema rejects `enabled: true`).
