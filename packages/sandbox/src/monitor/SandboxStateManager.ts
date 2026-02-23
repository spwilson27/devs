/**
 * Singleton SandboxStateManager
 */

type SandboxState = 'RUNNING' | 'PAUSED' | 'SECURITY_PAUSE' | 'STOPPED';

class SandboxStateManagerClass {
  private state: SandboxState = 'STOPPED';

  setState(state: SandboxState) {
    this.state = state;
  }

  getState(): SandboxState {
    return this.state;
  }
}

export const SandboxStateManager = new SandboxStateManagerClass();
