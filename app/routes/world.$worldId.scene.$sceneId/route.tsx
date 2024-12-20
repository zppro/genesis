import { format } from "date-fns/format"
import { useLoaderData } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Separator } from "~/components/ui/separator"
import { getWorldScene } from "~/data/convexProxy/scene.server"
import { type SceneId, table } from "@/world/scenes";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import Toolbar from "~/components/toolbars/entity-detail-toolbar";
import { ScrollArea } from "~/components/ui/scroll-area"
import SimpleCard from "~/components/ui/simple-card";

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { sceneId } = params;
  let scene = null
  try {
    scene = await getWorldScene(sceneId as SceneId)
  } catch (error) {
    let isNotFoundError = parseIsNotFoundRecordError(error)
    if (isNotFoundError) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    throw error
  } finally {
    if (scene === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    return { scene }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export default function Index() {
  const { scene } = useLoaderData<typeof loader>();
  return (
    <div className="flex h-full items-start flex-col">
      <Toolbar entityName={table} />
      <Separator />
      <div className="w-full flex flex-1 flex-col">
        <div className="w-full flex items-start flex-row p-4 ">
          <div className="font-semibold text-lg">{scene?.name}</div>
          {scene?._creationTime && (
            <div className="ml-auto text-xs h-full text-muted-foreground flex items-center">
              {format(new Date(scene._creationTime), "PPpp")}
            </div>
          )}
        </div>
        <Separator />
        <ScrollArea className="p-4 h-full w-full max-h-[calc(100vh-200px)] ">
          <div className="flex flex-col space-y-2">
            <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-5">
              <SimpleCard title="Tile Dimension" value={scene.tiledim} desc="a tile's size" />
              <SimpleCard title="Tiles Of ScreenX" value={scene.screenxtiles} desc="number of tiles along x axis" />
              <SimpleCard title=" Tiles Of ScreenYn" value={scene.screenytiles} desc="number of tiles along y axis" />
              <SimpleCard title="Tileset Width" value={scene.tilesetpxw} />
              <SimpleCard title="Tileset Height" value={scene.tilesetpxh} />
            </div>
            <div className="whitespace-pre-wrap text-sm">
              {scene?.desc}
            </div>
          </div>
        </ScrollArea>
        <Separator className="mt-auto" />
        <div className="p-2">

        </div>
      </div>
    </div>
  )
}