# Task: CLI Submit Input Parameter Parsing (Sub-Epic: 053_Detailed Domain Specifications (Part 18))

## Covered Requirements
- [2_TAS-REQ-137]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-core/src/cli_utils.rs` (or a dedicated `input_parsing.rs` module) for input parameter parsing.
- [ ] Test Cases:
    - `key=value`: Correctly split into `"key"` and `"value"`.
    - `key=value=more`: Correctly split on the *first* `=` only (result: `"key"`, `"value=more"`).
    - `key_only`: Reject with `ValidationError` (exit code 4 mapping).
    - Duplicate keys (`k1=v1`, `k1=v2`): Reject with `ValidationError`.
    - Multiple `--input` flags: Ensure they can be accumulated and then validated for uniqueness.

## 2. Task Implementation
- [ ] Implement a `parse_input_parameters` function in `crates/devs-core`.
- [ ] Logic:
    - Iterate over raw strings (e.g. `Vec<String>`).
    - For each string, find the index of the first `=`.
    - Error if not found.
    - Extract `key` (substring before first `=`) and `value` (substring after).
    - Insert into a `HashMap<String, String>`.
    - Return `Err` if the key already exists in the map.
- [ ] Use `ValidationError` from `devs-core` for errors.

## 3. Code Review
- [ ] Verify that the split is only on the *first* `=` character.
- [ ] Ensure that duplicate key detection is robust.
- [ ] Ensure that it integrates cleanly with the existing `ValidationError` multi-error reporting.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and verify all input parsing test cases pass.

## 5. Update Documentation
- [ ] Document the `parse_input_parameters` utility in the module documentation.

## 6. Automated Verification
- [ ] Run `./do lint` and ensure no documentation or formatting violations are present.
