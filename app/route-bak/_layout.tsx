import Layout from "~/layouts/SideLeftWithBreadcrumb"
import { Outlet } from "@remix-run/react";
import { appNavItems2 } from "~/data/nav";

export default function Index() {
  return (
    <Layout navMain={appNavItems2} worlds={[]}>
      <Outlet context={appNavItems2} />
    </Layout>
  )
}