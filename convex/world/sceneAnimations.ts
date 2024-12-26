import { ObjectType, v } from 'convex/values';
import { idWorld } from '../worlds';
import { defineTable } from "convex/server";
import { mutation, query } from '../_generated/server';
import { Doc, Id } from "../_generated/dataModel";
import { idScene, SceneId } from "./scenes"
import { idObject, ObjectId, ObjectExtendDoc } from "./objects"
import { api } from "../_generated/api";
import { asyncMap } from "convex-helpers";

export const table = 'sceneAnimations';
export const indexName_BySceneId = 'by_sceneId';
export const idSceneAnimation = v.id(table);

export const sceneAnimationSerialized = {
  name: v.string(),
  sceneId: idScene,
  objectId: idObject,
  // x axis value in the scene tilemap
  x: v.number(),
  // y axis value in the scene tilemap
  y: v.number(),
  // width of the animation
  w: v.number(),
  // height of the animation
  h: v.number(),
  // play speed of the animation
  speed: v.number(),
};


const { ...insertArgs } = sceneAnimationSerialized
const { sceneId: _, ..._updateArgs } = insertArgs
const updateArgs = { id: idSceneAnimation, ..._updateArgs }
const deleteArgs = { id: idSceneAnimation }

export type SceneAnimationTable = typeof table
export type SceneAnimationId = Id<SceneAnimationTable>
export type SceneAnimationDoc = Doc<SceneAnimationTable>
export type SceneAnimationExtendDoc = SceneAnimationDoc & {
  objectEx: ObjectExtendDoc,
};
export type SerializedSceneAnimation = ObjectType<typeof sceneAnimationSerialized>;
export type InsertArgs = ObjectType<typeof insertArgs>;
export type UpdateArgs = ObjectType<typeof updateArgs>;
export type DeleteArgs = ObjectType<typeof deleteArgs>;

export const tableSchema = defineTable(sceneAnimationSerialized)
  .index(indexName_BySceneId, ["sceneId"])


export const create = mutation({
  args: insertArgs,
  handler: async (ctx, args) => {
    return await ctx.db.insert(table, args);
  },
});

export const read = query({
  args: { id: idSceneAnimation },
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
    const entityExs: SceneAnimationExtendDoc[] = await asyncMap(
      await list(ctx, args),
      async (entity) => {
        const objectEx = await ctx.runQuery(api.world.objects.readEx, { id: entity.objectId })
        return { ...entity, objectEx: objectEx! }
      }
    );
    return entityExs
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
    return await ctx.db.patch(id, patchData);
  },
});

export const delete_ = mutation({
  args: deleteArgs,
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});