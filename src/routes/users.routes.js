const express = require('express');
const router = express.Router();
const DBHelper = require('../db.helper');

// GET all users
router.get('/', async (req, res) => {
  try {
    const db = await DBHelper.readDB();
    res.status(200).json({
      success: true,
      count: db.users.length,
      data: db.users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// GET single user by ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await DBHelper.readDB();
    const user = db.users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// POST create new user
router.post('/add', async (req, res) => {
  try {
    const { name, email, age } = req.body;

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    const db = await DBHelper.readDB();
    
    // Check if email already exists
    const existingUser = db.users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const newUser = {
      id: DBHelper.generateId(),
      name,
      email,
      age: age || null,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    await DBHelper.writeDB(db);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// PUT update user
router.put('/update/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update data provided'
      });
    }

    const db = await DBHelper.readDB();
    const userIndex = db.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`
      });
    }

    // Update user while preserving ID and createdAt
    db.users[userIndex] = {
      ...db.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await DBHelper.writeDB(db);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: db.users[userIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// DELETE user
router.delete('/delete/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await DBHelper.readDB();
    
    const userIndex = db.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`
      });
    }

    const deletedUser = db.users.splice(userIndex, 1)[0];
    await DBHelper.writeDB(db);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: deletedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

module.exports = router;