"use client"
import * as PIXI from 'pixi.js';
import { PixiComponent, useApp, applyDefaultProps } from '@pixi/react';
import { ResourceDoc } from "@/world/resources"
import JSON5 from "json5"
import { PixiSpritesheet } from "@/shared/spritesheet";
import { useState, useEffect, useRef, lazy, Suspense, ReactNode, MutableRefObject } from 'react';
import PixiViewport from './PixiViewport.client';
import { Viewport } from 'pixi-viewport';
import { Container, Sprite } from '@pixi/react';
import { PixiTilemapConverted } from "@/shared/tilemap"
import { AnimatedSprite } from "@/shared/animatedSprite"
import PixiAnimationObject from "~/components/pixi/animation-object";
import PixiNPCObject, { AnimationData as NPCAnimationData } from "~/components/pixi/npc-object";
import Character from "~/components/pixi/character"
import { ClickedEvent } from 'pixi-viewport/dist/types';
import { array2Map } from "~/lib/utils";
import { translateToPosition } from '~/lib/algorithm';
import type { CustomTileLayer } from '@/shared/tilemap';
import { setCustomLayers } from '@/world/scenes';


type Frame = {
  x: number;
  y: number;
  w: number;
  h: number;
}
export type AnimationType = "npc" | "object";

export type TilemapAnimation = Frame & {
  name: string;
  speed: number;
  spritesheet: PixiSpritesheet;
  type: AnimationType,
  data?: NPCAnimationData
}

type TilemapData = {
  // worldId,
  width: number,
  height: number,
  tileSetUrl: string,
  tileSetDimX: number,
  tileSetDimY: number,
  tileDim: number,
  bgTiles: number[][][],
  objectTiles: number[][][],
  animatedSprites: {
    x: number;
    y: number;
    w: number;
    h: number;
    layer: number;
    sheet: string;
    animation: string;
  }[],
}

