import { listWorldMcpServers } from "~/data/convexProxy/mcpServer.server"
import { useLoaderData, useLocation, useActionData, Outlet } from "@remix-run/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable"
import { type WorldId } from "@/worlds";
import { type LoaderFunctionArgs } from "@remix-run/node";
import MpcServerScrollList from "./list"
import { useRedirectToast } from "~/hooks/use-redirectToast";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";


export const handle: Handle = {
  breadcrumb
};

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { worldId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }

  const mcpServers = await listWorldMcpServers(worldId as WorldId)
  const breadcrumbData = { routeName: "mcpServer", routeUrl: `/world/${worldId}/mcpServer` }
  return { ...breadcrumbData, worldId: worldId as WorldId, mcpServers }
}

export default function McpServer() {
  const data = useLoaderData<typeof loader>();
  useRedirectToast([{
    method: "DELETE",
    actionCheck: "/delete",
    desc: "delete mcpServer ok",
  }, {
    method: "POST",
    actionCheck: "/sync",
    desc: "sync mcpServer ok",
  }])
  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full items-stretch"
      >
        <ResizablePanel defaultSize={25} minSize={25}>
          <MpcServerScrollList {...data} />
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