import { ObjectType, v, ConvexError } from 'convex/values';
import { idWorld } from '../worlds';
import { idTexture } from "./textures";
import { defineTable } from "convex/server";
import { internalMutation, mutation, query } from '../_generated/server';
import { api, internal } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { TextureDoc, read as readTexture } from "./textures"
import { Options } from '../shared/opts';
import { QueryMutationCtx } from '../shared/context';
import { _readOrThrow as readTextureOrThrow } from './textures';
import { asyncMap } from "convex-helpers";


export const table = 'spritesheets';
export const indexName_ByWorldId = 'by_worldId';
export const indexName_ByWorldIdAndType = 'by_worldIdAndType';
export const indexName_ByWorldIdAndTextureId = 'by_worldIdAndTextureId';
export const idSpritesheet = v.id(table);

export const SPRITESHEET_TYPES = ['character', 'object'] as const
const VSpritesheetTypes = v.union(...SPRITESHEET_TYPES.map(t => v.literal(t)))

export const spritesheetSerialized = {
  modifyTime: v.number(),
  name: v.string(),
  worldId: idWorld,
  syncTime: v.optional(v.number()),
  type: VSpritesheetTypes,
  // categories2: v.array(v.union(v.literal("character"), v.literal("background-object"))),
  textureId: idTexture,
  data: v.string(),
};


const { modifyTime, ...insertArgs } = spritesheetSerialized
const { worldId: _, ..._updateArgs } = insertArgs
const updateArgs = { id: idSpritesheet, ..._updateArgs }
const deleteArgs = { id: idSpritesheet }
const updateTimeArgs = { id: idSpritesheet }

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
export type UpdateTimeArgs = ObjectType<typeof updateTimeArgs>;

export const tableSchema = defineTable(spritesheetSerialized)
  .index(indexName_ByWorldId, ["worldId"])
  .index(indexName_ByWorldIdAndType, ["worldId", "type"])
  .index(indexName_ByWorldIdAndTextureId, ["worldId", "textureId"])


export const create = mutation({
  args: insertArgs,
  handler: async (ctx, args) => {
    const modifyTime = +new Date()
    return await ctx.db.insert(table, { ...args, modifyTime });
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

export const readArgs = { id: idSpritesheet };

export type ReadArgs = ObjectType<typeof readArgs>;

export async function _readOrThrow(ctx: QueryMutationCtx, args: ReadArgs, opts?: Options) {
  const entity = await _read(ctx, args);
  if (!entity) throw new ConvexError(opts?.throwErrorMsg ? opts?.throwErrorMsg : `Invalid \`${table}\` engineId: ${args.id}`);
  return entity;
}

export async function _read(ctx: QueryMutationCtx, args: ReadArgs) {
  const { id } = args;
  return await ctx.db.get(id);
}

export async function _readExByIdOrEntity(ctx: QueryMutationCtx, entityOrId: SpritesheetDoc | SpritesheetId): Promise<SpritesheetExtendDoc> {
  let entity: SpritesheetDoc;
  if (typeof entityOrId === "string") {
    entity = await _readOrThrow(ctx, { id: entityOrId })
  } else {
    entity = entityOrId
  }
  const texture = await readTextureOrThrow(ctx, { id: entity.textureId });
  return { ...entity, texture };
}

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
      throw new ConvexError(`Invalid \`${table}\` ID: ${args.id}`);
    }
    const modifyTime = +new Date()
    await ctx.db.patch(id, { ...patchData, modifyTime });
    // make ref entity updateModifyTime
    const characters = await ctx.runQuery(api.world.character.query.listBySpritesheet, { worldId: entity.worldId, spritesheetId: entity._id })
    await Promise.all(characters.map(async (character) => {
      await ctx.runMutation(internal.world.character.mutation.updateModifyTime, { id: character._id })
    }))
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
    const objects = await ctx.runQuery(api.world.objects.listBySpritesheet, { worldId: entity.worldId, spritesheetId: entity._id })
    if (objects.length > 0) {
      throw new ConvexError(`current spritesheet reference by objects:[${objects.map(v => v.name).join()}]`);
    }
    const characters = await ctx.runQuery(api.world.character.query.listBySpritesheet, { worldId: entity.worldId, spritesheetId: entity._id })
    if (characters.length > 0) {
      throw new ConvexError(`current spritesheet reference by characters:[${characters.map(v => v.name).join()}]`);
    }

    return await ctx.db.delete(id);
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

export const updateSyncTime = mutation({
  args: updateTimeArgs,
  handler: async (ctx, args) => {
    const { id } = args
    const syncTime = +new Date()
    return await ctx.db.patch(id, { syncTime });
  },
});