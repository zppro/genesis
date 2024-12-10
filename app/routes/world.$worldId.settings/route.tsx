import { Outlet } from "@remix-run/react";
import { Separator } from "~/components/ui/separator"
import { useRootContext } from "~/hooks/use-context"


// export async function loader({
//   params,
// }: LoaderFunctionArgs) {
//   const { worldId } = params;
//   if (!worldId) {
//     throw new Error("invalid world params!");
//   }
//   return { worldId }

// }


export default function SettingsLayout() {
  const rootContext = useRootContext()
  return (
    <div className="flex h-full items-start flex-col">
      
      <div className="w-full flex flex-1 flex-col">
        <Outlet context={rootContext} />
        <Separator className="mt-auto" />
        <div className="p-2">
        </div>
      </div>
    </div>
  )
}