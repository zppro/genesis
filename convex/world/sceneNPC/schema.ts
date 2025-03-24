import { ObjectType, v } from 'convex/values';
import { defineTable } from "convex/server";
import { Doc, Id } from "../../_generated/dataModel";
import { idScene } from "../scenes"
import { idCharacter } from "../character/schema";
import { idWorld } from '../../worlds';

export const table = 'sceneNPCs';
export const indexName_BySceneId = 'by_sceneId';
export const indexName_ByCharacterId = 'by_characterId';
export const idSceneNPC = v.id(table);

export type SceneNPCTable = typeof table
export type SceneNPCId = Id<SceneNPCTable>
export type SceneNPCDoc = Doc<SceneNPCTable>

export const sceneNPCFields = {
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

export const tableSchema = defineTable(sceneNPCFields)
  .index(indexName_BySceneId, ["sceneId"])
  .index(indexName_ByCharacterId, ["characterId"])