const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Year = require('./models/Year');
const Department = require('./models/Department');
const Category = require('./models/Category');
const RoomType = require('./models/RoomType');
const College = require('./models/College');
const Hostel = require('./models/Hostel');

// Sample data
const years = [
  { name: '2024-25' },
  { name: '2023-24' },
  { name: '2022-23' },
  { name: '2021-22' }
];

const departments = [
  { name: 'Computer Science' },
  { name: 'Information Technology' },
  { name: 'Electronics & Communication' },
  { name: 'Mechanical Engineering' },
  { name: 'Civil Engineering' },
  { name: 'Electrical Engineering' },
  { name: 'Chemical Engineering' },
  { name: 'Biotechnology' }
];

const categories = [
  { name: 'General' },
  { name: 'OBC' },
  { name: 'SC' },
  { name: 'ST' },
  { name: 'EWS' }
];

const roomTypes = [
  { name: 'Single Seater' },
  { name: 'Double Seater' },
  { name: 'Triple Seater' },
  { name: 'Four Seater' }
];

const colleges = [
  { name: 'Government Engineering College, Pune' },
  { name: 'Pune Institute of Computer Technology' },
  { name: 'College of Engineering, Pune' },
  { name: 'Vishwakarma Institute of Technology' }
];

const hostels = [
  { name: 'Boys Hostel A', type: 'boys' },
  { name: 'Boys Hostel B', type: 'boys' },
  { name: 'Girls Hostel A', type: 'girls' },
  { name: 'Girls Hostel B', type: 'girls' }
];

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Year.deleteMany({});
    await Department.deleteMany({});
    await Category.deleteMany({});
    await RoomType.deleteMany({});
    await College.deleteMany({});
    await Hostel.deleteMany({});

    // Insert new data
    await Year.insertMany(years);
    await Department.insertMany(departments);
    await Category.insertMany(categories);
    await RoomType.insertMany(roomTypes);
    await College.insertMany(colleges);
    await Hostel.insertMany(hostels);

    console.log('Sample data seeded successfully!');
    console.log('Years:', years.length);
    console.log('Departments:', departments.length);
    console.log('Categories:', categories.length);
    console.log('Room Types:', roomTypes.length);
    console.log('Colleges:', colleges.length);
    console.log('Hostels:', hostels.length);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedData(); 