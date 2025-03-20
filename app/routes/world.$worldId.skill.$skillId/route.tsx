import { format } from "date-fns/format"
import { useActionData, useLoaderData, useNavigation, Form } from "@remix-run/react";
import { useEffect, useState, useRef } from "react";
import { type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { parseFormError } from "~/lib/error.server"
import { ServerErrors } from "~/components/convex/type";
import { useFormError, FormErrorTip } from "~/components/convex/form";
import { Label } from "~/components/ui/label"
import { Badge } from "~/components/ui/badge"
import { Textarea } from "~/components/ui/textarea"
import debounce from "debounce"
import { convertFormDataToObject } from "~/lib/form";
import { z } from "zod";
import { Separator } from "~/components/ui/separator"
import { getWorldSkillExtend, testSkill } from "~/data/convexProxy/skill.server"
import { type SkillId, table, skillTypeMcpTool, skillTypeCustomFunction } from "@/world/skill/schema";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import JsonPretty from "~/components/ui/json-pretty";
import { ScrollArea } from "~/components/ui/scroll-area"
import Toolbar from "~/components/toolbars/entity-detail-toolbar";
import { useRedirectToast } from "~/hooks/use-redirectToast";
import ToolItem from "~/components/toolbars/tool-item"
import { Button } from "~/components/ui//button";
import { CloudUpload, Check, TriangleAlert, Play } from "lucide-react"
import { ImageDialog } from "~/components/ui/image-dialog";
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";
import { cn } from "~/lib/utils";
import { TestSkillArgs } from "@/world/skill/args";
import { Switch } from "~/components/ui/switch";
import { useMcp, type StdErrNotification, type PendingRequest } from "~/hooks/use-mcp";
import {
  ClientRequest,
  CompatibilityCallToolResult,
  CompatibilityCallToolResultSchema,
  CreateMessageResult,
  EmptyResultSchema,
  GetPromptResultSchema,
  ListPromptsResultSchema,
  ListResourcesResultSchema,
  ListResourceTemplatesResultSchema,
  ListToolsResultSchema,
  ReadResourceResultSchema,
  Resource,
  ResourceTemplate,
  Root,
  ServerNotification,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { useAction } from "convex/react";
import { api } from "@/_generated/api";


export const handle: Handle = {
  breadcrumb
};

const testSkillSchema = z.object({
  system: z.string().min(1, { message: "System is required" }),
  user: z.string().min(1, { message: "User is required" }),
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId, skillId } = params;

  let serverErrors: ServerErrors = {}

  const formData = await request.formData();
  const _formData = convertFormDataToObject(formData);
  const formPayload = { ..._formData, worldId }
  const result = testSkillSchema.safeParse(formPayload);
  if (result.success) {
    try {
      const formPayload2 = {
        messages: [
          { role: "system", content: _formData["system"] },
          { role: "user", content: _formData["user"] }
        ],
        id: skillId as SkillId
      }
      const res = await testSkill(formPayload2 as unknown as TestSkillArgs)
      return { res }
    } catch (error) {
      console.log('testSkill err:', error)
      serverErrors = parseFormError(error, [])
    }
  } else {
    // Handle validation errors
    serverErrors = { ...result.error.formErrors.fieldErrors }
  }
  console.log("serverErrors:", serverErrors)
  return { serverErrors }
}

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { worldId, skillId } = params;
  let skillEx = null
  try {
    skillEx = await getWorldSkillExtend(skillId as SkillId)
  } catch (error) {
    let isNotFoundError = parseIsNotFoundRecordError(error)
    if (isNotFoundError) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    throw error
  } finally {
    if (skillEx === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    const breadcrumbData = { routeName: skillEx.name, routeUrl: `/world/${worldId}/skill/${skillId}` }

    return { ...breadcrumbData, skillEx }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export default function Index() {
  const { skillEx } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [errors, setErrors] = useState(actionData?.serverErrors)
  const [isTestSkill, setIsTestSkill] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [notifications, setNotifications] = useState<ServerNotification[]>([]);
  const [stdErrNotifications, setStdErrNotifications] = useState<
    StdErrNotification[]
  >([]);
  const [roots, setRoots] = useState<Root[]>([]);
  const sseUrl = `https://proper-lapwing-331.convex.site/sse`
  const env = {}, bearerToken = ""
  const [pendingSampleRequests, setPendingSampleRequests] = useState<
    Array<
      PendingRequest & {
        resolve: (result: CreateMessageResult) => void;
        reject: (error: Error) => void;
      }
    >
  >([]);
  const nextRequestId = useRef(0);
  const rootsRef = useRef<Root[]>([]);
  const {
    connectionStatus,
    serverCapabilities,
    mcpClient,
    requestHistory,
    makeRequest: makeConnectionRequest,
    sendNotification,
    handleCompletion,
    completionsSupported,
    connect: connectMcpServer,
  } = useMcp({
    sseUrl,
    env,
    bearerToken,
    onNotification: (notification) => {
      setNotifications((prev) => [...prev, notification as ServerNotification]);
    },
    onStdErrNotification: (notification) => {
      setStdErrNotifications((prev) => [
        ...prev,
        notification as StdErrNotification,
      ]);
    },
    onPendingRequest: (request, resolve, reject) => {
      setPendingSampleRequests((prev) => [
        ...prev,
        { id: nextRequestId.current++, request, resolve, reject },
      ]);
    },
    getRoots: () => rootsRef.current,
  });

  const [nextToolCursor, setNextToolCursor] = useState<string | undefined>();
  const listTools = async () => {
    const response = await makeConnectionRequest(
      {
        method: "tools/list" as const,
        params: nextToolCursor ? { cursor: nextToolCursor } : undefined,
      },
      ListToolsResultSchema,
    );
    setNextToolCursor(response.nextCursor);
    return response.tools;
  };

  const testMcpSkillAction = useAction(api.world.skill.nodeAction.testMcpSkillInNode);
  const handleConnectByServer = async () => {
    testMcpSkillAction({ id: skillEx._id, messages: [] });
  }


  const handleConnectClick = async () => {

    if (connectionStatus === "connected") {
      console.warn("mcpClient connected!")
      return;
    }
    await connectMcpServer()
    console.log("connectMcpServer done!")

  };


  const handleToolListClick = async () => {
    if (!mcpClient) {
      console.warn("mcpClient is null")
      return
    }
    const tools = await mcpClient.listTools()
    const tools2 = await listTools()
    console.log('tools=>', tools)
    console.log('tools2=>', tools2)
  }

  useEffect(() => {
    if (actionData && "serverErrors" in actionData) {
      setErrors(actionData.serverErrors)
    }

  }, [actionData])
  function validateFormData(formData: FormData) {
    const formPayload = convertFormDataToObject(formData)
    // form number
    console.log('validateFormData=>', formPayload)
    const result = testSkillSchema.safeParse(formPayload);
    return { ...result.error?.formErrors.fieldErrors }
  }

  const debouncedHandleChange = debounce((formData) => {
    setErrors(validateFormData(formData))
  }, 200);
  function handleChange(e: React.FormEvent<HTMLFormElement>) {
    debouncedHandleChange(new FormData(e.currentTarget));
  }
  useFormError(errors);
  const state = useRedirectToast("sync")
  const navigation = useNavigation()
  const isSyncing = state === "submitting" && navigation.formMethod === "POST" && navigation.formAction === `/world/${skillEx?.worldId}/skill/${skillEx?._id}/sync`;
  const isSynced = skillEx.syncTime && skillEx.modifyTime && skillEx.modifyTime <= skillEx.syncTime
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${skillEx.worldId}/skill/${skillEx._id}`;
  return (
    <div className="flex h-full items-start flex-col">
      <Toolbar entityName={table}>
        <ToolItem itemTip="sync to the world">
          <Form method="post" action="sync">
            <Button variant="ghost" size="default" className="border" type="submit" disabled={isSyncing} >
              <CloudUpload className="h-4 w-4" />
              <span>{isSyncing ? "Syncing..." : "Sync"}</span>
              {isSynced ? <Check className="text-green-500" /> : <TriangleAlert className="text-yellow-500" />}
            </Button>
          </Form>
        </ToolItem>
      </Toolbar>
      <Separator />
      <div className="w-full flex flex-1 flex-col">
        <div className="w-full flex items-start flex-row p-4">
          <div className="font-semibold text-lg">{skillEx?.name}<Badge className="ml-2">{skillEx?.data.type}</Badge></div>
          <div className="pl-2">
            <ImageDialog src={skillEx?.textureUrl} className={cn('max-w-[40px]', 'max-h-[30px]')} />
          </div>
          {skillEx._creationTime && (
            <div className="ml-auto text-xs h-full text-muted-foreground flex items-center">
              {format(new Date(skillEx._creationTime), "PPpp")}
            </div>
          )}
        </div>
        <Separator />
        <ScrollArea className="p-4 h-full w-full max-h-[calc(100vh-200px)]">
          <div className="flex flex-col space-y-2">
            <div>
              <Button variant="ghost" className="border" onClick={handleConnectByServer} >
                <Play className="h-4 w-4" />
                connect by server
              </Button>
            </div>
            <div>
              <Button variant="ghost" className="border" onClick={handleConnectClick} >
                <Play className="h-4 w-4" />
                <span className={cn(connectionStatus === "connected" ? "bg-green-400" : "bg-red-400")}>
                  {connectionStatus}
                </span>
              </Button>
            </div>
            <div>
              {connectionStatus === "connected" &&
                <Button variant="ghost" className="border" onClick={handleToolListClick} >
                  <Play className="h-4 w-4" />
                  get tools
                </Button>
              }
            </div>
            <div className="flex flex-col space-y-2">
              <h2>LLM:</h2>
              <p className="text-lg indent-2 pb-2">{skillEx?.llm.name}</p>
            </div>
            {
              skillEx?.data.type === skillTypeCustomFunction &&
              <div className="flex flex-col space-y-2">
                <h2>Function name:</h2>
                <p className="text-lg indent-2 pb-2">{skillEx?.data.functionName}</p>
              </div>
            }
            <div className="flex space-x-2 items-center">
              <Switch id="isTestSkill" defaultChecked={isTestSkill} onCheckedChange={(v: boolean) => {
                setIsTestSkill(v);
              }} /><Label htmlFor="isTestSkill">Test skill</Label>
            </div>
            {
              isTestSkill && (
                skillEx?.data.type === skillTypeMcpTool &&
                <div className="flex space-x-1.5" >
                  {
                    skillEx.data.tools.map(item => <Badge key={item.id}>{item.name}</Badge>)
                  }
                </div>
              )
            }
            {
              isTestSkill &&
              (
                skillEx?.data.type === skillTypeCustomFunction &&
                <div className="flex flex-col space-y-1.5">
                  <Form method="post" onChange={handleChange} className="flex flex-col h-full">
                    {/* <input name="llmId" type="hidden" defaultValue={skillEx.llmId} />
                  <input name="funcName" type="hidden" defaultValue={skillEx.functionDef.name} /> */}
                    <div className="w-[480px] p-2 pl-0.5">
                      <div className="flex flex-col space-y-1.5 pb-2">
                        <Label htmlFor="system">System</Label>
                        <Textarea id="system" name="system" defaultValue={skillEx.data.systemPrompt} placeholder="You are a helpful assistent." className={errors?.system ? "form-input-err" : undefined} />
                        {errors?.system ? <FormErrorTip tip={errors?.system} /> : null}
                      </div>
                      <div className="flex flex-col space-y-1.5 pb-2">
                        <Label htmlFor="user">User</Label>
                        <Textarea id="user" name="user" placeholder="Question" className={errors?.user ? "form-input-err" : undefined} />
                        {errors?.user ? <FormErrorTip tip={errors?.user} /> : null}
                      </div>
                    </div>
                    <Button variant="ghost" className="border w-36" type="submit" disabled={isSubmitting} >
                      <Play className="h-4 w-4" />
                      <span >{isSubmitting ? "Invoking..." : "Invoke"}</span>
                    </Button>
                  </Form>
                  <div className="whitespace-pre-wrap">
                    {actionData?.res && <JsonPretty data={actionData.res} className="w-[450px]" />}
                  </div>
                </div>
              )
            }
          </div>
        </ScrollArea>
        <Separator className="mt-auto" />
        <div className="p-2">
        </div>
      </div>
    </div>
  )
}