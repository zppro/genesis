import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteWorldScene } from "~/data/convexProxy/scene.server"
import { type SceneId } from "@/world/scenes";
export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { worldId, sceneId } = params;
  await deleteWorldScene({ id: sceneId as SceneId });
  return redirect(`/world/${worldId}/scene`);
};