import Layout from "~/layouts/SideLeftWithBreadcrumb"
import { Outlet, useLoaderData, ShouldRevalidateFunction } from "@remix-run/react";
import { useRootContext } from "~/hooks/use-context"
import { appNavItems } from "~/data/nav";
import { type LoaderFunctionArgs, ActionFunctionArgs, redirect } from "@remix-run/node";
import type { WorldId } from "@/worlds";
import { userPrefs } from "~/lib/cookies.server"
import { convertFormDataToObject } from "~/lib/form";

export async function loader({
  params,
}: LoaderFunctionArgs) {
  console.log('loader enter...')
  const { worldId } = params;
  return { currentWorldId: worldId as WorldId }
}

export async function action({
  request,
}: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie =
    (await userPrefs.parse(cookieHeader)) || {};
  const formData = await request.formData();
  const formPayload = { ...convertFormDataToObject(formData) }
  const { worldId } = formPayload
  cookie.localWorldId = worldId;
  return redirect("/", {
    headers: {
      "Set-Cookie": await userPrefs.serialize(cookie),
    },
  });
}


export default function Index() {
  const rootContext = useRootContext()
  const { currentWorldId } = useLoaderData<typeof loader>();
  // console.log('worlds=>',rootContext.setWorlds(worlds))
  return (
    <Layout navMain={appNavItems(currentWorldId)}>
      <Outlet context={{ ...rootContext, currentWorldId }} />
    </Layout>
  )
}