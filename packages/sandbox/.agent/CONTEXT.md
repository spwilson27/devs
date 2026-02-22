# CONTEXT

## Module purpose

@devs/sandbox provides an isolated execution abstraction for shell commands and file I/O, used by the devs orchestration engine to run agent tasks in a sandboxed environment.

## Phase context

This module is the foundation for Phase 2 (Sandbox Isolation & Secret Redaction).

## Public surface

- SandboxProvider (abstract class)
- SandboxExecResult (type)
- SandboxProvisionOptions (type)

## Integration points

- @devs/core for orchestration events
- @devs/mcp for tool-call routing
