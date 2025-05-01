// src/utils/xray/xrayUtils.js

/**
 * Xray integration utility for Playwright test framework.
 *
 * Features:
 * - OAuth2 token auth via AuthUtils
 * - Fetch test cases via GraphQL
 * - Push execution results to Xray
 * - Import Gherkin .feature files into Jira
 */

import { GraphQLClient, gql } from "graphql-request";
import logger from "../common/logger.js";
import AuthUtils from "../api/auth.js";
import fs from "fs";
import fetch from "node-fetch";
import path from "path";

class XrayUtils {
  constructor() {
    this.apiBase =
      process.env.XRAY_API_BASE_URL || "https://xray.cloud.getxray.app/api/v2";
    this.clientId = process.env.XRAY_CLIENT_ID;
    this.clientSecret = process.env.XRAY_CLIENT_SECRET;
    this.token = null;
    this.auth = new AuthUtils();
  }

  /**
   * Authenticates with Xray using client credentials via AuthUtils
   */
  async authenticate() {
    this.token = await this.auth.getOAuthToken(
      `${this.apiBase}/authenticate`,
      this.clientId,
      this.clientSecret
    );

    if (!this.token) {
      throw new Error("Failed to authenticate with Xray. Token is null.");
    }

    logger.info("Xray token retrieved successfully");
  }

  /**
   * Fetches test cases from Jira using GraphQL based on a JQL filter
   * Returns test keys and summaries for mapping
   */
  async fetchTestCases(jql, limit = 100) {
    if (!this.token) {
      await this.authenticate();
    }

    const graphQLUrl = `${this.apiBase}/graphql`;
    const client = new GraphQLClient(graphQLUrl, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    const query = gql`
      query {
        getTests(jql: "${jql}", limit: ${limit}) {
          results {
            issueId
            jira(fields: ["key", "summary"])
            testType { name }
            gherkin
          }
        }
      }
    `;

    const data = await client.request(query);
    return data.getTests.results;
  }

  /**
   * Pushes execution results to Xray cloud for a given testExecutionKey
   */
  async pushExecutionResults(testExecutionKey, results) {
    if (!this.token) {
      await this.authenticate();
    }

    if (!testExecutionKey || !Array.isArray(results)) {
      throw new Error(
        "Invalid input: testExecutionKey and results array are required."
      );
    }

    const payload = {
      testExecutionKey,
      tests: results.map((result) => ({
        testKey: result.testKey,
        start: new Date(result.startTime).toISOString(),
        finish: new Date(result.endTime).toISOString(),
        status: result.status === "passed" ? "PASS" : "FAIL",
        comment: result.error || "",
      })),
    };

    const response = await fetch(`${this.apiBase}/import/execution`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error(
        `Failed to push results to Xray: ${response.statusText}\n${text}`
      );
      throw new Error("Xray result push failed");
    }

    logger.info("Xray test execution results uploaded successfully");
  }

  /**
   * Imports a Gherkin feature file into Jira project.
   * Accepts .feature file path and Jira project key.
   */
  async importGherkinTests(featurePath, projectKey) {
    if (!this.token) {
      await this.authenticate();
    }

    if (!fs.existsSync(featurePath)) {
      throw new Error(`Feature file does not exist: ${featurePath}`);
    }

    const fileName = path.basename(featurePath);
    const fileContent = fs.readFileSync(featurePath, "utf8");

    const response = await fetch(
      `${this.apiBase}/import/feature?projectKey=${projectKey}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "text/plain",
        },
        body: fileContent,
      }
    );

    if (!response.ok) {
      logger.error(
        `Failed to import Gherkin: ${response.status} ${response.statusText}`
      );
      throw new Error("Xray Gherkin import failed");
    }

    logger.info(
      `Gherkin feature "${fileName}" imported to project ${projectKey}`
    );
  }

  /**
   * Maps test titles in the Playwright test results to Xray test keys using @TEST-123 tags.
   */
  mapTestsToXrayIds(tests) {
    const tagPattern = /@TEST-(\d+)/;
    const map = {};

    tests.forEach((test) => {
      const match = test.title.match(tagPattern);
      if (match) {
        map[test.title] = `TEST-${match[1]}`;
      }
    });

    return map;
  }
}

export default XrayUtils;
