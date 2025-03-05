import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getWorldCharacter, updateWorldCharacterSyncTime } from "~/data/convexProxy/character.server"
import { toJSON } from "@/shared/sync";
import { table, type CharacterId } from "@/world/character/schema"
import { getWorld } from "~/data/convexProxy/world.server";
import { WorldId } from "@/worlds";
export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { worldId, characterId } = params;
  const world = await getWorld(worldId as WorldId)
  if (!world) {
    throw new Error("invalid world!");
  }
  if (!world.deploy) {
    throw new Error("not set deploy!");
  }

  const character = await getWorldCharacter(characterId as CharacterId)
  if (!character) {
    throw new Error("invalid character!");
  }
  const syncUrl = `${world.deploy.site}/sync`
  const payload = toJSON({ _id: character._id, object: table, name: character.name })
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
  console.log(`sync character("${characterId}") ok!`)

  await updateWorldCharacterSyncTime({ id: character._id })
  return redirect(`/world/${worldId}/character/${characterId}`);
};