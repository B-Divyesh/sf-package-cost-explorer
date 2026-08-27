import { describe, expect, it } from "vitest";
import { untar } from "./archive";

function tarFile(name: string, content: string): Uint8Array {
  const body = new TextEncoder().encode(content);
  const result = new Uint8Array(1024 + Math.ceil(body.length / 512) * 512);
  const header = result.subarray(0, 512);
  header.set(new TextEncoder().encode(name));
  header.set(new TextEncoder().encode(body.length.toString(8).padStart(11, "0") + "\0"), 124);
  header[156] = 48;
  result.set(body, 512);
  return result;
}

describe("tar archive reader", () => {
  it("strips npm's package prefix and returns exact file bytes", () => {
    const files = untar(tarFile("package/index.js", "export const answer = 42;"));
    expect(new TextDecoder().decode(files.get("index.js"))).toBe("export const answer = 42;");
  });
  it("does not surface parent traversal paths", () => expect(untar(tarFile("package/../secret", "nope")).size).toBe(0));
});
