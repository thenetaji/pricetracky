import * as cheerio from "cheerio";
import axios from "axios";
import { DataExtractionError } from "../utils/error.js";
import log from "../utils/logger.js";

const PROXY_API_KEY =
  process.env.PROXY_API_KEY || "bf7a8869b3ff412361e36911bb9a20ca";

class StaticScraper {
  constructor(productUrl, cc) {
    productUrl = decodeURIComponent(productUrl);
    this.productUrl = productUrl;
    this.cc = cc;
  }

  async fetchHTML() {
    try {
      const response = await axios.get(this.productUrl, {
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

      log.debug(`HTML fetched successfully from: ${this.productUrl}`);
      return response.data;
    } catch (err) {
      log.error(`Error fetching HTML: ${err}`);
      throw new DataExtractionError(`ScraperError: ${err.message}`);
    }
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

  async extractFromAPI() {
    try {
      const url = "https://2.rome.api.flipkart.com/api/4/page/fetch";

      const headers = {
        accept: "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/json",
        flipkart_secure: "true",
        pragma: "no-cache",
        "sec-ch-ua": '"Not-A.Brand";v="99", "Chromium";v="124"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "x-user-agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 FKUA/msite/0.0.3/msite/Mobile",
        Referer: "https://www.flipkart.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        proxy: {
          host: "proxy-server.scraperapi.com",
          port: 8001,
          auth: {
            username: `scraperapi.country_code=${this.cc}`,
            password: PROXY_API_KEY,
          },
          protocol: "http",
        },
      };

      const pid = this.extractPID(this.productUrl);
      const data = {
        pageUri: `/product/p/itm?pid=${pid}`,
        pageContext: {
          trackingContext: {
            context: {
              eVar51: "productRecommendation/aspectSimilar_PMUCallout_HOT_DEAL",
              eVar61: "reco",
            },
          },
          networkSpeed: 450,
        },
      };

      const response = await axios.post(url, data, { headers });

      const productData = response?.data?.RESPONSE?.pageData?.pageContext || {};

      log.silly("API data received:", productData);

      const extractedData = {
        product_id: productData.productId ?? null,
        title: productData.seo?.title || productData.titles?.title || null,
        brand: productData.brand ?? null,
        product_url: `https://flipkart.com/product/p/itm?pid=${pid}`,
        image: productData.imageUrl ? productData.imageUrl : null,
        currency: productData.pricing?.finalPrice?.currency,
        current_price: productData.pricing?.minPrice?.value || null,
        original_price: productData.pricing.mrp || null,
        discount: productData.pricing?.totalDiscount
          ? `${productData.pricing.totalDiscount}% off`
          : "0% off",
        rating: productData.rating?.average ?? 0,
        rating_count: productData.rating?.count ?? 0,
        fetched_from: this.cc,
      };

      for (const key in extractedData) {
        if (extractedData[key] === undefined) {
          throw new Error(`Missing value for ${key}`);
        }
      }

      return extractedData;
    } catch (error) {
      console.error("API Error:", error.message);
      throw error;
    }
  }
}

/**
 * @depreacted extractUsingCheerio
 * async extractUsingCheerio() {
    log.info("Extracting product details from Flipkart...");

    const xpathPattern = {
      pricings: {
        currentPrice:
          "//*[@id='_parentCtr_']/div[6]/div/div/div/div/div/div[1]/div[2]/div/div/div/div/div/div/div[1]/div[3]/div",
        originalPrice:
          "//*[@id='_parentCtr_']/div[6]/div/div/div/div/div/div[1]/div[2]/div/div/div/div/div/div/div[1]/div[2]/div",
      },
      title:
        "//*[@id='_parentCtr_']/div[3]/div/div/div/div/div[1]/div/span[2]/span",
      ratings:
        "//*[@id='_parentCtr_']/div[5]/div/div/div/div/div/div/div/div/div/div/div[2]/div[1]",
      thumbnail: "",
    };

    try {
      const htmlCode = await this.fetchHTML();
      const doc = new DOMParser().parseFromString(htmlCode, "text/xml");

      const extractData = (selector) => {
        const nodes = xpath.select(selector, doc);
        console.log("nodes", nodes);
        return nodes;
      };

      const title = extractData(xpathPattern.title);
      const currentPrice = extractData(xpathPattern.pricings.currentPrice);
      const originalPrice = extractData(xpathPattern.pricings.originalPrice);
      const ratings = extractData(xpathPattern.ratings);
      const thubmnail = extractData(xpathPattern.thubmnail);

      const PID = this.extractPID(this.productUrl);

      const extractedData = {
        id: PID,
        url: `https://flipkart.com/product/p/itm?pid=${PID}`,
        currentPrice,
        originalPrice,
        title,
        ratings,
      };

      log.info("Product details extracted successfully.");
      log.debug("Extracted data:", extractedData);

      return extractedData;
    } catch (err) {
      log.error(`Error extracting product details from Flipkart: ${err}`);
      throw new DataExtractionError(`ExtractionError: ${err.message}`);
    }
  }
 */
