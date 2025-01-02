"use client"
import * as PIXI from 'pixi.js';
import { Container, AnimatedSprite, useTick, PixiRef } from '@pixi/react';
// import { useMemo } from 'react';
// import JSON5 from "json5"
import { PixiSpritesheet } from "@/shared/spritesheet";
import { useState, useEffect, useRef } from 'react';
// import { parsePixiSpritesheet, parsePixiAnmimationSourceSize } from "~/lib/spritesheet";
import { routePlanDijkstra, BgLayoutItemType, Position, TileMapProps, translateToPxPosition, translateToPosition } from "~/lib/algorithm";
import { Viewport } from 'pixi-viewport';
import { MutableRefObject } from 'react';

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
  data: AnimationData;
  viewportRef?: MutableRefObject<Viewport | undefined>;
  targetPoint?: PIXI.Point;
}

export default function PixiAnimationObject({
  animationSpritesheet, animationNames, speed,
  x, y, w, h, data, viewportRef, targetPoint
}: PixiAnimationObjectProps) {
  const npcRef = useRef<PIXI.AnimatedSprite>();
  const [spritesheet, setSpritesheet] = useState<PIXI.Spritesheet>();
  const [animationName, setAnimationName] = useState(animationNames[3]); // left=0,right,up,down 
  // const [directionX, setDirectionX] = useState(1);
  // const [directionY, setDirectionY] = useState(1);
  const [preStartTile, setPreStartTile] = useState<Position>()
  const [startTile, setStartTile] = useState<Position>()
  const [preEndTile, setPreEndTile] = useState<Position>()
  const [endTile, setEndTile] = useState<Position>()
  const [routes, setRoutes] = useState<Position[]>([])
  const [currentX, setCurrentX] = useState(x);
  const [currentY, setCurrentY] = useState(y);
  const [currentRoute, setCurrentRoute] = useState<Position>();
  const [isWalking, setIsWalking] = useState(false);

  useEffect(() => {
    const url = animationSpritesheet.meta.image
    const bt = PIXI.BaseTexture.from(url);
    const _spritesheet = new PIXI.Spritesheet(bt, animationSpritesheet);
    _spritesheet.parse().then(() => {
      // const frames = Object.keys(spritesheet.textures).map(t => spritesheet.textures[t])
      setSpritesheet(_spritesheet)
    })
  }, [])


  const tileMapProps: TileMapProps = {
    width: data.tileDim * data.xTiles,
    height: data.tileDim * data.yTiles,
    itemRows: data.yTiles,
    itemColumns: data.xTiles,
  }


  useEffect(() => {
    if (!npcRef.current) {
      return
    }
    viewportRef?.current && viewportRef.current.follow(npcRef.current, { speed: 20 })
  }, [npcRef.current])
  useEffect(() => {
    if (!tileMapProps) {
      return
    }
    if (!npcRef.current) {
      return
    }
    console.log("npcRef.current=>", npcRef.current.position)
    const _startTile = translateToPosition({
      ...tileMapProps,
      x: npcRef.current.position.x,
      y: npcRef.current.position.y,
    })
    if (startTile?.columns !== _startTile.columns || startTile.rows !== _startTile.rows) {
      setPreStartTile(startTile)
      console.log('_startTile=>', _startTile)
      setStartTile(_startTile)
    } else {
      console.log("same start...")
    }

    if (targetPoint) {
      const _endTile = translateToPosition({
        ...tileMapProps,
        x: targetPoint.x,
        y: targetPoint.y,
      })
      if (endTile?.columns !== _endTile.columns || endTile.rows !== _endTile.rows) {
        setPreEndTile(endTile)
        console.log('_endTile=>', _endTile)
        setEndTile(_endTile)
      } else {
        console.log("same end...")
      }
    }
  }, [npcRef.current, targetPoint])


  const frames = spritesheet ? spritesheet.animations[animationName] : []

  let obstacleAll: BgLayoutItemType[][] = [];
  for (let i = 0; i < data.yTiles; i++) {
    obstacleAll.push(new Array(data.xTiles).fill(0));
  }
  // 二维数组每个元素代表一个tile
  const mapTiles = useRef<BgLayoutItemType[][]>(obstacleAll);
  useEffect(() => {
    if (!startTile) {
      return
    }
    if (!endTile) {
      return
    }
    setIsWalking(false)
    if (startTile.rows === endTile.rows && startTile.columns === endTile.columns) {
      console.log("click in same tile")
      return
    }
    if (preStartTile) {
      mapTiles.current[preStartTile.rows][preStartTile.columns] = BgLayoutItemType.empty
    }
    if (preEndTile) {
      mapTiles.current[preEndTile.rows][preEndTile.columns] = BgLayoutItemType.empty
    }
    mapTiles.current[startTile.rows][startTile.columns] = BgLayoutItemType.start;
    mapTiles.current[endTile.rows][endTile.columns] = BgLayoutItemType.end;

    const dijkstraList: number[][] = routePlanDijkstra({
      start: { x: startTile.columns, y: startTile.rows },
      end: { x: endTile.columns, y: endTile.rows },
      obstacleAll: mapTiles.current,
    });
    if (!dijkstraList.length) {
      console.log('不好意思，走不通呀！！！');
      return;
    }
    console.log('dijkstraList=>', dijkstraList)
    const _routes: Position[] = dijkstraList.map(v => {
      const columns = v[0], rows = v[1];
      const { x, y } = translateToPxPosition({ ...tileMapProps, columns, rows })
      return { x, y, columns, rows }
    })
    _routes.push(endTile)
    console.log('_routes=>', _routes)
    const route = _routes[0]
    if (route.columns > startTile.columns) {
      setAnimationName(animationNames[1])
    } else if (route.columns < startTile.columns) {
      setAnimationName(animationNames[0])
    } else {
      if (route.rows > startTile.rows) {
        setAnimationName(animationNames[3])
      } else {
        setAnimationName(animationNames[2])
      }
    }
    setRoutes(_routes)
    setCurrentRoute(startTile)

  }, [startTile, endTile])
  useEffect(() => {
    if (routes.length) {
      setIsWalking(true)
    }
  }, [routes])

  // console.log('isWalking=>', isWalking)
  useTick(delta => {
    if (!routes || !endTile) {
      // console.log("==no route===")
      return
    }
    if (!isWalking) {
      return
    }
    if (!currentRoute) {
      return
    }
    let directionX = 1, directionY = 1;
    if (routes.length === 0) {
      setIsWalking(false)
      return
    }
    const [route, ...others] = routes
    // facing
    if (route.columns > currentRoute.columns) {
      setAnimationName(animationNames[1])
    } else if (route.columns < currentRoute.columns) {
      setAnimationName(animationNames[0])
    } else {
      if (route.rows > currentRoute.rows) {
        setAnimationName(animationNames[3])
      } else {
        setAnimationName(animationNames[2])
      }
    }

    // move
    if (currentX > route.x + w / 2) {
      directionX = -1
    }
    if (currentY > route.y) {
      directionY = -1
    }
    let newX = currentX + delta * data.move * directionX
    let newY = currentY + delta * data.move * directionY
    // console.log('newX 2', newX, route, others)
    setCurrentX(newX)
    setCurrentY(newY)

    let routeXArrived = (directionX === 1 && newX >= route.x)
      || (directionX === -1 && newX <= route.x)
    let routeYArrived = (directionY === 1 && newY >= route.y)
      || (directionY === -1 && newY <= route.y)
    if (routeXArrived && routeYArrived) {
      setRoutes(others)
      setCurrentRoute(route)
    }
  })

  return (
    frames && frames.length > 0 ? <AnimatedSprite
      ref={(sprite) => {
        if (npcRef.current !== sprite) {
          npcRef.current = sprite || undefined;
        }
      }}
      x={currentX} y={currentY} width={w} height={h}
      anchor={0.5}
      // scale={2}
      textures={frames}
      isPlaying={true}
      // initialFrame={0}
      animationSpeed={speed}
    /> : null
  )
}