import { format } from "date-fns/format"
import { useLoaderData, Outlet, Link, redirect, useLocation, useNavigation } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Separator } from "~/components/ui/separator"
import { getWorldSceneExtend } from "~/data/convexProxy/scene.server"
import { type SceneId, table } from "@/world/scenes";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import { cn } from "~/lib/utils";
import Toolbar from "~/components/toolbars/entity-detail-toolbar";
import ToolItem from "~/components/toolbars/tool-item"
import { Form } from "@remix-run/react";
import { Button } from "~/components/ui//button";
import { CloudUpload, Check, TriangleAlert } from "lucide-react"
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";

export const handle: Handle = {
  breadcrumb
};

export async function loader({
  params,
  request,
}: LoaderFunctionArgs) {
  const { worldId, sceneId } = params;
  const routeUrl = `/world/${worldId}/scene/${sceneId}`

  let url = new URL(request.url);
  if (url.pathname === routeUrl) {
    return redirect(`basic`);
  }

  let sceneEx = null
  try {
    sceneEx = await getWorldSceneExtend(sceneId as SceneId)
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
    if (sceneEx === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    console.log('scene id load')
    const breadcrumbData = { routeName: sceneEx.name, routeUrl }
    return { ...breadcrumbData, sceneEx }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export default function Index() {
  const { sceneEx } = useLoaderData<typeof loader>();
  const location = useLocation();
  const tabValue = location.pathname.substring(location.pathname.lastIndexOf("/") + 1)
  // const state = useRedirectToastOld("sync")
  const navigation = useNavigation()
  const isSyncing = navigation.state === "submitting" && navigation.formMethod === "POST" && navigation.formAction === `/world/${sceneEx?.worldId}/scene/${sceneEx?._id}/sync`;
  const isSynced = sceneEx.syncTime && sceneEx.modifyTime < sceneEx.syncTime
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
        <div className="w-full flex items-start flex-row p-4 ">
          <div className="font-semibold text-lg">{sceneEx?.name}</div>
          {sceneEx?._creationTime && (
            <div className="ml-auto text-xs h-full text-muted-foreground flex items-center">
              {format(new Date(sceneEx._creationTime), "PPpp")}
            </div>
          )}
        </div>
        <Separator />
        <div className="pt-2 tabs">
          <Link to="basic" prefetch="render" className={cn("tab basis-1/5", tabValue === 'basic' ? 'active-tab' : null)} >Basic</Link>
          <Link to="map" prefetch="render" className={cn("tab basis-1/5", tabValue === 'map' ? 'active-tab' : null)}>Map</Link>
          <Link to="npcs" prefetch="render" className={cn("tab basis-1/5", tabValue === 'npcs' ? 'active-tab' : null)}>NPCs</Link>
          <Link to="animations" prefetch="render" className={cn("tab basis-1/5", tabValue === 'animations' ? 'active-tab' : null)}>Animations</Link>
          {/* <div className="flex-1 border-gray-500"></div> */}
        </div>
        {/* <ScrollArea className="h-full w-full max-h-[calc(100vh-230px)] p-4 flex-1 flex flex-col">
        
        </ScrollArea> */}
        <Outlet />
        <Separator className="mt-auto" />
        <div className="p-2">
        </div>
      </div>
    </div>
  )
}