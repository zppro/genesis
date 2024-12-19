import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteWorldObject } from "~/data/convexProxy/object.server"
import { type ObjectId } from "@/world/objects";
export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { worldId, objectId } = params;
  await deleteWorldObject({ id: objectId as ObjectId });
  return redirect(`/world/${worldId}/object`);
};