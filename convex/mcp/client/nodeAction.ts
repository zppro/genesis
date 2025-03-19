"use node";

import { ConvexError, v } from "convex/values";
import { action } from "../../_generated/server";
import { createSSEClient, close, validateAndCallTool } from "./index";
import { sleep } from "../utils";

export const safeCallTool = action({
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



