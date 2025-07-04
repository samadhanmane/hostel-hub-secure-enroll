const express = require('express');
const College = require('../models/College');
const Year = require('../models/Year');
const Department = require('../models/Department');
const Hostel = require('../models/Hostel');
const RoomType = require('../models/RoomType');
const Category = require('../models/Category');

const router = express.Router();

router.get('/colleges', async (req, res) => {
  const colleges = await College.find();
  res.json(colleges);
});

router.get('/years', async (req, res) => {
  const years = await Year.find();
  res.json(years);
});

router.get('/departments', async (req, res) => {
  const departments = await Department.find();
  res.json(departments);
});

router.get('/hostels', async (req, res) => {
  const hostels = await Hostel.find();
  res.json(hostels);
});

router.get('/room-types', async (req, res) => {
  const roomTypes = await RoomType.find();
  res.json(roomTypes);
});

router.get('/categories', async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

// Hostel years are just the years collection (or can be a separate model if needed)
router.get('/hostel-years', async (req, res) => {
  const years = await Year.find();
  res.json(years);
});

module.exports = router; 