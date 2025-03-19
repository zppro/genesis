"use node"

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { ActionCtx } from "../../_generated/server";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { api } from "../../_generated/api";
import type { McpClientSessionId } from "./session/schema";

export type McpClientOps = {
  version: string;
}

export type McpClientValue = {
  client: Client;
  name: string;
  sseUrl: string;
  opts: McpClientOps;
}

const _mcpClients: Record<McpClientSessionId, McpClientValue> = {}

async function _createSSEClient(sessionId: McpClientSessionId, name: string, sseUrl: string, opts: McpClientOps) {
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

  await client.connect(transport)
  // success connect
  return client
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
  let client: Client | null = await getClient(ctx, sessionId);
  if (client) {
    console.log(`already exist client for name(${name})`)
    return client
  }

  try {
    client = new Client({
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

    await client.connect(transport)
    await ctx.runMutation(api.mcp.client.session.mutation.updateStatus, { id: sessionId, status: "connected" })
    // success connect
    _mcpClients[sessionId] = { client, sseUrl, name, opts }
    return client
  } catch (err) {
    console.log('create mcp client err:', err);
    await ctx.runMutation(api.mcp.client.session.mutation.delete_, { id: sessionId })
    return null
  }
}

export const close = async (ctx: ActionCtx, sessionId: McpClientSessionId) => {
  const val = _mcpClients[sessionId];
  if (!val) {
    throw new Error("invalid session id")
  }
  const { client } = val
  try {
    client.close()
    await ctx.runMutation(api.mcp.client.session.mutation.updateStatus, { id: sessionId, status: "closed" })
  } catch (err) {
    console.log('close mcp client err:', err);
    await ctx.runMutation(api.mcp.client.session.mutation.updateStatus, { id: sessionId, status: "broken" })
  }
}

export const clear = async (ctx: ActionCtx) => {
  const mcpClientSessions = await ctx.runQuery(api.mcp.client.session.query.list)
  const ids = mcpClientSessions.map(v => v._id);
  for (const { _id } of mcpClientSessions) {
    delete _mcpClients[_id]
  }
  await ctx.runMutation(api.mcp.client.session.mutation.deleteByIds, { ids })
}

export const print = () => {
  console.log('_mcpClients=>', _mcpClients)
}

export const reconnect = async (ctx: ActionCtx, sessionId: McpClientSessionId, force: boolean = false) => {
  const val = _mcpClients[sessionId];
  if (!val) {
    throw new Error("invalid session id")
  }
  const mcpClientSession = await ctx.runQuery(api.mcp.client.session.query.read, { id: sessionId })
  if (!mcpClientSession) {
    throw new Error("not found mcp client session")
  }
  if (!force) {
    if (mcpClientSession.status === "connected" || mcpClientSession.status === "connecting") {
      console.warn("no need to reconnect")
      return
    }
  }

  const { sseUrl, name, opts } = val;
  if (force) {
    try {
      await close(ctx, sessionId);
      delete _mcpClients[sessionId]
    } catch (err) {
      console.log("close mcp client in reconnect err:", err)
    }
  }

  try {
    const clientNew = await _createSSEClient(sessionId, sseUrl, name, opts)

    await ctx.runMutation(api.mcp.client.session.mutation.updateStatus, { id: sessionId, status: "connected" })
    // success connect
    _mcpClients[sessionId] = { client: clientNew, sseUrl, name, opts }
  } catch (err) {
    console.log('reconnectClient mcp client err:', err);
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

export const getClientByName = async (ctx: ActionCtx, name: string) => {
  const sessionId = await getSessionIdByName(ctx, name);
  if (!sessionId) {
    return null
  }
  const val = _mcpClients[sessionId]
  if (!val) {
    return null
  }
  return _mcpClients[sessionId].client;

}

export const getClient = async (ctx: ActionCtx, sessionId: McpClientSessionId) => {
  console.log('in getClient gs _mcpClients=>', _mcpClients)
  const val = _mcpClients[sessionId]
  if (!val) {
    return null
  }
  return _mcpClients[sessionId].client;

}