import * as React from "react"
import { useRootLoaderData } from "~/root"

export type AppEnv = {
  CONVEX_URL: string
  CLERK_PUBLISHABLE_KEY: string
}

export function useEnv(): AppEnv {
  const [env] = React.useState<AppEnv>(useRootLoaderData().ENV)
  return env
}