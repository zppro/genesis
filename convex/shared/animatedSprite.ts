import { v, Infer } from 'convex/values';

export const animatedSpriteSerialized = v.object({
  x: v.number(),
  y: v.number(),
  w: v.number(),
  h: v.number(),
  layer: v.number(),
  sheet: v.string(),
  animation: v.string(),
});

export type AnimatedSprite = Infer<typeof animatedSpriteSerialized>;
