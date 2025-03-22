import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteWorldMcpServer } from "~/data/convexProxy/mcpServer.server"
import { type McpServerId } from "@/world/mcpServer/schema";
import { ConvexError } from "convex/values";


export const action = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  const { worldId, mcpServerId } = params;
  let notifyUrl = `/world/${worldId}/mcpServer`
  const actionUrl = new URL(request.url).pathname;
  try {
    await deleteWorldMcpServer({ id: mcpServerId as McpServerId });
  } catch (e) {
    if (e instanceof ConvexError) {
      // throw new Response(e.data, {
      //   status: 500,
      // })
      notifyUrl = notifyUrl + `/${mcpServerId}/basic`
      return redirect(`${notifyUrl}?_notifyUrl=${notifyUrl}&_actionUrl=${actionUrl}&_err=${e.data}`);
      // return { serverErrors: e.data }
    } else {
      throw new Error("Something went wrong!");
    }

  }
  return redirect(`${notifyUrl}?_notifyUrl=${notifyUrl}&_actionUrl=${actionUrl}`);
};
