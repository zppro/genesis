import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ImageDialog } from "~/components/ui/image-dialog";

export type FieldProps = {
  title: string;
  value: string;
}

export default function Field({ title, value }: FieldProps) {

  return (
    <div className="flex border items-center">
      <div className="basis-1/4 font-bold text-right bg-gray-200 p-2">{title}</div>
      <div className="basis-3/4 p-2">
        {value}
      </div>
    </div>

  )
}