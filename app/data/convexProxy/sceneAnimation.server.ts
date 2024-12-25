import { proxy } from "~/data/convexProxy/index.server"
import { api } from "@/_generated/api";
import { type SceneId } from "@/world/scenes"
import type { SceneAnimationId, InsertArgs, UpdateArgs, DeleteArgs } from "@/world/sceneAnimations";
// import { parseNotFoundRecordError, parseConvexError } from "@/error";

export const getSceneAnimation = async (id: SceneAnimationId) => {
  return await proxy().query(api.world.sceneAnimations.read, { id })
}


export const listSceneAnimations = async (sceneId: SceneId) => {
  const sceneAnimations = await proxy().query(api.world.sceneAnimations.list, { sceneId })
  return sceneAnimations
}

export const listSceneAnimationExtends = async (sceneId: SceneId) => {
  const sceneAnimationExs = await proxy().query(api.world.sceneAnimations.listEx, { sceneId })
  return sceneAnimationExs
}

export const createSceneAnimation = async (args: InsertArgs) => {
  const newSceneAnimationId = await proxy().mutation(api.world.sceneAnimations.create, args)
  return newSceneAnimationId
}

export const updateSceneAnimation = async (args: UpdateArgs) => {
  await proxy().mutation(api.world.sceneAnimations.update, args)
}

export const deleteSceneAnimation = async (args: DeleteArgs) => {
  await proxy().mutation(api.world.sceneAnimations.delete_, args)
}