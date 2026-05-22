# UC Berkeley WiFi Monitor

Full-stack dashboard for reporting and visualizing WiFi signal quality across campus. Users submit location and rating data; the app aggregates scores per location and displays them on an interactive map.

Built for **PlexTech** · React · Express · SQLite

---

## Features

- **User submissions** — location dropdown + signal strength rating
- **REST API backend** — store, retrieve, and delete submissions
- **Aggregated scores** — average WiFi rating computed per campus location
- **Interactive map** — Leaflet map with markers and popups (OpenStreetMap tiles)
- **Material UI** — form controls and layout

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 18, Material UI, React-Leaflet |
| Backend | Node.js, Express, SQLite3 |
| API | `POST /add-user`, `GET /get-users`, `DELETE /delete-user` |

---

## Quick start (localhost)

You need **two terminals**.

### Terminal 1 — Backend (port 2024)

```bash
cd backend
cp .env.example .env   # first time only
npm install
npm start
```

### Terminal 2 — Frontend (port 3000)

```bash
npm install
npm start
```

Open **http://localhost:3000**

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:2024 |

### Verify the API

```bash
curl http://localhost:2024/get-users
```

---

## Project structure

```
├── src/
│   ├── App.js
│   └── Components/
│       ├── form/          # submission form + averages list
│       └── Map/           # Leaflet campus map
├── backend/
│   ├── server.js          # Express API
│   ├── handler.js         # SQLite queries
│   └── heatmap_data.db    # local database
└── package.json
```

---

## API reference

See [backend/README.md](backend/README.md) for endpoint details and payload formats.

---

## Curriculum notes

Original lab instructions and requirements are in [CURRICULUM.md](CURRICULUM.md).
