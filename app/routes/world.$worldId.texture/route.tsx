import { listWorldTextures } from "~/data/convexProxy/texture.server"
import { useLoaderData, Outlet } from "@remix-run/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable"
import { type WorldId } from "@/worlds";
import { type LoaderFunctionArgs } from "@remix-run/node";
import SceneScrollList from "./list"


export async function loader({ request, params }: LoaderFunctionArgs) {
  const { worldId, type } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  const textures = await listWorldTextures(worldId as WorldId)

  return { worldId: worldId as WorldId,  textures }
}

export default function Scene() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full items-stretch"
      >
        <ResizablePanel defaultSize={25} minSize={25}>
          <SceneScrollList {...data} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <div className="h-full">
            <Outlet />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

    </>
  )
}