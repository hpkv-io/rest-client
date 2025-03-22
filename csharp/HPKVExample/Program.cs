using System;
using System.Text.Json;
using System.Threading.Tasks;
using HPKVClient;
using HPKVClient.Models;

namespace HPKVExample
{
    class Program
    {
        // Replace with your actual API key and base URL
        private const string ApiKey = "fa7d6c5846884d0cb56f339961531d45";
        private const string BaseUrl = "https://api-eu-1.hpkv.io";

        static async Task Main(string[] args)
        {
            try
            {
                Console.WriteLine("HPKV Client Examples:");
                Console.WriteLine("---------------------\n");

                var client = new HPKVClient.HPKVClient(BaseUrl, ApiKey);

                // Example 1: Set and get a simple value
                Console.WriteLine("Example 1: Set and get a simple value");
                await client.SetAsync("greeting", "Hello, HPKV!");
                var greeting = await client.GetAsync("greeting");
                Console.WriteLine($"Retrieved value: {greeting.Value}");
                Console.WriteLine("---------------------\n");

                // Example 2: Store and retrieve a JSON object
                Console.WriteLine("Example 2: Store and retrieve a JSON object");
                var user = new
                {
                    id = 1001,
                    name = "Alice Johnson",
                    email = "alice@example.com",
                    roles = new[] { "admin", "user" }
                };

                await client.SetAsync("user:1002", user);
                var retrievedUser = await client.GetAsync("user:1002");
                Console.WriteLine($"Retrieved user: {retrievedUser.Value}");
                Console.WriteLine("---------------------\n");

                // Example 3: Partial update (JSON merge)
                Console.WriteLine("Example 3: Partial update (JSON merge)");
                await client.SetAsync("user:1001", new
                {
                    lastLogin = DateTime.UtcNow.ToString("o"),
                    location = "New York"
                }, true);

                var updatedUser = await client.GetAsync("user:1002");
                Console.WriteLine($"Updated user: {updatedUser.Value}");
                Console.WriteLine("---------------------\n");

                // Example 4: Increment counter
                Console.WriteLine("Example 4: Increment counter");
                await client.SetAsync("counter:visits", "10");
                Console.WriteLine($"Initial counter value: {(await client.GetAsync("counter:visits")).Value}");

                var incrementResult = await client.IncrementAsync("counter:visits", 5);
                Console.WriteLine($"After incrementing by 5: {incrementResult.Result}");

                var decrementResult = await client.IncrementAsync("counter:visits", -2);
                Console.WriteLine($"After decrementing by 2: {decrementResult.Result}");
                Console.WriteLine("---------------------\n");

                // Example 5: Range query
                Console.WriteLine("Example 5: Range query");
                // First, let's add some test data
                for (int i = 1; i <= 5; i++)
                {
                    await client.SetAsync($"test:{i}", $"Value {i}");
                }

                var rangeResults = await client.QueryAsync("test:1", "test:5", 10);
                Console.WriteLine("Range query results:");
                
                foreach (var record in rangeResults.Records)
                {
                    Console.WriteLine($"- {record.Key}: {record.Value}");
                }
                
                Console.WriteLine($"Total records: {rangeResults.Count}");
                Console.WriteLine($"Truncated: {rangeResults.Truncated}");
                Console.WriteLine("---------------------\n");

                // Example 6: Delete a record
                Console.WriteLine("Example 6: Delete a record");
                await client.DeleteAsync("test:3");
                Console.WriteLine("Deleted test:3");

                try
                {
                    await client.GetAsync("test:3");
                }
                catch (HPKVException error)
                {
                    Console.WriteLine($"Error when trying to get deleted key: {error.Message}");
                    Console.WriteLine($"Status code: {(int)error.StatusCode}");
                }
                Console.WriteLine("---------------------\n");

                // Cleanup example data
                Console.WriteLine("Cleaning up example data...");
                await client.DeleteAsync("greeting");
                await client.DeleteAsync("user:1002");
                await client.DeleteAsync("counter:visits");
                for (int i = 1; i <= 5; i++)
                {
                    if (i != 3) // We already deleted test:3
                    {
                        await client.DeleteAsync($"test:{i}");
                    }
                }
                Console.WriteLine("Cleanup complete!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                if (ex is HPKVException hpkvEx)
                {
                    Console.WriteLine($"Status code: {(int)hpkvEx.StatusCode}");
                    if (hpkvEx.ResponseData != null)
                    {
                        Console.WriteLine($"Response data: {JsonSerializer.Serialize(hpkvEx.ResponseData)}");
                    }
                }
            }
        }
    }
}
