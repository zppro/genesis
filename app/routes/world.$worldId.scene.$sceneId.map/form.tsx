import { Form } from "@remix-run/react";
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { SceneTable } from "@/world/scenes";
import { CharacterTable, CharacterExtendDoc } from "@/world/characters";
import { useToast } from "~/hooks/use-toast"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import Combobox, { ConvexComboxItem } from "~/components/ui/combox"
import { SlimFormProps, FormErrorTip } from "~/components/convex/form"
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
import { Plus, Save } from "lucide-react"
import { Checkbox } from "~/components/ui/checkbox"
import debounce from "debounce"
import { convertFormDataToObject } from "~/lib/form";

export type SetBlockLayersFormProps = SlimFormProps<SceneTable> & {
  checkItems: string[];
  isSubmitting: boolean;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const mergeNamePrefixs = ["blockLayers"]

export default function SetBlockLayersForm({ open, setOpen, isSubmitting, checkItems, children, errors, doc }: SetBlockLayersFormProps) {
  const { toast } = useToast()

  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (errors?.["__err__"]) {
      toast({
        title: "create error:",
        description: errors["__err__"],
        variant: "destructive",
      })
    }
    return () => { }
  }, [errors?.["__err__"]])

  // function validateFormData(formData: FormData) {
  //   const formPayload = convertFormDataToObject(formData, { mergeNamePrefixs })
  //   // form number
  //   console.log('validateFormData=>', formPayload)
  //   // const result = schema.safeParse(formPayload);
  //   return {}
  // }

  // const debouncedHandleChange = debounce((formData) => {
  //   validateFormData(formData)
  // }, 200);

  // function handleChange(e: React.FormEvent<HTMLFormElement>) {
  //   console.log('handle change for submit', new FormData(e.currentTarget))

  //   debouncedHandleChange(new FormData(e.currentTarget));
  // }

  return (

    <Sheet open={open} onOpenChange={(open) => { setOpen(open) }}>
      {children}
      <SheetContent>
        <Form ref={formRef} /*onChange={handleChange}*/ method={doc ? "put" : "POST"} className="flex flex-col h-full">
          <input name="id" type="hidden" defaultValue={doc?._id} />
          <SheetHeader>
            <SheetTitle>Set Block Layers Form</SheetTitle>
            <SheetDescription>
              Make changes to your block layers here. Click save when you're done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid py-4">
            <ScrollArea className="h-full max-h-[calc(100vh-200px)]">
              <div className="w-full p-2">
                <div className="grid w-full items-center gap-4">
                  {
                    checkItems.map((item, idx) =>
                      <div key={item} className="flex flex-col space-y-1.5">
                        <Checkbox id={item} name={`blockLayers.${idx}`} value={item}
                        defaultChecked={doc!.blockLayers?.includes(item)}
                        />
                        <Label htmlFor={item} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" >{item}</Label>
                      </div>
                    )
                  }
                </div>
              </div>
            </ScrollArea>
          </div>
          <SheetFooter>
            {/* <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose> */}
            <Button variant="ghost" className="border" type="submit" disabled={isSubmitting} >
              <Save className="h-4 w-4" />
              <span >{isSubmitting ? "Saving..." : "Save"}</span>
            </Button>
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>

  )
}