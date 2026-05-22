import React, { useState, useCallback } from "react";
import "./App.css";
import Mapper from "./Components/Map/Map";
import Search from "./Components/form/form";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleDataChange = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h3>Welcome to the WiFi Heatmap Display Project!</h3>

        <div className="map-wrapper">
          <Mapper refreshKey={refreshKey} />
        </div>

        <Search onDataChange={handleDataChange} />
      </header>
    </div>
  );
}

export default App;
