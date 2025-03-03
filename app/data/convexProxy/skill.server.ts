import { proxy } from "~/data/convexProxy/index.server"
import { api } from "@/_generated/api";
import { type WorldId } from "@/worlds";
import { type TextureId } from "@/world/textures";
import type { SkillId } from "@/world/skill/schema";
import type { InsertArgs, UpdateArgs, DeleteArgs, UpdateTimeArgs } from "@/world/skill/args";

export const getWorldSkill = async (id: SkillId) => {
  return await proxy().query(api.world.skill.query.read, { id })
}

export const getWorldSkillExtend = async (id: SkillId) => {
  return await proxy().query(api.world.skill.query.readEx, { id })
}

export const listWorldSkills = async (worldId: WorldId) => {
  return await proxy().query(api.world.skill.query.list, { worldId })
}

export const createWorldSkill = async (args: InsertArgs) => {
  return await proxy().mutation(api.world.skill.mutation.create, { ...args })
}

export const updateWorldSkill = async (args: UpdateArgs) => {
  await proxy().mutation(api.world.skill.mutation.update, args)
}

export const deleteWorldSkill = async (args: DeleteArgs) => {
  await proxy().mutation(api.world.skill.mutation.delete_, args)
}

export const updateWorldSkillSyncTime = async (args: UpdateTimeArgs) => {
  await proxy().mutation(api.world.skill.mutation.updateSyncTime, args)
}