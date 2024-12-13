import { proxy } from "~/data/convexProxy/index.server"
import { api } from "@/_generated/api";
import { type WorldId } from "@/worlds"
import type { CharacterId, InsertArgs, UpdateArgs, DeleteArgs } from "@/world/characters";
// import { parseNotFoundRecordError, parseConvexError } from "@/error";


// export const generateUploadUrl = async () => {
//   return await proxy().mutation(api.world.resources.generateUploadUrl)
// }

export const getWorldCharacter = async (id: CharacterId) => {
  return await proxy().query(api.world.characters.read, { id })
}

export const listWorldCharacters = async (worldId: WorldId) => {
  const characters = await proxy().query(api.world.characters.list, { worldId })
  return characters
}

export const createWorldCharacter = async (args: InsertArgs) => {
  const newCharacterId = await proxy().mutation(api.world.characters.create, { ...args })
  return newCharacterId
}

export const updateWorldCharacter = async (args: UpdateArgs) => {
  await proxy().mutation(api.world.characters.update, args)
}

export const deleteWorldCharacter = async (args: DeleteArgs) => {
  await proxy().mutation(api.world.characters.delete_, args)
}