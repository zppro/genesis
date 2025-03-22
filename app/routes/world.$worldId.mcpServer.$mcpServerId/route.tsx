import { format } from "date-fns/format"
import { Outlet, useLoaderData, useNavigation, useLocation, Form } from "@remix-run/react";
import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { getWorldMcpServer } from "~/data/convexProxy/mcpServer.server"
import { type McpServerId, table } from "@/world/mcpServer/schema";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import Toolbar from "~/components/toolbars/entity-detail-toolbar";
import { useRedirectToast, useRedirectToastOld } from "~/hooks/use-redirectToast";
import ToolItem from "~/components/toolbars/tool-item"
import { Button } from "~/components/ui//button";
import { CloudUpload, Check, TriangleAlert, Play } from "lucide-react"
import SlimTab, { TabOptions } from "~/components/ui/slim-tab";
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";


export const handle: Handle = {
  breadcrumb
};

export async function loader({
  request,
  params,
}: LoaderFunctionArgs) {
  const { worldId, mcpServerId } = params;
  const routeUrl = `/world/${worldId}/mcpServer/${mcpServerId}`
  let url = new URL(request.url);
  if (url.pathname === routeUrl) {
    // return redirect(`basic`);
    return redirect(`basic${url.search}`);
  }
  let mcpServer = null
  try {
    mcpServer = await getWorldMcpServer(mcpServerId as McpServerId)
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
    if (mcpServer === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    const breadcrumbData = { routeName: mcpServer.name, routeUrl }

    return { ...breadcrumbData, mcpServer }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export default function Index() {
  const { mcpServer, routeUrl } = useLoaderData<typeof loader>();
  const location = useLocation();
  const tabName = location.pathname.substring(location.pathname.lastIndexOf("/") + 1)
  const tabs: TabOptions[] = [{
    name: "basic",
    url: "basic",
    baseUrl: routeUrl,
    prefetch: "render",
  }, {
    name: "tools",
    url: "tools",
    baseUrl: routeUrl,
    prefetch: "render",
  }, {
    name: "resources",
    url: "resources",
    baseUrl: routeUrl,
    prefetch: "intent",
  }, {
    name: "prompts",
    url: "prompts",
    baseUrl: routeUrl,
    prefetch: "intent",
  }]
  const state = useRedirectToastOld("sync")
  const navigation = useNavigation()
  const isSyncing = state === "submitting" && navigation.formMethod === "POST" && navigation.formAction === `/world/${mcpServer?.worldId}/mcpServer/${mcpServer?._id}/sync`;
  const isSynced = mcpServer.syncTime && mcpServer.modifyTime && mcpServer.modifyTime <= mcpServer.syncTime
  return (
    <div className="flex h-full items-start flex-col">
      <Toolbar entityName={table}>
        <ToolItem itemTip="sync to the world">
          <Form method="post" action="sync">
            <Button variant="ghost" size="default" className="border" type="submit" disabled={isSyncing} >
              <CloudUpload className="h-4 w-4" />
              <span>{isSyncing ? "Syncing..." : "Sync"}</span>
              {isSynced ? <Check className="text-green-500" /> : <TriangleAlert className="text-yellow-500" />}
            </Button>
          </Form>
        </ToolItem>
      </Toolbar>
      <Separator />
      <div className="w-full flex flex-1 flex-col">
        <div className="w-full flex items-start flex-row p-4">
          <div className="font-semibold text-lg">{mcpServer?.name}<Badge className="ml-2">{mcpServer?.type}</Badge></div>
          {mcpServer._creationTime && (
            <div className="ml-auto text-xs h-full text-muted-foreground flex items-center">
              {format(new Date(mcpServer._creationTime), "PPpp")}
            </div>
          )}
        </div>
        <Separator />
        <SlimTab currentTab={tabName} className="pt-2" tabs={tabs} >
          <Outlet />
        </SlimTab>
        <Separator className="mt-auto" />
        <div className="p-2">
        </div>
      </div>
    </div>
  )
}