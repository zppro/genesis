
import { format } from "date-fns/format"
import { useLoaderData, Outlet } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { Separator } from "~/components/ui/separator"
import { getWorldSceneExtend } from "~/data/convexProxy/scene.server"
import { type SceneId, table } from "@/world/scenes";
import { GetOneErrorBoundary } from "~/components/error-boundary"
import { parseIsNotFoundRecordError } from "@/error";
import Toolbar from "~/components/toolbars/entity-detail-toolbar";
import { ScrollArea } from "~/components/ui/scroll-area"
import SimpleCard from "~/components/ui/simple-card";
import { ImageDialog } from "~/components/ui/image-dialog";
import { FileJson, FileAudio } from "lucide-react"

export async function loader({
  params,
}: LoaderFunctionArgs) {
  console.log('animation load')
  return {}
}

export default function Index() {
  return (
    "Hello"
  )
}