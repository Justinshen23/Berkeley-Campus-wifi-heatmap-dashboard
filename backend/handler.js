const sqlite3 = require("sqlite3").verbose();
const { ALLOWED_LOCATIONS } = require("./allowedLocations");

async function openDatabase(filename = "./heatmap_data.db") {
  const db = new sqlite3.Database(filename);

  const run = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.run(sql, params, function onRun(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });

  const all = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

  await run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      location TEXT NOT NULL,
      rating INTEGER NOT NULL
    )`
  );

  const placeholders = ALLOWED_LOCATIONS.map(() => "?").join(",");
  await run(
    `DELETE FROM users
     WHERE location NOT IN (${placeholders})
        OR rating NOT IN (1, 2, 3, 4, 5)`,
    ALLOWED_LOCATIONS
  );

  async function addUser(user) {
    await run(`INSERT INTO users(location, rating) VALUES (?,?)`, [
      user.location,
      user.rating,
    ]);
    return { success: true };
  }

  async function deleteUser(id) {
    const result = await run(`DELETE FROM users WHERE id=?`, [id]);
    return { success: true, deleted: result.changes };
  }

  async function getPublicUsers() {
    return all(`SELECT location, rating FROM users`, []);
  }

  async function getAdminUsers() {
    return all(`SELECT id, location, rating FROM users`, []);
  }

  function close() {
    return new Promise((resolve, reject) => {
      db.close((err) => (err ? reject(err) : resolve()));
    });
  }

  return {
    addUser,
    deleteUser,
    getPublicUsers,
    getAdminUsers,
    close,
  };
}

module.exports = {
  openDatabase,
};
