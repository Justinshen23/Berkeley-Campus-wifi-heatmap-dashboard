const express = require("express");
const cors = require("cors");
const db = require("./handler");
require("dotenv").config();


const app = express();


app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());


app.get("/get-users", async (request, response) => {
  try {
    const results = await db.getAllUsers();
    response.status(200).json({ results });
  } catch (error) {
    console.error("Failed to retrieve users:", error);
    response.status(500).json({ error: "Failed to retrieve users" });
  }
});


app.post("/add-user", async (request, response) => {
  try {
    const { location, rating } = request.body;
    const numericRating = Number(rating);


    if (
      typeof location !== "string" ||
      !location.trim() ||
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return response.status(400).json({
        error: "A location and integer rating from 1 to 5 are required",
      });
    }


    const result = await db.addUser({
      location: location.trim(),
      rating: numericRating,
    });


    response.status(201).json({ results: result });
  } catch (error) {
    console.error("Failed to add user:", error);
    response.status(500).json({ error: "Failed to add user" });
  }
});


app.delete("/delete-user", async (request, response) => {
  try {
    const id = Number(request.query.id);


    if (!Number.isInteger(id)) {
      return response.status(400).json({ error: "A valid ID is required" });
    }


    await db.deleteUser(id);
    response.status(200).json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);
    response.status(500).json({ error: "Failed to delete user" });
  }
});


const port = process.env.PORT || 2024;


db.initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database initialization failed:", error);
    process.exit(1);
  });
