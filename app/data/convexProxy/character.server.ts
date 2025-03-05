import { proxy } from "~/data/convexProxy/index.server"
import { api } from "@/_generated/api";
import { type WorldId } from "@/worlds"
import type { CharacterId } from "@/world/character/schema";
import type { InsertArgs, UpdateArgs, DeleteArgs, UpdateTimeArgs, AddSkillArgs, RemoveSkillArgs } from "@/world/character/args";
// import { parseNotFoundRecordError, parseConvexError } from "@/error";


// export const generateUploadUrl = async () => {
//   return await proxy().mutation(api.world.resources.generateUploadUrl)
// }

export const getWorldCharacter = async (id: CharacterId) => {
  return await proxy().query(api.world.character.query.read, { id })
}

export const getWorldCharacterExtend = async (id: CharacterId) => {
  return await proxy().query(api.world.character.query.readEx, { id })
}

export const listWorldCharacters = async (worldId: WorldId) => {
  const characters = await proxy().query(api.world.character.query.list, { worldId })
  return characters
}

export const listWorldCharacterExtends = async (worldId: WorldId) => {
  const characterExs = await proxy().query(api.world.character.query.listEx, { worldId })
  return characterExs
}

export const createWorldCharacter = async (args: InsertArgs) => {
  const newCharacterId = await proxy().mutation(api.world.character.mutation.create, { ...args })
  return newCharacterId
}

export const updateWorldCharacter = async (args: UpdateArgs) => {
  await proxy().mutation(api.world.character.mutation.update, args)
}

export const deleteWorldCharacter = async (args: DeleteArgs) => {
  await proxy().mutation(api.world.character.mutation.delete_, args)
}

export const updateWorldCharacterSyncTime = async (args: UpdateTimeArgs) => {
  await proxy().mutation(api.world.character.mutation.updateSyncTime, args)
}

export const addWorldCharacterSkill = async (args: AddSkillArgs) => {
  await proxy().mutation(api.world.character.mutation.addSkill, args)
}

export const removeWorldCharacterSkill = async (args: RemoveSkillArgs) => {
  await proxy().mutation(api.world.character.mutation.removeSkill, args)
}