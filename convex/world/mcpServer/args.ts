import { v, ObjectType } from 'convex/values';
import { idWorld } from '../../worlds';
import { idMcpServer, McpServerId, mcpServerFields } from './schema';


/*** query args ***/

export const readArgs = { id: idMcpServer };
export const listArgs = { worldId: idWorld };
export const listByIdsArgs = { ids: v.array(idMcpServer) };

export type ReadArgs = ObjectType<typeof readArgs>;
export type ListArgs = ObjectType<typeof listArgs>;
export type ListByIdsArgs = ObjectType<typeof listByIdsArgs>;


/*** mutation args ***/

export const { modifyTime, ...insertArgs } = mcpServerFields
const { ..._updateArgs } = insertArgs
export const updateArgs = { id: idMcpServer, ..._updateArgs }
export const deleteArgs = { id: idMcpServer }
export const updateTimeArgs = { id: idMcpServer }


export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type PatchArgs = { id: McpServerId } & Partial<ObjectType<typeof _updateArgs>>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;
export type UpdateTimeArgs = ObjectType<typeof updateTimeArgs>;