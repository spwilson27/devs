# Task: CLI Project Webhook Management Subcommands (Sub-Epic: 056_Detailed Domain Specifications (Part 21))

## Covered Requirements
- [2_TAS-REQ-151]

## Dependencies
- depends_on: ["03_devs_toml_schema_definition.md"]
- shared_components: [devs-cli (Owner — webhook subcommands), devs-config (Consumer — project registry / projects.toml)]

## 1. Initial Test Written
- [ ] In `crates/devs-cli/tests/` (or `src/commands/project_webhook.rs`), write tests:
  - `test_webhook_add_parses_all_flags` — parsing `devs project webhook add myproject --url https://example.com/hook --events run_started,stage_completed --secret s3cret --timeout 30 --retries 3` produces a correctly populated `WebhookAddArgs` struct.
  - `test_webhook_add_url_required` — omitting `--url` returns a clap parse error.
  - `test_webhook_add_events_required` — omitting `--events` returns a clap parse error.
  - `test_webhook_list_default_format` — `devs project webhook list myproject` defaults to `table` format.
  - `test_webhook_list_json_format` — `devs project webhook list myproject --format json` sets format to `json`.
  - `test_webhook_remove_requires_id` — `devs project webhook remove myproject` without webhook-id returns a parse error.
  - `test_webhook_add_writes_projects_toml_atomically` — integration test: call add, read `projects.toml`, verify the webhook entry exists. Write must use temp-file + rename (atomic).
  - `test_webhook_remove_deletes_entry` — integration test: add then remove, verify entry is gone from `projects.toml`.
  - `test_webhook_list_returns_entries` — integration test: add two webhooks, list returns both.
- [ ] Each test must include `// Covers: 2_TAS-REQ-151` annotation.

## 2. Task Implementation
- [ ] Define clap subcommand structure under `devs project webhook`:
  - `Add { project: String, url: String, events: Vec<String>, secret: Option<String>, timeout: Option<u32>, retries: Option<u32> }`
  - `List { project: String, format: Option<OutputFormat> }` where `OutputFormat` is `Json | Table`.
  - `Remove { project: String, webhook_id: String }`
- [ ] Implement `projects.toml` read/write logic:
  - Parse existing file with `toml` crate.
  - Add/remove webhook entries under the matching project.
  - Write atomically: serialize to temp file in same directory, then `std::fs::rename` to `projects.toml`.
- [ ] For `add`: generate a unique webhook ID (UUID v4 or short slug).
- [ ] For `list`: render as table (default) or JSON.
- [ ] For `remove`: find by webhook-id, error if not found.
- [ ] After mutating `projects.toml`, send a gRPC `ReloadConfig` RPC to the running server (or print a warning if server is unreachable).

## 3. Code Review
- [ ] Verify atomic write uses temp-file + rename, not direct write.
- [ ] Verify `--secret` value is not logged or printed (use `Redacted<T>` if available).
- [ ] Verify all three subcommands are wired into the CLI dispatch.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-cli --lib --tests` and confirm all webhook command tests pass.

## 5. Update Documentation
- [ ] Add `--help` text for all three subcommands via clap doc attributes.
- [ ] Add doc comments on the webhook management module.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures.
- [ ] Run `./do lint` and confirm no warnings or errors.
