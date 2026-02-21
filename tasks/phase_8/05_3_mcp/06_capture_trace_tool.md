# Task: Implement capture_trace profiling tool and RefactorNode integration (Sub-Epic: 05_3_MCP)

## Covered Requirements
- [3_MCP-MCP-009], [3_MCP-TAS-001]

## 1. Initial Test Written
- [ ] Create `tests/tasks/test_capture_trace_tool.py` using pytest and `psutil` or a lightweight sampling approach:
  - Implement a short synthetic workload script `tests/fixtures/worker_load.py` that allocates memory and runs a CPU loop for <1s.
  - Test `mcp.tools.capture_trace.capture_trace(command: List[str], output_dir: Path, thresholds: dict)` to:
    - Produce a trace artifact at `<output_dir>/<timestamp>.trace.json` containing samples of CPU and memory over time.
    - Return metadata: `{peak_memory_bytes, execution_time_ms, trace_path}`.
    - If `peak_memory_bytes` or `execution_time_ms` exceeds test-provided thresholds, raise `PerformanceThresholdExceeded` and ensure calling code marks the task as `FAILED_PERFORMANCE` in the SQLite `tasks` table.

## 2. Task Implementation
- [ ] Implement `mcp/tools/capture_trace.py`:
  - Provide `capture_trace(command, output_dir, thresholds)` which starts the command as subprocess, samples resource usage via `psutil.Process(pid).memory_info()` and `cpu_percent()` at short intervals, writes a JSON trace to disk, and returns the metadata dict.
  - Wire a thin ProjectServer endpoint `/mcp/capture_trace` that accepts `command` and `thresholds` and invokes `capture_trace`.
  - Add integration in `RefactorNode` so the Reviewer Agent may call `capture_trace` during the Refactor phase and the orchestrator evaluates thresholds and sets `FAILED_PERFORMANCE` as required.

## 3. Code Review
- [ ] Verify:
  - Trace files are size-limited and sanitized (no secrets captured).
  - Sampling frequency is configurable and defaults to a conservative value (e.g., 50ms).
  - Tool fails fast on misconfigured commands and uses timeouts to avoid long-running profiling in CI.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest tests/tasks/test_capture_trace_tool.py -q` and confirm trace generation and threshold behavior.

## 5. Update Documentation
- [ ] Add `docs/mcp/capture-trace.md` describing the API, thresholds JSON format, how to invoke via ProjectServer, and examples of interpreting the trace JSON.

## 6. Automated Verification
- [ ] CI should run a synthetic workload via `capture_trace` and assert a trace file is produced and that thresholds are correctly enforced (i.e., function raises when expected).