type PixiStaticMapProps = {
  mode: TilemapMode;
  obstacleArray: number[];
  width: number; // viewport可视宽度
  height: number; // viewport可视高度
  map: TilemapData,
  staticMapRef?: MutableRefObject<PIXI.Container | undefined>;
  [k: string]: any;
}
const PixiStaticMap = PixiComponent('StaticMap', {
  create: ({ mode, obstacleArray, width, height, map, staticMapRef, ...props }: PixiStaticMapProps) => {
    console.log('PixiStaticMap mode=>', mode)
    const numxtiles = Math.floor(map.tileSetDimX / map.tileDim);
    const numytiles = Math.floor(map.tileSetDimY / map.tileDim);
    const bt = PIXI.BaseTexture.from(map.tileSetUrl, {
      scaleMode: PIXI.SCALE_MODES.NEAREST,
    });

    console.log('numxtiles=>', numxtiles)
    console.log('numytiles=>', numytiles)
    console.log('map.tileSetUrl=>', map.tileSetUrl)

    const tiles = [];
    for (let x = 0; x < numxtiles; x++) {
      for (let y = 0; y < numytiles; y++) {
        tiles[x + y * numxtiles] = new PIXI.Texture(
          bt,
          new PIXI.Rectangle(x * map.tileDim, y * map.tileDim, map.tileDim, map.tileDim),
        );
      }
    }
    const screenxtiles = map.bgTiles[0].length;
    const screenytiles = map.bgTiles[0][0].length;

    const container = new PIXI.Container();
    if (staticMapRef) {
      staticMapRef.current = container;
    }
    const allLayers = [...map.bgTiles, ...map.objectTiles];

    // blit bg & object layers of map onto canvas
    //   const style = new PIXI.TextStyle({
    //     fontFamily: 'Arial',
    //     fontSize: 10,
    //     fontStyle: 'italic',
    //     fontWeight: 'bold',
    //     stroke: '#4a1850',
    //     strokeThickness: 5,
    //     dropShadow: true,
    //     dropShadowColor: '#000000',
    //     dropShadowBlur: 4,
    //     dropShadowAngle: Math.PI / 6,
    //     dropShadowDistance: 6,
    //     wordWrap: true,
    //     wordWrapWidth: 440,
    //     lineJoin: 'round',
    // });
    for (let i = 0; i < screenxtiles * screenytiles; i++) {
      const x = i % screenxtiles;
      const y = Math.floor(i / screenytiles);
      const xPx = x * map.tileDim;
      const yPx = y * map.tileDim;

      // Add all layers of backgrounds.
      for (const layer of allLayers) {
        const tileIndex = layer[x][y];
        // Some layers may not have tiles at this location.
        if (tileIndex === -1) continue;
        const ctile = new PIXI.Sprite(tiles[tileIndex]);
        ctile.x = xPx;
        ctile.y = yPx;

        container.addChild(ctile);
      }

      if (mode === "obstacle") {
        const graphics = new PIXI.Graphics();
        // Rectangle
        const alphaFill = obstacleArray[i] === 1 ? 1 : 0.3;
        // console.log('alphaFill=>', alphaFill);
        graphics.lineStyle(1, 0xfeeb77, 0.5);
        graphics.beginFill(0x650a5a, alphaFill);
        graphics.drawRect(xPx, yPx, map.tileDim, map.tileDim);
        graphics.endFill();
        graphics.name = `tile${i}`;
        container.addChild(graphics);

        // const idxText = new PIXI.Text(`${x}`);
        // idxText.x = xPx;
        // idxText.y = yPx;
        // idxText.style = { fontSize: 9 };
        // container.addChild(idxText);
      }

    }

    // TODO: Add layers.
    // const spritesBySheet = new Map<string, AnimatedSprite[]>();
    // for (const sprite of map.animatedSprites) {
    //   const sheet = sprite.sheet;
    //   if (!spritesBySheet.has(sheet)) {
    //     spritesBySheet.set(sheet, []);
    //   }
    //   spritesBySheet.get(sheet)!.push(sprite);
    // }
    // for (const [sheet, sprites] of spritesBySheet.entries()) {
    //   const animation = (animations as any)[sheet];
    //   if (!animation) {
    //     console.error('Could not find animation', sheet);
    //     continue;
    //   }
    //   const { spritesheet, url } = animation;
    //   const texture = PIXI.BaseTexture.from(url, {
    //     scaleMode: PIXI.SCALE_MODES.NEAREST,
    //   });
    //   const spriteSheet = new PIXI.Spritesheet(texture, spritesheet);
    //   spriteSheet.parse().then(() => {
    //     for (const sprite of sprites) {
    //       const pixiAnimation = spriteSheet.animations[sprite.animation];
    //       if (!pixiAnimation) {
    //         console.error('Failed to load animation', sprite);
    //         continue;
    //       }
    //       const pixiSprite = new PIXI.AnimatedSprite(pixiAnimation);
    //       pixiSprite.animationSpeed = 0.1;
    //       pixiSprite.autoUpdate = true;
    //       pixiSprite.x = sprite.x;
    //       pixiSprite.y = sprite.y;
    //       pixiSprite.width = sprite.w;
    //       pixiSprite.height = sprite.h;
    //       container.addChild(pixiSprite);
    //       pixiSprite.play();
    //     }
    //   });
    // }

    container.x = 0;
    container.y = 0;


    // Set the hit area manually to ensure `pointerdown` events are delivered to this container.
    container.interactive = true;
    container.hitArea = new PIXI.Rectangle(
      0,
      0,
      screenxtiles * map.tileDim,
      screenytiles * map.tileDim,
    );
    // if (mode === 'obstacle') {
    //   container.onclick! = (event: PIXI.FederatedMouseEvent) => {
    //     // console.log("event onpointerdown:", container.hitArea)
    //     console.log("event client:", event.global.x)
    //     console.log("event client2:", event.client.x, event.clientX)
    //     // console.log("event client2:", event.offset.x, event.offsetX)
    //     console.log("event client2:", event.offsetX)
    //     console.log("event map width:", map.width, width, screenxtiles, map.tileDim)
    //     const tilePosition = translateToPosition({ width: screenxtiles * map.tileDim, height: screenytiles * map.tileDim, itemRows: map.height, itemColumns: map.width, x: event.global.x, y: event.global.y })
    //     console.log("event tile position:",tilePosition.columns, map.width * width / (screenxtiles * map.tileDim))
    //   }
    // }


    return container;
  },

  applyProps: (instance, oldProps, newProps) => {
    // apply rest props
    const { obstacleArray: oldObstacleArray, ...oldP } = oldProps as PixiStaticMapProps;
    const { obstacleArray: newObstacleArray, ...newP } = newProps;
    // console.log('applyProps...', oldObstacleArray, newObstacleArray, newP.mode === 'obstacle' && oldObstacleArray && newObstacleArray && oldObstacleArray.length === newObstacleArray.length)
    if (newP.mode === 'obstacle') {
      applyDefaultProps(instance, oldP, newP);

      const screenxtiles = newP.map.bgTiles[0].length;
      const screenytiles = newP.map.bgTiles[0][0].length;
      const map = newP.map;

      for (let i = 0; i < newObstacleArray.length; i++) {
        const x = i % screenxtiles;
        const y = Math.floor(i / screenytiles);
        const xPx = x * map.tileDim;
        const yPx = y * map.tileDim;

        const graphics = instance.getChildByName(`tile${i}`) as PIXI.Graphics
        if (!graphics) {
          console.log("ctl is not found!!!!")
          continue;
        }
        const alphaFill = newObstacleArray[i] === 1 ? 1 : 0.3;
        graphics.clear()
        graphics.lineStyle(1, 0xfeeb77, 0.5);
        graphics.beginFill(0x650a5a, alphaFill);
        graphics.drawRect(xPx, yPx, map.tileDim, map.tileDim);
        graphics.endFill();
      }

    } else {
      applyDefaultProps(instance, oldProps, newProps);
    }
  },
});

