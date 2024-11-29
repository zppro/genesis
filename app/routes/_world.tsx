import Layout from "~/layouts/SideLeftWithBreadcrumb"
import { Outlet } from "@remix-run/react";



export default function Index() {
  return (
    <Layout navMain={[]}>
      <Outlet  />
    </Layout>
  )
}