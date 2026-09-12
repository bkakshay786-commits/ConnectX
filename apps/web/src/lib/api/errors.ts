export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;

  public constructor(message: string, status: number, code = "api_error") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}
