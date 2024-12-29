import { useRouteLoaderData } from "@remix-run/react";
import type { loader as sceneLoader } from "~/routes/world.$worldId.scene.$sceneId/route";
import { FileJson } from "lucide-react"
import { ImageDialog } from "~/components/ui/image-dialog";

export default function TilemapTab() {
  const { sceneEx } = useRouteLoaderData<typeof sceneLoader>("routes/world.$worldId.scene.$sceneId")!;
  return (
    <div className="flex flex-col space-y-2">
      <a href={sceneEx.tilemap.url} className="underline"><FileJson className="h-12 w-12" />download tilemap.json</a>
      <ImageDialog src={sceneEx?.tileset.url} maxWidth={400} maxHeight={300} />
    </div>
  )
}
