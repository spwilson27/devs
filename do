#!/usr/bin/env python3
import argparse
import subprocess
import sys


def run_command(command: list[str], step_name: str) -> bool:
    print(f"\n=> Running {step_name}...")
    result = subprocess.run(command)
    if result.returncode != 0:
        print(f"\n[!] {step_name} failed with exit code {result.returncode}")
        return False
    print(f"-> {step_name} completed successfully")
    return True


def do_fmt() -> bool:
    # Update this with the appropriate formatting command (e.g., black, ruff, prettier)
    return run_command(["echo", "Running formatter... (replace me)"], "Formatter")


def do_lint() -> bool:
    # Update this with the appropriate linting command (e.g., flake8, eslint, mypy)
    return run_command(["echo", "Running linter... (replace me)"], "Linter")


def do_build() -> bool:
    # Update this with the appropriate build command (e.g., tsc, webpack, make)
    return run_command(["echo", "Running build... (replace me)"], "Build")


def do_test() -> bool:
    # Update this with the appropriate test command (e.g., pytest, jest)
    return run_command(["echo", "Running tests... (replace me)"], "Tests")


def do_coverage() -> bool:
    # Update this with the appropriate coverage command
    return run_command(["echo", "Running coverage... (replace me)"], "Coverage")


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
