import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { ClerkApp, useAuth } from "@clerk/remix";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useState, useEffect } from "react";
import { Toaster } from "~/components/ui/toaster"

import { useLocalStorage } from "~/hooks/use-localStorage"
import { type WorldDoc } from "@/worlds"
import tailwindHref from "./tailwind.css?url";
import { listWorlds } from "~/data/convexProxy/world"

// Export as the root route loader
export const loader: LoaderFunction = (args: LoaderFunctionArgs) => rootAuthLoader(args, async () => {
  const CONVEX_URL = process.env["CONVEX_URL"]!;

  const worlds = await listWorlds()
  return {
    ENV: {
      CONVEX_URL,
    },
    initWorlds: worlds,
  };
});

export function useRootLoaderData() {
  return useRouteLoaderData<typeof loader>("root")
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindHref },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning={true}>
        {children}
        <Toaster />
        <ScrollRestoration />
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `window.process = ${JSON.stringify({
              env: {},
            })}`,
          }}
        /> */}
        <Scripts />
      </body>
    </html>
  );
}

function App() {
  const { ENV, initWorlds } = useRootLoaderData()
  const [convex] = useState(() => new ConvexReactClient(ENV.CONVEX_URL));
  const [worlds, setWorlds] = useState<WorldDoc[]>(initWorlds)
  const [localWorldId, setLocalWorldId] = useLocalStorage("localWorldId", "")
  if (worlds.length > 0 && !localWorldId) {
    typeof setLocalWorldId === 'function' && setLocalWorldId(worlds[0]._id)
  }
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <Outlet context={{ worlds, setWorlds }} />
    </ConvexProviderWithClerk>
  )
}

export default ClerkApp(App)
