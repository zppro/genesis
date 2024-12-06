import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { Button } from "~/components/ui/button"
// import { Separator } from "~/components/ui/separator"
import {
  Save,
} from "lucide-react"

export default function Toolbar({ isSubmitting, entityName }: { isSubmitting: boolean, entityName: string }) {
  return (
    <div className="flex items-center gap-2 p-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" className="border" type="submit" >
            <Save className="h-4 w-4" />
            <span >{isSubmitting ? "Saving..." : "Save"}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Save the {entityName}</TooltipContent>
      </Tooltip>
      {/* <Separator orientation="vertical" className="mx-1 h-6" /> */}
    </div>
  )
}