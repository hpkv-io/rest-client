const HPKVClient = require('../hpkv-client');

// Mock axios module
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn().mockReturnValue({
      post: jest.fn().mockResolvedValue({ data: { success: true } }),
      get: jest.fn().mockResolvedValue({ data: { key: 'test', value: 'value' } }),
      delete: jest.fn().mockResolvedValue({ data: { success: true } })
    })
  };
  return mockAxios;
});

describe('HPKVClient - Basic Unit Tests', () => {
  let client;
  
  // Setup before each test
  beforeEach(() => {
    // Clear all mock implementations and calls
    jest.clearAllMocks();
    client = new HPKVClient('https://api.hpkv.example.com', 'test-api-key');
  });

  // Constructor tests
  describe('Constructor', () => {
    test('should create a client instance with the correct properties', () => {
      expect(client.baseUrl).toBe('https://api.hpkv.example.com');
      expect(client.apiKey).toBe('test-api-key');
    });

    test('should throw error if baseUrl is not provided', () => {
      expect(() => new HPKVClient(null, 'api-key')).toThrow('baseUrl is required');
    });

    test('should throw error if apiKey is not provided', () => {
      expect(() => new HPKVClient('baseUrl', null)).toThrow('apiKey is required');
    });
  });

  // Basic functionality tests
  describe('Basic operations', () => {
    test('should provide set method', () => {
      expect(typeof client.set).toBe('function');
    });

    test('should provide get method', () => {
      expect(typeof client.get).toBe('function');
    });

    test('should provide delete method', () => {
      expect(typeof client.delete).toBe('function');
    });

    test('should provide increment method', () => {
      expect(typeof client.increment).toBe('function');
    });

    test('should provide query method', () => {
      expect(typeof client.query).toBe('function');
    });
  });
}); 