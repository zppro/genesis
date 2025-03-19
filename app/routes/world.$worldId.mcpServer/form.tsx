import { Form } from "@remix-run/react";
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Textarea } from "~/components/ui/textarea"
import { McpServerTable, MCPSERVER_TYPES } from "@/world/mcpServer/schema";
import { useToast } from "~/hooks/use-toast"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import debounce from "debounce"
import { FormProps, FormErrorTip } from "~/components/convex/form"
import { convertFormDataToObject } from "~/lib/form";


export default function SkillForm<S extends z.AnyZodObject>({ children, errors, doc, schema, onClientErrors }: FormProps<McpServerTable, S>) {
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null);

  function validateFormData(formData: FormData) {
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
      <ScrollArea className="h-full max-h-[calc(100vh-100px)]">
        <div className="w-[350px] p-2">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name<span className="text-red-500">*</span></Label>
              <Input id="name" name="name" defaultValue={doc?.name} placeholder="Name of mcpServer" className={errors?.name ? "form-input-err" : undefined} />
              {errors?.name ? <FormErrorTip tip={errors.name} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <RadioGroup name="type" defaultValue={doc?.type || (MCPSERVER_TYPES.length && MCPSERVER_TYPES[0])}>
                {
                  MCPSERVER_TYPES.map(ty =>
                    <div key={ty} className="flex items-center space-x-2">
                      <RadioGroupItem value={ty} id={ty} />
                      <Label htmlFor={ty}>{ty}</Label>
                    </div>
                  )
                }
              </RadioGroup>
              {errors?.type ? <FormErrorTip tip={errors.type} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="url">Url</Label>
              <Input id="url" name="url" defaultValue={doc?.url}
                placeholder="url of your mcp server(sse url)"
                className={errors?.url ? "form-input-err" : undefined}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" name="desc" 
              defaultValue={doc?.desc} placeholder="Description of mcpServer" />
            </div>
          </div>
        </div>
      </ScrollArea>
    </Form>
  )
}