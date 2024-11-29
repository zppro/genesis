import { useOutletContext } from "@remix-run/react";
import { Doc } from "@/_generated/dataModel"

export type RootContext = { worlds: Doc<"worlds">[], setWorlds: any }

export function useRootContext(): RootContext {
  return useOutletContext() as RootContext
}