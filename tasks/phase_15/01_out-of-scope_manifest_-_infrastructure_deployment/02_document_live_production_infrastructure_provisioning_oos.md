# Task: Document Live Production Infrastructure Provisioning Out-of-Scope Enforcement (Sub-Epic: 01_Out-of-Scope Manifest - Infrastructure & Deployment)

## Covered Requirements
- [1_PRD-REQ-OOS-002]

## 1. Initial Test Written
- [ ] In `src/oos/__tests__/manifest.test.ts`, add an assertion that `OUT_OF_SCOPE_ITEMS` contains an entry with:
  - `id: "1_PRD-REQ-OOS-002"`
  - `category: "Infrastructure & Deployment"`
  - `title: "Live Production Infrastructure Provisioning"`
  - A non-empty `rationale` field.
  - `enforcement` array containing at least `"ScopeGuard"` and `"command_interceptor"`.
- [ ] In `src/oos/__tests__/command-interceptor.test.ts`, write unit tests for `CommandInterceptor` from `src/oos/command-interceptor.ts`:
  - `CommandInterceptor.isProhibited("terraform apply -auto-approve")` returns `true`.
  - `CommandInterceptor.isProhibited("aws ec2 run-instances")` returns `true`.
  - `CommandInterceptor.isProhibited("gcloud compute instances create")` returns `true`.
  - `CommandInterceptor.isProhibited("kubectl apply -f deployment.yaml")` returns `true`.
  - `CommandInterceptor.isProhibited("npm run build")` returns `false`.
  - `CommandInterceptor.isProhibited("docker build .")` returns `false` (build is allowed; deploy is not).
  - `CommandInterceptor.getBlockedReason("terraform apply")` returns a string referencing `"1_PRD-REQ-OOS-002"`.
- [ ] In `src/oos/__tests__/command-interceptor.test.ts`, write an integration test that mocks the agent shell-execution pathway and asserts that any attempt to run a prohibited deployment command is blocked before reaching the shell, with a rejection message logged to the audit trail.

## 2. Task Implementation
- [ ] Add the `1_PRD-REQ-OOS-002` entry to `OUT_OF_SCOPE_ITEMS` in `src/oos/manifest.ts`:
  ```typescript
  {
    id: "1_PRD-REQ-OOS-002",
    category: "Infrastructure & Deployment",
    title: "Live Production Infrastructure Provisioning",
    rationale: "devs will not execute commands that provision or modify live cloud infrastructure (e.g., terraform apply, aws CLI deploy, kubectl apply to production clusters). Generated IaC code (Terraform, Pulumi, CDK) is an acceptable artifact, but its execution against real environments is the user's responsibility. This boundary prevents irreversible side-effects in production environments.",
    enforcement: ["ScopeGuard", "command_interceptor", "agent_shell_wrapper"]
  }
  ```
- [ ] Create `src/oos/command-interceptor.ts`:
  - Define `PROHIBITED_DEPLOYMENT_PATTERNS: RegExp[]` covering:
    - `terraform apply`, `terraform destroy`
    - `aws .*deploy`, `aws ec2 run-instances`, `aws ecs update-service`
    - `gcloud compute.*create`, `gcloud run deploy`
    - `kubectl apply`, `kubectl delete`, `kubectl rollout`
    - `az webapp deploy`, `az aks create`
    - `pulumi up`, `cdk deploy`
    - `heroku releases:output`
  - Export `CommandInterceptor` object with:
    - `isProhibited(command: string): boolean` — tests command against all patterns.
    - `getBlockedReason(command: string): string` — returns `"[OOS: 1_PRD-REQ-OOS-002] Command blocked: '<command>' would provision live infrastructure. devs does not execute production deployment commands."`.
- [ ] Update `src/agents/shell-wrapper.ts` (or create it):
  - Wrap all agent-initiated shell command executions through `CommandInterceptor.isProhibited`.
  - If prohibited, throw a `ProhibitedCommandError` with the reason from `CommandInterceptor.getBlockedReason`, and write an entry to the audit log at `logs/oos-violations.log` with timestamp, command attempted, and OOS ID.
  - If not prohibited, proceed with execution.
- [ ] Update `src/oos/scope-guard.ts`:
  - Add `"1_PRD-REQ-OOS-002"` to the `isOutOfScope` type check list for request types like `"infrastructure_provisioning"` and `"cloud_deploy"`.

## 3. Code Review
- [ ] Verify `PROHIBITED_DEPLOYMENT_PATTERNS` covers all major cloud providers (AWS, GCP, Azure, Heroku, Fly.io variants) — add any missing patterns.
- [ ] Verify `ProhibitedCommandError` extends a base `DevsError` class and includes the OOS ID in its `code` field.
- [ ] Confirm the shell-wrapper is the single chokepoint for all agent shell executions — there must be no direct `exec`/`spawn` calls outside of it.
- [ ] Confirm audit log writes are non-blocking (fire-and-forget or async) so a log failure does not crash the agent.
- [ ] Confirm `docker build` and `docker run` (local) are explicitly NOT blocked, since building local images for testing is within scope.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/oos/__tests__/command-interceptor"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="src/agents/shell-wrapper"` and confirm integration tests pass.
- [ ] Run `npm test -- --testPathPattern="src/oos/__tests__/manifest"` to confirm the new manifest entry passes assertion tests.
- [ ] Run `npm run lint` on all modified files.

## 5. Update Documentation
- [ ] Create `src/oos/command-interceptor.agent.md`: List all prohibited command patterns, explain how to add new patterns, and document the audit log format.
- [ ] Create `src/agents/shell-wrapper.agent.md`: Document the shell-wrapper contract, ProhibitedCommandError schema, and audit log location.
- [ ] Update `docs/architecture/out-of-scope.md`: Add `1_PRD-REQ-OOS-002` with full rationale and a note that generated IaC artifacts (files) are allowed but their execution is not.
- [ ] Update `docs/agent-memory/phase_15_decisions.md`: Record that the `CommandInterceptor` is the enforcement mechanism for OOS-002 and describe the audit log format.

## 6. Automated Verification
- [ ] Run `node scripts/verify-oos-manifest.js --req-id="1_PRD-REQ-OOS-002"` and assert exit code `0`.
- [ ] Run `node scripts/verify-command-interceptor.js` (create if absent): script attempts to call `CommandInterceptor.isProhibited` with known-prohibited commands (`terraform apply`, `kubectl apply`) and asserts both return `true`, exiting with code `0` on success.
- [ ] In CI, assert `grep -r "1_PRD-REQ-OOS-002" src/oos/manifest.ts` exits with code `0`.
- [ ] Run `npm test -- --coverage --testPathPattern="src/oos/command-interceptor"` and assert coverage ≥ 90%.
