import { v, ObjectType } from 'convex/values';
import { defineTable } from "convex/server";
import { idWorld } from '../../worlds';
import { Doc, Id } from "../../_generated/dataModel";
// import { functionDef } from "../../shared/type";

export const table = 'mcpServers';
export const indexName_ByWorldId = 'by_worldId';
export const indexName_ByWorldIdAndType = 'by_worldIdAndType';
export const idMcpServer = v.id(table);

export type McpServerTable = typeof table
export type McpServerId = Id<McpServerTable>
export type McpServerDoc = Doc<McpServerTable>

export const MCPSERVER_TYPES = ['sse'] as const
const VMcpServerTypes = v.union(...MCPSERVER_TYPES.map(t => v.literal(t)))

export const mcpServerFields = {
  modifyTime: v.number(),
  syncTime: v.optional(v.number()),
  worldId: idWorld,
  name: v.string(),
  url: v.string(),
  type: VMcpServerTypes,
  desc: v.optional(v.string()),
};

export const tableSchema = defineTable(mcpServerFields)
  .index(indexName_ByWorldId, ["worldId"])
  .index(indexName_ByWorldIdAndType, ["worldId", "type"])