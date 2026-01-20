const express = require('express');
const router = express.Router();
const DBHelper = require('../db.helper');

// GET all todos
router.get('/', async (req, res) => {
  try {
    const db = await DBHelper.readDB();
    res.status(200).json({
      success: true,
      count: db.todos.length,
      data: db.todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching todos',
      error: error.message
    });
  }
});

// GET single todo by ID
router.get('/:todoId', async (req, res) => {
  try {
    const { todoId } = req.params;
    const db = await DBHelper.readDB();
    const todo = db.todos.find(t => t.id === todoId);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: `Todo with ID ${todoId} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching todo',
      error: error.message
    });
  }
});

// POST create new todo
router.post('/add', async (req, res) => {
  try {
    const { title, description, userId, completed = false } = req.body;

    // Basic validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const db = await DBHelper.readDB();
    
    // Verify user exists if userId is provided
    if (userId) {
      const userExists = db.users.find(user => user.id === userId);
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: `User with ID ${userId} not found`
        });
      }
    }

    const newTodo = {
      id: DBHelper.generateId(),
      title,
      description: description || '',
      userId: userId || null,
      completed,
      createdAt: new Date().toISOString()
    };

    db.todos.push(newTodo);
    await DBHelper.writeDB(db);

    res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      data: newTodo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating todo',
      error: error.message
    });
  }
});

// PUT update todo
router.put('/update/:todoId', async (req, res) => {
  try {
    const { todoId } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update data provided'
      });
    }

    const db = await DBHelper.readDB();
    const todoIndex = db.todos.findIndex(t => t.id === todoId);

    if (todoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Todo with ID ${todoId} not found`
      });
    }

    // Update todo
    db.todos[todoIndex] = {
      ...db.todos[todoIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await DBHelper.writeDB(db);

    res.status(200).json({
      success: true,
      message: 'Todo updated successfully',
      data: db.todos[todoIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating todo',
      error: error.message
    });
  }
});

// DELETE todo
router.delete('/delete/:todoId', async (req, res) => {
  try {
    const { todoId } = req.params;
    const db = await DBHelper.readDB();
    
    const todoIndex = db.todos.findIndex(t => t.id === todoId);

    if (todoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Todo with ID ${todoId} not found`
      });
    }

    const deletedTodo = db.todos.splice(todoIndex, 1)[0];
    await DBHelper.writeDB(db);

    res.status(200).json({
      success: true,
      message: 'Todo deleted successfully',
      data: deletedTodo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting todo',
      error: error.message
    });
  }
});

module.exports = router;