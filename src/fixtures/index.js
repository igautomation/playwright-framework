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
import { fetchUserData, updateUserData } from "./combined.js";

(async () => {
  try {
    const baseURL = process.env.BASE_URL;
    if (!baseURL) {
      throw new Error(
        "BASE_URL environment variable is required. Set it in src/config/env/dev.env."
      );
    }
    const userId = "123"; // Example user ID

    console.log("--- Starting API operations ---");

    // Fetch user data
    const userData = await fetchUserData(baseURL, userId);
    if (!userData || typeof userData !== "object") {
      throw new Error("Invalid user data received from API");
    }
    console.log("Fetched User Data:", JSON.stringify(userData, null, 2));

    // Prepare updated data payload
    const updatedData = { name: "Updated Name" };

    // Update user data
    const updateResponse = await updateUserData(baseURL, userId, updatedData);
    if (!updateResponse || typeof updateResponse !== "object") {
      throw new Error("Invalid update response received from API");
    }
    console.log("Update Response:", JSON.stringify(updateResponse, null, 2));

    console.log("--- API operations completed successfully ---");
  } catch (error) {
    console.error("Error occurred during API operations:", error.message);
    process.exit(1);
  }
})();
