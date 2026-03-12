# Task: Fan-Out Authoring (Builder API & Named Handlers) (Sub-Epic: 04_Fan-Out Implementation)

## Covered Requirements
- [1_PRD-REQ-025]

## Dependencies
- depends_on: [02_fan_out_scheduler_integration.md]
- shared_components: [devs-core, devs-config]

## 1. Initial Test Written
- [ ] Create a test in `devs-core` that uses the `WorkflowBuilder` to define a fan-out stage via a closure returning an iterator.
- [ ] Create a test in `devs-config` that defines a `fan_out` block with an `input_list` template reference (e.g., `{{stage.plan.output.tasks}}`).
- [ ] Test that the Rust Builder API correctly captures the fan-out closure and passes it to the scheduler.
- [ ] Test that a declarative workflow can reference a "named handler" for fan-out logic registered at startup.

## 2. Task Implementation
- [ ] Add the `fan_out` method to `WorkflowBuilder` in `devs-core`, allowing users to provide a closure for dynamic fan-out.
- [ ] Implement the `NamedHandler` registration system in `devs-config` to allow declarative fan-out logic to map to Rust functions.
- [ ] Update the `WorkflowDefinition` to handle both declarative (static) and builder (dynamic) fan-out configs uniformly for the scheduler.
- [ ] Ensure that template variable resolution is triggered correctly for `fan_out.input_list` before the stage is dispatched.

## 3. Code Review
- [ ] Verify that the builder API feels idiomatic and ergonomic for Rust users.
- [ ] Ensure that the `NamedHandler` registry is thread-safe and allows multiple registrations at server startup.
- [ ] Check that closure capture in the Builder API doesn't cause lifetime or Send/Sync issues in the scheduler.

## 4. Run Automated Tests to Verify
- [ ] Execute `cargo test -p devs-core` and `cargo test -p devs-config` to verify authoring formats.

## 5. Update Documentation
- [ ] Update `EXAMPLES.md` or similar to show how to use both builder-based and declarative fan-out.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all authoring tests are passing.
