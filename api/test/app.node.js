/**
 * serves as a testing piece in nodejs without any serverless environment so it can be used as web server instead of a function and also it makes the deployment easy and less overhelming
 */
import { serve } from "@hono/node-server";
import app from "../app.js";
import log from "../utils/logger.js";

const PORT = process.env.PORT || 2626;

serve({ fetch: app.fetch, port: PORT }, () =>
  log.info(`Server has been started at ${PORT}`),
);
