const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const userRoutes = require('./routes/users.routes');
const todoRoutes = require('./routes/todos.routes');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/users', userRoutes);
app.use('/todos', todoRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Express CRUD API with JSON Database',
    endpoints: {
      users: {
        getAll: 'GET /users',
        getSingle: 'GET /users/:userId',
        create: 'POST /users/add',
        update: 'PUT /users/update/:userId',
        delete: 'DELETE /users/delete/:userId'
      },
      todos: {
        getAll: 'GET /todos',
        getSingle: 'GET /todos/:todoId',
        create: 'POST /todos/add',
        update: 'PUT /todos/update/:todoId',
        delete: 'DELETE /todos/delete/:todoId'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Initialize database file if it doesn't exist
async function initializeDatabase() {
  const dbPath = path.join(__dirname, 'db.json');
  try {
    await fs.access(dbPath);
    console.log('Database file exists');
  } catch (error) {
    // File doesn't exist, create it
    const initialData = {
      users: [],
      todos: []
    };
    await fs.writeFile(dbPath, JSON.stringify(initialData, null, 2));
    console.log('Database file created');
  }
}

// Start server
app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`Server is running on http://localhost:${PORT}`);
});