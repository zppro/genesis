import { useRouteLoaderData } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import Field from "~/components/ui/field";
import type { loader as mcpServerLoader } from "~/routes/world.$worldId.mcpServer.$mcpServerId/route";
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";

export const handle: Handle = {
  breadcrumb
};

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export async function loader({
  params,
  request,
}: LoaderFunctionArgs) {
  const breadcrumbData = { routeName: "tools", routeUrl: "#" }
  return { ...breadcrumbData }
}

export default function BaiscTab() {
  const { mcpServer } = useRouteLoaderData<typeof mcpServerLoader>("routes/world.$worldId.mcpServer.$mcpServerId")!;
  return (
    <div className="w-full flex flex-1 flex-col p-2">
      <div>
        {mcpServer?.name}-tools
      </div>
      <div className="flex-1 whitespace-pre-wrap text-sm">

      </div>
    </div>
  )
}