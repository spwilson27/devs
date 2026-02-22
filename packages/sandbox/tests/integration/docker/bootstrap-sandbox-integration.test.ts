import { describe, it, expect } from 'vitest';
import { bootstrapSandbox } from '../../../src/scripts/bootstrap-sandbox';

if (process.env.DEVS_INTEGRATION_TESTS !== '1') {
  describe.skip('integration: docker bootstrap-sandbox', () => {
    it('skipped when DEVS_INTEGRATION_TESTS != 1', () => {});
  });
} else {
  describe('integration: docker bootstrap-sandbox', () => {
    it('boots docker and returns ready within 30s', async () => {
      const res = await bootstrapSandbox({ driver: 'docker' });
      expect(res.ready).toBe(true);
      expect(res.durationMs).toBeGreaterThan(0);
      expect(res.durationMs).toBeLessThan(30_000);
    });
  });
}
