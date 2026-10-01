import { ApiError } from "../api/client.js";

// Wraps any data as an MCP text result
export const asText = (data: unknown) => ({
  content: [
    {
      type: "text" as const,
      text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
    },
  ],
});

// Turns any error into a readable MCP error result
export const asError = (err: unknown) => ({
  isError: true as const,
  content: [
    {
      type: "text" as const,
      text:
        err instanceof ApiError
          ? `${err.code}: ${err.message}`
          : "Unexpected error in the CareCircle tool.",
    },
  ],
});