import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label"
import { useToast } from "~/hooks/use-toast"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useEffect, useState, useRef } from "react";
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
import { Button } from "~/components/ui/button"
import type { McpServerToolDoc } from "@/world/mcpServerTool/schema"
import { Check } from "lucide-react"
import { useQueries } from "convex/react";
import { api } from "@/_generated/api";
import CheckboxTree from 'react-checkbox-tree';

export type SelectToolsProps<T> = {
  children?: React.ReactNode;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onSelect: (selectedItem: T[]) => void
}

export default function SelectTools<T>({ open, setOpen, onSelect, children }: SelectToolsProps<T>) {
  const [checked, setChecked] = useState<string[]>(["phobos"]);
  const [expanded, setExpanded] = useState<string[]>(["mars"]);
  
  
  const nodes = [{
    value: 'mars',
    label: 'Mars',
    children: [
      { value: 'phobos', label: 'Phobos' },
      { value: 'deimos', label: 'Deimos' },
    ],
  }];

  function handleSelectToolClick() {
    onSelect(checked as any)
  }

  return (
    <Sheet open={open} onOpenChange={(open) => { setOpen(open) }}>
      {children}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Select Tool Sheet</SheetTitle>
          <SheetDescription>
            Select McpServer Tools
          </SheetDescription>
        </SheetHeader>
        <div className="grid py-4">
          <ScrollArea className="h-full max-h-[calc(100vh-200px)]">
            <div className="w-full p-2">
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="filter">McpServerTools</Label>
                  <Input id="filter" name="filter"
                    placeholder="filter"
                  />
                  <CheckboxTree
                    nodes={nodes}
                    checked={checked}
                    expanded={expanded}
                    onCheck={(checked) => setChecked(checked)}
                    onExpand={(expanded) => setExpanded(expanded)}
                    showNodeIcon={false}
                  />
                </div>
              </div>
            </div>
            {checked}
          </ScrollArea>
        </div>
        <SheetFooter>
          {/* <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose> */}
          <Button variant="ghost"
            className="border"
            onClick={handleSelectToolClick}
          >
            <Check className="h-4 w-4" />
            <span >Select</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>

  )
}