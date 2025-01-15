import { ObjectType, v, ConvexError } from 'convex/values';
import { idLLM } from '../world/llms';
import { defineTable, paginationOptsValidator } from "convex/server";
import { mutation, query } from '../_generated/server';
import { Doc, Id } from "../_generated/dataModel";


export const table = 'llmLogs';
export const indexName_ByLLMId = 'byLLMId';
export const idLLMLog = v.id(table);

export const llmLogSerialized = {
  modifyTime: v.number(),
  llmId: idLLM,
  req: v.string(),
  res: v.string(),
};



const { modifyTime, ...insertArgs } = llmLogSerialized
const { ..._updateArgs } = insertArgs
const updateArgs = { id: idLLMLog, ..._updateArgs }
const deleteArgs = { id: idLLMLog }

export type LLMLogTable = typeof table
export type LLMLogId = Id<LLMLogTable>
export type LLMLogDoc = Doc<LLMLogTable>

export type SerializedLLMLog = ObjectType<typeof llmLogSerialized>;
export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;

export const tableSchema = defineTable(llmLogSerialized)
  .index(indexName_ByLLMId, ["llmId"])

export const create = mutation({
  args: insertArgs,
  handler: async (ctx, args) => {
    const modifyTime = +new Date()
    return await ctx.db.insert(table, { ...args, modifyTime });
  },
});

export const read = query({
  args: { id: idLLMLog },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const list = query({
  args: { llmId: idLLM },
  handler: async (ctx, args) => {
    const { llmId } = args
    return await ctx.db.query(table).withIndex(indexName_ByLLMId, (q) =>
      q
        .eq("llmId", llmId)
    ).collect();
  },
})

export const page = query({
  args: { llmId: idLLM, opts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const { llmId, opts } = args
    return await ctx.db.query(table).withIndex(indexName_ByLLMId, (q) =>
      q
        .eq("llmId", llmId)
    ).paginate(opts)
  },
})

export const update = mutation({
  args: updateArgs,
  handler: async (ctx, args) => {
    const { id, ...patchData } = args
    const modifyTime = +new Date()
    await ctx.db.patch(id, { ...patchData, modifyTime });
  },
});

export const delete_ = mutation({
  args: deleteArgs,
  handler: async (ctx, args) => {
    const { id } = args
    await ctx.db.delete(id);
  },
});