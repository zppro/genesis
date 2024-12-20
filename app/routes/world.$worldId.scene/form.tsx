import { Form } from "@remix-run/react";
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { FormProps, FormErrorTip } from "~/components/convex/form"
import { useToast } from "~/hooks/use-toast"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import debounce from "debounce"
import { SceneTable } from "@/world/scenes"
import { ResouceTable } from "@/world/resources"
import Combobox, { ConvexComboxItem } from "~/components/ui/combox"
import { convertFormDataToObject } from "~/lib/form";

export type SceneFormProp<S extends z.AnyZodObject> = FormProps<SceneTable, S> & {
  tilesetItems: ConvexComboxItem<ResouceTable>[];
  tilemapItems: ConvexComboxItem<ResouceTable>[];
}
export const numberKeys = ["tiledim", "screenxtiles", "screenytiles", "tilesetpxw", "tilesetpxh"];

export default function SceneForm<S extends z.AnyZodObject>({
  children,
  errors,
  doc,
  schema,
  onClientErrors,
  tilesetItems,
  tilemapItems,
}: SceneFormProp<S>) {
  const { toast } = useToast()

  const [tilesetId, setTilesetId] = useState(doc?.tilesetId)
  const [tilemapId, setTilemapId] = useState(doc?.tilemapId)
  const tilesetIdInput = useRef<HTMLInputElement>(null);
  const tilemapIdInput = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function validateFormData(formData: FormData) {
    const formPayload = convertFormDataToObject(formData, { numberKeys })
    // form number
    console.log('validateFormData=>', formPayload)
    const result = schema.safeParse(formPayload);
    return { ...result.error?.formErrors.fieldErrors }
  }

  const debouncedHandleChange = debounce((formData) => {
    onClientErrors(validateFormData(formData))
  }, 200);
  function handleChange(e: React.FormEvent<HTMLFormElement>) {
    debouncedHandleChange(new FormData(e.currentTarget));
  }

  function onTilesetComboxItemChange(item: ConvexComboxItem<ResouceTable>) {
    console.log(`==onTilesetComboxItemChange tileset==`, item.key)
    tilesetIdInput.current!.value = item.key;
    const formData = new FormData(formRef.current!)
    onClientErrors(validateFormData(formData))
    setTilesetId(item.key)
  }

  function onTilemapComboxItemChange(item: ConvexComboxItem<ResouceTable>) {
    console.log(`==onTilemapComboxItemChange tilemap==`, item.key)
    tilemapIdInput.current!.value = item.key;
    const formData = new FormData(formRef.current!)
    onClientErrors(validateFormData(formData))
    setTilemapId(item.key)
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

  return (
    <Form method="post" ref={formRef} onChange={handleChange} className="flex flex-col h-full">
      {children}
      <input name="tilesetId" ref={tilesetIdInput} type="hidden" defaultValue={tilesetId} />
      <input name="tilemapId" ref={tilemapIdInput} type="hidden" defaultValue={tilemapId} />
      <ScrollArea className="h-full">
        <div className="w-[350px] p-2">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name<span className="text-red-500">*</span></Label>
              <Input id="name" name="name" defaultValue={doc?.name} placeholder="Name of your scene" className={errors?.name ? "form-input-err" : undefined} />
              {errors?.name ? <FormErrorTip tip={errors.name} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Combobox errClass={errors?.tilesetId ? "form-input-err" : undefined}
                items={tilesetItems}
                defaultItemKey={doc?.tilesetId}
                onSelectChange={onTilesetComboxItemChange} />
              {errors?.tilesetId ? <FormErrorTip tip={errors.tilesetId} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Combobox errClass={errors?.tilemapId ? "form-input-err" : undefined}
                items={tilemapItems}
                defaultItemKey={doc?.tilemapId}
                onSelectChange={onTilemapComboxItemChange} />
              {errors?.tilemapId ? <FormErrorTip tip={errors.tilemapId} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="tiledim">Tile dimension<span className="text-red-500">*</span></Label>
              <Input id="tiledim" name="tiledim" type="number" min={1} defaultValue={doc?.tiledim} placeholder="Dimension of your scene map" className={errors?.tiledim ? "form-input-err" : undefined} />
              {errors?.tiledim ? <FormErrorTip tip={errors.tiledim} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="screenxtiles">Screen x tiles<span className="text-red-500">*</span></Label>
              <Input id="screenxtiles" name="screenxtiles" type="number" min={1} defaultValue={doc?.screenxtiles} placeholder="screen x axis tiles of your scene map" className={errors?.screenxtiles ? "form-input-err" : undefined} />
              {errors?.screenxtiles ? <FormErrorTip tip={errors.screenxtiles} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="screenytiles">Screen y tiles<span className="text-red-500">*</span></Label>
              <Input id="screenytiles" name="screenytiles" type="number" min={1} defaultValue={doc?.screenytiles} placeholder="screen y axis tiles of your scene map" className={errors?.screenytiles ? "form-input-err" : undefined} />
              {errors?.screenytiles ? <FormErrorTip tip={errors.screenytiles} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="tilesetpxw">Tileset width<span className="text-red-500">*</span></Label>
              <Input id="tilesetpxw" name="tilesetpxw" type="number" min={1} defaultValue={doc?.tilesetpxw} placeholder="tileset width of your scene map" className={errors?.tilesetpxw ? "form-input-err" : undefined} />
              {errors?.tilesetpxw ? <FormErrorTip tip={errors.tilesetpxw} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="tilesetpxh">Tileset height<span className="text-red-500">*</span></Label>
              <Input id="tilesetpxh" name="tilesetpxh" type="number" min={1} defaultValue={doc?.tilesetpxh} placeholder="tileset height of your scene map" className={errors?.tilesetpxh ? "form-input-err" : undefined} />
              {errors?.tilesetpxh ? <FormErrorTip tip={errors.tilesetpxh} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" name="desc" defaultValue={doc?.desc} placeholder="Description of your scene" />
            </div>
          </div>
        </div>
      </ScrollArea>
    </Form>
  )
}
