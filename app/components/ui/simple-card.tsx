import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export type SimpleCardProps = {
  title: string;
  value: any;
  desc?: string;
}

export default function SimpleCard({ title, value, desc }: SimpleCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {
          desc &&
          <p className="text-xs text-muted-foreground">
            {desc}
          </p>
        }
      </CardContent>
    </Card>
  )
}