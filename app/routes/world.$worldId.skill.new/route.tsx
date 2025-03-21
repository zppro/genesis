import { useNavigation, useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs, LinksFunction } from "@remix-run/node";
// import SkillForm, { mergeNamePrefixsAsObject, formatters } from "~/routes/world.$worldId.skill/form"
import SkillForm, { validateFormData } from "~/routes/world.$worldId.skill/form"
import { z } from "zod";
import { createWorldSkill } from "~/data/convexProxy/skill.server"
import { listWorldTextures } from "~/data/convexProxy/texture.server"
import { listWorldLLMs } from "~/data/convexProxy/llm.server";
import { type InsertArgs } from "@/world/skill/args";
import { table, skillTypeCustomFunction, skillTypeMcpTool } from "@/world/skill/schema";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { Separator } from "~/components/ui/separator"
import { parseFormError } from "~/lib/error.server"
import { WorldId } from "@/worlds";
import { type TextureTable } from "@/world/textures";
import { type LLMTable } from "@/world/llms";
import { useState, useEffect } from 'react'
import { ServerErrors, ClientErrors } from "~/components/convex/type";
import { ConvexComboxProvider, type ConvexComboxItem } from "~/components/ui/combox"
import { useQuery } from "convex/react";
import { api } from "@/_generated/api";
import reactCheckboxTreeCssHref from 'react-checkbox-tree/lib/react-checkbox-tree.css?url';
import { Handle } from "~/lib/routeHandle";
import { breadcrumb } from "~/components/app-breadcrumb";



export const handle: Handle = {
  breadcrumb
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: formcssHref },
  { rel: "stylesheet", href: reactCheckboxTreeCssHref },
  { rel: "stylesheet", href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" }
];
const createSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  textureId: z.string().min(1, { message: "Texture is required" }),
  llmId: z.string().min(1, { message: "LLM is required" }),
  data: z.discriminatedUnion("type", [
    z.object({
      type: z.literal(skillTypeCustomFunction),
      functionName: z.string().min(1, { message: "Function name is required" }),
      systemPrompt: z.string().min(1, { message: "SystemPrompt is required" }),
    }),
    z.object({
      type: z.literal(skillTypeMcpTool),
      tools: z.array(
        z.object({
          id: z.string().min(1, { message: "mcp server tool id is required" }),
          name: z.string().min(1, { message: "mcp server tool name is required" })
        })
      ).nonempty({ message: "at least choose one tool" }),
    }),
  ]),
  // functionName: z.string().min(1, { message: "Function name is required" }),
  // systemPrompt: z.string().min(1, { message: "SystemPrompt is required" }),
  // functionDef: z.object({
  //   name: z.string(),
  //   description: z.string(),
  //   schema: z.record(z.string(), z.any()),
  // })
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  let serverErrors: ServerErrors = {}
  const formData = await request.formData();

  const [errors, success, _formData] = validateFormData(formData, createSchema)
  if (success) {
    try {
      const formPayload = { ..._formData, worldId }
      const newSkillId = await createWorldSkill(formPayload as InsertArgs)
      return redirect(`/world/${worldId}/skill/${newSkillId}`)
    } catch (error) {
      // {field1: errorMessage, ...}
      console.log('error:', error)
      const fields = Object.keys(createSchema.keyof().Values)
      serverErrors = parseFormError(error, fields)
    }
  } else {
    console.log(errors)
    serverErrors = errors
  }

  // const _formData = convertFormDataToObject(formData, { mergeNamePrefixsAsObject }, formatters);

  // const formPayload = { ..._formData, worldId }
  // console.log('new formPayload=>', formPayload)

  // // payload z schema validation
  // const result = createSchema.safeParse(formPayload);
  // if (result.success) {
  //   try {
  //     const newSkillId = await createWorldSkill(formPayload as InsertArgs)
  //     return redirect(`/world/${worldId}/skill/${newSkillId}`)
  //   } catch (error) {
  //     // {field1: errorMessage, ...}
  //     console.log('error:', error)
  //     const fields = Object.keys(createSchema.keyof().Values)
  //     serverErrors = parseFormError(error, fields)
  //   }
  // } else {
  //   // Handle validation errors
  //   console.log(result.error)
  //   serverErrors = { ...result.error.formErrors.fieldErrors }
  // }

  return { serverErrors }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { worldId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  const textures = await listWorldTextures(worldId as WorldId)
  const llms = await listWorldLLMs(worldId as WorldId)
  const breadcrumbData = { routeName: "create new skill", routeUrl: `/world/${worldId}/skill/new` }

  return { ...breadcrumbData, worldId: worldId as WorldId, textures, llms }
}

export default function NewScene() {
  const { worldId, textures, llms } = useLoaderData<typeof loader>();
  const textureItems = textures.map<ConvexComboxItem<TextureTable>>(t => ({
    key: t._id, text: t.name, icon: t.url
  }))
  const llmItems = llms.map<ConvexComboxItem<LLMTable>>(t => ({
    key: t._id, text: t.name
  }))
  const actionData = useActionData<typeof action>();
  const [errors, setErrors] = useState(actionData?.serverErrors)

  useEffect(() => {
    if (actionData && "serverErrors" in actionData) {
      setErrors(actionData.serverErrors)
    }
  }, [actionData])

  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${worldId}/skill/new`;
  function onClientErrors(clientErrors: ClientErrors) {
    // { ...actionData?.serverErrors, ...clientErrors }
    setErrors(clientErrors)
  }

  let nodes: any = useQuery(api.trees.index.mcpToolTree, { worldId, nodeIdKey: "value", nodeNameKey: "label" }) ?? []

  return (
    <div className="h-full">

      <SkillForm
        textureItems={textureItems}
        llmItems={llmItems}
        nodes={nodes}
        errors={errors} onClientErrors={onClientErrors} schema={createSchema} >
        <Toolbar isSubmitting={isSubmitting} entityName={table} />
        <Separator />
      </SkillForm>
    </div>
  )
}