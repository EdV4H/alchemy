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
