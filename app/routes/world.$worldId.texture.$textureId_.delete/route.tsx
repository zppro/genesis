import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteWorldTexture } from "~/data/convexProxy/texture.server"
import { type TextureId } from "@/world/textures";

export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { worldId, textureId } = params;
  await deleteWorldTexture({ id: textureId as TextureId });
  return redirect(`/world/${worldId}/texture`);
};