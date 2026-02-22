import fs from 'fs';
import { describe, it, expect } from 'vitest';

import path from 'path';
const base = path.resolve(__dirname, '../../src/');
const required = [
  'index.ts',
  'providers/index.ts',
  'drivers/index.ts',
  'filesystem/index.ts',
  'network/index.ts',
  'types/index.ts',
  'utils/index.ts',
];

describe('src directory structure', () => {
  it('has required barrel files', () => {
    required.forEach(p => {
      const exists = fs.existsSync(path.resolve(base, p));
      expect(exists).toBe(true);
    });
  });

  it('index.ts re-exports sub-barrels', () => {
    const index = fs.readFileSync(path.resolve(__dirname, '../../src/index.ts'), 'utf8');
    ['types','providers','drivers','filesystem','network','utils'].forEach(s => {
      const patternA = `export * from './${s}';`;
      const patternB = `export * from "./${s}";`;
      expect(index.includes(patternA) || index.includes(patternB)).toBe(true);
    });
  });

  it('barrel files are non-empty', () => {
    required.filter(p => p !== 'index.ts').forEach(p => {
      const content = fs.readFileSync(path.resolve(__dirname, '../../src/' + p), 'utf8');
      expect(content.trim().length).toBeGreaterThan(0);
    });
  });
});
