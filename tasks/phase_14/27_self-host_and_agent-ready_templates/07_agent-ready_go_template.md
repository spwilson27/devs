# Task: Create Agent-Ready Go Project Template (Sub-Epic: 27_Self-Host and Agent-Ready Templates)

## Covered Requirements
- [9_ROADMAP-TAS-805]

## 1. Initial Test Written
- [ ] Create `src/templates/__tests__/goTemplate.test.ts`:
  - Write a test `"Go template scaffold contains all required agent-ready files"` that:
    - Calls `TemplateEngine.scaffold("go", "/tmp/test-go-project", { moduleName: "github.com/example/test-project" })`.
    - Asserts the following files exist:
      - `devs.config.ts`
      - `mcp-server/main.go`
      - `mcp-server/tools/get_project_status.go`
      - `mcp-server/tools/run_profiler.go`
      - `mcp-server/tools/execute_query.go`
      - `scripts/bootstrap-sandbox.sh`
      - `scripts/run-mcp.sh`
      - `scripts/validate-all.sh`
      - `go.mod` (with correct module name)
      - `go.sum` (initially empty or generated)
      - `.devs/` directory (with 0700 permissions)
      - `cmd/server/main.go`
      - `internal/handler/handler.go`
      - `requirements.md` (stub)
  - Write a test `"Go template go.mod has correct module name"` that:
    - Reads the scaffolded `go.mod` and asserts line 1 is `module github.com/example/test-project`.
    - Asserts `go 1.22` or higher is declared.
  - Write a test `"Go template cmd/server/main.go compiles"` that:
    - Runs `go build ./cmd/server/` inside the scaffolded directory as a child process.
    - Asserts exit code 0.
  - Write a test `"Go template .devs directory has 0700 permissions"` that:
    - Stats `.devs/` and asserts `(mode & 0o777) === 0o700`.

## 2. Task Implementation
- [ ] Create the template source directory at `src/templates/go/` containing:
  - `devs.config.ts.ejs` — EJS template for devs config with `testCommand: "go test ./..."`, `lintCommand: "golangci-lint run"`, `buildCommand: "go build ./..."`.
  - `go.mod.ejs` — EJS template: `module <%= moduleName %>\n\ngo 1.22\n\nrequire (\n\tgithub.com/mark3labs/mcp-go v0.6.0\n)`.
  - `go.sum` — static empty file (populated by `go mod tidy` post-scaffold).
  - `mcp-server/main.go` — Go MCP server entry point using `github.com/mark3labs/mcp-go/server` package; registers tools from `tools/` package.
  - `mcp-server/tools/get_project_status.go` — implements `GetProjectStatus` tool handler returning `{"status":"ok","tasks_pending":0}`.
  - `mcp-server/tools/run_profiler.go` — implements `RunProfiler` tool handler using `runtime/pprof` to capture a 5-second CPU profile and return base64-encoded pprof data.
  - `mcp-server/tools/execute_query.go` — implements `ExecuteQuery` tool handler using `database/sql` + `modernc.org/sqlite`; enforces `SELECT`-only queries.
  - `scripts/bootstrap-sandbox.sh` — `#!/usr/bin/env bash\nset -euo pipefail\nmkdir -m 700 -p .devs\ngo mod download\ngo mod verify`.
  - `scripts/run-mcp.sh` — `#!/usr/bin/env bash\nset -euo pipefail\ngo run ./mcp-server/`.
  - `scripts/validate-all.sh` — runs `golangci-lint run`, `go test ./... -race -count=1`, exits non-zero on failure.
  - `cmd/server/main.go` — minimal HTTP server using `net/http`: `http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) { fmt.Fprint(w, "OK") })`.
  - `internal/handler/handler.go` — empty handler package with a `Handler` struct and a no-op `Handle(w http.ResponseWriter, r *http.Request)` method.
  - `requirements.md` — stub.
- [ ] Extend `TemplateEngine.scaffold()` for Go post-scaffold steps:
  - After writing all files, spawn `go mod tidy` inside `outputDir` to resolve and pin dependencies.
  - If `go mod tidy` fails, emit a warning but do not fail the scaffold (the module may not have network access in CI).

## 3. Code Review
- [ ] Confirm `mcp-server/main.go` uses the `mcp-go` SDK's `NewStdioServer()` pattern for stdio-based MCP transport.
- [ ] Confirm `execute_query.go` parses the SQL string and rejects any statement that does not begin with `SELECT` (case-insensitive), returning an MCP error response instead of executing.
- [ ] Confirm `go.mod.ejs` renders a valid `go.mod` file for any module name matching `[a-zA-Z0-9._/-]+`.
- [ ] Confirm all Go files pass `gofmt -l` (no formatting differences).
- [ ] Confirm all `.sh` scripts start with `#!/usr/bin/env bash` and `set -euo pipefail`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- --testPathPattern=goTemplate` and confirm all four tests pass.
- [ ] Run `npm run lint -- src/templates/go/` and confirm zero TypeScript lint errors.
- [ ] Scaffold a test project and confirm `go build ./cmd/server/` exits with code 0.
- [ ] Run `gofmt -l /tmp/verify-go/mcp-server/` and confirm no output (all files are formatted).

## 5. Update Documentation
- [ ] Create `docs/templates/go.md` documenting:
  - The full file tree of the Go agent-ready template.
  - How to scaffold: `devs scaffold go <project-name> --module <module-path>`.
  - The MCP server tools in Go and their purpose.
  - How to run the MCP server with `scripts/run-mcp.sh`.
- [ ] Update `docs/agent_memory/phase_14.md`: "Go agent-ready template scaffolded; Go MCP server tools implemented with pprof profiler and SQLite query support."

## 6. Automated Verification
- [ ] Run `npm run test -- --ci --testPathPattern=goTemplate` and verify exit code 0.
- [ ] Run `go build ./... 2>&1` inside `/tmp/verify-go` and assert exit code 0.
- [ ] Run `stat -f '%OLp' /tmp/verify-go/.devs` (macOS) or `stat -c '%a' /tmp/verify-go/.devs` (Linux) and assert output is `700`.
