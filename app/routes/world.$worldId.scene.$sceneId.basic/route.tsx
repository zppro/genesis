import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import SimpleCard from "~/components/ui/simple-card";
import { ImageDialog } from "~/components/ui/image-dialog";
import { FileJson } from "lucide-react"
import type { loader as sceneLoader } from "~/routes/world.$worldId.scene.$sceneId/route";


export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export default function BaiscTab() {
  const { sceneEx } = useRouteLoaderData<typeof sceneLoader>("routes/world.$worldId.scene.$sceneId")!;
  return (
    <div className="flex flex-col space-y-2">
      <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-5">
        <SimpleCard title="Tile Dimension" value={sceneEx.tiledim} desc="a tile's size" />
        <SimpleCard title="Tiles Of ScreenX" value={sceneEx.screenxtiles} desc="number of tiles along x axis" />
        <SimpleCard title=" Tiles Of ScreenYn" value={sceneEx.screenytiles} desc="number of tiles along y axis" />
        <SimpleCard title="Tileset Width" value={sceneEx.tilesetpxw} />
        <SimpleCard title="Tileset Height" value={sceneEx.tilesetpxh} />
      </div>
      <div className="whitespace-pre-wrap text-sm">
        {sceneEx?.desc}
      </div>
    </div>
  )
}