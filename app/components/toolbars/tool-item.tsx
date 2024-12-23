import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip"

export default function ToolItem({ itemTip, children }: { itemTip: string, children?: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent>{itemTip}</TooltipContent>
    </Tooltip>
  )
}