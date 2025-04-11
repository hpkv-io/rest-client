import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import dotenv from "dotenv";
import { HPKVRestClient } from "../src/client";

// Load environment variables
dotenv.config();

describe("HPKVClient Integration Tests", () => {
  let client: HPKVRestClient;
  const TEST_PREFIX = "test:integration:";

  beforeAll(() => {
    client = new HPKVRestClient(
      process.env.HPKV_API_BASE_URL || "",
      process.env.HPKV_NEXUS_URL || "",
      process.env.HPKV_API_KEY || "",
    );
  });

  // Helper function to generate unique test keys
  const getTestKey = (suffix: string): string => `${TEST_PREFIX}${suffix}`;

  // Cleanup helper
  const cleanup = async (keys: string[]): Promise<void> => {
    for (const key of keys) {
      try {
        await client.delete(key);
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
  };

  describe("Basic Operations", () => {
    const testKeys: string[] = [];

    afterAll(async () => {
      await cleanup(testKeys);
    });

    test("should set and get a simple string value", async () => {
      const key = getTestKey("string");
      testKeys.push(key);
      const value = "Hello, Integration Test!";

      await client.set(key, value);
      const result = await client.get(key);
      expect(result.value).toBe(value);
    });

    test("should set and get a JSON object", async () => {
      const key = getTestKey("json");
      testKeys.push(key);
      const value = {
        name: "Test User",
        age: 25,
        tags: ["test", "integration"],
      };

      await client.set(key, value);
      const result = await client.get(key);
      expect(JSON.parse(result.value)).toEqual(value);
    });

    test("should delete a record", async () => {
      const key = getTestKey("delete");
      testKeys.push(key);
      const value = "To be deleted";

      await client.set(key, value);
      await client.delete(key);

      await expect(client.get(key)).rejects.toThrow();
    });
  });

  describe("Partial Updates", () => {
    const testKeys: string[] = [];

    afterAll(async () => {
      await cleanup(testKeys);
    });

    test("should perform partial update of JSON object", async () => {
      const key = getTestKey("partial");
      testKeys.push(key);

      // Initial data
      const initialData = {
        name: "John Doe",
        email: "john@example.com",
      };
      await client.set(key, initialData);

      // Partial update
      const update = {
        email: "john.updated@example.com",
        age: 30,
      };
      await client.set(key, update, true);

      // Verify update
      const result = await client.get(key);
      const updatedData = JSON.parse(result.value);
      expect(updatedData).toEqual({
        name: "John Doe",
        email: "john.updated@example.com",
        age: 30,
      });
    });
  });

  describe("Atomic Operations", () => {
    const testKeys: string[] = [];

    afterAll(async () => {
      await cleanup(testKeys);
    });

    test("should increment and decrement values", async () => {
      const key = getTestKey("counter");
      testKeys.push(key);

      // Set initial value
      await client.set(key, "10");

      // Test increment
      const incrementResult = await client.atomicIncrement(key, 5);
      expect(incrementResult.result).toBe(15);

      // Test decrement
      const decrementResult = await client.atomicIncrement(key, -3);
      expect(decrementResult.result).toBe(12);
    });
  });

  describe("Range Queries", () => {
    const testKeys: string[] = [];

    afterAll(async () => {
      await cleanup(testKeys);
    });

    test("should query records within a range", async () => {
      // Create test data
      const testData = [
        { key: getTestKey("range:1"), value: "First" },
        { key: getTestKey("range:2"), value: "Second" },
        { key: getTestKey("range:3"), value: "Third" },
        { key: getTestKey("range:4"), value: "Fourth" },
      ];

      for (const { key, value } of testData) {
        testKeys.push(key);
        await client.set(key, value);
      }

      // Query the range
      const results = await client.range(
        getTestKey("range:1"),
        getTestKey("range:3"),
        10,
      );

      expect(results.records).toHaveLength(3);
      expect(results.count).toBe(3);
      expect(results.truncated).toBe(false);

      // Verify order
      const values = results.records.map((record) => record.value);
      expect(values).toEqual(["First", "Second", "Third"]);
    });
  });

  describe("Edge Cases", () => {
    const testKeys: string[] = [];

    afterAll(async () => {
      await cleanup(testKeys);
    });

    test("should not accept empty string values", async () => {
      const key = getTestKey("empty");
      testKeys.push(key);

      expect(client.set(key, "")).rejects.toThrow();
    });

    test("should handle special characters in keys", async () => {
      const key = getTestKey("special:!@#$%^&*()_+");
      testKeys.push(key);
      const value = "Value with special characters: !@#$%^&*()_+";

      await client.set(key, value);
      const result = await client.get(key);
      expect(result.value).toBe(value);
    });

    test("should delete keys with special characters", async () => {
      const key = getTestKey("special-delete:!@#$%^&*()_+");
      testKeys.push(key);
      const value = "Value to be deleted";

      await client.set(key, value);
      await client.delete(key);
      await expect(client.get(key)).rejects.toThrow();
    });

    test("should handle range queries with special characters in keys", async () => {
      const specialKeys = [
        getTestKey("special-range:!@#$%^&*()_+:1"),
        getTestKey("special-range:!@#$%^&*()_+:2"),
        getTestKey("special-range:!@#$%^&*()_+:3"),
      ];

      for (const key of specialKeys) {
        testKeys.push(key);
        await client.set(key, `Value for ${key}`);
      }

      const results = await client.range(specialKeys[0], specialKeys[2], 10);

      expect(results.records).toHaveLength(3);
      expect(results.truncated).toBe(false);
      expect(results.records.map((r) => r.key)).toEqual(specialKeys);
    });

    test("should throw when value size exceeded", async () => {
      const key = getTestKey("large");
      testKeys.push(key);
      // Generate a 100KB string
      const largeValue = "x".repeat(100 * 1024);

      expect(client.set(key, largeValue)).rejects.toThrow();
    });

    test("should handle Unicode characters", async () => {
      const key = getTestKey("unicode");
      testKeys.push(key);
      const value = "Unicode test: 你好世界 ñáéíóú あいうえお";

      await client.set(key, value);
      const result = await client.get(key);
      expect(result.value).toBe(value);
    });
  });

  describe("Advanced Partial Updates", () => {
    const testKeys: string[] = [];

    afterAll(async () => {
      await cleanup(testKeys);
    });

    test("should handle nested JSON object updates", async () => {
      const key = getTestKey("nested");
      testKeys.push(key);

      // Initial complex object
      const initialData = {
        user: {
          name: "John Doe",
          contact: {
            email: "john@example.com",
            phone: "123-456-7890",
          },
        },
        preferences: {
          theme: "dark",
          notifications: true,
        },
      };

      await client.set(key, initialData);

      // Update nested properties
      const update = {
        user: {
          contact: {
            email: "john.updated@example.com",
          },
        },
        preferences: {
          language: "en-US",
        },
      };

      await client.set(key, update, true);

      // Verify the update merged correctly
      const result = await client.get(key);
      const updatedData = JSON.parse(result.value);

      expect(updatedData.user.name).toBe("John Doe");
      expect(updatedData.user.contact.email).toBe("john.updated@example.com");
      expect(updatedData.user.contact.phone).toBe("123-456-7890");
      expect(updatedData.preferences.theme).toBe("dark");
      expect(updatedData.preferences.notifications).toBe(true);
      expect(updatedData.preferences.language).toBe("en-US");
    });

    test("should handle array updates in JSON objects", async () => {
      const key = getTestKey("array-update");
      testKeys.push(key);

      // Initial data with array
      const initialData = {
        items: [1, 2, 3],
        tags: ["initial", "test"],
      };

      await client.set(key, initialData);

      // Update with new array
      const update = {
        items: [4, 5, 6],
        tags: ["updated"],
      };

      await client.set(key, update, true);

      // In JSON merge patch (RFC 7396), arrays are replaced, not merged
      const result = await client.get(key);
      const updatedData = JSON.parse(result.value);

      expect(updatedData.items).toEqual([4, 5, 6]);
      expect(updatedData.tags).toEqual(["updated"]);
    });
  });

  describe("Range Query Edge Cases", () => {
    const testKeys: string[] = [];

    beforeAll(async () => {
      // Create test data with specific ordering for range queries
      const testData = [
        { key: getTestKey("range:001"), value: "First" },
        { key: getTestKey("range:010"), value: "Second" },
        { key: getTestKey("range:100"), value: "Third" },
        { key: getTestKey("range:101"), value: "Fourth" },
        { key: getTestKey("range:111"), value: "Fifth" },
      ];

      for (const { key, value } of testData) {
        testKeys.push(key);
        await client.set(key, value);
      }
    });

    afterAll(async () => {
      await cleanup(testKeys);
    });

    test("should handle single item range", async () => {
      const results = await client.range(
        getTestKey("range:001"),
        getTestKey("range:001"),
        10,
      );

      expect(results.records).toHaveLength(1);
      expect(results.records[0].value).toBe("First");
    });

    test("should handle limit smaller than available records", async () => {
      const results = await client.range(
        getTestKey("range:001"),
        getTestKey("range:111"),
        2,
      );

      expect(results.records).toHaveLength(2);
      expect(results.truncated).toBe(true);
    });

    test("should handle empty range", async () => {
      const results = await client.range(
        getTestKey("range:nonexistent1"),
        getTestKey("range:nonexistent2"),
        10,
      );

      expect(results.records).toHaveLength(0);
      expect(results.truncated).toBe(false);
    });

    test("should properly order results lexicographically", async () => {
      const results = await client.range(
        getTestKey("range:001"),
        getTestKey("range:111"),
        10,
      );

      const values = results.records.map((record) => record.value);
      expect(values).toEqual(["First", "Second", "Third", "Fourth", "Fifth"]);
    });
  });

  describe("Error Handling", () => {
    test("should handle non-existent keys", async () => {
      const key = getTestKey("nonexistent");
      await expect(client.get(key)).rejects.toThrow();
    });

    test("should handle invalid API key", async () => {
      const invalidClient = new HPKVRestClient(
        process.env.HPKV_API_BASE_URL || "",
        process.env.HPKV_NEXUS_URL || "",
        "invalid-key",
      );
      await expect(invalidClient.get("test")).rejects.toThrow();
    });
  });
});
