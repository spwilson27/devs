#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

const { TempDirManager } = require('../dist/TempDirManager.cjs');

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch (e) {
    return false;
  }
}

async function test_create_returns_path_inside_tmp() {
  const dir = await TempDirManager.create('agent-xyz');
  try {
    const resolved = path.resolve(dir);
    const tmp = path.resolve(os.tmpdir());
    assert(resolved.startsWith(tmp), `Expected ${resolved} to start with ${tmp}`);
  } finally {
    await TempDirManager.purge(dir);
  }
}

async function test_create_directory_has_0700_permissions() {
  const dir = await TempDirManager.create('agent-xyz');
  try {
    const stat = await fs.stat(dir);
    const mode = stat.mode & 0o777;
    assert.strictEqual(mode, 0o700, `Expected mode 700, got ${mode.toString(8)}`);
  } finally {
    await TempDirManager.purge(dir);
  }
}

async function test_create_uses_provided_prefix() {
  const dir = await TempDirManager.create('agent-xyz');
  try {
    const base = path.basename(dir);
    assert(/^devs-agent-xyz-/.test(base), `basename ${base} did not match prefix`);
  } finally {
    await TempDirManager.purge(dir);
  }
}

async function test_purge_removes_directory_and_contents() {
  const dir = await TempDirManager.create('agent-xyz');
  // write file
  await fs.writeFile(path.join(dir, 'file.txt'), 'x');
  await TempDirManager.purge(dir);
  const ok = await exists(dir);
  assert(!ok, 'Directory still exists after purge');
}

async function test_purge_is_idempotent() {
  const dir = await TempDirManager.create('agent-xyz');
  await TempDirManager.purge(dir);
  // second call should not throw
  await TempDirManager.purge(dir);
}

async function test_purgeAll_purges_all_directories() {
  const d1 = await TempDirManager.create('a1');
  const d2 = await TempDirManager.create('a2');
  const d3 = await TempDirManager.create('a3');
  await TempDirManager.purgeAll();
  assert(!(await exists(d1)), 'd1 still exists');
  assert(!(await exists(d2)), 'd2 still exists');
  assert(!(await exists(d3)), 'd3 still exists');
}

async function test_create_rejects_path_traversal() {
  let threw = false;
  try {
    await TempDirManager.create('../../etc/passwd');
  } catch (e) {
    threw = true;
    assert(/invalid prefix/.test(String(e.message)), 'Error message did not contain "invalid prefix"');
  }
  assert(threw, 'Expected create to throw for invalid prefix');
}

async function main() {
  try {
    await test_create_returns_path_inside_tmp();
    await test_create_directory_has_0700_permissions();
    await test_create_uses_provided_prefix();
    await test_purge_removes_directory_and_contents();
    await test_purge_is_idempotent();
    await test_purgeAll_purges_all_directories();
    await test_create_rejects_path_traversal();
    console.log('ALL TESTS PASSED');
    process.exit(0);
  } catch (e) {
    console.error('TEST SUITE FAILED');
    console.error(e && e.stack ? e.stack : e);
    process.exit(1);
  }
}

main();