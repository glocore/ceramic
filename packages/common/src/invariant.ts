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

// MARK: tests
if (import.meta.vitest) {
  const { it, assert, describe, expectTypeOf } = import.meta.vitest;

  it("does not throw when the condition is met", () => {
    assert.doesNotThrow(() => invariant(true));
  });

  describe("falsy condition", () => {
    it("throws a default error if none is supplied", () => {
      assert.throws(() => invariant(false), "Invariant failed");
    });

    it("throws an error with the supplied error message", () => {
      assert.throws(() => invariant(false, "wtf"), "Invariant failed: wtf");
    });

    it("throws the supplied error object", () => {
      class CustomError extends Error {}
      assert.throws(
        () => invariant(false, new CustomError("wtf")),
        CustomError,
        "wtf"
      );
    });
  });

  it("provides a type-guard", () => {
    const a: string | undefined = "blah";

    invariant(typeof a === "string");

    expectTypeOf(a).toEqualTypeOf<string>();
  });
}
