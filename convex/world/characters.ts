import { ObjectType, v } from 'convex/values';
import { idWorld } from '../worlds';
import { defineTable } from "convex/server";
import { mutation, query } from '../_generated/server';
import { Doc, Id } from "../_generated/dataModel";
import { idStorage, StorageId } from "../shared/storage"
// import { spritesheetSerialized } from "../shared/spritesheet";

export const table = 'characters';
export const indexName_ByWorldId = 'byWorldId';
export const idCharacter = v.id(table);

export const characterSerialized = {
  name: v.string(),
  worldId: idWorld,
  // The speed of the animation. Can be tuned depending on the side and speed of the NPC.
  speed: v.number(),
  textureStorageId: idStorage,
  textureUrl: v.string(),
  // spritesheet as pixijs definition 
  spritesheetStorageId: idStorage,
  spritesheetUrl: v.string(),
};

const { textureUrl: _textureUrl, ...insertArgs } = characterSerialized
const { worldId: _, ..._updateArgs } = insertArgs
const updateArgs = { id: idCharacter, ..._updateArgs }
const deleteArgs = { id: idCharacter }

export type CharacterTable = typeof table
export type CharacterId = Id<CharacterTable>
export type CharacterDoc = Doc<CharacterTable>
export type SerializedCharacter = ObjectType<typeof characterSerialized>;
export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;

export const tableSchema = defineTable(characterSerialized)
  .index(indexName_ByWorldId, ["worldId"])


export const create = mutation({
  args: insertArgs,
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.textureStorageId) ?? undefined
    return await ctx.db.insert(table, { ...args, textureUrl: url ?? "" });
  },
});

export const read = query({
  args: { id: idCharacter },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const list = query({
  args: { worldId: idWorld },
  handler: async (ctx, args) => {
    const { worldId } = args
    return await ctx.db.query(table).withIndex(indexName_ByWorldId, (q) =>
      q
        .eq("worldId", worldId)
    ).collect();
  },
})

export const update = mutation({
  args: updateArgs,
  handler: async (ctx, args) => {
    const { id, ...patchData } = args
    const entity = await ctx.db.get(id);
    if (!entity) {
      throw new Error(`Invalid \`${table}\` ID: ${args.id}`);
    }
    if (args.textureStorageId !== entity.textureStorageId) {
      const url = await ctx.storage.getUrl(args.textureStorageId) ?? undefined
      await ctx.db.patch(id, { ...patchData, textureUrl: url ?? "" });
      await ctx.storage.delete(entity.textureStorageId)
      // 删除旧的stoargeId
    } else {
      await ctx.db.patch(id, patchData);
    }
  },
});

export const delete_ = mutation({
  args: deleteArgs,
  handler: async (ctx, args) => {
    const { id } = args
    const entity = await ctx.db.get(id);
    if (!entity) {
      throw new Error(`Invalid \`${table}\` ID: ${args.id}`);
    }
    await ctx.db.delete(id);
    await ctx.storage.delete(entity.textureStorageId)
  },
});