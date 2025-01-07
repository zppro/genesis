import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getWorldSpritesheet } from "~/data/convexProxy/spritesheet.server"
import { type SyncSignal, toJSON } from "@/shared/sync";
import { table, SpritesheetId } from "@/world/spritesheets"

import { getWorld } from "~/data/convexProxy/world.server";
import { WorldId } from "@/worlds";
export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { worldId, spritesheetId } = params;
  const world = await getWorld(worldId as WorldId)
  if (!world) {
    throw new Error("invalid world!");
  }
  if (!world.deploy) {
    throw new Error("not set deploy!");
  }

  const spritesheet = await getWorldSpritesheet(spritesheetId as SpritesheetId)
  if (!spritesheet) {
    throw new Error("invalid spritesheet!");
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
    throw new Error("sync failed!", result.err);
  }
  console.log(`sync spritesheet("${spritesheetId}") ok!`)
  return redirect(`/world/${worldId}/spritesheet/${spritesheetId}`);
};