import React from "react";
import './App.css';
import Mapper from'./Components/Map/Map';
import Search from './Components/form/form';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Button, FormControl } from "@mui/material";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h3>Welcome to the WiFi Heatmap Display Project!</h3>

        <Mapper />
        <Search />
      </header>
    </div>

    
  );
}

export default App;
