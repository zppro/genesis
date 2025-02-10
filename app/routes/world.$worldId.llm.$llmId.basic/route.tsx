import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import Field from "~/components/ui/field";
import type { loader as llmLoader } from "~/routes/world.$worldId.llm.$llmId/route";
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
  const breadcrumbData = { routeName: "basic", routeUrl: "#" }
  return { ...breadcrumbData }
}

export default function BaiscTab() {
  const { llm } = useRouteLoaderData<typeof llmLoader>("routes/world.$worldId.llm.$llmId")!;
  return (
    <div className="flex p-2 flex-col space-y-2">
       <div>
          <Field title="Base Url:" value={llm?.baseUrl} />
        </div>
        <div>
          <Field title="Provider:" value={llm?.provider} />
        </div>
        <div>
          <Field title="Model Name:" value={llm?.model} />
        </div>
        <div>
          <Field title="API Key Name:" value={llm?.apiKeyName} />
        </div>
        <div className="flex-1 whitespace-pre-wrap text-sm">
          {llm?.desc}
        </div>
    </div>
  )
}