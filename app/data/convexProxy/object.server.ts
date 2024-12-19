import { proxy } from "~/data/convexProxy/index.server"
import { api } from "@/_generated/api";
import { type WorldId } from "@/worlds"
import type { ObjectId, InsertArgs, UpdateArgs, DeleteArgs } from "@/world/objects";

export const getWorldObject = async (id: ObjectId) => {
  return await proxy().query(api.world.objects.read, { id })
}

export const getWorldObjectExtend = async (id: ObjectId) => {
  return await proxy().query(api.world.objects.readEx, { id })
}

export const listWorldObjects = async (worldId: WorldId) => {
  const characters = await proxy().query(api.world.objects.list, { worldId })
  return characters
}

export const createWorldObject = async (args: InsertArgs) => {
  const newCharacterId = await proxy().mutation(api.world.objects.create, { ...args })
  return newCharacterId
}

export const updateWorldObject = async (args: UpdateArgs) => {
  await proxy().mutation(api.world.objects.update, args)
}

export const deleteWorldObject = async (args: DeleteArgs) => {
  await proxy().mutation(api.world.objects.delete_, args)
}