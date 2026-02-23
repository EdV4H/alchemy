import type { NamedCatalyst } from "@EdV4H/alchemy-node";

/** 全レシピ共通のカタリストプリセット */
export const catalystPresets: NamedCatalyst[] = [
  {
    key: "professional",
    label: "Professional",
    isDefault: true,
    config: {
      roleDefinition:
        "You are a professional expert. Produce polished, clear, and well-structured output. Use formal but accessible language.",
      temperature: 0.4,
    },
  },
  {
    key: "casual",
    label: "Casual",
    config: {
      roleDefinition:
        "You are a friendly assistant. Produce casual, conversational output. Keep it natural and approachable.",
      temperature: 0.6,
    },
  },
  {
    key: "academic",
    label: "Academic",
    config: {
      roleDefinition:
        "You are an academic expert. Produce formal, scholarly output with precise vocabulary and rigorous structure.",
      temperature: 0.3,
    },
  },
  {
    key: "creative",
    label: "Creative",
    config: {
      roleDefinition:
        "You are a creative writer. Produce imaginative, expressive, and engaging output. Feel free to use vivid language and metaphors.",
      temperature: 0.8,
    },
  },
  {
    key: "concise",
    label: "Concise",
    config: {
      roleDefinition:
        "You are a concise communicator. Produce the shortest possible output that fully addresses the task. Eliminate all unnecessary words.",
      temperature: 0.2,
    },
  },
];
