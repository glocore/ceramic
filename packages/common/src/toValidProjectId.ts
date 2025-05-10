export function toValidProjectId(props: { from: string }) {
  const input = props.from.toLowerCase().replace(/^\/+|\/+$/g, "");

  let scope = "";
  let name = input;

  // Check if scoped
  if (input.startsWith("@")) {
    const parts = input.split("/");
    if (parts.length > 1) {
      scope = parts[0];
      name = parts.slice(1).join("/");
    }
  }

  const sanitize = (str: string) => {
    return str
      .replace(/[^a-z0-9\-._~]/g, "-") // replace invalid characters
      .replace(/^[^a-z0-9~]+/, "") // remove invalid starting chars
      .replace(/[^a-z0-9~]+$/, ""); // remove invalid trailing chars
  };

  const cleanScope = sanitize(scope);
  const cleanName = sanitize(name);

  if (cleanScope) {
    return `@${cleanScope}/${cleanName}`;
  }
  return cleanName;
}

// https://github.com/dword-design/package-name-regex/blob/5a32e6969e9dc0dc51166958606959cde5fc7d8f/src/index.js
const npmPackageRegex =
  /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

// MARK: tests
if (import.meta.vitest) {
  const { it, assert } = import.meta.vitest;

  it("handles surrounding spaces", () => {
    const from = " surrounding-spaces ";
    assert.match(toValidProjectId({ from }), npmPackageRegex);
    assert.equal(toValidProjectId({ from }), "surrounding-spaces");
  });

  it("handles inner spaces", () => {
    const from = "lots of spaces";
    assert.match(toValidProjectId({ from }), npmPackageRegex);
    assert.equal(toValidProjectId({ from }), "lots-of-spaces");
  });

  it("handles unexpected surrounding characters", () => {
    const from = "#weird!";
    assert.match(toValidProjectId({ from }), npmPackageRegex);
    assert.equal(toValidProjectId({ from }), "weird");
  });

  it("handles unexpected inner characters", () => {
    const from = "weird#symbol";
    assert.match(toValidProjectId({ from }), npmPackageRegex);
    assert.equal(toValidProjectId({ from }), "weird-symbol");
  });

  it("handles scope without name", () => {
    const from = "@scope";
    assert.match(toValidProjectId({ from }), npmPackageRegex);
    assert.equal(toValidProjectId({ from }), "scope");
  });

  it("handles scope with name", () => {
    const from = "@scope/name";
    assert.match(toValidProjectId({ from }), npmPackageRegex);
    assert.equal(toValidProjectId({ from }), "@scope/name");
  });

  it("handles scope with empty name", () => {
    const from = "@scope/";
    assert.match(toValidProjectId({ from }), npmPackageRegex);
    assert.equal(toValidProjectId({ from }), "scope");
  });

  it("handles leading slashes", () => {
    const from = "/leadingSlash";
    assert.match(toValidProjectId({ from }), npmPackageRegex);
    assert.equal(toValidProjectId({ from }), "leadingslash");
  });

  it("handles trailing slashes", () => {
    const from = "trailingSlash/";
    assert.match(toValidProjectId({ from }), npmPackageRegex);
    assert.equal(toValidProjectId({ from }), "trailingslash");
  });

  it("handles multiple inner slashes", () => {
    const from = "paths/don't/work";
    assert.match(toValidProjectId({ from }), npmPackageRegex);
    assert.equal(toValidProjectId({ from }), "paths-don-t-work");
  });

  it("handles empty string", () => {
    const from = "";
    assert.equal(toValidProjectId({ from }), "");
  });
}
