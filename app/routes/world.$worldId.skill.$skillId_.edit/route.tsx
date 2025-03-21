import { useNavigation } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import { useLoaderData, useActionData, redirect } from "@remix-run/react";
import type { ActionFunctionArgs, LinksFunction } from "@remix-run/node";
// import SkillForm, { mergeNamePrefixsAsObject, formatters } from "~/routes/world.$worldId.skill/form"
import SkillForm, { validateFormData } from "~/routes/world.$worldId.skill/form"
import { z } from "zod";
import { getWorldSkill, updateWorldSkill } from "~/data/convexProxy/skill.server"
import { listWorldTextures } from "~/data/convexProxy/texture.server"
import { listWorldLLMs } from "~/data/convexProxy/llm.server";
import { type SkillId, table, skillTypeCustomFunction, skillTypeMcpTool } from "@/world/skill/schema";
import { type UpdateArgs } from "@/world/skill/args";
import { type TextureTable } from "@/world/textures";
import { type LLMTable } from "@/world/llms";
import { WorldId } from "@/worlds";
import formcssHref from "~/form.css?url";
import Toolbar from "~/components/toolbars/entity-save-toolbar";
import { Separator } from "~/components/ui/separator"
import { parseFormError } from "~/lib/error.server"
import { ServerErrors, ClientErrors } from "~/components/convex/type";
import { useState, useEffect } from 'react'
import { type ConvexComboxItem } from "~/components/ui/combox"
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

const updateSchema = z.object({
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
  // }),
});

export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const { worldId, skillId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  if (!skillId) {
    throw new Error("invalid skillId param!");
  }
  let serverErrors: ServerErrors = {}
  const formData = await request.formData();
  console.log('in action edit')
  const [errors, success, _formData] = validateFormData(formData, updateSchema)
  if (success) {
    try {
      const formPayload = { ..._formData, id: skillId as SkillId, worldId }
      await updateWorldSkill(formPayload as UpdateArgs)
      return redirect(`/world/${worldId}/skill/${skillId}`)
    } catch (error) {
      // {field1: errorMessage, ...}
      const fields = Object.keys(updateSchema.keyof().Values)
      serverErrors = parseFormError(error, fields)
    }
  } else {
    console.log(errors)
    serverErrors = errors
  }

  // const _formData = convertFormDataToObject(formData);
  // const formPayload = { ..._formData, id: skillId as SkillId, worldId }

  // // payload z schema validation
  // const result = updateSchema.safeParse(formPayload);
  // if (result.success) {
  //   try {
  //     await updateWorldSkill(formPayload as UpdateArgs)
  //     return redirect(`/world/${worldId}/skill/${skillId}`)
  //   } catch (error) {
  //     // {field1: errorMessage, ...}
  //     const fields = Object.keys(updateSchema.keyof().Values)
  //     serverErrors = parseFormError(error, fields)
  //   }
  // } else {
  //   // Handle validation errors
  //   serverErrors = { ...result.error.formErrors.fieldErrors }

  // }

  return { serverErrors }
}

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { worldId, skillId } = params;
  if (!worldId) {
    throw new Error("invalid world params!");
  }
  if (!skillId) {
    throw new Error("invalid skillId param!");
  }

  let skill = null
  try {
    skill = await getWorldSkill(skillId as SkillId)
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
    if (skill === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    const textures = await listWorldTextures(worldId as WorldId)
    const llms = await listWorldLLMs(worldId as WorldId)
    const breadcrumbData = { routeName: `edit skill (${skill.name})`, routeUrl: `/world/${worldId}/skill/${skill._id}/edit` }

    return { ...breadcrumbData, worldId: worldId as WorldId, skill, textures, llms }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}


export default function EditSkill() {
  const { worldId, skill, textures, llms } = useLoaderData<typeof loader>();
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

  function onClientErrors(clientErrors: ClientErrors) {
    // { ...actionData?.serverErrors, ...clientErrors }
    console.log('onClientErrors', clientErrors)
    setErrors(clientErrors)
  }
  let nodes: any = useQuery(api.trees.index.mcpToolTree, { worldId, nodeIdKey: "value", nodeNameKey: "label" }) ?? []

  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST" && navigation.formAction === `/world/${skill?.worldId}/skill/${skill?._id}/edit`;
  return (
    <div className="h-full">
      <SkillForm
        textureItems={textureItems}
        llmItems={llmItems}
        nodes={nodes}
        errors={errors} onClientErrors={onClientErrors} doc={skill} schema={updateSchema}>
        <Toolbar isSubmitting={isSubmitting} entityName={table} />
        <Separator />
      </SkillForm>
    </div>
  )
}