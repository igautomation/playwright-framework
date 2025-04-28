// src/tests/api/rest/create-product.spec.js
const { test, expect } = require('@playwright/test');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const fetch = require('node-fetch');
const Ajv = require('ajv');
const { readData } = require('@utils/common/logger');

const ajv = new Ajv();
const productSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    userId: { type: "integer" },
    title: { type: "string" },
    body: { type: "string" },
  },
  required: ["id"],
  additionalProperties: true,
};

const validate = ajv.compile(productSchema);

const products = parse(fs.readFileSync("src/data/csv/products.csv", "utf-8"), {
  columns: true,
  skip_empty_lines: true,
});

test.describe("Create Product API Tests", () => {
  for (const product of products) {
    test(`Create product: ${product.name}`, async ({ apiUser }) => {
      logger.info("Using AUTH_TOKEN from global setup", {
        token: process.env.AUTH_TOKEN,
      });
      logger.info("Using apiUser token", { token: apiUser });
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiUser || process.env.AUTH_TOKEN}`,
          },
          body: JSON.stringify({
            id: product.id,
            title: product.name,
            body: `Price: ${product.price}, Category: ${product.category}, Stock: ${product.stock}`,
            userId: 1,
          }),
        }
      );
      expect(response.status).toBe(201);
      const data = await response.json();
      logger.info("API response:", data);

      const valid = validate(data);
      if (!valid) {
        logger.error("Schema validation errors:", validate.errors);
      }
      expect(valid).toBe(true);
      expect(data.id).toBeDefined();
    });
  }
});
