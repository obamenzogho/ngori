#!/usr/bin/env node

// Load environment variables from .env
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI is not set in .env.local');
  console.error('Please create .env.local with your MongoDB connection string');
  process.exit(1);
}

const AdminSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Admin = mongoose.model('Admin', AdminSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function setupAdmin() {
  try {
    console.log('🔐 Ngori Admin Setup');
    console.log('-------------------\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin exists
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      const answer = await new Promise((resolve) => {
        rl.question('Admin already exists. Overwrite? (y/n): ', resolve);
      });
      if (answer.toLowerCase() !== 'y') {
        console.log('❌ Cancelled');
        process.exit(0);
      }
    }

    // Get password
    const password = await new Promise((resolve) => {
      rl.question('Enter admin password: ', resolve);
    });

    if (!password || password.length < 6) {
      console.log('❌ Password must be at least 6 characters');
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save or update admin
    if (existingAdmin) {
      await Admin.updateOne({}, { password: hashedPassword });
    } else {
      await Admin.create({ password: hashedPassword });
    }

    console.log('\n✅ Admin password saved successfully!');
    console.log('\n🎉 You can now login at: http://localhost:3000/admin/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdmin();
