export class PreflightError extends Error {
  public sandboxId: string;
  public step: string;

  constructor(message: string, sandboxId: string, step: string) {
    super(message);
    this.name = 'PreflightError';
    this.sandboxId = sandboxId;
    this.step = step;
    Object.setPrototypeOf(this, PreflightError.prototype);
  }
}
