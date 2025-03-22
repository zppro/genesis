import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getWorldSpritesheet, updateWorldSpritesheetSyncTime } from "~/data/convexProxy/spritesheet.server"
import { toJSON } from "@/shared/sync";
import { table, SpritesheetId } from "@/world/spritesheets"
import { getWorld } from "~/data/convexProxy/world.server";
import { WorldId } from "@/worlds";


export const action = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  const { worldId, spritesheetId } = params;
  let notifyUrl = `/world/${worldId}/spritesheet/${spritesheetId}`
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

  const spritesheet = await getWorldSpritesheet(spritesheetId as SpritesheetId)
  if (!spritesheet) {
    // throw new Error("invalid spritesheet!");
    return redirect(`${redirectUrl}&_err=invalid spritesheet!`);
  }
  const syncUrl = `${world.deploy.site}/sync`
  const payload = toJSON({ _id: spritesheet._id, object: table, name: spritesheet.name })
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
    return redirect(`${redirectUrl}&_err=${encodeURIComponent(result.err)}`);
  }
  console.log(`sync spritesheet("${spritesheetId}") ok!`)

  await updateWorldSpritesheetSyncTime({ id: spritesheet._id })

  return redirect(redirectUrl);
};