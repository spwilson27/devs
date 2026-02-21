# Task: Implement Git Linkage and Non-Repudiation Integration (Sub-Epic: 17_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-STR-003]

## 1. Initial Test Written
- [ ] Write tests at tests/test_git_linkage.py first:
  - test_commit_metadata_includes_saop_hash(): in a temp repo, create a commit via CommitNode; assert commit message includes a line `SAOP-TRACE: <saop_hash>` whose hash matches record in saop_traces.
  - test_commit_and_saop_written_atomically(): simulate failure during commit write and ensure no orphaned saop_trace or commit metadata exists.
  - test_verify_non_repudiation(): after commit and signoff, verify signature over (saop_hash||commit_hash) using stored public key returns True.

## 2. Task Implementation
- [ ] Modify CommitNode implementation in src/nodes/commit_node.py (or equivalent) to:
  - When creating a commit, first create the commit in a temporary index and compute commit_hash.
  - Canonicalize and record SAOP trace with saop_hash and sign it with the agent identity; persist the saop_trace and the commit metadata in a single DB transaction.
  - Append commit message metadata 'SAOP-TRACE: <saop_hash>' (single-line, parsable) to the commit body.
  - Ensure commit creation and SAOP persistence are atomic: use DB transaction and filesystem atomic write operations (e.g., use git commit on temporary index then move HEAD atomically).

## 3. Code Review
- [ ] Verify:
  - Commit message metadata uses fixed prefix and small size (only saop_hash), no raw SAOP content.
  - Non-repudiation chain: saop_hash signed by agent and stored with commit_hash.
  - All operations are idempotent and race-condition safe (file locks or FileLockManager used).

## 4. Run Automated Tests to Verify
- [ ] Run tests/test_git_linkage.py and integration test that performs commit via CommitNode and then validates signature and DB entries.

## 5. Update Documentation
- [ ] Update docs/security/git_linkage.md describing the commit metadata convention, how to verify SAOP traces against commits, and the verification CLI command.

## 6. Automated Verification
- [ ] Add scripts/ci_verify_commit_links.sh that scans recent commits for SAOP-TRACE lines and validates each hash against saop_traces table and verifies signatures.
