import { Form } from "@remix-run/react";
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { SlimServer } from "@/world/mcpServer/slim";
import { SlimServerTool } from "@/world/mcpServerTool/slim";
import { SkillTable, skillTypeMcpTool, skillTypeCustomFunction, SkillTypes } from "@/world/skill/schema";
import { TextureTable } from "@/world/textures";
import { LLMTable } from "@/world/llms";
import { useToast } from "~/hooks/use-toast"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Badge } from "~/components/ui/badge"
import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import debounce from "debounce"
import Combobox, { useConvexCombox, type ConvexComboxItem } from "~/components/ui/combox"
import { FormProps, FormErrorTip, useFormError } from "~/components/convex/form"
import { convertFormDataToObject, FormItemFormatter } from "~/lib/form";
import { cn } from "~/lib/utils";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Button } from "~/components/ui//button";
import { PackageSearch } from "lucide-react"
import ChooseSheet, { Node } from "~/components/sheets/chooseSheet";
import JSON5 from "json5";
import { McpServerToolId } from "@/world/mcpServerTool/schema";
import { parseFormError } from "~/zod/form";


export const mergeNamePrefixsAsObject = ["data"]
export const formatters: FormItemFormatter[] = [{
  key: "data.tools",
  format(v) {
    return (v as string).split(",")
  },
}]

export function validateFormData(formData: FormData, schema: z.AnyZodObject) {
  const formPayload = convertFormDataToObject(formData, { mergeNamePrefixsAsObject }, formatters)
  // console.log("formPayload 1", formPayload)
  const dataInForm = formPayload["data"] as Record<string, any>
  const dataTypeInForm = dataInForm["type"]
  // console.log('dataTypeInForm=>', dataTypeInForm)
  if (dataTypeInForm === skillTypeMcpTool) {
    delete dataInForm["functionName"]
    delete dataInForm["systemPrompt"]
    if (dataInForm["tools"] === undefined) {
      dataInForm["tools"] = []
    } else {
      dataInForm["tools"] = JSON.parse(dataInForm["tools"])
    }
  } else if (dataTypeInForm === skillTypeCustomFunction) {
    delete dataInForm["tools"]
    if (dataInForm["functionName"] === undefined) {
      dataInForm["functionName"] = ""
    }
    if (dataInForm["systemPrompt"] === undefined) {
      dataInForm["systemPrompt"] = ""
    }
  }
  // console.log("formPayload 2", formPayload)
  // console.log('validateFormData=>', formPayload)
  const result = schema.safeParse(formPayload);

  let success = true, parsedErrors = {}
  if (result.error) {
    success = false;
    parsedErrors = parseFormError(result.error);
    console.log("result.error.issues=>", parsedErrors)
  }
  return [parsedErrors, success, formPayload]
}

export type SkillFormProps<S extends z.AnyZodObject> = FormProps<SkillTable, S> & {
  textureItems: ConvexComboxItem<TextureTable>[];
  llmItems: ConvexComboxItem<LLMTable>[];
  nodes: Node[];
}

