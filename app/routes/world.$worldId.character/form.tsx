import { Form } from "@remix-run/react";
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { CharacterTable } from "@/world/characters";
import { SpritesheetTable } from "@/world/spritesheets";
import { useToast } from "~/hooks/use-toast"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import debounce from "debounce"
import Combobox, { useConvexCombox, type ConvexComboxItem } from "~/components/ui/combox"
import { FormProps, FormErrorTip, FormInfoTip } from "~/components/convex/form"
import { Slider } from "~/components/ui/slider"
import { convertFormDataToObject } from "~/lib/form";


export default function CharacterForm<S extends z.AnyZodObject>({ children, errors, doc, schema, onClientErrors }: FormProps<CharacterTable, S>) {
  const { toast } = useToast()
  const spritesheetCombox = useConvexCombox<SpritesheetTable>()
  const [spritesheetId, setSpritesheetId] = useState(doc?.spritesheetId)
  const [speed, setSpeed] = useState(doc?.speed ?? 0.1)
  const spritesheetIdInput = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function validateFormData(formData: FormData) {
    const formPayload = convertFormDataToObject(formData, { decimalKeys: ["speed"] })
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
              <Input id="name" name="name" defaultValue={doc?.name} placeholder="Name of your character" className={errors?.name ? "form-input-err" : undefined} />
              {errors?.name ? <FormErrorTip tip={errors.name} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Combobox errClass={errors?.spritesheetId ? "form-input-err" : undefined} {...spritesheetCombox} defaultItemKey={doc?.spritesheetId} onSelectChange={onComboxItemChange} />
              {errors?.spritesheetId ? <FormErrorTip tip={errors.spritesheetId} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="speed">Speed<span className="text-red-500">*</span> <FormInfoTip tip="speed of your character move" /></Label>
              <Slider
                name="speed"
                defaultValue={[speed]}
                min={0.01}
                max={2}
                step={0.1}
                onValueCommit={(value: number[]) => {
                  setSpeed(value[0])
                }}
              />
              {/* <InputRange /> */}
              {errors?.speed ? <FormErrorTip tip={errors.speed} /> : null}
            </div>
          </div>
        </div>
      </ScrollArea>
    </Form>
  )
}