export type TilemapMode = 'normal' | 'obstacle';

export type TilemapProps = {
  width: number; // viewport可视宽度
  height: number; // viewport可视高度
  mode: TilemapMode;
  map: PixiTilemapConverted;
  tilemapAnimations: TilemapAnimation[];
  customLayers: CustomTileLayer[];
  onCustomLayersChanged?: (v: CustomTileLayer[]) => void;
}

// const PixiViewport = lazy(() => import('./PixiViewport'));
export default function Tilemap({ width, height, mode, map, tilemapAnimations, customLayers, onCustomLayersChanged }: TilemapProps) {
  const pixiApp = useApp();
  const viewportRef = useRef<Viewport | undefined>();
  const staticMapRef = useRef<PIXI.Container>();
  const [loaded, setLoaded] = useState(false)
  const [mapData, setMapData] = useState<TilemapData>();
  const [pointOfNPC, setPointOfNPC] = useState<PIXI.Point>()

  // const [baseTextures, setBaseTextures] = useState<Record<string, PIXI.BaseTexture>>({})

  const tileDim = map.tiledim;
  const tilesX = map.screenxtiles;
  const tilesY = map.screenytiles;
  const worldWidth = tilesX * tileDim
  const worldHeight = tilesY * tileDim

  const obstacleLayer = customLayers.find(l => l.name === 'obstacle')
  // console.log('obstacleLayer=>', customLayers)
  const initObstacleArray = obstacleLayer ? obstacleLayer.data : new Array(tilesX * tilesY).fill(0);
  const [obstacleArray, setObstacleArray] = useState<number[]>(initObstacleArray)


  // console.log('width:', width)
  // console.log('height:', height)
  // console.log('tileDim:', tileDim)
  // console.log('tilesX:', tilesX)
  // console.log('tilesY:', tilesY)

  // Interaction for clicking on the world to navigate.

  const dragStart = useRef<{ screenX: number; screenY: number } | null>(null);
  const onMapPointerDown = (e: any) => {
    // https://pixijs.download/dev/docs/PIXI.FederatedPointerEvent.html
    dragStart.current = { screenX: e.screenX, screenY: e.screenY };
    // pause==true disabled drag
    //  viewportRef.current!.pause = true
  };
  const onMapPointerUp = async (e: any) => {
    if (dragStart.current) {
      const { screenX, screenY } = dragStart.current;
      const [dx, dy] = [screenX - e.screenX, screenY - e.screenY];
      dragStart.current = null;
      // viewportRef.current!.pause = false
    }
  };

  const onMapPointerMove = async (e: any) => {
    if (dragStart.current) {
      if (mode === 'obstacle') {
        const tilePosition = translateToPosition({ width: width, height: height, itemRows: tilesY, itemColumns: tilesX, x: e.screenX, y: e.screenY })
        console.log('move:', e.screenX, e.screenY, tilePosition)
      }
    }
  }

  useEffect(() => {
    setLoaded(true);
    (async () => {
      console.log('loaded:')
      const _mapData = {
        width: map.screenxtiles,
        height: map.screenytiles,
        tileSetUrl: map.tilesetpath,
        tileSetDimX: map.tilesetpxw,
        tileSetDimY: map.tilesetpxh,
        tileDim: map.tiledim,
        bgTiles: map.bgtiles,
        objectTiles: map.objmap, // path finding使用
        animatedSprites: []
      }
      console.log('_mapData=>', _mapData)
      setMapData(_mapData)

    })();
  }, [])

  // baseTexture.from自带缓存，不需要自己来处理
  // useEffect(() => {
  //   let textures = Array.from(new Set(tilemapAnimations.map(v => v.spritesheet.meta.image))).map(textureUrl => PIXI.BaseTexture.from(textureUrl))
  //   console.log('textures=>', textures)
  //   const textureMap = array2Map(textures, "cacheId")

  //   const _baseTextures = tilemapAnimations.reduce<Record<string, PIXI.BaseTexture>>((prev, current) => {
  //     const key = current.name;
  //     const textureUrl = current.spritesheet.meta.image;
  //     prev[key] = textureMap.get(textureUrl)!;
  //     return prev
  //   }, {})
  //   console.log('_baseTextures=>', _baseTextures)
  //   setBaseTextures(_baseTextures)
  // }, [tilemapAnimations])

  const onClicked = (e: ClickedEvent) => {
    console.log("isShiftKeyPressed:", e.viewport.checkKeyPress())
    if (mode === 'obstacle') {
      const tilePosition = translateToPosition({ width: width, height: height, itemRows: tilesY, itemColumns: tilesX, x: e.world.x, y: e.world.y })
      const idx = tilePosition.rows * tilesX + tilePosition.columns
      obstacleArray[idx] = obstacleArray[idx] === 1 ? 0 : 1;
      // console.log('viewport clicked:', tilePosition, idx, obstacleArray[idx])
      setObstacleArray([...obstacleArray])
      if (onCustomLayersChanged) {
        let idxInCustomLayers = customLayers.findIndex(l => l.name === 'obstacle')
        if (idxInCustomLayers === -1) {
          idxInCustomLayers = customLayers.length
        }
        customLayers[idxInCustomLayers] = {
          width: tilesX,
          height: tilesY,
          x: 0,
          y: 0,
          name: "obstacle",
          data: obstacleArray
        }
        onCustomLayersChanged(customLayers)
      }
    } else {
      setPointOfNPC(e.world)
    }
  }


  return (
    loaded &&
    < PixiViewport
      app={pixiApp}
      screenWidth={width}
      screenHeight={height}
      worldWidth={worldWidth}
      worldHeight={worldHeight}
      viewportRef={viewportRef}
      onClicked={onClicked}
    >
      {
        mapData && <PixiStaticMap
          mode={mode}
          obstacleArray={obstacleArray}
          width={width}
          height={height}
          map={mapData}
          onpointerup={onMapPointerUp}
          onpointerdown={onMapPointerDown}
          // onpointermove={onMapPointerMove}
          staticMapRef={staticMapRef}
        />
      }
      {
        tilemapAnimations.map(animation =>
          animation.type === "npc" ?
            (<Character
              // bt={baseTextures[animation.name]}
              key={animation.name}
              spritesheetData={animation.spritesheet}
              x={animation.x}
              y={animation.y}
              speed={animation.speed}
              isThinking={true}
              isSpeaking={true}
              tickMove={animation.data?.move}
              orientation="down"
              isMoving={false}
              mapData={animation.data! && {
                width: animation.data.tileDim * animation.data.xTiles,
                height: animation.data.tileDim * animation.data.yTiles,
                itemRows: animation.data.yTiles,
                itemColumns: animation.data.xTiles,
              }}
              viewportRef={viewportRef}
              targetPoint={pointOfNPC}
            />)
            // (idx === 0 ?
            //   <Character
            //     spritesheetData={animation.spritesheet}
            //     x={animation.x}
            //     y={animation.y}
            //     speed={animation.speed}
            //     tickMove={animation.data?.move}
            //     orientation="down"
            //     isMoving={false}
            //     mapData={animation.data! && {
            //       width: animation.data.tileDim * animation.data.xTiles,
            //       height: animation.data.tileDim * animation.data.yTiles,
            //       itemRows: animation.data.yTiles,
            //       itemColumns: animation.data.xTiles,
            //     }}
            //     viewportRef={viewportRef}
            //     targetPoint={pointOfNPC}
            //   /> :
            //   <PixiNPCObject
            //     animationNames={Object.keys(animation.spritesheet.animations!)}
            //     animationSpritesheet={animation.spritesheet}
            //     speed={animation.speed}
            //     x={animation.x}
            //     y={animation.y}
            //     w={animation.w}
            //     h={animation.h}
            //     data={animation.data as NPCAnimationData}
            //     viewportRef={viewportRef}
            //     targetPoint={pointOfNPC}
            //   />) 
            :
            <PixiAnimationObject
              animationName={Object.keys(animation.spritesheet.animations!)[0]}
              animationSpritesheet={animation.spritesheet}
              speed={animation.speed}
              x={animation.x}
              y={animation.y}
              w={animation.w}
              h={animation.h}
            />
        )
      }
      {/* <Container>
        <Sprite
          image="/logo-light.png"
          x={200}
          y={170}
          anchor={{ x: 0.5, y: 0.5 }}
        />
      </Container> */}
    </PixiViewport>
  )
}