"use client"
import * as PIXI from 'pixi.js';
import { Container, Text, AnimatedSprite, useTick } from '@pixi/react';
import { PixiSpritesheet } from "@/shared/spritesheet";
import { useState, useEffect, useRef, useCallback } from 'react';
import { routePlanDijkstra, isAdjacent, BgLayoutItemType, Position, TileMapData, translateToPxPosition, translateToPosition } from "~/lib/algorithm";
import { Viewport } from 'pixi-viewport';
import { MutableRefObject } from 'react';

export type Orientation = "right" | "down" | "left" | "up"

export type CharacterProps =
  {
    bt?: PIXI.BaseTexture;
    // The data for the spritesheet.
    spritesheetData: PixiSpritesheet;
    // The pose of the NPC.
    x: number;
    y: number;
    orientation: Orientation; // 
    isMoving?: boolean;
    // Shows a thought bubble if true.
    isThinking?: boolean;
    // Shows a speech bubble if true.
    isSpeaking?: boolean;
    emoji?: string;
    // Highlights the player.
    isViewer?: boolean;
    // The speed of the animation. Can be tuned depending on the side and speed of the NPC.
    speed: number;
    // onClick: () => void;
    tickMove?: number; // every tick move px
    // viewport to be followed
    viewportRef?: MutableRefObject<Viewport | undefined>;
    // character move target
    targetPoint?: PIXI.Point;
    // map data
    mapData: TileMapData;
  }

export type AnimationData = {
  tileDim: number;
  xTiles: number;
  yTiles: number;
}


export default function Character({
  bt, spritesheetData, speed,
  x, y, orientation, 
  isThinking, isSpeaking,
  mapData, tickMove, viewportRef, targetPoint
}: CharacterProps) {
  const containerRef = useRef<PIXI.Container | null>(null);
  const spriteRef = useRef<PIXI.AnimatedSprite | null>(null);
  const [spritesheet, setSpritesheet] = useState<PIXI.Spritesheet>();
  const [direction, setDirection] = useState<Orientation>(orientation); // left=0,right,up,down 
  const [preStartTile, setPreStartTile] = useState<Position>()
  const [startTile, setStartTile] = useState<Position>()
  const [preEndTile, setPreEndTile] = useState<Position>()
  const [endTile, setEndTile] = useState<Position>()
  const [routes, setRoutes] = useState<Position[]>([])
  const [currentX, setCurrentX] = useState(x);
  const [currentY, setCurrentY] = useState(y);
  const [currentRoute, setCurrentRoute] = useState<Position>();
  const [isMoving, setIsMoving] = useState(false);
  const tickMoveDefault = 0.1

  let obstacleAll: BgLayoutItemType[][] = [];
  for (let i = 0; i < mapData.itemRows; i++) {
    obstacleAll.push(new Array(mapData.itemColumns).fill(0));
  }
  // 二维数组每个元素代表一个tile
  const mapTiles = useRef<BgLayoutItemType[][]>(obstacleAll);

  // parse spritesheet
  useEffect(() => {
    console.log('_bt=>', bt)
    let _bt = bt
    if (!_bt) {
      const url = spritesheetData.meta.image
      _bt = PIXI.BaseTexture.from(url);
    }
    
    console.log('_bt=>', _bt)
    const _spritesheet = new PIXI.Spritesheet(_bt, spritesheetData);
    _spritesheet.parse().then(() => {
      // const frames = Object.keys(spritesheet.textures).map(t => spritesheet.textures[t])
      setSpritesheet(_spritesheet)
    })
  }, [spritesheetData])

  // const orientation = Math.floor(orientation / 90);
  // const direction = ['right', 'down', 'left', 'up'][orientation];

  useEffect(() => {
    if (isMoving) {
      spriteRef.current?.play();
    }
  }, [direction, isMoving]);

  // set viewport follow npc
  useEffect(() => {
    if (!containerRef.current) {
      return
    }
    viewportRef?.current && viewportRef.current.follow(containerRef.current, { speed: 20 })
  }, [containerRef.current])

  // adjust startTile & endTile
  useEffect(() => {
    if (!containerRef.current) {
      return
    }
    // console.log("ref.current=>", ref.current.position)

    let startTileChanged = false, endTileChanged = false;
    const _startTile = translateToPosition({
      ...mapData,
      x: containerRef.current.position.x,
      y: containerRef.current.position.y,
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
        ...mapData,
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
        setIsMoving(false)
        setRoutes([])
        setCurrentRoute(undefined)
      }
    }
  }, [containerRef.current, targetPoint])

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
        const { x, y } = translateToPxPosition({ ...mapData, columns, rows })
        return { x, y, columns, rows }
      }))
      _routes.push(endTile)
    } else {
      _routes.push(endTile)
    }

    console.log('_routes=>', _routes)
    const route = _routes[0]
    if (route.columns > startTile.columns) {
      setDirection("right")
    } else if (route.columns < startTile.columns) {
      setDirection("left")
    } else {
      if (route.rows > startTile.rows) {
        setDirection("down")
      } else {
        setDirection("up")
      }
    }
    setRoutes(_routes)
    setCurrentRoute(startTile)

  }, [startTile, endTile])

  // set walking
  useEffect(() => {
    if (routes.length) {
      setIsMoving(true)
    } else {
      setIsMoving(false)
    }
  }, [routes])

  // move
  useTick(delta => {
    if (!routes || !endTile) {
      // console.log("==no route===")
      return
    }
    if (!isMoving) {
      // console.log("==isWalking stopped===")
      return
    }
    if (!currentRoute) {
      // console.log("==no currentRoute===")
      return
    }

    let directionX = 1, directionY = 1;
    let newX = currentX, newY = currentY;
    if (routes.length === 0) {
      console.log('routes is over')
      setIsMoving(false)
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
        setDirection("right")
      } else {
        setDirection("left")
      }

      // console.log("newX=>", currentX + delta * tickMove * directionX, currentX, delta, tickMove, directionX)
      newX = currentX + delta * (tickMove ?? tickMoveDefault) * directionX
      setCurrentX(newX)
    } else {
      if (route.rows > currentRoute.rows) {
        setDirection("down")
      } else {
        setDirection("up")
      }
      if (currentY > route.y) {
        directionY = -1
      }
      newY = currentY + delta * (tickMove ?? tickMoveDefault) * directionY
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

  if (!spritesheet) return null;

  return (
    <Container ref={containerRef} x={currentX} y={currentY}>
      {isThinking && (
        // TODO: We'll eventually have separate assets for thinking and speech animations.
        <Text x={-20} y={-10} scale={{ x: -0.8, y: 0.8 }} text={'😁'} anchor={0.5} />
      )}
      {isSpeaking && (
        // TODO: We'll eventually have separate assets for thinking and speech animations.
        <Text x={18} y={-10} scale={0.8} text={'💬'} anchor={0.5} />
      )}
      <AnimatedSprite
        ref={spriteRef}
        anchor={0.5}
        // scale={2}
        textures={spritesheet.animations[direction]}
        isPlaying={isMoving}
        // initialFrame={0}
        animationSpeed={speed}
      />
    </Container>
  )
}