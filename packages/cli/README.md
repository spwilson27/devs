# @devs/cli

CLI for devs (headless-first). Usage:

- Initialize a project flight recorder: `devs init` (creates `.devs/` and `.devs/state.sqlite`)
- Use `devs init --force` to reinitialize if necessary.

Implementation notes:
- Business logic lives in `@devs/core`; the CLI only handles filesystem and user feedback.
- The `init` command creates `.devs/` with 0700 permissions, writes a `.gitignore` entry for `.devs` if missing, and initializes the SQLite state store.
