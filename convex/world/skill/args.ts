import { v, ObjectType } from 'convex/values';
import { idWorld } from '../../worlds';
import { llmMessages, llmTools } from "../../shared/type";
import { idSkill, SkillId, skillFields } from './schema';


/*** query args ***/

export const readArgs = { id: idSkill };
export const listArgs = { worldId: idWorld };
export const listByIdsArgs = { ids: v.array(idSkill) };

export type ReadArgs = ObjectType<typeof readArgs>;
export type ListArgs = ObjectType<typeof listArgs>;
export type ListByIdsArgs = ObjectType<typeof listByIdsArgs>;


/*** mutation args ***/

export const { modifyTime, ...insertArgs } = skillFields
const { ..._updateArgs } = insertArgs
export const updateArgs = { id: idSkill, ..._updateArgs }
export const deleteArgs = { id: idSkill }
export const updateTimeArgs = { id: idSkill }
export const testSkillArgs = {
  id: idSkill,
  messages: llmMessages,
};


export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type PatchArgs = { id: SkillId } & Partial<ObjectType<typeof _updateArgs>>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;
export type UpdateTimeArgs = ObjectType<typeof updateTimeArgs>;
export type TestSkillArgs = ObjectType<typeof testSkillArgs>;