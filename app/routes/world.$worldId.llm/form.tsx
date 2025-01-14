import { Form } from "@remix-run/react";
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { LLMTable } from "@/world/llms";
import { useToast } from "~/hooks/use-toast"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import debounce from "debounce"
import { FormProps, FormErrorTip, FormInfoTip } from "~/components/convex/form"
import { Slider } from "~/components/ui/slider"
import { convertFormDataToObject } from "~/lib/form";


export default function LLMForm<S extends z.AnyZodObject>({ children, errors, doc, schema, onClientErrors }: FormProps<LLMTable, S>) {
  const { toast } = useToast()
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
      <ScrollArea className="h-full">
        <div className="w-[350px] p-2">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name<span className="text-red-500">*</span></Label>
              <Input id="name" name="name" defaultValue={doc?.name} placeholder="Name of your llm" className={errors?.name ? "form-input-err" : undefined} />
              {errors?.name ? <FormErrorTip tip={errors.name} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="baseUrl">Base Url<span className="text-red-500">*</span></Label>
              <Input id="baseUrl" name="baseUrl" defaultValue={doc?.baseUrl} placeholder="Endpoint of llm model invoke" className={errors?.baseUrl ? "form-input-err" : undefined} />
              {errors?.baseUrl ? <FormErrorTip tip={errors?.baseUrl} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="apiKeyName">Api Key Name<span className="text-red-500">*</span></Label>
              <Input id="apiKeyName" name="apiKeyName" defaultValue={doc?.apiKeyName} placeholder="api key name as enviroment variable of llm model" className={errors?.apiKeyName ? "form-input-err" : undefined} />
              {errors?.apiKeyName ? <FormErrorTip tip={errors?.apiKeyName} /> : null}
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