"use node";

import { ConvexError, v } from "convex/values";
import { action } from "../../_generated/server";
import { createSSEClient, close, validateAndCallTool, validateAndCallToolLocal } from "./index";
import { sleep } from "../utils";
import { idMcpServer } from "../../world/mcpServer/schema";
import { InsertArgs } from "../../world/mcpServerTool/args";
import { api } from "../../_generated/api";

export const safeCallToolOld = action({
  args: {
    name: v.string(),
    sseUrl: v.string(),
    toolName: v.string(),
    args: v.optional(v.any())
  },
  handler: async (ctx, args) => {
    console.log('safeCallToolInNode..')
    const { name, sseUrl, toolName } = args;

    // "bmi", `https://proper-lapwing-331.convex.site/sse`
    const client = await createSSEClient(ctx, name, sseUrl)
    if (!client) {
      throw new ConvexError("create sse client failed")
    }
    try {
      const result = await validateAndCallTool(ctx, client, toolName, args.args)
      // Check if the tool execution resulted in an error
      if (result.isError) {
        throw new ConvexError(`call tool(${toolName}) to mcp server err:${result.content}`)
      }
      console.log("validateAndCallTool result=>", result)
      return result.content
    } catch (err) {
      console.log('err=>', err)
      throw new ConvexError("sse client safeCallTool failed")
    } finally {
      await close(ctx, name, client)
    }
  }
})

export const listTools = action({
  args: {
    name: v.string(),
    sseUrl: v.string(),
  },
  handler: async (ctx, args) => {
    console.log('createClientInNode..')
    const { name, sseUrl } = args;
    console.log("before invoke createSSEClient:")
    // "bmi", `https://proper-lapwing-331.convex.site/sse`
    const client = await createSSEClient(ctx, name, sseUrl)
    if (!client) {
      throw new ConvexError("create sse client failed")
    }
    try {
      const result = await client.listTools()

      const tools = result.tools.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: JSON.stringify(t.inputSchema)
      }))
      console.log("tools=>", tools)
      await sleep(50 * 1000);
      console.log("end sleep...")
      return tools
    } catch (err) {
      console.log("sse client listTools err:", err)
      throw new ConvexError("sse client listTools failed")
    } finally {
      await close(ctx, name, client)
    }
  }
});


const discoverTypes = v.union(v.literal("tools"), v.literal("resources"), v.literal("prompts"))

export const discoverAndStore = action({
  args: {
    mcpServerId: idMcpServer,
    types: v.array(discoverTypes),
  },
  handler: async (ctx, args) => {
    console.log('discoverAndStore..')
    const { mcpServerId, types } = args;
    const mcpServer = await ctx.runQuery(api.world.mcpServer.query.read, { id: mcpServerId });
    if (!mcpServer) {
      throw new ConvexError("mcpserver not found")
    }
    const { name, url: sseUrl } = mcpServer;
    // "bmi", `https://proper-lapwing-331.convex.site/sse`
    const client = await createSSEClient(ctx, name, sseUrl)
    if (!client) {
      throw new ConvexError("create sse client failed")
    }
    try {
      const result = await client.listTools()
      if (types.includes("tools")) {
        const items: InsertArgs[] = result.tools.map(t => ({
          name: t.name,
          desc: t.description,
          inputSchema: validConvexJSON(t.inputSchema),
          mcpServerId: mcpServer._id,
          worldId: mcpServer.worldId,
        }))
        const batchUpsertedIds = await ctx.runMutation(
          api.world.mcpServerTool.mutation.batchSequenceUpsert,
          {
            items
          })
        console.log('tools batchUpsertedIds:', batchUpsertedIds)
      }

    } catch (err) {
      console.log("discoverAndStore err:", err)
      throw new ConvexError("discoverAndStore failed")
    } finally {
      await close(ctx, name, client)
    }
  }
});

export function validConvexJSON(v: any) {
  delete v.$schema
  return v
}

// 反向不用补充$schema字段
export function validJSONSchema(v: any) {
  return { ...v, '$schema': 'http://json-schema.org/draft-07/schema#' }
}

export const safeCallTool = action({
  args: {
    mcpServerId: idMcpServer,
    toolName: v.string(),
    args: v.optional(v.any())
  },
  handler: async (ctx, args) => {
    console.log('safeCallToolInNode..')
    const { mcpServerId, toolName } = args;
    const mcpServerTool = await ctx.runQuery(api.world.mcpServerTool.query.readByMcpServerAndName, { name: toolName, mcpServerId })
    if (!mcpServerTool) {
      throw new ConvexError("mcpServerTool not found")
    }
    const mcpServer = await ctx.runQuery(api.world.mcpServer.query.read, { id: mcpServerId });
    if (!mcpServer) {
      throw new ConvexError("mcpserver not found")
    }
    const { inputSchema } = mcpServerTool
    const { name, url: sseUrl } = mcpServer;
    // "bmi", `https://proper-lapwing-331.convex.site/sse`
    const client = await createSSEClient(ctx, name, sseUrl)
    if (!client) {
      throw new ConvexError("create sse client failed")
    }
    try {
      const result = await validateAndCallToolLocal(ctx, client, toolName, inputSchema, args.args)
      // Check if the tool execution resulted in an error
      if (result.isError) {
        throw new ConvexError(`call tool(${toolName}) to mcp server err:${result.content}`)
      }
      console.log("validateAndCallTool result=>", result)
      return result.content
    } catch (err) {
      console.log('err=>', err)
      throw new ConvexError("sse client safeCallTool failed")
    } finally {
      await close(ctx, name, client)
    }
  }
})

