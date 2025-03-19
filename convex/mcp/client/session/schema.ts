import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { Doc, Id } from "../../../_generated/dataModel";

// export const mcp_session_status_active = v.literal("active")
// export const mcp_session_status_expired = v.literal("expired")
export const mcp_client_statuses = v.union(v.literal("connecting"), v.literal("connected"),  v.literal("closed"), v.literal("broken")); // 过期的消息没必要处理

export const table = 'mcp_client_sessions';
export const indexName_ByName = 'by_name';
export const indexName_ByServerSessionId = 'by_serverSessionId';
export const idMcpClientSession = v.id(table);

export type McpClientSessionTable = typeof table
export type McpClientSessionId = Id<McpClientSessionTable>
export type McpClientSessionDoc = Doc<McpClientSessionTable>

export const mcpClientSessionFields = {
  name: v.string(),
  sseUrl: v.string(),
  serverSessionId: v.optional(v.string()), // from mcp_server if it returns
  lastActiveTime: v.number(),
  status: mcp_client_statuses,
};

export const tableSchema = defineTable(mcpClientSessionFields)
  .index(indexName_ByName, ["name"])
  .index(indexName_ByServerSessionId, ["serverSessionId"])