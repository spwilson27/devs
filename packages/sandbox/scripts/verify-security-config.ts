import { DockerDriver, buildHostConfig, DockerDriverConfig } from '../src/docker/DockerDriver';

async function main() {
  try {
    const driver = new DockerDriver({} as any);
    const defaults = (driver as any).defaultConfig as Required<DockerDriverConfig>;
    const hostConfig: any = buildHostConfig(defaults as Required<DockerDriverConfig>);

    const failures: string[] = [];

    if (!Array.isArray(hostConfig.CapDrop) || !hostConfig.CapDrop.includes('ALL')) {
      failures.push('CapDrop must include "ALL"');
    }
    if (!Array.isArray(hostConfig.SecurityOpt) || !hostConfig.SecurityOpt.includes('no-new-privileges:true')) {
      failures.push('SecurityOpt must include "no-new-privileges:true"');
    }
    if (hostConfig.PidsLimit !== 128) failures.push(`PidsLimit expected 128 got ${hostConfig.PidsLimit}`);
    if (hostConfig.Memory !== 4 * 1024 * 1024 * 1024) failures.push(`Memory expected ${4 * 1024 * 1024 * 1024} got ${hostConfig.Memory}`);
    if (hostConfig.NanoCPUs !== 2 * 1e9) failures.push(`NanoCPUs expected ${2 * 1e9} got ${hostConfig.NanoCPUs}`);
    if (hostConfig.NetworkMode !== 'none') failures.push(`NetworkMode expected 'none' got ${hostConfig.NetworkMode}`);
    if (hostConfig.Privileged !== false) failures.push(`Privileged expected false got ${hostConfig.Privileged}`);
    const expectedBind = `${defaults.hostProjectPath}:/workspace:rw`;
    if (!Array.isArray(hostConfig.Binds) || !hostConfig.Binds.includes(expectedBind)) failures.push(`Binds expected to include ${expectedBind} got ${JSON.stringify(hostConfig.Binds)}`);
    if (hostConfig.ReadonlyRootfs !== false) failures.push(`ReadonlyRootfs expected false got ${hostConfig.ReadonlyRootfs}`);

    if (failures.length > 0) {
      console.error('Security verification failed:');
      failures.forEach((f) => console.error(' -', f));
      console.error('HostConfig:', JSON.stringify(hostConfig, null, 2));
      process.exit(1);
    }

    console.log('Security verification OK');
    process.exit(0);
  } catch (err: any) {
    console.error('Error running security verification:', err?.message ?? err);
    process.exit(1);
  }
}

main();
