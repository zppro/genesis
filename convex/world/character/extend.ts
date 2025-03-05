import { CharacterDoc } from "./schema"
import { SpritesheetDoc } from "../spritesheets"

export type CharacterExtendDoc = CharacterDoc & {
  spritesheet: SpritesheetDoc,
  textureUrl: string,
};