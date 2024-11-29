import Layout from "~/layouts/SideLeftWithBreadcrumb"
import { Outlet } from "@remix-run/react";
import { appNavItems } from "~/data/nav";

export default function Index() {
  return (
    <Layout navMain={appNavItems} worlds={[]}>
      <Outlet context={appNavItems} />
    </Layout>
  )
}