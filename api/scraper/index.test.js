import { serve } from "@hono/node-server";
import app from "./index.js";

const port = 2626;

try {
  serve({
    fetch: app.fetch,
    port,
  });
  console.log(`Server started on http://localhost:${port}`);
} catch (error) {
  console.error("Failed to start server:", error);
}
