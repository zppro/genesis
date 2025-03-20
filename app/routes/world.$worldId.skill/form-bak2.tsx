import { Form } from "@remix-run/react";
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { SkillTable } from "@/world/skill/schema";
import { TextureTable } from "@/world/textures";
import { LLMTable } from "@/world/llms";
import { useToast } from "~/hooks/use-toast"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import debounce from "debounce"
import Combobox, { useConvexCombox, type ConvexComboxItem } from "~/components/ui/combox"
import { FormProps, FormErrorTip } from "~/components/convex/form"
import { convertFormDataToObject, FormItemFormatter } from "~/lib/form";
import { cn } from "~/lib/utils";
import JsonPretty from "~/components/ui/json-pretty";
import JSON5 from "json5";


export type SkillFormProps<S extends z.AnyZodObject> = FormProps<SkillTable, S> & {
  textureItems: ConvexComboxItem<TextureTable>[];
  llmItems: ConvexComboxItem<LLMTable>[];
}

export default function SkillForm<S extends z.AnyZodObject>({ children, errors, doc, schema, onClientErrors, textureItems, llmItems }: SkillFormProps<S>) {
  const { toast } = useToast()
  const [textureId, setTextureId] = useState(doc?.textureId)
  const [llmId, setLLMId] = useState(doc?.llmId)
  const textureIdInput = useRef<HTMLInputElement>(null);
  const llmIdInput = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function validateFormData(formData: FormData) {
    // const formPayload = convertFormDataToObject(formData)
    // if (typeof (formPayload.functionDef as Record<string, any>).schema === 'string') {
    //   const schemaRawVal = (formPayload.functionDef as Record<string, any>).schema as string
    //   (formPayload.functionDef as Record<string, any>).schema = JSON5.parse(schemaRawVal)
    // }
    // form number
    const formPayload = convertFormDataToObject(formData)
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

  function onTextureComboxItemChange(item: ConvexComboxItem<TextureTable>) {
    console.log(`==onComboxItemChange texture==`, item.key)
    textureIdInput.current!.value = item.key;
    const formData = new FormData(formRef.current!)
    onClientErrors(validateFormData(formData))
    setTextureId(item.key)
  }

  function onLLMComboxItemChange(item: ConvexComboxItem<LLMTable>) {
    console.log(`==onComboxItemChange llm==`, item.key)
    llmIdInput.current!.value = item.key;
    const formData = new FormData(formRef.current!)
    onClientErrors(validateFormData(formData))
    setLLMId(item.key)
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
      <input name="llmId" ref={llmIdInput} type="hidden" defaultValue={llmId} />
      <ScrollArea className="h-full max-h-[calc(100vh-100px)]">
        <div className="w-[350px] p-2">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name<span className="text-red-500">*</span></Label>
              <Input id="name" name="name" defaultValue={doc?.name} placeholder="Name of your skill" className={errors?.name ? "form-input-err" : undefined} />
              {errors?.name ? <FormErrorTip tip={errors.name} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Combobox errClass={errors?.textureId ? "form-input-err" : undefined}
                items={textureItems}
                defaultItemKey={doc?.textureId} onSelectChange={onTextureComboxItemChange} />
              {errors?.textureId ? <FormErrorTip tip={errors.textureId} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Combobox errClass={errors?.llmId ? "form-input-err" : undefined}
                items={llmItems}
                defaultItemKey={doc?.llmId} onSelectChange={onLLMComboxItemChange} />
              {errors?.llmId ? <FormErrorTip tip={errors.llmId} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="functionName">Function name</Label>
              <Input id="functionName" name="functionName" defaultValue={doc?.functionName}
                placeholder="Name of your skill function"
                className={errors?.functionName ? "form-input-err" : undefined}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="systemPrompt">System prompt</Label>
              <Textarea id="systemPrompt" name="systemPrompt" defaultValue={doc?.systemPrompt}
                placeholder="System Prompt of your skill function invoke"
                className={cn('h-12', (errors?.systemPrompt ? "form-input-err" : undefined))}
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </Form>
  )
}