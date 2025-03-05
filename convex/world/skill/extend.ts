import { SkillDoc } from "./schema"
import { LLMDoc } from "../llms"

export type SkillExtendDoc = SkillDoc & {
  textureUrl: string,
  llm: LLMDoc,
};