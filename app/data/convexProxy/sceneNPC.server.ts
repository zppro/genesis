import { proxy } from "~/data/convexProxy/index.server"
import { api } from "@/_generated/api";
import { type SceneId } from "@/world/scenes"
import type { SceneNPCId } from "@/world/sceneNPC/schema";
import type { InsertArgs, UpdateArgs, DeleteArgs } from "@/world/sceneNPC/args";
// import { parseNotFoundRecordError, parseConvexError } from "@/error";

export const getSceneNPC = async (id: SceneNPCId) => {
  return await proxy().query(api.world.sceneNPC.query.read, { id })
}

export const listSceneNPCsByScene = async (sceneId: SceneId) => {
  const sceneNPCs = await proxy().query(api.world.sceneNPC.query.listByScene, { sceneId })
  return sceneNPCs
}

export const listSceneNPCExtends = async (sceneId: SceneId) => {
  const sceneNPCExs = await proxy().query(api.world.sceneNPC.query.listExByScene, { sceneId })
  return sceneNPCExs
}

export const createSceneNPC = async (args: InsertArgs) => {
  const newSceneNPCId = await proxy().mutation(api.world.sceneNPC.mutation.create, args)
  return newSceneNPCId
}

export const updateSceneNPC = async (args: UpdateArgs) => {
  await proxy().mutation(api.world.sceneNPC.mutation.update, args)
}

export const deleteSceneNPC = async (args: DeleteArgs) => {
  await proxy().mutation(api.world.sceneNPC.mutation.delete_, args)
}