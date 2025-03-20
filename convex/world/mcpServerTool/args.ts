import { v, ObjectType } from 'convex/values';
import { idWorld } from '../../worlds';
import { idMcpServer } from '../mcpServer/schema';
import { idMcpServerTool, McpServerToolId, mcpServerToolFields } from './schema';


/*** query args ***/

export const readArgs = { id: idMcpServerTool };
export const readByMcpServerAndNameArgs = { mcpServerId: idMcpServer, name: v.string() };
export const listArgs = { worldId: idWorld };
export const listByIdsArgs = { ids: v.array(idMcpServerTool) };
export const listByMcpServerArgs = { mcpServerId: idMcpServer };

export type ReadArgs = ObjectType<typeof readArgs>;
export type ReadByMcpServerAndNameArgs = ObjectType<typeof readByMcpServerAndNameArgs>;
export type ListArgs = ObjectType<typeof listArgs>;
export type ListByIdsArgs = ObjectType<typeof listByIdsArgs>;
export type ListByMcpServerArgs = ObjectType<typeof listByMcpServerArgs>;


/*** mutation args ***/

export const { modifyTime, ...insertArgs } = mcpServerToolFields
const { ..._updateArgs } = insertArgs
export const updateArgs = { id: idMcpServerTool, ..._updateArgs }
export const deleteArgs = { id: idMcpServerTool }
export const updateTimeArgs = { id: idMcpServerTool }

export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type PatchArgs = { id: McpServerToolId } & Partial<ObjectType<typeof _updateArgs>>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;
export type UpdateTimeArgs = ObjectType<typeof updateTimeArgs>;