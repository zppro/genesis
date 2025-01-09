import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { ConvexError } from "convex/values";

export function GetOneErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    console.log("in error boundary for route", error)
    switch (error.status) {
      case 404:
        return <div>Ops,url not found!</div>;
    }
    return (
      <div>
        Something went wrong: {error.status}
        {error.statusText}
        {error.data}
      </div>
    );
  } else if (error instanceof Error) {
    console.log("in error boundary for throw", error.message, error.name)
    return <div>Uncatched Error: {error.message}</div>
  } else {
    return <h1>Unknown Error</h1>;
  }
}

function ParseConvexErrorBoundary({ error }: { error: Error }) {
  return error instanceof ConvexError // Check whether the error is an application error
    ? // Access data and cast it to the type we expect
    (
      <div>
        Something went wrong:{" "}
        {(error.data as { message: string }).message}
      </div>
    )
    : // Must be some developer error,
    // and prod deployments will not
    // reveal any more information about it
    // to the client
    null;
}