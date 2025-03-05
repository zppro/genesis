import { CharacterDoc } from "./schema"
import { SpritesheetDoc } from "../spritesheets"
import { SkillExtendDoc } from "../skill/extend";

export type CharacterExtendDoc = CharacterDoc & {
  spritesheet: SpritesheetDoc,
  textureUrl: string,
  skillExs: SkillExtendDoc[]
};