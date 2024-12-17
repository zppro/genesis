import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteWorldSpritesheet } from "~/data/convexProxy/spritesheet.server"
import { type SpritesheetId } from "@/world/spritesheets";
export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { worldId, spritesheetId } = params;
  await deleteWorldSpritesheet({ id: spritesheetId as SpritesheetId });
  return redirect(`/world/${worldId}/spritesheet`);
};