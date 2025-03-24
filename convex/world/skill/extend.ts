import { SkillDoc } from "./schema"
import { LLMDoc } from "../llms"
import { McpServerExtendDoc } from "../mcpServer/extend";
import { McpServerToolDoc } from "../mcpServerTool/schema";

export type SkillExtendDoc = SkillDoc & {
  textureUrl: string,
  llm: LLMDoc,
  mcpServerTools?: McpServerToolDoc[]
};

export type SkillSyncDoc = SkillDoc & {
  textureUrl: string,
  llm: LLMDoc,
  mcpServerExs?: McpServerExtendDoc[]
};