# Task: CLI Command Architecture and MCP Bridge Routing (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-068], [6_UI_UX_ARCHITECTURE-REQ-069], [6_UI_UX_ARCHITECTURE-REQ-070], [6_UI_UX_ARCHITECTURE-REQ-222], [6_UI_UX_ARCHITECTURE-REQ-223], [6_UI_UX_ARCHITECTURE-REQ-224], [6_UI_UX_ARCHITECTURE-REQ-225], [6_UI_UX_ARCHITECTURE-REQ-226], [6_UI_UX_ARCHITECTURE-REQ-227], [6_UI_UX_ARCHITECTURE-REQ-228], [6_UI_UX_ARCHITECTURE-REQ-229], [6_UI_UX_ARCHITECTURE-REQ-230], [6_UI_UX_ARCHITECTURE-REQ-231], [6_UI_UX_ARCHITECTURE-REQ-232], [6_UI_UX_ARCHITECTURE-REQ-233], [6_UI_UX_ARCHITECTURE-REQ-234], [6_UI_UX_ARCHITECTURE-REQ-235], [6_UI_UX_ARCHITECTURE-REQ-236], [6_UI_UX_ARCHITECTURE-REQ-237], [6_UI_UX_ARCHITECTURE-REQ-238], [6_UI_UX_ARCHITECTURE-REQ-239], [6_UI_UX_ARCHITECTURE-REQ-240], [6_UI_UX_ARCHITECTURE-REQ-241], [6_UI_UX_ARCHITECTURE-REQ-242], [6_UI_UX_ARCHITECTURE-REQ-243], [6_UI_UX_ARCHITECTURE-REQ-246], [6_UI_UX_ARCHITECTURE-REQ-247], [6_UI_UX_ARCHITECTURE-REQ-248]

## Dependencies
- depends_on: ["03_grpc_client_and_discovery.md", "07_string_constants_and_styling.md"]
- shared_components: [devs-core (consumer), devs-proto (consumer)]

## 1. Initial Test Written
- [ ] Write test for CLI global flags: `--server <host:port>` override and `--format json|text` default `text` inherited by all subcommands via `clap` root `Command` (REQ-068)
- [ ] Write test for `--format json`: all output (including errors) to stdout as JSON, nothing to stderr. Error format: `{"error": "<prefix>: <detail>", "code": <n>}` (REQ-069, REQ-225)
- [ ] Write test for `--format text`: errors to stderr with prefix and exit code (REQ-226)
- [ ] Write test for each subcommand existing as separate async function in dedicated module under `crates/devs-cli/src/commands/`: `submit`, `list`, `status`, `logs`, `cancel`, `pause`, `resume`, `project add/remove/list`, `security-check` (REQ-070)
- [ ] Write test for CLI discovery precedence: `--server` flag → `DEVS_SERVER` env → `devs.toml` → `DEVS_DISCOVERY_FILE` → `~/.config/devs/server.addr` (REQ-221)
- [ ] Write test for `devs logs --follow`: exits 0 on Completed, 1 on Failed/Cancelled, 3 on disconnection (REQ-222)
- [ ] Write test for `devs security-check`: NO gRPC channel created, reads config from disk only (REQ-223)
- [ ] Write test for `devs pause/resume --stage NAME <run-id>`: routes to StageService or RunService depending on --stage flag (REQ-224)
- [ ] Write test for standardized exit codes: 0=success, 1=failed, 2=not found, 3=unreachable, 4=invalid argument (REQ-227)
- [ ] Write test for `devs submit --project` auto-detection from CWD matching exactly one project (REQ-228)
- [ ] Write test for `--name` format constraints: max 128 chars, `[a-z0-9-]+` enforced by server (REQ-229)
- [ ] Write test for `devs logs` without `--stage`: prints all stages in dependency order (REQ-230)
- [ ] Write test for `devs logs --follow` without `--stage`: streams all stages with `[stage-name] ` prefix per line (REQ-231)
- [ ] Write test for MCP bridge routing to single endpoint `/mcp/v1/call` (REQ-232)
- [ ] Write test that MCP bridge processes requests sequentially, not concurrently (REQ-234)
- [ ] Write test that MCP bridge does NOT validate method/params semantically — forwards verbatim (REQ-243)

## 2. Task Implementation
- [ ] Create CLI root command in `crates/devs-cli/src/main.rs` using `clap` with global flags `--server`, `--format`, `--help` (REQ-068)
- [ ] Implement `--format json` output handler: wrap all output in JSON, errors as `{"error": "<prefix>: <detail>", "code": <n>}`, nothing to stderr (REQ-069, REQ-225)
- [ ] Implement `--format text` output handler: human-readable text to stdout, errors to stderr (REQ-226)
- [ ] Create subcommand modules under `crates/devs-cli/src/commands/`: `submit.rs`, `list.rs`, `status.rs`, `logs.rs`, `cancel.rs`, `pause.rs`, `resume.rs`, `project.rs`, `security_check.rs` — each containing a single async entry function (REQ-070)
- [ ] Implement `devs logs --follow` exit code logic: 0 on Completed, 1 on Failed/Cancelled, 3 on disconnect (REQ-222)
- [ ] Implement `devs security-check` as local-only command with no gRPC dependency (REQ-223)
- [ ] Implement `pause`/`resume` routing: `--stage` present → StageService RPC, absent → RunService RPC (REQ-224)
- [ ] Implement exit code mapping: gRPC `NOT_FOUND` → 2, connection errors → 3, `INVALID_ARGUMENT` → 4, `ALREADY_EXISTS` → 4, success → 0 (REQ-227)
- [ ] Implement `--project` auto-detection: scan project registry for CWD match, error if 0 or >1 match (REQ-228)
- [ ] Implement `devs logs` all-stage mode: dependency-ordered output with `[stage-name]` prefix (REQ-230, REQ-231)
- [ ] Create `crates/devs-mcp-bridge/src/main.rs` with sequential request processing loop: read JSON-RPC from stdin, forward to `/mcp/v1/call`, write response to stdout (REQ-232, REQ-234)
- [ ] Implement bridge passthrough: method and params forwarded verbatim without semantic validation (REQ-243)

## 3. Code Review
- [ ] Verify all subcommands are in separate modules (REQ-070)
- [ ] Verify JSON mode produces no stderr output (REQ-225)
- [ ] Verify exit codes match specification exactly (REQ-227)
- [ ] Verify MCP bridge has no validation logic (REQ-243)
- [ ] Verify security-check creates no gRPC channel (REQ-223)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-cli -- commands` and `cargo test -p devs-mcp-bridge`

## 5. Update Documentation
- [ ] Add doc comments to all CLI command modules and MCP bridge main

## 6. Automated Verification
- [ ] Run `cargo test -p devs-cli 2>&1 | tail -5` and confirm `test result: ok`
- [ ] Run `cargo test -p devs-mcp-bridge 2>&1 | tail -5` and confirm `test result: ok`
