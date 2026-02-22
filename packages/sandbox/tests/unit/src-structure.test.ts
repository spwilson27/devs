import fs from 'fs';
import { describe, it, expect } from 'vitest';

const base = new URL('../../src/', import.meta.url);
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
      const exists = fs.existsSync(new URL(p, base));
      expect(exists).toBe(true);
    });
  });

  it('index.ts re-exports sub-barrels', () => {
    const index = fs.readFileSync(new URL('../../src/index.ts', import.meta.url), 'utf8');
    ['types','providers','drivers','filesystem','network','utils'].forEach(s => {
      const patternA = `export * from './${s}';`;
      const patternB = `export * from "./${s}";`;
      expect(index.includes(patternA) || index.includes(patternB)).toBe(true);
    });
  });

  it('barrel files are non-empty', () => {
    required.filter(p => p !== 'index.ts').forEach(p => {
      const content = fs.readFileSync(new URL('../../src/' + p, import.meta.url), 'utf8');
      expect(content.trim().length).toBeGreaterThan(0);
    });
  });
});
