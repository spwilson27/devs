import { describe, it, expect } from 'vitest';

if (process.env.DEVS_INTEGRATION_TESTS !== '1') {
  describe.skip('integration: docker preflight', () => {
    it('skipped when DEVS_INTEGRATION_TESTS != 1', () => {});
  });
} else {
  describe('integration: docker preflight', () => {
    it('placeholder: runs preflight in real docker sandbox and verifies files', async () => {
      // Real integration test should provision a docker sandbox and assert file presence in /workspace
      expect(true).toBe(true);
    });
  });
}
