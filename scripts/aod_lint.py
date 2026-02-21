#!/usr/bin/env python3
"""scripts/aod_lint.py

AOD (Agent-Oriented Documentation) Linter

Enforces the 1:1 ratio between production TypeScript modules and their
corresponding .agent.md documentation files in .agent/packages/.

Mapping:
  packages/<pkg>/src/path/to/module.ts
    → .agent/packages/<pkg>/path/to/module.agent.md

Package-level overview files (.agent/packages/<pkg>/.agent.md) are excluded
from the ratio check — they document the package as a whole, not a module.

Exit codes:
  0 - All production modules have documentation; no orphan docs.
  1 - Violations found (missing docs or orphan docs).
"""

import argparse
import sys
from pathlib import Path

PACKAGES = ["core", "agents", "sandbox", "memory", "mcp", "cli", "vscode"]

# File patterns excluded from "production module" classification.
_EXCLUDE_SUFFIXES = {".test.ts", ".spec.ts", ".d.ts"}


def is_production_module(path: Path) -> bool:
    """Return True if path is a production TypeScript source file."""
    if path.suffix != ".ts":
        return False
    # Exclude test/declaration files by compound suffix (e.g. "foo.test.ts")
    name = path.name
    for exc in _EXCLUDE_SUFFIXES:
        if name.endswith(exc):
            return False
    return True


def aod_path_for_module(root: Path, pkg: str, ts_file: Path) -> Path:
    """Return the expected .agent.md path for a given source file.

    packages/core/src/pipeline.ts → .agent/packages/core/pipeline.agent.md
    packages/core/src/a/b/c.ts   → .agent/packages/core/a/b/c.agent.md
    """
    pkg_src_root = root / "packages" / pkg / "src"
    rel = ts_file.relative_to(pkg_src_root)
    aod_rel = rel.with_suffix(".agent.md")
    return root / ".agent" / "packages" / pkg / aod_rel


def module_path_for_aod(root: Path, pkg: str, aod_file: Path) -> Path | None:
    """Return the expected source file path for a given .agent.md file.

    .agent/packages/core/pipeline.agent.md → packages/core/src/pipeline.ts
    .agent/packages/core/a/b/c.agent.md    → packages/core/src/a/b/c.ts

    Returns None for directory-level overview files (any file named exactly
    ".agent.md", at any depth in the package AOD directory tree).
    """
    # Directory-level overview files are named exactly ".agent.md" at any depth.
    # (e.g. .agent/packages/core/.agent.md or .agent/packages/core/agents/.agent.md)
    # These document the directory as a whole, not a specific module.
    if aod_file.name == ".agent.md":
        return None

    aod_pkg_root = root / ".agent" / "packages" / pkg

    rel = aod_file.relative_to(aod_pkg_root)
    # Strip the ".agent.md" compound suffix → replace with ".ts"
    stem = aod_file.name[: -len(".agent.md")]
    src_rel = rel.parent / (stem + ".ts")
    return root / "packages" / pkg / "src" / src_rel


def lint(root: Path) -> list[str]:
    """Run AOD lint checks.

    Returns a list of human-readable violation messages (empty = clean).
    """
    violations: list[str] = []

    for pkg in PACKAGES:
        pkg_src = root / "packages" / pkg / "src"
        aod_pkg = root / ".agent" / "packages" / pkg

        # Forward check: every production .ts must have an .agent.md -----------
        if pkg_src.is_dir():
            for ts_file in sorted(pkg_src.rglob("*.ts")):
                if not is_production_module(ts_file):
                    continue
                expected_aod = aod_path_for_module(root, pkg, ts_file)
                if not expected_aod.exists():
                    rel_ts = ts_file.relative_to(root)
                    rel_aod = expected_aod.relative_to(root)
                    violations.append(
                        f"MISSING DOC : {rel_ts}\n"
                        f"              expected  : {rel_aod}"
                    )

        # Reverse check: every non-package-level .agent.md must have a .ts ----
        if aod_pkg.is_dir():
            for aod_file in sorted(aod_pkg.rglob("*.agent.md")):
                expected_src = module_path_for_aod(root, pkg, aod_file)
                if expected_src is None:
                    # Directory-level overview (.agent.md) — skip
                    continue
                if not expected_src.exists():
                    rel_aod = aod_file.relative_to(root)
                    rel_src = expected_src.relative_to(root)
                    violations.append(
                        f"ORPHAN DOC  : {rel_aod}\n"
                        f"              expected  : {rel_src}"
                    )

    return violations


def main() -> int:
    parser = argparse.ArgumentParser(
        description="AOD Linter — enforce 1:1 module-to-documentation ratio"
    )
    parser.add_argument(
        "--root",
        type=Path,
        default=Path.cwd(),
        help="Project root directory (default: current working directory)",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print status even when no violations are found",
    )
    args = parser.parse_args()

    root = args.root.resolve()
    violations = lint(root)

    if violations:
        print("AOD Lint: VIOLATIONS FOUND\n")
        for v in violations:
            print(f"  {v}")
        print(f"\nTotal violations: {len(violations)}")
        return 1

    if args.verbose:
        print("AOD Lint: OK — all production modules have agent documentation.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
