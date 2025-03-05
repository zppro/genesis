import { v } from 'convex/values';
import { defineTable } from "convex/server";
import { Doc, Id } from "../../_generated/dataModel";
import { idWorld } from '../../worlds';
import { idSpritesheet } from "../spritesheets";
import { characterSettingsVariantSerialized } from '../../shared/characterSettings';
import { idSkill } from '../skill/schema';


export const table = 'characters';
export const indexName_ByWorldId = 'byWorldId';
export const indexName_ByWorldIdAndSpritesheetId = 'byWorldIdAndSpritesheetId';
export const idCharacter = v.id(table);

export type CharacterTable = typeof table
export type CharacterId = Id<CharacterTable>
export type CharacterDoc = Doc<CharacterTable>

export const characterFields = {
  modifyTime: v.number(),
  name: v.string(),
  worldId: idWorld,
  syncTime: v.optional(v.number()),
  // The speed of the animation. Can be tuned depending on the side and speed of the NPC.
  speed: v.number(),
  // spritesheet as pixijs definition 
  spritesheetId: idSpritesheet,
  settingsVariant: v.optional(characterSettingsVariantSerialized),
  skillIds: v.array(idSkill),
};

export const tableSchema = defineTable(characterFields)
  .index(indexName_ByWorldId, ["worldId"])
  .index(indexName_ByWorldIdAndSpritesheetId, ["worldId", "spritesheetId"])


