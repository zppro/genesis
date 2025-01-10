import { Link } from "@remix-run/react";
import { BreadcrumbItem, BreadcrumbLink } from "~/components/ui/breadcrumb";
import { BreadcrumbFunc } from "~/lib/routeHandle"
import { cn } from "~/lib/utils";

export const breadcrumb: BreadcrumbFunc = (match, islast) => {
  const { routeName, routeUrl } = (match.data as any)
  return (
    <BreadcrumbItem className={cn("hidden md:block", islast ? "" : "hover:border-b hover:border-gray-400")} >
      {
        islast ? <>{routeName}</>
          :
          <BreadcrumbLink href={routeUrl}>
            {routeName}
          </BreadcrumbLink>
      }
    </BreadcrumbItem>
  )
}