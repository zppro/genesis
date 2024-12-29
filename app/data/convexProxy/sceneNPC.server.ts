import { proxy } from "~/data/convexProxy/index.server"
import { api } from "@/_generated/api";
import { type SceneId } from "@/world/scenes"
import type { SceneNPCId, InsertArgs, UpdateArgs, DeleteArgs } from "@/world/sceneNPCs";
// import { parseNotFoundRecordError, parseConvexError } from "@/error";

export const getSceneNPC = async (id: SceneNPCId) => {
  return await proxy().query(api.world.sceneNPCs.read, { id })
}


export const listSceneNPCs = async (sceneId: SceneId) => {
  const sceneNPCs = await proxy().query(api.world.sceneNPCs.list, { sceneId })
  return sceneNPCs
}

export const listSceneNPCExtends = async (sceneId: SceneId) => {
  const sceneNPCExs = await proxy().query(api.world.sceneNPCs.listEx, { sceneId })
  return sceneNPCExs
}

export const createSceneNPC = async (args: InsertArgs) => {
  const newSceneNPCId = await proxy().mutation(api.world.sceneNPCs.create, args)
  return newSceneNPCId
}

export const updateSceneNPC = async (args: UpdateArgs) => {
  await proxy().mutation(api.world.sceneNPCs.update, args)
}

export const deleteSceneNPC = async (args: DeleteArgs) => {
  await proxy().mutation(api.world.sceneNPCs.delete_, args)
}