"use client"

import * as React from "react"
import { useState, useContext } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
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
import { type TextureId } from "@/world/textures"

export type TextureCombox = {
  defaultItemId?: TextureId;
  items: TextureComboxItem[];
}

const TextureComboxContext = React.createContext<TextureCombox>(
  undefined as unknown as TextureCombox,
);

export function useTextureCombox(): TextureCombox {
  return useContext(TextureComboxContext);
}

export const TextureComboxProvider: React.FC<{
  value: TextureCombox;
  children?: React.ReactNode;
}> = ({ value, children }) => {
  return React.createElement(
    TextureComboxContext.Provider,
    { value },
    children,
  );
};

export type TextureComboxItem = {
  textureId: TextureId;
  name: string;
  textureUrl: string;
}



export default function ComboboxForTexture({ errClass, items, defaultItemId, onSelectChange }: { errClass?: string, items?: TextureComboxItem[], defaultItemId?: TextureId, onSelectChange: (item: TextureComboxItem) => void; }) {
  const [open, setOpen] = useState(false)
  const defaultItem = items?.find(i => i.textureId === defaultItemId)
  const [selectItem, setSelectItem] = useState(defaultItem)

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
            ? items?.find((item) => item.textureId === selectItem.textureId)?.name
            : "Select textures..." + defaultItemId}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search texture..." className="h-9" />
          <CommandList>
            <CommandEmpty>No texture found.</CommandEmpty>
            <CommandGroup>
              {items?.map((item) => (
                <CommandItem
                  key={item.textureId}
                  value={item.name}
                  onSelect={(currentValue) => {
                    const v = items?.find(i => i.name === currentValue)
                    if (selectItem?.textureId !== v?.textureId) {
                      setSelectItem(v)
                      v && onSelectChange(v)
                    }
                    setOpen(false)
                  }}
                >
                  <img src={item.textureUrl} className="list-image-file" />
                  {item.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectItem?.name === item.name ? "opacity-100" : "opacity-0"
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
