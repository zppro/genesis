import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getWorldMcpServer, updateWorldMcpServerSyncTime } from "~/data/convexProxy/mcpServer.server"
import { toJSON } from "@/shared/sync";
import { getWorld } from "~/data/convexProxy/world.server";
import { WorldId } from "@/worlds";
import { table, McpServerId } from "@/world/mcpServer/schema";

export const action = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  const { worldId, mcpServerId } = params;
  let notifyUrl = `/world/${worldId}/mcpServer/${mcpServerId}`
  const actionUrl = new URL(request.url).pathname;
  const redirectUrl = `${notifyUrl}?_notifyUrl=${notifyUrl}&_actionUrl=${actionUrl}`
  const world = await getWorld(worldId as WorldId)
  if (!world) {
    // throw new Error("invalid world!");
    return redirect(`${redirectUrl}&_err=invalid world!`);
  }
  if (!world.deploy) {
    // throw new Error("not set deploy!");
    return redirect(`${redirectUrl}&_err=not set deploy!`);
  }
  
  const mcpServer = await getWorldMcpServer(mcpServerId as McpServerId)
  if (!mcpServer) {
    // throw new Error("invalid mcpServer!");
    return redirect(`${redirectUrl}&_err=invalid mcpServer!`);
  }
  const syncUrl = `${world.deploy.site}/sync`
  const payload = toJSON({ _id: mcpServer._id, object: table, name: mcpServer.name })
  const rawResponse = await fetch(syncUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: payload
  });
  const result = await rawResponse.json();
  if (result.err) {
    // throw new Error("sync failed!", result.err);
    return redirect(`${redirectUrl}&_err=${result.err}`);
  }
  console.log(`sync mcpServer("${mcpServerId}") ok!`)

  await updateWorldMcpServerSyncTime({ id: mcpServer._id })

  return redirect(redirectUrl);
};