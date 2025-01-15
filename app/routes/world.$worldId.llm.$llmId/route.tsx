import { format } from "date-fns/format"
import { useLoaderData, Outlet, Link, useLocation, } from "@remix-run/react";
import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Separator } from "~/components/ui/separator"
import { getWorldLLM } from "~/data/convexProxy/llm.server"
import { type LLMId, table } from "@/world/llms";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import Toolbar from "~/components/toolbars/entity-detail-toolbar";
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
  const { worldId, llmId } = params;
  const routeUrl = `/world/${worldId}/llm/${llmId}`
  let url = new URL(request.url);
  if (url.pathname === routeUrl) {
    return redirect(`basic`);
  }

  let llm = null
  try {
    llm = await getWorldLLM(llmId as LLMId)
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
    if (llm === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    const breadcrumbData = { routeName: llm.name, routeUrl }

    return { ...breadcrumbData, llm }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export default function Index() {
  const { llm, routeUrl } = useLoaderData<typeof loader>();
  const location = useLocation();
  const tabName = location.pathname.substring(location.pathname.lastIndexOf("/") + 1)
  const tabs: TabOptions[] = [{
    name: "basic",
    url: "basic",
    baseUrl: routeUrl,
    prefetch: "render",
  }, {
    name: "playground",
    url: "playground",
    baseUrl: routeUrl,
    prefetch: "render",
  }, {
    name: "history",
    url: "history",
    baseUrl: routeUrl,
    prefetch: "render",
  }]
  return (
    <div className="flex h-full items-start flex-col">
      <Toolbar entityName={table} />
      <Separator />
      <div className="w-full flex flex-1 flex-col">
        <div className="w-full flex items-start flex-row p-4 ">
          <div className="font-semibold text-lg">{llm?.name}</div>
          {llm?._creationTime && (
            <div className="ml-auto text-xs h-full text-muted-foreground flex items-center">
              {format(new Date(llm.modifyTime), "PPpp")}
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