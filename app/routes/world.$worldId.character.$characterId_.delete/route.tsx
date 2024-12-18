import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteWorldCharacter } from "~/data/convexProxy/character.server"
import { type CharacterId } from "@/world/characters";
export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { worldId, characterId } = params;
  await deleteWorldCharacter({ id: characterId as CharacterId });
  return redirect(`/world/${worldId}/character`);
};