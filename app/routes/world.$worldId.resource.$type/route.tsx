import { listWorldResourcsByType } from "~/data/convexProxy/resource.server"
import { useSearchParams, useLoaderData, Outlet, Link } from "@remix-run/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable"
import { type WorldId } from "@/worlds";
import { type LoaderFunctionArgs } from "@remix-run/node";
import List from "./list"
import { ResourceTypes } from "@/world/resources";
import { useRedirectToastEx, useRedirectToastExOld } from "~/hooks/use-redirectToast";
import { GetOneErrorBoundary } from "~/components/error-boundary"

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { worldId, type } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  if (!type) {
    throw new Error("invalid type param!");
  }
  const resources = await listWorldResourcsByType(worldId as WorldId, type as ResourceTypes)

  return { worldId: worldId as WorldId, type: type as ResourceTypes, resources }
}

export default function Scene() {
  const data = useLoaderData<typeof loader>();
  useRedirectToastExOld("DELETE", `/delete`, `delete ${data.type} ok`)
  
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