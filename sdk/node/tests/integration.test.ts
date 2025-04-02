import dotenv from 'dotenv';
import HPKVRestClient from '../src/index.js';

// Load environment variables
dotenv.config();

describe('HPKVClient Integration Tests', () => {
  let client: HPKVRestClient;
  const TEST_PREFIX = 'test:integration:';

  beforeAll(() => {
    client = new HPKVRestClient(
      process.env.HPKV_API_BASE_URL || '',
      process.env.HPKV_NEXUS_URL || '',
      process.env.HPKV_API_KEY || ''
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

  describe('Basic Operations', () => {
    const testKeys: string[] = [];

    afterAll(async () => {
      await cleanup(testKeys);
    });

    test('should set and get a simple string value', async () => {
      const key = getTestKey('string');
      testKeys.push(key);
      const value = 'Hello, Integration Test!';

      await client.set(key, value);
      const result = await client.get(key);
      expect(result.value).toBe(value);
    });

    test('should set and get a JSON object', async () => {
      const key = getTestKey('json');
      testKeys.push(key);
      const value = {
        name: 'Test User',
        age: 25,
        tags: ['test', 'integration'],
      };

      await client.set(key, value);
      const result = await client.get(key);
      expect(JSON.parse(result.value)).toEqual(value);
    });

    test('should delete a record', async () => {
      const key = getTestKey('delete');
      testKeys.push(key);
      const value = 'To be deleted';

      await client.set(key, value);
      await client.delete(key);

      await expect(client.get(key)).rejects.toThrow();
    });
  });

  describe('Partial Updates', () => {
    const testKeys: string[] = [];

    afterAll(async () => {
      await cleanup(testKeys);
    });

    test('should perform partial update of JSON object', async () => {
      const key = getTestKey('partial');
      testKeys.push(key);

      // Initial data
      const initialData = {
        name: 'John Doe',
        email: 'john@example.com',
      };
      await client.set(key, initialData);

      // Partial update
      const update = {
        email: 'john.updated@example.com',
        age: 30,
      };
      await client.set(key, update, true);

      // Verify update
      const result = await client.get(key);
      const updatedData = JSON.parse(result.value);
      expect(updatedData).toEqual({
        name: 'John Doe',
        email: 'john.updated@example.com',
        age: 30,
      });
    });
  });

  describe('Atomic Operations', () => {
    const testKeys: string[] = [];

    afterAll(async () => {
      await cleanup(testKeys);
    });

    test('should increment and decrement values', async () => {
      const key = getTestKey('counter');
      testKeys.push(key);

      // Set initial value
      await client.set(key, '10');

      // Test increment
      const incrementResult = await client.increment(key, 5);
      expect(incrementResult.result).toBe(15);

      // Test decrement
      const decrementResult = await client.increment(key, -3);
      expect(decrementResult.result).toBe(12);
    });
  });

  describe('Range Queries', () => {
    const testKeys: string[] = [];

    afterAll(async () => {
      await cleanup(testKeys);
    });

    test('should query records within a range', async () => {
      // Create test data
      const testData = [
        { key: getTestKey('range:1'), value: 'First' },
        { key: getTestKey('range:2'), value: 'Second' },
        { key: getTestKey('range:3'), value: 'Third' },
        { key: getTestKey('range:4'), value: 'Fourth' },
      ];

      for (const { key, value } of testData) {
        testKeys.push(key);
        await client.set(key, value);
      }

      // Query the range
      const results = await client.getRange(getTestKey('range:1'), getTestKey('range:3'), 10);

      expect(results.records).toHaveLength(3);
      expect(results.count).toBe(3);
      expect(results.truncated).toBe(false);

      // Verify order
      const values = results.records.map(record => record.value);
      expect(values).toEqual(['First', 'Second', 'Third']);
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent keys', async () => {
      const key = getTestKey('nonexistent');
      await expect(client.get(key)).rejects.toThrow();
    });

    test('should handle invalid API key', async () => {
      const invalidClient = new HPKVRestClient(
        process.env.HPKV_API_BASE_URL || '',
        process.env.HPKV_NEXUS_URL || '',
        'invalid-key'
      );
      await expect(invalidClient.get('test')).rejects.toThrow();
    });
  });
});
