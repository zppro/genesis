import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { action, ActionCtx, internalAction, internalMutation } from "../../_generated/server";


export async function createBMIClient(ctx: ActionCtx, mcpBaseUrl: string) {
  const client = new Client({
    name: 'bmi-client-in-node',
    version: "1.0.0"
  })
  const headers: HeadersInit = {
    'user-agent': 'bmi-client-in-node'
  };
  const transport = new SSEClientTransport(new URL(mcpBaseUrl), {
    eventSourceInit: {
      fetch: (url, init) => fetch(url, { ...init, headers }),
    },
    requestInit: {
      headers,
    },
  });

  await client.connect(transport)
  return Promise.resolve(client)
}


