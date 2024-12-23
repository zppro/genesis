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
