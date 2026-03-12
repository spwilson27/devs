# Task: Core Tooling Entrypoint and Git Hygiene (Sub-Epic: 060_Detailed Domain Specifications (Part 25))

## Covered Requirements
- [2_TAS-REQ-251], [2_TAS-REQ-254]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Create a shell-based test script (or a Rust test if preferred) that verifies:
  - `./do` exists at the repository root.
  - `./do` is executable (`stat -c %a ./do` or similar).
  - The `.gitattributes` file exists and contains `do text eol=lf`.
- [ ] Verify that Git is configured to not convert line endings for this file by checking with `git check-attr -a ./do`.

## 2. Task Implementation
- [ ] Ensure the `./do` script exists at the repository root.
- [ ] Set executable permissions on `./do`: `chmod +x do`.
- [ ] Create or update `.gitattributes` at the repository root with the following content:
  ```
  ./do text eol=lf
  ```
- [ ] Verify the configuration by running `git check-attr text eol ./do`.

## 3. Code Review
- [ ] Verify that `./do` is the authoritative entrypoint for all developer tasks.
- [ ] Ensure `.gitattributes` correctly forces LF line endings for `./do` even on Windows runners to prevent script execution failures.

## 4. Run Automated Tests to Verify
- [ ] Execute the verification script/test created in step 1.
- [ ] Run `./do lint` to ensure no documentation or formatting violations were introduced.

## 5. Update Documentation
- [ ] Update `MEMORY.md` to reflect that the project entrypoint and Git hygiene configuration are complete.

## 6. Automated Verification
- [ ] Run `ls -l do` and confirm the `x` bit is set.
- [ ] Run `grep "eol=lf" .gitattributes` and confirm the rule for `./do` is present.
