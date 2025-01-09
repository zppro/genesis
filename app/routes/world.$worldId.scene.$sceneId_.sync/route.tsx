import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { toJSON } from "@/shared/sync";
import { getWorldScene, updateSceneSyncTime } from "~/data/convexProxy/scene.server"
import { type SceneId, table } from "@/world/scenes";
import { getWorld } from "~/data/convexProxy/world.server";
import { WorldId } from "@/worlds";

export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { worldId, sceneId } = params;
  const world = await getWorld(worldId as WorldId)
  if (!world) {
    throw new Error("invalid world!");
  }
  if (!world.deploy) {
    throw new Error("not set deploy!");
  }
  const scene = await getWorldScene(sceneId as SceneId)
  if (!scene) {
    throw new Error("invalid scene!");
  }

  const syncUrl = `${world.deploy.site}/sync`
  const payload = toJSON({ _id: scene._id, object: table, name: scene.name })
  const rawResponse = await fetch(syncUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: payload
  });
  const result = await rawResponse.json();
  if (result.err) {
    throw new Error("sync failed!", result.err);
  }
  console.log(`sync scene("${sceneId}") ok!`)

  await updateSceneSyncTime({ id: scene._id })
  return redirect(`/world/${worldId}/scene/${sceneId}`);
};