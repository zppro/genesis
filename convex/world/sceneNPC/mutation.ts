import { mutation, internalMutation } from '../../_generated/server';
import { _create, _update, _patch, _delete } from './helper';
import { insertArgs, updateArgs, deleteArgs, updateTimeArgs } from "./args";


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
    const { id } = args
    const modifyTime = +new Date()
    return await ctx.db.patch(id, { modifyTime });
  },
});
