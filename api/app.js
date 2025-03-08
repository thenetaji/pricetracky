import { Hono } from "hono";
import { logger } from "hono/logger";
import { handleProductSubmission } from "./controller/product.js";

const app = new Hono().basePath("/api");

app.use(logger());

//adds a new product to the db and if already present can also update it but not recommended
app.post("/products", handleProductSubmission);

app.get("/status", (ctx) => {
  return ctx.json("ok");
});

export default app;
