
import { useEffect, useState } from "react"
import { SceneExtendDoc } from "@/world/scenes"
import { PixiTilemapConverted, parseLayerData, convertLayerData, TileLayer } from "@/shared/tilemap"

export function useSceneMap(sceneEx: SceneExtendDoc) {
  const [map, setMap] = useState<PixiTilemapConverted>()
  const [tileLayers, setTileLayers] = useState<string[]>([])
  useEffect(() => {
    console.log("refresh useSceneMap=>", sceneEx.blockLayers)
    const tilesetUrl = sceneEx.tileset.url!;
    const tilemapUrl = sceneEx.tilemap.url!;
    (async () => {


      const response = await fetch(tilemapUrl);
      const parsed = await response.json();
      // console.log("parsed typeof:", parsed)

      const bgtiles: TileLayer[] = [] // bg
      const objmap: TileLayer[] = [] // 实际上是block bg
      const _tilelayers = parsed.layers.filter((layer: any) => layer.type === 'tilelayer');

      _tilelayers.forEach((layer: any) => {
        console.log(layer)
      })
      // let bgs = tilelayers;
      // let blocks: any[] = [];
      // if (blockLayers) {

      //   // bgLayers = tilelayers.filter((layer: any) => !blockLayers.includes(layer.name) ))
      //   // blockLayers = tilelayers.filter((layer: any) => !blockLayers.includes(layer.name) ))
      // }

      _tilelayers.forEach((layer: any) => {
        if (sceneEx.blockLayers?.includes(layer.name)) {
          objmap.push(parseLayerData(layer.data, layer.width, layer.height))
        } else {
          bgtiles.push(parseLayerData(layer.data, layer.width, layer.height))
        }
      })

      // console.log('bgtiles=>', bgtiles.length)
      // console.log('objmap=>', objmap.length)

      setTileLayers(_tilelayers.map((layer: any) => layer.name))
      // const [head, ...[_, ...tail]] = tilelayers

      // const objmapLayer = tail[tail.length - 1];

      // bgtiles.push(parseLayerData(head.data, head.width, head.height))
      // objmap.push(parseLayerData(objmapLayer.data, objmapLayer.width, objmapLayer.height))
      // parsed.layers.forEach((layer: any) => {
      //   console.log('layer=>', layer)
      //   if (layer.type === "tilelayer") {
      //     bgtiles.push(parseLayerData(layer.data, layer.width, layer.height))
      //   } else if (layer.type === "objectgroup") {

      //   }
      // })



      const _map: PixiTilemapConverted = {
        tiledim: sceneEx.tiledim,
        screenxtiles: sceneEx.screenxtiles,
        screenytiles: sceneEx.screenytiles,
        tilesetpxw: sceneEx.tilesetpxw,
        tilesetpxh: sceneEx.tilesetpxh,
        tilesetpath: tilesetUrl,
        bgtiles: bgtiles,
        objmap: objmap,
        animatedsprites: [],
      }
      // console.log('_map=>', _map)
      setMap(_map)

    })();
  }, [sceneEx])
  return {map, tileLayers}
}