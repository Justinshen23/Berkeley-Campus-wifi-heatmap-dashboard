const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./handler');
const parser = require('body-parser');
require('dotenv').config();

app.use(parser.urlencoded({extended: false}));
app.use(parser.json());
app.use(cors())

app.get("/get-users", async (request, response) => {
    const results = await db.getAllUsers();
    response.status(200).json({results: results});
});

app.post("/add-user", async (request, response) => {   
    const results = await db.addUser(request.body);
    response.status(201).json({results});
});

app.delete("/delete-user", async (request, response) => {
    await db.deleteUser(parseInt(request.query.id));
    response.status(200).json({success: true});
});

const port = process.env.PORT || 2024;
app.listen(port, () => {
    console.log(`server running on port ${port}`);
});