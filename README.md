# UC Berkeley WiFi Monitor

Full-stack dashboard for reporting and visualizing WiFi signal quality across campus. Users submit a location and rating; the app averages scores per site and shows them on an interactive map.

**Live app:** [berkeley-campus-wifi-heatmap-dashboard-git-main-justin-aa14.vercel.app](https://berkeley-campus-wifi-heatmap-dashboard-git-main-justin-aa14.vercel.app/)

Built for **PlexTech** · React · Express · PostgreSQL

---

## Deployed on

| Layer | Host |
|-------|------|
| Frontend | [Vercel](https://berkeley-campus-wifi-heatmap-dashboard-git-main-justin-aa14.vercel.app/) |
| Backend API | Render |
| Database | Neon (PostgreSQL) |

The frontend reads the API URL from `REACT_APP_API_URL` at build time. Secrets such as `DATABASE_URL` stay in the host dashboard, not in this repo.

---

## Features

- **User submissions** — location dropdown + signal strength rating
- **REST API** — store, retrieve, and delete submissions
- **Aggregated scores** — average WiFi rating per campus location
- **Interactive map** — Leaflet markers and popups (OpenStreetMap tiles)
- **Material UI** — form controls and layout

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 18, Material UI, React-Leaflet |
| Backend | Node.js, Express, PostgreSQL (`pg`) |
| API | `POST /add-user`, `GET /get-users`, `DELETE /delete-user` |

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
│   └── handler.js         # PostgreSQL queries
└── package.json
```

---

## API reference

See [backend/README.md](backend/README.md) for endpoint details and payload formats.

---

## Curriculum notes

Original lab instructions and requirements are in [CURRICULUM.md](CURRICULUM.md).
