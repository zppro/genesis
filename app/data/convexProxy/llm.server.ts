import { proxy } from "~/data/convexProxy/index.server"
import { api } from "@/_generated/api";
import { type WorldId } from "@/worlds"
import type { LLMId, InsertArgs, UpdateArgs, DeleteArgs } from "@/world/llms";
import { RunLLMArgs, RunLLMWithFunctionCallingArgs } from "@/world/llmsAction"

export const getWorldLLM = async (id: LLMId) => {
  return await proxy().query(api.world.llms.read, { id })
}

export const listWorldLLMs = async (worldId: WorldId) => {
  return await proxy().query(api.world.llms.list, { worldId })
}

export const createWorldLLM = async (args: InsertArgs) => {
  const newCharacterId = await proxy().mutation(api.world.llms.create, { ...args })
  return newCharacterId
}

export const updateWorldLLM = async (args: UpdateArgs) => {
  await proxy().mutation(api.world.llms.update, args)
}

export const deleteWorldLLM = async (args: DeleteArgs) => {
  await proxy().mutation(api.world.llms.delete_, args)
}

export const runLLM = async (args: RunLLMArgs) => {
  return await proxy().action(api.world.llmsAction.runLLM, args)
}

export const runLLMWithFunctionCalling = async (args: RunLLMWithFunctionCallingArgs) => {
  return await proxy().action(api.world.llmsAction.runLLMWithFunctionCalling, args)
}

