# Task: Implement Prompt File Header Validation in ./do lint (Sub-Epic: 05_MCP List & Filter Operations)

## Covered Requirements
- [3_MCP_DESIGN-REQ-079]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Write a test in `tests/lint/prompt_headers.rs` that verifies:
    - A prompt file starting with `<!-- devs-prompt: <name> -->` passes without warnings.
    - A prompt file without the header causes `./do lint` to emit `WARN: Prompt file missing devs-prompt header: <path>` to stderr.
    - `./do lint` still exits 0 when prompt headers are missing (warning, not error).
    - The header must be the **first line** of the file (no leading whitespace or BOM).
    - Multiple prompt files in a project are all checked.
- [ ] Write a test with edge cases:
    - Header with extra content after the comment close (should still pass).
    - Header with different casing (e.g., `DEVs-prompt`) — verify if case-sensitive or not.
    - Empty prompt file (should warn if no header).
    - Markdown file that is NOT a prompt file (verify if all `.md` files are checked or only those in prompt directories).

## 2. Task Implementation
- [ ] Add a `check_prompt_headers()` function to `./do` script (or the Rust lint tool if separate).
- [ ] Implement file discovery:
    - Scan `.devs/prompts/` directory (or configurable prompt search paths from project registry).
    - Also scan workflow-defined prompt file paths from all registered workflows.
- [ ] Implement header validation:
    - Read first line of each prompt file.
    - Match against regex: `^<!-- devs-prompt:\s+(\S+)\s*-->`.
    - Extract prompt name for potential future use (e.g., cross-reference with workflow definitions).
- [ ] Emit warning to stderr in format: `WARN: Prompt file missing devs-prompt header: <relative-path>`.
- [ ] Ensure lint exits 0 even if warnings are emitted (this is a linter warning, not an error).
- [ ] Add a `--strict` flag to `./do lint` that treats missing headers as errors (for CI enforcement later).

## 3. Code Review
- [ ] Verify that the header check does not slow down `./do lint` excessively (should complete in <1s for typical projects).
- [ ] Ensure the regex is correct and handles edge cases (multiple spaces, tabs).
- [ ] Check that symlinked prompt files are handled correctly (follow symlinks or not, consistently).
- [ ] Confirm that the warning message is actionable and includes the file path.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` on a test project with valid and invalid prompt files.
- [ ] Run `./do test` to verify the lint test suite passes.
- [ ] Verify that `./do lint --strict` fails on missing headers.

## 5. Update Documentation
- [ ] Add prompt file header format to `docs/plan/specs/3_mcp_design.md` §2.1 (Prompt Inputs).
- [ ] Document the `./do lint` behavior in the `./do` script help output and README.
- [ ] Add an example prompt file with the header to `docs/examples/`.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [3_MCP_DESIGN-REQ-079] as covered.
- [ ] Run `./do lint` on the `devs` project itself to ensure no warnings are emitted (if prompts exist).
