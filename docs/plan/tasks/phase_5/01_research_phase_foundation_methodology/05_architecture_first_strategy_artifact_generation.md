# Task: Architecture-First Differentiator Artifact Generation & Strategy Validation (Sub-Epic: 01_Research Phase Foundation & Methodology)

## Covered Requirements
- [8_RISKS-REQ-065], [1_PRD-REQ-PIL-001], [3_MCP-REQ-GOAL-001]

## 1. Initial Test Written
- [ ] Create `tests/phase_5/test_architecture_first_strategy.py`.
- [ ] Write `test_strategy_artifact_generator_instantiation` — import `StrategyArtifactGenerator` from `devs.agents.research.strategy_artifact_generator` and assert it can be instantiated.
- [ ] Write `test_generate_methodology_preamble_returns_string` — call `StrategyArtifactGenerator.generate_methodology_preamble(project_name="TestProject", brief="A test brief")` and assert it returns a non-empty string containing the text `"Research-First"`.
- [ ] Write `test_methodology_preamble_contains_required_sections` — call `generate_methodology_preamble()` and assert the returned string contains all of the following section headings: `"## Approach"`, `"## Why Research-First"`, `"## Research Gate Status"`.
- [ ] Write `test_generate_methodology_preamble_no_code_before_research` — assert the preamble string contains the phrase `"No implementation"` (or `"no code"`) to explicitly state the constraint per `1_PRD-REQ-PIL-001`.
- [ ] Write `test_strategy_artifact_written_to_disk` — call `StrategyArtifactGenerator.write_to_project(output_dir=tmp_path, project_name="TestProject", brief="A test brief")` and assert a file `docs/architecture_first_strategy.md` is created in `tmp_path`.
- [ ] Write `test_strategy_artifact_file_contains_preamble` — read the written file and assert it contains `"Research-First"`.
- [ ] Write `test_pipeline_writes_strategy_artifact_on_research_start` — mock `StrategyArtifactGenerator.write_to_project`, start a pipeline research phase, and assert the mock was called exactly once.
- [ ] Write `test_mcp_exposes_architecture_first_status_tool` — if MCP is configured, assert there is a registered MCP tool named `get_architecture_first_status` that returns the current research gate status.
- [ ] Confirm all tests fail (red) before implementation.

## 2. Task Implementation
- [ ] Create `devs/agents/research/strategy_artifact_generator.py`:
  - Define class `StrategyArtifactGenerator`:
    - `generate_methodology_preamble(self, project_name: str, brief: str) -> str` — returns a Markdown string with sections:
      - `## Approach`: States that devs enforces a Research-First methodology where no implementation proceeds until research is complete and approved. Cite requirements `1_PRD-REQ-PIL-001`, `3_MCP-REQ-GOAL-001`.
      - `## Why Research-First`: Explains that general-purpose AI assistants skip deep research and jump to code generation, causing architectural drift. devs differentiates by enforcing a mandatory research gate. Reference `8_RISKS-REQ-065`.
      - `## Research Gate Status`: Placeholder section showing `PENDING` (to be updated by the pipeline as status changes).
      - `## Project Brief`: Echo the user brief.
    - `write_to_project(self, output_dir: str | Path, project_name: str, brief: str) -> Path` — writes the preamble to `{output_dir}/docs/architecture_first_strategy.md`, creating directories as needed. Returns the `Path` to the written file.
- [ ] In `ResearchManager.run()` stub implementation (update stub to call the generator on start):
  - At the beginning of `run()` (before any LLM calls), instantiate `StrategyArtifactGenerator` and call `write_to_project()` to generate the strategy document in the project output directory.
  - Set `self._status = PhaseStatus.IN_PROGRESS`.
- [ ] If the project has an MCP server module (e.g., `devs/mcp/server.py`), register a tool `get_architecture_first_status` that:
  - Accepts no arguments.
  - Returns `{"status": research_manager.get_status().value, "gate_enforced": config.research_first_enforced}`.
- [ ] Export `StrategyArtifactGenerator` from `devs/agents/research/__init__.py`.

## 3. Code Review
- [ ] Confirm `generate_methodology_preamble()` is a pure function (no I/O) — `write_to_project()` handles all I/O.
- [ ] Confirm the Markdown output uses GFM (GitHub Flavored Markdown) — headings with `##`, no HTML tags.
- [ ] Confirm `write_to_project()` uses `pathlib.Path` for all path manipulation — no string concatenation of paths.
- [ ] Confirm `write_to_project()` creates parent directories with `mkdir(parents=True, exist_ok=True)` to avoid `FileNotFoundError`.
- [ ] Confirm the MCP tool (if implemented) returns the status as a string (`.value` of the enum), not the enum object, so it is JSON-serializable.
- [ ] Verify this task directly implements the strategic differentiator [8_RISKS-REQ-065]: the strategy artifact is a concrete, written output that makes the Architecture-First approach visible and auditable to users and agents.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/phase_5/test_architecture_first_strategy.py -v` and confirm all tests pass.
- [ ] Run `pytest --tb=short` (full suite) and confirm no regressions.
- [ ] Run coverage: `pytest --cov=devs.agents.research.strategy_artifact_generator --cov-report=term-missing` and confirm ≥ 90% coverage.
- [ ] Verify file creation manually: `python -c "from devs.agents.research.strategy_artifact_generator import StrategyArtifactGenerator; s = StrategyArtifactGenerator(); p = s.write_to_project('/tmp/test_devs', 'TestProj', 'Test brief'); print(p)"` and assert it prints a path ending in `architecture_first_strategy.md`.

## 5. Update Documentation
- [ ] Add `StrategyArtifactGenerator` to `docs/agents.md` with description: "Generates the Architecture-First strategy artifact (`docs/architecture_first_strategy.md`) at the start of each project's research phase. Implements [8_RISKS-REQ-065]."
- [ ] Add the generated artifact (`docs/architecture_first_strategy.md`) to the project's generated file catalog in `docs/generated_artifacts.md` (create if absent), noting it is auto-generated and should not be manually edited.
- [ ] If MCP tool `get_architecture_first_status` was implemented, document it in `docs/mcp_tools.md` (or equivalent MCP reference).
- [ ] Update agent memory file `docs/agent_memory/phase_5.md`: "StrategyArtifactGenerator writes `docs/architecture_first_strategy.md` at research phase start. MCP tool `get_architecture_first_status` exposes current gate status. This artifact is the concrete implementation of the Architecture-First Differentiator (8_RISKS-REQ-065)."

## 6. Automated Verification
- [ ] Run `pytest tests/phase_5/test_architecture_first_strategy.py -v --tb=short` and assert exit code `0`.
- [ ] Run `python -c "from devs.agents.research.strategy_artifact_generator import StrategyArtifactGenerator; print('OK')"` and assert output is `OK`.
- [ ] Run `pytest --co -q tests/phase_5/test_architecture_first_strategy.py` and assert at least 8 test items are collected.
- [ ] Run `grep -r "Research-First" devs/agents/research/strategy_artifact_generator.py` and assert it appears in at least 2 locations (in the preamble sections).
