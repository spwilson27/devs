# Task: CLI JSON Output Schema Types (Sub-Epic: 034_Foundational Technical Requirements (Part 25))

## Covered Requirements
- [2_TAS-REQ-086G]

## Dependencies
- depends_on: ["01_protocol_state_machines.md"]
- shared_components: [devs-core (consumes state types, owns CLI output types for Phase 0)]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/src/cli_output.rs` with a test submodule. All tests annotated with `// Covers: 2_TAS-REQ-086G`.
- [ ] **`SubmitOutput` schema**: Test serialization produces exactly: `{ "run_id": "uuid", "slug": "string", "workflow_name": "string", "project_id": "uuid", "status": "pending", "created_at": "ISO8601" }`. Assert `status` is always `"pending"`.
- [ ] **`ListOutput` schema**: Test serialization produces `{ "runs": [...], "total": N }`. Each run entry includes: `run_id`, `slug`, `workflow_name`, `project_id`, `status`, `created_at`, `started_at` (nullable), `completed_at` (nullable). Assert nullable fields serialize as JSON `null` (key present, not omitted).
- [ ] **`StatusOutput` schema**: Test serialization includes `run_id`, `slug`, `workflow_name`, `project_id`, `status`, `created_at`, `started_at`, `completed_at`, and `stage_runs` array. Each stage run entry includes: `stage_run_id`, `stage_name`, `attempt`, `status`, `agent_tool` (nullable), `pool_name`, `started_at`, `completed_at`, `exit_code` (nullable), `elapsed_ms` (nullable).
- [ ] **`LogLineOutput` (NDJSON)**: Test serialization of a log line produces `{ "stream": "stdout", "line": "string", "sequence": N, "occurred_at": "ISO8601" }`. Test end-of-stream sentinel: `{ "done": true, "run_status": "completed" }`.
- [ ] **`ActionOutput`** (cancel/pause/resume): Test run-level output `{ "run_id": "uuid", "status": "string" }`. Test stage-level output `{ "run_id": "uuid", "stage_run_id": "uuid", "stage_name": "string", "status": "string" }`.
- [ ] **`ProjectAddOutput`**: Test serialization produces `{ "project_id": "uuid", "name": "string", "repo_path": "string", "priority": N, "weight": N, "checkpoint_branch": "string", "registered_at": "ISO8601" }`.
- [ ] **`ProjectListOutput`**: Test serialization produces `{ "projects": [...] }` with each entry matching `ProjectAddOutput` schema.
- [ ] **Error envelope**: Test that `CliErrorOutput` serializes as `{ "error": "<message>", "code": <N> }`.
- [ ] **Round-trip**: For each type, deserialize the serialized JSON back and assert equality, ensuring the schemas are self-consistent.

## 2. Task Implementation
- [ ] Define the following structs in `crates/devs-core/src/cli_output.rs`, all deriving `Serialize, Deserialize, Debug, Clone, PartialEq`:
  - `SubmitOutput { run_id: Uuid, slug: String, workflow_name: String, project_id: Uuid, status: String, created_at: DateTime<Utc> }`
  - `ListOutput { runs: Vec<RunSummary>, total: usize }`
  - `RunSummary { run_id, slug, workflow_name, project_id, status, created_at, started_at: Option<DateTime<Utc>>, completed_at: Option<DateTime<Utc>> }`
  - `StatusOutput { run_id, slug, workflow_name, project_id, status, created_at, started_at, completed_at, stage_runs: Vec<StageRunEntry> }`
  - `StageRunEntry { stage_run_id, stage_name, attempt: u32, status, agent_tool: Option<String>, pool_name, started_at, completed_at, exit_code: Option<i32>, elapsed_ms: Option<u64> }`
  - `LogLineOutput { stream: String, line: String, sequence: u64, occurred_at: DateTime<Utc> }`
  - `LogStreamEnd { done: bool, run_status: String }`
  - `RunActionOutput { run_id: Uuid, status: String }`
  - `StageActionOutput { run_id: Uuid, stage_run_id: Uuid, stage_name: String, status: String }`
  - `ProjectAddOutput { project_id, name, repo_path, priority: u32, weight: u32, checkpoint_branch, registered_at }`
  - `ProjectListOutput { projects: Vec<ProjectAddOutput> }`
  - `CliErrorOutput { error: String, code: i32 }`
- [ ] Use `#[serde(serialize_with = "serialize_optional_datetime")]` or similar to ensure `Option<DateTime<Utc>>` serializes as `null` not omitted.
- [ ] Export all types from `devs-core` public API.

## 3. Code Review
- [ ] Verify all `Option<T>` fields serialize as JSON `null` when `None`, not omitted from the output.
- [ ] Verify `DateTime<Utc>` serializes as RFC 3339 with millisecond precision and `Z` suffix per [2_TAS-REQ-086J].
- [ ] Verify `Uuid` serializes as lowercase hyphenated string.
- [ ] Verify `LogLineOutput` is designed for NDJSON (one JSON object per line, no wrapping array).
- [ ] Verify no dependency on `devs-cli` or gRPC types — these are pure data types in `devs-core`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- cli_output` and verify all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to each struct and field referencing [2_TAS-REQ-086G] and the normative schema section.

## 6. Automated Verification
- [ ] Run `./do lint` to ensure clippy, formatting, and doc comment standards are met.
- [ ] Run `./do test` and verify that `target/traceability.json` correctly maps [2_TAS-REQ-086G] to the new tests.
