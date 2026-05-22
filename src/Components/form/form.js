import React, { useState, useEffect, useCallback } from "react";
import { FormControl, InputLabel, Select, MenuItem, Button, Typography } from "@mui/material";
import { API_URL, fetchAverages } from "../../utils/averages";

function Form({ onDataChange }) {
  const [value, setValue] = useState("");
  const [value2, setValue2] = useState("");
  const [averages, setAverages] = useState({});
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const loadAverages = useCallback(() => {
    fetchAverages()
      .then((calculated) => {
        setAverages(calculated);
        setError("");
      })
      .catch(() => {
        setError("Cannot reach backend. Run npm start in the backend folder (port 2024).");
      });
  }, []);

  useEffect(() => {
    loadAverages();
  }, [loadAverages]);

  const handleSubmit = () => {
    if (!value || !value2) {
      setStatus("");
      setError("Select a location and a rating (1–5) before submitting.");
      return;
    }

    setError("");
    setStatus("Submitting...");

    fetch(`${API_URL}/add-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location: value, rating: Number(value2) }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Submit failed");
        return res.json();
      })
      .then(() => {
        setStatus("Submitted! Averages updated below.");
        setValue2("");
        loadAverages();
        onDataChange?.();
      })
      .catch(() => {
        setStatus("");
        setError("Submit failed. Is the backend running on port 2024?");
      });
  };

  return (
    <div
      style={{
        color: "black",
        backgroundColor: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", flexDirection: "row", gap: "40px", flexWrap: "wrap" }}>
        <div>
          <p>Where are you located?</p>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="location-label">Location</InputLabel>
            <Select
              labelId="location-label"
              label="Location"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            >
              <MenuItem value="East Asian Library">East Asian Library</MenuItem>
              <MenuItem value="Music Library">Music Library</MenuItem>
              <MenuItem value="Doe Library">Doe Library</MenuItem>
              <MenuItem value="Grimes Hall">Grimes Hall</MenuItem>
            </Select>
          </FormControl>
          <Button variant="text" onClick={() => setValue("")}>
            RESET LOCATION
          </Button>
        </div>

        <div>
          <p>How is the campus WIFI at your current location?</p>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="rating-label">Rating</InputLabel>
            <Select
              labelId="rating-label"
              label="Rating"
              value={value2}
              onChange={(e) => setValue2(e.target.value)}
            >
              <MenuItem value="1">1</MenuItem>
              <MenuItem value="2">2</MenuItem>
              <MenuItem value="3">3</MenuItem>
              <MenuItem value="4">4</MenuItem>
              <MenuItem value="5">5</MenuItem>
            </Select>
          </FormControl>
          <Button variant="text" onClick={handleSubmit}>
            SUBMIT FEEDBACK
          </Button>
          <Button variant="text" onClick={() => setValue2("")}>
            CLEAR RESPONSE
          </Button>
        </div>
      </div>

      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      {status && (
        <Typography color="primary" variant="body2">
          {status}
        </Typography>
      )}

      <div>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Average WiFi rating by location
        </Typography>
        {Object.keys(averages).length === 0 ? (
          <Typography variant="body2">No ratings yet — submit feedback above.</Typography>
        ) : (
          Object.entries(averages)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([location, avg]) => (
              <Typography key={location} variant="body1">
                {location}: <strong>{avg}</strong> / 5
              </Typography>
            ))
        )}
      </div>
    </div>
  );
}

export default Form;
