import { describe, test, expect } from "vitest";
import { Flipkart } from "./scraper.js";

describe("Flipkart Scraper", () => {
  test("extractProductDetails() should return valid product details", async () => {
    const scraper = new Flipkart(
      "https://www.flipkart.com/bright-kraft-printed-men-round-neck-purple-t-shirt/p/itmbe49f8823bbbf?pid=TSHHF3MXGHACYYTH&lid=LSTTSHHF3MXGHACYYTHEI9F85",
      "IN",
    );

    const productDetails = await scraper.extractProductDetails();

    console.log("📝 Extracted Product Details:", productDetails);

    expect(productDetails).toHaveProperty("id");
    expect(productDetails).toHaveProperty("url");
    expect(productDetails).toHaveProperty("title");
    expect(productDetails).toHaveProperty("currentPrice");
    expect(productDetails).toHaveProperty("originalPrice");
    expect(productDetails).toHaveProperty("ratings");
  }, 50000); // 20 seconds timeout
});
