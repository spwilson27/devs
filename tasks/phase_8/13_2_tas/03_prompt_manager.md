# Task: Implement PromptManager (Sub-Epic: 13_2_TAS)

## Covered Requirements
- [2_TAS-REQ-021]

## 1. Initial Test Written
- [ ] Create a unit test asserting the PromptManager API surface (versioned prompt store) exists and provides basic get/set/version behaviors.
  - Test path: tests/unit/test_prompt_manager.(py|spec.ts)
  - Behavior:
    1. Detect project language (package.json -> Node/Jest, pyproject.toml -> Python/pytest).
    2. Assert presence of class/module `PromptManager` with APIs: `get_prompt(key, version?)`, `set_prompt(key, text, version?)`, `list_versions(key)`.
    3. The test MUST fail initially if PromptManager is not implemented.

Example Jest skeleton (tests/unit/test_prompt_manager.spec.ts):
```ts
import { PromptManager } from '../../src/agents/prompt_manager';

test('PromptManager exposes versioned get/set', () => {
  const pm = new PromptManager();
  expect(typeof pm.getPrompt).toBe('function');
  expect(typeof pm.setPrompt).toBe('function');
  expect(typeof pm.listVersions).toBe('function');
});
```

Example pytest skeleton (tests/unit/test_prompt_manager.py):
```py
import importlib

def test_prompt_manager_api_surface():
    mod = importlib.import_module('agents.prompt_manager')
    assert hasattr(mod, 'PromptManager')
    pm = mod.PromptManager()
    assert hasattr(pm, 'get_prompt')
    assert hasattr(pm, 'set_prompt')
    assert hasattr(pm, 'list_versions')
```

## 2. Task Implementation
- [ ] Implement a PromptManager with a version-controlled prompt repository (simple file-backed store for this PR).
  - File: src/agents/prompt_manager.(py|ts)
  - Behavior:
    - In-memory backing map with optional persistence to configs/prompts.json (or prompts/ directory) for the purposes of local development.
    - Methods:
      - `get_prompt(key, version=None)` -> returns the prompt text for the given key and version (latest if None).
      - `set_prompt(key, text, version=None)` -> stores a new version (auto-increment or timestamped) and returns the version id.
      - `list_versions(key)` -> returns available versions for the key.
  - Persistence requirements for this task: write to configs/prompts.json atomically (in tests use a temp file or in-memory override).
  - Commit message: "tas: add PromptManager versioned prompt store (2_TAS-REQ-021)"

Implementation notes:
- Keep prompt contents plain text for now; do NOT store secrets or PII.
- Add simple JSON schema metadata: {key, version, created_at, author, content}
- Make the persistence path configurable for tests so unit tests can use a temp directory.

## 3. Code Review
- [ ] Verify:
  - API ergonomics: explicit return values and clear error handling for missing keys/versions.
  - Versioning strategy is documented and deterministic (timestamp or semantic integer increment).
  - Persistence is optional and configurable for test isolation.

## 4. Run Automated Tests to Verify
- [ ] Run the repository test command (language-detected):
  - Node: npm test -- --runTestsByPath tests/unit/test_prompt_manager.spec.ts
  - Python: pytest -q tests/unit/test_prompt_manager.py
- [ ] Confirm the test passes and prompt persistence can be toggled for tests.

## 5. Update Documentation
- [ ] Add docs/2_tas_req_021_prompt_manager.md describing:
  - API surface and example usage.
  - Persistence configuration and recommended usage patterns for system prompts.
- [ ] Add a changelog entry.

## 6. Automated Verification
- [ ] Provide scripts/verify_2_tas_req_021.sh that:
  1. Runs the prompt manager unit test.
  2. Demonstrates setting a prompt and retrieving the same prompt at two different versions.
- [ ] Script must be idempotent and CI-friendly.
