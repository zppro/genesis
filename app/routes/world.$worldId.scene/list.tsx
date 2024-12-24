
import { ScrollArea } from "~/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { Separator } from "~/components/ui/separator"
import { cn } from "~/lib/utils"
import { Link, useRouteLoaderData } from "@remix-run/react";
import { type SceneDoc } from "@/world/scenes"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination"
import { Input } from "~/components/ui/input"
import { Search, Plus } from "lucide-react"
import { WorldId } from "@/worlds";

export default function SceneScrollList({ worldId, scenes }: { worldId: WorldId, scenes: SceneDoc[] }) {
  // const { worldId } = useRouteLoaderData<typeof loader>("routes/world.$worldId.scene")!;
  return (
    <div className="flex flex-col h-full">
      <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search" className="pl-8" />
            <Link to={`/world/${worldId}/scene/new`} className="absolute  right-2 top-2.5 h-4 w-4"><Plus className="size-4" /></Link>
          </div>
        </form>
      </div>
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
                --
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
      <Separator />
      <div className="pt-2 pb-2">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            {/* <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem> */}
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}