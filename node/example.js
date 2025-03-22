const HPKVClient = require('./hpkv-client');

// Replace with your actual API key and base URL
const client = new HPKVClient('https://api-eu-1.hpkv.io', 'fa7d6c5846884d0cb56f339961531d45');

async function runExamples() {
  try {
    console.log('HPKV Client Examples:');
    console.log('---------------------\n');

    // Example 1: Set and get a simple value
    console.log('Example 1: Set and get a simple value');
    await client.set('greeting', 'Hello, HPKV!');
    const greeting = await client.get('greeting');
    console.log('Retrieved value:', greeting.value);
    console.log('---------------------\n');

    // Example 2: Store and retrieve a JSON object
    console.log('Example 2: Store and retrieve a JSON object');
    const user = {
      id: 1001,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      roles: ['admin', 'user']
    };
    
    await client.set('user:1002', user);
    const retrievedUser = await client.get('user:1002');
    console.log('Retrieved user:', JSON.parse(retrievedUser.value));
    console.log('---------------------\n');

    // Example 3: Partial update (JSON merge)
    console.log('Example 3: Partial update (JSON merge)');
    await client.set('user:1001', { 
      lastLogin: new Date().toISOString(),
      location: 'New York'
    }, true);
    
    const updatedUser = await client.get('user:1002');
    console.log('Updated user:', JSON.parse(updatedUser.value));
    console.log('---------------------\n');

    // Example 4: Increment counter
    console.log('Example 4: Increment counter');
    await client.set('counter:visits', '10');
    console.log('Initial counter value:', (await client.get('counter:visits')).value);
    
    const incrementResult = await client.increment('counter:visits', 5);
    console.log('After incrementing by 5:', incrementResult.result);
    
    const decrementResult = await client.increment('counter:visits', -2);
    console.log('After decrementing by 2:', decrementResult.result);
    console.log('---------------------\n');

    // Example 5: Range query
    console.log('Example 5: Range query');
    // First, let's add some test data
    for (let i = 1; i <= 5; i++) {
      await client.set(`test:${i}`, `Value ${i}`);
    }
    
    const rangeResults = await client.query('test:1', 'test:5', 10);
    console.log('Range query results:');
    rangeResults.records.forEach(record => {
      console.log(`- ${record.key}: ${record.value}`);
    });
    console.log(`Total records: ${rangeResults.count}`);
    console.log(`Truncated: ${rangeResults.truncated}`);
    console.log('---------------------\n');

    // Example 6: Delete a record
    console.log('Example 6: Delete a record');
    await client.delete('test:3');
    console.log('Deleted test:3');
    
    try {
      await client.get('test:3');
    } catch (error) {
      console.log('Error when trying to get deleted key:', error.message);
      console.log('Status code:', error.status);
    }
    console.log('---------------------\n');

    // Cleanup example data
    console.log('Cleaning up example data...');
    await client.delete('greeting');
    await client.delete('user:1002');
    await client.delete('counter:visits');
    for (let i = 1; i <= 5; i++) {
      if (i !== 3) { // We already deleted test:3
        await client.delete(`test:${i}`);
      }
    }
    console.log('Cleanup complete!');

  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run the examples
runExamples(); 