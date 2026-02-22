import { DockerDriver } from './drivers/DockerDriver';
import { WebContainerDriver, isWebContainerSupported } from './drivers/WebContainerDriver';
import type { SandboxProvider } from './SandboxProvider';

export function createSandboxProvider(): SandboxProvider {
  if (isWebContainerSupported()) {
    return new WebContainerDriver();
  }
  return new DockerDriver({ image: 'ghcr.io/devs-project/sandbox-base:alpine-3.19' });
}
