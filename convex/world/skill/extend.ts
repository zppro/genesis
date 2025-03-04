import { SkillDoc } from "./schema"
import { LLMDoc, read as readTexture } from "../llms"

export type SkillExtendDoc = SkillDoc & {
  textureUrl: string,
  llm: LLMDoc,
};