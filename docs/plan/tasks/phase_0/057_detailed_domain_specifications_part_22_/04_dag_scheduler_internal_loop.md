# Task: DAG Scheduler Internal Loop (Sub-Epic: 057_Detailed Domain Specifications (Part 22))

## Covered Requirements
- [2_TAS-REQ-157]

## Dependencies
- depends_on: ["02_dag_cycle_detection.md", "03_agent_pool_manager_state.md", "01_checkpoint_git_orphan_branch.md"]
- shared_components: ["devs-scheduler", "devs-core", "devs-pool", "devs-checkpoint"]

## 1. Initial Test Written
- [ ] In `devs-scheduler`, create `scheduler_loop_tests.rs`.
- [ ] Use a mock `AgentPoolManager` and `CheckpointStore`.
- [ ] Test the scheduler's ability to:
    - Receive a new `WorkflowRun` via a channel and transition its initial stages to `Eligible`.
    - Detect when an agent slot is available and dispatch a stage (transitioning it to `Running`).
    - Process a stage completion result and update the dependent stages.
    - Handle a control signal (e.g., `CancelRun`) and transition all affected stages.
- [ ] Verify that at each step, a checkpoint is saved to the `CheckpointStore`.

## 2. Task Implementation
- [ ] Implement the `DagScheduler` struct in the `devs-scheduler` crate.
- [ ] Create a `run()` method that starts a main Tokio loop (`tokio::select!`).
- [ ] Define a channel for incoming events (submission, results, signals).
- [ ] Implement the 4 primary event handlers within the loop:
    1. **On Run Submission:** Validate using the logic from `02_dag_cycle_detection.md`, create `WorkflowRun`, take a snapshot, and commit to `devs-checkpoint`.
    2. **On Pool Slot Available:** Query `devs-pool` for an available slot. If one is found, transition the stage to `Running` and trigger the stage executor.
    3. **On Stage Result:** Apply the transition (Success/Failure/Branch), checkpoint the result, evaluate dependencies, and mark new stages as `Eligible`.
    4. **On Control Signals:** Process `Pause`, `Cancel`, and `Resume` signals for runs and stages, updating state and checkpointing.
- [ ] Ensure the scheduler owns the in-memory run state in a thread-safe way (e.g., `Arc<RwLock<SchedulerState>>`).

## 3. Code Review
- [ ] Verify that the scheduler uses event-driven logic and does not poll for state changes.
- [ ] Ensure all state transitions are immediately persisted before any external event (like a webhook or gRPC stream update) is emitted.
- [ ] Confirm that the scheduler loop handles all terminal stage states correctly.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler` and ensure the internal loop logic passes all scenarios.

## 5. Update Documentation
- [ ] Document the scheduler's event-driven architecture in the `devs-scheduler` README.md.

## 6. Automated Verification
- [ ] Run a simulation where a 5-stage DAG is submitted. Assert that the stages execute in the correct order and that checkpoints are written at every state transition.
