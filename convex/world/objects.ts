import { ObjectType, v, ConvexError } from 'convex/values';
import { idWorld } from '../worlds';
import { defineTable } from "convex/server";
import { mutation, query } from '../_generated/server';
import { Doc, Id } from "../_generated/dataModel";
import { idSpritesheet, SpritesheetDoc } from "./spritesheets";
import { TextureDoc } from "./textures"
import { asyncMap } from "convex-helpers";
import { api } from "../_generated/api";


export const table = 'objects';
export const indexName_ByWorldId = 'by_worldId';
export const indexName_ByWorldIdAndType = 'by_worldIdAndType';
export const indexName_ByWorldIdAndSpritesheetId = 'by_worldIdAndSpritesheetId';
export const idObject = v.id(table);

export const OBJECT_TYPES = ['animation'] as const
const VObjectTypes = v.union(...OBJECT_TYPES.map(t => v.literal(t)))

export const objectSerialized = {
  modifyTime: v.number(),
  name: v.string(),
  worldId: idWorld,
  type: VObjectTypes,
  // spritesheet as pixijs definition 
  spritesheetId: idSpritesheet, // 映射为 ai-town/data/animations下的json
};

const { modifyTime, ...insertArgs } = objectSerialized
const { worldId: _, ..._updateArgs } = insertArgs
const updateArgs = { id: idObject, ..._updateArgs }
const deleteArgs = { id: idObject }

export type ObjectTable = typeof table
export type ObjectId = Id<ObjectTable>
export type ObjectDoc = Doc<ObjectTable>
export type ObjectTypes = typeof OBJECT_TYPES[number];
export type ObjectExtendDoc = ObjectDoc & {
  spritesheet: SpritesheetDoc,
  textureUrl: string,
};
export type ObjectExtendDoc_Old = ObjectDoc & {
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
    const modifyTime = +new Date()
    return await ctx.db.insert(table, { ...args, modifyTime });
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
    const spritesheetEx = await ctx.runQuery(api.world.spritesheets.readEx, { id: entity?.spritesheetId! })
    const extendEntity: ObjectExtendDoc = { ...entity!, spritesheet: spritesheetEx!, textureUrl: spritesheetEx.texture.url }
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
    const entityExs: ObjectExtendDoc[] = await asyncMap(
      await list(ctx, args),
      async (entity) => {
        const spritesheetEx = await ctx.runQuery(api.world.spritesheets.readEx, { id: entity.spritesheetId })
        return { ...entity, spritesheet: spritesheetEx!, textureUrl: spritesheetEx.texture.url }
      }
    );
    return entityExs
  },
})

export const listByType = query({
  args: { worldId: idWorld, type: VObjectTypes },
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
  args: { worldId: idWorld, type: VObjectTypes },
  handler: async (ctx, args) => {
    const entityExs: ObjectExtendDoc[] = await asyncMap(
      await listByType(ctx, args),
      async (entity) => {
        const spritesheetEx = await ctx.runQuery(api.world.spritesheets.readEx, { id: entity.spritesheetId })
        return { ...entity, spritesheet: spritesheetEx!, textureUrl: spritesheetEx.texture.url }
      }
    );
    return entityExs
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
    // because updateArgs validator,no more validate
    // const entity = await ctx.db.get(id);
    // if (!entity) {
    //   throw new Error(`Invalid \`${table}\` ID: ${args.id}`);
    // }
    const modifyTime = +new Date()
    await ctx.db.patch(id, { ...patchData, modifyTime });
  },
});

export const delete_ = mutation({
  args: deleteArgs,
  handler: async (ctx, args) => {
    const { id } = args
    const sceneAnimations = await ctx.runQuery(api.world.sceneAnimations.listByObject, { objectId: id })
    if (sceneAnimations.length > 0) {
      throw new ConvexError(`current object reference by sceneAnimations:[${sceneAnimations.map(v => v.name).join()}]`);
    }
    await ctx.db.delete(id);
  },
});