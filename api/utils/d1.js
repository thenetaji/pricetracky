import Cloudflare from "cloudflare";
import "dotenv/config";
import log from "../utils/logger.js";
import { DatabaseError, InputValidationError } from "../utils/error.js";

/**
 * Executes a SQL query with parameterized inputs.
 */
export async function runQuery(sql, params = []) {
  const api_token = process.env.CLOUDFLARE_D1_ACCESS_TOKEN;
  const account_id = process.env.CLOUDFLARE_ACCOUNT_ID;
  const database_id = process.env.CLOUDFLARE_DB_ID;

  try {
    const client = new Cloudflare({ apiToken: api_token });

    log.verbose("Executing SQL:", sql, "with params:", params);

    const queryResult = await client.d1.database.query(database_id, {
      account_id,
      sql,
      params,
    });

    log.debug("Query successfully performed", queryResult);
    return queryResult;
  } catch (error) {
    log.error("Error executing query:", error);
    throw new DatabaseError("Error executing query", error);
  }
}

/**
 * Initializes tables in Cloudflare D1.
 */
async function createInitialTables() {
  const sql = `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      brand TEXT,
      product_url TEXT NOT NULL,
      current_price REAL NOT NULL,
      original_price REAL NOT NULL,
      currency TEXT NOT NULL CHECK (LENGTH(currency) = 3),
      rating INT,
      rating_count INT,
      fetched_from TEXT NOT NULL CHECK (LENGTH(fetched_from) = 2),
      last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
      current_price REAL NOT NULL,
      currency TEXT NOT NULL CHECK (LENGTH(currency) = 3),
      checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_tracking (
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      notify_when_below REAL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, product_id)
    );
  `;

  await runQuery(sql);
}

/**
 * Saves or updates product data in the database.
 */
export async function saveProductDataToDB(data) {
  try {
    if (!data || Object.keys(data).length === 0) {
      log.verbose("No data passed to saveProductDataToDB function");
      throw new InputValidationError("No data is passed");
    }

    const {
      product_id,
      title,
      product_url,
      current_price,
      original_price,
      currency,
      fetched_from,
      brand,
    } = data;

    if (
      [
        product_id,
        title,
        product_url,
        current_price,
        original_price,
        currency,
      ].some((value) => value === null || value === undefined || value === "")
    ) {
      throw new InputValidationError("Some values are missing in the data.");
    }
    log.verbose("Input validation passed in saveProductDataToDB with values:");

    const sql = `
  INSERT INTO products (product_id, title, product_url, current_price, original_price, currency, brand, fetched_from)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(product_id) DO UPDATE SET
    title = excluded.title,
    product_url = excluded.product_url,
    current_price = excluded.current_price,
    original_price = excluded.original_price,
    fetched_from = excluded.fetched_from,
    currency = excluded.currency,
    rating = excluded.rating,
    rating_count = excluded.rating_count;
`;

    await runQuery(sql, [
      product_id,
      title,
      product_url,
      current_price,
      original_price,
      currency,
      brand,
      fetched_from,
    ]);
  } catch (error) {
    log.error(`Error in saving to database: ${error.message || error}`);
    throw new DatabaseError(error.message || error);
  }
}
