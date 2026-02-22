import { describe, it, expect, vi, beforeEach } from 'vitest';
import Docker from 'dockerode';
import { DockerNetworkManager } from './DockerNetworkManager';

// Mock dockerode: provide a consistent mock instance with spies
vi.mock('dockerode', () => {
  const createNetwork = vi.fn().mockResolvedValue({ id: 'fake-network-id' });
  const removeMock = vi.fn().mockResolvedValue(undefined);
  const networkObj = { remove: removeMock };
  const getNetwork = vi.fn().mockImplementation(() => networkObj);

  const DockerMock = vi.fn().mockImplementation(() => ({
    createNetwork,
    getNetwork,
  }));

  // Expose mocks for assertions via the constructor mock
  return { default: DockerMock };
});

describe('DockerNetworkManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createIsolatedNetwork calls docker.createNetwork with bridge and Internal:true and name contains sandboxId', async () => {
    const sandboxId = 'test-sandbox-123';
    await DockerNetworkManager.createIsolatedNetwork(sandboxId);

    const DockerMock: any = (Docker as any);
    expect(DockerMock).toBeDefined();
    // Get the first constructed instance
    const instance = DockerMock.mock.instances[0];
    expect(instance.createNetwork).toHaveBeenCalledWith(expect.objectContaining({ Driver: 'bridge', Internal: true, Name: expect.stringContaining(sandboxId) }));
  });

  it('removeNetwork calls network.remove()', async () => {
    const networkId = 'net-xyz';
    await DockerNetworkManager.removeNetwork(networkId);

    const DockerMock: any = (Docker as any);
    const instance = DockerMock.mock.instances[0];
    expect(instance.getNetwork).toHaveBeenCalledWith(networkId);
    // getNetwork returns a shared networkObj whose `remove` mock should have been called
    const networkObj = instance.getNetwork(networkId);
    expect(networkObj.remove).toHaveBeenCalled();
  });

  it('getProxyContainerOptions returns host network mode, proxy env vars, and dns set', () => {
    const proxyIp = '127.0.0.53';
    const networkId = 'sandbox-net-1';
    const opts = DockerNetworkManager.getProxyContainerOptions(proxyIp, networkId) as any;

    // HostConfig.NetworkMode should equal networkId
    expect(opts.HostConfig).toBeDefined();
    expect(opts.HostConfig.NetworkMode).toBe(networkId);

    // Env should include HTTP_PROXY and HTTPS_PROXY pointing to proxyIp:3128
    expect(opts.Env).toEqual(expect.arrayContaining([`HTTP_PROXY=http://${proxyIp}:3128`, `HTTPS_PROXY=http://${proxyIp}:3128`]));

    // dns field should include proxyIp
    expect(opts.dns).toEqual([proxyIp]);
  });
});
