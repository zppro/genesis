import type { MetaFunction } from "@remix-run/node";
import { getAuth } from '@clerk/remix/ssr.server'
import { LoaderFunction, redirect } from '@remix-run/node'
import { listWorlds } from "~/data/convexProxy/world.server"
import { userPrefs } from "~/lib/cookies.server"

export const loader: LoaderFunction = async (args) => {
  const { userId } = await getAuth(args)
  if (!userId) {
    return redirect('/sign-in')
  }
  const { request } = args
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) ?? {};

  if (cookie.localWorldId) {
    console.log("cookie.localWorldId=>", cookie.localWorldId)
    return redirect(`/world/${cookie.localWorldId}/scene`)
  }
  // 不存在cookie
  const worlds = await listWorlds()
  if (worlds.length === 0) {
    return redirect('/world/add')
  }
  cookie.localWorldId = worlds[0]._id;

  return redirect("/", {
    headers: {
      "Set-Cookie": await userPrefs.serialize(cookie),
    },
  });
}

export const meta: MetaFunction = () => {
  return [
    { title: "dashboard" },
    { name: "description", content: "Welcome to genesis!" },
  ];
};

export default function Index() {
  return (
    <></>
  )
}