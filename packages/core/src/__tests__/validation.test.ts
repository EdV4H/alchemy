import { describe, expect, it } from "vitest";
import type { MaterialPart, MaterialRequirement } from "../types.js";
import { runMaterialValidation, validateMaterialRequirements } from "../validation.js";

describe("validateMaterialRequirements", () => {
  it("passes when requirements are met", () => {
    const requirements: MaterialRequirement[] = [{ type: "text", min: 1 }];
    const parts: MaterialPart[] = [{ type: "text", text: "hello" }];
    const result = validateMaterialRequirements(requirements, parts);
    expect(result.valid).toBe(true);
    expect(result.issues).toBeUndefined();
  });

  it("fails when required type is missing", () => {
    const requirements: MaterialRequirement[] = [{ type: "image", min: 1 }];
    const parts: MaterialPart[] = [{ type: "text", text: "hello" }];
    const result = validateMaterialRequirements(requirements, parts);
    expect(result.valid).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues?.[0]).toMatchObject({
      type: "image",
      actual: 0,
      kind: "too_few",
    });
  });

  it("fails when count is below min", () => {
    const requirements: MaterialRequirement[] = [{ type: "text", min: 2 }];
    const parts: MaterialPart[] = [{ type: "text", text: "only one" }];
    const result = validateMaterialRequirements(requirements, parts);
    expect(result.valid).toBe(false);
    expect(result.issues?.[0]).toMatchObject({
      type: "text",
      requirement: { min: 2 },
      actual: 1,
      kind: "too_few",
    });
  });

  it("fails when count exceeds max", () => {
    const requirements: MaterialRequirement[] = [{ type: "text", min: 1, max: 1 }];
    const parts: MaterialPart[] = [
      { type: "text", text: "one" },
      { type: "text", text: "two" },
    ];
    const result = validateMaterialRequirements(requirements, parts);
    expect(result.valid).toBe(false);
    expect(result.issues?.[0]).toMatchObject({
      type: "text",
      kind: "too_many",
      actual: 2,
    });
  });

  it("defaults min to 1 when not specified", () => {
    const requirements: MaterialRequirement[] = [{ type: "data" }];
    const parts: MaterialPart[] = [];
    const result = validateMaterialRequirements(requirements, parts);
    expect(result.valid).toBe(false);
    expect(result.issues?.[0].requirement.min).toBe(1);
  });

  it("includes label in issues when provided", () => {
    const requirements: MaterialRequirement[] = [{ type: "image", label: "Photo" }];
    const parts: MaterialPart[] = [];
    const result = validateMaterialRequirements(requirements, parts);
    expect(result.issues?.[0].label).toBe("Photo");
  });

  it("validates multiple requirements independently", () => {
    const requirements: MaterialRequirement[] = [
      { type: "text", min: 1 },
      { type: "image", min: 1 },
    ];
    const parts: MaterialPart[] = [{ type: "text", text: "hello" }];
    const result = validateMaterialRequirements(requirements, parts);
    expect(result.valid).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues?.[0].type).toBe("image");
  });
});

describe("runMaterialValidation", () => {
  it("returns valid when no requirements or custom validator", () => {
    const result = runMaterialValidation({}, []);
    expect(result.valid).toBe(true);
  });

  it("runs declarative check only", () => {
    const result = runMaterialValidation({ requiredMaterials: [{ type: "text", min: 1 }] }, [
      { type: "text", text: "hello" },
    ]);
    expect(result.valid).toBe(true);
  });

  it("runs custom validator after declarative check passes", () => {
    const result = runMaterialValidation(
      {
        requiredMaterials: [{ type: "text", min: 1 }],
        validateMaterials: (parts) => {
          const text = parts.find((p) => p.type === "text");
          if (text && "text" in text && text.text.length < 10) {
            return { valid: false, message: "Text must be at least 10 characters" };
          }
          return { valid: true };
        },
      },
      [{ type: "text", text: "short" }],
    );
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Text must be at least 10 characters");
  });

  it("skips custom validator when declarative check fails", () => {
    let customCalled = false;
    const result = runMaterialValidation(
      {
        requiredMaterials: [{ type: "image", min: 1 }],
        validateMaterials: () => {
          customCalled = true;
          return { valid: true };
        },
      },
      [{ type: "text", text: "hello" }],
    );
    expect(result.valid).toBe(false);
    expect(customCalled).toBe(false);
  });

  it("runs custom validator when no declarative requirements", () => {
    const result = runMaterialValidation(
      {
        validateMaterials: () => ({ valid: false, message: "Custom error" }),
      },
      [],
    );
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Custom error");
  });
});
