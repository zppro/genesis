import Layout from "~/layouts/SideLeftWithBreadcrumb"
import { Outlet } from "@remix-run/react";
import { SerializedWorld } from "@/worlds";
import { useRootContext } from "~/hooks/use-context"
import { redirect } from "@remix-run/node";
import { appNavItems } from "~/data/nav";

export default function Index() {
  const rootContext = useRootContext()
  return (
    <Layout navMain={appNavItems} worlds={rootContext.worlds ?? []}>
      <Outlet context={rootContext} />
    </Layout>
  )
}