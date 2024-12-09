import Layout from "~/layouts/SideLeftWithBreadcrumb"
import { Outlet, useLoaderData } from "@remix-run/react";
import { useRootContext } from "~/hooks/use-context"
import { appNavItems } from "~/data/nav";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { WorldId } from "@/worlds";

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { worldId } = params;
  return { currentWorldId: worldId }
}

export default function Index() {
  const rootContext = useRootContext()
  const { currentWorldId } = useLoaderData<typeof loader>();
  return (
    <Layout navMain={appNavItems(currentWorldId! as WorldId)} worlds={rootContext.worlds ?? []}>
      <Outlet context={{ ...rootContext, currentWorldId }} />
    </Layout>
  )
}