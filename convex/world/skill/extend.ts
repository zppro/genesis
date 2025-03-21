import { SkillDoc } from "./schema"
import { LLMDoc } from "../llms"
import { McpServerToolDoc } from "../mcpServerTool/schema";

export type SkillExtendDoc = SkillDoc & {
  textureUrl: string,
  llm: LLMDoc,
  mcpServerTools?: McpServerToolDoc[]
};