import { ObjectType, v } from 'convex/values';
import { defineTable } from "convex/server";
import { action, internalMutation, mutation, query } from './_generated/server';
import { internal, api } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

export const table = 'worlds'
export const idWorld = v.id(table)

export const WORLD_TYPES = ['normal', 'super'] as const

export const worldSerialized = {
  name: v.string(),
  type: v.union(...WORLD_TYPES.map(w => v.literal(w))),
  timeSpeedRatio: v.string(),
  startTime: v.optional(v.number()),
  desc: v.optional(v.string())
};
const { startTime, ...insertArgs } = worldSerialized
const { type, timeSpeedRatio, ..._updateArgs } = insertArgs
const updateArgs = { id: idWorld, ..._updateArgs }
const deleteArgs = { id: idWorld }

export type WorldTable = typeof table
export type WorldId = Id<WorldTable>;
export type WorldDoc = Doc<WorldTable>;

export type SerializedWorld = ObjectType<typeof worldSerialized>;
export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;
// export type UpdateArgs = Omit<ObjectType<typeof updateArgs>, "startTime" | "type">;

export const tableSchema = defineTable(worldSerialized)

export const create = mutation({
  args: insertArgs,
  handler: async (ctx, args) => {
    return await ctx.db.insert(table, args);
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
    return await ctx.db.query(table).collect();
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
    const entity = await ctx.db.get(id);
    if (!entity) {
      throw new Error(`Invalid \`${table}\` ID: ${args.id}`);
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
