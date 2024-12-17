import { Form } from "@remix-run/react";
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { FormErrorTip } from "~/components/form-error-tip"
import { type SpritesheetDoc } from "@/world/spritesheets";
import { useToast } from "~/hooks/use-toast"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import { cn } from "~/lib/utils";
import debounce from "debounce"

import ComboboxForTexture from "./combox-for-texture"
import { useTextureCombox, type TextureComboxItem } from "~/routes/world.$worldId.spritesheet/combox-for-texture"
export type SpritesheetFormProps<T extends z.AnyZodObject> = {
  children?: React.ReactNode;
  errors?: Record<string, any>;
  spritesheet?: SpritesheetDoc;
  schema: T;
  onValidateFormData: (formData: FormData) => void;
  // onSubmitChange: (e: React.FormEvent<HTMLFormElement>) => void;
}
export default function SpritesheetForm<T extends z.AnyZodObject>({ children, errors, spritesheet, schema, onValidateFormData }: SpritesheetFormProps<T>) {
  const { toast } = useToast()
  const textureCombox = useTextureCombox()
  console.log('errors0=>', errors)
  const [textureId, setTextureId] = useState(spritesheet?.textureId)
  const textureIdInput = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const debouncedHandleChange = debounce(onValidateFormData, 200);

  function handleChange(e: React.FormEvent<HTMLFormElement>) {
    debouncedHandleChange(new FormData(e.currentTarget));
  }

  function onTextureChange(item: TextureComboxItem) {
    console.log('==onTextureChange==')
    textureIdInput.current!.value = item.textureId;
    onValidateFormData(new FormData(formRef.current!))
    // textureIdInput.current?.dispatchEvent(new Event('change', { bubbles: true }))
    setTextureId(item.textureId)
    // setInnerErrors({ ...innerErrors, textureId: 'dsdf' })
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
    <Form method="post" ref={formRef} onChange={handleChange} onSubmit={() => { console.log('===onSubmit===') }} className="flex flex-col h-full">
      {children}
      <input name="textureId" ref={textureIdInput} type="hidden" defaultValue={textureId} />
      <ScrollArea className="h-full">
        <div className="w-[350px] p-2">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name<span className="text-red-500">*</span></Label>
              <Input id="name" name="name" defaultValue={spritesheet?.name} placeholder="Name of your spritesheet" className={errors?.name ? "form-input-err" : undefined} />
              {errors?.name ? <FormErrorTip tip={errors.name} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <ComboboxForTexture errClass={errors?.textureId ? "form-input-err" : undefined} {...textureCombox} defaultItemId={spritesheet?.textureId} onSelectChange={onTextureChange} />
              {errors?.textureId ? <FormErrorTip tip={errors.textureId} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="data">Spritesheet data</Label>
              <Textarea id="data" name="data" defaultValue={spritesheet?.data}
                className={cn('h-96', errors?.data ? "form-input-err" : undefined)}
                placeholder="Description of your spritesheet" />
              {errors?.data ? <FormErrorTip tip={errors.data} /> : null}
            </div>
          </div>
        </div>
      </ScrollArea>
    </Form>
  )
}