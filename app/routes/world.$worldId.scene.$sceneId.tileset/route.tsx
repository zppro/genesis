import { useRouteLoaderData } from "@remix-run/react";
import { ImageDialog } from "~/components/ui/image-dialog";
import type { loader as sceneLoader } from "~/routes/world.$worldId.scene.$sceneId/route";

export default function TilesetTab() {
  const { sceneEx } = useRouteLoaderData<typeof sceneLoader>("routes/world.$worldId.scene.$sceneId")!;
  return (
    <div className="flex flex-col space-y-2">
      <ImageDialog src={sceneEx?.tileset.url} maxWidth={400} maxHeight={300} />
    </div>
  )
}