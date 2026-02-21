/**
 * @devs/core constants
 *
 * Project-wide constants shared across all packages. This is the single
 * source of truth for paths, configuration keys, and invariants that
 * must remain consistent across the CLI, VSCode extension, and MCP server.
 */

/**
 * Relative path (from project root) to the shared SQLite state database.
 * The `.devs/` directory is the Flight Recorder: it stores all runtime
 * state managed exclusively by @devs/core and @devs/memory.
 *
 * Requirement: 1_PRD-REQ-INT-013 (real-time state sharing), TAS-076
 */
export const STATE_FILE_PATH = ".devs/state.sqlite" as const;

/**
 * The name of the Flight Recorder directory that contains all runtime state.
 * Developer Agents have NO write access to this directory.
 */
export const DEVS_DIR = ".devs" as const;

/**
 * Project metadata version — tracks the version of the devs manifest schema.
 * Increment when the manifest format changes in a backwards-incompatible way.
 */
export const MANIFEST_SCHEMA_VERSION = "1.0.0" as const;
