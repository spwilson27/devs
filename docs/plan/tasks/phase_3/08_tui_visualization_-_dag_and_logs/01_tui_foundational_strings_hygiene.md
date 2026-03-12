# Task: TUI Foundational Strings & ASCII Hygiene (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-001], [7_UI_UX_DESIGN-REQ-002], [7_UI_UX_DESIGN-REQ-003], [7_UI_UX_DESIGN-REQ-010], [7_UI_UX_DESIGN-REQ-011], [7_UI_UX_DESIGN-REQ-012], [7_UI_UX_DESIGN-REQ-013], [7_UI_UX_DESIGN-REQ-014], [7_UI_UX_DESIGN-REQ-455], [7_UI_UX_DESIGN-REQ-456], [7_UI_UX_DESIGN-REQ-457], [7_UI_UX_DESIGN-REQ-458], [7_UI_UX_DESIGN-REQ-459], [7_UI_UX_DESIGN-REQ-461], [7_UI_UX_DESIGN-REQ-462], [7_UI_UX_DESIGN-REQ-463], [7_UI_UX_DESIGN-REQ-464], [7_UI_UX_DESIGN-REQ-465], [7_UI_UX_DESIGN-REQ-466], [7_UI_UX_DESIGN-REQ-467], [7_UI_UX_DESIGN-REQ-468], [7_UI_UX_DESIGN-REQ-469]

## Dependencies
- depends_on: [none]
- shared_components: [devs-tui, devs-cli, devs-mcp-bridge]

## 1. Initial Test Written
- [ ] Write unit tests in `crates/devs-tui/src/strings.rs` (and corresponding modules in other crates) to verify:
    - All `STATUS_*` constants are exactly 4 bytes (e.g., `"RUN "`, `"SUCC"`, `"FAIL"`, `"PEND"`).
    - All `DAG_*` constants are exactly 1 byte (e.g., `"-"`, `">"`, `"|"`).
    - All `ERR_` constants begin with machine-stable prefixes (e.g., `"ERR_"`).
    - No byte value in the U+0080–U+FFFF range (non-ASCII) exists in any constant.
    - Pointer equality assertion for `render_utils::stage_status_label`.
- [ ] Add a `strings_hygiene` lint rule to the `./do lint` script (or a new python script in `.tools/`) that scans `.rs` files and ensures no string literals exist outside of `strings.rs` modules (excluding the `strings.rs` modules themselves and tests).

## 2. Task Implementation
- [ ] Create `crates/devs-tui/src/strings.rs` and define mandatory constants:
    - `STATUS_RUN_`, `STATUS_SUCC`, `STATUS_FAIL`, `STATUS_PEND`.
    - `DAG_H`, `DAG_V`, `DAG_CORNER`, `DAG_ARROW`, `DAG_SPACE`.
    - Error strings with machine-stable prefixes.
- [ ] Create `crates/devs-cli/src/strings.rs` and `crates/devs-mcp-bridge/src/strings.rs` with their respective mandatory constants (`CMD_*`, `ERR_*`).
- [ ] Implement `render_utils::stage_status_label(s: StageStatus) -> &'static str` in `devs-tui` that returns the pre-defined constants.
- [ ] Add `const` assertion blocks in `strings.rs` to enforce byte length constraints at compile time where possible.
- [ ] Ensure all `pub const` have `///` doc comments.

## 3. Code Review
- [ ] Verify that `STATUS_RUN_` has the trailing space: `"RUN "`.
- [ ] Verify that only ASCII characters (U+0020–U+007E) are used in all structural constants.
- [ ] Ensure `render_utils` uses pointer equality in its internal tests for label mapping.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-tui -- strings`
- [ ] `cargo test -p devs-cli -- strings`
- [ ] `cargo test -p devs-mcp-bridge -- strings`
- [ ] `./do lint` (to verify strings hygiene)

## 5. Update Documentation
- [ ] Document the mandatory string prefix convention and the ASCII-only constraint in `crates/devs-tui/README.md`.

## 6. Automated Verification
- [ ] Run `grep -P '[^\x00-\x7F]' crates/*/src/strings.rs` and ensure it exits with code 1 (no non-ASCII characters).
- [ ] Run `./do lint` and ensure it catches an intentional inline string literal violation.
