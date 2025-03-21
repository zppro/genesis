import { v, ObjectType, Infer } from 'convex/values';
import { defineTable } from "convex/server";
import { idWorld } from '../../worlds';
import { idTexture } from "../textures";
import { slimServerTool } from '../mcpServerTool/slim';
import { idLLM } from '../llms';
import { Doc, Id } from "../../_generated/dataModel";
// import { functionDef } from "../../shared/type";

export const table = 'skills';
export const indexName_ByWorldId = 'by_worldId';
export const indexName_ByWorldIdAndTextureId = 'by_worldIdAndTextureId';
export const indexName_ByWorldIdAndLLMId = 'by_worldIdAndLLMId';
export const idSkill = v.id(table);

export type SkillTable = typeof table
export type SkillId = Id<SkillTable>
export type SkillDoc = Doc<SkillTable>


export const skillTypeMcpTool = 'mcp_tool' as const;
// export const skillTypeMcpResource = 'mcp_resource' as const;
// export const skillTypeMcpPrompt = 'mcp_resource' as const;
export const skillTypeCustomFunction = 'custom_function' as const;

export const skillTypes = v.union(v.literal(skillTypeMcpTool), v.literal(skillTypeCustomFunction));
export type SkillTypes = Infer<typeof skillTypes>

export const skillFields = {
  modifyTime: v.number(),
  syncTime: v.optional(v.number()),
  worldId: idWorld,
  name: v.string(),
  textureId: idTexture,
  llmId: idLLM,
  // functionDef,
  // functionName: v.string(),
  // systemPrompt: v.string(),

  data: v.union(
    // Setting up dynamics data
    v.object({
      type: v.literal(skillTypeMcpTool),
      tools: v.array(slimServerTool),
    }),
    v.object({
      type: v.literal(skillTypeCustomFunction),
      functionName: v.string(),
      systemPrompt: v.string(),
    }),
  ),
};

export const tableSchema = defineTable(skillFields)
  .index(indexName_ByWorldId, ["worldId"])
  .index(indexName_ByWorldIdAndTextureId, ["worldId", "textureId"])
  .index(indexName_ByWorldIdAndLLMId, ["worldId", "llmId"])