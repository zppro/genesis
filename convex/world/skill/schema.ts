import { v, ObjectType } from 'convex/values';
import { defineTable } from "convex/server";
import { idWorld } from '../../worlds';
import { idTexture } from "../textures";
import { idLLM } from '../llms';
import { Doc, Id } from "../../_generated/dataModel";
// import { functionDef } from "../../shared/type";

export const table = 'skills';
export const indexName_ByWorldId = 'by_worldId';
export const idSkill = v.id(table);

export type SkillTable = typeof table
export type SkillId = Id<SkillTable>
export type SkillDoc = Doc<SkillTable>


export const skillFields = {
  modifyTime: v.number(),
  syncTime: v.optional(v.number()),
  worldId: idWorld,
  name: v.string(),
  textureId: idTexture,
  llmId: idLLM,
  // functionDef,
  functionName: v.string(),
  systemPrompt: v.string(),
};


export const tableSchema = defineTable(skillFields)
  .index(indexName_ByWorldId, ["worldId"])