import { createClient } from 'redis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
console.log(`Connecting to Redis at: ${redisUrl}...`);

async function inspectRedis() {
  const client = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        return false; // do not retry
      }
    }
  });

  client.on('error', (err) => {
    // Suppress logs on connection failure
  });

  try {
    await client.connect();
    console.log('Connected to Redis successfully!\n');

    // Fetch all keys matching netpulse:*
    const keys = await client.keys('netpulse:*');
    if (keys.length === 0) {
      console.log('No keys found starting with "netpulse:*". The database is currently empty or has not been seeded.');
      await client.disconnect();
      return;
    }

    console.log(`Found ${keys.length} keys:`);
    for (const key of keys) {
      console.log(`\n--------------------------------------------`);
      console.log(`Key: ${key}`);
      
      const type = await client.type(key);
      console.log(`Type: ${type}`);

      if (type === 'string') {
        const val = await client.get(key);
        try {
          console.log('Value (JSON):', JSON.stringify(JSON.parse(val), null, 2));
        } catch {
          console.log('Value:', val);
        }
      } else if (type === 'hash') {
        const val = await client.hGetAll(key);
        const parsedVal = {};
        for (const [field, rawJson] of Object.entries(val)) {
          try {
            parsedVal[field] = JSON.parse(rawJson);
          } catch {
            parsedVal[field] = rawJson;
          }
        }
        console.log('Value (Hash):', JSON.stringify(parsedVal, null, 2));
      } else {
        console.log('Unsupported type for automated printing.');
      }
    }
    console.log(`--------------------------------------------\n`);
  } catch (error) {
    console.error(`\nFailed to connect to Redis at ${redisUrl}.`);
    console.error('Ensure that your Redis server is installed and running on port 6379.');
  } finally {
    try {
      await client.disconnect();
    } catch {}
  }
}

inspectRedis();
