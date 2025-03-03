import { Form } from "@remix-run/react";
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { SkillTable } from "@/world/skill/schema";
import { TextureTable } from "@/world/textures";
import { useToast } from "~/hooks/use-toast"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import debounce from "debounce"
import Combobox, { useConvexCombox, type ConvexComboxItem } from "~/components/ui/combox"
import { FormProps, FormErrorTip } from "~/components/convex/form"
import { convertFormDataToObject } from "~/lib/form";
import { cn } from "~/lib/utils";


export default function SkillForm<S extends z.AnyZodObject>({ children, errors, doc, schema, onClientErrors }: FormProps<SkillTable, S>) {
  const { toast } = useToast()
  const textureCombox = useConvexCombox<TextureTable>()
  const [textureId, setTextureId] = useState(doc?.textureId)
  const textureIdInput = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function validateFormData(formData: FormData) {
    const formPayload = convertFormDataToObject(formData)
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

  function onComboxItemChange(item: ConvexComboxItem<TextureTable>) {
    console.log(`==onComboxItemChange texture==`, item.key)
    textureIdInput.current!.value = item.key;
    const formData = new FormData(formRef.current!)
    onClientErrors(validateFormData(formData))
    setTextureId(item.key)
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
      <input name="textureId" ref={textureIdInput} type="hidden" defaultValue={textureId} />
      <ScrollArea className="h-full">
        <div className="w-[350px] p-2">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name<span className="text-red-500">*</span></Label>
              <Input id="name" name="name" defaultValue={doc?.name} placeholder="Name of your skill" className={errors?.name ? "form-input-err" : undefined} />
              {errors?.name ? <FormErrorTip tip={errors.name} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Combobox errClass={errors?.textureId ? "form-input-err" : undefined} {...textureCombox} defaultItemKey={doc?.textureId} onSelectChange={onComboxItemChange} />
              {errors?.textureId ? <FormErrorTip tip={errors.textureId} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" name="desc" defaultValue={doc?.desc} placeholder="Description of your skill"
                className={cn('h-96', errors?.desc ? "form-input-err" : undefined)}
              />
              {errors?.desc ? <FormErrorTip tip={errors.desc} /> : null}
            </div>
          </div>
        </div>
      </ScrollArea>
    </Form>
  )
}