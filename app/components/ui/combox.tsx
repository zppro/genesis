"use client"

import * as React from "react"
import { useState, useContext } from "react"
import { Check, ChevronsUpDown, LucideIcon } from "lucide-react"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Id } from "@/_generated/dataModel"
import { ConvexTables } from "../convex/type"

/* start obsolete component 可能在同一个route中有多个，所以不能用context来传递数据 */
export type ConvexCombox<T extends ConvexTables> = {
  defaultItemKey?: Id<T>;
  items: ConvexComboxItem<T>[];
}

const ConvexComboxContext = React.createContext<ConvexCombox<any>>(
  undefined as unknown as ConvexCombox<any>,
);
export function useConvexCombox<T extends ConvexTables>(): ConvexCombox<T> {
  return useContext(ConvexComboxContext);
}
export const ConvexComboxProvider = <T extends ConvexTables>({ value, children }: {
  value: ConvexCombox<T>;
  children?: React.ReactNode;
}) => {
  return React.createElement(
    ConvexComboxContext.Provider,
    { value },
    children,
  );
};
/* end obsolete component 可能在同一个route中有多个，所以不能用context来传递数据 */

export type ConvexComboxItem<T extends ConvexTables> = {
  key: Id<T>;
  text: string;
  icon?: string | LucideIcon;
}

export type ComboxProps<T extends ConvexTables> = {
  errClass?: string;
  items?: ConvexComboxItem<T>[];
  defaultItemKey?: Id<T>;
  onSelectChange: (item: ConvexComboxItem<T>) => void;
}

export default function Combox<T extends ConvexTables>({ errClass, items, defaultItemKey, onSelectChange }: ComboxProps<T>) {
  const [open, setOpen] = useState(false)
  const defaultItem = items?.find(i => i.key === defaultItemKey)
  const [selectItem, setSelectItem] = useState(defaultItem)
  console.log(items)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', errClass)}
        >
          {selectItem
            ? items?.find((item) => item.key === selectItem.key)?.text
            : "Select item..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search data..." className="h-9" />
          <CommandList>
            <CommandEmpty>No data found.</CommandEmpty>
            <CommandGroup>
              {items?.map((item) => (
                <CommandItem
                  key={item.key}
                  value={item.text}
                  onSelect={(currentValue) => {
                    const v = items?.find(i => i.text === currentValue)
                    if (selectItem?.key !== v?.key) {
                      setSelectItem(v)
                      v && onSelectChange(v)
                    }
                    setOpen(false)
                  }}
                >
                  {
                    item.icon &&
                    (
                      (typeof item.icon === 'string') ?
                        <img src={item.icon} className="list-image-file" />
                        :
                        <item.icon />
                    )
                  }
                  {item.text}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectItem?.text === item.text ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
