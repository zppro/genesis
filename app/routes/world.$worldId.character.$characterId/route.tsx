import { format } from "date-fns/format"
import { useLoaderData } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Separator } from "~/components/ui/separator"
import { getWorldCharacterExtend } from "~/data/convexProxy/character.server"
import { type CharacterId, table } from "@/world/characters";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import JsonPretty from "~/components/ui/json-pretty";
import { ScrollArea } from "~/components/ui/scroll-area"
import Toolbar from "~/components/toolbars/entity-detail-toolbar";
import { ImageDialog } from "~/components/ui/image-dialog";
import { Badge } from "~/components/ui/badge"
import { LoaderCircle } from "lucide-react"
import { ClientOnly } from "remix-utils/client-only"
import PixiAnimationObject from "~/components/pixi/animation-object";
import { Stage } from '@pixi/react';
import { parsePixiSpritesheet, parsePixiAnmimationAnimationNames, parsePixiAnmimationSourceSize } from "~/lib/spritesheet";

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const { characterId } = params;
  let characterEx = null
  try {
    characterEx = await getWorldCharacterExtend(characterId as CharacterId)
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
    if (characterEx === null) {
      throw new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
    }

    return { characterEx }
  }
}

export function ErrorBoundary() {
  return <GetOneErrorBoundary />
}

export default function Index() {
  const { characterEx } = useLoaderData<typeof loader>();
  const data = characterEx?.spritesheet?.data
  const pixiSpriteSheet = parsePixiSpritesheet(data)
  const sourceSize = parsePixiAnmimationSourceSize(pixiSpriteSheet)
  const animationNames = parsePixiAnmimationAnimationNames(pixiSpriteSheet)
  
  return (
    <div className="flex h-full items-start flex-col">
      <Toolbar entityName={table} />
      <Separator />
      <div className="w-full flex flex-1 flex-col">
        <div className="w-full flex items-start flex-row p-4 ">
          <div className="font-semibold text-lg">{characterEx?.name}<Badge className="ml-2">speed:{characterEx?.speed}</Badge></div>
          {characterEx?._creationTime && (
            <div className="ml-auto text-xs h-full text-muted-foreground flex items-center">
              {format(new Date(characterEx._creationTime), "PPpp")}
            </div>
          )}
        </div>
        <Separator />
        <ScrollArea className="p-4 h-full w-full max-h-[calc(100vh-200px)]">
          <div className="flex flex-col space-y-2">
            <div>
              <ClientOnly fallback={<LoaderCircle className="h-4 w-4 loading-icon" />}>
                {
                  () =>
                    <Stage key={characterEx._id} width={sourceSize.w * animationNames.length } height={sourceSize.h} options={{ background: 0xffffff }} onMount={() => {
                      console.log('stage on mounted')
                    }}>

                      {

                        animationNames.map((aname, idx) =>

                          <PixiAnimationObject
                            animationSpritesheet={pixiSpriteSheet} speed={characterEx.speed}
                            animationName={aname}
                            x={sourceSize.w * idx}
                            y={0}
                            w={sourceSize.w}
                            h={sourceSize.h}
                          />
                        )
                      }

                    </Stage>
                }
              </ClientOnly>
              <ImageDialog src={characterEx?.textureUrl} maxWidth={400} maxHeight={300} />
            </div>
            <div className="whitespace-pre-wrap"><JsonPretty data={characterEx?.spritesheet?.data} className="w-[520px]" /></div>
          </div>
        </ScrollArea>
        <Separator className="mt-auto" />
        <div className="p-2">
        </div>
      </div>
    </div>
  )
}