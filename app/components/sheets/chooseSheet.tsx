import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label"
import { useToast } from "~/hooks/use-toast"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useEffect, useState, useRef, useMemo } from "react";
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
import { Check } from "lucide-react"
import CheckboxTree, { Node as RawNode } from 'react-checkbox-tree';
import { flat } from "~/lib/utils";

export type Node = RawNode;

export type ChooseSheetProps = {
  children?: React.ReactNode;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  checkModel?: "leaf" | "all";
  nodes: Node[];
  defaultChecked?: string[]
  onChoosen: (choosen: Node[]) => void
}



export default function ChooseSheet({ open, setOpen, defaultChecked = [], checkModel = "leaf", nodes, onChoosen, children }: ChooseSheetProps) {
  const defaultExpanded = nodes.filter(n => n.children?.some(sn => defaultChecked.includes(sn.value))).map(n => n.value)
  const [checked, setChecked] = useState<string[]>(defaultChecked);
  const [expanded, setExpanded] = useState<string[]>(defaultExpanded);

  const flatNodes = useMemo(
    () => flat(nodes),
    [nodes]
  )
  // function flat(nodes: Node[]) {
  //   return nodes.reduce((acc: Node[], n)=>{
  //     if (n.children) {
  //       acc.push(n)
  //       acc.push(...flat(n.children))
  //     } else {
  //       acc.push(n)
  //     }
  //     return acc
  //   }, [])
  // }

  // const nodes = [{
  //   value: 'mars',
  //   label: 'Mars',
  //   children: [
  //     { value: 'phobos', label: 'Phobos' },
  //     { value: 'deimos', label: 'Deimos' },
  //   ],
  // }];

  function handleSelectToolClick() {
    const checkedNodes = flatNodes.filter(n => checked.includes(n.value))
    // cosnt checkedNodes = checked.map(v => nodes.find(v ))
    onChoosen(checkedNodes)
    setOpen(false)
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
                    checkModel={checkModel}
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
            <span >Ok</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>

  )
}