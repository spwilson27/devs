# Task: Document Architectural Non-Goals and Policy (Sub-Epic: 040_Detailed Domain Specifications (Part 5))

## Covered Requirements
- [1_PRD-REQ-054]

## Dependencies
- depends_on: [none]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create a check (e.g., in a markdown linter or a script) that verifies the existence of a `docs/ARCH_POLICY.md` file (or similar) containing the text of requirement [1_PRD-REQ-054].
- [ ] The test should FIRST fail if the document or the specific non-goals list is missing.

## 2. Task Implementation
- [ ] Create `docs/ARCH_POLICY.md` in the workspace root.
- [ ] Explicitly list all non-goals for the MVP as defined in [1_PRD-REQ-054]:
  - No GUI (post-MVP)
  - No web API / REST interface (post-MVP)
  - No client authentication
  - No external secrets manager integration
  - No automated workflow triggers (cron, inbound webhook, file-watch)
- [ ] Define the rationale for these non-goals (e.g., "focus on core headless stability and gRPC interface").
- [ ] Ensure this document is linked or referenced in the project's top-level README or developer onboarding materials.

## 3. Code Review
- [ ] Verify that the listed non-goals are consistent with the rest of the PRD and project specs.
- [ ] Ensure that the documentation clearly states that these are *MVP* non-goals, leaving the door open for post-MVP enhancements (as per [1_PRD-REQ-058]).

## 4. Run Automated Tests to Verify
- [ ] Run the check created in step 1 and ensure it passes.
- [ ] Verify that the file exists and has the correct content.

## 5. Update Documentation
- [ ] Link `docs/ARCH_POLICY.md` from the root `README.md` (if it exists) or update `.agent/MEMORY.md` with the new documentation path.

## 6. Automated Verification
- [ ] Run `./do lint` and verify that any markdown-lint or custom check correctly picks up the new policy document.
- [ ] Verify that the traceability script (from Sub-Epic 005) finds the requirement ID in the new document.
