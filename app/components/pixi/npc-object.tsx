"use client"
import * as PIXI from 'pixi.js';
import { AnimatedSprite, useTick } from '@pixi/react';
import { PixiSpritesheet } from "@/shared/spritesheet";
import { useState, useEffect, useRef, useCallback } from 'react';
import { routePlanDijkstra, isAdjacent, BgLayoutItemType, Position, TileMapProps, translateToPxPosition, translateToPosition } from "~/lib/algorithm";
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
  const [preStartTile, setPreStartTile] = useState<Position>()
  const [startTile, setStartTile] = useState<Position>()
  const [preEndTile, setPreEndTile] = useState<Position>()
  const [endTile, setEndTile] = useState<Position>()
  const [routes, setRoutes] = useState<Position[]>([])
  const [currentX, setCurrentX] = useState(x);
  const [currentY, setCurrentY] = useState(y);
  const [currentRoute, setCurrentRoute] = useState<Position>();
  const [isWalking, setIsWalking] = useState(false);

  const tileMapProps: TileMapProps = {
    width: data.tileDim * data.xTiles,
    height: data.tileDim * data.yTiles,
    itemRows: data.yTiles,
    itemColumns: data.xTiles,
  }
  const frames = spritesheet ? spritesheet.animations[animationName] : []
  let obstacleAll: BgLayoutItemType[][] = [];
  for (let i = 0; i < data.yTiles; i++) {
    obstacleAll.push(new Array(data.xTiles).fill(0));
  }
  // 二维数组每个元素代表一个tile
  const mapTiles = useRef<BgLayoutItemType[][]>(obstacleAll);

  // parse spritesheet
  useEffect(() => {
    const url = animationSpritesheet.meta.image
    const bt = PIXI.BaseTexture.from(url);
    const _spritesheet = new PIXI.Spritesheet(bt, animationSpritesheet);
    _spritesheet.parse().then(() => {
      // const frames = Object.keys(spritesheet.textures).map(t => spritesheet.textures[t])
      setSpritesheet(_spritesheet)
    })
  }, [animationSpritesheet])

  // set viewport follow npc
  useEffect(() => {
    if (!npcRef.current) {
      return
    }
    viewportRef?.current && viewportRef.current.follow(npcRef.current, { speed: 20 })
  }, [npcRef.current])

  // adjust startTile & endTile
  useEffect(() => {
    if (!tileMapProps) {
      return
    }
    if (!npcRef.current) {
      return
    }
    console.log("npcRef.current=>", npcRef.current.position)

    let startTileChanged = false, endTileChanged = false;
    const _startTile = translateToPosition({
      ...tileMapProps,
      x: npcRef.current.position.x,
      y: npcRef.current.position.y,
    })
    console.log('currentRoute=>', currentRoute)
    console.log('_startTile=>', _startTile)
    if (startTile?.columns !== _startTile.columns || startTile.rows !== _startTile.rows) {
      setPreStartTile(startTile)
      console.log('_startTile=>', _startTile)
      setStartTile(_startTile)
      startTileChanged = true
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
        endTileChanged = true
      } else {
        console.log("same end...")
      }

      if (endTileChanged) {
        // refresh walking state
        setIsWalking(false)
        setRoutes([])
        setCurrentRoute(undefined)
      }
    }
  }, [npcRef.current, targetPoint])

  // calc routes
  useEffect(() => {
    if (!startTile) {
      return
    }
    if (!endTile) {
      return
    }

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

    console.log(`dijkstra start from:(${startTile.columns},${startTile.rows})`);
    console.log(`dijkstra end to:(${endTile.columns},${endTile.rows})`);
    const _routes: Position[] = []
    if (!isAdjacent(startTile, endTile)) {
      // not adjacent,calc route
      const dijkstraList: number[][] = routePlanDijkstra({
        start: { x: startTile.columns, y: startTile.rows },
        end: { x: endTile.columns, y: endTile.rows },
        obstacleAll: mapTiles.current,
      });
      if (!dijkstraList.length) {
        console.warn('dijkstra相邻或者走不通');
        // setRoutes(_routes)
        // setCurrentRoute(startTile)
        return
      }
      console.log('dijkstraList=>', dijkstraList)
      _routes.push(...dijkstraList.map(v => {
        const columns = v[0], rows = v[1];
        const { x, y } = translateToPxPosition({ ...tileMapProps, columns, rows })
        return { x, y, columns, rows }
      }))
      _routes.push(endTile)
    } else {
      _routes.push(endTile)
    }

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

  // set walking
  useEffect(() => {
    if (routes.length) {
      setIsWalking(true)
    } else {
      setIsWalking(false)
    }
  }, [routes])

  // move
  useTick(delta => {
    if (!routes || !endTile) {
      // console.log("==no route===")
      return
    }
    if (!isWalking) {
      console.log("==isWalking stopped===")
      return
    }
    if (!currentRoute) {
      console.log("==no currentRoute===")
      return
    }

    let directionX = 1, directionY = 1;
    let newX = currentX, newY = currentY;
    if (routes.length === 0) {
      console.log('routes is over')
      setIsWalking(false)
      return
    }
    const [route, ...others] = routes
    if (currentX > route.x) {
      directionX = -1
    }
    // check if move with x axis
    const moveX = currentRoute.rows === route.rows &&
      (
        (currentRoute.columns !== route.columns) 
        ||
        (
          (directionX === 1 && currentX < route.x) 
          || 
          (directionX === -1 && currentX > route.x)
        )
      );
    // console.log('route=>', route)
    // console.log("currentRoute=>", currentRoute)
    // console.log("moveX", 
    //   moveX,
    //   currentRoute.rows === route.rows,
    //   currentRoute.columns !== route.columns, 
    //   directionX === 1 && currentX < route.x,
    //   directionX === -1 && currentX > route.x
    // )
    if (moveX) {
      // facing
      if (route.columns > currentRoute.columns) {
        setAnimationName(animationNames[1])
      } else {
        setAnimationName(animationNames[0])
      }

      // console.log("newX=>", currentX + delta * data.move * directionX, currentX, delta, data.move, directionX)
      newX = currentX + delta * data.move * directionX
      setCurrentX(newX)
    } else {
      if (route.rows > currentRoute.rows) {
        setAnimationName(animationNames[3])
      } else {
        setAnimationName(animationNames[2])
      }
      if (currentY > route.y) {
        directionY = -1
      }
      newY = currentY + delta * data.move * directionY
      setCurrentY(newY)
    }

    let routeXArrived = !moveX || (directionX === 1 && newX >= route.x)
      || (directionX === -1 && newX <= route.x)
    let routeYArrived = moveX || (directionY === 1 && newY >= route.y)
      || (directionY === -1 && newY <= route.y)

    // if (!routeXArrived) {
      // console.log("directionX===1", directionX === 1)
      // console.log('startTile=>', startTile)
      // console.log('endTile=>', endTile)
      // console.log('routes=>', routes)
      // console.log("currentRoute=>", currentRoute)
      // console.log("route=>", route)
      // console.log("newX >= route.x", route, newX >= route.x, newX, route.x)
    // }
    // console.log('routeXArrived=>', routeXArrived, '   routeYArrived:', routeYArrived)
    if (routeXArrived && routeYArrived) {
      setRoutes(others)
      setCurrentRoute(route)
    }
  })


  return (
    frames && frames.length > 0 ? <AnimatedSprite
      ref={(sprite) => {
        // console.log('sprite ref...', sprite)
        if (npcRef.current !== sprite) {
          npcRef.current = sprite || undefined; // set npcRef

          if (npcRef.current && !npcRef.current.playing) {
            // change textures make animation play again
            npcRef.current.play()
          }
        }
      }}
      x={currentX} y={currentY} width={w} height={h}
      anchor={0.5}
      // scale={2}
      textures={frames}
      autoUpdate={true}
      isPlaying={true}
      // initialFrame={0}
      animationSpeed={speed}
    /> : null
  )
}