import {
  UIMatch,
} from "@remix-run/react";
import { ReactNode } from "react";
import { BreadcrumbItem, BreadcrumbLink } from "~/components/ui/breadcrumb";

export type BreadcrumbFunc = (match: UIMatch, isLast: boolean) => ReactNode

export type Handle = {
  breadcrumb: BreadcrumbFunc
}
