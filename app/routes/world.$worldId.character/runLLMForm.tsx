import { Form } from "@remix-run/react";
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label"
import { useToast } from "~/hooks/use-toast"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import debounce from "debounce"
import Combobox, { ConvexComboxItem } from "~/components/ui/combox"
import { FormProps, FormErrorTip, useFormError } from "~/components/convex/form"
import { convertFormDataToObject } from "~/lib/form";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet"
import { Button } from "~/components/ui/button"
import { Plus, Play } from "lucide-react"
import { SpritesheetDoc } from "@/world/spritesheets";
import { PixiSpritesheet } from "@/shared/spritesheet";
import JSON5 from "json5"
import { LLMId, LLMTable } from "@/world/llms";
import { FormErrors } from "~/components/convex/type";
import { ClientErrors } from "~/components/convex/type";

export type RunLLMFormProps<S extends z.AnyZodObject> = {
  userInput: string;
  schema: S;
  onClientErrors: (clientErrors: ClientErrors) => void;
  children?: React.ReactNode;
  errors?: FormErrors;
  llmItems: ConvexComboxItem<LLMTable>[];
  isSubmitting: boolean;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setResult: (ret: any) => void
}

export default function RunLLMForm<S extends z.AnyZodObject>({ open, setOpen, isSubmitting, llmItems, userInput, schema, onClientErrors, children, errors }: RunLLMFormProps<S>) {
  const { toast } = useToast()
  const systemPrompt = `你是一个游戏的剧作家，根据以下橘色人物小传，从中提取或者补完一些角色的基本设定
# 设定包括:
姓名(name)、年龄(age)、性别(gender)、职业(profession)、个性(personality)
# 最后结果仅输出设定，格式是json，注意输出的json文件里的key显示英文，value显示中文
# 个性字段输出格式必须是数组
#年龄字段输出格式必须数字
#性别字段输出的取值范围是["男", "女","未知"]中的一个
# 如果是小传是英文，翻译成中文再处理

### 人物小传：`
  const llmIdInput = useRef<HTMLInputElement>(null);
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
    console.log('handle change for submit')
    debouncedHandleChange(new FormData(e.currentTarget));
  }

  function onComboxItemChange(item: ConvexComboxItem<LLMTable>) {
    console.log(`==onComboxItemChange character==`, item.key)
    llmIdInput.current!.value = item.key;
  }

  useFormError(errors);


  return (

    <Sheet open={open} onOpenChange={(open) => { setOpen(open) }}>
      {children}
      <SheetContent>
        <Form method="POST" ref={formRef} onChange={handleChange} className="flex flex-col h-full">
          <input name="llmId" ref={llmIdInput} type="hidden" defaultValue={llmItems?.[0].key} />
          <SheetHeader>
            <SheetTitle>Run LLM Form</SheetTitle>
            <SheetDescription>
              Generate character settings
            </SheetDescription>
          </SheetHeader>
          <div className="grid py-4">
            <ScrollArea className="h-full max-h-[calc(100vh-200px)]">
              <div className="w-full p-2">
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Combobox errClass={errors?.llmId ? "form-input-err" : undefined}
                      items={llmItems}
                      defaultItemKey={llmItems?.[0].key as LLMId}
                      onSelectChange={onComboxItemChange} />
                    {errors?.llmId ? <FormErrorTip tip={errors.llmId} /> : null}
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="system">System</Label>
                    <Textarea id="system" name="system" defaultValue={systemPrompt} 
                    placeholder="You are a helpful assistent." className={errors?.system ? "form-input-err" : undefined}
                    rows={9}
                    />
                    {errors?.system ? <FormErrorTip tip={errors?.system} /> : null}
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="user">User</Label>
                    <Textarea id="user" name="user" defaultValue={userInput} 
                    placeholder="Question" className={errors?.user ? "form-input-err" : undefined} 
                    rows={9}
                    />
                    {errors?.user ? <FormErrorTip tip={errors?.user} /> : null}
                  </div>

                </div>
              </div>
            </ScrollArea>
          </div>
          <SheetFooter>
            {/* <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose> */}
            <Button variant="ghost" className="border" type="submit" disabled={isSubmitting} >
              <Play className="h-4 w-4" />
              <span >{isSubmitting ? "Running..." : "Run"}</span>
            </Button>
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>

  )
}