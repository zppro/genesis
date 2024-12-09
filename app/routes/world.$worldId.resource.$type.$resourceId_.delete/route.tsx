import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteWorldResource } from "~/data/convexProxy/resource.server"
import { type ResourceId } from "@/world/resources";

export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { worldId, type, resourceId } = params;
  await deleteWorldResource({ id: resourceId as ResourceId });
  return redirect(`/world/${worldId}/resource/${type}`);
};