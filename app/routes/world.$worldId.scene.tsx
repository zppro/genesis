import { listWorldScenes } from "~/data/convexProxy/scene.server"
import { useLoaderData, Outlet, Link } from "@remix-run/react";
import { Search, Plus } from "lucide-react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable"
import { Input } from "~/components/ui/input"
import { type WorldId } from "@/worlds";
import { type LoaderFunctionArgs } from "@remix-run/node";
import SceneScrollList from "~/routes/world.$worldId.scene.list"


export async function loader({ params }: LoaderFunctionArgs) {
  const { worldId } = params;
  if (!worldId) {
    throw new Error("invalid params!");
  }
  console.log('scene worldId=>', worldId)
  const scenes = await listWorldScenes(worldId as WorldId)

  return { worldId, scenes }
}

export default function Scene() {
  const { worldId, scenes } = useLoaderData<typeof loader>();
  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full max-h-[800px] items-stretch"
      >
        <ResizablePanel defaultSize={25} minSize={25}>
          <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <form>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search" className="pl-8" />
                <Link to={`/world/${worldId}/scene/new`} className="absolute  right-2 top-2.5 h-4 w-4"><Plus className="size-4" /></Link>
              </div>
            </form>
          </div>
          <SceneScrollList scenes={scenes} />
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