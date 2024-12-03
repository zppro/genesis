import { listWorldScenes } from "~/data/convexProxy/scene"
import { useLoaderData } from "@remix-run/react";

import { type WorldId } from "@/worlds";
import { type LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  params.invoiceId; // "123"
  const { worldId } = params;
  if (!worldId) {
    throw new Error("invalid params!");
  }
  console.log('scene worldId=>', worldId)
  const scenes = await listWorldScenes(worldId as WorldId)

  return { scenes }
}

export default function Scene() {
  const { scenes } = useLoaderData<typeof loader>();
  console.log('scenes=>', scenes)

  return (
    <></>
  )
}