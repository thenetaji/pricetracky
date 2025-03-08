import { Flipkart } from "./scraper.js";

const app = new Flipkart(
  "https://www.flipkart.com/product/p/itm?pid=TSHGX2UZVHRMHH2W",
  "IN",
);
const response = await app.extractFromAPI();
console.log(response);
