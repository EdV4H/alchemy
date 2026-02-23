import type { CatalystConfig } from "./types.js";

/** レシピのデフォルトカタリストを返す。override があればそちらを優先。 */
export function resolveCatalyst(
  recipe: { catalyst?: CatalystConfig },
  override?: CatalystConfig,
): CatalystConfig | undefined {
  return override ?? recipe.catalyst;
}
