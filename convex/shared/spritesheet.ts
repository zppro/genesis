import { v, Infer } from 'convex/values';
import { frameSerialized } from "./frame"

// export type SpritesheetData = {
//   frames: Record<string, Frame>;
//   animations?: Record<string, string[]>;
//   meta: {
//     scale: string;
//   };
// };

export const pixiSpritesheetSerialized = v.object({
  frames: v.record(v.string(), frameSerialized),
  animations: v.optional(v.record(v.string(), v.array(v.string()))),
  meta: v.object({
    scale: v.string(),
  })
})

export type PixiSpritesheet = Infer<typeof pixiSpritesheetSerialized>;
