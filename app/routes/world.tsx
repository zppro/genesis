import Layout from "~/layouts/SideLeftWithBreadcrumb"
import { Outlet, useLoaderData, ShouldRevalidateFunction } from "@remix-run/react";
import { useRootContext } from "~/hooks/use-context"
import { appNavItems } from "~/data/nav";
import { type LoaderFunctionArgs } from "@remix-run/node";
import type { WorldId } from "@/worlds";
import { listWorlds } from "~/data/convexProxy/world.server"

export async function loader({
  params,
}: LoaderFunctionArgs) {
  console.log('loader enter...')
  const { worldId } = params;
  return { currentWorldId: worldId as WorldId }
}

// export const shouldRevalidate: ShouldRevalidateFunction = ({
//   actionResult,
//   currentParams,
//   currentUrl,
//   defaultShouldRevalidate,
//   formAction,
//   formData,
//   formEncType,
//   formMethod,
//   nextParams,
//   nextUrl,
// }) => {
//   if (formAction?.endsWith("/settings?index") && formMethod === "POST") {
//     if (Object.keys(actionResult?.errors).length === 0) {
//       console.log('shouldRevalidate matched')
//       return true
//     }
//   }
//   return defaultShouldRevalidate;
// };

export default function Index() {
  const rootContext = useRootContext()
  const { currentWorldId } = useLoaderData<typeof loader>();
  // console.log('worlds=>',rootContext.setWorlds(worlds))
  return (
    <Layout navMain={appNavItems(currentWorldId)} worlds={[...rootContext.worlds]}>
      <Outlet context={{ ...rootContext, currentWorldId }} />
    </Layout>
  )
}