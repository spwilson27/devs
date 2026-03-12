# Task: Enforce Sequential Crate Presubmit (Sub-Epic: 28_Risk 009 Verification)

## Covered Requirements
- [RISK-009-BR-002]

## Dependencies
- depends_on: [none]
- shared_components: [./do]

## 1. Initial Test Written
- [ ] Create a Python-based integration test in `.tools/tests/test_presubmit_sequentiality.py` that mocks a multi-crate repository structure.
- [ ] The test should verify that a simulated `./do presubmit` fails if a crate's dependencies are modified and committed without its own presubmit passing in that commit or a previous one.
- [ ] Implement a mock crate registry that tracks the "presubmit status" of each crate and its dependency tree.

## 2. Task Implementation
- [ ] Update the `./do` script or add a helper script in `.tools/` to calculate the crate dependency graph of the workspace.
- [ ] Implement a check that uses `git diff` and `git log` to ensure that for any commit during the "Bootstrap Phase" (defined by a marker file or git tag), no crate was worked on unless all its dependencies in the graph were already in a "presubmit-passed" state in the repository history.
- [ ] Integrate this check into `./do lint` or `./do presubmit`.
- [ ] Since we are in Phase 5, this task also involves defining the "Bootstrap Phase" range in the repository history to allow retroactive verification.

## 3. Code Review
- [ ] Ensure the dependency graph calculation is robust (e.g., using `cargo metadata`).
- [ ] Verify that the git history traversal is efficient and doesn't significantly slow down `./do presubmit`.
- [ ] Confirm that the "Bootstrap Phase" range is clearly defined and documented.

## 4. Run Automated Tests to Verify
- [ ] Execute `pytest .tools/tests/test_presubmit_sequentiality.py` and ensure it passes.
- [ ] Run `./do presubmit` locally to confirm the check doesn't trigger on current clean state.

## 5. Update Documentation
- [ ] Document the sequential presubmit enforcement policy in `docs/architecture/CI.md` or similar.
- [ ] Update `GEMINI.md` to reflect this new gate for any future work on core crates.

## 6. Automated Verification
- [ ] Verify the requirement `[RISK-009-BR-002]` is linked in the code using the traceability tool: `python3 .tools/verify_requirements.py --req RISK-009-BR-002`.
