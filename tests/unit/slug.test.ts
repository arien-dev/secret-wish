import { describe, it, expect } from "vitest";
import { CustomSlugSchema } from "@/lib/validation/schemas";

describe("Custom Share Slug Validation", () => {
  it("accepts valid slugs", () => {
    expect(CustomSlugSchema.parse("meine-geburtstagsliste")).toBe("meine-geburtstagsliste");
    expect(CustomSlugSchema.parse("a7f3k9x2")).toBe("a7f3k9x2");
    expect(CustomSlugSchema.parse("familie-mueller-weihnachten")).toBe("familie-mueller-weihnachten");
    expect(CustomSlugSchema.parse("abc")).toBe("abc");
  });

  it("rejects slugs shorter than 3 chars", () => {
    expect(() => CustomSlugSchema.parse("ab")).toThrow();
    expect(() => CustomSlugSchema.parse("a")).toThrow();
  });

  it("rejects slugs longer than 40 chars", () => {
    expect(() => CustomSlugSchema.parse("a".repeat(41))).toThrow();
  });

  it("rejects uppercase letters", () => {
    expect(() => CustomSlugSchema.parse("MeineListe")).toThrow();
  });

  it("rejects special characters and spaces", () => {
    expect(() => CustomSlugSchema.parse("meine liste")).toThrow();
    expect(() => CustomSlugSchema.parse("meine_liste")).toThrow();
    expect(() => CustomSlugSchema.parse("meine.liste")).toThrow();
    expect(() => CustomSlugSchema.parse("meine@liste")).toThrow();
  });

  it("rejects leading/trailing/double hyphens", () => {
    expect(() => CustomSlugSchema.parse("-liste")).toThrow();
    expect(() => CustomSlugSchema.parse("liste-")).toThrow();
    expect(() => CustomSlugSchema.parse("meine--liste")).toThrow();
  });

  it("rejects reserved slugs", () => {
    for (const reserved of ["admin", "api", "login", "register", "share", "dashboard"]) {
      expect(() => CustomSlugSchema.parse(reserved)).toThrow();
    }
  });

  it("rejects offensive slugs", () => {
    expect(() => CustomSlugSchema.parse("nigga")).toThrow();
    expect(() => CustomSlugSchema.parse("nazi")).toThrow();
  });
});
