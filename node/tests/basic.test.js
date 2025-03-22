const HPKVClient = require('../hpkv-client');

test('HPKVClient constructor should work', () => {
  const client = new HPKVClient('https://example.com', 'test-key');
  expect(client.baseUrl).toBe('https://example.com');
  expect(client.apiKey).toBe('test-key');
}); 