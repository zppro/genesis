import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteWorldObject } from "~/data/convexProxy/object.server"
import { type ObjectId } from "@/world/objects";
import { ConvexError } from "convex/values";

export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { worldId, objectId } = params;
  try {
    await deleteWorldObject({ id: objectId as ObjectId });
  } catch (e) {
    if (e instanceof ConvexError) {
      throw new Response(e.data, {
        status: 500,
      })
    } else {
      throw new Error("Something went wrong!");
    }
  }
  
  return redirect(`/world/${worldId}/object`);
};