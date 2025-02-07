import { DataExtractionError } from "./error.js";
import * as cheerio from "cheerio";
import axios from "axios";
import log from "./logger.js";

const PROXY_API_KEY = process.env.PROXY_API_KEY;

class StaticScraper {
  constructor(productUrl, cc) {
    this.url = productUrl;
    this.cc = cc;
  }

  async fetchHTML() {
    try {
      const response = await axios.get(this.url, {
        method: "GET",
        proxy: {
          host: "proxy-server.scraperapi.com",
          port: 8001,
          auth: {
            username: `scraperapi.country_code=${this.cc}.render=true.device_type=desktop`,
            password: PROXY_API_KEY,
          },
          protocol: "http",
        },
      });

      if (response.status !== 200) {
        log.http(`Network error Status: ${response.status}`);
        throw new DataExtractionError(`Network error: ${response.statusText}`);
      }

      log.debug(`HTML fetched successfully from: ${this.url}`);
      return response.data;
    } catch (err) {
      log.error(`Error fetching HTML: ${err.message}`);
      throw new DataExtractionError(`ScraperError: ${err.message}`);
    }
  }

  async parseHTML(code, extractors = []) {
    log.debug(`Parsing HTML with extractors: ${JSON.stringify(extractors)}`);
    const $ = cheerio.load(code);

    for (const extractor of extractors) {
      const extractedData = $(extractor).first().text().trim();
      if (extractedData) {
        log.debug(`Extracted data using '${extractor}': ${extractedData}`);
        return extractedData;
      }
    }

    return null;
  }
}

export class Flipkart extends StaticScraper {
  constructor(productUrl, cc) {
    super(productUrl, cc);
  }

  extractPID(url) {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("pid");
  }

  async extractProductDetails() {
    log.info("Extracting product details from Flipkart...");

    const extractorsPattern = {
      pricings: {
        currentPrice: { classBased: [".Nx9bqj", ".YdlZ+W"], elementBased: [] },
        originalPrice: { classBased: [".n85Sxt", ".yRaY8j"], elementBased: [] },
      },
      title: { classBased: [".VU-ZEz", "title"], elementBased: [] },
      ratings: { classBased: [".E3wXvA", ".XQDdHH"], elementBased: [] },
    };

    try {
      const htmlCode = await this.fetchHTML();

      const productId = await this.extractPID(this.url);

      const title = await this.parseHTML(
        htmlCode,
        extractorsPattern.title.classBased,
      ).split("|")[0];
      const currentPrice = await this.parseHTML(
        htmlCode,
        extractorsPattern.pricings.currentPrice.classBased,
      );
      const originalPrice = await this.parseHTML(
        htmlCode,
        extractorsPattern.pricings.originalPrice.classBased,
      );
      const ratings = await this.parseHTML(
        htmlCode,
        extractorsPattern.ratings.classBased,
      );

      if (!title || !currentPrice) {
        throw new DataExtractionError(
          "Failed to extract essential product details.",
        );
      }

      const extractedData = {
        productId,
        currentPrice,
        originalPrice,
        title,
        ratings,
      };

      log.info("Product details extracted successfully.");
      log.debug("Extracted data:", extractedData);

      return extractedData;
    } catch (err) {
      log.error(
        `Error extracting product details from Flipkart: ${err.message}`,
      );
      throw new DataExtractionError(`ExtractionError: ${err.message}`);
    }
  }
}
