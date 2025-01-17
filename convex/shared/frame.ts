import { v, Infer } from 'convex/values';

export const sizeSerialized = v.object({
  w: v.number(),
  h: v.number(),
})

export const frameSerialized = v.object({
  frame: v.object({
    x: v.number(),
    y: v.number(),
    w: v.number(),
    h: v.number(),
  }),
  rotated: v.optional(v.boolean()),
  trimmed: v.optional(v.boolean()),
  spriteSourceSize: v.object({
    x: v.number(),
    y: v.number(),
  }),
  sourceSize: sizeSerialized,
})

export type Size = Infer<typeof sizeSerialized>
export type Frame = Infer<typeof frameSerialized>