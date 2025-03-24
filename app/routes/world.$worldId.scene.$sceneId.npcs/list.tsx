
import { ScrollArea } from "~/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { cn } from "~/lib/utils"
import type { SceneNPCId } from "@/world/sceneNPC/schema"
import type {SceneNPCExtendDoc} from "@/world/sceneNPC/extend"
import {
  Pencil,
  Trash2,
} from "lucide-react"
import { Button } from "~/components/ui/button"
import { useFetcher, Form } from "@remix-run/react";
import { CreateConfirm } from "~/lib/utils"

export default function SceneAnimationsScrollList({ children, sceneNPCExs, onEditSceneNPC }: {
  children?: React.ReactNode,
  sceneNPCExs: SceneNPCExtendDoc[],
  onEditSceneNPC: (id: SceneNPCId) => void
}) {
  const fetcher = useFetcher();
  const isDeleting = fetcher.state !== "idle";


  return (
    <div className="flex flex-col h-full">
      <div className="bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {children}
      </div>
      <ScrollArea className="h-full max-h-[calc(100vh-300px)]">
        <div className="flex flex-col gap-2 p-2 pt-0">
          {sceneNPCExs.map((item) => (
            <div
              key={item._id}
              // to={`/world/${worldId}/scene/${item._id}/animations`}
              className={cn(
                "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                // mail.selected === item._id && "bg-muted"
              )}
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center">
                  <div className="flex flex-1 items-center gap-2">
                    <div className="font-semibold">{item.name}</div>
                  </div>
                  <div className="flex justify-center items-center space-x-[4px]">
                    <Button variant="ghost" size="icon" className="w-4 h-4 flex justify-center items-center hover:bg-gray-300" onClick={() => {
                      onEditSceneNPC(item._id)
                    }} >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <fetcher.Form method="post"
                      action={`${item._id}/delete`}
                      onSubmit={CreateConfirm("Please confirm you want to delete this record.")}
                    >
                      <Button variant="ghost" size="icon" className="w-4 h-4 flex justify-center items-center hover:bg-gray-300" type="submit"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </fetcher.Form>
                  </div>
                </div>
                {/* <div className="text-xs font-medium">{item.name}</div> */}
              </div>
              <div>
                {item.characterEx.name}
              </div>
              <div className="line-clamp-2 text-xs text-muted-foreground">
                {item.x}x, {item.y}y, {item.w}w, {item.h}h
              </div>
              <div
                className={cn(
                  "ml-auto text-xs",
                  false
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {formatDistanceToNow(new Date(item._creationTime), {
                  addSuffix: true,
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      {/* <Separator />
      <div className="pt-2 pb-2">
      </div> */}
    </div>
  )
}