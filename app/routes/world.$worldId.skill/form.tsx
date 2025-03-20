import { Form } from "@remix-run/react";
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
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
import { FormProps, FormErrorTip } from "~/components/convex/form"
import { convertFormDataToObject, FormItemFormatter } from "~/lib/form";
import { cn } from "~/lib/utils";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Button } from "~/components/ui//button";
import { PackageSearch } from "lucide-react"
import SelectTools from "~/routes/world.$worldId.mcpServer.$mcpServerId.tools/selectTools"
import ChooseSheet, { Node } from "~/components/sheets/chooseSheet";
import JsonPretty from "~/components/ui/json-pretty";
import JSON5 from "json5";


export type SkillFormProps<S extends z.AnyZodObject> = FormProps<SkillTable, S> & {
  textureItems: ConvexComboxItem<TextureTable>[];
  llmItems: ConvexComboxItem<LLMTable>[];
}

export default function SkillForm<S extends z.AnyZodObject>({ children, errors, doc, schema, onClientErrors, textureItems, llmItems }: SkillFormProps<S>) {
  const { toast } = useToast()
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dataType, setDataType] = useState<SkillTypes>(doc?.data.type ?? skillTypeMcpTool)
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


  const nodes = [{
    value: 'mars',
    label: 'Mars',
    children: [
      { value: 'phobos', label: 'Phobos' },
      { value: 'deimos', label: 'Deimos' },
    ],
  }];

  function onChooseTools(choosen: Node[]) {
    console.log('choosen=>', choosen)
  }
  function openSelectToolsSheet() {
    setSheetOpen(true)
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
                <RadioGroup name="type"
                  defaultValue={dataType}
                  onValueChange={(v: SkillTypes) => {
                    console.log('datatype=>', v)
                    setDataType(v)
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
                    <Button variant="outline" className="border h-6 w-6"
                      onClick={() => {
                        openSelectToolsSheet()
                      }} >
                      <PackageSearch className="h-4 w-4" />
                    </Button>
                  </div>
                  {
                    doc && doc.data.type === skillTypeMcpTool &&
                    <div className="flex space-x-1.5" >
                      {doc.data.tools.map(item => <Badge key={item.id}>{item.name}</Badge>)}
                    </div>
                  }
                </div>
              }
              {
                dataType === skillTypeCustomFunction &&
                <>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="functionName">Function name</Label>
                    <Input id="functionName" name="functionName" defaultValue={(doc && doc.data.type === skillTypeCustomFunction) ? doc.data.functionName : ""}
                      placeholder="Name of your skill function"
                      className={errors?.functionName ? "form-input-err" : undefined}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="systemPrompt">System prompt</Label>
                    <Textarea id="systemPrompt" name="systemPrompt" defaultValue={(doc && doc.data.type === skillTypeCustomFunction) ? doc.data.systemPrompt : ""}
                      placeholder="System Prompt of your skill function invoke"
                      className={cn('h-12', (errors?.systemPrompt ? "form-input-err" : undefined))}
                    />
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
          defaultChecked={["phobos"]}
          onChoosen={onChooseTools}
        >
        </ChooseSheet>
      }

    </>
  )
}