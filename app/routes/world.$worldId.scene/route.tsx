import { listWorldScenes } from "~/data/convexProxy/scene.server"
import { useLoaderData, Outlet, Link, UIMatch } from "@remix-run/react";
import { Search, Plus } from "lucide-react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable"
import { Input } from "~/components/ui/input"
import { type WorldId } from "@/worlds";
import { type LoaderFunctionArgs } from "@remix-run/node";
import List from "~/routes/world.$worldId.scene/list"
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";

export const handle: Handle = {
  breadcrumb
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { worldId } = params;
  if (!worldId) {
    throw new Error("invalid params!");
  }
  const breadcrumbData = { routeName: "scene", routeUrl: `/world/${worldId}/scene` }

  const scenes = await listWorldScenes(worldId as WorldId)

  return { ...breadcrumbData, worldId: worldId as WorldId, scenes }
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
          <List {...data} />
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