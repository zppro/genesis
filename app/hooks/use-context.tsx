import { useOutletContext } from "@remix-run/react";
import { type WorldDoc, type WorldId } from "@/worlds";

export type RootContext = { worlds: WorldDoc[], setWorlds: any }

export function useRootContext(): RootContext {
  return useOutletContext() as RootContext
}

export type CurrentWorldContext = { currentWorldId: WorldId }

export function useCurrentWorldContext(): CurrentWorldContext {
  return useOutletContext() as CurrentWorldContext
}