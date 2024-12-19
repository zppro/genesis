import { ObjectType, v } from 'convex/values';
import { idWorld } from '../worlds';
import { defineTable } from "convex/server";
import { mutation, query } from '../_generated/server';
import { Doc, Id } from "../_generated/dataModel";
import { idSpritesheet, read as readSpritesheet, SpritesheetDoc } from "./spritesheets";
import { TextureDoc, read as readTexture } from "./textures"

export const table = 'objects';
export const indexName_ByWorldId = 'by_worldId';
export const indexName_ByWorldIdAndType = 'by_worldIdAndType';
export const indexName_ByWorldIdAndSpritesheetId = 'by_worldIdAndSpritesheetId';
export const idObject = v.id(table);

export const OBJECT_TYPES = ['animation'] as const
const VObjectTypes = v.union(...OBJECT_TYPES.map(t => v.literal(t)))

export const objectSerialized = {
  name: v.string(),
  worldId: idWorld,
  type: VObjectTypes,
  // spritesheet as pixijs definition 
  spritesheetId: idSpritesheet, // 映射为 ai-town/data/animations下的json
};

const { ...insertArgs } = objectSerialized
const { worldId: _, ..._updateArgs } = insertArgs
const updateArgs = { id: idObject, ..._updateArgs }
const deleteArgs = { id: idObject }

export type ObjectTable = typeof table
export type ObjectId = Id<ObjectTable>
export type ObjectDoc = Doc<ObjectTable>
export type ObjectExtendDoc = ObjectDoc & {
  spritesheet: SpritesheetDoc,
  texture: TextureDoc,
};
export type SerializedObject = ObjectType<typeof objectSerialized>;
export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;

export const tableSchema = defineTable(objectSerialized)
  .index(indexName_ByWorldId, ["worldId"])
  .index(indexName_ByWorldIdAndType, ["worldId", "type"])
  .index(indexName_ByWorldIdAndSpritesheetId, ["worldId", "spritesheetId"])


export const create = mutation({
  args: insertArgs,
  handler: async (ctx, args) => {
    return await ctx.db.insert(table, args);
  },
});

export const read = query({
  args: { id: idObject },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const readEx = query({
  args: { id: idObject },
  handler: async (ctx, args) => {
    const entity = await read(ctx, args)
    const spritesheet = await readSpritesheet(ctx, { id: entity?.spritesheetId! })
    const texture = await readTexture(ctx, { id: spritesheet?.textureId! })
    const extendEntity: ObjectExtendDoc = { ...entity!, spritesheet: spritesheet!, texture: texture! }
    return extendEntity
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

export const listBySpritesheet = query({
  args: { worldId: idWorld, spritesheetId: idSpritesheet },
  handler: async (ctx, args) => {
    const { worldId, spritesheetId } = args
    return await ctx.db.query(table).withIndex(indexName_ByWorldIdAndSpritesheetId, (q) =>
      q
        .eq("worldId", worldId)
        .eq("spritesheetId", spritesheetId)
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
    await ctx.db.patch(id, patchData);
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
  },
});