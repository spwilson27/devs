# Task: Project Webhook Management (gRPC & CLI) (Sub-Epic: 056_Detailed Domain Specifications (Part 21))

## Covered Requirements
- [2_TAS-REQ-151]

## Dependencies
- depends_on: [01_foundational_domain_types.md]
- shared_components: [devs-proto, devs-cli, devs-core]

## 1. Initial Test Written
- [ ] In `proto/devs/v1/project.proto`, define the messages for `AddWebhook`, `ListWebhooks`, and `RemoveWebhook`.
- [ ] In `devs-cli/src/commands/project.rs`, write integration tests (mocking the gRPC server) that verify the CLI's parsing of `add`, `list`, and `remove` subcommands for webhooks.
- [ ] Verify that `add` requires `--url` and `--events` as per [2_TAS-REQ-151].
- [ ] Verify that `remove` requires `<webhook-id>`.

## 2. Task Implementation
- [ ] Implement the `project.proto` definitions for webhook management in `devs-proto`.
- [ ] Implement the `devs project webhook` subcommand structure in `devs-cli` using `clap`.
- [ ] Implement the logic for `add`, `list`, and `remove` subcommands to:
    - Parse arguments.
    - Connect to the gRPC server (mocked for now, but following the contract).
    - Rewrite `projects.toml` atomically (this logic should ideally be in `devs-config` or `devs-server`, but the CLI facilitates it through gRPC).
- [ ] Ensure the CLI correctly handles the `format` option for `list`.

## 3. Code Review
- [ ] Verify that the subcommand structure matches [2_TAS-REQ-151] exactly.
- [ ] Check for correct error handling when the server is not reachable (per REQ-151).
- [ ] Ensure gRPC message definitions are consistent with other proto files.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-cli` and `cargo build -p devs-proto` to verify the gRPC and CLI implementations.

## 5. Update Documentation
- [ ] Document the CLI help output for the new webhook subcommands.

## 6. Automated Verification
- [ ] Run `./do test` and verify that the requirements coverage script detects the tests.
