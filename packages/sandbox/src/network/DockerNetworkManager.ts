import Docker from 'dockerode';
import type { ContainerCreateOptions } from 'dockerode';

export class DockerNetworkManager {
  static async createIsolatedNetwork(sandboxId: string): Promise<string> {
    const docker = new Docker();
    const name = `devs-sandbox-${sandboxId}`;
    const network = await docker.createNetwork({ Name: name, Driver: 'bridge', Internal: true });
    // Return network id if available, otherwise return the name as fallback
    return (network as any).id || (network as any).Id || name;
  }

  static async removeNetwork(networkId: string): Promise<void> {
    const docker = new Docker();
    const network = docker.getNetwork(networkId);
    await network.remove();
  }

  static getProxyContainerOptions(proxyIp: string, networkId: string): Partial<ContainerCreateOptions> {
    const env = [
      `HTTP_PROXY=http://${proxyIp}:3128`,
      `HTTPS_PROXY=http://${proxyIp}:3128`,
      `NO_PROXY=`,
    ];

    return {
      HostConfig: {
        NetworkMode: networkId,
      } as any,
      Env: env,
      // dockerode uses `dns` (lowercase) for container create options
      dns: [proxyIp],
      NetworkingConfig: {
        EndpointsConfig: {
          [networkId]: {},
        },
      } as any,
    } as Partial<ContainerCreateOptions>;
  }
}
