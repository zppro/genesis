import { internalMutation, mutation } from '../../_generated/server';
import { _readOrThrow, _create, _update, _patch, _delete } from './helper';
import {
  insertArgs, updateArgs, deleteArgs, updateTimeArgs,
  addSkillArgs, removeSkillArgs
} from "./args";


export const create = mutation({
  args: insertArgs,
  handler: async (ctx, args) => {
    return await _create(ctx, args);
  },
});

export const update = mutation({
  args: updateArgs,
  handler: async (ctx, args) => {
    return await _update(ctx, args)
  },
});

export const delete_ = mutation({
  args: deleteArgs,
  handler: async (ctx, args) => {
    return await _delete(ctx, args)
  },
});

export const updateModifyTime = internalMutation({
  args: updateTimeArgs,
  handler: async (ctx, args) => {
    return await _patch(ctx, args);
  },
});

export const updateSyncTime = mutation({
  args: updateTimeArgs,
  handler: async (ctx, args) => {
    const { id } = args
    const syncTime = +new Date()
    return await _patch(ctx, { id, syncTime });
  },
});

export const addSkill = mutation({
  args: addSkillArgs,
  handler: async (ctx, args) => {
    const { id, skillId } = args
    let { skillIds } = await _readOrThrow(ctx, { id })
    if (skillIds.includes(skillId)) {
      return
    }
    skillIds.push(skillId)
    return await _patch(ctx, { id, skillIds });
  },
});

export const removeSkill = mutation({
  args: removeSkillArgs,
  handler: async (ctx, args) => {
    const { id, skillId } = args
    let { skillIds } = await _readOrThrow(ctx, { id })
    const idx = skillIds.indexOf(skillId)
    if (idx === -1) {
      return
    }
    skillIds.splice(idx, 1)
    return await _patch(ctx, { id, skillIds });
  },
});