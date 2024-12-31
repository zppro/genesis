"use client"
import * as PIXI from 'pixi.js';
import { Container, AnimatedSprite, useTick } from '@pixi/react';
// import { useMemo } from 'react';
// import JSON5 from "json5"
import { PixiSpritesheet } from "@/shared/spritesheet";
import { useState, useEffect } from 'react';
// import { parsePixiSpritesheet, parsePixiAnmimationSourceSize } from "~/lib/spritesheet";


export type AnimationData = {
  move: number;
  tileDim: number;
  xTiles: number;
  yTiles: number;

}

export type PixiAnimationObjectProps = {
  animationSpritesheet: PixiSpritesheet;
  animationNames: string[];
  speed: number;
  x: number;
  y: number;
  w: number;
  h: number;
  data?: AnimationData;
}

export default function PixiAnimationObject({
  animationSpritesheet, animationNames, speed,
  x, y, w, h, data
}: PixiAnimationObjectProps) {
  const [spritesheet, setSpritesheet] = useState<PIXI.Spritesheet>();
  const [animationName, setAnimationName] = useState(animationNames[0]);
  const [currentX, setCurrentX] = useState(x);
  const [currentY, setCurrentY] = useState(y);
  const [directionX, setDirectionX] = useState(1);
  const [directionY, setDirectionY] = useState(1);

  useEffect(() => {
    const url = animationSpritesheet.meta.image
    const bt = PIXI.BaseTexture.from(url);
    const _spritesheet = new PIXI.Spritesheet(bt, animationSpritesheet);
    _spritesheet.parse().then(() => {
      // const frames = Object.keys(spritesheet.textures).map(t => spritesheet.textures[t])
      setSpritesheet(_spritesheet)
    })
  }, [])

  const frames = spritesheet ? spritesheet.animations[animationName] : []



  if (data) {

    const WIDTH = data.tileDim * data.xTiles;
    const HEIGHT = data.tileDim * data.yTiles;
    const GRIDROWS = data.tileDim;
    const GRIDWIDTH = data.xTiles;
    const GRIDHEIGHT = data.yTiles;

    useTick(delta => {
      // do something here
      let newX = currentX + delta * data.move * directionX
      if (newX > WIDTH) {
        newX = WIDTH
        setDirectionX(-1)
      }
      if (newX < 0) {
        newX = 0
        setDirectionX(1)
      }
      let newY = currentY + delta * data.move * directionY
      if (newY > HEIGHT) {
        newY = HEIGHT
        setDirectionY(-1)
      }
      if (newY < 0) {
        newY = 0
        setDirectionY(1)
      }

      setCurrentX(newX)
      setCurrentY(newY)
    })
  }

  return (
    frames && frames.length > 0 ? <AnimatedSprite
      x={currentX} y={currentY} width={w} height={h}
      // anchor={0.5}
      // scale={2}
      textures={frames}
      isPlaying={true}
      // initialFrame={0}
      animationSpeed={speed}
    /> : null
  )
}