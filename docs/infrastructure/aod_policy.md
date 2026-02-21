# AOD Policy — Agent-Oriented Documentation

## What is AOD?

Agent-Oriented Documentation (AOD) is a project-wide invariant that ensures
every production source module has a corresponding machine-readable
documentation file (`.agent.md`). This allows AI agents to introspect the
codebase with the same depth as human developers, without relying on inference
alone.

AOD is the "Flight Recorder for code" — just as `.devs/` captures runtime
state, `.agent/packages/` captures structural intent, design decisions, and
agent guidelines for every module.

## The 1:1 Ratio Rule

**For every production TypeScript module in `packages/<pkg>/src/`, there must
be exactly one corresponding `.agent.md` file in `.agent/packages/<pkg>/`.**

This is a hard invariant enforced by:
- `scripts/aod_lint.py` — the primary linter
- `tests/infrastructure/verify_aod_ratio.sh` — the verification test
- `./do test` — runs verification on every presubmit

### What counts as a "production module"?

A production module is any `.ts` file in a package's `src/` directory that is
NOT one of the following:
- Test files: `*.test.ts`, `*.spec.ts`
- TypeScript declarations: `*.d.ts`

### What does NOT count toward the ratio?

- Package-level overview files (`.agent/packages/<pkg>/.agent.md`) — these
  describe the package as a whole and are excluded from the 1:1 check.
- Files outside `packages/*/src/` directories.

## File Mapping

```
packages/<pkg>/src/<path>/<module>.ts
  → .agent/packages/<pkg>/<path>/<module>.agent.md
```

### Examples

| Source Module | AOD File |
|---|---|
| `packages/core/src/pipeline.ts` | `.agent/packages/core/pipeline.agent.md` |
| `packages/agents/src/research.ts` | `.agent/packages/agents/research.agent.md` |
| `packages/core/src/agents/runner.ts` | `.agent/packages/core/agents/runner.agent.md` |

## `.agent.md` File Format

All `.agent.md` files must use YAML front-matter for machine-readability,
followed by markdown sections for human/AI readability.

### Package-Level Overview Format

```markdown
---
package: "@devs/<name>"
type: package-overview
status: placeholder | active
created: YYYY-MM-DD
---

# @devs/<name> — Agent Documentation

## Package Purpose
<One paragraph describing the package's role in the system.>

## Responsibilities
<Bullet list of what this package owns.>

## Key Constraints
<Hard rules that must not be violated.>

## Consumers
<Table: who depends on this package and why.>

## AOD Convention
<Reminder of the 1:1 mapping rule for this package.>
```

### Module-Level Documentation Format

```markdown
---
module: packages/<pkg>/src/<path>/<module>.ts
package: "@devs/<pkg>"
type: module
status: active
created: YYYY-MM-DD
modified: YYYY-MM-DD
---

# <ModuleName>

## Purpose
<What this module does and why it exists.>

## Exports
<List of exported functions, classes, or types with one-line descriptions.>

## Design Decisions
<Why was this approach chosen? What alternatives were considered?>

## Agent Guidelines
<Instructions for AI agents working in this module: patterns to follow,
things to avoid, gotchas.>

## Dependencies
<What this module imports and why.>
```

## Directory Structure

```
.agent/
  memory.md                   ← Shared long-term agent memory (all agents)
  packages/
    core/
      .agent.md               ← Package-level overview
      pipeline.agent.md       ← Per-module doc (added when src/pipeline.ts exists)
      agents/
        runner.agent.md       ← Nested module doc (mirrors src/ structure)
    agents/
      .agent.md
    sandbox/
      .agent.md
    memory/
      .agent.md
    mcp/
      .agent.md
    cli/
      .agent.md
    vscode/
      .agent.md
```

## Enforcement

### CI/CD Integration

`./do test` runs `tests/infrastructure/verify_aod_ratio.sh`, which:
1. Verifies `.agent/packages/` directory structure.
2. Verifies all package-level `.agent.md` overview files exist.
3. Runs `scripts/aod_lint.py` to check the 1:1 ratio.
4. Fails the build if any violation is found.

This check is part of `./do presubmit` and will block PRs that violate the
AOD invariant.

### Running Manually

```bash
# Check AOD ratio:
python3 scripts/aod_lint.py --verbose

# Run AOD infrastructure verification:
bash tests/infrastructure/verify_aod_ratio.sh
```

## Why AOD Matters

1. **Agent introspection:** AI developer agents can read `.agent.md` files to
   understand module intent without parsing source code alone.
2. **Decision preservation:** Design decisions are captured at write time, not
   reconstructed at read time. This prevents architectural drift.
3. **Scope enforcement:** Agents can verify they are working within their
   assigned scope by cross-referencing AOD files.
4. **Automated validation:** The 1:1 invariant can be verified mechanically,
   making it impossible to "forget" documentation.

## Requirement Coverage

This policy fulfills `[9_ROADMAP-REQ-041]`.
