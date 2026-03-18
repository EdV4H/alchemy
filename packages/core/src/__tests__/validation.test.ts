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
  it("returns valid when no requirements or custom validator", async () => {
    const result = await runMaterialValidation({}, []);
    expect(result.valid).toBe(true);
  });

  it("runs declarative check only", async () => {
    const result = await runMaterialValidation({ requiredMaterials: [{ type: "text", min: 1 }] }, [
      { type: "text", text: "hello" },
    ]);
    expect(result.valid).toBe(true);
  });

  it("runs custom validator after declarative check passes", async () => {
    const result = await runMaterialValidation(
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

  it("skips custom validator when declarative check fails", async () => {
    let customCalled = false;
    const result = await runMaterialValidation(
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

  it("runs custom validator when no declarative requirements", async () => {
    const result = await runMaterialValidation(
      {
        validateMaterials: () => ({ valid: false, message: "Custom error" }),
      },
      [],
    );
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Custom error");
  });
});

describe("evaluate + judgeMaterials", () => {
  it("runs evaluate on matching parts and returns evaluations", async () => {
    const result = await runMaterialValidation(
      {
        requiredMaterials: [
          {
            type: "text",
            min: 1,
            label: "テキスト素材",
            evaluate: (parts) => {
              const len = (parts[0] as { type: "text"; text: string }).text.length;
              return { score: Math.min(len / 100, 1) };
            },
          },
        ],
      },
      [{ type: "text", text: "hello" }],
    );
    expect(result.valid).toBe(true);
    expect(result.evaluations).toHaveLength(1);
    expect(result.evaluations?.[0].type).toBe("text");
    expect(result.evaluations?.[0].label).toBe("テキスト素材");
    expect(result.evaluations?.[0].evaluation.score).toBe(5 / 100);
  });

  it("supports async evaluate functions", async () => {
    const result = await runMaterialValidation(
      {
        requiredMaterials: [
          {
            type: "text",
            min: 1,
            evaluate: async (parts) => {
              await new Promise((r) => setTimeout(r, 1));
              return { score: 0.8, message: "Good quality" };
            },
          },
        ],
      },
      [{ type: "text", text: "hello" }],
    );
    expect(result.valid).toBe(true);
    expect(result.evaluations?.[0].evaluation).toEqual({ score: 0.8, message: "Good quality" });
  });

  it("skips evaluate when declarative check fails", async () => {
    let evaluateCalled = false;
    const result = await runMaterialValidation(
      {
        requiredMaterials: [
          {
            type: "text",
            min: 3,
            evaluate: () => {
              evaluateCalled = true;
              return { score: 1 };
            },
          },
        ],
      },
      [{ type: "text", text: "only one" }],
    );
    expect(result.valid).toBe(false);
    expect(evaluateCalled).toBe(false);
    expect(result.evaluations).toBeUndefined();
  });

  it("judgeMaterials returns canTransmute=false → valid=false", async () => {
    const result = await runMaterialValidation(
      {
        requiredMaterials: [
          {
            type: "text",
            min: 1,
            label: "課題感テキスト",
            evaluate: () => ({ score: 0.1, message: "品質が低い" }),
          },
        ],
        judgeMaterials: (evaluations) => {
          const failed = evaluations.filter((e) => e.evaluation.score < 0.3);
          if (failed.length > 0) {
            return { canTransmute: false, message: `${failed[0].label}の品質が不足しています` };
          }
          return { canTransmute: true };
        },
      },
      [{ type: "text", text: "x" }],
    );
    expect(result.valid).toBe(false);
    expect(result.message).toBe("課題感テキストの品質が不足しています");
    expect(result.judgement?.canTransmute).toBe(false);
    expect(result.evaluations).toHaveLength(1);
  });

  it("judgeMaterials returns canTransmute=true with warning", async () => {
    const result = await runMaterialValidation(
      {
        requiredMaterials: [
          {
            type: "text",
            min: 1,
            evaluate: () => ({ score: 0.4 }),
          },
        ],
        judgeMaterials: (evaluations) => {
          const avg = evaluations.reduce((s, e) => s + e.evaluation.score, 0) / evaluations.length;
          if (avg < 0.5) {
            return {
              canTransmute: true,
              warning: "素材の品質が低いため、精度が下がる可能性があります",
            };
          }
          return { canTransmute: true };
        },
      },
      [{ type: "text", text: "hello" }],
    );
    expect(result.valid).toBe(true);
    expect(result.judgement?.canTransmute).toBe(true);
    expect(result.judgement?.warning).toBe("素材の品質が低いため、精度が下がる可能性があります");
  });

  it("judgeMaterials is skipped when no evaluate functions exist", async () => {
    let judgeCalled = false;
    const result = await runMaterialValidation(
      {
        requiredMaterials: [{ type: "text", min: 1 }],
        judgeMaterials: () => {
          judgeCalled = true;
          return { canTransmute: true };
        },
      },
      [{ type: "text", text: "hello" }],
    );
    expect(result.valid).toBe(true);
    expect(judgeCalled).toBe(false);
    expect(result.evaluations).toBeUndefined();
  });

  it("runs evaluate in parallel for multiple requirements", async () => {
    const callOrder: string[] = [];
    const result = await runMaterialValidation(
      {
        requiredMaterials: [
          {
            type: "text",
            min: 1,
            label: "テキスト",
            evaluate: async () => {
              callOrder.push("text-start");
              await new Promise((r) => setTimeout(r, 10));
              callOrder.push("text-end");
              return { score: 0.9 };
            },
          },
          {
            type: "data",
            min: 1,
            label: "データ",
            evaluate: async () => {
              callOrder.push("data-start");
              await new Promise((r) => setTimeout(r, 10));
              callOrder.push("data-end");
              return { score: 0.7 };
            },
          },
        ],
        judgeMaterials: (evaluations) => {
          const avg = evaluations.reduce((s, e) => s + e.evaluation.score, 0) / evaluations.length;
          return { canTransmute: true, warning: avg < 0.9 ? "Average below 0.9" : undefined };
        },
      },
      [
        { type: "text", text: "hello" },
        { type: "data", format: "json" as const, content: "{}" },
      ],
    );
    expect(result.valid).toBe(true);
    expect(result.evaluations).toHaveLength(2);
    expect(result.judgement?.warning).toBe("Average below 0.9");
    // Parallel execution: both should start before either ends
    expect(callOrder[0]).toBe("text-start");
    expect(callOrder[1]).toBe("data-start");
  });
});
