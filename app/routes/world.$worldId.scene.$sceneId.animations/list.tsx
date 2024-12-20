
import { ScrollArea } from "~/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { cn } from "~/lib/utils"
import { Link, useRouteLoaderData } from "@remix-run/react";
import { type SceneDoc } from "@/world/scenes"
import { WorldId } from "@/worlds";
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

export default function SceneAnimationsScrollList({ worldId, scenes }: { worldId: WorldId, scenes: SceneDoc[] }) {

  return (
    <div className="flex flex-col h-full">
      <div className="bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search" className="pl-8" />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="link" size="icon" className="absolute  right-2 top-2.5 h-4 w-4"><Plus className="size-4" /></Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Edit profile</SheetTitle>
                  <SheetDescription>
                    Make changes to your profile here. Click save when you're done.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" value="Pedro Duarte" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Username
                    </Label>
                    <Input id="username" value="@peduarte" className="col-span-3" />
                  </div>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button type="submit">Save changes</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            {/* <Link to={`/world/${worldId}/object/new`} className="absolute  right-2 top-2.5 h-4 w-4"><Plus className="size-4" /></Link> */}
          </div>
        </form>
      </div>
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-2 p-4 pt-0">
          {scenes.map((item) => (
            <Link
              key={item._id}
              to={`/world/${worldId}/scene/${item._id}/animations`}
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
      {/* <Separator />
      <div className="pt-2 pb-2">
      </div> */}
    </div>
  )
}