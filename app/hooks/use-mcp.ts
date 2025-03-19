import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  SSEClientTransport,
  SseError,
} from "@modelcontextprotocol/sdk/client/sse.js";
import {
  ClientNotification,
  ClientRequest,
  CreateMessageRequestSchema,
  ListRootsRequestSchema,
  ProgressNotificationSchema,
  ResourceUpdatedNotificationSchema,
  Request,
  Result,
  ServerCapabilities,
  PromptReference,
  ResourceReference,
  McpError,
  CompleteResultSchema,
  ErrorCode,
  NotificationSchema as BaseNotificationSchema,
  ClientNotificationSchema,
  ServerNotificationSchema,
  CreateMessageRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { useState } from "react";

export const StdErrNotificationSchema = BaseNotificationSchema.extend({
  method: z.literal("notifications/stderr"),
  params: z.object({
    content: z.string(),
  }),
});

export const NotificationSchema = ClientNotificationSchema.or(
  StdErrNotificationSchema,
).or(ServerNotificationSchema);

export type StdErrNotification = z.infer<typeof StdErrNotificationSchema>;
export type Notification = z.infer<typeof NotificationSchema>;

export type PendingRequest = {
  id: number;
  request: CreateMessageRequest;
};

type UseConnectionOptions = {
  sseUrl: string;
  env: Record<string, string>;
  bearerToken?: string;
  requestTimeout?: number;
  onNotification?: (notification: Notification) => void;
  onStdErrNotification?: (notification: Notification) => void;
  onPendingRequest?: (request: any, resolve: any, reject: any) => void;
  getRoots?: () => any[];
}

type RequestOptions = {
  signal?: AbortSignal;
  timeout?: number;
  suppressToast?: boolean;
}

export function useMcp({
  sseUrl,
  env,
  bearerToken,
  requestTimeout = 10000,
  onNotification,
  onStdErrNotification,
  onPendingRequest,
  getRoots,
}: UseConnectionOptions) {
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connected" | "error"
  >("disconnected");
  const [serverCapabilities, setServerCapabilities] =
    useState<ServerCapabilities | null>(null);
  const [mcpClient, setMcpClient] = useState<Client | null>(null);
  const [requestHistory, setRequestHistory] = useState<
    { request: string; response?: string }[]
  >([]);
  const [completionsSupported, setCompletionsSupported] = useState(true);

  const pushHistory = (request: object, response?: object) => {
    setRequestHistory((prev) => [
      ...prev,
      {
        request: JSON.stringify(request),
        response: response !== undefined ? JSON.stringify(response) : undefined,
      },
    ]);
  };

  const makeRequest = async <T extends z.ZodType>(
    request: ClientRequest,
    schema: T,
    options?: RequestOptions,
  ): Promise<z.output<T>> => {
    if (!mcpClient) {
      throw new Error("MCP client not connected");
    }

    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort("Request timed out");
      }, options?.timeout ?? requestTimeout);

      let response;
      try {
        response = await mcpClient.request(request, schema, {
          signal: options?.signal ?? abortController.signal,
        });
        pushHistory(request, response);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        pushHistory(request, { error: errorMessage });
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }

      return response;
    } catch (e: unknown) {
      if (!options?.suppressToast) {
        const errorString = (e as Error).message ?? String(e);
        console.error(errorString);
      }
      throw e;
    }
  };

  const handleCompletion = async (
    ref: ResourceReference | PromptReference,
    argName: string,
    value: string,
    signal?: AbortSignal,
  ): Promise<string[]> => {
    if (!mcpClient || !completionsSupported) {
      return [];
    }

    const request: ClientRequest = {
      method: "completion/complete",
      params: {
        argument: {
          name: argName,
          value,
        },
        ref,
      },
    };

    try {
      const response = await makeRequest(request, CompleteResultSchema, {
        signal,
        suppressToast: true,
      });
      return response?.completion.values || [];
    } catch (e: unknown) {
      // Disable completions silently if the server doesn't support them.
      // See https://github.com/modelcontextprotocol/specification/discussions/122
      if (e instanceof McpError && e.code === ErrorCode.MethodNotFound) {
        setCompletionsSupported(false);
        return [];
      }

      // Unexpected errors - show toast and rethrow
      console.error(e instanceof Error ? e.message : String(e));
      throw e;
    }
  };

  const sendNotification = async (notification: ClientNotification) => {
    if (!mcpClient) {
      const error = new Error("MCP client not connected");
      console.error(error.message);
      throw error;
    }

    try {
      await mcpClient.notification(notification);
      // Log successful notifications
      pushHistory(notification);
    } catch (e: unknown) {
      if (e instanceof McpError) {
        // Log MCP protocol errors
        pushHistory(notification, { error: e.message });
      }
      console.error(e instanceof Error ? e.message : String(e));
      throw e;
    }
  };

  const handleAuthError = async (error: unknown) => {
    return false
    // if (error instanceof SseError && error.code === 401) {
    //   sessionStorage.setItem(SESSION_KEYS.SERVER_URL, sseUrl);

    //   const result = await auth(authProvider, { serverUrl: sseUrl });
    //   return result === "AUTHORIZED";
    // }

    // return false;
  };

  const connect = async (_e?: unknown, retryCount: number = 0) => {
    try {
      const client = new Client<Request, Notification, Result>(
        {
          name: "mcp-genesis-client",
          version: "1.0.0",
        },
        {
          capabilities: {
            sampling: {},
            roots: {
              listChanged: true,
            },
          },
        },
      );

      const url = new URL(`${sseUrl}`);

      // Inject auth manually instead of using SSEClientTransport, because we're
      // proxying through the inspector server first.
      const headers: HeadersInit = {};

      // Use manually provided bearer token if available, otherwise use OAuth tokens
      // const token = bearerToken || (await authProvider.tokens())?.access_token;
      // if (token) {
      //   headers["Authorization"] = `Bearer ${token}`;
      // }

      const clientTransport = new SSEClientTransport(url, {
        eventSourceInit: {
          fetch: (url, init) => fetch(url, { ...init, headers }),
        },
        requestInit: {
          headers,
        },
      });

      if (onNotification) {
        client.setNotificationHandler(
          ProgressNotificationSchema,
          onNotification,
        );

        client.setNotificationHandler(
          ResourceUpdatedNotificationSchema,
          onNotification,
        );
      }

      if (onStdErrNotification) {
        client.setNotificationHandler(
          StdErrNotificationSchema,
          onStdErrNotification,
        );
      }
      

      try {
        await client.connect(clientTransport);
      } catch (error) {
        console.error("Failed to connect to MCP server:", error);
        const shouldRetry = await handleAuthError(error);
        if (shouldRetry) {
          console.warn("retry connect to mcp")
          return connect(undefined, retryCount + 1);
        }

        if (error instanceof SseError && error.code === 401) {
          // Don't set error state if we're about to redirect for auth
          return;
        }
        throw error;
      }

      const capabilities = client.getServerCapabilities();
      console.log('capabilities=>', capabilities);
      setServerCapabilities(capabilities ?? null);
      setCompletionsSupported(true); // Reset completions support on new connection

      if (onPendingRequest) {
        client.setRequestHandler(CreateMessageRequestSchema, (request) => {
          return new Promise((resolve, reject) => {
            onPendingRequest(request, resolve, reject);
          });
        });
      }

      if (getRoots) {
        client.setRequestHandler(ListRootsRequestSchema, async () => {
          return { roots: getRoots() };
        });
      }

      setMcpClient(client);
      setConnectionStatus("connected");
    } catch (e) {
      console.error(e);
      setConnectionStatus("error");
    }
  };

  return {
    connectionStatus,
    serverCapabilities,
    mcpClient,
    requestHistory,
    makeRequest,
    sendNotification,
    handleCompletion,
    completionsSupported,
    connect,
  };
}