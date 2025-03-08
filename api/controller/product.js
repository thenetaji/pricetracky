import log from "../utils/logger.js";
import { Flipkart } from "../service/scraper.js";
import { saveProductDataToDB } from "../utils/d1.js";

export async function handleProductSubmission(ctx) {
  let { url, cc } = await ctx.req.json();

  if (!url || !cc) {
    log.warn("Invalid request: Missing url or cc");
    return ctx.json({ error: "Missing url or cc" }, 400);
  }

  log.debug("Received request on handleProductSubmission with parameters", {
    url,
    cc,
  });

  try {
    const scraper = new Flipkart(url, cc);

    log.info("Initializing Flipkart scraper...");
    const productDetails = await scraper.extractFromAPI();

    if (!productDetails || Object.keys(productDetails).length === 0) {
      log.warn("Extraction failed: No data found.");
      return ctx.json({ error: "Failed to extract product details" }, 500);
    }

    log.debug("Successfully extracted product details", productDetails);

    await saveProductDataToDB(productDetails);

    return ctx.json({ success: true, data: productDetails });
  } catch (err) {
    log.error("Error processing request:", err);
    return ctx.json({ error: err.message }, 500);
  }
}
