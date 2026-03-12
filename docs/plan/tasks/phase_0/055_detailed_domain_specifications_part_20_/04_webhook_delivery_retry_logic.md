# Task: Webhook Delivery Semantics and Retry Schedule (Sub-Epic: 055_Detailed Domain Specifications (Part 20))

## Covered Requirements
- [2_TAS-REQ-149]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `devs-core/src/webhook/retry.rs`, create a unit test `test_webhook_retry_schedule` that:
    - Asserts the delay before attempt 1 is 0 seconds.
    - Verifies the delay before attempt 2 is 5 seconds.
    - Asserts the delay before attempt 3 is 15 seconds.
    - Asserts the delay before attempt 4 is 45 seconds (15 * (4-1)).
    - Verifies that the maximum delay is capped at 60 seconds (min(15*(N-1), 60)).
    - Asserts that a delivery that receives an HTTP 2xx is considered successful.
    - Verifies that delivery failures do not affect run or stage status.

## 2. Task Implementation
- [ ] In `devs-core/src/webhook/retry.rs`, define the `RetrySchedule` struct/logic for webhook deliveries:
    ```rust
    pub struct RetrySchedule;

    impl RetrySchedule {
        pub fn delay_for_attempt(attempt: u32) -> Duration {
            // attempt 1 (first try) -> immediate
            // attempt 2 -> 5s
            // attempt 3 -> 15s
            // attempt N (N >= 4) -> min(15 * (N-1), 60)s
        }
    }
    ```
- [ ] Define the logic for determining delivery success based on HTTP 2xx status code and timeout constraints.
- [ ] Define a mock/trait for the HTTP client that allows asserting that a non-2xx response triggers a retry and that a final failure logs at `WARN`.
- [ ] Ensure that no persistent state mutation is triggered by a delivery failure as per **[2_TAS-REQ-149]**.

## 3. Code Review
- [ ] Verify that the fixed retry schedule exactly matches the table in **[2_TAS-REQ-149]**.
- [ ] Check that `max_retries` is correctly used to terminate the attempt loop.
- [ ] Confirm that all failures result in `WARN` logging as required by the TAS.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core`.
- [ ] Specifically test the retry logic using mock responses to simulate failures and successes.

## 5. Update Documentation
- [ ] Add doc comments to `RetrySchedule` reflecting the table and semantics from **[2_TAS-REQ-149]**.

## 6. Automated Verification
- [ ] Run `./do presubmit`.
- [ ] Verify traceability annotations: `// Covers: [2_TAS-REQ-149]` in `devs-core/src/webhook/retry.rs`.
