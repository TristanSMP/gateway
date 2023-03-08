/**
 * An error safe to go to userland
 */
export class UserError extends Error {
  constructor(message: string) {
    super(message);
  }

  public static isUserError(error: unknown): error is UserError {
    return error instanceof UserError;
  }
}
