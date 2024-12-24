"use client"
import * as PIXI from 'pixi.js';
import { Stage, Container, Sprite, Text, AnimatedSprite } from '@pixi/react';
import { useMemo } from 'react';
import { ObjectExtendDoc } from "@/world/objects"
import JSON5 from "json5"
import { PixiSpritesheet } from "@/shared/spritesheet";
import { useState, useEffect } from 'react';

export default function PixiTilemap({ objectExs }: { objectExs: ObjectExtendDoc[] }) {
  const blurFilter = useMemo(() => new PIXI.BlurFilter(4), []);
  const [frames, setFrames] = useState<PIXI.Texture<PIXI.Resource>[]>([]);

  useEffect(() => {
    const oe = objectExs[0]
    const spritesheetData = JSON5.parse(oe.spritesheet.data) as PixiSpritesheet
    const bt = PIXI.BaseTexture.from(oe.texture.url);
    const spritesheet = new PIXI.Spritesheet(bt, spritesheetData);
    spritesheet.parse().then(() => {
      const frames = Object.keys(spritesheet.textures).map(t => spritesheet.textures[t])
      setFrames(frames)
    })
  }, [])

  function loadTextures(oe: ObjectExtendDoc): PIXI.Texture[] {
    const spritesheetData = JSON5.parse(oe.spritesheet.data) as PixiSpritesheet
    const bt = PIXI.BaseTexture.from(oe.texture.url);
    // const spritesheet = new PIXI.Spritesheet(bt, spritesheetData);
    // spritesheet.parse().then(() => {
    //   const frames = Object.keys(spritesheet.textures).map(t => spritesheet.textures[t])
    //   setTextures(frames)
    // })
    const frames = Object.entries(spritesheetData.frames).map(([frameKey, value]) =>
      new PIXI.Texture(
        bt,
        new PIXI.Rectangle(value.frame.x, value.frame.y, value.frame.w, value.frame.h),
      ))
    // const frames = Object.keys(spritesheet.textures).map((t) => spritesheet.textures[t])
    return frames
  }



  return (
    <Stage className="max-w-[400px] max-h-[500px]" options={{ background: 0xffffff }}>
      <Sprite
        image="/logo-light.png"
        x={400}
        y={270}
        anchor={{ x: 0.5, y: 0.5 }}
      />

      <Container x={400} y={330}>
        {
          objectExs.map(oe =>
            frames && frames.length > 0 ? <AnimatedSprite
              key={oe._id}
              anchor={0.5}
              // scale={2}
              textures={frames}
              isPlaying={true}
              // initialFrame={0}
              animationSpeed={0.1}
            /> : null)
        }
      </Container>
    </Stage>
  )
}