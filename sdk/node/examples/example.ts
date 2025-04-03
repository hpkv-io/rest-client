/* eslint-disable no-console */
import HPKVRestClient from "../src/index.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main(): Promise<void> {
  // Initialize the client
  const client = new HPKVRestClient(
    process.env.HPKV_API_BASE_URL || "",
    process.env.HPKV_NEXUS_URL || "",
    process.env.HPKV_API_KEY || "",
  );

  try {
    // Example 1: Basic CRUD operations
    console.log("\n=== Basic CRUD Operations ===");

    // Set a record
    const setResult = await client.set("user:123", {
      name: "John Doe",
      email: "john@example.com",
      age: 30,
    });
    console.log("Set result:", setResult);

    // Get a record
    const getResult = await client.get("user:123");
    console.log("Get result:", getResult);

    // Update a record (partial update)
    const updateResult = await client.set(
      "user:123",
      {
        age: 31,
      },
      true,
    );
    console.log("Update result:", updateResult);

    // Delete a record
    const deleteResult = await client.delete("user:123");
    console.log("Delete result:", deleteResult);

    // Example 2: Atomic operations
    console.log("\n=== Atomic Operations ===");

    // Set initial counter
    await client.set("counter:visits", "0");

    // Increment counter
    const incrementResult = await client.increment("counter:visits", 1);
    console.log("Increment result:", incrementResult);

    // Example 3: Range queries
    console.log("\n=== Range Queries ===");

    // Set multiple records with ordered keys
    await client.set("users:001", "Alice");
    await client.set("users:002", "Bob");
    await client.set("users:003", "Charlie");

    // Query records in a range
    const rangeResult = await client.getRange("users:001", "users:003", 10);
    console.log("Range query result:", rangeResult);

    // Example 4: Nexus Search
    console.log("\n=== Nexus Search ===");

    // Set some documents for search
    await client.set("doc:1", "The quick brown fox jumps over the lazy dog");
    await client.set("doc:2", "A quick brown dog runs in the park");
    await client.set("doc:3", "The lazy fox sleeps under the tree");

    // Perform semantic search
    const searchResult = await client.nexusSearch("quick brown animal", {
      topK: 2,
      minScore: 0.5,
    });
    console.log("Search result:", searchResult);

    // Example 5: Nexus Query
    console.log("\n=== Nexus Query ===");

    // Get AI-generated answer
    const queryResult = await client.nexusQuery(
      "What animals are mentioned in the documents?",
      {
        topK: 3,
        minScore: 0.5,
      },
    );
    console.log("Query result:", queryResult);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the examples
main().catch(console.error);
