import crypto from 'crypto';

export class SessionKeyManager {
  private store: Map<string, Buffer> = new Map();

  generateKey(): Buffer {
    return crypto.randomBytes(16);
  }

  registerKey(sandboxId: string, key: Buffer): void {
    if (this.store.has(sandboxId)) throw new Error(`Key already registered for sandbox ${sandboxId}`);
    this.store.set(sandboxId, key);
  }

  getKey(sandboxId: string): Buffer | undefined {
    return this.store.get(sandboxId);
  }

  revokeKey(sandboxId: string): void {
    const buf = this.store.get(sandboxId);
    if (!buf) return;
    // Overwrite buffer contents with zeros before removing reference to help prevent lingering secrets in memory
    try {
      buf.fill(0);
    } catch (e) {
      // ignore if fill not supported for some reason
    }
    this.store.delete(sandboxId);
    try {
      console.info(JSON.stringify({ event: 'session_key_rotated', sandboxId }));
    } catch (e) {
      // ignore logging errors
    }
  }
}

export const sessionKeyManager = new SessionKeyManager();

export default SessionKeyManager;
