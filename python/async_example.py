import asyncio
import json
from datetime import datetime

from async_hpkv_client import AsyncHPKVClient, HPKVException


# Replace with your actual API key and base URL
API_KEY = "fa7d6c5846884d0cb56f339961531d45"
BASE_URL = "https://api-eu-1.hpkv.io"


async def main():
    try:
        print("HPKV Async Client Examples:")
        print("-------------------------\n")

        async with AsyncHPKVClient(BASE_URL, API_KEY) as client:
            # Example 1: Set and get a simple value
            print("Example 1: Set and get a simple value")
            await client.set("greeting", "Hello, HPKV!")
            greeting = await client.get("greeting")
            print(f"Retrieved value: {greeting['value']}")
            print("---------------------\n")

            # Example 2: Store and retrieve a JSON object
            print("Example 2: Store and retrieve a JSON object")
            user = {
                "id": 1001,
                "name": "Alice Johnson",
                "email": "alice@example.com",
                "roles": ["admin", "user"]
            }
            
            await client.set("user:1002", user)
            retrieved_user = await client.get("user:1002")
            print(f"Retrieved user: {retrieved_user['value']}")
            print("---------------------\n")

            # Example 3: Partial update (JSON merge)
            print("Example 3: Partial update (JSON merge)")
            await client.set("user:1001", {
                "lastLogin": datetime.now().isoformat(),
                "location": "New York"
            }, partial_update=True)
            
            updated_user = await client.get("user:1002")
            print(f"Updated user: {updated_user['value']}")
            print("---------------------\n")

            # Example 4: Increment counter
            print("Example 4: Increment counter")
            await client.set("counter:visits", "10")
            print(f"Initial counter value: {(await client.get('counter:visits'))['value']}")
            
            increment_result = await client.increment("counter:visits", 5)
            print(f"After incrementing by 5: {increment_result['result']}")
            
            decrement_result = await client.increment("counter:visits", -2)
            print(f"After decrementing by 2: {decrement_result['result']}")
            print("---------------------\n")

            # Example 5: Range query
            print("Example 5: Range query")
            # First, let's add some test data
            for i in range(1, 6):
                await client.set(f"test:{i}", f"Value {i}")
            
            range_results = await client.query("test:1", "test:5", 10)
            print("Range query results:")
            for record in range_results["records"]:
                print(f"- {record['key']}: {record['value']}")
            
            print(f"Total records: {range_results['count']}")
            print(f"Truncated: {range_results['truncated']}")
            print("---------------------\n")

            # Example 6: Delete a record
            print("Example 6: Delete a record")
            await client.delete("test:3")
            print("Deleted test:3")
            
            try:
                await client.get("test:3")
            except HPKVException as error:
                print(f"Error when trying to get deleted key: {error}")
                print(f"Status code: {error.status_code}")
            print("---------------------\n")

            # Cleanup example data
            print("Cleaning up example data...")
            await client.delete("greeting")
            await client.delete("user:1002")
            await client.delete("counter:visits")
            for i in range(1, 6):
                if i != 3:  # We already deleted test:3
                    await client.delete(f"test:{i}")
            print("Cleanup complete!")

    except Exception as e:
        print(f"Error: {e}")
        if isinstance(e, HPKVException):
            print(f"Status code: {e.status_code}")
            if e.response_data:
                print(f"Response data: {json.dumps(e.response_data)}")


if __name__ == "__main__":
    asyncio.run(main()) 