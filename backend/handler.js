const { Pool } = require("pg");


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      location VARCHAR(100) NOT NULL,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5)
    )
  `);
}


async function addUser(user) {
  const result = await pool.query(
    `INSERT INTO users (location, rating)
     VALUES ($1, $2)
     RETURNING *`,
    [user.location, user.rating]
  );


  return result.rows[0];
}


async function deleteUser(id) {
  await pool.query(
    "DELETE FROM users WHERE id = $1",
    [id]
  );


  return { success: true };
}


async function getAllUsers() {
  const result = await pool.query(
    "SELECT * FROM users ORDER BY id DESC"
  );


  return result.rows;
}


module.exports = {
  initializeDatabase,
  addUser,
  deleteUser,
  getAllUsers,
};
