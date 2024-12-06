import Layout from "~/layouts/SideLeftWithBreadcrumb"
import { Outlet, useLoaderData } from "@remix-run/react";
import { useRootContext } from "~/hooks/use-context"
import { appNavItems } from "~/data/nav";
import { type LoaderFunctionArgs } from "@remix-run/node";

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { worldId } = params;
  console.log('world.loader worldId=>', worldId)
  return { currentWorldId: worldId }
}

export default function Index() {
  const rootContext = useRootContext()
  const { currentWorldId } = useLoaderData<typeof loader>();
  return (
    <Layout navMain={appNavItems} worlds={rootContext.worlds ?? []}>
      <Outlet context={{ ...rootContext, currentWorldId }} />
    </Layout>
  )
}