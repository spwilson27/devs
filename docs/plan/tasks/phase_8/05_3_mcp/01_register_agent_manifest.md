# Task: Add Agent-Oriented Documentation manifest and registration (Sub-Epic: 05_3_MCP)

## Covered Requirements
- [3_MCP-MCP-001], [3_MCP-TAS-001]

## 1. Initial Test Written
- [ ] Create tests/tasks/test_agent_manifest.py using pytest. The test should:
  - Use the tmp_path fixture to create an isolated temporary project root.
  - Create a minimal src/ package (e.g., src/app/__init__.py) and ensure no .agent/index.agent.md exists initially.
  - Import and invoke the public function register_agent_manifest(root_path: Path) via the CLI wrapper or direct import.
  - Assert that after invocation the file <root>/.agent/index.agent.md exists and parses successfully.
  - Parse the manifest and assert it contains the keys: `title`, `generated_at`, `registered_modules` (array), and `introspection_points` (array).
  - Assert that `registered_modules` contains an entry referencing `src/app`.

## 2. Task Implementation
- [ ] Implement function `register_agent_manifest(root_path: Path)` in `mcp/tools/agent_manifest.py`:
  - Walk `src/` and detect modules and any existing `<module>/.agent.md` files.
  - Build a deterministic manifest object with fields: `title` (string), `generated_at` (ISO8601), `registered_modules` (sorted list), `introspection_points` (list).
  - Write the manifest to `<root>/.agent/index.agent.md` using a YAML frontmatter block followed by a markdown table of modules.
  - Add a small CLI wrapper `scripts/register_agent_manifest.py` that calls the function and returns exit code 0 on success.

## 3. Code Review
- [ ] Verify that:
  - The manifest generation is deterministic (lists are sorted and timestamps are stable for testing via an injected clock or monkeypatch).
  - All filesystem paths are resolved with `pathlib.Path.resolve()` and validated to be inside the project root (no path traversal).
  - Implementation is idempotent (re-running does not duplicate entries) and has unit tests that run without network access.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest tests/tasks/test_agent_manifest.py -q` and ensure all assertions pass.

## 5. Update Documentation
- [ ] Add `docs/mcp/agent-manifest.md` describing the manifest schema, example outputs, and CLI usage. Include a small YAML frontmatter sample and instructions for agents to discover `registered_modules`.

## 6. Automated Verification
- [ ] Programmatically read `<root>/.agent/index.agent.md` after tests and assert it contains `registered_modules` and `introspection_points`. Include this check as the final assertion in the test file.