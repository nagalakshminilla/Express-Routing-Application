const fs = require('fs').promises;
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');

class DBHelper {
  // Read from database
  static async readDB() {
    try {
      const data = await fs.readFile(dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or is empty, return default structure
      return { users: [], todos: [] };
    }
  }

  // Write to database
  static async writeDB(data) {
    try {
      await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('Error writing to database:', error);
      return false;
    }
  }

  // Generate unique ID
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

module.exports = DBHelper;