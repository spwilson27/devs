# Task: Performance — Optional Web Worker offload for particle stepping (Sub-Epic: 55_Distillation_Particles)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-057-2]

## 1. Initial Test Written
- [ ] Create tests tests/ui/distillation/worker.test.ts that (a) mock the Worker class and assert that when configured useWorker=true the Distillation module posts an 'init' message and receives step updates via onmessage; (b) assert fallback to CPU path when Worker is not available; (c) assert message schema correctness (e.g., {type:'init',payload:{...}} / {type:'step',payload:particles}).

## 2. Task Implementation
- [ ] Implement src/ui/distillation/worker.ts (or worker/worker.ts) intended for bundling as a Web Worker; worker listens for messages {type:'init'|'step'} and runs particleEngine.stepParticles, posting back results. Modify DistillationSweep to spawn a Worker when available, post 'init' and 'step' messages, and render particles from worker responses; implement robust fallback to main-thread stepping when worker creation fails. Keep message payloads small and typed.

## 3. Code Review
- [ ] Confirm worker message schema is typed and minimal, error handling/timeouts are present, postMessage payloads are serializable, and fallback path is covered by tests. Verify build toolchain will produce a worker-friendly artifact or include an inline blob-worker fallback.

## 4. Run Automated Tests to Verify
- [ ] Run the worker tests and main particle tests; verify the worker-enabled path and the fallback path produce identical particle states for a seeded run under tests.

## 5. Update Documentation
- [ ] Document worker offload behavior in docs/ui/distillation.md including how to enable/disable worker offload, message schema, and platform caveats.

## 6. Automated Verification
- [ ] Add a CI regression check that runs a small workload with worker enabled (mocked) and disabled and validates that the outputs are identical for a seeded run; fail on mismatch.
