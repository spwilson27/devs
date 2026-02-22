import { describe, it, expect } from 'vitest';
import { AllowlistEngine } from './AllowlistEngine';

describe('AllowlistEngine', () => {
  it('allows and denies correctly', () => {
    const a = new AllowlistEngine(['registry.npmjs.org', 'pypi.org', 'github.com']);
    expect(a.isAllowed('registry.npmjs.org')).toBe(true);
    expect(a.isAllowed('evil.com')).toBe(false);
    expect(a.isAllowed('REGISTRY.NPMJS.ORG')).toBe(true);
    expect(a.isAllowed('api.github.com')).toBe(false);
    expect(a.isAllowed('')).toBe(false);
    expect(a.isAllowed(null as any)).toBe(false);
  });
});
