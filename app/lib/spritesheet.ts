import { z } from "zod";

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