import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { simpleGit } from 'simple-git';

import { createDatabase, closeDatabase } from '../../packages/core/src/persistence/database.js';
import { initializeSchema } from '../../packages/core/src/persistence/schema.js';
import { StateRepository } from '../../packages/core/src/persistence/state_repository.js';
import { FoundationValidator } from '../../packages/core/src/lifecycle/validators/FoundationValidator';

function makeTestDbPath(): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return path.resolve(os.tmpdir(), `devs-foundation-test-${unique}`, '.devs', 'state.sqlite');
}

async function initTmpRepo(dir: string) {
  const sg = simpleGit(dir);
  await sg.init();
  await sg.addConfig('user.name', 'devs-test', false, 'local');
  await sg.addConfig('user.email', 'devs-test@local', false, 'local');
  return sg;
}

describe('Foundation DoD validator', () => {
  it('returns true when Phase 1 & 2 tasks are all completed', async () => {
    const testDbPath = makeTestDbPath();
    const db = createDatabase({ dbPath: testDbPath });
    initializeSchema(db);
    const repo = new StateRepository(db);

    const projectId = repo.upsertProject({ name: 'Foundation Complete' });
    repo.saveEpics([
      { project_id: projectId, name: 'Phase 1', order_index: 1, status: 'pending' },
      { project_id: projectId, name: 'Phase 2', order_index: 2, status: 'pending' },
    ]);

    const afterEpics = repo.getProjectState(projectId)!;
    const [ep1, ep2] = afterEpics.epics;

    repo.saveTasks([
      { epic_id: ep1.id!, title: 'p1-t1', status: 'completed' },
      { epic_id: ep1.id!, title: 'p1-t2', status: 'completed' },
      { epic_id: ep2.id!, title: 'p2-t1', status: 'completed' },
      { epic_id: ep2.id!, title: 'p2-t2', status: 'completed' },
    ]);

    db.close();
    closeDatabase();

    const testRoot = path.resolve(path.dirname(testDbPath), '..');
    // create minimal project scaffold and packages
    fs.mkdirSync(path.join(testRoot, 'packages', 'core'), { recursive: true });
    fs.mkdirSync(path.join(testRoot, 'packages', 'cli'), { recursive: true });
    fs.writeFileSync(path.join(testRoot, 'package.json'), JSON.stringify({ name: 'test-project', private: true }));
    fs.writeFileSync(path.join(testRoot, 'packages', 'core', 'package.json'), JSON.stringify({ name: '@devs/core' }));
    fs.writeFileSync(path.join(testRoot, 'packages', 'cli', 'package.json'), JSON.stringify({ name: '@devs/cli' }));

    const sg = await initTmpRepo(testRoot);
    fs.writeFileSync(path.join(testRoot, 'README.md'), '# test');
    await sg.add('.');
    await sg.commit('chore: initial commit');

    const v = new FoundationValidator();
    const res = await v.validate({ dbPath: testDbPath, fromDir: testRoot, milestone: 'M1' });
    expect(res.passed).toBe(true);
    expect(res.errors.length).toBe(0);

    // cleanup
    try {
      fs.rmSync(path.resolve(path.dirname(testDbPath), '..'), { recursive: true, force: true });
    } catch (e) {
      // ignore
    }
  });

  it('fails when a core table is missing and reports the missing table', async () => {
    const testDbPath = makeTestDbPath();
    const db = createDatabase({ dbPath: testDbPath });
    initializeSchema(db);

    // Drop tasks table to simulate missing core table
    db.prepare('DROP TABLE IF EXISTS tasks').run();
    db.close();
    closeDatabase();

    const testRoot = path.resolve(path.dirname(testDbPath), '..');
    fs.mkdirSync(path.join(testRoot, 'packages', 'core'), { recursive: true });
    fs.mkdirSync(path.join(testRoot, 'packages', 'cli'), { recursive: true });
    fs.writeFileSync(path.join(testRoot, 'package.json'), JSON.stringify({ name: 'test-project', private: true }));
    fs.writeFileSync(path.join(testRoot, 'packages', 'core', 'package.json'), JSON.stringify({ name: '@devs/core' }));
    fs.writeFileSync(path.join(testRoot, 'packages', 'cli', 'package.json'), JSON.stringify({ name: '@devs/cli' }));

    const sg = await initTmpRepo(testRoot);
    fs.writeFileSync(path.join(testRoot, 'README.md'), '# test');
    await sg.add('.');
    await sg.commit('chore: initial commit');

    const v = new FoundationValidator();
    const res = await v.validate({ dbPath: testDbPath, fromDir: testRoot, milestone: 'M1' });
    expect(res.passed).toBe(false);
    expect(res.errors.some((e) => e.includes('Missing core table'))).toBe(true);

    try {
      fs.rmSync(path.resolve(path.dirname(testDbPath), '..'), { recursive: true, force: true });
    } catch (e) {
      // ignore
    }
  });

  it('fails when a Phase 1 task is not completed and reports incomplete tasks', async () => {
    const testDbPath = makeTestDbPath();
    const db = createDatabase({ dbPath: testDbPath });
    initializeSchema(db);
    const repo = new StateRepository(db);

    const projectId = repo.upsertProject({ name: 'Foundation Incomplete' });
    repo.saveEpics([
      { project_id: projectId, name: 'Phase 1', order_index: 1, status: 'pending' },
      { project_id: projectId, name: 'Phase 2', order_index: 2, status: 'pending' },
    ]);

    const afterEpics = repo.getProjectState(projectId)!;
    const [ep1, ep2] = afterEpics.epics;

    // one P1 task is failed
    repo.saveTasks([
      { epic_id: ep1.id!, title: 'p1-t1', status: 'completed' },
      { epic_id: ep1.id!, title: 'p1-t2', status: 'failed' },
      { epic_id: ep2.id!, title: 'p2-t1', status: 'completed' },
    ]);

    db.close();
    closeDatabase();

    const testRoot = path.resolve(path.dirname(testDbPath), '..');
    fs.mkdirSync(path.join(testRoot, 'packages', 'core'), { recursive: true });
    fs.mkdirSync(path.join(testRoot, 'packages', 'cli'), { recursive: true });
    fs.writeFileSync(path.join(testRoot, 'package.json'), JSON.stringify({ name: 'test-project', private: true }));
    fs.writeFileSync(path.join(testRoot, 'packages', 'core', 'package.json'), JSON.stringify({ name: '@devs/core' }));
    fs.writeFileSync(path.join(testRoot, 'packages', 'cli', 'package.json'), JSON.stringify({ name: '@devs/cli' }));

    const sg = await initTmpRepo(testRoot);
    fs.writeFileSync(path.join(testRoot, 'README.md'), '# test');
    await sg.add('.');
    await sg.commit('chore: initial commit');

    const v = new FoundationValidator();
    const res = await v.validate({ dbPath: testDbPath, fromDir: testRoot, milestone: 'M1' });
    expect(res.passed).toBe(false);
    expect(res.errors.some((e) => e.toLowerCase().includes('incomplete'))).toBe(true);

    try {
      fs.rmSync(path.resolve(path.dirname(testDbPath), '..'), { recursive: true, force: true });
    } catch (e) {
      // ignore
    }
  });
});
