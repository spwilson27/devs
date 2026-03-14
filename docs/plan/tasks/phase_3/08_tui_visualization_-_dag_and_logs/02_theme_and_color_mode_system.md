# Task: Theme & Color Mode System (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-025], [7_UI_UX_DESIGN-REQ-026], [7_UI_UX_DESIGN-REQ-027], [7_UI_UX_DESIGN-REQ-028], [7_UI_UX_DESIGN-REQ-030], [7_UI_UX_DESIGN-REQ-031], [7_UI_UX_DESIGN-REQ-037], [7_UI_UX_DESIGN-REQ-038], [7_UI_UX_DESIGN-REQ-039], [7_UI_UX_DESIGN-REQ-040], [7_UI_UX_DESIGN-REQ-041], [7_UI_UX_DESIGN-REQ-042], [7_UI_UX_DESIGN-REQ-043], [7_UI_UX_DESIGN-REQ-044], [7_UI_UX_DESIGN-REQ-045], [7_UI_UX_DESIGN-REQ-046], [7_UI_UX_DESIGN-REQ-047], [7_UI_UX_DESIGN-REQ-048], [7_UI_UX_DESIGN-REQ-049], [7_UI_UX_DESIGN-REQ-050], [7_UI_UX_DESIGN-REQ-051], [7_UI_UX_DESIGN-REQ-052], [7_UI_UX_DESIGN-REQ-053], [7_UI_UX_DESIGN-REQ-054], [7_UI_UX_DESIGN-REQ-055], [7_UI_UX_DESIGN-REQ-056], [7_UI_UX_DESIGN-REQ-057], [7_UI_UX_DESIGN-REQ-058], [7_UI_UX_DESIGN-REQ-059], [7_UI_UX_DESIGN-REQ-064], [7_UI_UX_DESIGN-REQ-065], [7_UI_UX_DESIGN-REQ-066], [7_UI_UX_DESIGN-REQ-067], [7_UI_UX_DESIGN-REQ-068], [7_UI_UX_DESIGN-REQ-069], [7_UI_UX_DESIGN-REQ-076], [7_UI_UX_DESIGN-REQ-077], [7_UI_UX_DESIGN-REQ-078], [7_UI_UX_DESIGN-REQ-079], [7_UI_UX_DESIGN-REQ-080], [7_UI_UX_DESIGN-REQ-081], [7_UI_UX_DESIGN-REQ-082]

