import { listWorldResourcsByType } from "~/data/convexProxy/resource.server"
import { useSearchParams, useLoaderData, Outlet, Link } from "@remix-run/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable"
import { type WorldId } from "@/worlds";
import { type LoaderFunctionArgs } from "@remix-run/node";
import SceneScrollList from "./list"
import { ResourceTypes } from "@/world/resources";


export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  let type = url.searchParams.get("type");
  if (!type) {
    throw new Error("invalid search param!");
  }
  const { worldId } = params;
  if (!worldId) {
    throw new Error("invalid params!");
  }
  console.log('resource worldId=>', worldId)
  const resources = await listWorldResourcsByType(worldId as WorldId, type as ResourceTypes)

  return { worldId: worldId as WorldId, type: type as ResourceTypes, resources }
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