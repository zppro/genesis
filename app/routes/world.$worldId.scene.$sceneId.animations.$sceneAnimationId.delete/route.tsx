import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteSceneAnimation } from "~/data/convexProxy/sceneAnimation.server"
import { type SceneAnimationId } from "@/world/sceneAnimations";
export const action = async ({
  params,
}: ActionFunctionArgs) => {
  const { sceneAnimationId } = params;
  await deleteSceneAnimation({ id: sceneAnimationId as SceneAnimationId });
  return {}
};