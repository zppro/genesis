import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { ScrollArea } from "~/components/ui/scroll-area"
import type { loader as mcpServerLoader } from "~/routes/world.$worldId.mcpServer.$mcpServerId/route";
import { Separator } from "~/components/ui/separator"
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";
import { useQuery, useAction } from "convex/react";
import { api } from "@/_generated/api";
import { WorldId } from "@/worlds"
import { McpServerId } from "@/world/mcpServer/schema";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui//button";
import { Binoculars } from "lucide-react"
import { useState } from "react";
import { useToast } from "~/hooks/use-toast";
import JsonPretty from "~/components/ui/json-pretty";


export const handle: Handle = {
  breadcrumb
};

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export async function loader({
  params,
  request,
}: LoaderFunctionArgs) {
  const { mcpServerId } = params;

  const breadcrumbData = { routeName: "tools", routeUrl: "#" }
  return { ...breadcrumbData, mcpServerId: mcpServerId as McpServerId }
}

export default function ToolsTab() {
  // const { mcpServer } = useRouteLoaderData<typeof mcpServerLoader>("routes/world.$worldId.mcpServer.$mcpServerId")!;
  const { mcpServerId } = useLoaderData<typeof loader>();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast()

  const mcpServerTools = useQuery(api.world.mcpServerTool.query.listByMcpServer, { mcpServerId });
  const discoverAndStoreAction = useAction(api.mcp.client.nodeAction.discoverAndStore)
  const handleDiscoverToolsClick = async () => {
    try {
      setIsLoading(true);
      await discoverAndStoreAction({
        mcpServerId,
        types: ["tools"],
      })
    } catch (err) {
      toast({
        title: "discover tools err:",
        description: JSON.stringify(err),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full flex flex-1 flex-col p-2 space-y-2">
      <div>
        <Button variant="ghost" className="border"
          disabled={isLoading}
          onClick={handleDiscoverToolsClick} >
          <Binoculars className="h-4 w-4" />
          discover tools
        </Button>
      </div>
      <Separator />
      <ScrollArea className="h-full w-full max-h-[calc(100vh-180px)]">
        <div className="flex flex-col gap-2 p-4 pt-0">
          {(mcpServerTools ?? []).map((item) => (
            <div key={item._id} className="flex flex-col space-y-1">
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{item.name}</div>
                  </div>
                  <div
                    className={cn(
                      "ml-auto text-xs",
                      false
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    [field1]
                  </div>
                </div>
                <div className="text-xs font-medium">{item.name}</div>
              </div>
              <div className="line-clamp-2 text-xs text-muted-foreground">
                {item.desc}
              </div>
              <div className="whitespace-pre-wrap" >
                <JsonPretty
                  data={JSON.stringify(item.inputSchema, null, 2)}
                  className="w-[520px]"
                /></div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}