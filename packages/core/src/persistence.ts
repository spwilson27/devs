/**
 * @devs/core persistence helpers
 *
 * Utilities for resolving the shared state file path from any working
 * directory within the monorepo or a generated project.
 *
 * Design principle: the shared state file is always located at `.devs/state.sqlite`
 * relative to the project root. This module provides a consistent way to
 * locate the project root and derive the absolute state file path, regardless
 * of which subdirectory the caller is running from.
 *
 * Requirement: 1_PRD-REQ-INT-013 (real-time state sharing), TAS-076
 */

import { resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { STATE_FILE_PATH, DEVS_DIR } from "./constants.js";

/**
 * Synchronously reads and parses a `package.json` file.
 * Returns the parsed object, or `null` if the file cannot be read/parsed.
 */
function readPkgSync(pkgPath: string): Record<string, unknown> | null {
  try {
    const content = readFileSync(pkgPath, "utf8");
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Walks up the directory tree from `startDir` until it finds a directory
 * containing `package.json` with `"private": true` (indicating the monorepo
 * root), or until the filesystem root is reached.
 *
 * Returns the project root path, or `null` if it cannot be found.
 */
export function findProjectRoot(startDir: string): string | null {
  let current = resolve(startDir);

  while (true) {
    const candidatePkg = resolve(current, "package.json");
    if (existsSync(candidatePkg)) {
      const pkg = readPkgSync(candidatePkg);
      if (pkg !== null && pkg["private"] === true) {
        return current;
      }
    }

    const parent = resolve(current, "..");
    if (parent === current) {
      // Reached filesystem root without finding project root
      return null;
    }
    current = parent;
  }
}

/**
 * Resolves the absolute path to the shared state file from any directory.
 *
 * Walks up from `fromDir` (defaults to `process.cwd()`) to find the project
 * root, then joins with `STATE_FILE_PATH` (`.devs/state.sqlite`).
 *
 * @param fromDir - Starting directory for root search. Defaults to `process.cwd()`.
 * @returns Absolute path to the shared SQLite state file.
 * @throws {Error} If the project root cannot be located.
 */
export function resolveStatePath(fromDir: string = process.cwd()): string {
  const root = findProjectRoot(fromDir);
  if (root === null) {
    throw new Error(
      `Cannot resolve state path: project root not found from '${fromDir}'. ` +
        `Ensure you are running inside a devs project (a directory with a private package.json).`
    );
  }
  return resolve(root, STATE_FILE_PATH);
}

/**
 * Returns the absolute path to the `.devs/` Flight Recorder directory
 * from any subdirectory in the project.
 *
 * @param fromDir - Starting directory. Defaults to `process.cwd()`.
 * @returns Absolute path to the `.devs/` directory.
 * @throws {Error} If the project root cannot be located.
 */
export function resolveDevsDir(fromDir: string = process.cwd()): string {
  const root = findProjectRoot(fromDir);
  if (root === null) {
    throw new Error(
      `Cannot resolve .devs/ directory: project root not found from '${fromDir}'.`
    );
  }
  return resolve(root, DEVS_DIR);
}
