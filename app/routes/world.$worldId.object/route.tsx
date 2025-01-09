import { listWorldObjects } from "~/data/convexProxy/object.server"
import { useLoaderData, Outlet } from "@remix-run/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable"
import { type WorldId } from "@/worlds";
import { type LoaderFunctionArgs } from "@remix-run/node";
import SceneScrollList from "./list"
import { useRedirectToastEx } from "~/hooks/use-redirectToast";
import { GetOneErrorBoundary } from "~/components/error-boundary"

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { worldId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  const objects = await listWorldObjects(worldId as WorldId)

  return { worldId: worldId as WorldId,  objects }
}

export default function Scene() {
  useRedirectToastEx("DELETE", `/delete`, "delete object ok")
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