import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteWorldSpritesheet } from "~/data/convexProxy/spritesheet.server"
import { type SpritesheetId } from "@/world/spritesheets";
import { ConvexError } from "convex/values";

export const action = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  const { worldId, spritesheetId } = params;
  let notifyUrl = `/world/${worldId}/spritesheet`
  const actionUrl = new URL(request.url).pathname;
  try {
    await deleteWorldSpritesheet({ id: spritesheetId as SpritesheetId });
  } catch (e) {
    if (e instanceof ConvexError) {
      // throw new Response(e.data, {
      //   status: 500,
      // })
      notifyUrl = notifyUrl + `/${spritesheetId}`
      return redirect(`${notifyUrl}?_notifyUrl=${notifyUrl}&_actionUrl=${actionUrl}&_err=${encodeURIComponent(e.data)}`);
    } else {
      throw new Error("Something went wrong!");
    }
  }
  // return redirect(`/world/${worldId}/spritesheet`);
  return redirect(`${notifyUrl}?_notifyUrl=${notifyUrl}&_actionUrl=${actionUrl}`);
};