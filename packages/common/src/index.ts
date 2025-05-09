export function invariant(
  condition: unknown,
  messageOrError?: string | Error
): asserts condition {
  if (condition) {
    return;
  }

  const prefix = "Invariant failed";

  if (!messageOrError) {
    throw new Error(prefix);
  }

  if (typeof messageOrError === "string") {
    throw new Error(`${prefix}: ${messageOrError}`);
  }

  throw messageOrError;
}