export default function SkillForm<S extends z.AnyZodObject>({ children, errors, doc, schema,
  onClientErrors, textureItems, llmItems, nodes }: SkillFormProps<S>) {
  const { toast } = useToast()
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dataType, setDataType] = useState<SkillTypes>(doc?.data.type ?? skillTypeMcpTool)
  const [dataTools, setDataTools] = useState<SlimServerTool[]>(doc?.data.type === skillTypeMcpTool ? doc.data.tools : []);
  const [textureId, setTextureId] = useState(doc?.textureId)
  const [llmId, setLLMId] = useState(doc?.llmId)
  const textureIdInput = useRef<HTMLInputElement>(null);
  const llmIdInput = useRef<HTMLInputElement>(null);
  const dataToolsInput = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const debouncedHandleChange = debounce((formData) => {
    // onClientErrors(validateFormData(formData, schema))
    const [errors] = validateFormData(formData, schema)
    onClientErrors(errors)
  }, 200);
  function handleChange(e: React.FormEvent<HTMLFormElement>) {
    debouncedHandleChange(new FormData(e.currentTarget));
  }

  function onTextureComboxItemChange(item: ConvexComboxItem<TextureTable>) {
    console.log(`==onComboxItemChange texture==`, item.key)
    textureIdInput.current!.value = item.key;
    const formData = new FormData(formRef.current!)
    const [errors] = validateFormData(formData, schema)
    onClientErrors(errors)
    // onClientErrors(validateFormData(formData, schema))
    setTextureId(item.key)
  }

  function onLLMComboxItemChange(item: ConvexComboxItem<LLMTable>) {
    console.log(`==onComboxItemChange llm==`, item.key)
    llmIdInput.current!.value = item.key;
    const formData = new FormData(formRef.current!)
    const [errors] = validateFormData(formData, schema)
    onClientErrors(errors)
    // onClientErrors(validateFormData(formData, schema))
    setLLMId(item.key)
  }

  function onChooseTools(choosen: Node[]) {
    const tools: SlimServerTool[] = choosen.map(v => ({ id: v.value as McpServerToolId, name: v.label!.toString() }))
    // dataToolsInput.current!.value = tools.map(v => JSON.stringify(v)).join()
    const formData = new FormData(formRef.current!)
    const [errors] = validateFormData(formData, schema)
    onClientErrors(errors)
    setDataTools(tools)
  }
  function openSelectToolsSheet() {
    setSheetOpen(true)
  }
  // console.log('dataTools', dataTools)

  useFormError(errors)

  return (
    <>
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
                <RadioGroup name="data.type"
                  defaultValue={dataType}
                  onValueChange={(v: SkillTypes) => {
                    setDataType(v)
                    setTimeout(() => {
                      const formData = new FormData(formRef.current!)
                      const [errors] = validateFormData(formData, schema)
                      onClientErrors(errors)
                    }, 201)
                  }}
                >
                  {
                    [skillTypeMcpTool, skillTypeCustomFunction].map(ty =>
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
                <Combobox errClass={errors?.textureId ? "form-input-err" : undefined}
                  items={textureItems}
                  defaultItemKey={doc?.textureId}
                  buttonPlaceholder="Select textures..."
                  onSelectChange={onTextureComboxItemChange} />
                {errors?.textureId ? <FormErrorTip tip={errors.textureId} /> : null}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Combobox errClass={errors?.llmId ? "form-input-err" : undefined}
                  items={llmItems}
                  defaultItemKey={doc?.llmId}
                  buttonPlaceholder="Select llms..."
                  onSelectChange={onLLMComboxItemChange} />
                {errors?.llmId ? <FormErrorTip tip={errors.llmId} /> : null}
              </div>
              {
                dataType === skillTypeMcpTool &&
                <div className="flex flex-col space-y-1.5">
                  <div>
                    <Button variant="outline" className="border h-6 w-6 mr-1"
                      onClick={(e) => {
                        e.preventDefault()
                        openSelectToolsSheet()
                      }} >
                      <PackageSearch className="h-4 w-4" />
                    </Button>
                    {errors && errors["data.tools"] ? <FormErrorTip tip={errors["data.tools"]} /> : null}
                  </div>
                  {
                    dataTools &&
                    <div className="flex space-x-1.5" >
                      {dataTools.map(item => <Badge key={item.id}>{item.name}</Badge>)}
                    </div>
                  }
                  {
                    <input name="data.tools" type="hidden" readOnly
                      ref={dataToolsInput}
                      // defaultValue={doc && doc.data.type === skillTypeMcpTool ? doc.data.tools.map(v => JSON.stringify(v)).join() : ""}
                      value={JSON.stringify(dataTools)}
                    />
                  }

                </div>
              }
              {
                dataType === skillTypeCustomFunction &&
                <>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="data-functionName">Function name</Label>
                    <Input id="data-functionName" name="data.functionName" defaultValue={(doc && doc.data.type === skillTypeCustomFunction) ? doc.data.functionName : ""}
                      placeholder="Name of your custom skill function"
                      className={cn('h-12', (errors && errors["data.functionName"] ? "form-input-err" : undefined))}
                    />
                    {errors && errors["data.functionName"] ? <FormErrorTip tip={errors["data.functionName"]} /> : null}
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="data-systemPrompt">System prompt</Label>
                    <Textarea id="data-systemPrompt" name="data.systemPrompt" defaultValue={(doc && doc.data.type === skillTypeCustomFunction) ? doc.data.systemPrompt : ""}
                      placeholder="System Prompt of your custom skill function invoke"
                      className={cn('h-12', (errors && errors["data.systemPrompt"] ? "form-input-err" : undefined))}
                    />
                    {errors && errors["data.systemPrompt"] ? <FormErrorTip tip={errors["data.systemPrompt"]} /> : null}
                  </div>
                </>
              }

            </div>
          </div>
        </ScrollArea>
      </Form>
      {
        sheetOpen && <ChooseSheet
          open={sheetOpen}
          setOpen={setSheetOpen}
          nodes={nodes}
          defaultChecked={dataTools.map(v => v.id)}
          onChoosen={onChooseTools}
        >
        </ChooseSheet>
      }

    </>
  )
}