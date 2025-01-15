import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { GetOneErrorBoundary } from "~/components/error-boundary"
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
  const { llmId } = params;
  const breadcrumbData = { routeName: "history", routeUrl: "#" }
  return { ...breadcrumbData, llmId }
}

export default function HistoryTab() {
  const { llmId } = useLoaderData<typeof loader>();
  return (
    <div className="flex p-2 flex-col space-y-2">
       this is history
    </div>
  )
}