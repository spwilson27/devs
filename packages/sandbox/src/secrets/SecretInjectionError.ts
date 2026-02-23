export class SecretInjectionError extends Error {
  public sandboxId: string;
  public method: 'stdin' | 'ephemeral_file';

  constructor(message: string, sandboxId: string, method: 'stdin' | 'ephemeral_file') {
    super(message);
    this.name = 'SecretInjectionError';
    this.sandboxId = sandboxId;
    this.method = method;
  }
}
