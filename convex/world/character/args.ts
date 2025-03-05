import { v, ObjectType } from 'convex/values';
import { idWorld } from '../../worlds';
import { idSpritesheet } from '../spritesheets';
import { idLLM } from '../llms';
import { llmMessages, llmTools } from "../../shared/type";
import { idCharacter, CharacterId, characterFields } from './schema';
import { idSkill } from '../skill/schema';


/*** query args ***/

export const readArgs = { id: idCharacter };
export const listArgs = { worldId: idWorld };
export const listBySpritesheetArgs = { worldId: idWorld, spritesheetId: idSpritesheet }

export type ReadArgs = ObjectType<typeof readArgs>;
export type ListArgs = ObjectType<typeof listArgs>;
export type ListBySpritesheetArgs = ObjectType<typeof listBySpritesheetArgs>;


/*** mutation args ***/

export const { modifyTime, ...insertArgs } = characterFields
const { worldId: _, ..._updateArgs } = insertArgs
export const updateArgs = { id: idCharacter, ..._updateArgs }
export const deleteArgs = { id: idCharacter }
export const updateTimeArgs = { id: idCharacter }
export const addSkillArgs = { id: idCharacter, skillId: idSkill }
export const removeSkillArgs = { id: idCharacter, skillId: idSkill }


export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type PatchArgs = { id: CharacterId } & Partial<ObjectType<typeof _updateArgs>>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;
export type UpdateTimeArgs = ObjectType<typeof updateTimeArgs>;
export type AddSkillArgs = ObjectType<typeof addSkillArgs>;
export type RemoveSkillArgs = ObjectType<typeof removeSkillArgs>;

