# Task: Implement Dependency Collision Detection and Resolution Workflow (Sub-Epic: 28_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-119]

## 1. Initial Test Written
- [ ] Create unit tests at tests/deps/test_dependency_collision.py.
  - test_detects_semver_conflict: create two temporary package manifests (e.g., package.json or pyproject.toml) that require conflicting semver ranges for the same transitive dependency and assert DependencyCollisionChecker.detect_conflicts() returns a structured conflict describing the packages, required ranges, and recommended pins.
  - test_lockfile_enforcement_fails_on_mismatch: simulate a modified lockfile that does not match the manifest and assert the CI pre-check script scripts/check_deps.py exits non-zero with a JSON report.
  - test_resolution_plan_generates_pin_or_vendor: given a conflict, assert generate_resolution_plan() returns at least one non-destructive resolution suggestion (pin version, vendorize, or use isolated env).

## 2. Task Implementation
- [ ] Implement dependency collision tooling in src/risks/dependency_collision.py and a CI pre-check:
  - src/risks/dependency_collision.py: DependencyCollisionChecker
    - detect_conflicts(manifests: List[Path]) -> List[Conflict]
    - compute_transitive_graph(manifest: Path) -> DependencyGraph
    - generate_resolution_plan(conflicts: List[Conflict]) -> ResolutionPlan (JSON)
  - scripts/check_deps.py: CLI to run checks on repo root and print machine-readable JSON of conflicts; exit non-zero when unresolved collisions are present.
  - Use existing packaging libraries (python: packaging.version / node: semver lib via a lightweight shim) and ensure code isolates any third-party invocations so the checker is deterministic in tests.
  - Add a recommended workflow to vendorize libraries under vendor/ or pin via lockfile update using the CommitNode for an atomic update.

## 3. Code Review
- [ ] Verify:
  - The checker uses canonical semver parsing and avoids naive string compares.
  - Generated resolution plans are conservative (prefer pinning and human review) and include clear reproduction steps.
  - The pre-check script is safe to run in CI: it does not modify files unless run with --apply and requires an explicit flag to auto-commit.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/deps/test_dependency_collision.py
- [ ] Run CI pre-check locally: python scripts/check_deps.py --report conflicts.json && jq '.conflicts | length' conflicts.json

## 5. Update Documentation
- [ ] Add docs/risks/dependency_collisions.md documenting:
  - Types of collisions detected and severity levels.
  - Recommended remediation strategies and sample CommitNode usage for atomic lockfile updates.
  - How DeveloperAgent should respond (create a remediation task, vendorize, or block the commit).

## 6. Automated Verification
- [ ] Add tests/scripts/verify_dependency_checker.py that runs the checker against tests/fixtures/sample_repos/ with known collisions and asserts the produced JSON matches a golden file.
