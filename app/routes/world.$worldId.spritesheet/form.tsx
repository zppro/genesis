import { Form } from "@remix-run/react";
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { FormErrorTip } from "~/components/form-error-tip"
import { type SpritesheetDoc } from "@/world/spritesheets";
import { useToast } from "~/hooks/use-toast"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useEffect, useState } from "react";
import { z } from "zod";
import debounce from "debounce"

export default function SpritesheetForm<T extends z.AnyZodObject>({ children, errors, spritesheet, schema }: { children?: React.ReactNode, errors?: Record<string, any>, spritesheet?: SpritesheetDoc, schema: T }) {
  const { toast } = useToast()
  // console.log('errors=>', errors)
  const [innerErrors, setInnerErrors] = useState(errors)
  // console.log('innerErrors=>', innerErrors)

  const debouncedHandleChange = debounce((formData) => {
    const formPayload = Object.fromEntries(formData)
    const result = schema.safeParse(formPayload);
    setInnerErrors(result.success ? undefined : { ...result.error.formErrors.fieldErrors })
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
    <Form method="post" onChange={handleChange} className="flex flex-col h-full">
      {children}
      <ScrollArea className="h-full">

        <div className="w-[350px] p-2">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name<span className="text-red-500">*</span></Label>
              <Input id="name" name="name" defaultValue={spritesheet?.name} placeholder="Name of your spritesheet" className={innerErrors?.name ? "form-input-err" : undefined} />
              {innerErrors?.name ? <FormErrorTip tip={innerErrors.name} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="data">Spritesheet data</Label>
              <Textarea id="data" name="data" defaultValue={spritesheet?.data} className="h-96" placeholder="Description of your spritesheet" />
            </div>
          </div>
        </div>
      </ScrollArea>
    </Form>
  )
}