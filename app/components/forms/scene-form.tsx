import { Form } from "@remix-run/react";
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { FormErrorTip } from "~/components/form-error-tip"
import { type SceneDoc } from "@/world/scenes";
import { useToast } from "~/hooks/use-toast"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useEffect, useState } from "react";
import { z } from "zod";
import debounce from "debounce"

export default function SceneForm<T extends z.AnyZodObject>({ children, errors, scene, schema }: { children?: React.ReactNode, errors?: Record<string, any>, scene?: SceneDoc, schema: T }) {
  const { toast } = useToast()
  // console.log('errors=>', errors)
  const [innerErrors, setInnerErrors] = useState(errors)
  // console.log('innerErrors=>', innerErrors)

  const debouncedHandleChange = debounce((formData) => {
    const formPayload = Object.fromEntries(formData)
    const result = schema.safeParse(formPayload);
    setInnerErrors(result.success ? undefined : {...result.error.formErrors.fieldErrors})
  }, 200);

  function handleChange(e: React.FormEvent<HTMLFormElement>) {
    console.log('new FormData(e.currentTarget)=>', new FormData(e.currentTarget))
    debouncedHandleChange(new FormData(e.currentTarget));
  }

  useEffect(() => {
    if (errors?.["__err__"]) {
      toast({
        title: "create world error:",
        description: errors["__err__"],
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
              <Input id="name" name="name" defaultValue={scene?.name} placeholder="Name of your scene" className={innerErrors?.name ? "form-input-err" : undefined} />
              {innerErrors?.name ? <FormErrorTip tip={innerErrors.name} /> : null}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" name="desc" defaultValue={scene?.desc} placeholder="Description of your scene" />
            </div>
          </div>
        </div>
      </ScrollArea>
    </Form>
  )
}