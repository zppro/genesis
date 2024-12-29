import { ObjectType, v } from 'convex/values';
import { idWorld } from '../worlds';
import { defineTable } from "convex/server";
import { mutation, query } from '../_generated/server';
import { Doc, Id } from "../_generated/dataModel";
import { idSpritesheet, read as readSpritesheet, SpritesheetDoc } from "./spritesheets";
import { TextureDoc, read as readTexture } from "./textures"
import { asyncMap } from "convex-helpers";
import { api } from "../_generated/api";


export const table = 'characters';
export const indexName_ByWorldId = 'byWorldId';
export const indexName_ByWorldIdAndSpritesheetId = 'byWorldIdAndSpritesheetId';
export const idCharacter = v.id(table);

export const characterSerialized = {
  name: v.string(),
  worldId: idWorld,
  // The speed of the animation. Can be tuned depending on the side and speed of the NPC.
  speed: v.number(),
  // spritesheet as pixijs definition 
  spritesheetId: idSpritesheet,
};



const { ...insertArgs } = characterSerialized
const { worldId: _, ..._updateArgs } = insertArgs
const updateArgs = { id: idCharacter, ..._updateArgs }
const deleteArgs = { id: idCharacter }

export type CharacterTable = typeof table
export type CharacterId = Id<CharacterTable>
export type CharacterDoc = Doc<CharacterTable>
export type CharacterExtendDoc = CharacterDoc & {
  spritesheet: SpritesheetDoc,
  textureUrl: string,
};
export type CharacterExtendDo_Old = CharacterDoc & {
  spritesheet: SpritesheetDoc,
  texture: TextureDoc,
};
export type SerializedCharacter = ObjectType<typeof characterSerialized>;
export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;

export const tableSchema = defineTable(characterSerialized)
  .index(indexName_ByWorldId, ["worldId"])
  .index(indexName_ByWorldIdAndSpritesheetId, ["worldId", "spritesheetId"])


export const create = mutation({
  args: insertArgs,
  handler: async (ctx, args) => {
    return await ctx.db.insert(table, args);
  },
});

export const read = query({
  args: { id: idCharacter },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const readEx = query({
  args: { id: idCharacter },
  handler: async (ctx, args) => {
    const entity = await read(ctx, args)
    const spritesheetEx = await ctx.runQuery(api.world.spritesheets.readEx, { id: entity?.spritesheetId! })
    const extendEntity: CharacterExtendDoc = { ...entity!, spritesheet: spritesheetEx!, textureUrl: spritesheetEx.texture.url }
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
    const entityExs: CharacterExtendDoc[] = await asyncMap(
      await list(ctx, args),
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