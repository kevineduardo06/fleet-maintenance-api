export class HttpError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
  }
}

export const assertFound = <T>(value: T | undefined, message: string): T => {
  if (!value) throw new HttpError(404, message);
  return value;
};
