const { MongoClient } = require('mongodb');

const uri = 'mongodb://admin:change_me_in_production@mongodb:27017/realtime_demo?authSource=admin';
const client = new MongoClient(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

// Helper functions for generating realistic data
function generateStockPrice(basePrice, volatility) {
  const change = (Math.random() - 0.5) * volatility;
  return Math.max(0, basePrice + change);
}

function generateUserActivity() {
  const activities = ['login', 'purchase', 'view', 'search', 'logout'];
  return activities[Math.floor(Math.random() * activities.length)];
}

function generateSystemMetrics() {
  return {
    cpu: Math.random() * 100,
    memory: Math.random() * 100,
    disk: Math.random() * 100,
    network: Math.random() * 1000
  };
}

async function generateData(db) {
  try {
    // Create collections
    const stockPrices = db.collection('stock_prices');
    const userActivities = db.collection('user_activities');
    const systemMetrics = db.collection('system_metrics');

    // Generate initial stock prices
    const stocks = [
      { symbol: 'AAPL', basePrice: 150 },
      { symbol: 'GOOGL', basePrice: 2800 },
      { symbol: 'MSFT', basePrice: 300 },
      { symbol: 'AMZN', basePrice: 3300 },
      { symbol: 'TSLA', basePrice: 900 }
    ];

    // Generate stock prices
    for (const stock of stocks) {
      await stockPrices.insertOne({
        symbol: stock.symbol,
        price: generateStockPrice(stock.basePrice, 10),
        timestamp: new Date()
      });
    }

    // Generate user activities
    for (let i = 0; i < 5; i++) {
      await userActivities.insertOne({
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        activity: generateUserActivity(),
        timestamp: new Date()
      });
    }

    // Generate system metrics
    await systemMetrics.insertOne({
      ...generateSystemMetrics(),
      timestamp: new Date()
    });

    return true;
  } catch (err) {
    console.error('Error generating data:', err);
    return false;
  }
}

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('realtime_demo');
    let count = 0;

    while (true) {
      const success = await generateData(db);
      if (success) {
        count++;
        console.log(`Generated ${count} batches of data`);
      }
      
      // Wait for 1 second before next batch
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (err) {
    console.error('Error:', err);
    // Wait 5 seconds before retrying
    await new Promise(resolve => setTimeout(resolve, 5000));
    run();
  }
}

run(); 