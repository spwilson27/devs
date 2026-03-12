# Task: Project Webhook Configuration Schema and Limits (Sub-Epic: 054_Detailed Domain Specifications (Part 19))

## Covered Requirements
- [2_TAS-REQ-144], [2_TAS-REQ-145]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-config]

## 1. Initial Test Written
- [ ] In `devs-config/src/project_registry.rs`, create a unit test `test_webhook_validation` that:
    - Parses a `projects.toml` string with multiple `[[project.webhook]]` targets.
    - Verifies that `WebhookTarget` is correctly instantiated with all fields from **[2_TAS-REQ-145]**.
    - Asserts that a project with 17 webhook targets fails validation as per **[2_TAS-REQ-144]**.
    - Asserts that an invalid URL (not http/https or too long) fails validation.
    - Asserts that an empty `events` list fails validation.
    - Asserts that values outside of their defined ranges (e.g., `timeout_secs = 31`) fail validation.

## 2. Task Implementation
- [ ] In `devs-config/src/webhook.rs`, define the `WebhookTarget` struct as specified in **[2_TAS-REQ-145]**:
    ```rust
    pub struct WebhookTarget {
        pub webhook_id:   Uuid,
        pub url:          String,
        pub events:       Vec<WebhookEvent>,
        pub secret:       Option<String>,
        pub timeout_secs: u32,
        pub max_retries:  u32,
    }
    ```
    - Implement `serde::Deserialize` for this struct.
    - Add validation logic (e.g., using `validator` crate or manual checks) to enforce:
        - `url`: Absolute URL; `http` or `https` scheme only; max 2048 characters.
        - `events`: Non-empty.
        - `secret`: Max 512 characters if present.
        - `timeout_secs`: Range 1–30.
        - `max_retries`: Range 0–10.
- [ ] In `devs-config/src/project_registry.rs`, update the `ProjectEntry` struct to include `webhooks: Vec<WebhookTarget>`.
- [ ] Implement the 16-target per-project limit check in the `ProjectRegistry::load()` method or during parsing.
- [ ] Ensure `webhook_id` is system-assigned (UUID4) and not user-settable during the `project add` CLI command (mock this for now if necessary).

## 3. Code Review
- [ ] Verify that all constraints from the TAS are correctly implemented in the validation logic.
- [ ] Verify that the `serde` field mapping matches the TOML schema in §4.4.1.
- [ ] Ensure that default values are correctly applied for `timeout_secs` (10) and `max_retries` (3).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config`.
- [ ] Manually verify parsing of a sample `projects.toml` with valid and invalid webhook configurations.

## 5. Update Documentation
- [ ] Update `devs-config` documentation to include the new `WebhookTarget` schema and its constraints.

## 6. Automated Verification
- [ ] Run `./do presubmit`.
- [ ] Verify traceability annotations: `// Covers: [2_TAS-REQ-144], [2_TAS-REQ-145]` in the implementation.
