---
package: "@devs/core"
module: "constants"
type: module-doc
status: active
created: 2026-02-21
requirements: ["1_PRD-REQ-INT-013", "TAS-076"]
---

# constants.ts — @devs/core Project-Wide Constants

## Purpose

Single source of truth for project-wide path constants and configuration keys
shared across all packages. Consumers must import from here — never hardcode.

## Exports

| Symbol                  | Value                    | Description                                    |
|-------------------------|--------------------------|------------------------------------------------|
| `STATE_FILE_PATH`       | `".devs/state.sqlite"`   | Relative path to shared SQLite state database  |
| `DEVS_DIR`              | `".devs"`                | Flight Recorder directory name                 |
| `MANIFEST_SCHEMA_VERSION` | `"1.0.0"`              | Version of the devs manifest schema            |

## Usage Rule

All packages that need the state file path MUST import `STATE_FILE_PATH` from
`@devs/core`. Hardcoding `.devs/state.sqlite` anywhere else is a violation.

## Related Modules

- `persistence.ts` — uses `STATE_FILE_PATH` and `DEVS_DIR` to resolve absolute paths.
