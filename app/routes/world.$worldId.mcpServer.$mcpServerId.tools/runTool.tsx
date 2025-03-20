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
import type { McpServerToolDoc } from "@/world/mcpServerTool/schema"
import { Plus, Play } from "lucide-react"
import { SpritesheetDoc } from "@/world/spritesheets";
import { PixiSpritesheet } from "@/shared/spritesheet";
import JSON5 from "json5"
import { FormErrors } from "~/components/convex/type";
import { ClientErrors } from "~/components/convex/type";
import JsonPretty from "~/components/ui/json-pretty";
import { useAction } from "convex/react";
import { api } from "@/_generated/api";
import { JSONSchemaFaker } from "json-schema-faker";
import { createZodSchema } from "@/mcp/utils";

export type RunToolProps = {
  tool: McpServerToolDoc;
  children?: React.ReactNode;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function RunTool({ open, setOpen, tool, children }: RunToolProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false);
  const [callResult, setCallResult] = useState();
  const argumentsTemplateRef = useRef<HTMLTextAreaElement | null>(null);

  const sampleArgs = JSON.stringify(JSONSchemaFaker.generate(tool.inputSchema), null, 2);
  const schema = createZodSchema(tool.inputSchema);
  const safeCallToolAction = useAction(api.mcp.client.nodeAction.safeCallTool)
  const handleSafeCallToolClick = async () => {

    try {
      setIsLoading(true);
      const inputVal = argumentsTemplateRef.current?.value ?? "{}"
      const inputData = JSON.parse(inputVal)
      const validatedInput = schema.parse(inputData);

      const res = await safeCallToolAction({
        mcpServerId: tool.mcpServerId,
        toolName: tool.name,
        args: validatedInput,
      })
      setCallResult(res as any)
    } catch (err) {
      toast({
        title: "call tools err:",
        description: (err as Error).toString(),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(open) => { setOpen(open) }}>
      {children}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Run Tool Sheet</SheetTitle>
          <SheetDescription>
            Call McpServer Tool
          </SheetDescription>
        </SheetHeader>
        <div className="grid py-4">
          <ScrollArea className="h-full max-h-[calc(100vh-200px)]">
            <div className="w-full p-2">
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="argumentsTemplate">Arguments</Label>
                  <Textarea ref={argumentsTemplateRef} id="argumentsTemplate" name="argumentsTemplate" defaultValue={sampleArgs}
                    placeholder="arguments to call tool"
                    rows={9}
                  />
                </div>
                <div className="whitespace-pre-wrap">
                  {callResult && <JsonPretty data={callResult} className="w-[320px]" />}
                </div>
              </div>
            </div>

          </ScrollArea>
        </div>
        <SheetFooter>
          {/* <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose> */}
          <Button variant="ghost"
            className="border"
            disabled={isLoading}
            onClick={handleSafeCallToolClick}
          >
            <Play className="h-4 w-4" />
            <span >{isLoading ? "Running..." : "Run"}</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>

  )
}