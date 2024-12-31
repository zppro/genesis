"use client"
import * as PIXI from 'pixi.js';
import { Container, AnimatedSprite, useTick } from '@pixi/react';
// import { useMemo } from 'react';
// import JSON5 from "json5"
import { PixiSpritesheet } from "@/shared/spritesheet";
import { useState, useEffect } from 'react';
// import { parsePixiSpritesheet, parsePixiAnmimationSourceSize } from "~/lib/spritesheet";

export type AnimationType = "character" | "object";
export type AnimationData = {
  move: number;
  mapWidth: number;
  mapHeight: number;
  xTiles: number;
  yTiles: number;

}

export type PixiAnimationObjectProps = {
  animationSpritesheet: PixiSpritesheet;
  animationName: string;
  speed: number;
  x: number;
  y: number;
  w: number;
  h: number;
  type: AnimationType;
  data?: AnimationData;
}

export default function PixiAnimationObject({
  animationSpritesheet, animationName, speed,
  x, y, w, h, type, data
}: PixiAnimationObjectProps) {
  const [spritesheet, setSpritesheet] = useState<PIXI.Spritesheet>();
  const [currentX, setCurrentX] = useState(x);
  const [currentY, setCurrentY] = useState(y);
  const [directionX, setDirectionX] = useState(1);
  const [directionY, setDirectionY] = useState(1);
  // const sourceSize = parsePixiAnmimationSourceSize(pixiAnimationSpritesheet)

  // 

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



  if (type === "character" && data) {

    const WIDTH = 700;
    const HEIGHT = 700;
    const GRIDROWS = 25;
    const GRIDWIDTH = WIDTH / GRIDROWS;
    const GRIDHEIGHT = HEIGHT / GRIDROWS;

    useTick(delta => {
      // do something here
      let newX = currentX + delta * data.move * directionX
      if (newX > data.mapWidth) {
        newX = data.mapWidth
        setDirectionX(-1)
      }
      if (newX < 0) {
        newX = 0
        setDirectionX(1)
      }
      let newY = currentY + delta * data.move * directionY
      if (newY > data.mapHeight) {
        newY = data.mapHeight
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

  // function loadTextures(oe: ObjectExtendDoc): PIXI.Texture[] {
  //   const spritesheetData = JSON5.parse(oe.spritesheet.data) as PixiSpritesheet
  //   const bt = PIXI.BaseTexture.from(oe.texture.url);
  //   // const spritesheet = new PIXI.Spritesheet(bt, spritesheetData);
  //   // spritesheet.parse().then(() => {
  //   //   const frames = Object.keys(spritesheet.textures).map(t => spritesheet.textures[t])
  //   //   setTextures(frames)
  //   // })
  //   const frames = Object.entries(spritesheetData.frames).map(([frameKey, value]) =>
  //     new PIXI.Texture(
  //       bt,
  //       new PIXI.Rectangle(value.frame.x, value.frame.y, value.frame.w, value.frame.h),
  //     ))
  //   // const frames = Object.keys(spritesheet.textures).map((t) => spritesheet.textures[t])
  //   return frames
  // }

  return (
    <Container x={currentX} y={currentY} width={w} height={h}>
      {
        (frames && frames.length > 0 ? <AnimatedSprite
          // anchor={0.5}
          // scale={2}
          textures={frames}
          isPlaying={true}
          // initialFrame={0}
          animationSpeed={speed}
        // x={sourceSize.w / 2} y={sourceSize.h / 2}
        // loop={false}
        // onComplete={() => {
        //   console.log('loaded...')
        //   setIsLoading(false)
        // }}
        /> : null)
      }
    </Container>
  )
}