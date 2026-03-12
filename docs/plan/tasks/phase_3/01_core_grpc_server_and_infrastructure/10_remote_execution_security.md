# Task: Remote Execution Security (SSH and Docker) (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-012], [5_SECURITY_DESIGN-REQ-038], [5_SECURITY_DESIGN-REQ-039], [5_SECURITY_DESIGN-REQ-069]

## Dependencies
- depends_on: [07_filesystem_security_and_path_handling.md]
- shared_components: [devs-executor]

## 1. Initial Test Written
- [ ] Write a test for the Docker executor that verifies TLS certificate validation is enabled for `tcp://` connections.
- [ ] Create a mock SSH executor test that verifies host key validation is enforced (no `StrictHostKeyChecking=no` by default).
- [ ] Verify that `ssh2`-based remote execution does not perform unintended outbound HTTP requests.

## 2. Task Implementation
- [ ] Implement `DOCKER_HOST` TLS certificate validation in the Docker executor.
- [ ] Enforce strict host key checking in the SSH executor (using the `ssh2` crate).
- [ ] Log a `WARN` if `DOCKER_TLS_VERIFY=0` is used.
- [ ] Ensure that SSH connection targets are operator-controlled via `devs.toml` and not derived from user input.
- [ ] Document the blast radius of compromised stages in Docker/SSH environments.

## 3. Code Review
- [ ] Verify that SSH credentials are never logged.
- [ ] Confirm that `ssh2` is used correctly with appropriate timeouts.
- [ ] Ensure that Docker socket connections (`unix://`) are permitted without TLS only for local daemons.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-executor`

## 5. Update Documentation
- [ ] Add a "Security Considerations for Remote Execution" section to the operator's guide.

## 6. Automated Verification
- [ ] Verify that the server binary does not link against `libssl` (since we use `rustls`).
