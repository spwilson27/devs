import fs from 'fs';
import { describe, it, expect } from 'vitest';
const ts = JSON.parse(fs.readFileSync(new URL('../../tsconfig.json', import.meta.url), 'utf8'));

describe('tsconfig.json integrity', () => {
  it('extends root config and has strict compiler options', () => {
    expect(ts.extends).toBe('../../tsconfig.base.json');
    expect(ts.compilerOptions).toBeDefined();
    expect(ts.compilerOptions.strict).toBe(true);
    expect(ts.compilerOptions.outDir).toBe('./dist');
    expect(ts.compilerOptions.rootDir).toBe('./src');
    expect(ts.compilerOptions.declaration).toBe(true);
  });
});
