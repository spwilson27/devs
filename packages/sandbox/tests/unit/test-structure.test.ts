import { test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

test('test directory structure and vitest config', () => {
  const base = path.resolve(__dirname, '..'); // packages/sandbox/tests
  const dirs = [
    'unit',
    'unit/providers',
    'unit/drivers',
    'unit/filesystem',
    'unit/network',
    'unit/utils',
    'integration',
    'integration/docker',
    'integration/webcontainer',
    'agent',
    'agent/sandbox-lifecycle',
  ];

  dirs.forEach(d => {
    const p = path.join(base, d);
    expect(fs.existsSync(p), `Missing dir: ${p}`).toBeTruthy();
  });

  const vitestConfig = path.resolve(__dirname, '../../vitest.config.ts');
  expect(fs.existsSync(vitestConfig), `Missing vitest.config.ts at ${vitestConfig}`).toBeTruthy();

  const cfg = fs.readFileSync(vitestConfig, 'utf8');
  expect(cfg.includes('projects') || cfg.includes('include:'), 'vitest.config.ts should define projects or include globs').toBeTruthy();
  expect(cfg.includes("provider: 'v8'") || cfg.includes('provider: "v8"') || cfg.includes('provider: "v8"')).toBeTruthy();
  expect(cfg.match(/lines\s*:\s*80/) || cfg.match(/lines\s*:\s*\[?\s*80/)).toBeTruthy();
});
