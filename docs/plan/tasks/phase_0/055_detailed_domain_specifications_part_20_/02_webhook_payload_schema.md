# Task: Webhook Payload Schema and Truncation Logic (Sub-Epic: 055_Detailed Domain Specifications (Part 20))

## Covered Requirements
- [2_TAS-REQ-147]

## Dependencies
- depends_on: [01_webhook_event_enumeration.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `devs-core/src/webhook/payload.rs`, create a unit test `test_payload_truncation` that:
    - Asserts that a small `WebhookPayload` results in `truncated: false`.
    - Verifies that a payload exceeding 64 KiB triggers truncation.
    - Asserts that `stage` fields (other than `stage_name` and `status`) are removed first.
    - Asserts that `run` fields (other than `run_id`, `slug`, and `status`) are removed next.
    - Verifies that `event` and `occurred_at` are always present after truncation.
    - Asserts that truncation successfully brings the payload under 64 KiB for a large input.

## 2. Task Implementation
- [ ] Define the `WebhookPayload` struct in `devs-core/src/webhook/payload.rs`:
    ```rust
    pub struct WebhookPayload {
        pub event:        String,
        pub project_id:   Uuid,
        pub project_name: String,
        pub occurred_at:  DateTime<Utc>,
        pub run:          Option<RunSnippet>,
        pub stage:        Option<StageSnippet>,
        pub pool:         Option<PoolSnippet>,
        pub truncated:    bool,
    }
    ```
- [ ] Define sub-structs for snippets:
    - `RunSnippet`: `run_id`, `slug`, `workflow_name`, `status`, `started_at`, `completed_at`.
    - `StageSnippet`: `stage_run_id`, `stage_name`, `attempt`, `status`, `started_at`, `completed_at`, `exit_code`.
    - `PoolSnippet`: `pool_name`, `required_capabilities`.
- [ ] Implement `serde::Serialize` for all types.
- [ ] Implement `WebhookPayload::truncate(&mut self)` method:
    - Attempt to serialize to JSON.
    - If JSON size > 64 KiB:
        - Set `self.truncated = true`.
        - Trim `stage` sub-fields (leaving only `stage_name`, `status`).
        - Re-check size.
        - If still > 64 KiB, trim `run` sub-fields (leaving only `run_id`, `slug`, `status`).
- [ ] Ensure that if the payload still exceeds 64 KiB after all allowed trimmings, it can be marked as `unserializable`.

## 3. Code Review
- [ ] Verify that the `event` field in the payload correctly contains concrete leaf event strings from Task 1.
- [ ] Check that `occurred_at` and `event` fields are always present even after truncation as per **[2_TAS-REQ-147]**.
- [ ] Verify that UUIDs are correctly serialized as lowercase hyphenated strings.
- [ ] Ensure that timestamps are ISO 8601 UTC strings as per the TAS.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core`.
- [ ] Specifically verify the truncation edge cases with large strings in `project_name` or `slug`.

## 5. Update Documentation
- [ ] Add doc comments to `WebhookPayload` reflecting the population rules from **[2_TAS-REQ-147]**.

## 6. Automated Verification
- [ ] Run `./do presubmit`.
- [ ] Verify traceability annotations: `// Covers: [2_TAS-REQ-147]` in `devs-core/src/webhook/payload.rs`.
