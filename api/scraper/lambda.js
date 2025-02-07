/**
 * only used for deploying to aws lambda. created seperate file to ensure testing by nodejs adapter
 */
import { handle } from "hono/aws-lambda";
import app from "./index.js";

export const handler = handle(app);
