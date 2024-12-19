import { Form } from "@remix-run/react";
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { ObjectTable, OBJECT_TYPES } from "@/world/objects";
import { SpritesheetTable } from "@/world/spritesheets";
import { useToast } from "~/hooks/use-toast"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import debounce from "debounce"
import Combobox, { useConvexCombox, type ConvexComboxItem } from "~/components/ui/combox"
import { ConvexFormProps, FormErrorTip } from "~/components/convex/form"
import { convertFormDataToObject } from "~/lib/form";


export default function ObjectForm<S extends z.AnyZodObject>({ children, errors, doc, schema, onClientErrors }: ConvexFormProps<ObjectTable, S>) {
  const { toast } = useToast()
  const spritesheetCombox = useConvexCombox<SpritesheetTable>()
  const [spritesheetId, setSpritesheetId] = useState(doc?.spritesheetId)
  const spritesheetIdInput = useRef<HTMLInputElement>(null);
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

  function onComboxItemChange(item: ConvexComboxItem<SpritesheetTable>) {
    console.log(`==onComboxItemChange spritesheet==`, item.key)
    spritesheetIdInput.current!.value = item.key;
    const formData = new FormData(formRef.current!)
    onClientErrors(validateFormData(formData))
    setSpritesheetId(item.key)
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
      <input name="spritesheetId" ref={spritesheetIdInput} type="hidden" defaultValue={spritesheetId} />
      <ScrollArea className="h-full">
        <div className="w-[350px] p-2">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name<span className="text-red-500">*</span></Label>
              <Input id="name" name="name" defaultValue={doc?.name} placeholder="Name of your spritesheet" className={errors?.name ? "form-input-err" : undefined} />
              {errors?.name ? <FormErrorTip tip={errors.name} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <RadioGroup name="type" defaultValue={doc?.type || (OBJECT_TYPES.length && OBJECT_TYPES[0])}>
                {
                  OBJECT_TYPES.map(ty =>
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
              <Combobox errClass={errors?.spritesheetId ? "form-input-err" : undefined} {...spritesheetCombox} defaultItemKey={doc?.spritesheetId} onSelectChange={onComboxItemChange} />
              {errors?.spritesheetId ? <FormErrorTip tip={errors.spritesheetId} /> : null}
            </div>
          </div>
        </div>
      </ScrollArea>
    </Form>
  )
}