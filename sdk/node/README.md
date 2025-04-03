# HPKV REST Client

A NodeJs client for the high-performance key-value store ([HPKV](https://hpkv.io))

## Features

- High-performance key-value operations:
    - Set/Get records
    - Range queries
    - Atmoic Increment/Decrement
    - Partial updates
- Semantic search and query capabilities:
  - Semantic search in records
  - Natural language querying records

## PreRequisites

You need an HPKV API key. You can sign up and generate a free key [here](https://hpkv.io/signup).

Find your HPKV API key and urls at[ HPKV Dashboard](https://hpkv.io/dashboard/api-keys)

## Installation

```bash
npm install @hpkv/rest-client
```

## Quick Start

```typescript
import HPKVRestClient from '@hpkv/rest-client';

const client = new HPKVRestClient('your-hpkv-api-base-url', 'your-hpkv-nexus-api-base-url', 'your-api-key');

// Set a value
await client.set('my-key', 'my-value');

// Get a value
const result = await client.get('my-key');

// Store JSON
await client.set('user:1', {
  name: 'John Doe',
  email: 'john@example.com',
});

// Partial update - updates the value of email and adds a new address property
await client.set(
  'user:1',
  {
    email: 'john.updated@example.com',
    address: 'John Doe address'
  },
  true
);

// Atomic Increment counter
const counter = await client.increment('visits', 1);

// Range query 
const records = await client.getRange('start', 'end', 100);

// Semantic search
const searchResults = await client.nexusSearch('find John Doe''s information');

// AI-powered query
const answer = await client.nexusQuery('What is John Doe''s email address?');
```

## API Reference

### Constructor

```typescript
new HPKVRestClient(baseUrl: string, nexusBaseUrl: string, apiKey: string)
```

### Methods

#### `set(key: string, value: string | Record<string, any>, partialUpdate?: boolean): Promise<RecordResponse>`

Set a value for a key. If `partialUpdate` is true, the value will be appended to the existing. If the existing and new values are valid JSON, it performs an atomic JSON patching.

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

## Read more

- [Introduction to HPKV Nexus Search](https://hpkv.io/blog/2025/03/introducing-nexus-search)

- [HPKV REST API Reference](https://hpkv.io/docs/rest-api)

- [HPKV Nexus Reference](https://hpkv.io/docs/nexus-search)

## License

MIT
