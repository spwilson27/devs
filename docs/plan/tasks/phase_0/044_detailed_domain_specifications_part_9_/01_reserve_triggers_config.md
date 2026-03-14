# Task: Reserve [triggers] Config Section with Rejection (Sub-Epic: 044_Detailed Domain Specifications (Part 9))

## Covered Requirements
- [1_PRD-REQ-076]

## Dependencies
- depends_on: []
- shared_components: [devs-config (Consumer)]

## 1. Initial Test Written
- [ ] In `crates/devs-config/tests/` (or `crates/devs-config/src/lib.rs` `#[cfg(test)]` module), write the following tests:
  - `test_triggers_section_present_returns_error`: Parse a TOML string containing a `[triggers]` section (with any content, e.g. `[[triggers.cron]]` with a `workflow` and `schedule` field). Assert that parsing/validation returns an `Err` whose message contains the substring `"[triggers] section is not supported in MVP"`.
  - `test_triggers_section_absent_parses_ok`: Parse a minimal valid `devs.toml` without a `[triggers]` section. Assert that parsing succeeds.
  - `test_triggers_section_empty_returns_error`: Parse a TOML string with `[triggers]` present but empty (no sub-tables). Assert that parsing still returns an error — the mere presence of the section is rejected.
  - `test_triggers_error_message_actionable`: Assert the error message includes guidance: `"Remove it from devs.toml"` (matching the spec's edge case table).
- [ ] Annotate each test with `// Covers: 1_PRD-REQ-076`.

## 2. Task Implementation
- [ ] In the `ServerConfig` serde struct (in `devs-config`), add a field: `triggers: Option<toml::Value>` (or `Option<serde_json::Value>`) decorated with `#[serde(default)]`.
- [ ] After deserialization, in the `validate()` method (or a post-deserialization check), if `self.triggers.is_some()`, return an error: `"[triggers] section is not supported in MVP. Remove it from devs.toml."`.
- [ ] Do NOT implement any trigger parsing, scheduling, or dispatch logic — this is purely a schema reservation with a rejection gate.
- [ ] Ensure the reserved schema shape matches the spec in §5.5.4: `[[triggers.cron]]`, `[[triggers.webhook]]`, `[[triggers.file_watch]]` — the field should accept any TOML value so it doesn't fail on shape, only on presence.

## 3. Code Review
- [ ] Verify no trigger execution logic exists — only presence detection and rejection.
- [ ] Verify the error message matches the spec's edge case table exactly: includes `"[triggers]"` and `"not supported in MVP"`.
- [ ] Verify doc comment on the `triggers` field explains it is reserved for post-MVP.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` and ensure all new tests pass.

## 5. Update Documentation
- [ ] Add a doc comment on the `triggers` field in `ServerConfig`: `/// Reserved for post-MVP trigger configuration. Presence causes startup rejection at MVP.`

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` — both must exit 0.
- [ ] Verify `// Covers: 1_PRD-REQ-076` annotations are present in test code via `grep -r "Covers: 1_PRD-REQ-076" crates/devs-config/`.