## Dependencies
- depends_on: [01_string_constants_and_ascii_hygiene.md]
- shared_components: [devs-core (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/src/theme.rs` (empty). Create `crates/devs-tui/tests/theme_tests.rs`.
- [ ] Write `test_from_env_no_color_unset` — unset `NO_COLOR`, call `Theme::from_env()`, assert `color_mode == ColorMode::Color` (REQ-025).
- [ ] Write `test_from_env_no_color_empty_string` — set `NO_COLOR=""`, assert still `ColorMode::Color` (REQ-025, REQ-082).
- [ ] Write `test_from_env_no_color_set_any_value` — set `NO_COLOR=1`, `NO_COLOR=0`, `NO_COLOR=false`, `NO_COLOR=true`, each asserts `ColorMode::Monochrome` (REQ-082).
- [ ] Write `test_theme_immutable_after_creation` — verify `Theme` has no `&mut self` methods (REQ-081, REQ-026).
- [ ] Write `test_stage_status_style_exhaustive` — match every `StageStatus` variant, verify each returns a `Style` and the match is exhaustive (no wildcard) (REQ-045).
- [ ] Write `test_run_status_style_exhaustive` — same for `RunStatus` (REQ-048).
- [ ] Write `test_monochrome_only_bold_reversed` — in Monochrome mode, verify no style method returns ITALIC, UNDERLINED, BLINK, RAPID_BLINK, CROSSED_OUT, or DIM modifiers (REQ-028, REQ-039, REQ-080).
- [ ] Write `test_color_palette_only_named_16` — verify all Color values returned by theme methods are from the named 16-color ANSI palette (no RGB, no indexed >15) (REQ-041).
- [ ] Write `test_selected_row_uses_reversed` — `theme.selected_row_style()` returns Style with REVERSED modifier (REQ-050, REQ-079).
- [ ] Write `test_no_explicit_background_unselected` — verify unselected row styles use `Color::Reset` as bg (REQ-042, REQ-051).
- [ ] Write `test_selected_plus_status_composition` — verify `Style::patch()` correctly composes REVERSED with status color (REQ-052, REQ-068).
- [ ] Write `test_monochrome_distinguishability` — every `StageStatus` maps to a unique combination of text label + modifier in Monochrome (REQ-069).
- [ ] Write `test_tab_bar_style` — active tab uses BOLD+REVERSED; inactive tabs use default Style (REQ-054, REQ-055).
- [ ] Write `test_log_stream_styling` — stdout vs stderr have distinct styles; stderr is Yellow in Color, SUBDUED in Mono (REQ-057, REQ-058, REQ-078).
- [ ] Write `test_log_truncation_notice_style` — "..logs truncated.." styled correctly (REQ-059).
- [ ] Write `test_help_overlay_style` — help overlay has explicit non-Reset background in Color mode; key names use BOLD (REQ-064, REQ-065).
- [ ] Write `test_four_emphasis_levels` — verify exactly 4 emphasis levels via BOLD/REVERSED modifiers only (REQ-076).
- [ ] Write `test_subdued_monochrome_no_fg` — `theme.style_subdued()` in Monochrome returns Style with no explicit fg (REQ-077).
- [ ] Write `test_no_focus_color_change` — verify no method named `focus_border_style` or similar exists (REQ-053).
- [ ] Write `test_tab_bar_no_border` — tab bar rendering has no border/separator row (REQ-056).
- [ ] Write `test_theme_no_raw_color_export` — verify Theme exposes only semantic methods, not raw Color values (REQ-066).
- [ ] Write `test_no_terminal_capability_query` — grep theme source for TERM, COLORTERM, tput; assert none found (REQ-067).

## 2. Task Implementation
- [ ] Implement `Theme` struct with `color_mode: ColorMode` field (enum `Color`/`Monochrome`).
- [ ] Implement `Theme::from_env()` — reads `NO_COLOR` env var exactly once; non-empty presence activates Monochrome (REQ-025, REQ-026, REQ-027, REQ-038, REQ-082). Returns owned `Theme`.
- [ ] Implement semantic style methods (REQ-037, REQ-066):
  - `stage_status_style(&self, status: &StageStatus) -> Style` — exhaustive match, no wildcard (REQ-045). Color mode: named ANSI colors per status; terminal states get BOLD (REQ-043, REQ-044). Only the STAT cell gets this style (REQ-046).
  - `run_status_style(&self, status: &RunStatus) -> Style` — exhaustive match (REQ-048). Colors in status column only (REQ-049).
  - `selected_row_style(&self) -> Style` — REVERSED modifier (REQ-050, REQ-079).
  - `style_subdued(&self) -> Style` — no fg in Monochrome (REQ-077).
  - `active_tab_style(&self) -> Style` — BOLD+REVERSED (REQ-055).
  - `log_stream_style(&self, stream: LogStream) -> Style` — stderr Yellow/Subdued (REQ-057, REQ-078).
  - `help_overlay_style(&self) -> Style` — explicit bg in Color mode (REQ-064).
  - `help_key_style(&self) -> Style` — BOLD (REQ-065).
  - `connection_status_style(&self, connected: bool) -> Style` — terminal states BOLD (REQ-060 prep).
- [ ] Widgets accept `&Theme` by reference, never store or clone it (REQ-040).
- [ ] ANSI stripping 3-state machine: implement `strip_ansi(input: &str) -> Cow<str>` in `render_utils.rs` (REQ-030). Handle CSI sequences (ESC [). Normalize `\r\n` to `\n`, remove standalone `\r` (REQ-031).
- [ ] Use `Style::patch()` for composition, not `|` operator (REQ-068).
- [ ] Four emphasis levels: Normal (no modifier), Subdued (none in mono), Primary (BOLD), Interactive (REVERSED) (REQ-076).

## 3. Code Review
- [ ] Verify no ITALIC/UNDERLINED/BLINK/DIM modifiers anywhere in theme.rs (REQ-080).
- [ ] Verify no RGB or indexed colors >15 (REQ-041).
- [ ] Verify `Theme` has no `pub` fields exposing raw `Color` values (REQ-066).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --lib theme` and `cargo test -p devs-tui --test theme_tests`.

## 5. Update Documentation
- [ ] Add doc comments to all public methods on `Theme` explaining the color/monochrome behavior.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all theme tests pass. Run `grep -rn "Color::Rgb\|Color::Indexed" crates/devs-tui/src/theme.rs` and verify zero matches.
