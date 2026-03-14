# Task: Pool State Data Model & Exhaustion/Rate-Limit Rules (Sub-Epic: 01_DAG Scheduling Engine)

## Covered Requirements
- [9_PROJECT_ROADMAP-REQ-066]: `name` | `string` | Pool name as configured in `devs.toml`
- [9_PROJECT_ROADMAP-REQ-067]: `max_concurrent` | `u32` (1–1024) | Hard concurrency cap across all projects
- [9_PROJECT_ROADMAP-REQ-068]: `active_count` | `u32` | Number of agent permits currently held
- [9_PROJECT_ROADMAP-REQ-069]: `queued_count` | `u32` | Number of stages waiting on semaphore
- [9_PROJECT_ROADMAP-REQ-070]: `exhausted` | `boolean` | `true` if all agents are unavailable
- [9_PROJECT_ROADMAP-REQ-071]: `agents` | `AgentPoolState[]` | Per-agent status
- [9_PROJECT_ROADMAP-REQ-072]: `tool` | `string` | Agent CLI name (`"claude"`, `"gemini"`, etc.)
- [9_PROJECT_ROADMAP-REQ-073]: `capabilities` | `string[]` | Declared capability tags
- [9_PROJECT_ROADMAP-REQ-074]: `fallback` | `boolean` | Is a fallback agent
- [9_PROJECT_ROADMAP-REQ-075]: `pty_active` | `boolean` | Whether PTY is enabled (respects `PTY_AVAILABLE`)
- [9_PROJECT_ROADMAP-REQ-076]: `rate_limited_until` | `string | null` | RFC 3339 timestamp; `null` if not rate-limited
- [9_PROJECT_ROADMAP-REQ-077]: `active_stages` | `u32` | Count of stages currently using this agent
- [9_PROJECT_ROADMAP-REQ-078]: `PoolExhausted` transitions occur when filtered-available agent count drops from ≥1 to 0 within a single pool. Event fires EXACTLY ONCE per episode. Episode ends when available-agent count returns to ≥1. Intermediate rate-limit events during ongoing exhaustion MUST NOT re-fire the webhook.
- [9_PROJECT_ROADMAP-REQ-079]: Rate-limit cooldown stored as absolute `DateTime<Utc>` timestamp (`rate_limited_until`), not countdown duration. Cooldown unaffected by server restarts.

## Dependencies
- depends_on: ["02_parallel_stage_dispatch_engine.md"]
- shared_components: [devs-pool (consumer — PoolState, acquire_agent, release_agent, report_rate_limit, get_pool_state), devs-webhook (consumer — PoolExhausted event)]

