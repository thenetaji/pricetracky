import log from "./logger.js";
import { Hono } from "hono";
import { Flipkart } from "./scraper-class.js";

const app = new Hono();

app.post("/api/products", async (ctx) => {
  try {
    log.info("Received a new request to /api/products");

    let { url, cc } = await ctx.req.json();

    if (!url || !cc) {
      log.warn("Invalid request: Missing url or cc");
      return ctx.json({ error: "Missing url or cc" }, 400);
    }

    url = decodeURIComponent(url);

    log.debug(`Processing request with decoded url=${url} and cc=${cc}`);

    const scraper = new Flipkart(url, cc);

    log.info("Initializing Flipkart scraper...");
    const productDetails = await scraper.extractProductDetails();

    if (!productDetails || Object.keys(productDetails).length === 0) {
      log.warn("Extraction failed: No data found.");
      return ctx.json({ error: "Failed to extract product details" }, 500);
    }

    log.info("Successfully extracted product details.");
    return ctx.json({ success: true, data: productDetails });
  } catch (err) {
    log.error("Error processing request:", err);
    return ctx.json({ error: err.message }, 500);
  }
});

app.get("/api/status", (ctx) => {
  return ctx.json({ success: true, data: "ok" });
});

export default app;
