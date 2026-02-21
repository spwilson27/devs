# Task: Document Project Hosting & PaaS Out-of-Scope Declaration & Artifact Export Boundary (Sub-Epic: 01_Out-of-Scope Manifest - Infrastructure & Deployment)

## Covered Requirements
- [1_PRD-REQ-OOS-020]

## 1. Initial Test Written
- [ ] In `src/oos/__tests__/manifest.test.ts`, add an assertion that `OUT_OF_SCOPE_ITEMS` contains an entry with:
  - `id: "1_PRD-REQ-OOS-020"`
  - `category: "Infrastructure & Deployment"`
  - `title: "Project Hosting & PaaS Functionality"`
  - A non-empty `rationale` string.
  - `enforcement` array containing at least `"ScopeGuard"` and `"export_boundary_guard"`.
- [ ] In `src/oos/__tests__/export-boundary-guard.test.ts`, write unit tests for `ExportBoundaryGuard` from `src/oos/export-boundary-guard.ts`:
  - `ExportBoundaryGuard.isProhibited({ action: "deploy_to_vercel" })` returns `true`.
  - `ExportBoundaryGuard.isProhibited({ action: "host_on_netlify" })` returns `true`.
  - `ExportBoundaryGuard.isProhibited({ action: "push_to_heroku" })` returns `true`.
  - `ExportBoundaryGuard.isProhibited({ action: "register_domain" })` returns `true`.
  - `ExportBoundaryGuard.isProhibited({ action: "export_archive" })` returns `false` (generating a local archive is allowed).
  - `ExportBoundaryGuard.isProhibited({ action: "generate_dockerfile" })` returns `false` (generating deployment artifacts is allowed).
  - `ExportBoundaryGuard.isProhibited({ action: "generate_terraform" })` returns `false` (generating IaC is allowed).
  - `ExportBoundaryGuard.getRejectionMessage()` returns a string containing `"1_PRD-REQ-OOS-020"` and `"hosting"`.
- [ ] In `src/oos/__tests__/export-boundary-guard.test.ts`, write an integration test that mocks the `devs export` command:
  - When `devs export --deploy vercel` is called, the `ExportBoundaryGuard` intercepts, returns a rejection, and the CLI outputs a message containing `"1_PRD-REQ-OOS-020"` with exit code `1`.
  - When `devs export --output ./my-project.zip` is called (local archive export), the guard does NOT intercept, and the export succeeds.

## 2. Task Implementation
- [ ] Add the `1_PRD-REQ-OOS-020` entry to `OUT_OF_SCOPE_ITEMS` in `src/oos/manifest.ts`:
  ```typescript
  {
    id: "1_PRD-REQ-OOS-020",
    category: "Infrastructure & Deployment",
    title: "Project Hosting & PaaS Functionality",
    rationale: "devs is a code generation tool, not a hosting provider or PaaS platform. It will not register domains, configure DNS, deploy to cloud hosting services (Vercel, Netlify, Heroku, Railway, Fly.io), or manage SSL certificates. The output of devs is a local project archive and handover package. Deploying the generated project to any hosting environment is the user's responsibility. devs MAY generate deployment configuration files (Dockerfiles, docker-compose.yml, Terraform, Vercel config JSON) as static artifacts.",
    enforcement: ["ScopeGuard", "export_boundary_guard", "cli_command_validator"]
  }
  ```
- [ ] Create `src/oos/export-boundary-guard.ts`:
  - Define `PROHIBITED_HOSTING_ACTIONS: string[]` = `["deploy_to_vercel", "deploy_to_netlify", "push_to_heroku", "deploy_to_railway", "deploy_to_fly", "host_on_netlify", "register_domain", "configure_dns", "provision_ssl"]`.
  - Define `ALLOWED_EXPORT_ACTIONS: string[]` = `["export_archive", "generate_dockerfile", "generate_terraform", "generate_docker_compose", "generate_vercel_config", "generate_netlify_config", "generate_handover_report"]`.
  - Export `ExportBoundaryGuard` object with:
    - `isProhibited(request: { action: string }): boolean` — returns `true` if `request.action` is in `PROHIBITED_HOSTING_ACTIONS`; returns `false` for actions in `ALLOWED_EXPORT_ACTIONS` or any unrecognized action (fail-open for generation actions, fail-closed for explicit deploy actions).
    - `getRejectionMessage(): string` — returns `"[OOS: 1_PRD-REQ-OOS-020] Project hosting and PaaS deployment are out of scope. devs generates local project archives and deployment configuration files only. Use the generated configs to deploy manually."`.
