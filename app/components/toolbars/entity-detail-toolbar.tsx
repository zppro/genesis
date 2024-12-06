import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { CreateConfirm } from "~/lib/utils"
import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button"
// import { Separator } from "~/components/ui/separator"
import {
  Pencil,
  Trash2,
} from "lucide-react"

export default function Toolbar({ entityName }: { entityName: string }) {
  return (
    <div className="flex items-center gap-2 p-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Form action="edit">
            <Button variant="ghost" size="default" className="border" type="submit" >
              <Pencil className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          </Form>
        </TooltipTrigger>
        <TooltipContent>Edit the {entityName}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Form action="delete" method="POST"
            onSubmit={CreateConfirm("Please confirm you want to delete this record.")}
          >
            <Button variant="ghost" className="border" type="submit">
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          </Form>
        </TooltipTrigger>
        <TooltipContent>Delete the {entityName}</TooltipContent>
      </Tooltip>
      {/* <Separator orientation="vertical" className="mx-1 h-6" /> */}
    </div>
  )
}