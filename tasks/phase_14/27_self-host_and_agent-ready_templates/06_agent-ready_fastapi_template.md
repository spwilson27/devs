# Task: Create Agent-Ready FastAPI Project Template (Sub-Epic: 27_Self-Host and Agent-Ready Templates)

## Covered Requirements
- [9_ROADMAP-TAS-805]

## 1. Initial Test Written
- [ ] Create `src/templates/__tests__/fastapiTemplate.test.ts`:
  - Write a test `"FastAPI template scaffold contains all required agent-ready files"` that:
    - Calls `TemplateEngine.scaffold("fastapi", "/tmp/test-fastapi-project")`.
    - Asserts the following files exist:
      - `devs.config.ts`
      - `mcp_server/__init__.py`
      - `mcp_server/tools/get_project_status.py`
      - `mcp_server/tools/run_profiler.py`
      - `mcp_server/tools/execute_query.py`
      - `scripts/bootstrap-sandbox.sh`
      - `scripts/run-mcp.sh`
      - `scripts/validate-all.sh`
      - `pyproject.toml` (with a `[tool.devs]` section)
      - `.devs/` directory (with 0700 permissions)
      - `app/main.py`
      - `app/routers/__init__.py`
      - `requirements.txt`
      - `requirements-dev.txt`
      - `requirements.md` (stub)
  - Write a test `"FastAPI template pyproject.toml has devs section"` that:
    - Reads the scaffolded `pyproject.toml` and parses it as TOML.
    - Asserts `tool.devs.config === "devs.config.ts"` and `tool.devs.agent_model === "gemini-3-pro"`.
  - Write a test `"FastAPI template app/main.py is valid Python syntax"` that:
    - Reads `app/main.py` and invokes `python3 -c "import ast; ast.parse(open('app/main.py').read())"` as a child process.
    - Asserts exit code 0.
  - Write a test `"FastAPI template .devs directory has 0700 permissions"` that:
    - Stats `.devs/` and asserts `(mode & 0o777) === 0o700`.

## 2. Task Implementation
- [ ] Create the template source directory at `src/templates/fastapi/` containing:
  - `devs.config.ts.ejs` — EJS template for the devs config (same schema as Next.js template, with `testCommand: "pytest"`, `lintCommand: "ruff check ."`, `buildCommand: ""`).
  - `mcp_server/__init__.py` — Python MCP server package init.
  - `mcp_server/server.py` — MCP server entry point using the `mcp` Python SDK; registers all tool handlers.
  - `mcp_server/tools/get_project_status.py` — implements `get_project_status` tool: returns JSON with `{ "status": "ok", "tasks_pending": 0 }`.
  - `mcp_server/tools/run_profiler.py` — implements `run_profiler` tool: runs `cProfile` on the specified module and returns stats as JSON.
  - `mcp_server/tools/execute_query.py` — implements `execute_query` tool: executes a read-only SQL query against the project's SQLite state DB and returns results as JSON.
  - `scripts/bootstrap-sandbox.sh` — `#!/usr/bin/env bash\nset -euo pipefail\nmkdir -m 700 -p .devs\npython3 -m venv .devs/venv\nsource .devs/venv/bin/activate\npip install -r requirements.txt -r requirements-dev.txt`.
  - `scripts/run-mcp.sh` — `#!/usr/bin/env bash\nset -euo pipefail\npython3 -m mcp_server.server`.
  - `scripts/validate-all.sh` — runs `ruff check .`, `pytest --tb=short`, exits non-zero on any failure.
  - `pyproject.toml.ejs` — TOML template with `[tool.devs]` section, `[tool.ruff]`, `[tool.pytest.ini_options]`.
  - `app/main.py` — minimal FastAPI app: `from fastapi import FastAPI\napp = FastAPI()\n@app.get("/")\ndef root(): return {"status": "ok"}`.
  - `app/routers/__init__.py` — empty init.
  - `requirements.txt` — pinned versions for `fastapi`, `uvicorn[standard]`, `mcp`.
  - `requirements-dev.txt` — pinned versions for `pytest`, `httpx`, `ruff`.
  - `requirements.md` — stub.
- [ ] Extend `TemplateEngine.scaffold()` to handle Python-specific post-scaffold steps:
  - If `templateName === "fastapi"`, run `chmod 700 <outputDir>/.devs` (already done by shared logic).
  - Do NOT run `npm install` for Python templates.

## 3. Code Review
- [ ] Confirm `mcp_server/server.py` uses `asyncio`-based handlers compatible with the `mcp` Python SDK's `Server` class.
- [ ] Confirm `execute_query.py` enforces read-only mode by opening the SQLite DB with `sqlite3.connect(db_path, check_same_thread=False)` and wrapping all queries in a `SELECT`-only allowlist check before execution.
- [ ] Confirm all `.sh` scripts start with `#!/usr/bin/env bash` and `set -euo pipefail`.
- [ ] Confirm `pyproject.toml.ejs` renders valid TOML for any alphanumeric `projectName`.
- [ ] Confirm no Python files have syntax errors (verified by `ast.parse` in tests).

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- --testPathPattern=fastapiTemplate` and confirm all four tests pass.
- [ ] Run `npm run lint -- src/templates/fastapi/` and confirm zero TypeScript lint errors.
- [ ] Scaffold a test project: `node -e "const {TemplateEngine} = require('./dist/templates/TemplateEngine'); new TemplateEngine().scaffold('fastapi', '/tmp/verify-fastapi')"` and confirm exit code 0.
- [ ] Run `python3 -m py_compile /tmp/verify-fastapi/app/main.py` and confirm exit code 0.

## 5. Update Documentation
- [ ] Create `docs/templates/fastapi.md` documenting:
  - The full file tree of the FastAPI agent-ready template.
  - How to scaffold: `devs scaffold fastapi <project-name>`.
  - The MCP server tools in Python and their purpose.
  - How to activate the virtual environment and run the MCP server.
- [ ] Update `docs/agent_memory/phase_14.md`: "FastAPI agent-ready template scaffolded; Python MCP server tools implemented."

## 6. Automated Verification
- [ ] Run `npm run test -- --ci --testPathPattern=fastapiTemplate` and verify exit code 0.
- [ ] Run `stat -f '%OLp' /tmp/verify-fastapi/.devs` (macOS) or `stat -c '%a' /tmp/verify-fastapi/.devs` (Linux) and assert output is `700`.
