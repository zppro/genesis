import { ObjectType, v } from 'convex/values';
import { QueryMutationCtx } from '../shared/context';
import { defineTable } from "convex/server";
import { mutation, query } from '../_generated/server';
import { Doc, Id } from "../_generated/dataModel";
import { idScene } from "./scenes"
import { idCharacter } from "./character/schema";
import { CharacterExtendDoc } from "./character/extend";
import { api, internal } from "../_generated/api";
import { asyncMap } from "convex-helpers";
import { idWorld } from '../worlds';

export const table = 'sceneNPCs';
export const indexName_BySceneId = 'by_sceneId';
export const indexName_ByCharacterId = 'by_characterId';
export const idSceneNPC = v.id(table);

export const sceneNPCSerialized = {
  modifyTime: v.number(),
  name: v.string(),
  worldId: idWorld,
  sceneId: idScene,
  characterId: idCharacter,
  // x axis value in the scene tilemap
  x: v.number(),
  // y axis value in the scene tilemap
  y: v.number(),
  // width of the character animation
  w: v.number(),
  // height of the character animation
  h: v.number(),
  // play speed of the character animation
  speed: v.number(),
  // move px to direction 
  move: v.number()
};


const { modifyTime, worldId: _1, ...insertArgs } = sceneNPCSerialized
const { sceneId: _2, ..._updateArgs } = insertArgs
const updateArgs = { id: idSceneNPC, ..._updateArgs }
const deleteArgs = { id: idSceneNPC }

export type SceneNPCTable = typeof table
export type SceneNPCId = Id<SceneNPCTable>
export type SceneNPCDoc = Doc<SceneNPCTable>
export type SceneNPCExtendDoc = SceneNPCDoc & {
  characterEx: CharacterExtendDoc,
};
export type SerializedSceneNPC = ObjectType<typeof sceneNPCSerialized>;
export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;

export const tableSchema = defineTable(sceneNPCSerialized)
  .index(indexName_BySceneId, ["sceneId"])
  .index(indexName_ByCharacterId, ["characterId"])


export const create = mutation({
  args: insertArgs,
  handler: async (ctx, args) => {
    const modifyTime = +new Date()
    const scene = await ctx.db.get(args.sceneId);
    const worldId = scene!.worldId
    const createRes = await ctx.db.insert(table, { ...args, modifyTime, worldId });
    await ctx.runMutation(internal.world.scenes.updateModifyTime, { id: args.sceneId })
    return createRes
  },
});

export const read = query({
  args: { id: idSceneNPC },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const list = query({
  args: { sceneId: idScene },
  handler: async (ctx, args) => {
    const { sceneId } = args
    return await ctx.db.query(table).withIndex(indexName_BySceneId, (q) =>
      q
        .eq("sceneId", sceneId)
    ).collect();
  },
})

export const listEx = query({
  args: { sceneId: idScene },
  handler: async (ctx, args) => {
    const entityExs: SceneNPCExtendDoc[] = await asyncMap(
      await list(ctx, args),
      async (entity) => {
        const characterEx = await ctx.runQuery(api.world.characters.readEx, { id: entity.characterId })
        return { ...entity, characterEx: characterEx! }
      }
    );
    return entityExs
  },
})

export const listByCharacter = query({
  args: { characterId: idCharacter },
  handler: async (ctx, args) => {
    return await _listByCharacter(ctx, args);
    // const { characterId } = args
    // return await ctx.db.query(table).withIndex(indexName_ByCharacterId, (q) =>
    //   q
    //     .eq("characterId", characterId)
    // ).collect();
  },
})

export const listByCharacterArgs = { characterId: idCharacter }
export type ListByCharacterArgs = ObjectType<typeof listByCharacterArgs>;

export async function _listByCharacter(ctx: QueryMutationCtx, args: ListByCharacterArgs) {
  const { characterId } = args
  return await ctx.db.query(table).withIndex(indexName_ByCharacterId, (q) =>
    q
      .eq("characterId", characterId)
  ).collect();
}

export const update = mutation({
  args: updateArgs,
  handler: async (ctx, args) => {
    const { id, ...patchData } = args
    const entity = await ctx.db.get(id);
    if (!entity) {
      throw new Error(`Invalid \`${table}\` ID: ${args.id}`);
    }
    const modifyTime = +new Date()
    await ctx.db.patch(id, { ...patchData, modifyTime });
    await ctx.runMutation(internal.world.scenes.updateModifyTime, { id: entity.sceneId })
  },
});

export const delete_ = mutation({
  args: deleteArgs,
  handler: async (ctx, args) => {
    const { id } = args
    const entity = await ctx.db.get(id);
    if (!entity) {
      throw new Error(`Invalid \`${table}\` ID: ${id}`);
    }
    await ctx.db.delete(id);
    await ctx.runMutation(internal.world.scenes.updateModifyTime, { id: entity.sceneId })
  },
});