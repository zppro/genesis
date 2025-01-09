import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteWorldTexture } from "~/data/convexProxy/texture.server"
import { type TextureId } from "@/world/textures";
import { ConvexError } from "convex/values";

export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { worldId, textureId } = params;
  try {
    await deleteWorldTexture({ id: textureId as TextureId });
  } catch (e) {
    if (e instanceof ConvexError) {
      throw new Response(e.data, {
        status: 500,
      })
    } else {
      throw new Error("Something went wrong!");
    }
  }

  return redirect(`/world/${worldId}/texture`);
};