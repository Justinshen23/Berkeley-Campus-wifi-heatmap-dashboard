const sqlite3 = require('sqlite3').verbose();
let sql;

const db = new sqlite3.Database('./heatmap_data.db', sqlite3.OPEN_READWRITE);

function addUser(user) {
    sql = `INSERT INTO users(location, rating) VALUES (?,?)`;
    db.run(sql, [user.location, user.rating], err => {
        if (err) return err.message;
    });
    return {success: true};
}

function deleteUser(id) {
    sql = `DELETE FROM users WHERE id=?`;
    db.run(sql, [id], err => {
        if (err) return err.message;
    });
    return {success: true};
}

async function getAllUsers() {
    sql = `SELECT * FROM users`;
    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) reject(err.message);
            resolve(rows);
        });
    })
}

module.exports = {
    addUser,
    deleteUser,
    getAllUsers,
};