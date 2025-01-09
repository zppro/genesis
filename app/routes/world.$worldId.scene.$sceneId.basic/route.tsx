import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import SimpleCard from "~/components/ui/simple-card";
import FileCard from "~/components/ui/file-card";
import ImageCard from "~/components/ui/image-card";
import { ImageDialog } from "~/components/ui/image-dialog";
import { FileJson } from "lucide-react"
import type { loader as sceneLoader } from "~/routes/world.$worldId.scene.$sceneId/route";
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";

export const handle: Handle = {
  breadcrumb
};

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export async function loader({
  params,
  request,
}: LoaderFunctionArgs) {
  const breadcrumbData = { routeName: "basic", routeUrl: "#" }
  return { ...breadcrumbData }
}

export default function BaiscTab() {
  const { sceneEx } = useRouteLoaderData<typeof sceneLoader>("routes/world.$worldId.scene.$sceneId")!;
  return (
    <div className="flex p-2 flex-col space-y-2">
      <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-5">
        <FileCard title="Tilemap Data" file={{ url: sceneEx.tilemap.url!, icon: FileJson }} />
        <ImageCard title="Tileset" imageUrl={sceneEx.tileset.url!} />
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