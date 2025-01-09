import { Form } from "@remix-run/react";
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { SceneAnimationTable } from "@/world/sceneAnimations";
import { ObjectTable } from "@/world/objects";
import { useToast } from "~/hooks/use-toast"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import debounce from "debounce"
import Combobox, { ConvexComboxItem } from "~/components/ui/combox"
import { FormProps, FormErrorTip } from "~/components/convex/form"
import { convertFormDataToObject } from "~/lib/form";
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
import { SpritesheetDoc } from "@/world/spritesheets";
import { PixiSpritesheet } from "@/shared/spritesheet";
import JSON5 from "json5"

export const numberKeys = ["x", "y", "w", "h"];
export const decimalKeys = ["speed"];

export type SceneAnimationFormProps<S extends z.AnyZodObject> = FormProps<SceneAnimationTable, S> & {
  objectItems: ConvexComboxItem<ObjectTable>[];
  isSubmitting: boolean;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function SceneAnimationForm<S extends z.AnyZodObject>({ open, setOpen, isSubmitting, objectItems, children, errors, doc, schema, onClientErrors }: SceneAnimationFormProps<S>) {
  const { toast } = useToast()
  const [objectId, setObjectId] = useState(doc?.objectId)
  const objectIdInput = useRef<HTMLInputElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const animationInput = useRef<HTMLInputElement>(null);
  const wInput = useRef<HTMLInputElement>(null);
  const hInput = useRef<HTMLInputElement>(null);
  const speedInput = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function validateFormData(formData: FormData) {
    const formPayload = convertFormDataToObject(formData, { numberKeys, decimalKeys })
    // form number
    console.log('validateFormData=>', formPayload)
    const result = schema.safeParse(formPayload);
    console.error("result=>", result.error?.formErrors.fieldErrors)
    return { ...result.error?.formErrors.fieldErrors }
  }

  const debouncedHandleChange = debounce((formData) => {
    onClientErrors(validateFormData(formData))
  }, 200);
  function handleChange(e: React.FormEvent<HTMLFormElement>) {
    console.log('handle change for submit')
    debouncedHandleChange(new FormData(e.currentTarget));
  }

  function onComboxItemChange(item: ConvexComboxItem<ObjectTable>) {
    console.log(`==onComboxItemChange object==`, item.key)
    objectIdInput.current!.value = item.key;
    if (!nameInput.current!.value) {
      nameInput.current!.value = item.text
    }
    const data = JSON5.parse((item.data as SpritesheetDoc).data) as PixiSpritesheet

    if (!animationInput.current!.value) {
      animationInput.current!.value = Object.keys(data.animations!)[0]
    }

    const key = Object.keys(data.frames)[0]
    const { w, h } = data.frames[key].frame
    if (!wInput.current!.value) {
      wInput.current!.value = w.toString()
    }
    if (!hInput.current!.value) {
      hInput.current!.value = h.toString()
    }
    const formData = new FormData(formRef.current!)
    onClientErrors(validateFormData(formData))
    setObjectId(item.key)
  }

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

  useEffect(() => {
    if (doc) {
      setObjectId(doc.objectId)
      // console.log('set default objectid 1:', doc.objectId)
    } else {
      setObjectId(undefined)
    }
  }, [doc])

  return (

    <Sheet open={open} onOpenChange={(open) => { setOpen(open) }}>
      {children}
      <SheetContent>
        <Form method={doc ? "put" : "POST"} ref={formRef} onChange={handleChange} className="flex flex-col h-full">
          <input name="objectId" ref={objectIdInput} type="hidden" defaultValue={objectId} />
          <input name="id" type="hidden" defaultValue={doc?._id} />
          <SheetHeader>
            <SheetTitle>Scene Animation Form</SheetTitle>
            <SheetDescription>
              Make changes to your scene animation here. Click save when you're done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid py-4">
            <ScrollArea className="h-full max-h-[calc(100vh-200px)]">
              <div className="w-full p-2">
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Name<span className="text-red-500">*</span></Label>
                    <Input id="name" ref={nameInput} name="name" defaultValue={doc?.name} placeholder="Name of your scene animation" className={errors?.name ? "form-input-err" : undefined} />
                    {errors?.name ? <FormErrorTip tip={errors.name} /> : null}
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="animation">Animation Name<span className="text-red-500">*</span></Label>
                    <Input id="animation" ref={animationInput} name="animation" defaultValue={doc?.animation} placeholder="Animation name in your scene animation spritesheet" className={errors?.animation ? "form-input-err" : undefined} />
                    {errors?.animation ? <FormErrorTip tip={errors.animation} /> : null}
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Combobox errClass={errors?.objectId ? "form-input-err" : undefined}
                      items={objectItems}
                      defaultItemKey={doc?.objectId}
                      onSelectChange={onComboxItemChange} />
                    {errors?.objectId ? <FormErrorTip tip={errors.objectId} /> : null}
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="x">X axis in scene map<span className="text-red-500">*</span></Label>
                    <Input id="x" name="x" type="number" min={1} defaultValue={doc?.x} placeholder="x axis in scene map of your scene animation" className={errors?.x ? "form-input-err" : undefined} />
                    {errors?.x ? <FormErrorTip tip={errors.x} /> : null}
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="y">Y axis in scene map<span className="text-red-500">*</span></Label>
                    <Input id="y" name="y" type="number" min={1} defaultValue={doc?.y} placeholder="y axis in scene map of your scene animation" className={errors?.y ? "form-input-err" : undefined} />
                    {errors?.y ? <FormErrorTip tip={errors.y} /> : null}
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="w">Width<span className="text-red-500">*</span></Label>
                    <Input id="w" ref={wInput} name="w" type="number" min={1} defaultValue={doc?.w} placeholder="width of your scene animation" className={errors?.w ? "form-input-err" : undefined} />
                    {errors?.w ? <FormErrorTip tip={errors.w} /> : null}
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="h">Height<span className="text-red-500">*</span></Label>
                    <Input id="h" ref={hInput} name="h" type="number" min={1} defaultValue={doc?.h} placeholder="height of your scene animation" className={errors?.h ? "form-input-err" : undefined} />
                    {errors?.h ? <FormErrorTip tip={errors.h} /> : null}
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="speed">Speed<span className="text-red-500">*</span></Label>
                    <Input id="speed" ref={speedInput} name="speed" type="number" min={0} step={0.05} max={2} defaultValue={doc?.speed || 0.1} placeholder="height of your scene animation" className={errors?.speed ? "form-input-err" : undefined} />
                    {errors?.speed ? <FormErrorTip tip={errors.speed} /> : null}
                  </div>
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