## 1. Initial Test Written
- [ ] Create `crates/devs-scheduler/tests/pool_state_tests.rs`.
- [ ] Write unit test `test_pool_state_has_all_required_fields`: construct a `PoolState` from a pool config. Assert fields: `name` (String), `max_concurrent` (u32), `active_count` (u32), `queued_count` (u32), `exhausted` (bool), `agents` (Vec<AgentPoolState>). Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-066, 9_PROJECT_ROADMAP-REQ-067, 9_PROJECT_ROADMAP-REQ-068, 9_PROJECT_ROADMAP-REQ-069, 9_PROJECT_ROADMAP-REQ-070, 9_PROJECT_ROADMAP-REQ-071`.
- [ ] Write unit test `test_agent_pool_state_has_all_required_fields`: construct an `AgentPoolState`. Assert fields: `tool` (String), `capabilities` (Vec<String>), `fallback` (bool), `pty_active` (bool), `rate_limited_until` (Option<DateTime<Utc>>), `active_stages` (u32). Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-072, 9_PROJECT_ROADMAP-REQ-073, 9_PROJECT_ROADMAP-REQ-074, 9_PROJECT_ROADMAP-REQ-075, 9_PROJECT_ROADMAP-REQ-076, 9_PROJECT_ROADMAP-REQ-077`.
- [ ] Write unit test `test_max_concurrent_bounds`: assert `max_concurrent` of 0 is rejected. Assert 1 and 1024 are accepted. Assert 1025 is rejected. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-067`.
- [ ] Write unit test `test_pool_exhausted_fires_once_per_episode`: set up pool with 1 agent. Acquire the agent (pool becomes exhausted). Assert `PoolExhausted` event fires. Report another rate-limit event while still exhausted. Assert NO additional `PoolExhausted` event fires. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-078`.
- [ ] Write unit test `test_pool_exhausted_episode_resets`: exhaust pool → event fires. Release agent (available count returns to ≥1). Exhaust pool again → second event fires. Assert exactly 2 events total. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-078`.
- [ ] Write unit test `test_rate_limit_absolute_timestamp`: call `report_rate_limit(agent_id, cooldown_until)` with a `DateTime<Utc>` 60 seconds in the future. Assert `rate_limited_until` field matches the absolute timestamp, not a duration. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-079`.
- [ ] Write unit test `test_rate_limit_survives_simulated_restart`: report rate limit with timestamp 60s in future. Serialize pool state, deserialize it (simulating restart). Assert recovered `rate_limited_until` is still in the future relative to `Utc::now()`. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-079`.
- [ ] Write unit test `test_rate_limited_agent_excluded_from_available_count`: pool with 2 agents. Rate-limit one. Assert `exhausted == false` (one still available). Rate-limit the other. Assert `exhausted == true`. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-070, 9_PROJECT_ROADMAP-REQ-078`.
- [ ] Write unit test `test_pty_active_respects_pty_available`: create agent with PTY mode configured. When `PTY_AVAILABLE` is true, assert `pty_active == true`. When `PTY_AVAILABLE` is false, assert `pty_active == false`. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-075`.

## 2. Task Implementation
- [ ] Define `PoolState` struct in the scheduler's pool integration layer (or extend `devs-pool`'s `get_pool_state` return type) with fields:
  - `name: String`
  - `max_concurrent: u32`
  - `active_count: u32`
  - `queued_count: u32`
  - `exhausted: bool`
  - `agents: Vec<AgentPoolState>`
- [ ] Define `AgentPoolState` struct with fields:
  - `tool: String`
  - `capabilities: Vec<String>`
  - `fallback: bool`
  - `pty_active: bool`
  - `rate_limited_until: Option<DateTime<Utc>>`
  - `active_stages: u32`
- [ ] Add validation for `max_concurrent`: must be in range 1..=1024.
- [ ] Implement `PoolExhausted` episode tracking in the pool:
  - Add `exhaustion_active: bool` flag to pool internal state.
  - On every agent release or rate-limit event, compute available agent count.
  - If available drops from ≥1 to 0 AND `exhaustion_active == false`: emit `PoolExhausted` event, set `exhaustion_active = true`.
  - If available returns to ≥1: set `exhaustion_active = false` (episode ends).
  - During an active exhaustion episode, do NOT re-fire the event.
- [ ] Ensure `rate_limited_until` is stored as `DateTime<Utc>` (absolute timestamp), serialized as RFC 3339 string for proto/JSON representation.
- [ ] Implement `get_pool_state()` to populate all fields from current pool state, computing `exhausted` dynamically from agent availability.
- [ ] Derive `Serialize` and `Deserialize` on `PoolState` and `AgentPoolState` for checkpoint/proto conversion.

## 3. Code Review
- [ ] Verify `exhausted` is computed from actual agent availability, not cached stale data.
- [ ] Verify `PoolExhausted` event fires exactly once per episode — no duplicates during intermediate rate-limit events.
- [ ] Verify `rate_limited_until` comparison uses `Utc::now()` for restart resilience.
- [ ] Verify `max_concurrent` bounds are enforced at construction time, not just at usage time.
- [ ] Verify all fields are populated in `get_pool_state()` — no default/zero values for active state.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- pool_state` and verify all tests pass.
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and verify no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `PoolState`, `AgentPoolState`, and the exhaustion episode tracking logic.
- [ ] Document the RFC 3339 serialization format for `rate_limited_until`.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-scheduler -- pool_state --format=json 2>&1 | grep '"passed"'` and confirm all test cases passed.
- [ ] Run `cargo tarpaulin -p devs-scheduler --out json -- pool_state` and verify ≥ 90% line coverage for pool state code.
