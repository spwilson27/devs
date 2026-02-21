# Task: Implement Roadmap Gate (Post-Phase 5) Evaluation (Sub-Epic: 06_Roadmap_Planner_And_Gates)

## Covered Requirements
- [9_ROADMAP-REQ-003]

## 1. Initial Test Written
- [ ] Create unit tests at tests/phase_7/test_roadmap_gate.py using pytest.
  - test_gate_blocks_when_rti_below_threshold: Provide a phase_status fixture with rti=0.95, distiller_completed=True, approvals=['reviewer'] and assert evaluate_roadmap_gate returns {'allowed': False, 'reasons': ['RTI < 1.0']}
  - test_gate_blocks_on_missing_approval: Provide rti>=1.0 but missing required HITL approvals and assert allowed=False with reason 'User approval missing'.
  - test_gate_allows_when_all_conditions_met: Provide rti>=1.0, distiller_completed=True, approvals include required roles -> assert allowed=True and reasons=[]
- [ ] Stub DistillerAgent and dependency analyzer with deterministic fixtures to simulate deadlock/no-deadlock situations.

## 2. Task Implementation
- [ ] Implement src/roadmap/gates.py with function evaluate_roadmap_gate(phase_status: Dict, config: Optional[Dict]=None) -> Dict:
  - Validate keys in phase_status: 'distiller_completed' (bool), 'rti' (float), 'approvals' (list of roles), 'deadlock_detected' (bool).
  - Rules (configurable via config dict):
    - If distiller_completed is False -> allowed=False, reason 'Distiller incomplete'.
    - If rti < 1.0 -> allowed=False, reason 'RTI < 1.0'.
    - If required HITL approvals missing -> allowed=False, reason 'User approval missing'.
    - If deadlock_detected True -> allowed=False, reason 'Dependency deadlock'.
    - Otherwise allowed=True.
  - Return structure: {'allowed': bool, 'reasons': List[str], 'meta': {'checked_at': ISO8601 timestamp}}
- [ ] Add a small CLI script scripts/check_roadmap_gate.py that loads a JSON fixture and prints a machine-readable result.

## 3. Code Review
- [ ] Confirm evaluate_roadmap_gate is pure and side-effect-free for unit testing.
- [ ] Ensure error messages are structured with both human-readable and machine code (e.g., code: 'RTI_LOW', message: 'RTI < 1.0').
- [ ] Ensure test coverage includes all branches and that config-driven thresholds are exercised.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/phase_7/test_roadmap_gate.py
- [ ] Execute scripts/check_roadmap_gate.py against fixtures in tests/fixtures/ to verify outputs match expectations.

## 5. Update Documentation
- [ ] Add docs/roadmap/gates.md that lists gate criteria, decision matrix, and recommended remediation steps for common failure reasons.
- [ ] Document the CLI usage and sample JSON fixture schema.

## 6. Automated Verification
- [ ] Add ci/verify_roadmap_gate.sh to run unit tests and then run the CLI script against canonical fixtures, exiting non-zero on mismatch so CI can catch regressions.
