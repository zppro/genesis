import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { toJSON } from "@/shared/sync";
import { getWorldScene, updateSceneSyncTime } from "~/data/convexProxy/scene.server"
import { type SceneId, table } from "@/world/scenes";
import { getWorld } from "~/data/convexProxy/world.server";
import { WorldId } from "@/worlds";

export const action = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  const { worldId, sceneId } = params;
  let notifyUrl = `/world/${worldId}/scene/${sceneId}`
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
  const scene = await getWorldScene(sceneId as SceneId)
  if (!scene) {
    return redirect(`${redirectUrl}&_err=invalid scene!`);
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
    return redirect(`${redirectUrl}&_err=${encodeURIComponent(result.err)}`);
  }
  console.log(`sync scene("${sceneId}") ok!`)

  await updateSceneSyncTime({ id: scene._id })
  return redirect(redirectUrl);
};