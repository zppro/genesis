
import { ScrollArea } from "~/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { Separator } from "~/components/ui/separator"
import { cn } from "~/lib/utils"
import { Link, useRouteLoaderData } from "@remix-run/react";
import { type SceneDoc } from "@/world/scenes"
import { loader } from "~/routes/world.$worldId.scene"
import { useState } from "react";

export default function SceneScrollList({ scenes }: { scenes: SceneDoc[] }) {
  const { worldId } = useRouteLoaderData<typeof loader>("routes/world.$worldId.scene")!;

  // const [currentSceneId, setCurrentSceneId] = useState()
  // const worldId = "aaa"
  // const mail = { selected: "" }
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {scenes.map((item) => (
          <Link
            key={item._id}
            to={`/world/${worldId}/scene/${item._id}`}
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
              {item.desc?.substring(0, 300)}
            </div>
          </Link>
        ))}
      </div>
    </ScrollArea>
  )
}