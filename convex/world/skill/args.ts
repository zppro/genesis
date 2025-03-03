import { v, ObjectType } from 'convex/values';
import { idWorld } from '../../worlds';
import { idSkill, SkillId, skillFields } from './schema';


/*** query args ***/

export const readArgs = { id: idSkill };
export const listArgs = { worldId: idWorld };

export type ReadArgs = ObjectType<typeof readArgs>;
export type ListArgs = ObjectType<typeof listArgs>;


/*** mutation args ***/

export const { modifyTime, ...insertArgs } = skillFields
const { ..._updateArgs } = insertArgs
export const updateArgs = { id: idSkill, ..._updateArgs }
export const deleteArgs = { id: idSkill }
export const updateTimeArgs = { id: idSkill }

export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type PatchArgs = { id: SkillId } & Partial<ObjectType<typeof _updateArgs>>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;
export type UpdateTimeArgs = ObjectType<typeof updateTimeArgs>;