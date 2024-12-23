"use client"
import * as PIXI from 'pixi.js';
import { Container, AnimatedSprite } from '@pixi/react';
import { useMemo } from 'react';
import JSON5 from "json5"
import { PixiSpritesheet } from "@/shared/spritesheet";
import { useState, useEffect } from 'react';
import { parsePixiSpritesheet, parsePixiAnmimationSourceSize } from "~/lib/spritesheet";

export type PixiAnimationObjectProps = {
  pixiAnimationSpritesheet: PixiSpritesheet;
  speed: number;
}

export default function PixiAnimationObject({ pixiAnimationSpritesheet, speed }: PixiAnimationObjectProps) {
  const [frames, setFrames] = useState<PIXI.Texture<PIXI.Resource>[]>([]);
  const sourceSize = parsePixiAnmimationSourceSize(pixiAnimationSpritesheet)
  const url = pixiAnimationSpritesheet.meta.image
  useEffect(() => {
    console.log('url=>', url)
    const bt = PIXI.BaseTexture.from(url);
    const spritesheet = new PIXI.Spritesheet(bt, pixiAnimationSpritesheet);
    spritesheet.parse().then(() => {
      const frames = Object.keys(spritesheet.textures).map(t => spritesheet.textures[t])
      setFrames(frames)
    })
  }, [])

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
    <Container width={sourceSize.w} height={sourceSize.h}>
      {
        (frames && frames.length > 0 ? <AnimatedSprite
          anchor={0.5}
          // scale={2}
          textures={frames}
          isPlaying={true}
          // initialFrame={0}
          animationSpeed={speed}
          x={sourceSize.w / 2} y={sourceSize.h / 2}
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