- [ ] Update `src/cli/commands/export.ts` (or create it):
  - Implement the `devs export` CLI command.
  - Parse the `--deploy <provider>` flag; if present, call `ExportBoundaryGuard.isProhibited({ action: "deploy_to_<provider>" })`.
  - If prohibited, print the rejection message to stderr with OOS ID and exit with code `1`.
  - If `--output <path>` is used (local archive), call the archive generation service and do NOT invoke the guard.
  - On successful export, print the archive path and the handover report location.
- [ ] Update `src/oos/scope-guard.ts`:
  - Add `isOutOfScope` handling for request types `"hosting"`, `"paas_deploy"`, and `"domain_registration"` mapping to `1_PRD-REQ-OOS-020`.

## 3. Code Review
- [ ] Confirm the `devs export` command does NOT attempt any outbound network calls other than what is explicitly triggered by the user (i.e., the local archive export is purely filesystem-based).
- [ ] Verify the `ALLOWED_EXPORT_ACTIONS` list is clearly documented with comments explaining why each action is allowed (artifact generation vs. live deployment).
- [ ] Confirm the CLI `export` command's help text (`--help`) explicitly states what is and is not supported, referencing the OOS boundary.
- [ ] Verify `ExportBoundaryGuard.isProhibited` is called before any network operation in the export pathway.
- [ ] Confirm that generated deployment config files (Dockerfile, Terraform, etc.) are included in the archive output as static text files with no execution side effects.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/oos/__tests__/export-boundary-guard"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="src/cli/commands/export"` and confirm CLI integration tests pass.
- [ ] Run `npm test -- --testPathPattern="src/oos/__tests__/manifest"` and confirm the OOS-020 entry is asserted.
- [ ] Run `npm run lint` on all new and modified files.

## 5. Update Documentation
- [ ] Create `src/oos/export-boundary-guard.agent.md`: Document prohibited hosting actions, allowed artifact generation actions, the fail-open vs. fail-closed design decision, and how to add new cloud providers to the prohibited list.
- [ ] Create `src/cli/commands/export.agent.md`: Document the `devs export` command flags, what the archive contains, where the handover report is generated, and the OOS boundary for deploy flags.
- [ ] Update `docs/architecture/out-of-scope.md`: Add `1_PRD-REQ-OOS-020` with full rationale and a table distinguishing "Allowed Artifacts" (Dockerfile, Terraform files) from "Prohibited Actions" (deploying to cloud providers).
- [ ] Update `docs/user-guide/exporting-projects.md` (create if absent): Document the `devs export` command, what the output archive contains, and how users can deploy the generated project themselves.
- [ ] Update `docs/agent-memory/phase_15_decisions.md`: Record the `ExportBoundaryGuard` pattern, the distinction between artifact generation and hosting, and the `devs export` command architecture.

## 6. Automated Verification
- [ ] Run `node scripts/verify-oos-manifest.js --req-id="1_PRD-REQ-OOS-020"` and assert exit code `0`.
- [ ] Run `node scripts/verify-export-boundary.js` (create if absent): Calls `ExportBoundaryGuard.isProhibited` with `{ action: "deploy_to_vercel" }` (expects `true`) and `{ action: "export_archive" }` (expects `false`). Exits with code `0` on success.
- [ ] In CI, assert `grep -r "1_PRD-REQ-OOS-020" src/oos/manifest.ts` exits with code `0`.
- [ ] Run `npm test -- --coverage --testPathPattern="src/oos/export-boundary-guard"` and assert coverage ≥ 90%.
- [ ] Run the `devs export --help` command in CI and assert the output contains the text `"out of scope"` or `"OOS"` near the `--deploy` flag description.
