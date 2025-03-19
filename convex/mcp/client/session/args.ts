import { v, ObjectType } from 'convex/values';
import { idMcpClientSession, McpClientSessionId, mcpClientSessionFields, mcp_client_statuses } from './schema';


/*** query args ***/

export const readArgs = { id: idMcpClientSession };
export const readByNameArgs = { name: v.string() };
export const readByServerSessionArgs = { serverSessionId: v.string() };

export type ReadArgs = ObjectType<typeof readArgs>;
export type ReadByNameArgs = ObjectType<typeof readByNameArgs>;
export type ReadByServerSessionArgs = ObjectType<typeof readByServerSessionArgs>;


/*** mutation args ***/

export const { lastActiveTime, ...insertArgs } = mcpClientSessionFields
const { ..._updateArgs } = insertArgs
export const updateArgs = { id: idMcpClientSession, ..._updateArgs }
export const deleteArgs = { id: idMcpClientSession }
export const updateStatusArgs = { id: idMcpClientSession, status: mcp_client_statuses }
export const deleteByIdsArgs = { ids: v.array(idMcpClientSession) }


export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type PatchArgs = { id: McpClientSessionId } & Partial<ObjectType<typeof _updateArgs>>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;
export type UpdateStatusArgs = ObjectType<typeof updateStatusArgs>;
export type DeleteByIdsArgs = ObjectType<typeof deleteByIdsArgs>;