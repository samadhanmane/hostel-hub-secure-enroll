const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function clearData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear all collections
    const collections = ['years', 'departments', 'categories', 'roomtypes', 'colleges', 'hostels'];
    
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection).deleteMany({});
      console.log(`Cleared ${collection} collection`);
    }

    console.log('All sample data cleared successfully!');

  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

clearData(); 