import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteWorldCharacter } from "~/data/convexProxy/character.server"
import { type CharacterId } from "@/world/characters";
import { ConvexError } from "convex/values";

export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { worldId, characterId } = params;

  try {
    await deleteWorldCharacter({ id: characterId as CharacterId });
  } catch (e) {
    if (e instanceof ConvexError) {
      throw new Response(e.data, {
        status: 500,
      })
    } else {
      throw new Error("Something went wrong!");
    }
  }
  return redirect(`/world/${worldId}/character`);
};