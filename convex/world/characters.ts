// import { ObjectType, v, ConvexError } from 'convex/values';
// import { idWorld } from '../worlds';
// import { defineTable } from "convex/server";
// import { mutation, query, internalMutation } from '../_generated/server';
// import { Doc, Id } from "../_generated/dataModel";
// import { idSpritesheet, read as readSpritesheet, SpritesheetDoc } from "./spritesheets";
// import { TextureDoc, read as readTexture } from "./textures"
// import { asyncMap } from "convex-helpers";
// import { api } from "../_generated/api";
// import { characterSettingsVariantSerialized } from '../shared/characterSettings';


// export const table = 'characters';
// export const indexName_ByWorldId = 'byWorldId';
// export const indexName_ByWorldIdAndSpritesheetId = 'byWorldIdAndSpritesheetId';
// export const idCharacter = v.id(table);

// export const characterSerialized = {
//   modifyTime: v.number(),
//   name: v.string(),
//   worldId: idWorld,
//   syncTime: v.optional(v.number()),
//   // The speed of the animation. Can be tuned depending on the side and speed of the NPC.
//   speed: v.number(),
//   // spritesheet as pixijs definition 
//   spritesheetId: idSpritesheet,
//   settingsVariant: v.optional(characterSettingsVariantSerialized),
// };


// const { modifyTime, ...insertArgs } = characterSerialized
// const { worldId: _, ..._updateArgs } = insertArgs
// const updateArgs = { id: idCharacter, ..._updateArgs }
// const deleteArgs = { id: idCharacter }
// const updateTimeArgs = { id: idCharacter }

// export type CharacterTable = typeof table
// export type CharacterId = Id<CharacterTable>
// export type CharacterDoc = Doc<CharacterTable>
// export type CharacterExtendDoc = CharacterDoc & {
//   spritesheet: SpritesheetDoc,
//   textureUrl: string,
// };
// export type CharacterExtendDo_Old = CharacterDoc & {
//   spritesheet: SpritesheetDoc,
//   texture: TextureDoc,
// };
// export type SerializedCharacter = ObjectType<typeof characterSerialized>;
// export type InsertArgs = ObjectType<typeof insertArgs>;
// export type UpdateArgs = ObjectType<typeof updateArgs>;
// export type DeleteArgs = ObjectType<typeof deleteArgs>;
// export type UpdateTimeArgs = ObjectType<typeof updateTimeArgs>;


// export const tableSchema = defineTable(characterSerialized)
//   .index(indexName_ByWorldId, ["worldId"])
//   .index(indexName_ByWorldIdAndSpritesheetId, ["worldId", "spritesheetId"])


// export const create = mutation({
//   args: insertArgs,
//   handler: async (ctx, args) => {
//     const modifyTime = +new Date()
//     return await ctx.db.insert(table, { ...args, modifyTime });
//   },
// });

// export const read = query({
//   args: { id: idCharacter },
//   handler: async (ctx, args) => {
//     return await ctx.db.get(args.id);
//   },
// });

// export const readEx = query({
//   args: { id: idCharacter },
//   handler: async (ctx, args) => {
//     const entity = await read(ctx, args)
//     const spritesheetEx = await ctx.runQuery(api.world.spritesheets.readEx, { id: entity?.spritesheetId! })
//     const extendEntity: CharacterExtendDoc = { ...entity!, spritesheet: spritesheetEx!, textureUrl: spritesheetEx.texture.url }
//     return extendEntity
//   },
// });

// export const list = query({
//   args: { worldId: idWorld },
//   handler: async (ctx, args) => {
//     const { worldId } = args
//     return await ctx.db.query(table).withIndex(indexName_ByWorldId, (q) =>
//       q
//         .eq("worldId", worldId)
//     ).collect();
//   },
// })

// export const listEx = query({
//   args: { worldId: idWorld },
//   handler: async (ctx, args) => {
//     const entityExs: CharacterExtendDoc[] = await asyncMap(
//       await list(ctx, args),
//       async (entity) => {
//         const spritesheetEx = await ctx.runQuery(api.world.spritesheets.readEx, { id: entity.spritesheetId })
//         return { ...entity, spritesheet: spritesheetEx!, textureUrl: spritesheetEx.texture.url }
//       }
//     );
//     return entityExs
//   },
// })


// export const listBySpritesheet = query({
//   args: { worldId: idWorld, spritesheetId: idSpritesheet },
//   handler: async (ctx, args) => {
//     const { worldId, spritesheetId } = args
//     return await ctx.db.query(table).withIndex(indexName_ByWorldIdAndSpritesheetId, (q) =>
//       q
//         .eq("worldId", worldId)
//         .eq("spritesheetId", spritesheetId)
//     ).collect();
//   },
// })

// export const update = mutation({
//   args: updateArgs,
//   handler: async (ctx, args) => {
//     const { id, ...patchData } = args
//     const modifyTime = +new Date()
//     await ctx.db.patch(id, { ...patchData, modifyTime });
//   },
// });

// export const delete_ = mutation({
//   args: deleteArgs,
//   handler: async (ctx, args) => {
//     const { id } = args
//     const sceneNPCs = await ctx.runQuery(api.world.sceneNPCs.listByCharacter, { characterId: id })
//     if (sceneNPCs.length > 0) {
//       throw new ConvexError(`current character reference by sceneNPCs:[${sceneNPCs.map(v => v.name).join()}]`);
//     }
//     await ctx.db.delete(id);
//   },
// });

// export const updateModifyTime = internalMutation({
//   args: updateTimeArgs,
//   handler: async (ctx, args) => {
//     const { id } = args
//     const modifyTime = +new Date()
//     return await ctx.db.patch(id, { modifyTime });
//   },
// });

// export const updateSyncTime = mutation({
//   args: updateTimeArgs,
//   handler: async (ctx, args) => {
//     const { id } = args
//     const syncTime = +new Date()
//     return await ctx.db.patch(id, { syncTime });
//   },
// });