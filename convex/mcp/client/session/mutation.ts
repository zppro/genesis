import { mutation, internalMutation } from '../../../_generated/server';
import { _create, _update, _patch, _delete, _deleteByIds } from './helper';
import { insertArgs, updateArgs, deleteArgs, updateStatusArgs, deleteByIdsArgs } from "./args";


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

export const updateStatus = mutation({
  args: updateStatusArgs,
  handler: async (ctx, args) => {
    return await _patch(ctx, args)
  },
});

export const deleteByIds = mutation({
  args: deleteByIdsArgs,
  handler: async (ctx, args) => {
    return await _deleteByIds(ctx, args)
  },
});