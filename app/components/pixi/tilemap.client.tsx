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
  map: TilemapData,
  staticMapRef?: MutableRefObject<PIXI.Container | undefined>;
  [k: string]: any;
}
const PixiStaticMap = PixiComponent('StaticMap', {
  create: ({ map, staticMapRef, ...props }: PixiStaticMapProps) => {
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
    for (let i = 0; i < screenxtiles * screenytiles; i++) {
      const x = i % screenxtiles;
      const y = Math.floor(i / screenxtiles);
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

    return container;
  },

  applyProps: (instance, oldProps, newProps) => {
    applyDefaultProps(instance, oldProps, newProps);
  },
});

export type TilemapProps = {
  width: number; // viewport可视宽度
  height: number; // viewport可视高度
  map: PixiTilemapConverted;
}

// const PixiViewport = lazy(() => import('./PixiViewport'));
export default function Tilemap({ width, height, map }: TilemapProps) {
  const pixiApp = useApp();
  const viewportRef = useRef<Viewport | undefined>();
  const staticMapRef = useRef<PIXI.Container>();
  const [loaded, setLoaded] = useState(false)
  const [mapData, setMapData] = useState<TilemapData>();

  const tileDim = map.tiledim;
  const tilesX = map.screenxtiles;
  const tilesY = map.screenytiles;

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
  };
  const onMapPointerUp = async (e: any) => {
    if (dragStart.current) {
      const { screenX, screenY } = dragStart.current;
      dragStart.current = null;
      const [dx, dy] = [screenX - e.screenX, screenY - e.screenY];
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 10) {
        console.log(`Skipping navigation on drag event (${dist}px)`);
        return;
      }
    }
  };

  useEffect(() => {
    setLoaded(true);
    (async () => {
      console.log('loaded:')
      const _mapData = {
        width: map.mapwidth,
        height: map.mapheight,
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


  return (
    loaded &&
    < PixiViewport
      app={pixiApp}
      screenWidth={width}
      screenHeight={height}
      worldWidth={tilesX * tileDim}
      worldHeight={tilesY * tileDim}
      viewportRef={viewportRef}
    >
      {
        mapData && <PixiStaticMap
          map={mapData}
          onpointerup={onMapPointerUp}
          onpointerdown={onMapPointerDown}
          staticMapRef={staticMapRef}
        />
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