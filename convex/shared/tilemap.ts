import { v, Infer } from 'convex/values';
import { animatedSpriteSerialized } from "./animatedSprite";

export const tilesetpath = "/ai-town/assets/gentle-obj.png"
export const tiledim = 32
export const screenxtiles = 45
export const screenytiles = 32
export const tilesetpxw = 1440
export const tilesetpxh = 1024

const tileLayer = v.array(v.array(v.number()));
export type TileLayer = Infer<typeof tileLayer>;


export const pixiTilemapSerialized = v.object({
  tilesetpath: v.string(),
  tiledim: v.number(),
  screenxtiles: v.number(),
  screenytiles: v.number(),
  tilesetpxw: v.number(),
  tilesetpxh: v.number(),
  bgtiles: v.array(v.array(v.array(v.number()))),
  objmap: v.array(tileLayer),
  animatedsprites: v.array(animatedSpriteSerialized),
  mapwidth: v.number(),
  mapheight: v.number()
})

export type PixiTilemapConverted = Infer<typeof pixiTilemapSerialized>;

export function parseLayerData(layerData: number[], width: number, height: number): number[][] {
  let newArray: number[][] = [];
  for (let i = 0; i < width; i++) {
    newArray[i] = [];
    for (let j = 0; j < height; j++) {
      newArray[i][j] = layerData[j * width + i] - 1;
    }
  }
  return newArray;
}

export function convertLayerData(layerData: number[], width: number, height: number): number[][][] {
  let newArray = parseLayerData(layerData, width, height);
  return [newArray];
}