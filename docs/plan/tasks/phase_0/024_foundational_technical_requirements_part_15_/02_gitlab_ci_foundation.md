# Task: GitLab CI Pipeline Foundation (Jobs, Timeouts, Caching) (Sub-Epic: 024_Foundational Technical Requirements (Part 15))

## Covered Requirements
- [2_TAS-REQ-010A], [2_TAS-REQ-010C]

## Dependencies
- depends_on: ["01_posix_sh_do_script.md"]
- shared_components: ["Traceability & Verification Infrastructure"]

## 1. Initial Test Written
- [ ] Create a dummy `.gitlab-ci.yml` if it doesn't exist.
- [ ] Use a GitLab CI linter or a script to verify that the `timeout` is set to `25m` for all presubmit jobs.
- [ ] Verify that the `cache` section includes both `.cargo-cache/registry` and `target/`.

## 2. Task Implementation
- [ ] Create or update `.gitlab-ci.yml` at the repository root.
- [ ] Define the `presubmit` stage.
- [ ] Define global variables: `CARGO_HOME: "$CI_PROJECT_DIR/.cargo-cache"`.
- [ ] Create the `.presubmit_template` with:
    - `timeout: 25m`.
    - `cache: key: "$CI_JOB_NAME-$CI_COMMIT_REF_SLUG"`, `paths: [".cargo-cache/registry", "target/"]`.
- [ ] Define jobs: `presubmit-linux`, `presubmit-macos`, `presubmit-windows` using the template.
- [ ] Assign appropriate tags (`linux`, `docker`, `macos`, `windows`, `shell`) as specified in [2_TAS-REQ-010].

## 3. Code Review
- [ ] Ensure the YAML structure is clean and follows the authoritative example in the requirements.
- [ ] Verify that caching is correctly isolated per job and branch to avoid corruption.

## 4. Run Automated Tests to Verify
- [ ] Validate the `.gitlab-ci.yml` against the GitLab API linter.
- [ ] Push to a test branch in GitLab and verify that the jobs are scheduled with the correct timeout.

## 5. Update Documentation
- [ ] Update `docs/plan/requirements.md` (or relevant doc) to mark these CI foundation requirements as implemented.

## 6. Automated Verification
- [ ] Verify that the pipeline starts and the 25-minute timeout is visible in the job logs/metadata on the GitLab CI dashboard.
