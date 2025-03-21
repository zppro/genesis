import { v, ObjectType } from 'convex/values';
import { idWorld } from '../../worlds';
import { llmMessages, llmTools } from "../../shared/type";
import { idSkill, SkillId, skillFields } from './schema';
import { idLLM } from '../llms';
import { idTexture } from '../textures';
import { idMcpServerTool } from '../mcpServerTool/schema';


/*** query args ***/

export const readArgs = { id: idSkill };
export const listArgs = { worldId: idWorld };
export const listByIdsArgs = { ids: v.array(idSkill) };
export const listByTextureArgs = { worldId: idWorld, textureId: idTexture };
export const listByLLMArgs = { worldId: idWorld, llmId: idLLM };
export const listByMcpServerToolArgs = { worldId: idWorld, mcpServerToolId: idMcpServerTool };
export const listByMcpServerToolsArgs = { worldId: idWorld, ids: v.array(idMcpServerTool) };

export type ReadArgs = ObjectType<typeof readArgs>;
export type ListArgs = ObjectType<typeof listArgs>;
export type ListByIdsArgs = ObjectType<typeof listByIdsArgs>;
export type ListByTextureArgs = ObjectType<typeof listByTextureArgs>;
export type ListByLLMArgs = ObjectType<typeof listByLLMArgs>;
export type ListByMcpServerToolArgs = ObjectType<typeof listByMcpServerToolArgs>;
export type ListByMcpServerToolsArgs = ObjectType<typeof listByMcpServerToolsArgs>;


/*** mutation args ***/

export const { modifyTime, ...insertArgs } = skillFields
const { ..._updateArgs } = insertArgs
export const updateArgs = { id: idSkill, ..._updateArgs }
export const deleteArgs = { id: idSkill }
export const updateTimeArgs = { id: idSkill }
export const batchUpdateTimeArgs = { ids: v.array(idSkill) };
export const testSkillArgs = {
  id: idSkill,
  messages: llmMessages,
};


export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type PatchArgs = { id: SkillId } & Partial<ObjectType<typeof _updateArgs>>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;
export type UpdateTimeArgs = ObjectType<typeof updateTimeArgs>;
export type BatchUpdateTimeArgs = ObjectType<typeof batchUpdateTimeArgs>;
export type TestSkillArgs = ObjectType<typeof testSkillArgs>;
