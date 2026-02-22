# DEPENDENCIES

## Upstream

- @devs/core (workspace:*) for shared event types and orchestration primitives.

## Downstream consumers

- @devs/agents uses sandbox to execute code.
- @devs/mcp uses sandbox for tool call proxying.

## External (future, driver-level only)

- dockerode (DockerDriver)
- @webcontainer/api (WebContainerDriver)
