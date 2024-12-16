import { format } from "date-fns/format"
import { useLoaderData } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Separator } from "~/components/ui/separator"
import { getWorldTexture } from "~/data/convexProxy/texture.server"
import { type TextureId, table } from "@/world/textures";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import Toolbar from "~/components/toolbars/entity-detail-toolbar";
import { FileJson, FileAudio } from "lucide-react"

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { textureId } = params;
  let texture = null
  try {
    texture = await getWorldTexture(textureId as TextureId)
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
    if (texture === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }
    return { texture }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export default function Index() {
  const { texture } = useLoaderData<typeof loader>();
  return (
    <div className="flex h-full items-start flex-col">
      <Toolbar entityName={table} />
      <Separator />
      <div className="w-full flex flex-1 flex-col">
        <div className="w-full flex items-start flex-row p-4 ">
          <div className="font-semibold text-lg">{texture?.name}</div>
          {texture?._creationTime && (
            <div className="ml-auto text-xs h-full text-muted-foreground flex items-center">
              {format(new Date(texture._creationTime), "PPpp")}
            </div>
          )}
        </div>
        <Separator />
        <div className="p-4">
          {
            texture?.url ? (
              <div>
                <img src={texture.url} className="image-file" />
              </div>
            ) : null
          }
        </div>
        <Separator className="mt-auto" />
        <div className="p-2">

        </div>
      </div>
    </div>
  )
}