# HPKV REST Client

A high-performance Node.js client for the HPKV REST API.

## Features

- High-performance key-value operations
- Semantic search capabilities
- Range queries
- Atomic operations
- Partial updates
- Full TypeScript support
- ES Modules support

## Installation

```bash
npm install hpkv-rest-client
```

## Quick Start

```typescript
import HPKVRestClient from 'hpkv-rest-client';

const client = new HPKVRestClient('https://api.hpkv.io', 'https://nexus.hpkv.io', 'your-api-key');

// Set a value
await client.set('my-key', 'my-value');

// Get a value
const result = await client.get('my-key');
console.log(result.value);

// Store JSON
await client.set('user:1', {
  name: 'John Doe',
  email: 'john@example.com',
});

// Partial update
await client.set(
  'user:1',
  {
    email: 'john.updated@example.com',
  },
  true
);

// Increment counter
const counter = await client.increment('visits', 1);

// Range query
const records = await client.getRange('start', 'end', 100);

// Semantic search
const searchResults = await client.nexusSearch('find user information');

// AI-powered query
const answer = await client.nexusQuery('Are there any products with rating less then 2?');
```

## API Reference

### Constructor

```typescript
new HPKVRestClient(baseUrl: string, nexusBaseUrl: string, apiKey: string)
```

### Methods

#### `set(key: string, value: string | Record<string, any>, partialUpdate?: boolean): Promise<RecordResponse>`

Set a value for a key. If `partialUpdate` is true, the value will be appended to the existing. If the existing and new values are valid json, it performs a JSOn patching.

#### `get(key: string): Promise<RecordResponse>`

Get a value by key.

#### `delete(key: string): Promise<RecordResponse>`

Delete a key-value pair.

#### `increment(key: string, increment?: number): Promise<RecordResponse>`

Increment or decrement a numeric value atomically.

#### `getRange(startKey: string, endKey: string, limit?: number): Promise<RangeResponse>`

Query records within a key range.

#### `nexusSearch(query: string, options?: SearchOptions): Promise<SearchResponse>`

Perform semantic search using Nexus Search.

#### `nexusQuery(query: string, options?: QueryOptions): Promise<QueryResponse>`

Get AI-generated answers using Nexus Query.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test
npm run test:watch

# Run example
npm run example
```

## License

MIT
