# HPKV REST Client for Python

A Python client library for interacting with the HPKV (High-Performance Key-Value) REST API.

## Features

- Simple and intuitive API
- Both synchronous and asynchronous clients
- Comprehensive error handling
- Data models using Python dataclasses
- Supports all HPKV operations:
  - Get/Set/Delete records
  - Atomic increments
  - Range queries
  - Partial updates

## Installation

### Via pip (coming soon)

```bash
pip install hpkv-client
```

### Manual Installation

1. Clone this repository
2. Install requirements:
   ```bash
   pip install requests aiohttp
   ```

## Usage

### Synchronous Client

```python
from hpkv_client import HPKVClient

# Initialize the client
client = HPKVClient(
    "https://api-eu-1.hpkv.io",  # Your HPKV API endpoint
    "your-api-key"               # Your HPKV API key
)

# Set a value
client.set("mykey", "Hello, HPKV!")

# Get a value
result = client.get("mykey")
print(f"Value: {result['value']}")

# Store a complex object
user = {
    "id": 1001,
    "name": "John Doe",
    "email": "john@example.com"
}
client.set("user:1001", user)

# Partial update
client.set("user:1001", {"lastLogin": "2023-03-22T12:00:00Z"}, partial_update=True)

# Increment a counter
client.set("visits", "10")
new_value = client.increment("visits", 5)
print(f"New count: {new_value['result']}")

# Query a range of keys
range_result = client.query("user:1000", "user:2000", 100)
for record in range_result["records"]:
    print(f"{record['key']}: {record['value']}")

print(f"Total records: {range_result['count']}")
print(f"Truncated: {range_result['truncated']}")

# Delete a key
client.delete("mykey")
```

### Asynchronous Client

```python
import asyncio
from async_hpkv_client import AsyncHPKVClient

async def main():
    async with AsyncHPKVClient(
        "https://api-eu-1.hpkv.io",  # Your HPKV API endpoint
        "your-api-key"               # Your HPKV API key
    ) as client:
        # Set a value
        await client.set("mykey", "Hello, HPKV!")

        # Get a value
        result = await client.get("mykey")
        print(f"Value: {result['value']}")

        # Query a range of keys
        range_result = await client.query("user:1000", "user:2000", 100)
        for record in range_result["records"]:
            print(f"{record['key']}: {record['value']}")

if __name__ == "__main__":
    asyncio.run(main())
```

## Error Handling

The client throws `HPKVException` when an API error occurs. This exception includes:

- Error message
- HTTP status code
- Response data

Example:

```python
from hpkv_client import HPKVClient, HPKVException

client = HPKVClient("https://api-eu-1.hpkv.io", "your-api-key")

try:
    client.get("non-existent-key")
except HPKVException as ex:
    print(f"Error: {ex}")
    print(f"Status code: {ex.status_code}")
    print(f"Response data: {ex.response_data}")
```

## Data Models

The library includes dataclasses for both requests and responses:

### Request Models
- `SetRecordRequest` - For storing records
- `IncrementRequest` - For incrementing/decrementing values

### Response Models
- `BaseResponse` - Base class for all responses
- `GetRecordResponse` - Response when retrieving a single record
- `RangeQueryResponse` - Response when querying a range of records
- `OperationResponse` - Response for set/delete operations
- `IncrementResponse` - Response for increment/decrement operations

## License

MIT License 