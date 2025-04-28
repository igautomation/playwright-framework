// src/fixtures/index.js

/**
 * Entry point script demonstrating usage of combined API utilities.
 *
 * This script:
 *  - Fetches user details by ID.
 *  - Updates user information.
 *  - Logs the operations' results.
 *
 * Intended to serve as a functional example and test of API utility integration.
 */

const { fetchUserData, updateUserData } = require("./combined");

(async () => {
  try {
    const baseURL = process.env.BASE_URL || "https://example.com/api";
    const userId = "123"; // Example user ID

    console.log("--- Starting API operations ---");

    // Fetch user data
    const userData = await fetchUserData(baseURL, userId);
    console.log("Fetched User Data:", JSON.stringify(userData, null, 2));

    // Prepare updated data payload
    const updatedData = { name: "Updated Name" };

    // Update user data
    const updateResponse = await updateUserData(baseURL, userId, updatedData);
    console.log("Update Response:", JSON.stringify(updateResponse, null, 2));

    console.log("--- API operations completed successfully ---");
  } catch (error) {
    console.error("Error occurred during API operations:", error);
    process.exit(1);
  }
})();
