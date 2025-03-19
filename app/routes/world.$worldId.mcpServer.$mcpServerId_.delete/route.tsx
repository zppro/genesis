import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteWorldMcpServer } from "~/data/convexProxy/mcpServer.server"
import { type McpServerId } from "@/world/mcpServer/schema";
import { ConvexError } from "convex/values";


export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { worldId, mcpServerId } = params;
  try {
    await deleteWorldMcpServer({ id: mcpServerId as McpServerId });
  } catch (e) {
    if (e instanceof ConvexError) {
      throw new Response(e.data, {
        status: 500,
      })
    } else {
      throw new Error("Something went wrong!");
    }
  }

  return redirect(`/world/${worldId}/mcpServer`);
};