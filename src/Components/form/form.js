import React, { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem, Button, Typography } from "@mui/material";

function Form() {
  const [value, setValue] = useState('');
  const [value2, setValue2] = useState('');
  const [averages, setAverages] = useState({});

  const fetchAverages = () => {
    fetch("http://localhost:2024/get-users")
      .then((res) => res.json())
      .then((data) => {
        const grouped = {};
        data.results.forEach((row) => {
          if (!grouped[row.location]) grouped[row.location] = [];
          grouped[row.location].push(Number(row.rating));
        });
        const calculated = {};
        Object.keys(grouped).forEach((loc) => {
          const ratings = grouped[loc];
          calculated[loc] = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
        });
        setAverages(calculated);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchAverages();
  }, []);

  const handleSubmit = async () => {
    fetch("http://localhost:2024/add-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location: value, rating: value2 }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        fetchAverages();
      })
      .catch((err) => console.error(err));
  };

  return (
    <div style={{ color: 'black', backgroundColor: 'white', padding: '20px', display: 'flex', flexDirection: 'row', gap: '40px' }}>
      <div>
        <p>Where are you located?</p>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Label</InputLabel>
          <Select value={value} onChange={(e) => setValue(e.target.value)}>
            <MenuItem value="East Asian Library">East Asian Library</MenuItem>
            <MenuItem value="Music Library">Music Library</MenuItem>
            <MenuItem value="Doe Library">Doe Library</MenuItem>
            <MenuItem value="Grimes Hall">Grimes Hall</MenuItem>
          </Select>
        </FormControl>
        <Button variant="text" onClick={() => setValue('')}>RESET LOCATION</Button>
      </div>

      <div>
        <p>How is the campus WIFI at your current location?</p>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Label</InputLabel>
          <Select value={value2} onChange={(e) => setValue2(e.target.value)}>
            <MenuItem value="1">1</MenuItem>
            <MenuItem value="2">2</MenuItem>
            <MenuItem value="3">3</MenuItem>
            <MenuItem value="4">4</MenuItem>
            <MenuItem value="5">5</MenuItem>
          </Select>
        </FormControl>
        <Button variant="text" onClick={() => handleSubmit()}>SUBMIT FEEDBACK</Button>
        <Button variant="text" onClick={() => setValue2("")}>CLEAR RESPONSE</Button>
      </div>
    </div>
  );
}

export default Form;