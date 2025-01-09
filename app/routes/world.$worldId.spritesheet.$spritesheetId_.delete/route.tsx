import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteWorldSpritesheet } from "~/data/convexProxy/spritesheet.server"
import { type SpritesheetId } from "@/world/spritesheets";
import { ConvexError } from "convex/values";

export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { worldId, spritesheetId } = params;
  try {
    await deleteWorldSpritesheet({ id: spritesheetId as SpritesheetId });
  } catch (e) {
    if (e instanceof ConvexError) {
      throw new Response(e.data, {
        status: 500,
      })
    } else {
      throw new Error("Something went wrong!");
    }
  }
  return redirect(`/world/${worldId}/spritesheet`);
};