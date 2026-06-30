export class SessionExpiredError extends Error {
  constructor() {
    super("Sesión expirada");
    this.name = "SessionExpiredError";
  }
}
