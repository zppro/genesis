
import { ScrollArea } from "~/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { cn } from "~/lib/utils"
import { Link, useRouteLoaderData } from "@remix-run/react";
import { type SceneAnimationExtendDoc } from "@/world/sceneAnimations"
import { SceneId } from "@/world/scenes";
import { Separator } from "~/components/ui/separator"
import { Input } from "~/components/ui/input"
import { Search, Plus } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet"
// import SceneAnimationForm from "~/routes/world.$worldId.scene.$sceneId.animations/form"

export default function SceneAnimationsScrollList({ children, sceneAnimationExs }: { children?: React.ReactNode, sceneAnimationExs: SceneAnimationExtendDoc[] }) {

  return (
    <div className="flex flex-col h-full">
      <div className="bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {children}
      </div>
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-2 p-4 pt-0">
          {sceneAnimationExs.map((item) => (
            <Button
              key={item._id}
              // to={`/world/${worldId}/scene/${item._id}/animations`}
              className={cn(
                "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                // mail.selected === item._id && "bg-muted"
              )}
            >
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
                    {formatDistanceToNow(new Date(item._creationTime), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <div className="text-xs font-medium">{item.name}</div>
              </div>
              <div className="line-clamp-2 text-xs text-muted-foreground">
                --
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
      {/* <Separator />
      <div className="pt-2 pb-2">
      </div> */}
    </div>
  )
}