const redis = require('redis');
const client = redis.createClient({
    host: '192.168.14.12',
    port: 6379
});

async function runLoadTest() {
    try {
        await client.connect(); // Connect before using the client
        console.log('Starting load test...');
        const startTime = Date.now();
        let operations = 0;
        const duration = 30000; // 30 seconds test
        
        while (Date.now() - startTime < duration) {
            // Random operations
            const operation = Math.floor(Math.random() * 4);
            const key = `test:key:${Math.floor(Math.random() * 1000)}`;
            
            switch(operation) {
                case 0: // GET
                    await client.get(key);
                    break;
                case 1: // SET
                    await client.set(key, `value-${Date.now()}`);
                    break;
                case 2: // DEL
                    await client.del(key);
                    break;
                case 3: // KEYS
                    await client.keys('test:key:*');
                    break;
            }
            
            operations++;
            
            if (operations % 100 === 0) {
                const elapsed = (Date.now() - startTime) / 1000;
                console.log(`Operations: ${operations}, OPS: ${(operations / elapsed).toFixed(2)}`);
            }
        }
        
        const totalTime = (Date.now() - startTime) / 1000;
        console.log('\nLoad Test Results:');
        console.log(`Total Operations: ${operations}`);
        console.log(`Total Time: ${totalTime.toFixed(2)} seconds`);
        console.log(`Operations per second: ${(operations / totalTime).toFixed(2)}`);
        
        await client.quit();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

runLoadTest(); 