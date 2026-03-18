import type {
  MaterialEvaluationEntry,
  MaterialJudgement,
  MaterialPart,
  MaterialRequirement,
  MaterialValidationIssue,
  MaterialValidationResult,
} from "./types.js";

/**
 * Validate material parts against declarative requirements.
 */
export function validateMaterialRequirements(
  requirements: MaterialRequirement[],
  parts: MaterialPart[],
): MaterialValidationResult {
  const issues: MaterialValidationIssue[] = [];

  // Precompute counts by type in a single pass
  const countByType = new Map<string, number>();
  for (const part of parts) {
    countByType.set(part.type, (countByType.get(part.type) ?? 0) + 1);
  }

  for (const req of requirements) {
    const count = countByType.get(req.type) ?? 0;
    const min = Math.max(0, Math.floor(req.min ?? 1));
    const max = req.max !== undefined ? Math.max(0, Math.floor(req.max)) : undefined;

    if (count < min) {
      issues.push({
        type: req.type,
        label: req.label,
        requirement: { min, max },
        actual: count,
        kind: "too_few",
      });
    } else if (max !== undefined && count > max) {
      issues.push({
        type: req.type,
        label: req.label,
        requirement: { min, max },
        actual: count,
        kind: "too_many",
      });
    }
  }

  if (issues.length > 0) {
    return { valid: false, issues };
  }

  return { valid: true };
}

/**
 * Run both declarative (requiredMaterials) and custom (validateMaterials) validation,
 * including evaluate and judgeMaterials when provided.
 * Declarative check runs first; if it fails, subsequent checks are skipped.
 */
export async function runMaterialValidation(
  recipe: {
    requiredMaterials?: MaterialRequirement[];
    validateMaterials?: (parts: MaterialPart[]) => MaterialValidationResult;
    judgeMaterials?: (evaluations: MaterialEvaluationEntry[]) => MaterialJudgement;
  },
  parts: MaterialPart[],
): Promise<MaterialValidationResult> {
  // 1. Declarative check (型×個数)
  if (recipe.requiredMaterials && recipe.requiredMaterials.length > 0) {
    const result = validateMaterialRequirements(recipe.requiredMaterials, parts);
    if (!result.valid) return result;
  }

  // 2. Evaluate (各素材の品質スコア)
  let evaluations: MaterialEvaluationEntry[] | undefined;
  let judgement: MaterialJudgement | undefined;

  if (recipe.requiredMaterials) {
    const requirementsWithEvaluate = recipe.requiredMaterials.filter((r) => r.evaluate);
    if (requirementsWithEvaluate.length > 0) {
      const evalResults = await Promise.all(
        requirementsWithEvaluate.map(async (req) => {
          const matchingParts = parts.filter((p) => p.type === req.type);
          // biome-ignore lint/style/noNonNullAssertion: filtered above
          const evaluation = await req.evaluate!(matchingParts);
          return {
            type: req.type,
            label: req.label,
            evaluation,
          } satisfies MaterialEvaluationEntry;
        }),
      );
      evaluations = evalResults;
    }
  }

  // 3. Judge (錬成可否判定)
  if (recipe.judgeMaterials && evaluations && evaluations.length > 0) {
    judgement = recipe.judgeMaterials(evaluations);
    if (!judgement.canTransmute) {
      return {
        valid: false,
        message: judgement.message,
        evaluations,
        judgement,
      };
    }
  }

  // 4. Custom function check
  if (recipe.validateMaterials) {
    const customResult = recipe.validateMaterials(parts);
    if (!customResult.valid) {
      return { ...customResult, evaluations, judgement };
    }
  }

  return { valid: true, evaluations, judgement };
}
