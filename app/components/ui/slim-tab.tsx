import { Link } from "@remix-run/react";
import { ReactNode, useEffect, useState } from "react";
import { cn } from "~/lib/utils";
export type TabOptions = {
  name: string;
  url: string;
  prefetch: "intent" | "render" | "none" | "viewport"
  title?: string;
  baseUrl?: string; // 没有设定就将当前url作为baseUrl
}

export type SlimTabProps = {
  currentTab: string;
  tabs: TabOptions[];
  children?: ReactNode;
}

export default function SlimTab({ currentTab, tabs, children, className, ...props }: React.ComponentProps<"div"> & SlimTabProps) {
  return (
    <>
      <div className={cn("tabs", className)}  {...props}>
        {
          tabs.map(tab => {
            let url = tab.baseUrl ? `${tab.baseUrl}/${tab.url}` : tab.url
            return <Link key={tab.name} to={url} prefetch={tab.prefetch} className={cn("tab capitalize", `basis-1/${tabs.length + 1}`, currentTab === tab.name ? 'active-tab' : null)} >{tab?.title || tab.name}</Link>
          })
        }
      </div>
      {children}
    </>
  )
}