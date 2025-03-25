import { z } from "zod";
import JSON5 from "json5"
import { PrimaryCharacterSettings } from "@/shared/characterSettings";

export const zodPrimaryCharacterSettings = z.object({
  name: z.string({ message: "character name is required in settings" }).min(1, { message: "character name cant be empty" }),
  age: z.number({ message: "character age is required in settings" }),
  gender: z.enum(["male", "female", "unknown", "男", "女", "未知"], { message: "character gender is required in settings" }),
  profession: z.string({ message: "character profession is required in settings" }).min(1, { message: "character profession cant be empty" }),
  personality: z.array(z.string()),
})

export const parsePrimaryCharacterSettings = (data: string) => {
  const o = JSON5.parse(data) as PrimaryCharacterSettings
  return o
}