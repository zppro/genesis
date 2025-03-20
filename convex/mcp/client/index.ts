"use node"

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { ActionCtx } from "../../_generated/server";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { CallToolResultSchema, CompatibilityCallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { createZodSchema } from "../utils";
import { api } from "../../_generated/api";
import { ZodError } from "zod";

export type McpClientOps = {
  version: string;
}

export async function createSSEClient(
  ctx: ActionCtx,
  name: string,
  sseUrl: string,
  opts: McpClientOps = { version: "1.0.0" }
): Promise<Client | null> {
  let sessionId = await getSessionIdByName(ctx, name);
  if (!sessionId) {
    sessionId = await ctx.runMutation(api.mcp.client.session.mutation.create, {
      name,
      sseUrl,
      status: "connecting"
    })
  }

  try {
    const client = new Client({
      name,
      version: opts.version
    })
    const headers: HeadersInit = {
      'user-agent': `ua-${name}`,
      'client-id': sessionId

    };
    const transport = new SSEClientTransport(new URL(sseUrl), {
      eventSourceInit: {
        fetch: (url, init) => fetch(url, { ...init, headers }),
      },
      requestInit: {
        headers,
      },
    });

    // client.setRequestHandler(
    //   PingRequestSchema,
    //   async () => {
    //     console.log('received ping!!!')
    //     return {};
    //   },
    // );


    await client.connect(transport)
    await ctx.runMutation(api.mcp.client.session.mutation.updateStatus, { id: sessionId, status: "connected" })
    // success connect
    return client
  } catch (err) {
    console.log('create mcp client err:', err);
    await ctx.runMutation(api.mcp.client.session.mutation.delete_, { id: sessionId })
    return null
  }
}

export const close = async (ctx: ActionCtx, name: string, client: Client) => {
  let sessionId = await getSessionIdByName(ctx, name);
  try {
    client.close()
    if (sessionId) {
      await ctx.runMutation(api.mcp.client.session.mutation.updateStatus, { id: sessionId, status: "closed" })
    }
  } catch (err) {
    console.log('close mcp client err:', err);
    if (sessionId) {
      await ctx.runMutation(api.mcp.client.session.mutation.updateStatus, { id: sessionId, status: "broken" })
    }
  }
}

export const getSessionIdByName = async (ctx: ActionCtx, name: string) => {
  const mcpClientSession = await ctx.runQuery(api.mcp.client.session.query.readByName, { name })
  if (!mcpClientSession) {
    return null
  }
  const { _id: sessionId } = mcpClientSession
  return sessionId
}

// Example usage
export const validateAndCallTool = async (ctx: ActionCtx, client: Client, toolName: string, inputData: any) => {
  // Get tool schema
  const tools = await client.listTools();
  const tool = tools.tools.find(t => t.name === toolName);

  if (!tool) {
    throw new Error(`Tool not found: ${toolName}`);
  }

  try {
    // Create schema and validate input
    console.log('tool.inputSchema=>', tool.inputSchema)
    const schema = createZodSchema(tool.inputSchema);
    const validatedInput = schema.parse(inputData);
    console.log("validatedInput=>", validatedInput)
    // Call the tool with validated input
    return await client.callTool({
      name: tool.name,
      arguments: validatedInput
    });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Validation error:', error.errors);
      throw new Error(`Invalid input for tool ${toolName}: ${error.message}`);
    }
    throw error;
  }
}

export const validateAndCallToolLocal = async (ctx: ActionCtx, client: Client, toolName: string, inputSchema: any, inputData: any) => {
  // Get tool schema
  try {
    // Create schema and validate input
    const schema = createZodSchema(inputSchema);
    const validatedInput = schema.parse(inputData);
    console.log("validatedInput=>", validatedInput)
    // Call the tool with validated input
    return await client.callTool({
      name: toolName,
      arguments: validatedInput
    });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Validation error:', error.errors);
      throw new Error(`Invalid input for tool ${toolName}: ${error.message}`);
    }
    throw error;
  }
}