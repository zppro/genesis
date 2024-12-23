import { ObjectType, v } from 'convex/values';
import { idWorld } from '../worlds';
import { idTexture } from "./textures";
import { defineTable } from "convex/server";
import { mutation, query } from '../_generated/server';
import { Doc, Id } from "../_generated/dataModel";
import { TextureDoc, read as readTexture } from "./textures"

import {
  getAll,
  getOneFrom,
  getOneFromOrThrow,
  getManyFrom,
  getManyVia,
} from "convex-helpers/server/relationships";
import { asyncMap } from "convex-helpers";


export const table = 'spritesheets';
export const indexName_ByWorldId = 'by_worldId';
export const indexName_ByWorldIdAndType = 'by_worldIdAndType';
export const indexName_ByWorldIdAndTextureId = 'by_worldIdAndTextureId';
export const idSpritesheet = v.id(table);

export const SPRITESHEET_TYPES = ['character', 'object'] as const
const VSpritesheetTypes = v.union(...SPRITESHEET_TYPES.map(t => v.literal(t)))

export const spritesheetSerialized = {
  name: v.string(),
  worldId: idWorld,
  type: VSpritesheetTypes,
  // categories2: v.array(v.union(v.literal("character"), v.literal("background-object"))),
  textureId: idTexture,
  data: v.string(),
};


const { ...insertArgs } = spritesheetSerialized
const { worldId: _, ..._updateArgs } = insertArgs
const updateArgs = { id: idSpritesheet, ..._updateArgs }
const deleteArgs = { id: idSpritesheet }

export type SpritesheetTable = typeof table
export type SpritesheetId = Id<SpritesheetTable>
export type SpritesheetDoc = Doc<SpritesheetTable>
export type SpritesheetExtendDoc = SpritesheetDoc & {
  texture: TextureDoc,
};
export type SpritesheetTypes = typeof SPRITESHEET_TYPES[number];
export type SerializedSpritesheet = ObjectType<typeof spritesheetSerialized>;
export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;

export const tableSchema = defineTable(spritesheetSerialized)
  .index(indexName_ByWorldId, ["worldId"])
  .index(indexName_ByWorldIdAndType, ["worldId", "type"])
  .index(indexName_ByWorldIdAndTextureId, ["worldId", "textureId"])


export const create = mutation({
  args: insertArgs,
  handler: async (ctx, args) => {
    return await ctx.db.insert(table, args);
  },
});

export const read = query({
  args: { id: idSpritesheet },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const readEx = query({
  args: { id: idSpritesheet },
  handler: async (ctx, args) => {
    const entity = await read(ctx, args)
    const texture = await readTexture(ctx, { id: entity?.textureId! })
    const extendEntity: SpritesheetExtendDoc = { ...entity!, texture: texture! }
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

export const listEx = query({
  args: { worldId: idWorld },
  handler: async (ctx, args) => {
    const entityExs: SpritesheetExtendDoc[] = await asyncMap(
      await list(ctx, args),
      async (entity) => {
        const texture = await ctx.db.get(entity.textureId)
        return { ...entity, texture: texture! }
      }
    );
    return entityExs
  },
})

export const listByType = query({
  args: { worldId: idWorld, type: VSpritesheetTypes },
  handler: async (ctx, args) => {
    const { worldId, type } = args
    return await ctx.db.query(table).withIndex(indexName_ByWorldIdAndType, (q) =>
      q
        .eq("worldId", worldId)
        .eq("type", type)
    ).collect();
  },
})

export const listExByType = query({
  args: { worldId: idWorld, type: VSpritesheetTypes },
  handler: async (ctx, args) => {
    const entityExs: SpritesheetExtendDoc[] = await asyncMap(
      await listByType(ctx, args),
      async (entity) => {
        const texture = await ctx.db.get(entity.textureId)
        return { ...entity, texture: texture! }
      }
    );
    return entityExs
  },
})

export const listByTexture = query({
  args: { worldId: idWorld, textureId: idTexture },
  handler: async (ctx, args) => {
    const { worldId, textureId } = args
    return await ctx.db.query(table).withIndex(indexName_ByWorldIdAndTextureId, (q) =>
      q
        .eq("worldId", worldId)
        .eq("textureId", textureId)
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