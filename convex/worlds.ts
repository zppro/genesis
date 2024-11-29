import { ObjectType, v } from 'convex/values';
import { action, MutationCtx, internalMutation, mutation, internalQuery, query } from './_generated/server';
import { internal, api } from "./_generated/api";
import { Doc } from "../convex/_generated/dataModel";

export const worldTable = 'worlds'
export const WorldType = v.union(v.literal('normal'), v.literal('super'))
export const WorldID = v.id(worldTable)

export const worldSerialized = {
  name: v.string(),
  type: WorldType,
  timeSpeedRatio: v.string(),
  startTime: v.optional(v.number()),
  desc: v.optional(v.string()),
};
const { startTime, ...insertArgs } = worldSerialized
const { type, timeSpeedRatio, ..._updateArgs } = insertArgs
const updateArgs = { id: WorldID, ..._updateArgs }
const deleteArgs = { id: WorldID }

type WorldTable = typeof worldTable
export type SerializedWorld = ObjectType<typeof worldSerialized>;
export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;
// export type UpdateArgs = Omit<ObjectType<typeof updateArgs>, "startTime" | "type">;

export const create = mutation({
  args: insertArgs,
  handler: async (ctx, args) => {
    return await ctx.db.insert(worldTable, args);
  },
});

export const createWorld = action({
  args: insertArgs,
  handler: async (ctx, args): Promise<string> => {
    return await ctx.runMutation(api.worlds.create, args);
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query(worldTable).collect();
  },
})

export const listWorlds = action({
  handler: async (ctx): Promise<Doc<WorldTable>[]> => {
    const lists = await ctx.runQuery(api.worlds.list);
    return lists
  },
});


export const update = internalMutation({
  args: updateArgs,
  handler: async (ctx, args) => {
    const { id, ...patchData } = args
    const world = await ctx.db.get(id);
    if (!world) {
      throw new Error(`Invalid world ID: ${args.id}`);
    }
    return await ctx.db.patch(id, patchData);
  },
});

export const updateWorld = action({
  args: updateArgs,
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.worlds.update, args);
  },
});

export const delete_ = internalMutation({
  args: deleteArgs,
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const deleteWorld = action({
  args: deleteArgs,
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.worlds.delete_, args);
  },
});
