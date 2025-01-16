import { z } from "zod";
import JSON5 from "json5"
import { PrimaryCharacterSettings } from "@/shared/characterSettings";

export const zodPrimaryCharacterSettings = z.object({
  name: z.string(),
  age: z.number(),
  gender: z.enum(["male", "female", "unknown", "男", "女", "未知"]),
  profession: z.string(),
  personality: z.array(z.string()),
})

export const parsePrimaryCharacterSettings = (data: string) => {
  const o = JSON5.parse(data) as PrimaryCharacterSettings
  return o
}