import { Link, useOutletContext } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { getAuth } from '@clerk/remix/ssr.server'
import { LoaderFunction, redirect } from '@remix-run/node'
import { useQuery } from "convex/react";
import { api } from "@/_generated/api";
import { useRootContext } from "~/hooks/use-context"
import { useNavigate } from "@remix-run/react";
import { useEffect } from 'react';
import { hasNoWorld } from "~/data/convexProxy/world.server"

export const loader: LoaderFunction = async (args) => {
  console.log('_index')
  const { userId } = await getAuth(args)
  if (!userId) {
    return redirect('/sign-in')
  }
  if (await hasNoWorld()) {
    return redirect('/world/add')
  }
  return {}
}

export const meta: MetaFunction = () => {
  return [
    { title: "dashboard" },
    { name: "description", content: "Welcome to genesis!" },
  ];
};

export default function Index() {
  return (
    <div className="h-screen container mx-auto grid grid-cols-4 place-content-center gap-4">
      <Link className="w-32 h-32 border place-content-center text-center" to="/concise">concise</Link>
      <Link className="w-32 h-32 border place-content-center text-center" to="/sidebar-07">sidebar-07</Link>
    </div>
  )
}