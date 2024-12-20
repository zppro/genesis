
import { useLoaderData, Outlet, Link } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Search, Plus } from "lucide-react"
import List from "./list"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable"
import { Input } from "~/components/ui/input"
import { WorldId } from "@/worlds";

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { worldId, sceneId } = params;
  console.log('animation load')
  return { worldId: worldId as WorldId, sceneId, scenes: [] }
}

export default function AnimationsTab() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="border flex-1 flex flex-col">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full items-stretch"
      >
        <ResizablePanel defaultSize={25} minSize={25}>
          <List {...data} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <div className="h-full">
            <Outlet />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}