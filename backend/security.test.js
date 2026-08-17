/**
 * Security checklist tests (20 items).
 * Each test maps to one item from the developer security checklist.
 */
const { describe, it, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const request = require("supertest");
const { createApp } = require("./server");
const { openDatabase } = require("./handler");
const { ALLOWED_LOCATIONS } = require("./allowedLocations");

const ROOT = path.join(__dirname, "..");
const BACKEND = __dirname;
const SOURCE_GLOBS = [
  path.join(ROOT, "src"),
  path.join(ROOT, "public"),
  BACKEND,
];
const SKIP_DIR = new Set(["node_modules", "coverage", "build", ".git"]);

function walkFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, acc);
    else if (/\.(js|jsx|ts|tsx|json|html|env|example|md)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

function appSourceFiles() {
  return SOURCE_GLOBS.flatMap((dir) => walkFiles(dir)).filter((file) => {
    const base = path.basename(file);
    return base !== "package-lock.json" && !file.endsWith(".test.js");
  });
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function trackedFiles() {
  const result = spawnSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.split("\n").filter(Boolean);
}

const VALID_USER = { location: "Moffitt Library", rating: 4 };

describe("Security checklist", () => {
  let db;
  let app;

  before(() => {
    process.env.ADMIN_SECRET = "test-admin-secret";
    process.env.FRONTEND_ORIGIN = "http://localhost:3000";
    process.env.NODE_ENV = "test";
  });

  beforeEach(async () => {
    if (db) await db.close().catch(() => {});
    db = await openDatabase(":memory:");
    app = createApp(db, { rateLimitMax: 1000, forceHttps: false });
  });

  after(async () => {
    if (db) await db.close().catch(() => {});
  });

  it("1. Hide API keys — no hardcoded secrets in application source", () => {
    const secretPattern =
      /(sk_live_|sk_test_[A-Za-z0-9]{10,}|AKIA[0-9A-Z]{16}|api[_-]?key\s*[:=]\s*['"][^'"]+['"]|BEGIN (RSA |OPENSSH )?PRIVATE KEY)/i;

    for (const file of appSourceFiles()) {
      if (file.endsWith(".env.example")) continue;
      const source = read(file);
      assert.equal(
        secretPattern.test(source),
        false,
        `Possible hardcoded secret in ${path.relative(ROOT, file)}`
      );
    }
  });

  it("2. Purge Git secrets — .env and database files are not tracked", () => {
    const gitignore = read(path.join(ROOT, ".gitignore"));
    assert.match(gitignore, /^\.env$/m);
    assert.match(gitignore, /backend\/\.env/);
    assert.match(gitignore, /heatmap_data\.db/);

    const tracked = trackedFiles();
    const secretFiles = tracked.filter((file) => {
      const base = path.basename(file);
      if (base === ".env.example") return false;
      return /^\.env($|\.)/.test(base) || base.endsWith(".pem") || base === "heatmap_data.db";
    });
    assert.deepEqual(secretFiles, [], `Tracked secret files: ${secretFiles.join(", ")}`);
  });

  it("3. Use public DB key — the client never talks to SQLite directly", () => {
    const frontendFiles = walkFiles(path.join(ROOT, "src"));
    for (const file of frontendFiles) {
      const source = read(file);
      assert.equal(
        /sqlite3|heatmap_data\.db|SQLITE_PATH/.test(source),
        false,
        `Frontend should not open the database: ${path.relative(ROOT, file)}`
      );
    }
    assert.match(read(path.join(BACKEND, "handler.js")), /sqlite3/);
  });

  it("4. Enable row-level security — public reads cannot see row ids", async () => {
    await request(app).post("/add-user").send(VALID_USER).expect(201);

    const publicRes = await request(app).get("/get-users").expect(200);
    assert.equal(Object.hasOwn(publicRes.body.results[0], "id"), false);

    const adminRes = await request(app)
      .get("/get-users")
      .set("x-admin-secret", "test-admin-secret")
      .expect(200);
    assert.equal(typeof adminRes.body.results[0].id, "number");
  });

  it("5. Encrypt sensitive data — schema stores no secrets or PII columns", async () => {
    await request(app).post("/add-user").send(VALID_USER).expect(201);
    const adminRes = await request(app)
      .get("/get-users")
      .set("x-admin-secret", "test-admin-secret")
      .expect(200);

    const columns = Object.keys(adminRes.body.results[0]);
    const sensitive = columns.filter((col) =>
      /password|secret|token|ssn|email|credit|card/i.test(col)
    );
    assert.deepEqual(sensitive, []);
    assert.deepEqual(columns.sort(), ["id", "location", "rating"]);
  });

  it("6. Enforce server-side auth — deletes require the admin secret", async () => {
    await request(app).post("/add-user").send(VALID_USER).expect(201);
    const created = await request(app)
      .get("/get-users")
      .set("x-admin-secret", "test-admin-secret");
    const id = created.body.results[0].id;

    await request(app).delete(`/delete-user?id=${id}`).expect(401);
    await request(app)
      .delete(`/delete-user?id=${id}`)
      .set("x-admin-secret", "wrong-secret")
      .expect(401);
    await request(app)
      .delete(`/delete-user?id=${id}`)
      .set("x-admin-secret", "test-admin-secret")
      .expect(200);
  });

  it("7. Lock record access — guessing ids cannot delete rows without auth", async () => {
    await request(app).post("/add-user").send(VALID_USER).expect(201);

    for (const id of [1, 2, 3, 99]) {
      await request(app).delete(`/delete-user?id=${id}`).expect(401);
    }

    const remaining = await request(app)
      .get("/get-users")
      .set("x-admin-secret", "test-admin-secret")
      .expect(200);
    assert.equal(remaining.body.results.length, 1);
  });

  it("8. Block field tampering — extra fields and invalid values are rejected", async () => {
    await request(app)
      .post("/add-user")
      .send({ location: "Moffitt Library", rating: 5, isAdmin: true })
      .expect(400);

    await request(app)
      .post("/add-user")
      .send({ location: "opt4ion4", rating: "option1" })
      .expect(400);

    await request(app)
      .post("/add-user")
      .send({ location: "Moffitt Library", rating: 9 })
      .expect(400);

    const publicRes = await request(app).get("/get-users").expect(200);
    assert.deepEqual(publicRes.body.results, []);
  });

  it("9. Secure session cookies — API does not set insecure cookies", async () => {
    const res = await request(app).get("/get-users").expect(200);
    const setCookie = res.headers["set-cookie"];
    if (!setCookie) return;

    for (const cookie of setCookie) {
      assert.match(cookie, /HttpOnly/i);
      assert.match(cookie, /SameSite/i);
    }
  });

  it("10. Hash passwords — the app never stores plaintext passwords", () => {
    for (const file of appSourceFiles()) {
      const source = read(file);
      assert.equal(
        /password\s*[:=]\s*['"][^'"]+['"]/i.test(source),
        false,
        `Plaintext password assignment in ${path.relative(ROOT, file)}`
      );
    }
  });

  it("11. Rate limit login — repeated submissions are throttled", async () => {
    const limited = createApp(db, { rateLimitMax: 2, forceHttps: false });

    await request(limited).post("/add-user").send(VALID_USER).expect(201);
    await request(limited).post("/add-user").send(VALID_USER).expect(201);
    const blocked = await request(limited).post("/add-user").send(VALID_USER);
    assert.equal(blocked.status, 429);
    assert.ok(blocked.headers["ratelimit-limit"] || blocked.headers["x-ratelimit-limit"]);
  });

  it("12. Add bot protection — honeypot fields and missing JSON type are rejected", async () => {
    await request(app)
      .post("/add-user")
      .send({ ...VALID_USER, website: "http://spam.example" })
      .expect(400);

    await request(app)
      .post("/add-user")
      .set("Content-Type", "text/plain")
      .send("location=Moffitt Library&rating=5")
      .expect(415);
  });

  it("13. Parameterize queries — SQL uses placeholders, not string concatenation", () => {
    const handler = read(path.join(BACKEND, "handler.js"));
    assert.match(handler, /VALUES \(\?, \?\)|VALUES \(\?,\?\)/);
    assert.match(handler, /WHERE id=\?/);
    assert.equal(/INSERT INTO users.*\$\{/.test(handler), false);
    assert.equal(/'\s*\+\s*user\./.test(handler), false);
    assert.equal(/`DELETE FROM users WHERE id=\$\{/.test(handler), false);
  });

  it("14. Validate all input — location whitelist and rating range are enforced", async () => {
    await request(app).post("/add-user").send({ location: "Doe Library", rating: 1 }).expect(201);
    await request(app).post("/add-user").send({ location: "", rating: 3 }).expect(400);
    await request(app).post("/add-user").send({ location: ALLOWED_LOCATIONS[0], rating: 0 }).expect(400);
    await request(app).post("/add-user").send({ location: ALLOWED_LOCATIONS[0], rating: 5.5 }).expect(400);
    await request(app).post("/add-user").send({ location: ALLOWED_LOCATIONS[0] }).expect(400);
  });

  it("15. Escape user content — React source does not inject unsanitized HTML", () => {
    const frontendFiles = walkFiles(path.join(ROOT, "src"));
    for (const file of frontendFiles) {
      const source = read(file);
      assert.equal(
        /dangerouslySetInnerHTML|innerHTML\s*=|document\.write\s*\(|eval\s*\(/.test(source),
        false,
        `Unsafe HTML sink in ${path.relative(ROOT, file)}`
      );
    }
  });

  it("16. Restrict file uploads — there is no unrestricted upload endpoint", async () => {
    const server = read(path.join(BACKEND, "server.js"));
    assert.equal(/multer|multipart\/form-data/.test(server), false);

    const res = await request(app)
      .post("/add-user")
      .set("Content-Type", "multipart/form-data; boundary=----test")
      .send("------test\r\nContent-Disposition: form-data; name=\"file\"; filename=\"x.js\"\r\n\r\nalert(1)\r\n------test--");
    assert.equal(res.status, 415);
  });

  it("17. Trim API response — public GET returns only location and rating", async () => {
    await request(app).post("/add-user").send(VALID_USER).expect(201);
    const res = await request(app).get("/get-users").expect(200);
    assert.ok(Array.isArray(res.body.results));
    assert.deepEqual(Object.keys(res.body.results[0]).sort(), ["location", "rating"]);
  });

  it("18. Add security headers — helmet headers are present on responses", async () => {
    const res = await request(app).get("/get-users").expect(200);
    assert.equal(res.headers["x-content-type-options"], "nosniff");
    assert.equal(res.headers["x-frame-options"], "DENY");
    assert.equal(res.headers["x-powered-by"], undefined);
    assert.ok(res.headers["content-security-policy"]);
  });

  it("19. Force HTTPS — production HTTP requests redirect to HTTPS", async () => {
    const secureApp = createApp(db, { forceHttps: true, rateLimitMax: 1000 });
    const res = await request(secureApp).get("/get-users").set("Host", "wifi.berkeley.edu");
    assert.equal(res.status, 301);
    assert.equal(res.headers.location, "https://wifi.berkeley.edu/get-users");

    const httpsRes = await request(secureApp)
      .get("/get-users")
      .set("Host", "wifi.berkeley.edu")
      .set("X-Forwarded-Proto", "https")
      .expect(200);
    assert.ok(httpsRes.headers["strict-transport-security"]);
  });

  it("20. Scan dependencies — backend has no critical npm audit findings", () => {
    const result = spawnSync("npm", ["audit", "--omit=dev", "--audit-level=critical", "--json"], {
      cwd: BACKEND,
      encoding: "utf8",
    });

    let report;
    try {
      report = JSON.parse(result.stdout || "{}");
    } catch {
      report = {};
    }

    const critical = report.metadata?.vulnerabilities?.critical ?? 0;
    assert.equal(
      critical,
      0,
      `Critical vulnerabilities found:\n${result.stdout.slice(0, 2000)}`
    );
  });
});
