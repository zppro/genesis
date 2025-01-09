import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteWorldResource } from "~/data/convexProxy/resource.server"
import { type ResourceId } from "@/world/resources";
import { ConvexError } from "convex/values";

export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { worldId, type, resourceId } = params;
  
  try {
    await deleteWorldResource({ id: resourceId as ResourceId });
  } catch (e) {
    if (e instanceof ConvexError) {
      throw new Response(e.data, {
        status: 500,
      })
    } else {
      throw new Error("Something went wrong!");
    }
  }
  return redirect(`/world/${worldId}/resource/${type}`);
};