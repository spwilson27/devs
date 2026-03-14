# Task: UI Design Subsystems — Themes, Colors, Styles, Typography, and Strings (Sub-Epic: 01_core_grpc_server_and_infrastructure)

## Covered Requirements
- [UI-DES-THEME-001], [UI-DES-THEME-002], [UI-DES-THEME-003], [UI-DES-THEME-004], [UI-DES-THEME-005], [UI-DES-THEME-006], [UI-DES-THEME-007], [UI-DES-THEME-008], [UI-DES-THEME-009], [UI-DES-THEME-010], [UI-DES-THEME-011], [UI-DES-THEME-012], [UI-DES-THEME-013], [UI-DES-THEME-014], [UI-DES-THEME-015], [UI-DES-THEME-016], [UI-DES-THEME-017], [UI-DES-THEME-018], [UI-DES-THEME-019], [UI-DES-THEME-020], [UI-DES-THEME-021], [UI-DES-STYLE-001], [UI-DES-STYLE-002], [UI-DES-STYLE-003], [UI-DES-STYLE-004], [UI-DES-STYLE-005], [UI-DES-FONT-001], [UI-DES-FONT-002], [UI-DES-FONT-003], [UI-DES-LABEL-001], [UI-DES-LABEL-002], [UI-DES-LABEL-003], [UI-DES-ANSI-001], [UI-DES-ANSI-002], [UI-DES-ANSI-003], [UI-DES-ANSI-004], [UI-DES-ANSI-005], [UI-DES-ELAPSED-001], [UI-DES-ELAPSED-002], [UI-DES-ELAPSED-003], [UI-DES-STR-001], [UI-DES-STR-002], [UI-DES-STR-003], [UI-DES-STR-010], [UI-DES-STR-011], [UI-DES-STR-012], [UI-DES-STR-013], [UI-DES-STR-014], [UI-DES-STR-015], [UI-DES-STR-016], [UI-DES-STR-017], [UI-DES-STR-018], [UI-DES-STR-019], [UI-DES-STR-020], [UI-DES-STR-021], [UI-DES-STR-022], [UI-DES-STR-023], [UI-DES-STR-024], [UI-DES-PHI-001], [UI-DES-PHI-002], [UI-DES-PHI-003], [UI-DES-PHI-004], [UI-DES-PHI-005], [UI-DES-PHI-006], [UI-DES-PHI-007], [UI-DES-PHI-008], [UI-DES-PHI-009], [UI-DES-PHI-010], [UI-DES-PHI-011], [UI-DES-PHI-012], [UI-DES-PHI-013], [UI-DES-PHI-014], [UI-DES-PHI-015], [UI-DES-PHI-016], [UI-DES-PHI-017], [UI-DES-PHI-018], [UI-DES-PHI-019], [UI-DES-PHI-020], [UI-DES-PHI-021], [UI-DES-PHI-022], [UI-DES-PHI-023], [UI-DES-PHI-024], [UI-DES-PHI-025], [UI-DES-PHI-026], [UI-DES-BR-001], [UI-DES-BR-002], [UI-DES-BR-003], [UI-DES-BR-004], [UI-DES-BR-010], [UI-DES-BR-011], [UI-DES-BR-012], [UI-DES-BR-013], [UI-DES-BR-020], [UI-DES-BR-021], [UI-DES-BR-022], [UI-DES-BR-030], [UI-DES-BR-031], [UI-DES-BR-032], [UI-DES-BR-033], [UI-DES-TRUNC-001], [UI-DES-TRUNC-002], [UI-DES-TRUNC-003], [UI-DES-CLI-001], [UI-DES-CLI-002], [UI-DES-CLI-003], [UI-DES-CLI-004], [UI-DES-CLI-005]

## Dependencies
- depends_on: ["43_ui_design_system_foundation.md"]
- shared_components: ["devs-tui (consumer)", "devs-cli (consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/tests/theme_test.rs` with tests for: default theme (THEME-001), dark theme (THEME-002), light theme (THEME-003), theme switching (THEME-004), custom theme loading (THEME-005 to THEME-010), ANSI 16-color compatibility (THEME-011 to THEME-015), 256-color support (THEME-016 to THEME-018), true color support (THEME-019 to THEME-021).
- [ ] Write tests for style and font: consistent style application (STYLE-001 to 005), monospace font assumption (FONT-001 to 003), label formatting (LABEL-001 to 003).
- [ ] Write tests for ANSI rendering: escape sequence generation (ANSI-001 to 005).
- [ ] Write tests for elapsed time formatting: seconds (ELAPSED-001), minutes:seconds (ELAPSED-002), hours:minutes:seconds (ELAPSED-003).
- [ ] Write tests for string formatting: status strings (STR-001 to 003), error strings (STR-010 to 015), help strings (STR-016 to 020), placeholder strings (STR-021 to 024).
- [ ] Write tests for golden ratio layout: phi calculation (PHI-001 to 005), split proportions (PHI-006 to 015), nested phi layouts (PHI-016 to 020), phi adaptation to terminal size (PHI-021 to 026).
- [ ] Write tests for design business rules: BR-001 to BR-004 (layout rules), BR-010 to BR-013 (component rules), BR-020 to BR-022 (interaction rules), BR-030 to BR-033 (rendering rules).
- [ ] Write tests for truncation: ellipsis truncation (TRUNC-001), middle truncation for paths (TRUNC-002), truncation at word boundaries (TRUNC-003).

## 2. Task Implementation
- [ ] Implement theme system with default, dark, and light themes.
- [ ] Implement ANSI 16-color, 256-color, and true color support with graceful degradation.
- [ ] Implement golden ratio (phi = 1.618) layout calculations.
- [ ] Implement string formatting module for status, error, help, and placeholder strings.
- [ ] Implement elapsed time formatting with automatic unit selection.
- [ ] Implement text truncation with ellipsis, middle truncation, and word boundary awareness.
- [ ] Implement design business rules enforcement in the component rendering layer.

## 3. Code Review
- [ ] Verify theme colors are defined as named constants, not inline values.
- [ ] Confirm golden ratio calculations are precise (phi = (1 + sqrt(5)) / 2).
- [ ] Ensure truncation never produces strings longer than the available width.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- theme` and `cargo test -p devs-tui -- phi` and confirm all pass.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations for all 105 requirements.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.
