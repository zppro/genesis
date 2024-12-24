
import { useLoaderData, Outlet, Link } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { LoaderCircle } from "lucide-react"
import { useRouteLoaderData } from "@remix-run/react";
import type { loader as sceneLoader } from "~/routes/world.$worldId.scene.$sceneId/route";
import List from "./list"
import Tilemap from "~/components/pixi/tilemap.client";
import { Stage } from '@pixi/react';
import { listWorldObjectExtendsByType } from "~/data/convexProxy/object.server"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable"
import { Input } from "~/components/ui/input"
import { WorldId } from "@/worlds";
import { ClientOnly } from "remix-utils/client-only"
import { useEffect, useState } from "react";
import { PixiTilemapConverted, parseLayerData, convertLayerData, TileLayer } from "@/shared/tilemap"


export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { worldId, sceneId } = params;
  console.log('animation load')
  // const animationObjectExs = await listWorldObjectExtendsByType(worldId as WorldId, "animation")

  return { worldId: worldId as WorldId, sceneId, scenes: [] }
}

export default function AnimationsTab() {
  const { sceneEx } = useRouteLoaderData<typeof sceneLoader>("routes/world.$worldId.scene.$sceneId")!;
  const data = useLoaderData<typeof loader>();
  const [map, setMap] = useState<PixiTilemapConverted>()



  useEffect(() => {
    const tilesetUrl = sceneEx.tileset.url!;
    const tilemapUrl = sceneEx.tilemap.url!;

    (async () => {


      const response = await fetch(tilemapUrl);
      const parsed = await response.json();
      // console.log("parsed typeof:", parsed)

      const bgtiles: TileLayer[] = []
      const objmap: TileLayer[] = []
      const tilelayers = parsed.layers.filter((layer: any) => layer.type === 'tilelayer');
      const [head, ...[_, ...tail]] = tilelayers
      const objmapLayer = tail[tail.length - 1];
    
      bgtiles.push(parseLayerData(head.data, head.width, head.height))
      objmap.push(parseLayerData(objmapLayer.data, objmapLayer.width, objmapLayer.height))
      // parsed.layers.forEach((layer: any) => {
      //   console.log('layer=>', layer)
      //   if (layer.type === "tilelayer") {
      //     bgtiles.push(parseLayerData(layer.data, layer.width, layer.height))
      //   } else if (layer.type === "objectgroup") {

      //   }
      // })

      // console.log('bgtiles[0]:', bgtiles[0].length)
      // console.log('bgtiles[0][0]:', bgtiles[0][0].length)
      // console.log('objmap.length:', objmap.length)


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
        mapwidth: sceneEx.screenxtiles,
        mapheight: sceneEx.screenytiles,
      }
      // console.log('_map=>', _map)
      setMap(_map)

    })();
  }, [sceneEx])

  return (
    <div className="border flex-1 flex flex-col">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full items-stretch"
      >
        <ResizablePanel defaultSize={25} minSize={25}>
          <List {...data} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <div className="h-full p-2 grid place-content-center">
            <ClientOnly fallback={<LoaderCircle className="h-4 w-4 loading-icon" />}>
              {() =>
                <Stage key={sceneEx._id} width={400} height={300} options={{ background: 0xffffff }} onMount={() => {
                  console.log('stage on mounted')
                }}>
                  {
                    map && <Tilemap width={400} height={300} map={map} tilemap={sceneEx.tilemap} tileset={sceneEx.tileset} />
                  }

                </Stage>
              }
            </ClientOnly>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}