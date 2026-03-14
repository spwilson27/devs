# Sub-Epic: 05_MCP List & Filter Operations

## Overview
This sub-epic implements MCP tools and validation mechanisms for listing and filtering workflow runs, managing pool state awareness, and enforcing safe server restart procedures. The tasks ensure agents can effectively observe system state and follow safe development practices.

## Covered Requirements
| Requirement ID | Description | Task File |
|----------------|-------------|-----------|
| [3_MCP_DESIGN-REQ-054] | `.devs_context.json` file contains outputs of all completed dependency stages | `05_context_file_generation.md` |
| [3_MCP_DESIGN-REQ-079] | Prompt files MUST include `<!-- devs-prompt: <name> -->` comment as first line | `06_prompt_header_validation.md` |
| [3_MCP_DESIGN-REQ-AC-1.01] | `get_run` response for `Running` run contains all fields; `completed_at` is JSON `null` | `07_get_run_response_completeness.md` |
| [3_MCP_DESIGN-REQ-085] | Agent MUST call `get_pool_state` before submitting first task in batch | `08_pool_state_pre_submission.md` |
| [3_MCP_DESIGN-REQ-086] | Agent MUST complete `build-only → unit-test-crate → e2e-all → presubmit-check` before server restart | `09_server_restart_validation.md` |

## Task List
1. `01_list_runs_pagination.md` - Implement list_runs pagination support
2. `02_list_runs_filtering_sorting.md` - Implement list_runs filtering and sorting
3. `03_list_workflows_tool.md` - Implement list_workflows MCP tool
4. `04_workflow_definition_normalization.md` - Implement get_workflow_definition normalization
5. `05_context_file_generation.md` - Implement `.devs_context.json` file generation
6. `06_prompt_header_validation.md` - Implement prompt file header validation in `./do lint`
7. `07_get_run_response_completeness.md` - Implement get_run response completeness validation
8. `08_pool_state_pre_submission.md` - Implement get_pool_state pre-submission validation
9. `09_server_restart_validation.md` - Implement server restart validation sequence

## Dependencies
- **Internal**: Tasks 01-04 provide foundational list/filter capabilities used by tasks 05-09.
- **External**: 
  - `devs-mcp` - MCP tool implementations
  - `devs-core` - Domain types and state machines
  - `devs-proto` - Protobuf definitions
  - `devs-scheduler` - Workflow scheduling engine
  - `devs-pool` - Agent pool management
  - `devs-executor` - Execution environment management
  - `./do Entrypoint Script` - Linting and validation infrastructure

## Shared Components
This sub-epic **consumes** the following shared components:
- `devs-mcp` - MCP server implementation
- `devs-core` - Domain types
- `devs-proto` - Protobuf definitions
- `devs-scheduler` - DAG scheduler
- `devs-pool` - Agent pool routing
- `devs-executor` - Execution environments
- `./do Entrypoint Script` - CI/CD automation

This sub-epic does **not** own any shared components from the SHARED_COMPONENTS manifest.

## Acceptance Criteria
- All 5 requirements ([3_MCP_DESIGN-REQ-054], [3_MCP_DESIGN-REQ-079], [3_MCP_DESIGN-REQ-AC-1.01], [3_MCP_DESIGN-REQ-085], [3_MCP_DESIGN-REQ-086]) have passing tests.
- `target/traceability.json` shows 100% coverage for these requirements.
- All new code meets 90% unit coverage gate.
- E2E tests verify MCP tool behavior through the external interface.
- `./do presubmit` passes with all new tests included.
