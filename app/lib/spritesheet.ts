import { z } from "zod";
import JSON5 from "json5"
import { PixiSpritesheet } from "@/shared/spritesheet";

export const zodframe = z.object({
  frame: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
  }),
  rotated: z.optional(z.boolean()),
  trimmed: z.optional(z.boolean()),
  spriteSourceSize: z.object({
    x: z.number(),
    y: z.number(),
  }),
  sourceSize: z.object({
    w: z.number(),
    h: z.number(),
  }),
})

export const zodSpritesheet = z.object({
  frames: z.record(z.string(), zodframe),
  animations: z.optional(z.record(z.string(), z.array(z.string()))),
  meta: z.object({
    scale: z.string(),
    image: z.string({
      required_error: "meta.image is required",
      invalid_type_error: "meta.image must be a string",
    }).min(1, { message: "meta.image cant be empty" }),
  })
})

export const parsePixiSpritesheet = (data: string) => {
  const spritesheetObject = JSON5.parse(data) as PixiSpritesheet
  return spritesheetObject
}

export const parsePixiAnmimationSourceSize = (data: string | PixiSpritesheet) => {
  const spritesheetObject = typeof data === 'string' ? parsePixiSpritesheet(data) : data;
  const key = Object.keys(spritesheetObject.frames)[0]
  return spritesheetObject.frames[key].sourceSize
}

export const parsePixiAnmimationAnimationNames = (data: string | PixiSpritesheet) => {
  const spritesheetObject = typeof data === 'string' ? parsePixiSpritesheet(data) : data;
  const animationNames = Object.keys(spritesheetObject.animations!)
  return animationNames
}
