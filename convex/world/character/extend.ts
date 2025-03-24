import { CharacterDoc } from "./schema"
import { SpritesheetDoc } from "../spritesheets"
import { SkillExtendDoc, SkillSyncDoc } from "../skill/extend";

export type CharacterExtendDoc = CharacterDoc & {
  spritesheet: SpritesheetDoc,
  textureUrl: string,
  skillExs: SkillExtendDoc[]
};

export type CharacterSyncDoc = CharacterDoc & {
  spritesheet: SpritesheetDoc,
  textureUrl: string,
  skillSyncs: SkillSyncDoc[]
};