# Task: Initialize CHANGELOG with Non-Goals and Create Post-MVP Tracking Issues (Sub-Epic: 045_Detailed Domain Specifications (Part 10))

## Covered Requirements
- [1_PRD-REQ-079], [1_PRD-REQ-080]

## Dependencies
- depends_on: [none]
- shared_components: [Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create `tests/phase_0/test_non_goals_documentation.rs` (or a shell-based test in `tests/verify_non_goals.sh` if Rust test infra is not yet available).
- [ ] **Test 1 — CHANGELOG Non-Goals section exists** (`test_changelog_lists_non_goals`): Assert that `CHANGELOG.md` exists at the repo root. Parse it and assert it contains a section header matching `## Non-Goals` (or `### Non-Goals` under an MVP release heading). Assert that the section body contains all five non-goal keywords: `GUI`, `web API`, `authentication`, `secrets manager`, `automated triggers` (case-insensitive substring match).
- [ ] **Test 2 — Post-MVP tracking document exists** (`test_post_mvp_tracking_issues`): Assert that `docs/plan/post-mvp-tracking.md` exists. Assert it contains exactly five H2 or H3 sections, one per non-goal: "GUI", "Web API / REST Interface", "Client Authentication", "External Secrets Manager", "Automated Workflow Triggers". Each section must contain at least one sentence of description and a back-reference to the PRD (e.g., mention of `1_PRD-REQ-` or the non-goal text from the PRD).
- [ ] Add `// Covers: 1_PRD-REQ-079` to Test 1 and `// Covers: 1_PRD-REQ-080` to Test 2.

## 2. Task Implementation
- [ ] Create `CHANGELOG.md` at the repository root with an `# MVP Release` section containing a `## Non-Goals` sub-section. List all five non-goals verbatim from the PRD Non-Goals section:
    1. No GUI (post-MVP)
    2. No web API / REST interface (post-MVP)
    3. No client authentication (post-MVP; server is designed for local / trusted-network use in MVP)
    4. No external secrets manager integration (post-MVP)
    5. No automated workflow triggers (cron, inbound webhook, file-watch) — manual submission only
- [ ] Create `docs/plan/post-mvp-tracking.md` with one section per non-goal. Each section must include: (a) a brief description of the deferred feature, (b) rationale for deferral, (c) back-reference to the PRD requirement that classified it as a non-goal, and (d) any known architectural considerations for future implementation.
- [ ] Ensure neither file contains placeholder text like "TODO" or "TBD".

## 3. Code Review
- [ ] Verify the changelog language is professional, factual, and sets clear user expectations about what is not included in MVP.
- [ ] Verify the tracking document provides enough context for a future developer (human or AI) to pick up the deferred feature without re-reading the full PRD.
- [ ] Confirm the five non-goals match exactly those listed in the PRD "Non-Goals (MVP)" section.

## 4. Run Automated Tests to Verify
- [ ] Run the test(s) created in step 1 (`./do test` or `sh tests/verify_non_goals.sh`) and confirm they pass.

## 5. Update Documentation
- [ ] No additional documentation updates needed — the task itself produces the documentation artifacts.

## 6. Automated Verification
- [ ] Run `./do test` (or the traceability scanner) and confirm that `1_PRD-REQ-079` and `1_PRD-REQ-080` appear as covered in the traceability report.
- [ ] Verify no regressions by running `./do lint` if available.
