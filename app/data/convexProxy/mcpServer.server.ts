import { proxy } from "~/data/convexProxy/index.server"
import { api } from "@/_generated/api";
import { type WorldId } from "@/worlds";
import type { McpServerId } from "@/world/mcpServer/schema";
import type { InsertArgs, UpdateArgs, DeleteArgs, UpdateTimeArgs } from "@/world/mcpServer/args";

export const getWorldMcpServer = async (id: McpServerId) => {
  return await proxy().query(api.world.mcpServer.query.read, { id })
}

export const listWorldMcpServers = async (worldId: WorldId) => {
  return await proxy().query(api.world.mcpServer.query.list, { worldId })
}

export const createWorldMcpServer = async (args: InsertArgs) => {
  return await proxy().mutation(api.world.mcpServer.mutation.create, { ...args })
}

export const updateWorldMcpServer = async (args: UpdateArgs) => {
  await proxy().mutation(api.world.mcpServer.mutation.update, args)
}

export const deleteWorldMcpServer = async (args: DeleteArgs) => {
  await proxy().mutation(api.world.mcpServer.mutation.delete_, args)
}

export const updateWorldMcpServerSyncTime = async (args: UpdateTimeArgs) => {
  await proxy().mutation(api.world.mcpServer.mutation.updateSyncTime, args)
}
