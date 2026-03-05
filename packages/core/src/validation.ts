import type {
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

  for (const req of requirements) {
    const count = parts.filter((p) => p.type === req.type).length;
    const min = req.min ?? 1;

    if (count < min) {
      issues.push({
        type: req.type,
        label: req.label,
        requirement: { min, max: req.max },
        actual: count,
        kind: "too_few",
      });
    } else if (req.max !== undefined && count > req.max) {
      issues.push({
        type: req.type,
        label: req.label,
        requirement: { min, max: req.max },
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
 * Run both declarative (requiredMaterials) and custom (validateMaterials) validation.
 * Declarative check runs first; if it fails, custom check is skipped.
 */
export function runMaterialValidation(
  recipe: {
    requiredMaterials?: MaterialRequirement[];
    validateMaterials?: (parts: MaterialPart[]) => MaterialValidationResult;
  },
  parts: MaterialPart[],
): MaterialValidationResult {
  // 1. Declarative check
  if (recipe.requiredMaterials && recipe.requiredMaterials.length > 0) {
    const result = validateMaterialRequirements(recipe.requiredMaterials, parts);
    if (!result.valid) return result;
  }

  // 2. Custom function check
  if (recipe.validateMaterials) {
    return recipe.validateMaterials(parts);
  }

  return { valid: true };
}
