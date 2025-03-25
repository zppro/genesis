import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteWorldCharacter } from "~/data/convexProxy/character.server"
import { type CharacterId } from "@/world/character/schema";
import { ConvexError } from "convex/values";

export const action = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  const { worldId, characterId } = params;
  let notifyUrl = `/world/${worldId}/character`
  const actionUrl = new URL(request.url).pathname;
  try {
    await deleteWorldCharacter({ id: characterId as CharacterId });
  } catch (e) {
    console.log('delete character err=>', e)
    if (e instanceof ConvexError) {
      // throw new Response(e.data, {
      //   status: 500,
      // })
      
      notifyUrl = notifyUrl + `/${characterId}`
      return redirect(`${notifyUrl}?_notifyUrl=${notifyUrl}&_actionUrl=${actionUrl}&_err=${encodeURIComponent(e.data)}`);
    } else {
      throw new Error("Something went wrong!");
    }
  }
  return redirect(`${notifyUrl}?_notifyUrl=${notifyUrl}&_actionUrl=${actionUrl}`);
};