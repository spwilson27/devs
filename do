#!/usr/bin/env python3
import argparse
import subprocess
import sys

_deps_installed = False


def ensure_deps() -> bool:
    """Install dev dependencies once per invocation (idempotent)."""
    global _deps_installed
    if _deps_installed:
        return True
    ok = run_command(["pnpm", "install", "--frozen-lockfile"], "Install Dev Dependencies")
    if ok:
        _deps_installed = True
    return ok


def run_command(command: list[str], step_name: str) -> bool:
    print(f"\n=> Running {step_name}...", flush=True)
    result = subprocess.run(command)
    if result.returncode != 0:
        print(f"\n[!] {step_name} failed with exit code {result.returncode}", flush=True)
        return False
    print(f"-> {step_name} completed successfully", flush=True)
    return True


def do_fmt() -> bool:
    # Phase 1 (infrastructure): no source files to format yet.
    # Future phases will configure prettier for TypeScript packages.
    return run_command(["echo", "fmt: no source files yet (infrastructure phase)"], "Formatter")


def do_lint() -> bool:
    # Phase 1 (infrastructure): no source files to lint yet.
    # Future phases will configure eslint for TypeScript packages.
    return run_command(["echo", "lint: no source files yet (infrastructure phase)"], "Linter")


def do_build() -> bool:
    if not ensure_deps():
        return False
    return run_command(["pnpm", "exec", "tsc", "--noEmit"], "TypeScript Type Check")



def do_test() -> bool:
    if not ensure_deps():
        return False
    if not run_command(["bash", "tests/infrastructure/verify_monorepo.sh"], "Monorepo Verification"):
        return False
    if not run_command(["bash", "tests/infrastructure/verify_folder_structure.sh"], "Folder Structure Verification"):
        return False
    if not run_command(["bash", "tests/infrastructure/verify_shared_state.sh"], "Shared State Manifest Verification"):
        return False
    if not run_command(["bash", "tests/infrastructure/verify_aod_ratio.sh"], "AOD Ratio Verification"):
        return False
    if not run_command(["pnpm", "exec", "tsc", "--noEmit", "--strict"], "TypeScript Strict Verification"):
        return False
    if not run_command(["bash", "tests/infrastructure/verify_scaffold_utility.sh"], "Scaffolding Utility Verification"):
        return False
    return run_command(["pnpm", "test"], "Unit Tests (Vitest)")



def do_coverage() -> bool:
    if not ensure_deps():
        return False
    # Phase 1 (infrastructure): coverage runs after source is implemented.
    # Future phases will configure vitest --coverage.
    return run_command(["echo", "coverage: no source files yet (infrastructure phase)"], "Coverage")


def do_presubmit() -> bool:
    print("\n=== Running Presubmit Checks ===")
    if not do_fmt():
        return False
    if not do_lint():
        return False
    if not do_build():
        return False
    if not do_test():
        return False
    if not do_coverage():
        return False

    print("\n=== Presubmit Checks Passed! ===")
    return True


def main():
    parser = argparse.ArgumentParser(description="Project task runner")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("fmt", help="Run code formatting")
    subparsers.add_parser("lint", help="Run code linting")
    subparsers.add_parser("build", help="Run build process")
    subparsers.add_parser("test", help="Run unit tests")
    subparsers.add_parser("coverage", help="Run code coverage")
    subparsers.add_parser("presubmit", help="Run all presubmit checks (fmt, lint, build, test, coverage)")

    args = parser.parse_args()

    success = False
    if args.command == "fmt":
        success = do_fmt()
    elif args.command == "lint":
        success = do_lint()
    elif args.command == "build":
        success = do_build()
    elif args.command == "test":
        success = do_test()
    elif args.command == "coverage":
        success = do_coverage()
    elif args.command == "presubmit":
        success = do_presubmit()

    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()
