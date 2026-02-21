# Task: Implement Strategy Pivot Directive generator and tests (Sub-Epic: 20_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-082]

## 1. Initial Test Written
- [ ] Create tests at tests/security/test_strategy_pivot.py and import generate_pivot_directive from src/security/strategy_pivot.py.
- [ ] Write unit tests:
  - test_pivot_not_generated_for_non_repeating_errors: pass three distinct hashes and assert generate_pivot_directive returns None or {"action": "NONE"}.
  - test_pivot_generated_for_repeating_hashes: pass three equal hashes and assert the returned directive contains keys: action: "STRATEGY_PIVOT", instructions: str, ignore_previous_attempts: True.
  - test_instructions_is_actionable: verify the instructions string contains the phrase "Reason from First Principles" and includes a short checklist for root-cause analysis.
- [ ] Tests must be fast and not depend on the full DeveloperAgent runtime; the pivot generator must be a pure function.

## 2. Task Implementation
- [ ] Implement src/security/strategy_pivot.py exporting:
  - generate_pivot_directive(hashes: List[str]) -> Optional[Dict]
    - If last N hashes (N==3) are identical, return a dictionary:
      {
        "action": "STRATEGY_PIVOT",
        "instructions": "Reason from First Principles: <short checklist> ...",
        "ignore_previous_attempts": True,
        "triggered_by": hashes[-1]
      }
    - Otherwise return None or {"action": "NONE"}.
- [ ] Keep the instruction text concise, machine-parseable (JSON-friendly), and include at least 3 bullet checklist items (re-state assumptions, minimal repro, propose a new minimal implementation approach).

## 3. Code Review
- [ ] Confirm the generator is pure and side-effect free.
- [ ] Ensure the returned directive is JSON-serializable, includes the required keys, and contains actionable instructions that can be presented to DeveloperAgent.
- [ ] Validate unit tests cover negative and positive cases and the instructions content meets the expected pattern.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/security/test_strategy_pivot.py -q` and ensure tests fail before implementation and pass after implementation.

## 5. Update Documentation
- [ ] Document the Strategy Pivot Directive format and usage in docs/security/strategy_pivot.md including examples of directive JSON.

## 6. Automated Verification
- [ ] Add scripts/verify_strategy_pivot.sh that runs the strategy pivot tests and prints the generated directive for a canonical repeating-hash input; fail the script if directive is missing or not well-formed.
