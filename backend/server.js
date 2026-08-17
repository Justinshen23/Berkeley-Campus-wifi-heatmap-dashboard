const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const parser = require("body-parser");
const { isAllowedLocation } = require("./allowedLocations");
const { openDatabase } = require("./handler");

require("dotenv").config();

const PUBLIC_USER_FIELDS = ["location", "rating"];

function timingSafeEqualString(provided, expected) {
  if (typeof provided !== "string" || typeof expected !== "string" || !expected) {
    return false;
  }
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function isAdmin(req) {
  return timingSafeEqualString(req.get("x-admin-secret"), process.env.ADMIN_SECRET);
}

function validateSubmission(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Invalid body";
  }

  const keys = Object.keys(body);
  const extra = keys.filter((key) => !PUBLIC_USER_FIELDS.includes(key) && key !== "website");
  if (extra.length > 0) {
    return "Unexpected fields";
  }

  // Honeypot for bots: real clients never send this field.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return "Rejected";
  }

  if (!isAllowedLocation(body.location)) {
    return "Invalid location";
  }

  if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) {
    return "Rating must be an integer from 1 to 5";
  }

  return null;
}

function createApp(db, options = {}) {
  const frontendOrigin = options.frontendOrigin || process.env.FRONTEND_ORIGIN || "http://localhost:3000";
  const rateLimitMax = options.rateLimitMax ?? Number(process.env.RATE_LIMIT_MAX || 30);
  const forceHttps = options.forceHttps ?? process.env.NODE_ENV === "production";

  const app = express();
  app.disable("x-powered-by");

  if (forceHttps) {
    app.set("trust proxy", 1);
  }

  app.use(
    helmet({
      frameguard: { action: "deny" },
      referrerPolicy: { policy: "no-referrer" },
      hsts: forceHttps ? { maxAge: 15552000, includeSubDomains: true } : false,
    })
  );

  app.use((req, res, next) => {
    if (!forceHttps) return next();
    if (req.secure || req.headers["x-forwarded-proto"] === "https") return next();
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  });

  app.use(
    cors({
      origin: frontendOrigin,
      methods: ["GET", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "X-Admin-Secret"],
    })
  );

  app.use(parser.urlencoded({ extended: false, limit: "16kb" }));
  app.use(parser.json({ limit: "16kb" }));

  const submitLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many submissions, try again later" },
  });

  app.get("/get-users", async (request, response) => {
    try {
      if (isAdmin(request)) {
        const results = await db.getAdminUsers();
        return response.status(200).json({ results });
      }
      const results = await db.getPublicUsers();
      return response.status(200).json({ results });
    } catch (err) {
      return response.status(500).json({ error: "Unable to load submissions" });
    }
  });

  app.post("/add-user", submitLimiter, async (request, response) => {
    const contentType = request.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return response.status(415).json({ error: "Content-Type must be application/json" });
    }

    const error = validateSubmission(request.body);
    if (error) {
      return response.status(400).json({ error });
    }

    try {
      const results = await db.addUser({
        location: request.body.location,
        rating: request.body.rating,
      });
      return response.status(201).json({ results });
    } catch (err) {
      return response.status(500).json({ error: "Unable to save submission" });
    }
  });

  app.delete("/delete-user", async (request, response) => {
    if (!isAdmin(request)) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    const id = Number.parseInt(request.query.id, 10);
    if (!Number.isInteger(id) || id < 1) {
      return response.status(400).json({ error: "Invalid id" });
    }

    try {
      await db.deleteUser(id);
      return response.status(200).json({ success: true });
    } catch (err) {
      return response.status(500).json({ error: "Unable to delete submission" });
    }
  });

  return app;
}

if (require.main === module) {
  openDatabase(process.env.SQLITE_PATH || "./heatmap_data.db")
    .then((db) => {
      const port = process.env.PORT || 2024;
      createApp(db).listen(port, () => {
        console.log(`server running on port ${port}`);
      });
    })
    .catch((err) => {
      console.error("Failed to start server", err);
      process.exit(1);
    });
}

module.exports = {
  createApp,
  validateSubmission,
  timingSafeEqualString,
};
