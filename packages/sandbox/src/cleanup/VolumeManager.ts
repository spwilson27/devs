export class VolumeManager {
  private volumes: Map<string, Set<string>> = new Map();

  registerVolume(sandboxId: string, volumeName: string) {
    if (!this.volumes.has(sandboxId)) this.volumes.set(sandboxId, new Set());
    this.volumes.get(sandboxId)!.add(volumeName);
  }

  async removeEphemeralVolumes(sandboxId: string): Promise<void> {
    // In a real implementation this would call Docker to remove named volumes.
    // For now, just clear the registry for the given sandbox.
    if (!this.volumes.has(sandboxId)) return;
    this.volumes.delete(sandboxId);
  }

  // Helper for tests/debugging
  getVolumes(sandboxId: string): string[] {
    return Array.from(this.volumes.get(sandboxId) ?? []);
  }
}
