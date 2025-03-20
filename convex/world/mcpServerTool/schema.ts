import { v, ObjectType } from 'convex/values';
import { defineTable } from "convex/server";
import { idWorld } from '../../worlds';
import { idMcpServer } from "../mcpServer/schema"
import { Doc, Id } from "../../_generated/dataModel";
// import { functionDef } from "../../shared/type";

export const table = 'mcpServerTools';
export const indexName_ByWorldId = 'by_worldId';
export const indexName_ByMcpServerId = 'by_mcpServerId';
export const indexName_ByMcpServerIdAndName = 'by_worldIdMcpServerIdAndName';
export const idMcpServerTool = v.id(table);

export type McpServerToolTable = typeof table
export type McpServerToolId = Id<McpServerToolTable>
export type McpServerToolDoc = Doc<McpServerToolTable>

export const mcpServerToolFields = {
  modifyTime: v.number(),
  syncTime: v.optional(v.number()),
  worldId: idWorld,
  mcpServerId: idMcpServer,
  name: v.string(),
  desc: v.optional(v.string()),
  inputSchema: v.any(),
};

export const tableSchema = defineTable(mcpServerToolFields)
  .index(indexName_ByWorldId, ["worldId"])
  .index(indexName_ByMcpServerId, ["mcpServerId"])
  .index(indexName_ByMcpServerIdAndName, ["mcpServerId", "name"])