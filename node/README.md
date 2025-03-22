# HPKV Node.js Client

A Node.js REST client SDK for HPKV, a high-performance key-value store that provides fast, reliable, and scalable data storage.

## Installation

```bash
npm install hpkv-client
```

## Usage

```javascript
const HPKVClient = require('hpkv-client');

// Create a client instance
const client = new HPKVClient('YOUR_BASE_URL', 'YOUR_API_KEY');

// Basic operations
async function basicOperations() {
  // Set a value
  await client.set('user:123', 'John Doe');
  
  // Get a value
  const user = await client.get('user:123');
  console.log(user.value); // 'John Doe'
  
  // Delete a value
  await client.delete('user:123');
  
  // Store a JSON object
  await client.set('user:456', {
    name: 'Jane Doe',
    age: 30,
    email: 'jane@example.com'
  });
  
  // Partial update (JSON merge)
  await client.set('user:456', { 
    age: 31,
    city: 'New York'
  }, true); // true enables partial update
  
  // Increment a counter
  await client.set('counter:visits', '0');
  const result = await client.increment('counter:visits', 1);
  console.log(result.result); // 1
  
  // Query a range of keys
  const users = await client.query('user:100', 'user:200', 50);
  console.log(users.records); // Array of user records
}

basicOperations().catch(console.error);
```

## API Reference

### Constructor

```javascript
const client = new HPKVClient(baseUrl, apiKey);
```

- `baseUrl` (string, required): The base URL for the HPKV API
- `apiKey` (string, required): Your HPKV API key

### Methods

#### set(key, value, partialUpdate)

Insert or update a record.

- `key` (string, required): Key to store
- `value` (string|object, required): Value to store
- `partialUpdate` (boolean, optional, default: false): Whether to perform a partial update

Returns: Promise resolving to an object with success status and message.

#### get(key)

Get a record by key.

- `key` (string, required): Key to retrieve

Returns: Promise resolving to the record with key and value properties.

#### delete(key)

Delete a record.

- `key` (string, required): Key to delete

Returns: Promise resolving to an object with success status and message.

#### increment(key, increment)

Increment or decrement a numeric value.

- `key` (string, required): Key to increment/decrement
- `increment` (number, optional, default: 1): Value to add (positive) or subtract (negative)

Returns: Promise resolving to an object with success status, message, and the new value.

#### query(startKey, endKey, limit)

Query records within a key range.

- `startKey` (string, required): Starting key (inclusive)
- `endKey` (string, required): Ending key (inclusive)
- `limit` (number, optional, default: 100): Maximum number of records to return

Returns: Promise resolving to an object with records array, count, and truncated flag.

## Error Handling

All methods throw errors for API failures, network issues, or invalid inputs. Errors from API responses include the HTTP status code and response data.

```javascript
try {
  await client.get('nonexistent-key');
} catch (error) {
  console.error(error.message); // Error message
  console.error(error.status);  // HTTP status code (e.g., 404)
  console.error(error.data);    // Full error response data
}
```



## Running Tests

This library includes unit tests to ensure the client is working correctly.

### Running All Tests

```bash
npm test
```

### Running Only Unit Tests

```bash
npm run test:unit
```

### Running Basic Tests

```bash
npm run test:basic
```

## License

MIT 