import { describe, it, expect } from 'vitest';
import { DockerDriver } from '../drivers/DockerDriver';
import { DEFAULT_SANDBOX_CONFIG } from '../config';

describe('@integration DockerDriver resource limits', () => {
  it('@integration spins up a container and validates NanoCpus and Memory', async () => {
    if (!process.env.DEVS_INTEGRATION_TESTS) {
      // Skip unless explicit environment variable set to run integration tests
      console.warn('Skipping integration test: set DEVS_INTEGRATION_TESTS=1 to run');
      return;
    }

    const driver = new DockerDriver({ memoryMb: DEFAULT_SANDBOX_CONFIG.memoryGb * 1024, cpuCount: DEFAULT_SANDBOX_CONFIG.cpuCores });
    const ctx = await driver.provision();
    try {
      const out = require('child_process').execSync(`docker inspect ${ctx.id} --format '{{json .HostConfig}}'`).toString();
      const hostConfig = JSON.parse(out);
      expect(hostConfig.NanoCPUs).toBe(DEFAULT_SANDBOX_CONFIG.cpuCores * 1e9);
      expect(hostConfig.Memory).toBe(DEFAULT_SANDBOX_CONFIG.memoryGb * 1024 * 1024 * 1024);
    } finally {
      await driver.destroy(ctx);
    }
  }, 120000);
});
