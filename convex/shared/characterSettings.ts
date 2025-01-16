import { v, Infer } from 'convex/values';

export const CHARACTERSETTINGS_TYPES = ['primary'] as const
const VCharacterSettings_Types = v.union(...CHARACTERSETTINGS_TYPES.map(t => v.literal(t)))
export type CharacterSettings_Types = typeof CHARACTERSETTINGS_TYPES[number];

export const characterSettingsVariantSerialized = v.object({
  type: VCharacterSettings_Types,
  desc: v.string(), // parse settings from desc by llm
  settings: v.any(),
});

export type CharacterSettingsVariant = Infer<typeof characterSettingsVariantSerialized>;

export const primaryCharacterSettings = v.object({
  name: v.string(),
  age: v.number(),
  gender: v.union(v.literal("male"), v.literal("female"), v.literal("unknow"), v.literal("男"), v.literal("女"), v.literal("未知")),
  profession: v.string(),
  personality: v.array(v.string()),
})
export type PrimaryCharacterSettings = Infer<typeof primaryCharacterSettings>;