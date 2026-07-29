const { MongoClient } = require('mongodb');

let client = null;
let isConnected = false;
let hasAttemptedConnection = false;

async function connect() {
  if (client) return client;
  
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/gitpulse';
  hasAttemptedConnection = true;
  
  try {
    // Use a short 2000ms timeout so the backend starts instantly even if MongoDB is offline
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 2000 });
    await client.connect();
    isConnected = true;
    console.log('[Database] Connected to MongoDB successfully.');
    return client;
  } catch (error) {
    client = null;
    isConnected = false;
    console.log('[Database] MongoDB offline or not installed. Seamlessly using In-Memory Cache fallback.');
    return null;
  }
}

async function getDatabase() {
  if (!client && !isConnected && !hasAttemptedConnection) {
    const conn = await connect();
    if (!conn) return null;
  }
  return client && isConnected ? client.db() : null;
}

async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    isConnected = false;
    hasAttemptedConnection = false;
    console.log('MongoDB connection closed');
  }
}

module.exports = { connect, getDatabase, closeConnection };
