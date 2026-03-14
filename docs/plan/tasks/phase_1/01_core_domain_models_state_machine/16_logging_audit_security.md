# Task: Implement Logging and Audit Security Types (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [SEC-011], [SEC-089], [SEC-090], [SEC-091], [SEC-092], [SEC-094], [SEC-095], [SEC-096], [SEC-097], [SEC-098], [SEC-099], [SEC-100], [SEC-101], [SEC-102], [SEC-103], [SEC-104], [SEC-106], [SEC-107], [SEC-108], [SEC-109], [SEC-110], [SEC-111], [SEC-112], [SEC-113], [5_SECURITY_DESIGN-REQ-281], [5_SECURITY_DESIGN-REQ-282], [5_SECURITY_DESIGN-REQ-283], [5_SECURITY_DESIGN-REQ-284], [5_SECURITY_DESIGN-REQ-285], [5_SECURITY_DESIGN-REQ-286], [5_SECURITY_DESIGN-REQ-287], [5_SECURITY_DESIGN-REQ-288], [5_SECURITY_DESIGN-REQ-289], [5_SECURITY_DESIGN-REQ-290], [5_SECURITY_DESIGN-REQ-291], [5_SECURITY_DESIGN-REQ-292], [5_SECURITY_DESIGN-REQ-293], [5_SECURITY_DESIGN-REQ-294], [5_SECURITY_DESIGN-REQ-295], [5_SECURITY_DESIGN-REQ-296], [5_SECURITY_DESIGN-REQ-297], [5_SECURITY_DESIGN-REQ-298], [5_SECURITY_DESIGN-REQ-299], [5_SECURITY_DESIGN-REQ-300], [5_SECURITY_DESIGN-REQ-301], [5_SECURITY_DESIGN-REQ-302], [5_SECURITY_DESIGN-REQ-303], [5_SECURITY_DESIGN-REQ-304], [5_SECURITY_DESIGN-REQ-305], [5_SECURITY_DESIGN-REQ-306], [AC-SEC-3-020], [AC-SEC-3-021], [AC-SEC-3-023], [AC-SEC-3-024], [AC-SEC-3-025], [AC-SEC-3-026], [AC-SEC-3-027], [AC-SEC-3-028], [AC-SEC-3-029], [AC-SEC-3-030], [AC-SEC-3-031], [AC-SEC-3-032], [AC-SEC-3-033], [AC-SEC-3-034], [AC-SEC-3-035], [AC-SEC-3-036], [AC-SEC-3-037], [AC-SEC-3-038], [AC-SEC-3-039], [AC-SEC-3-040], [AC-SEC-3-041], [AC-SEC-3-042], [AC-SEC-3-043], [AC-SEC-3-044], [AC-SEC-3-045], [AC-SEC-3-046], [AC-SEC-3-047], [AC-SEC-3-048], [AC-SEC-3-049], [AC-SEC-3-050], [AC-SEC-3-051], [AC-SEC-3-052], [AC-SEC-3-053]

## Dependencies
- depends_on: ["11_redacted_wrapper_credential_security.md"]
- shared_components: [devs-core (Owner)]

## 1. Initial Test Written
- [ ] Write test `test_audit_event_type_registry` asserting all defined event types (`security.misconfiguration`, `security.ssrf_blocked`, `security.credential_in_config`, `run.started`, `run.completed`, `stage.started`, etc.) are enumerated
- [ ] Write test `test_log_field_truncation` asserting fields exceeding 64 KiB are truncated with `[TRUNCATED]` suffix
- [ ] Write test `test_log_safe_character_set` asserting span context fields are validated against safe character set
- [ ] Write test `test_retention_policy_validation` asserting `RetentionPolicy` with `max_age_days` and `max_size_mb` validates correctly
- [ ] Write test `test_audit_event_display` asserting each event type variant has a human-readable display string
- [ ] Write test `test_request_id_format` asserting `RequestId` wraps UUID and implements Display

## 2. Task Implementation
- [ ] Define `AuditEventType` enum in `crates/devs-core/src/security/audit.rs` with all security and lifecycle event types
- [ ] Define `AuditEvent` struct with `event_type: AuditEventType`, `timestamp: DateTime<Utc>`, `request_id: Option<RequestId>`, `details: HashMap<String, String>`
- [ ] Define `RequestId` newtype wrapping `Uuid` with `Display` impl
- [ ] Define `LogFieldTruncation` with `MAX_FIELD_BYTES: usize = 65536` and `truncate(value: &str) -> String`
- [ ] Define `RetentionPolicy` struct with `max_age_days: Option<u32>` and `max_size_mb: Option<u64>` and `validate(&self) -> Result<(), ValidationError>`
- [ ] Define `SafeSpanCharset` with `validate(name: &str) -> Result<(), InvalidSpanName>` for tracing span field validation
- [ ] Implement `Display` for all audit types

## 3. Code Review
- [ ] Verify event type registry matches all event types defined in the security spec §5.2
- [ ] Verify truncation uses byte length not character count
- [ ] Verify no sensitive data types can be accidentally logged (all use `Redacted<T>` wrapper)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core security::audit` and confirm all tests pass
- [ ] Run `cargo test -p devs-core` to confirm no regressions in the crate

## 5. Update Documentation
- [ ] Add doc comments to `AuditEventType` variants referencing the security spec §5.2 event definitions
- [ ] Document `LogFieldTruncation::truncate` byte-length semantics and the `[TRUNCATED]` suffix format
- [ ] Document `SafeSpanCharset` accepted character set with rationale

## 6. Automated Verification
- [ ] `cargo clippy -p devs-core -- -D warnings` passes with no warnings
- [ ] `cargo test -p devs-core security::audit` passes
- [ ] `cargo fmt --check -p devs-core` passes
