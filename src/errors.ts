export class AgentHireError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'AgentHireError';
    this.status = status;
    this.code = code;
  }
}
