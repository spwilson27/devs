# Task: Standardize Proto Field Assignment and ServerService (Sub-Epic: 023_Foundational Technical Requirements (Part 14))

## Covered Requirements
- [2_TAS-REQ-009A], [2_TAS-REQ-009B]

## Dependencies
- depends_on: ["01_proto_build_script_fallback.md"]
- shared_components: [devs-proto]

## 1. Initial Test Written
- [ ] Create a Python script `verify_proto_standards.py` in `.tools/` that parses `.proto` files in `proto/devs/v1/` and:
  - Verifies all field numbers start at 1 and increment sequentially (no gaps allowed unless `reserved` is used).
  - Checks for the existence of `ServerService` with a `GetInfo` RPC.
  - Verifies the `GetInfoResponse` message structure matches [2_TAS-REQ-009B].

## 2. Task Implementation
- [ ] Create or update `proto/devs/v1/server.proto`.
- [ ] Define the `ServerService` gRPC service with the `GetInfo` RPC.
- [ ] Implement the `GetInfoRequest` (empty) and `GetInfoResponse` messages.
- [ ] Ensure `GetInfoResponse` contains:
  - `string server_version = 1;`
  - `uint32 mcp_port = 2;`
- [ ] Audit all messages in `proto/devs/v1/` and ensure field numbers are sequential.
- [ ] If any fields are removed during development, add `reserved <number>;` or `reserved "<name>";` statements instead of re-using the field numbers.
- [ ] Ensure each `.proto` file adheres to the `devs.v1` package name and naming conventions (PascalCase for messages/services, snake_case for fields).

## 3. Code Review
- [ ] Verify that no field numbers are skipped or duplicated in any message.
- [ ] Confirm that `ServerService` is publicly exposed via the generated code.
- [ ] Confirm that all messages start field numbering at 1.

## 4. Run Automated Tests to Verify
- [ ] Run `python3 .tools/verify_proto_standards.py` and ensure it passes.
- [ ] Run `cargo build -p devs-proto` and verify that the new service and messages generate correctly.

## 5. Update Documentation
- [ ] Update the `proto/devs/v1/server.proto` with doc comments for `ServerService` and `GetInfo` explaining their purpose.
- [ ] Add a comment at the top of the proto files reminding future developers about the sequential field number requirement.

## 6. Automated Verification
- [ ] Run `grep -r "message GetInfoResponse" proto/devs/v1/` and verify its contents.
- [ ] Run the `verify_proto_standards.py` script as part of a pre-commit check or CI step.
